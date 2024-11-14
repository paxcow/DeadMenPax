<?php

namespace BGA\Games\DeadMenPax;

/**
 * Class DBManager
 * Manages interactions with the database for a specified table and class type.
 */
class DBManager
{
    protected string $baseTable;
    protected string $baseClass;
    protected object $db;

    /**
     * Constructs a new DBManager instance.
     *
     * @param string $baseTable The name of the database table.
     * @param string $baseClass The class type of objects associated with the database table.
     */
    public function __construct(string $baseTable, string $baseClass)
    {
        $this->baseTable = $baseTable;
        $this->baseClass = $baseClass;
        $this->db = new class extends \Table
        {
            /**
             * Executes a query on the database.
             *
             * @param string $sql SQL query string.
             * @return null|mysqli_result|bool The result of the query execution.
             */
            public function doQuery(string $sql): null|\mysqli_result|bool
            {
                return $this->DbQuery($sql);
            }

            /**
             * Executes a select query and returns a list of objects.
             *
             * @param string $sql SQL select query string.
             * @return array<int, array<string, mixed>> The list of associative arrays representing rows.
             */
            public function doSelect(string $sql): array
            {
                return $this->getObjectListFromDB($sql);
            }

            /**
             * Executes a select query and returns a collection of key-value pairs.
             *
             * @param string $sql SQL select query string.
             * @return array<string, array<string, mixed>> The associative array collection with keys as primary keys.
             */
            public function doSelectByKey(string $sql): array
            {
                return $this->getCollectionFromDB($sql);
            }

            /**
             * Gets the last inserted ID in the database.
             *
             * @return int The last inserted ID.
             */
            public function lastId(): int
            {
                return $this->DbGetLastId();
            }
        };
    }


    /**
     * Gets the base table name.
     *
     * @return string The base table name.
     */
    public function getBaseTable(): string
    {
        return $this->baseTable;
    }

    /**
     * Gets the base class name.
     *
     * @return string The base class name.
     */
    public function getBaseClass(): string
    {
        return $this->baseClass;
    }
    /**
     * Retrieves the primary key field name from the base class's annotations.
     *
     * @return string|null The primary key field name or null if none found.
     * @throws \BgaSystemException if multiple dbKey attributes are found.
     */
    private function getPrimaryKey(): ?string
    {
        $reflectionClass = new \ReflectionClass($this->baseClass);
        $primaryKey = null;

        foreach ($reflectionClass->getProperties() as $property) {
            if (!empty($property->getAttributes(dbKey::class))) {
                if ($primaryKey !== null) {
                    throw new \BgaSystemException("Multiple primary keys found in class {$this->baseClass}.");
                }
                $keyAttribute = $property->getAttributes(dbKey::class)[0]->newInstance();
                $primaryKey = $keyAttribute->name;
            }
        }
        return $primaryKey;
    }

    /**
     * Checks if a row with a specified primary key value exists in the table.
     *
     * @param string $primaryKey The primary key field.
     * @param string|int $primaryValue The value of the primary key to search for.
     * @return bool True if a row exists, false otherwise.
     */
    private function checkIfExists(string $primaryKey, string|int $primaryValue): bool
    {
        $sql = "SELECT COUNT(*) AS count FROM {$this->baseTable} WHERE $primaryKey = '{$primaryValue}'";
        $row = $this->db->doSelect($sql);
        return $row[0]['count'] > 0;
    }

    /**
     * Retrieves all rows from the database table.
     *
     * @return array<int, array<string, mixed>> A list of all rows as associative arrays.
     */
    public function getAllRows(): array
    {
        $sql = "SELECT * FROM $this->baseTable";
        return $this->db->doSelect($sql);
    }

    /**
     * Retrieves all rows from the database table, indexed by the primary key.
     *
     * @return array<string, array<string, mixed>> An associative array of rows, indexed by primary key.
     */
    public function getAllRowsByKeys(): array
    {
        $sql = "SELECT * FROM $this->baseTable";
        return $this->db->doSelectByKey($sql);
    }

    /**
     * Retrieves a single row by the primary key value.
     *
     * @param string|int $key_value The primary key value.
     * @return array<string, mixed>|null The row data as an associative array or null if not found.
     */
    public function getRow(string|int $key_value): ?array
    {
        $key = $this->getPrimaryKey();
        $sql = "SELECT * FROM $this->baseTable WHERE $key = '{$key_value}'";
        return $this->db->doSelectByKey($sql)[0] ?? null;
    }

    /**
     * Retrieves the last inserted row from the database.
     *
     * @return array<string, mixed>|null The last row as an associative array or null if not found.
     */
    public function getLastRow(): ?array
    {
        return $this->getRow($this->db->lastId());
    }

    /**
     * Creates and hydrates an object from the database based on the primary key value.
     *
     * @param string|int $key_value The primary key value.
     * @return object|null An instance of the base class with data from the database or null if not found.
     * @throws \BgaSystemException if the primary key is not defined.
     */
    public function createObjectFromDB(string|int $key_value): ?object
    {
        $primaryKey = $this->getPrimaryKey();
        if (!$primaryKey) {
            throw new \BgaSystemException("Primary key not defined in class annotations.");
        }

        $sql = "SELECT * FROM {$this->baseTable} WHERE $primaryKey = '{$key_value}'";
        $result = $this->db->doSelect($sql);
        return $result ? $this->hydrate($result[0]) : null;
    }

    /**
     * Retrieves all rows as objects of the base class.
     *
     * @return array<string, object> An associative array of objects indexed by primary key.
     */
    public function getAllObjects(): array
    {
        $primaryKey = $this->getPrimaryKey();
        $objects = [];
        $rows = $this->getAllRows();
        foreach ($rows as $row) {
            $objects[$row[$primaryKey]] = $this->hydrate($row);
        }
        return $objects;
    }

    /**
     * Creates an object of the base class and populates it with the provided data.
     *
     * @param array<string, mixed> $data An associative array of database row data.
     * @return object An instance of the base class with data hydrated.
     */
    private function hydrate(array $data): object
    {
        $reflectionClass = new \ReflectionClass($this->baseClass);
        $object = $reflectionClass->newInstanceWithoutConstructor();

        foreach ($reflectionClass->getProperties() as $property) {
            $columnAttributes = $property->getAttributes(dbColumn::class);
            $columnKeys = $property->getAttributes(dbKey::class);

            if (!empty($columnKeys)) {
                $column = $columnKeys[0];
            } elseif (!empty($columnAttributes)) {
                $column = $columnAttributes[0];
            } else {
                continue;
            }

            $attribute = $column->newInstance();
            $columnName = $attribute->name;
            if (array_key_exists($columnName, $data)) {
                $property->setAccessible(true);
                $property->setValue($object, $data[$columnName]);
            }
        }

        return $object;
    }

    /**
     * Saves or updates an object to the database.
     *
     * @param object $object An instance of the base class.
     * @return string|int|null The primary key of the saved object or null if the operation failed.
     * @throws \BgaSystemException if primary key is not defined.
     */
    public function saveObjectToDB(object $object): string|int|null
    {
        $reflectionClass = new \ReflectionClass($this->baseClass);
        $properties = $reflectionClass->getProperties();
        $primaryKey = $this->getPrimaryKey();
        $primaryValue = null;
        $columns = [];
        $values = [];
        $insertMode = false;

        foreach ($properties as $property) {
            $column = $property->getAttributes(dbColumn::class)[0] ?? null;
            if ($column) {
                $columnName = $column->newInstance()->name;
                $property->setAccessible(true);
                $value = $property->getValue($object);
                $columns[$columnName] = addslashes((string) $value);

                if ($columnName === $primaryKey) {
                    $primaryValue = $columns[$columnName];
                } else {
                    $values[] = "$columnName = '{$columns[$columnName]}'";
                }
            }
        }

        if ($primaryValue && $this->checkIfExists($primaryKey, $primaryValue)) {
            $sql = "UPDATE {$this->baseTable} SET " . implode(', ', $values) . " WHERE $primaryKey = '{$primaryValue}'";
            $result = $this->db->doQuery($sql);
        } else {
            $insertMode = true;
            $sql = "INSERT INTO {$this->baseTable} (" . implode(', ', array_keys($columns)) . ") VALUES ('" . implode("', '", $columns) . "')";
            $result = $this->db->doQuery($sql);
            if ($result) {
                $primaryValue = $this->db->lastId();
            }
        }

        return $result ? ($insertMode ? $primaryValue : ($primaryKey ? $columns[$primaryKey] : null)) : null;
    }

    /**
     * Deletes an object from the database by primary key value.
     *
     * @param string $key_value The primary key value of the object to delete.
     */
    public function deleteObjectFromDb(string $key_value): void
    {
        $primaryKey = $this->getPrimaryKey();

        if ($key_value && $this->checkIfExists($primaryKey, $key_value)) {
            $sql = "DELETE FROM $this->baseTable WHERE $primaryKey = '{$key_value}'";
            $this->db->doQuery($sql);
        }
    }

    /**
     * Clears all rows from the database table.
     */
    public function clearAll(): void
    {
        $sql = "DELETE FROM $this->baseTable";
        $this->db->doQuery($sql);
    }
}

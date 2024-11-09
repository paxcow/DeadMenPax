<?php

namespace BGA\Games\DeadMenPax;

class DBManager
{
    protected string $baseTable;
    protected string $baseClass;
    protected $db;

    public function __construct(string $baseTable, string $baseClass)
    {
        $this->baseTable = $baseTable;
        $this->baseClass = $baseClass;
        $this->db = new class extends \Table
        {


            public function doQuery(string $sql)
            {
                return $this->DbQuery($sql);
            }

            public function doSelect(string $sql)
            {
                return $this->getObjectListFromDB($sql);
            }

            public function doSelectByKey(string $sql)
            {
                return $this->getCollectionFromDB($sql);
            }

            public function lastId()
            {
                return $this->DbGetLastId();
            }
        };
    }

    private function getPrimaryKey(): ?string
    {
        $reflectionClass = new \ReflectionClass($this->baseClass);
        foreach ($reflectionClass->getProperties() as $property) {
            if (!empty($property->getAttributes(dbKey::class))) {
                $keyAttribute = $property->getAttributes(dbKey::class)[0]->newInstance();
                return $keyAttribute->name;
            }
        }
        return null;
    }


    private function checkIfExists($primaryKey, $primaryValue): bool
    {
        $sql = "SELECT COUNT(*) AS count FROM {$this->baseTable} WHERE $primaryKey = '{$primaryValue}'";
        $row = $this->db->doSelect($sql);
        return $row[0]['count'] > 0;
    }

    public function getAllRows()
    {
        $sql = "SELECT * FROM $this->baseTable";
        return $this->db->doSelect($sql);
    }

    public function getAllRowsByKeys()
    {
        $sql = "SELECT * FROM $this->baseTable";
        return $this->db->doSelectByKey($sql);
    }

    public function getRow($key_value)
    {
        $key = $this->getPrimaryKey();
        $sql = "SELECT * FROM $this->baseTable WHERE $key = '{$key_value}'";
        return $this->db->doSelectByKey($sql)[0];
    }

    public function getLastRow()
    {
        return $this->getRow($this->db->lastId());
    }

    public function createObjectFromDB($key_value): ?object
    {
        $primaryKey = $this->getPrimaryKey();
        if (!$primaryKey) {
            throw new \BgaSystemException("Primary key not defined in class annotations.");
        }

        $sql = "SELECT * FROM {$this->baseTable} WHERE $primaryKey = '{$key_value}'";
        $result = $this->db->doSelect($sql);
        if ($result) {
            return $this->hydrate($result);
        }
        return null;
    }


    public function getAllObjects(): array
    {
        $primaryKey = $this->getPrimaryKey();
        $objects = [];
        $rows = $this->getAllRows();
        foreach ($rows  as $row) {
            $objects[$row[$primaryKey]] = $this->hydrate($row);
        }
        return $objects;
    }
    private function hydrate(array $data): object
    {
        $reflectionClass = new \ReflectionClass($this->baseClass);
        $object = $reflectionClass->newInstanceWithoutConstructor();

        foreach ($reflectionClass->getProperties() as $property) {
            $columnAttributes = $property->getAttributes(dbColumn::class);
            $columnKeys = $property->getAttributes(dbKey::class);

            if (!empty($columnKeys)) {
                $column = $columnKeys[0];
            } else if (!empty($columnAttributes)) {
                $column = $columnAttributes[0];
            }

            if ($column !== null) {
                $attribute = $column->newInstance();
                $columnName = $attribute->name;
                if (array_key_exists($columnName, $data)) {
                    $property->setAccessible(true);
                    $property->setValue($object, $data[$columnName]);
                }
            }
        }

        return $object;
    }

    public function saveObjectToDB($object)
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
                $columns[$columnName] = addslashes($value);

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
                $primaryValue = $this->db->lastId();  // Assuming lastId() fetches the last inserted ID from the database
            }
        }

        if ($result) {
            return $insertMode ? $primaryValue : ($primaryKey ? $columns[$primaryKey] : null);
        } else {
            return null;
        }
    }


    public function deleteObjectFromDb(string $key_value)
    {
        $primaryKey = $this->getPrimaryKey();

        if ($key_value && $this->checkIfExists($primaryKey, $key_value)) {
            $sql = "DELETE FROM $this->baseTable WHERE $primaryKey = '{$key_value}'";
            $this->db->doQuery($sql);
        }
    }

    public function clearAll()
    {
        $sql = "DELETE FROM $this->baseTable";
        $this->db->doQuery($sql);
    }
}
<?php

namespace Bga\Games\deadmenpax\DB;

class DBManagerRegister
{
    /**
     * @var array<int, DBManager> A registry of DBManager instances indexed by insertion order.
     */
    private static array $mgr = [];

    /**
     * Adds a new DBManager instance to the registry.
     *
     * @param string $table The name of the database table managed by this instance.
     * @param string $className The class name representing the objects in the database table.
     * @return DBManager The newly created and registered DBManager instance.
     */
    public static function addManager(string $table, string $className): DBManager
    {
        $newmgr = new DBManager($table, $className);
        self::$mgr[] = $newmgr;
        return $newmgr;
    }

    /**
     * Retrieves a DBManager instance by table name.
     *
     * @param string $table The table name associated with the desired DBManager.
     * @return DBManager|null The DBManager instance managing the specified table, or null if not found.
     */
    public static function getManagerByTable(string $table): ?DBManager
    {
        foreach (self::$mgr as $manager) {
            if ($manager->getBaseTable() === $table) {
                return $manager;
            }
        }
        return null;
    }

    /**
     * Retrieves a DBManager instance by class name.
     *
     * @param string $className The class name associated with the desired DBManager.
     * @return DBManager|null The DBManager instance managing the specified class, or null if not found.
     */
    public static function getManagerByClass(string $className): ?DBManager
    {
        foreach (self::$mgr as $manager) {
            if ($manager->getBaseClass() === $className) {
                return $manager;
            }
        }
        return null;
    }
}

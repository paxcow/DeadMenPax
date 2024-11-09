<?php

namespace BGA\Games\DeadMenPax;

class DBManagerRegister
{
    private static $mgr = [];

    public static function addManger(string $table, string $className)
    {
        $newmgr = new DBManager($table, $className);
        $mgr[] = $newmgr;
        return $newmgr;
    }

    public static function getManagerByTable(string $table)
    {
        foreach (self::$mgr as $manager) {
            if ($manager->baseTable == $table) return $manager;
        }
        return null;
    }
    public static function getManagerByClass(string $className)
    {
        foreach (self::$mgr as $manager) {
            if ($manager->baseClass == $className) return $manager;
        }
        return null;
    }
}

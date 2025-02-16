<?php
namespace Bga\Games\deadmenpax\Actions;

use Bga\Games\deadmenpax\DB\DBManagerRegister;

class ActionManager
{
    private static $db;

    public static function init()
    {
        self::$db = DBManagerRegister::addManager("actions", ActionRow::class);
    }

    public static function getAllActions($player_id = null): array
    {
        $actions = [];
        $rows = self::$db->getAllRows();
        foreach ($rows as $row) {
            $action = new ActionRow($row);
            $actions[$action->actionId] = $action->getAction();
        }
        if (!$player_id) return $actions;
        $pl_actions = array_filter($actions, function ($a) use ($player_id) {
            return $a->getPlayerId() == $player_id;
        });
        return $pl_actions;
    }

    public static function reloadAllActions($player_id = null, &$handlers)
    {
        $actions = self::getAllActions($player_id);
        foreach ($actions as $action) {
            $action->setHandlers($handlers);
            $action->reload();
        }
    }

    public static function committAllActions($player_id = null, &$handlers)
    {
        $actions = self::getAllActions($player_id);
        foreach ($actions as $action) {
            $notifier = new ActionNotifier($player_id);
            $action->setHandlers($handlers);
            $action->committ($notifier);
        }
    }

    public static function getActionByKey(string $key_value): ActionCommand|null
    {
        $actionRow = self::$db->createObjectFromDB($key_value);
        return $actionRow->getAction();
    }

    public static function getLastAction(string $player_id = null): ActionCommand|null
    {
        if (!$player_id) {
            $action = new ActionRow(self::$db->getLastRow());
            return $action->getAction() ?? null;
        } else {
            $actions = self::getAllActions($player_id);
            return $actions[array_key_last($actions)] ?? null;
        }
    }

    public static function saveAction(ActionCommand $action)
    {
        $row = new ActionRow($action);
        self::$db->saveObjectToDB($row);
    }

    public static function removeAction(string $action_id)
    {
        self::$db->deleteObjectFromDb($action_id);
    }

    public static function clearAll($player_id = null)
    {
        if ($player_id) {
            $actions = self::getAllActions($player_id);
            foreach ($actions as $id => $action) {
                self::$db->deleteObjectFromDb($id);
            }
        } else {
            self::$db->clearAll();
        }
    }

    public static function serializeAction(ActionCommand $action): string
    {
        $result = self::serializeObjectToArray($action);
        return json_encode($result);
    }

    public static function serializeObjectToArray($object, &$seenObject = [])
    {
        if (!is_object($object)) {
            return $object;
        }

        $objectId = spl_object_id($object);
        if (isset($seenObject[$objectId])) {
            return ["__recursive_red" => get_class($object)];
        }

        $reflectionClass = new \ReflectionClass($object);
        $properties = $reflectionClass->getProperties();
        $data = ['__class' => get_class($object)];

        $seenObject[$objectId] = true;

        foreach ($properties as $property) {
            $property->setAccessible(true);
            $value = $property->getValue($object);
            $data[$property->getName()] = self::serializeObjectToArray($value);
        }

        return $data;
    }

    public static function rebuildAction(string $actionEncoded): ActionCommand
    {
        if ($actionEncoded) {
            $data = json_decode($actionEncoded, true);
            return self::deserializeArrayToObject($data);
        }
    }

    public static function deserializeArrayToObject($array)
    {
        if (is_array($array) && isset($array['__class'])) {
            $class = $array['__class'];
            if (class_exists($class)) {
                $reflect = new \ReflectionClass($class);
                $object = $reflect->newInstanceWithoutConstructor();
                foreach ($array as $propName => $propValue) {
                    if ($propName !== '__class') {
                        $property = $reflect->getProperty($propName);
                        $property->setAccessible(true);
                        $property->setValue($object, self::deserializeArrayToObject($propValue));
                    }
                }
                return $object;
            }
        }
        return $array;
    }
}
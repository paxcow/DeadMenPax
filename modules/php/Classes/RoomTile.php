<?php

namespace BGA\Games\DeadMenPax;

class RoomTile {
    private $cardId;       // Unique ID for the tile (provided by Deck)
    private $name;         // Name or type of the room (e.g., "Room #1")
    private $fireLevel;    // Fire level of the room, starts at an initial value and can increase
    private $fireColor;    // Color of the fire ("yellow" or "red")
    private $orientation;  // Orientation of the tile (0, 90, 180, 270 degrees)

    // Door properties based on orientation (true if there's a door in that direction)
    private $doors = [];

    private $isExploded;    // Indicates if the tile has exploded
    private $isUnreachable; // Indicates if the tile is unreachable

    // Constructor
    public function __construct($cardId, $name, $fireLevel, $fireColor, $northDoor, $southDoor, $eastDoor, $westDoor, $orientation = 0) {
        $this->cardId = $cardId;
        $this->name = $name;
        $this->fireLevel = $fireLevel;
        $this->fireColor = $fireColor;
        $this->orientation =$orientation;
        $this->isExploded = false;
        $this->isUnreachable = false;

        $this->doors["north"] = $northDoor;
        $this->doors["east"] = $eastDoor;
        $this->doors["south"] = $southDoor;
        $this->doors["west"] = $westDoor;

        if ($orientation != 0) $this->rotatedDoors($orientation);
    }

    // Set the orientation and adjust doors accordingly
    private function rotatedDoors($orientation) {
        // Rotate doors according to the given orientation
        $shift = $orientation % 360;
        $keys = array_keys($this->doors);
        $values = array_values($this->doors);

        //rotate doors 
        $rotatedValues = array_slice($values, $shift) + array_slice($values, 0, $shift);
        
        //reassign keys to rotated doors
        $rotatedDoors = array_combine($keys,$rotatedValues);

        $this->doors = $rotatedDoors;

    }

    // Getters for doors, fire level, and color
    public function hasDoor(string $direction) {
        return  (bool) $this->doors[$direction] ?? false;
    }


    public function getFireLevel() {
        return $this->fireLevel;
    }

    public function getFireColor() {
        return $this->fireColor;
    }

    public function getOrientation() {
        return $this->orientation;
    }

    public function getId() {
        return $this->cardId;
    }

    // Setters for explosion and reachability
    public function setExploded($isExploded) {
        $this->isExploded = $isExploded;
    }

    public function setUnreachable($isUnreachable) {
        $this->isUnreachable = $isUnreachable;
    }

    public function isExploded() {
        return $this->isExploded;
    }

    public function isUnreachable() {
        return $this->isUnreachable;
    }

    // Increment the fire level by 1
    public function incrementFireLevel() {
        $this->fireLevel++;
    }

        // Increment the fire level by 1
        public function setFireLevel($level = 0) {
            $this->fireLevel = $level;
        }

    // Unset all doors (used when the room explodes)
    public function unsetDoors() {
        array_walk($this->doors, fn($elem) => $elem = false);
    }
}

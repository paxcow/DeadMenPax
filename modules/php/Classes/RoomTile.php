<?php

namespace BGA\Games\DeadMenPax;

use BGA\Games\DeadMenPax\dbKey;
use BGA\Games\DeadMenPax\dbColumn;

/**
 * Class representing a tile in the room-based game. Each tile has dynamic attributes (e.g., position, fire level) 
 * and static attributes (e.g., fire color, doors). The tile can explode under certain conditions and can have its reachability and state updated.
 */
class Room
{
    #[dbKey("room_id")]
    private int $roomId; // Unique ID of the tile, assigned by the deck component
    #[dbColumn("pos_x")]
    private int $posX; // X-coordinate on the board
    #[dbColumn("pos_y")]
    private int $posY; // Y-coordinate on the board
    #[dbColumn("orientation")]
    private int $orientation; // Orientation of the tile in degrees (0, 90, 180, or 270)
    #[dbColumn("fire_level")]
    private int $fireLevel; // Current fire level of the room tile
    #[dbColumn("exploded")]
    private bool $exploded; // Indicates whether the tile has exploded
    #[dbColumn("keg_exploded")]
    private bool $kegExploded; // Indicates whether the keg has exploded
    #[dbColumn("unreachable")]
    private bool $unreachable; // Indicates whether the tile is unreachable

    private string $fireColor; // Color of the fire (either "yellow" or "red")
    private array $doors = []; // Array indicating presence of doors in each direction
    private string $kegDoor; // Direction of the exploding keg
    private int $kegThreshold; // Fire level threshold at which the keg explodes

    /**
     * RoomTile constructor. Initializes the tile with dynamic attributes from the database and static attributes from predefined data.
     *
     * @param array $roomRow Dynamic attributes for the tile from the database.
     * @param array $roomData Static data for the tile, defining its properties.
     */
    public function __construct(array $roomRow, array $roomData)
    {
        // Dynamic attributes from DB or defaults
        $this->roomId = $roomRow["roomId"];
        $this->fireLevel = $roomRow["fireLevel"] ?? $roomData["startFireLevel"];
        $this->orientation = $roomRow["orientation"];
        $this->exploded = $roomRow["exploded"] ?? false;
        $this->unreachable = $roomRow["unreachable"] ?? false;
        $this->kegExploded = $roomRow["kegExploded"] ?? false;
        $this->posX = $roomRow["posX"];
        $this->posY = $roomRow["posY"];

        // Static attributes from predefined data
        $tileData = $roomData[$this->roomId];
        $this->fireColor = $tileData["fireColor"];
        $this->doors = $tileData["doors"];
        $this->kegDoor = $tileData["kegDoor"];
        $this->kegThreshold = $tileData["kegThreshold"];

        if ($this->orientation !== 0) {
            $this->rotateDoors($this->orientation);
        }
    }

    /**
     * Rotates the doors and keg direction based on the tile's orientation.
     *
     * @param int $orientation The orientation in degrees (must be 0, 90, 180, or 270).
     */
    private function rotateDoors(int $orientation): void
    {
        $rotations = ($orientation / 90) % 4;
        $directions = ['north', 'east', 'south', 'west'];

        $this->doors = array_combine(
            $directions,
            array_merge(array_slice($this->doors, $rotations), array_slice($this->doors, 0, $rotations))
        );

        $currentKegIndex = array_search($this->kegDoor, $directions);
        $this->kegDoor = $directions[($currentKegIndex + $rotations) % 4];
    }

    /**
     * Checks if there is a door in the specified direction.
     *
     * @param string $direction The direction to check ("north", "east", "south", or "west").
     * @return bool True if there is a door in the specified direction; otherwise, false.
     */
    public function hasDoor(string $direction): bool
    {
        return $this->doors[$direction] ?? false;
    }

    /**
     * Gets the current fire level of the tile.
     *
     * @return int The current fire level.
     */
    public function getFireLevel(): int
    {
        return $this->fireLevel;
    }

    /**
     * Gets the color of the fire for this tile.
     *
     * @return string The fire color, either "yellow" or "red".
     */
    public function getFireColor(): string
    {
        return $this->fireColor;
    }

    /**
     * Gets the orientation of the tile in degrees.
     *
     * @return int The orientation of the tile.
     */
    public function getOrientation(): int
    {
        return $this->orientation;
    }

    /**
     * Gets the unique ID of the tile.
     *
     * @return int The room ID.
     */
    public function getId(): int
    {
        return $this->roomId;
    }

    /**
     * Sets whether the tile has exploded.
     *
     * @param bool $exploded True if the tile has exploded; otherwise, false.
     */
    public function setExploded(bool $exploded): void
    {
        $this->exploded = $exploded;
    }

    /**
     * Sets whether the tile is unreachable.
     *
     * @param bool $unreachable True if the tile is unreachable; otherwise, false.
     */
    public function setUnreachable(bool $unreachable): void
    {
        $this->unreachable = $unreachable;
    }

    /**
     * Checks if the tile has exploded.
     *
     * @return bool True if the tile has exploded; otherwise, false.
     */
    public function isExploded(): bool
    {
        return $this->exploded;
    }

    /**
     * Checks if the tile is unreachable.
     *
     * @return bool True if the tile is unreachable; otherwise, false.
     */
    public function isUnreachable(): bool
    {
        return $this->unreachable;
    }

    /**
     * Increments the fire level of the tile by one.
     */
    public function incrementFireLevel(): void
    {
        $this->fireLevel++;
    }

    /**
     * Sets the fire level of the tile to a specified value.
     *
     * @param int $level The new fire level.
     */
    public function setFireLevel(int $level = 0): void
    {
        $this->fireLevel = $level;
    }

    /**
     * Unsets all doors by marking them as closed.
     */
    public function unsetDoors(): void
    {
        foreach ($this->doors as $direction => $door) {
            $this->doors[$direction] = false;
        }
    }

    /**
     * Gets the current position of the tile as an associative array.
     *
     * @return array The position of the tile as ["posX" => x, "posY" => y].
     */
    public function getPosition(): array
    {
        return [
            "posX" => $this->posX,
            "posY" => $this->posY
        ];
    }

    /**
     * Sets the position of the tile on the board.
     *
     * @param int $posX The new X-coordinate.
     * @param int $posY The new Y-coordinate.
     */
    public function setPosition(int $posX, int $posY): void
    {
        $this->posX = $posX;
        $this->posY = $posY;
    }

    /**
     * Checks if the keg in the tile has exploded.
     *
     * @return bool True if the keg has exploded; otherwise, false.
     */
    public function isKegExploded(): bool
    {
        return $this->kegExploded;
    }

    /**
     * Sets the keg explosion state to true.
     * @param bool $state True if exploded
     */
    public function setKegExploded(bool $state): void
    {
        $this->kegExploded = $state;
    }

    /**
     * Gets the direction of the keg.
     *
     * @return string The direction of the keg explosion.
     */
    public function getKegDoor(): string
    {
        return $this->kegDoor;
    }

    /**
     * Gets the threshold fire level at which the keg explodes.
     *
     * @return int The keg explosion threshold.
     */
    public function getKegThreshold(): int
    {
        return $this->kegThreshold;
    }
}


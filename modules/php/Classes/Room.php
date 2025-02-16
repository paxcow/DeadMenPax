<?php

namespace Bga\Games\deadmenpax\Classes;

use Bga\Games\deadmenpax\DB\dbKey;
use Bga\Games\deadmenpax\DB\dbColumn;

/**
 * Class representing a room. Each room has dynamic attributes (e.g., position, fire level) 
 * and static attributes (e.g., fire color, doors). The room can explode under certain conditions and can have its reachability and state updated.
 */
class Room
{
    #[dbKey("card_id")]
    private int $cardId; // Unique ID assigned by Deck component 
    #[dbColumn("card_type")]
    private string $cardType; // Type of card, starting room or generic room
    #[dbColumn("card_type_arg")]
    private int $roomId; // Id of the room, to retrieve static info
    #[dbColumn("card_location")]
    private string $cardLocation; // Where is the card assigned
    #[dbColumn("card_location_arg")]
    private int $coordinates; // if location is "board", this number is the coordinates X,Y of the card on the board
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


    private $posX;
    private $posY;

    private Position $position; //decoded position
    private string $fireColor; // Color of the fire (either "yellow" or "red")
    private array $doors = []; // Array indicating presence of doors in each direction
    private ?string $kegDoor; // Direction of the exploding keg
    private ?int $kegThreshold; // Fire level threshold at which the keg explodes




    /**
     * Room constructor. Initializes the room with dynamic attributes from the database 
     * and static attributes from predefined data.
     *
     * @param array $roomRow The dynamic attributes for the room from the database.
     * @param array $roomsData The predefined static attributes for the room.
     */
    public function __construct(array $roomRow, array $roomsData)
    {
        $this->cardId = $roomRow["card_id"];
        $this->cardType = $roomRow["card_type"];
        $this->roomId = $roomRow["card_type_arg"];
        $this->cardLocation = $roomRow["card_location"];
        $this->coordinates = $roomRow["card_location_arg"];

        $roomData = $roomsData[$this->roomId];

        // Initialize dynamic attributes
        $this->fireLevel = $roomRow["fire_level"] ?? ($roomData["startFireValue"] ?? bga_rand(1, 6));
        $this->orientation = $roomRow["orientation"] ?? 0;
        $this->exploded = $roomRow["exploded"] ?? false;
        $this->unreachable = $roomRow["unreachable"] ?? false;
        $this->kegExploded = $roomRow["keg_exploded"] ?? false;

        // Initialize static attributes
        $this->fireColor = $roomData["fireColor"];
        $this->doors = $roomData["doors"];
        $this->kegDoor = $roomData["kegDoor"];
        $this->kegThreshold = $roomData["kegThreshold"];

        if ($this->orientation !== 0) {
            $this->rotateDoors($this->orientation);
        }

        // Initialize position
        if ($this->cardLocation === "board") {
            [$x, $y] = $this->decodePosition($this->coordinates);
            $this->position = new Position($x, $y);
        }
    }

    /**
     * Decodes an encoded position into X and Y coordinates.
     *
     * @param int $encodedPosition The encoded position value.
     * @return array An array containing ['posX', 'posY'].
     */
    private function decodePosition(int $encodedPosition): array
    {
        $width = 43;
        return [$encodedPosition % $width - 21, intdiv($encodedPosition, $width)];
    }

    /**
     * Gets the position of the room.
     *
     * @return Position The position object.
     */
    public function getPosition(): Position
    {
        return $this->position;
    }

    /**
     * Sets the position of the room.
     *
     * @param Position $position The new position.
     */
    public function setPosition(Position $position): void
    {
        $this->position = $position;
        $this->cardLocation = "board";
        $this->coordinates = $this->encodePosition($position);
    }

    /**
     * Encodes a Position object into an integer.
     *
     * @param Position $position The position to encode.
     * @return int The encoded position value.
     */
    private function encodePosition(Position $position): int
    {
        $width = 43;
        return ($position->x + 21) + ($position->y * $width);
    }




    /**
     * Sets whether the room has exploded.
     *
     * @param bool $exploded True if exploded, false otherwise.
     */
    public function setExploded(bool $exploded): void
    {
        $this->exploded = $exploded;
    }

    /**
     * Checks if the room has exploded.
     *
     * @return bool True if exploded, false otherwise.
     */
    public function isExploded(): bool
    {
        return $this->exploded;
    }



    /**
     * Rotates doors and keg direction based on the room's orientation.
     *
     * @param int $orientation The orientation in degrees (0, 90, 180, 270).
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
     * Gets the current fire level of the room.
     *
     * @return int The current fire level.
     */
    public function getFireLevel(): int
    {
        return $this->fireLevel;
    }

    /**
     * Increments the fire level by one.
     */
    public function incrementFireLevel(): void
    {
        $this->fireLevel++;
    }

    /**
     * Gets the color of the fire in the room.
     *
     * @return string The fire color, either "yellow" or "red".
     */
    public function getFireColor(): string
    {
        return $this->fireColor;
    }

    /**
     * Sets the fire level of the room to a specified value.
     *
     * @param int $level The new fire level.
     */
    public function setFireLevel(int $level = 0): void
    {
        $this->fireLevel = $level;
    }

    /**
     * Gets the orientation of the room in degrees.
     *
     * @return int The orientation of the room (0, 90, 180, or 270).
     */
    public function getOrientation(): int
    {
        return $this->orientation;
    }

    /**
     * Sets the orientation of the room and updates door positions accordingly.
     *
     * @param int $orientation The new orientation in degrees (must be 0, 90, 180, or 270).
     */
    public function setOrientation(int $orientation): void
    {
        $this->orientation = $orientation;
        if ($this->orientation !== 0) {
            $this->rotateDoors($this->orientation);
        }
    }

    /**
     * Gets the unique ID of the room.
     *
     * @return int The room ID.
     */
    public function getId(): int
    {
        return $this->cardId;
    }

    /**
     * Sets whether the room is unreachable.
     *
     * @param bool $unreachable True if the room is unreachable; otherwise, false.
     */
    public function setUnreachable(bool $unreachable): void
    {
        $this->unreachable = $unreachable;
    }

    /**
     * Checks if the room is unreachable.
     *
     * @return bool True if the room is unreachable; otherwise, false.
     */
    public function isUnreachable(): bool
    {
        return $this->unreachable;
    }

    /**
     * Closes all doors in the room.
     */
    public function unsetDoors(): void
    {
        foreach ($this->doors as $direction => $door) {
            $this->doors[$direction] = false;
        }
    }

    /**
     * Checks if the keg in the room has exploded.
     *
     * @return bool True if the keg has exploded; otherwise, false.
     */
    public function isKegExploded(): bool
    {
        return $this->kegExploded;
    }

    /**
     * Sets the keg explosion state.
     *
     * @param bool $state True if the keg has exploded; otherwise, false.
     */
    public function setKegExploded(bool $state): void
    {
        $this->kegExploded = $state;
    }

    /**
     * Gets the direction of the keg explosion.
     *
     * @return string|null The direction of the keg explosion, or null if no keg is present.
     */
    public function getKegDoor(): ?string
    {
        return $this->kegDoor;
    }

    /**
     * Gets the fire level threshold at which the keg explodes.
     *
     * @return int|null The keg explosion threshold, or null if no keg is present.
     */
    public function getKegThreshold(): ?int
    {
        return $this->kegThreshold;
    }
}

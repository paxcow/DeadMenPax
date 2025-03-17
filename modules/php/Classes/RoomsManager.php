<?php

namespace Bga\Games\deadmenpax\Classes;

use Bga\Games\deadmenpax\DB\DBManager;
use Bga\Games\deadmenpax\DB\DBManagerRegister;

/**
 * Class RoomsManager
 */
class RoomsManager
{
    private static ?self $instance = null;
    private array $roomData = []; // Static room info
    public array $rooms = [];  // Room instances by roomId
    private array $board = [];  // Two-dimensional array storing Room by [posX][posY]
    private DBManager $db; // DB manager

    /**
     * Private constructor to initialize the RoomsManager with static room data.
     *
     * @param array $roomData Static information about room tiles.
     */
    private function __construct(array $roomData)
    {
        $this->db = DBManagerRegister::addManager("rooms", Room::class);
        $this->roomData = $roomData;
        $this->loadAllRooms();
    }

    /**
     * Initializes the singleton instance with room data if not already initialized.
     *
     * @param array $roomData Static information about room tiles.
     * @return self The initialized RoomsManager instance.
     */
    public static function init(array $roomData): self
    {

        return self::$instance ??= new self($roomData);
    }

    /**
     * Retrieves the singleton instance of RoomsManager.
     *
     * @return self The RoomsManager instance.
     * @throws \BgaUserException If the RoomsManager is not initialized.
     */
    public static function getInstance(): self
    {
        return self::$instance ?? throw new \BgaUserException("RoomsManager not initialized. Call init() first.");
    }


    /**
     * Loads all room tiles from the database and populates the board and tiles arrays.
     */
    public function loadAllRooms(): void
    {   
        $allRows = $this->db->getAllRowsByKeys();
        // print_r("<pre>");
        // print_r($allRows);
        // if (count($allRows) == 0) return;
        foreach ($allRows as $roomId => $roomRow) {
            if($roomRow["card_location"] != "board") continue;
            
            $room = new Room($roomRow, $this->roomData);
            $this->rooms[$roomId] = $room;
            $pos = $room->getPosition();
            $this->board[$pos->x][$pos->y] = $room;
        }
    }

    /**
     * Saves all room tiles to the database.
     */
    public function saveAllRooms(): void
    {
        foreach ($this->rooms as $tile) {
            $this->db->saveObjectToDB($tile);
        }
    }

    /**
     * @return array Returns the Room Tiles on the table in an two-dimensional array organized as [posX][posY]
     */

    public function getAllRooms(): array
    {
        return $this->board;
    }
    /**
     * @param int $roomId The roomId to look for
     * @return Room Returns the Room  object with roomId if it exists in the room list, null otherwise 
     */

    public function getRoom($roomId): ?Room
    {
        return $this->rooms[$roomId] ?? null;
    }

    /**
     * Places a room tile on the board if the position is valid.
     *
     * @param array $room Information about the room card being placed.
     * @param int $posX X-coordinate of the tile on the board.
     * @param int $posY Y-coordinate of the tile on the board.
     * @param int $orientation Orientation of the tile.
     * @return bool True if the room was placed successfully; otherwise, false.
     */
    public function placeRoom(array $room, Position $position, int $orientation = 0): Room|false
    {

        $overrideValidatePlacement = $room['card_type'] == "starting_room";
        if (!in_array($room['card_type'], ["room", "starting_room"])) return false;

        $room = new Room($room, $this->roomData);

        if (!$overrideValidatePlacement && !$this->validatePositioning($room, $position)) return false;

        $room->setPosition($position);
        $room->setOrientation($orientation);

        $this->rooms[$room->getId()] = $room;
        $this->board[$position->x][$position->y] = $room;
        $this->updateReachability();
        return $room;
    }


    private function areAdjacent(Room $roomA, Room $roomB): bool
    {
        // Get positions of both rooms
        $posA = $roomA->getPosition();
        $posB = $roomB->getPosition();

        $xA = $posA->x;
        $yA = $posA->y;
        $xB = $posB->x;
        $yB = $posB->y;

        // Check if the rooms are adjacent (horizontally or vertically)
        return (
            ($xA === $xB && abs($yA - $yB) === 1) || // Same column, adjacent row
            ($yA === $yB && abs($xA - $xB) === 1)    // Same row, adjacent column
        );
    }

    private function areConnected(Room $roomA, Room $roomB): bool
    {
        // First, check if the rooms are adjacent
        if (!$this->areAdjacent($roomA, $roomB)) {
            return false;
        }

        // Get positions of both rooms
        $posA = $roomA->getPosition();
        $posB = $roomB->getPosition();

        // Determine the direction of roomB relative to roomA
        if ($posA->x === $posB->x) {
            $directionFromAtoB = ($posA->y < $posB->y) ? 'south' : 'north'; //same column
        } else {
            $directionFromAtoB = ($posA->x < $posB->x) ? 'east' : 'west'; //same row
        }

        // Get the opposite direction
        $directionFromBtoA = $this->getOppositeDirection($directionFromAtoB);

        // Check if both rooms have doors in the correct positions
        return $roomA->hasDoor($directionFromAtoB) && $roomB->hasDoor($directionFromBtoA);
    }



    /**
     * Retrieves a tile at the specified position on the board.
     *
     * @param array $pos The position to retrieve as ['posX' => x, 'posY' => y].
     * @return Room|null The tile at the specified position or null if none exists.
     */
    private function getTileAtPosition(Position $position): ?Room
    {
        return $this->board[$position->x][$position->y] ?? null;
    }

    /**
     * Returns the opposite direction for a given direction.
     *
     * @param string $direction The direction ("north", "south", "east", or "west").
     * @return string The opposite direction.
     */
    private function getOppositeDirection(string $direction): string
    {
        return match ($direction) {
            'north' => 'south',
            'east'  => 'west',
            'south' => 'north',
            'west'  => 'east',
        };
    }


    /**
     * Validates if the positioning of a tile is correct by checking for adjacent tiles with matching doors.
     *
     * @param Room $tile The room tile to validate.
     * @return bool True if positioning is valid; otherwise, false.
     */
    private function validatePositioning(Room $tile, Position $position): bool
    {
        // Check if the position is free
        if ($this->getTileAtPosition($position) !== null) {
            return false;
        }

        // Directions to check for adjacent tiles
        $directions = ['north', 'east', 'south', 'west'];

        // Iterate through each direction
        foreach ($directions as $direction) {
            // Get the adjacent position
            $adjacentPos = $position->getAdjacentPosition($direction);

            // Get the room at the adjacent position
            $adjacentTile = $this->getTileAtPosition($adjacentPos);

            // If there's a valid, non-exploded, connected room, placement is valid
            if ($adjacentTile !== null && !$adjacentTile->isExploded() && $this->areConnected($tile, $adjacentTile)) {
                return true;
            }
        }

        // No valid connection found
        return false;
    }

    /**
     * Applies a fire effect on tiles based on the specified fire color, triggering explosions as needed.
     *
     * @param string $fireColor The fire color to apply ("yellow", "red", or "both").
     */
    public function fireEffect(string $fireColor): void
    {
        ksort($this->board);
        foreach ($this->board as $y => $row) {
            ksort($row);
            foreach ($row as $x => $tile) {
                if (!$tile || ($tile->getFireColor() !== $fireColor && $fireColor !== 'both')) continue;

                $tile->incrementFireLevel();
                if ($tile->getFireLevel() >= $tile->getKegThreshold() && !$tile->isKegExploded()) {
                    $tile->setKegExploded(true);
                    $this->propagateKegExplosion($tile);
                }
                if ($tile->getFireLevel() >= 6 && !$tile->isExploded()) {
                    $tile->setExploded(true);
                    $this->propagateRoomExplosion($tile);
                }
            }
        }
        $this->updateReachability();
    }

    /**
     * Propagates fire to adjacent tiles if a keg explosion occurs.
     *
     * @param Room $tile The tile where the keg explosion originated.
     */
    private function propagateKegExplosion(Room $tile): void
    {
        $directions = ['north', 'east', 'south', 'west'];
        $kegDoor = $tile->getKegDoor();
        $startIdx = array_search($kegDoor, $directions);

        for ($i = 0; $i < 4; $i++) {
            $currentDirection = $directions[($startIdx + $i) % 4];
            $adjPos = $tile->getPosition()->getAdjacentPosition($currentDirection);
            $adjTile = $this->getTileAtPosition($adjPos);

            if (
                $adjTile && !$adjTile->isExploded() &&
                $tile->hasDoor($currentDirection) && $adjTile->hasDoor($this->getOppositeDirection($currentDirection))
            ) {
                $adjTile->incrementFireLevel();
                $this->chainExplosion($adjTile);
                break;
            }
        }
    }

    /**
     * Propagates fire to all connected adjacent tiles if a room explosion occurs.
     *
     * @param Room $tile The tile where the room explosion originated.
     */
    private function propagateRoomExplosion(Room $tile): void
    {
        $directions = ['north', 'east', 'south', 'west'];
        foreach ($directions as $direction) {
            $adjPos = $tile->getPosition()->getAdjacentPosition($direction);
            $adjTile = $this->getTileAtPosition($adjPos);

            if (
                $adjTile && !$adjTile->isExploded() &&
                $tile->hasDoor($direction) && $adjTile->hasDoor($this->getOppositeDirection($direction))
            ) {
                $adjTile->incrementFireLevel();
                $this->chainExplosion($adjTile);
            }
        }
    }

    /**
     * Triggers a chain explosion if a tile reaches its fire threshold or explosion threshold.
     *
     * @param Room $tile The tile to check for a chain explosion.
     */
    private function chainExplosion(Room $tile): void
    {
        if ($tile->getFireLevel() >= $tile->getKegThreshold() && !$tile->isKegExploded()) {
            $tile->setKegExploded(true);
            $this->propagateKegExplosion($tile);
        }
        if ($tile->getFireLevel() >= 6 && !$tile->isExploded()) {
            $tile->setExploded(true);
            $this->propagateRoomExplosion($tile);
        }
    }






    /**
     * Updates the reachability status of all tiles on the board.
     */
    private function updateReachability(): void
    {
        return;
        if (!isset($this->board[0][0])) return;

        $reachable = [];
        //$this->dfsMarkReachable(0, 0, $reachable);

        foreach ($this->rooms as $tile) {
            $pos = $tile->getPosition();
            $tile->setUnreachable(!isset($reachable["{$pos['posX']},{$pos['posY']}"]));
        }
    }
}

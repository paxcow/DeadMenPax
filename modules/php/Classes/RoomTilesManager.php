<?php

namespace BGA\Games\DeadMenPax;

class RoomTilesManager
{
    private $board;    // Stores RoomTile objects by their positions [x][y]
    private $room_data; // The data to initialize each tile that is placed on the table
    private $db; //db manager

    // Constructor
    public function __construct($room_data)
    {
        $this->board = [];
        $this->room_data = $room_data; // room_data will be an array of tile configurations
    }

    public static function init()
    {
        self::$db = DBManagerRegister::addManger("rooms", RoomTileRow::class);
    }

    //


    // Place a room on the board.  roomCard comes from a Deck and it's used to create a RoomTile object populating extra features.
    public function placeRoom($roomCard, $xPos, $yPos, $orientation = 0)
    {
        // Validate room type
        if ($roomCard['type_id'] !== 'room') {
            throw new \BgaUserException("Invalid card type: expected 'room'.");
        }

        // Get the room configuration from room_data using type_arg as the index
        $roomTypeId = $roomCard['type_arg'];
        if (!isset($this->room_data[$roomTypeId])) {
            throw new \BgaUserException("Invalid room type ID in room_data.");
        }

        $roomInfo = $this->room_data[$roomTypeId];

        // Extract properties from room_data
        $northDoor = $roomInfo['northDoor'];
        $southDoor = $roomInfo['southDoor'];
        $eastDoor = $roomInfo['eastDoor'];
        $westDoor = $roomInfo['westDoor'];
        $fireLevel = $roomInfo['fireLevel'];
        $fireColor = $roomInfo['fireColor'];

        // Create a new RoomTile object, using the orientation parameter
        $tile = new RoomTile(
            $roomCard['card_id'],   // Unique card ID from Deck
            "Room #" . ($roomTypeId + 1), // Tile type or name
            $fireLevel,              // Starting fire level from room_data
            $fireColor,              // Fire color (yellow or red) from room_data
            $northDoor,              // North door configuration
            $southDoor,              // South door configuration
            $eastDoor,               // East door configuration
            $westDoor,               // West door configuration
            $orientation             // Orientation parameter for the tile
        );

        // Validate tile placement
        $this->validateTilePlacement($tile, $xPos, $yPos);

        // Place the tile on the board
        $this->board[$xPos][$yPos] = $tile;
    }

    // Validate that the tile's doors align and connect with at least one unexploded adjacent tile
    private function validateTilePlacement(RoomTile $tile, $xPos, $yPos)
    {
        $connected = false;

        // Define the array of directions in clockwise order
        $directions = ["north", "east", "south", "west"];

        // Get all adjacent tiles
        $adjacentTiles = $this->getAdjacentTiles($xPos, $yPos);

        // Check for door alignment and connection based on the tile's orientation
        foreach ($adjacentTiles as $direction => $adjacentTile) {
            if ($adjacentTile->isExploded()) {
                continue; // Skip exploded rooms in validation
            }
            // Find the index of the current direction in the array
            $currentIndex = array_search($direction, $directions);

            // Calculate the opposite direction index using modular arithmetic
            $oppositeDirection = $directions[($currentIndex + 2) % 4];

            // Mark as connected if both doors are present in the respective directions
            if ($tile->hasDoor($direction) && $adjacentTile->hasDoor($oppositeDirection)) {
                $connected = true;
            }
        }

        // Allow doors pointing to exploded rooms, but ensure at least one valid connection to an unexploded room
        return $connected;
    }

    // Check for explosions and propagate fire to adjacent rooms
    private function checkForExplosionsAndPropagation()
    {
        $tilesToExplode = [];

        foreach ($this->board as $xPos => $row) {
            foreach ($row as $yPos => $tile) {
                if ($tile !== null && !$tile->isExploded() && $tile->getFireLevel() >= 6) {
                    // Skip tile (0,0) as it cannot explode
                    if ($xPos === 0 && $yPos === 0) {
                        $tile->setFireLevel(5); // Reset fire level to prevent explosion
                        continue;
                    }
                    $tilesToExplode[] = ['tile' => $tile, 'x' => $xPos, 'y' => $yPos];
                }
            }
        }

        // Process the explosions
        foreach ($tilesToExplode as $data) {
            $this->triggerExplosion($data['tile'], $data['x'], $data['y']);
        }

        // After handling explosions, check for unreachable tiles
        $this->updateUnreachableTiles();
    }

    // Trigger an explosion and propagate fire to connected tiles
    private function triggerExplosion(RoomTile $tile, $xPos, $yPos)
    {
        // Flag tile as exploded
        $tile->setExploded(true);
        $tile->unsetDoors(); // Unset all doors (room becomes inaccessible)
        $tile->setFireLevel(); // Reset fire level after explosion

        // Propagate fire to connected tiles
        $connectedTiles = $this->getConnectedTiles($tile, $xPos, $yPos);

        foreach ($connectedTiles as $connectedTile) {
            $connectedTile->setFireLevel($connectedTile->getFireLevel() + 1);
        }
    }

    // Check for unreachable tiles after explosions
    private function updateUnreachableTiles()
    {
        // Reset isUnreachable for all tiles
        foreach ($this->board as $row) {
            foreach ($row as $tile) {
                $tile->setUnreachable(true); // Assume initially unreachable
            }
        }

        // Start BFS from (0,0)
        $queue = [];
        $visited = [];

        $startingTile = $this->getRoomTile(0, 0);
        if ($startingTile === null) {
            throw new \BgaUserException("Starting tile at (0,0) is missing.");
        }

        $queue[] = ['tile' => $startingTile, 'x' => 0, 'y' => 0];
        $startingTile->setUnreachable(false);

        while (!empty($queue)) {
            $current = array_shift($queue);
            $currentTile = $current['tile'];
            $xPos = $current['x'];
            $yPos = $current['y'];

            $key = "$xPos,$yPos";
            if (isset($visited[$key])) {
                continue;
            }
            $visited[$key] = true;

            $connectedTiles = $this->getConnectedTiles($currentTile, $xPos, $yPos);
            foreach ($connectedTiles as $connectedTile) {
                $connectedTile->setUnreachable(false);
                $queue[] = ['tile' => $connectedTile];
            }
        }
    }

    // Get adjacent tiles with positions for validation and propagation
    private function getAdjacentTiles($xPos, $yPos)
    {
        $adjacentTiles = [];

        if (isset($this->board[$xPos][$yPos + 1])) {
            $adjacentTiles['north'] = $this->board[$xPos][$yPos + 1];
        }
        if (isset($this->board[$xPos][$yPos - 1])) {
            $adjacentTiles['south'] = $this->board[$xPos][$yPos - 1];
        }
        if (isset($this->board[$xPos + 1][$yPos])) {
            $adjacentTiles['east'] = $this->board[$xPos + 1][$yPos];
        }
        if (isset($this->board[$xPos - 1][$yPos])) {
            $adjacentTiles['west'] = $this->board[$xPos - 1][$yPos];
        }

        return $adjacentTiles;
    }

    // Get connected tiles for fire propagation
    private function getConnectedTiles(RoomTile $tile, $xPos, $yPos)
    {
        $connectedTiles = [];
        $adjacentTiles = $this->getAdjacentTiles($xPos, $yPos);

        foreach ($adjacentTiles as $direction => $adjacentTile) {
            if ($adjacentTile->isExploded()) continue;

            switch ($direction) {
                case 'north':
                    if ($tile->hasNorthDoor() && $adjacentTile->hasSouthDoor()) {
                        $connectedTiles[] = $adjacentTile;
                    }
                    break;
                case 'south':
                    if ($tile->hasSouthDoor() && $adjacentTile->hasNorthDoor()) {
                        $connectedTiles[] = $adjacentTile;
                    }
                    break;
                case 'east':
                    if ($tile->hasEastDoor() && $adjacentTile->hasWestDoor()) {
                        $connectedTiles[] = $adjacentTile;
                    }
                    break;
                case 'west':
                    if ($tile->hasWestDoor() && $adjacentTile->hasEastDoor()) {
                        $connectedTiles[] = $adjacentTile;
                    }
                    break;
            }
        }

        return $connectedTiles;
    }
}

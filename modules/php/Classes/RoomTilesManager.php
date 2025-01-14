<?php

namespace BGA\Games\DeadMenPax;

class RoomsManager
{
    private static ?self $instance = null;
    private array $roomData = []; // Static room info
    private array $tiles = [];  // Room instances by roomId
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
        foreach ($this->db->getAllRowsByKeys() as $roomId => $roomRow) {
            $tile = new Room($roomRow, $this->roomData);
            $this->tiles[$roomId] = $tile;
            $pos = $tile->getPosition();
            $this->board[$pos['posX']][$pos['posY']] = $tile;
        }
    }

    /**
     * Saves all room tiles to the database.
     */
    public function saveAllRooms(): void
    {
        foreach ($this->tiles as $tile) {
            $this->db->saveObjectToDB($tile);
        }
    }

    /**
     * Places a room tile on the board if the position is valid.
     *
     * @param array $roomCard Information about the room card being placed.
     * @param int $posX X-coordinate of the tile on the board.
     * @param int $posY Y-coordinate of the tile on the board.
     * @param int $orientation Orientation of the tile.
     * @return bool True if the room was placed successfully; otherwise, false.
     */
    public function placeRoom(array $roomCard, int $posX, int $posY, int $orientation = 0): bool
    {
        if ($roomCard['card_type'] !== 'room') return false;

        $roomId = $roomCard['card_type_arg'];
        $roomRow = ['roomId' => $roomId, 'posX' => $posX, 'posY' => $posY, 'orientation' => $orientation];
        $Room = new Room($roomRow, $this->roomData);

        if (!$this->validatePositioning($Room)) return false;

        $this->tiles[$roomId] = $Room;
        $this->board[$posX][$posY] = $Room;
        $this->updateReachability();
        return true;
    }

    /**
     * Validates if the positioning of a tile is correct by checking for adjacent tiles with matching doors.
     *
     * @param Room $tile The room tile to validate.
     * @return bool True if positioning is valid; otherwise, false.
     */
    private function validatePositioning(Room $tile): bool
    {
        $pos = $tile->getPosition();
        $directions = [
            'north' => [$pos['posX'], $pos['posY'] - 1],
            'east' => [$pos['posX'] + 1, $pos['posY']],
            'south' => [$pos['posX'], $pos['posY'] + 1],
            'west' => [$pos['posX'] - 1, $pos['posY']]
        ];

        $hasConnectedDoor = $adjacentExists = false;

        foreach ($directions as $direction => [$adjX, $adjY]) {
            if (!isset($this->board[$adjX][$adjY])) continue;

            $adjacentTile = $this->board[$adjX][$adjY];
            $adjacentExists = true;

            $oppositeDirection = $this->getOppositeDirection($direction);

            if (
                !$adjacentTile->isExploded() &&
                $tile->hasDoor($direction) === $adjacentTile->hasDoor($oppositeDirection)
            ) {
                $hasConnectedDoor = true;
            } else {
                return false;
            }
        }
        return $adjacentExists && $hasConnectedDoor;
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
            $adjPos = $this->getAdjacentPosition($tile->getPosition(), $currentDirection);
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
            $adjPos = $this->getAdjacentPosition($tile->getPosition(), $direction);
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
        if (!isset($this->board[0][0])) return;

        $reachable = [];
        $this->dfsMarkReachable(0, 0, $reachable);

        foreach ($this->tiles as $tile) {
            $pos = $tile->getPosition();
            $tile->setUnreachable(!isset($reachable["{$pos['posX']},{$pos['posY']}"]));
        }
    }

    /**
     * Marks reachable tiles starting from the given coordinates using Depth-First Search (DFS).
     *
     * @param int $startX Starting X-coordinate.
     * @param int $startY Starting Y-coordinate.
     * @param array $reachable Reference array to track reachable tiles.
     */
    private function dfsMarkReachable(int $startX, int $startY, array &$reachable): void
    {
        $reachableTiles = $this->performDFS($startX, $startY);
        foreach ($reachableTiles as $key => $value) {
            [$x, $y] = explode(',', $key);
            $reachable["$x,$y"] = $value;
        }
    }

    /**
     * Returns the position of an adjacent tile based on the specified direction.
     *
     * @param array $pos The current position as ['posX' => x, 'posY' => y].
     * @param string $direction The direction to move towards.
     * @return array The position of the adjacent tile.
     */
    private function getAdjacentPosition(array $pos, string $direction): array
    {
        $x = $pos['posX'];
        $y = $pos['posY'];
        return match ($direction) {
            'north' => ['posX' => $x, 'posY' => $y - 1],
            'east'  => ['posX' => $x + 1, 'posY' => $y],
            'south' => ['posX' => $x, 'posY' => $y + 1],
            'west'  => ['posX' => $x - 1, 'posY' => $y],
        };
    }

    /**
     * Retrieves a tile at the specified position on the board.
     *
     * @param array $pos The position to retrieve as ['posX' => x, 'posY' => y].
     * @return Room|null The tile at the specified position or null if none exists.
     */
    private function getTileAtPosition(array $pos): ?Room
    {
        return $this->board[$pos['posX']][$pos['posY']] ?? null;
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
     * Performs a DFS traversal starting from a given position to explore reachable tiles.
     *
     * @param int $startX X-coordinate of the starting tile.
     * @param int $startY Y-coordinate of the starting tile.
     * @param array|null $targetPos Optional destination position ['posX' => x, 'posY' => y].
     * @return array|bool Returns an array of reachable tiles if $targetPos is null,
     *                    or true if the target tile is reachable, false otherwise.
     */
    private function performDFS(int $startX, int $startY, ?array $targetPos = null): array|bool
    {
        $reachable = [];
        $stack = [[$startX, $startY]];

        while ($stack) {
            [$x, $y] = array_pop($stack);
            if (isset($reachable["$x,$y"])) continue;

            $reachable["$x,$y"] = true;

            // If a target position is provided and matched, return true
            if ($targetPos && $x === $targetPos['posX'] && $y === $targetPos['posY']) {
                return true;
            }

            $currentTile = $this->board[$x][$y] ?? null;

            if (!$currentTile) continue;

            $directions = [
                'north' => [$x, $y - 1],
                'east' => [$x + 1, $y],
                'south' => [$x, $y + 1],
                'west' => [$x - 1, $y]
            ];

            foreach ($directions as $direction => [$adjX, $adjY]) {
                $adjTile = $this->board[$adjX][$adjY] ?? null;

                if (
                    $adjTile && !$adjTile->isUnreachable() &&
                    $currentTile->hasDoor($direction) === $adjTile->hasDoor($this->getOppositeDirection($direction))
                ) {
                    $stack[] = [$adjX, $adjY];
                }
            }
        }

        // If targetPos is provided but not found, return false
        return $targetPos ? false : $reachable;
    }

      /**
     * Checks if there is a walking path between two tiles.
     *
     * A walking path exists if there is a series of adjacent tiles with corresponding doors
     * that connect the starting tile to the destination tile.
     *
     * @param Room $startTile The starting tile.
     * @param Room $endTile The destination tile.
     * @return bool True if there is a walking path between the tiles; otherwise, false.
     */
    public function hasWalkingPath(Room $startTile, Room $endTile): bool
    {
        $startPos = $startTile->getPosition();
        $endPos = $endTile->getPosition();

        // If the start and end positions are the same, the path exists
        if ($startPos['posX'] === $endPos['posX'] && $startPos['posY'] === $endPos['posY']) {
            return true;
        }

        // Use performDFS to check for connectivity to the target position
        return $this->performDFS($startPos['posX'], $startPos['posY'], $endPos);
    }
        /**
     * Checks if there is a walking path between two tiles based on their positions.
     *
     * A walking path exists if there is a series of adjacent tiles with corresponding doors
     * that connect the starting tile to the destination tile.
     *
     * @param int $startX X-coordinate of the starting tile.
     * @param int $startY Y-coordinate of the starting tile.
     * @param int $endX X-coordinate of the destination tile.
     * @param int $endY Y-coordinate of the destination tile.
     * @return bool True if there is a walking path between the tiles; otherwise, false.
     */
    public function hasWalkingPathByCoordinates(int $startX, int $startY, int $endX, int $endY): bool
    {
        // Check if tiles exist at the given positions
        $startTile = $this->getTileAtPosition(['posX' => $startX, 'posY' => $startY]);
        $endTile = $this->getTileAtPosition(['posX' => $endX, 'posY' => $endY]);

        if (!$startTile || !$endTile) {
            return false; // Path cannot exist if one or both tiles are missing
        }

        // Reuse the original hasWalkingPath method
        return $this->hasWalkingPath($startTile, $endTile);
    }


}

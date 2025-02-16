<?php

namespace Bga\Games\deadmenpax\Classes;

/**
 * Represents a position on a 2D grid with X and Y coordinates.
 */
class Position
{
    /**
     * Constructs a new Position object.
     *
     * @param int $x The X-coordinate of the position.
     * @param int $y The Y-coordinate of the position.
     */
    public function __construct(public int $x, public int $y) {}

    /**
     * Retrieves the adjacent position in the given direction.
     *
     * @param string $direction The direction to move towards. Must be one of 'north', 'east', 'south', or 'west'.
     * @return Position The new position after moving in the specified direction.
     * @throws \BgaVisibleSystemException If an invalid direction is provided.
     */
    public function getAdjacentPosition(string $direction): Position
    {
        $validDirections = ['north', 'east', 'south', 'west'];

        if (!in_array($direction, $validDirections, true)) {
            throw new \BgaVisibleSystemException("Invalid direction: $direction. Must be one of " . implode(', ', $validDirections));
        }

        [$x, $y] = match ($direction) {
            'north' => [$this->x, $this->y - 1],
            'east'  => [$this->x + 1, $this->y],
            'south' => [$this->x, $this->y + 1],
            'west'  => [$this->x - 1, $this->y],
        };

        return new Position($x, $y);
    }
}

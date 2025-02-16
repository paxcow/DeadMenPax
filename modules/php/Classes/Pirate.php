<?php

namespace Bga\Games\deadmenpax\Classes;

use Deck;
use Bga\Games\deadmenpax\DB\dbKey;
use Bga\Games\deadmenpax\DB\dbColumn;


class Pirate
{

    #[dbKey('player_id')]
    private int $playerId;
    #[dbColumn('character')]
    private int $character;
    #[dbColumn('strength')]
    public int $strength;
    #[dbColumn('fatigue')]
    public int $fatigue;
    #[dbColumn('pos_x')]
    public int $posX;
    #[dbColumn('pos_y')]
    public int $posY;
    #[dbColumn('cutlass')]
    public int $cutlass;

    public function __construct() {}

    public function rest()
    {
        $this->changeFatigue(-2);
    }

    public function setPosition(int $toPosX, int $toPosY): void
    {
        $this->posX = $toPosX;
        $this->posY = $toPosY;
    }

    public function getPosition(): array
    {
        return ["posX" => $this->posX, "posY" => $this->posY];
    }

    public function changeFatigue(int $value): int
    {
        $this->fatigue += $value;
        return $this->fatigue;
    }

    public function getFatigue(): int
    {
        return $this->fatigue;
    }

    public function isDead(): bool
    {
        return $this->fatigue >= 8;
    }

    public function resetStrength(): void
    {
        $this->strength = $this->cutlass;
    }

    public function increaseStrength(): void
    {
        $this->strength = min($this->strength + 1, 4);
    }

    public function getStrength(): int
    {
        return $this->strength;
    }
}

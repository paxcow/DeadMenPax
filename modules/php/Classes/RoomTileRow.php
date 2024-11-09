<?php

namespace Bga\Games\DeadMenPax;

use BGA\Games\DeadMenPax\dbColumn;
use BGA\Games\DeadMenPax\dbKey;

class RoomTileRow{
    #[dbKey("room_id")]
    private $room_id;
    #[dbColumn("pos_x")]
    private $posX;
    #[dbColumn("pos_y")]
    private $posY;
    #[dbColumn("orientation")]
    private $orientation;
    #[dbColumn("fire_level")]
    private $fireLEvel;
    #[dbColumn("exploded")]
    private $isExploded;
    #[dbColumn("unreachable")]
    private $isUnreachable;
}
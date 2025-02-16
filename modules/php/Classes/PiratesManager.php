<?php

namespace Bga\Games\deadmenpax\Classes;

use Bga\Games\deadmenpax\DB\DBManager;
use Bga\Games\deadmenpax\DB\DBManagerRegister;

/**
 * Class PiratesManager
 */
class PiratesManager
{
    private static ?self $instance = null;
    private DBManager $db; // DB manager;
    private array $pirates;
    private RoomsManager $board;
    private \Deck $items;
    private \Deck $tokens;

    public static function test(){
     return "this is just a test";
    }

    private function __construct(RoomsManager $board, \Deck $items, \Deck $tokens)
    {
        $this->db = DBManagerRegister::addManager("player", Pirate::class);
        $this->board = $board;
        $this->pirates = $this->db->getAllObjects();
        $this->items = $items;
        $this->tokens = $tokens;
    }

    public static function init(RoomsManager $board, \Deck $items, \Deck $tokens): self
    {   
       return self::$instance ??= new self($board, $items, $tokens);
    }


    public function getPirates()
    {
        return $this->pirates;
    }


    ////////////////////////////////////////////
    /////////////   GETTERS   //////////////////
    ////////////////////////////////////////////

    public function gerPiratePos($pirateId): ?array
    {
        return isset($this->pirates[$pirateId]) ?
            [
                $this->pirates[$pirateId]->posX,
                $this->pirates[$pirateId]->posY
            ]
            : null;
    }

    public function getPiratesByRoomId($roomId): ?array
    {
        $room = $this->board->getRoom($roomId);
        $roomPos = $room->getPosition();
        $piratesFound = [];
        $piratesFound = array_filter($this->pirates, function ($pirate) use ($roomPos) {
            $piratePos = $pirate->getPosition();
            return ($roomPos === $piratePos);
        });
        return $piratesFound;
    }

    ////////////////////////////////////////////
    /////////////// ACTIONS ////////////////////
    ////////////////////////////////////////////

    public function move($pirateId, $finalPos)
    {
        //check pirate startPos, can it reach finalPos?
        //check fatigue -> alert
        //give action
        //move
        //if exit, take a breather
        //else update fatigue
        //fight?
    }

    public function run($pirateId, $finalPos)
    {
        //check pirate startPos, can it reach finalPos?
        //check fatigue -> alert
        //move
        //if exit, take a breather
        //else
        //update fatigue (extra for run)
    }

    public function rest($pirateId)
    {
        //give action
        //rest (fatigue--)
    }

    public function swapItem($pirateId, $origItemId, $newItemId)
    {
        //give action
        //check if newItemId is on the table or another player
        //if on the table,give newItemId to player, put origItem on the table
        //if another player, get newItem from anotherPlayuer to thisPlayer
        //anotherPlayer choses an item from the table with pickItem function 
    }

    public function pickItem($pirateId, $itemId)
    {
        //check that itemId is on the table
        //give action
        //give itemId to the player
    }

    public function fightFire($pirateId, $roomId = null)
    {
        //if roomId = null, roomId = room where the pirate is
        //check if roomId is connected to pirate
        //if fire = 0 alert
        //give action
        //lower fire in roomId by 1
    }

    public function eliminateDeckhand($pirateId, $roomId)
    {
        //check if roomId is connected to the pirate
        //check if the room has deckhands
        //cehck if pirateId is character Jade -> if Jade, nbrHand = 2, else 1
        //give action
        //lower deckHand in roomId by nbrHand (min 0)
    }

    public function pickupToken($pirateId, $tokenId)
    {
        //check if roomId = where pirate is has tokenId
        //check if pirateId has room for tokenId, if tokenId is type treasure
        //give action
        //get tokenId to pirateId
    }

    public function dropToken($pirateId, $tokenId)
    {
        //check if pirateId has tokenId
        //roomId = where pirate is
        //move tokenId from pirateId to roomId
    }

    public function increaseStrength($pirateId)
    {
        //check if strenght is already maxed
        //give action
        //increase strenght by 1
    }

    private function passAction($pirateId, $actions = null, $targetPlayer = null)
    {
        //if actions = null, actions = 1,  targetPlayer = availableActions > 6 ??  prevPlayer :: nextPlayer
        //thisPlayer -> - $actions
        //targetPlayer -> + $actions
    }

    private function takeBreather($pirateId)
    {
        //check if current roomId  = dinghy or starting tile
        //if pirate has treasure, drop it
        //drop fatigue by half, rounded up
        // give max(0, remaining actions - 6) to prev player
        // give remaining actions to next player

    }
}

<?php



/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * deadmenpax implementation : © Andrea "Paxcow" Vitagliano <andrea.vitagliano@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * deadmenpax.game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 */

declare(strict_types=1);

namespace Bga\Games\deadmenpax;

use Bga\Games\deadmenpax\Classes\Room;
use Deck;

require_once(APP_GAMEMODULE_PATH . 'module/table/table.game.php');

class Game extends \Table
{
    /**
     * Your global variables labels:
     *
     * Here, you can assign labels to global variables you are using for this game. You can use any number of global
     * variables with IDs between 10 and 99. If your game has options (variants), you also have to associate here a
     * label to the corresponding ID in `gameoptions.inc.php`.
     *
     * NOTE: afterward, you can get/set the global variables with `getGameStateValue`, `setGameStateInitialValue` or
     * `setGameStateValue` functions.
     */
    private Deck $itemsDeck;
    private Deck $revengeDeck;
    private Deck $tokensBag;
    private Deck $roomsPile;
    private Deck $charactersDeck;



    private $roomsManager;
    private $piratesManager;

    protected $itemData;
    protected $revengeData;
    protected $tokenData;
    protected array $roomsData;


    public function __construct()
    {
        $this->trace("########## Starting constructor");
        require("material.inc.php");
        parent::__construct();


        // Init global values with their initial values.
        $this->initGameStateLabels([]);

        // Dummy content.
        //$this->setGameStateInitialValue("my_first_global_variable", 0)


        // Initialize decks
        $this->itemsDeck = $this->getNew("module.common.deck");
        $this->itemsDeck->init("items");
        $this->revengeDeck = $this->getNew("module.common.deck");
        $this->revengeDeck->init("revenge");
        $this->tokensBag = $this->getNew("module.common.deck");
        $this->tokensBag->init("tokens");
        $this->roomsPile = $this->getNew("module.common.deck");
        $this->roomsPile->init("rooms");
        $this->charactersDeck = $this->getNew("module.common.deck");
        $this->charactersDeck->init("characters");
        
        //Initialize board manager
        $this->roomsManager = Classes\RoomsManager::init($this->roomsData);
        //initialize pirates manager
        $this->piratesManager = Classes\PiratesManager::init($this->roomsManager, $this->itemsDeck, $this->tokensBag);
    }


    public function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }



    /**
     * Migrate database.
     *
     * You don't have to care about this until your game has been published on BGA. Once your game is on BGA, this
     * method is called everytime the system detects a game running with your old database scheme. In this case, if you
     * change your database scheme, you just have to apply the needed changes in order to update the game database and
     * allow the game to continue to run with your new version.
     *
     * @param int $from_version
     * @return void
     */
    public function upgradeTableDb($from_version)
    {
        //       if ($from_version <= 1404301345)
        //       {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            $this->applyDbUpgradeToAllDB( $sql );
        //       }
        //
        //       if ($from_version <= 1405061421)
        //       {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            $this->applyDbUpgradeToAllDB( $sql );
        //       }
    }

    /*
     * Gather all information about current game situation (visible by the current player).
     *
     * The method is called each time the game interface is displayed to a player, i.e.:
     *
     * - when the game starts
     * - when a player refreshes the game page (F5)
     */
    protected function getAllDatas()
    {
 /*       $result = [];

        // WARNING: We must only return information visible by the current player.
        $current_player_id = (int) $this->getCurrentPlayerId();

        // Get information about players.
        // NOTE: you can retrieve some extra field you added for "player" table in `dbmodel.sql` if you need it.
        $result["players"] = $this->getCollectionFromDb(
            "SELECT player_id, player_score score FROM player"
        );

        // TODO: Gather all information about current game situation (visible by player $current_player_id).

        //get information about pirates:
        $result["pirates"] = $this->piratesManager->getPirates();

        //get Room Tiles on the table:
        $result["board"] = $this->roomsManager->getAllRooms();

        //get Tokens 
        $result["tokens"]["board"] = $this->tokensBag->getCardsInLocation("board");
        $result["tokens"]["players"] = $this->tokensBag->getCardsInLocation("player");

        //get Items
        $result["items"]["table"] = $this->itemsDeck->getCardsInLocation("table");
        $result["items"]["player"] = $this->itemsDeck->getCardsInLocation("player");


        return $result;*/
    }

    /**
     * Returns the game name.
     *
     * IMPORTANT: Please do not modify.
     */
    protected function getGameName()
    {
        return "deadmenpax";
    }

    /**
     * This method is called only once, when a new game is launched. In this method, you must setup the game
     *  according to the game rules, so that the game is ready to be played.
     */
    protected function setupNewGame($players, $options = [])
    {
        $this->trace("########## initiating game setup");
        // Set the colors of the players with HTML color code. The default below is red/green/blue/orange/brown. The
        // number of colors defined here must correspond to the maximum number of players allowed for the gams.
        $gameinfos = $this->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        foreach ($players as $player_id => $player) {
            // Now you can access both $player_id and $player array
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s')", [
                $player_id,
                array_shift($default_colors),
                $player["player_canal"],
                addslashes($player["player_name"]),
                addslashes($player["player_avatar"]),
            ]);
        }

        // Create players based on generic information.

        static::DbQuery(
            sprintf(
                "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES %s",
                implode(",", $query_values)
            )
        );

        $this->reattributeColorsBasedOnPreferences($players, $gameinfos["player_colors"]);
        $this->reloadPlayersBasicInfos();;

        // Init game statistics.



        // POPULATE DECKS

        $charactersCards = [];
        for ($i = 1; $i <= 7; $i++) {
            $charactersCards[] = array("type" => "character", "type_arg" => $i, "nbr" => 1);
        }
        $this->itemsDeck->createCards($charactersCards);
        $this->itemsDeck->shuffle("deck");

        $itemCards = [];
        foreach ($this->itemData as $type_item => $itemCard) {
            $itemCards[] = array("type" => "item", "type_arg" => $type_item, "nbr" => 1);
        }
        $this->itemsDeck->createCards($itemCards);
        $this->itemsDeck->shuffle("deck");

        $revengeCards = [];
        foreach ($this->revengeData as $type_revenge => $revengeCard) {
            $revengeCards[] = array("type" => "revenge", "type_arg" => $type_revenge, "nbr" => 1);
        }
        $this->revengeDeck->createCards($revengeCards);
        $this->revengeDeck->shuffle("deck");

        $tokens = [];
        foreach ($this->tokenData as $type_token => $token) {
            $tokens[] = array("type" => "token", "type_arg" => $type_token, "nbr" => $token["nbr"]);
        }
        $this->tokensBag->createCards($tokens, "bag");
        $this->tokensBag->shuffle("bag");

        $tiles = [];
        $startingTiles = [];
        foreach ($this->roomsData as $tile_index => $tile) {
            if ($tile["type"] == "room") {
                $tiles[] = array("type" => $tile["type"], "type_arg" => $tile_index, "nbr" => 1);
            } elseif ($tile["type"] == "starting_room") {
                $startingTiles[] = array("type" => $tile["type"], "type_arg" => $tile_index, "nbr" => 1);
            }
        }

        $this->roomsPile->createCards($tiles, "pile");
        $this->roomsPile->createCards($startingTiles, "starting");

        $this->roomsPile->shuffle("pile");

        $this->roomsManager->loadAllRooms();

        // INIT GAME TABLE.

        //setup starting Rooms
        $startingRooms = $this->roomsPile->getCardsInLocation("starting");



        foreach ($startingRooms as $roomId => $room) {
            $room = $this->standardizeRoomArray($room);
            $posX = $this->roomsData[$room["card_type_arg"]]["posX"];
            $posY = $this->roomsData[$room["card_type_arg"]]["posY"];
            $this->roomsManager->placeRoom($room, $posX, $posY);
        }
        $this->roomsManager->saveAllRooms();

        // Activate first player once everything has been initialized and ready.
        $this->activeNextPlayer();
    }
     private function standardizeRoomArray(array $roomArray): array{
        $mapping = [
            "id" => "card_id",
            "type" => "card_type",
            "type_arg" => "card_type_arg",
            "location" => "card_location",
            "location_arg" => "card_location_arg"
        ];

        $standardizedArray = [];

        foreach ($roomArray as $key => $value){
            $newKey = $mapping[$key] ?? $key;
            $standardizedArray[$newKey] = $value;
        }
        return $standardizedArray;

   }  
    /**
     * This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
     * You can do whatever you want in order to make sure the turn of this player ends appropriately
     * (ex: pass).
     *
     * Important: your zombie code will be called when the player leaves the game. This action is triggered
     * from the main site and propagated to the gameserver from a server, not from a browser.
     * As a consequence, there is no current player associated to this action. In your zombieTurn function,
     * you must _never_ use `getCurrentPlayerId()` or `getCurrentPlayerName()`, otherwise it will fail with a
     * "Not logged" error message.
     *
     * @param array{ type: string, name: string } $state
     * @param int $active_player
     * @return void
     * @throws \BgaUserException if the zombie mode is not supported at this game state.
     */


    protected function zombieTurn(array $state, int $active_player): void
    {
        $state_name = $state["name"];

        if ($state["type"] === "activeplayer") {
            switch ($state_name) {
                default: {
                        $this->gamestate->nextState("zombiePass");
                        break;
                    }
            }

            return;
        }

        // Make sure player is in a non-blocking status for role turn.
        if ($state["type"] === "multipleactiveplayer") {
            $this->gamestate->setPlayerNonMultiactive($active_player, '');
            return;
        }

        throw new \BgaUserException("Zombie mode not supported at this game state: \"{$state_name}\".");
    }
}

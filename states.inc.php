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
 * states.inc.php
 *
 * deadmenpax game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: $this->checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!


if (!defined("GAME_START")) {

	define("GAME_START", 1);

define("ACTIVATE_NEXT_PLAYER"   , 2);
define("SEARCH_SHIP"            , 3);
define("PLACE_DINGHY"           , 4);
define("SELECT_ACTION"          , 5);
define("SELECT_ROOM_TO_WALK"    , 6);
define("SELECT_ROOM_TO_RUN"     , 7);
define("FIGHT_FIRE"             , 8);
define("INCREASE_BATTE_STRENGTH", 9);
define("PICKUP_TOKEN"           , 10);
define("REST"                   , 11);
define("ELIMINATE_DECKHAND"     , 12);
define("SWAP_ITEM"              , 13);
define("ACTIVATE_SECOND_PLAYER" , 14);
define("REPLACE_ITEM"           , 15);
define("ACTIVATE_PREV_PLAYER"   , 16);
define("DRINK_GROG"             , 17);
define("DROP_TOKEN"             , 18);
define("TAKE_BREATHER"          , 19);
define("PASS"                   , 20);
define("CHECK_FOR_BATTLE"       , 21);
define("INITIATE_BATTLE"        , 22);
define("BATTLE_ROUND"           , 23);
define("CHOOSE_TARGET"          , 24);
define("BATTLE_END_WIN"         , 25);
define("BATTLE_END_LOSE"        , 26);
define("PLAYER_RETREATS"        , 27);
define("PLAYER_CHOOSES_OUTCOME" , 28);
define("RESPAWN"                , 29);
define("CHECK_FOR_LOSS"         , 30);
define("NEXT_PLAYER_TURN"       , 31);
define("SKELIT_REVENGE"         , 32);
define("CHECK_FOR_WIN"          , 33);

	define("GAME_END", 99);
}


$machinestates = [

	// The initial state. Please do not modify.

	GAME_START => array(
		"name" => "gameSetup",
		"description" => "",
		"type" => "manager",
		"action" => "stGameSetup",
		"transitions" => ["" => 2]
	),

	// Note: ID=2 => your first state
	ACTIVATE_NEXT_PLAYER => array(,
		"name" => "activateNext",
		"description" => clienttranslate("Activating next player..."),
		"type" => "game",
		"action" => "st_activateNext",
		"transition" => ["" => SEARCH_SHIP]
	),

	SEARCH_SHIP => array(,
		"name" => "placeRoom",
		"description" => clienttranslate('${actplayer} must place a Room in the Ship'),
		"descriptionmyturn" => clienttranslate('${you} must place a Room in the Ship'),
		"type" => "activeplayer",
		"possibleactions" => array("actPlaceRoom"),
		"args" => "arg_placeRoom",
		"transition" => ["roomPlaced" => SELECT_ACTION, "needAnotherRoom" => SEARCH_SHIP, "cannotPlaceRoom" => CHECK_FOR_LOSS, "lastRoomPlaced" => PLACE_DINGHY]
	),

	PLACE_DINGHY => array(,
		"name" => "placeDinghy",
		"description" => clienttranslate('${actplayer} must place the Dinghy card in the Ship'),
		"descriptionmyturn" => clienttranslate('${you} must place the Dinghy card in the Ship'),
		"type" => "activeplayer",
		"possibleactions" => array("actPlaceDinghy"),
		"args" => "arg_placeDinghy",
		"transition" => ["" => SELECT_ACTION]
	),

	SELECT_ACTION => array(,
		"name" => "selectAction",
		"description" => clienttranslate('${actplayer} must select his action'),
		"descriptionmyturn" => clienttranslate('${you} must select an action or Pass'),
		"type" => "activeplayer",
		"args" => "arg_selectAction",
		"transition" => [
			"choosePick" => PICKUP_TOKEN,
			"chooseRest" => REST,
			"chooseWalk" => SELECT_ROOM_TO_WALK,
			"chooseDrink" => DRINK_GROG,
			"chooseEliminate" => ELIMINATE_DECKHAND,
			"chooseDrop" => DROP_TOKEN,
			"chooseSwap" => SWAP_ITEM,
			"chooseFire" => FIGHT_FIRE,
			"chooseStrenght" => INCREASE_BATTE_STRENGTH,
			"pass" => PASS
		]
	),

	//ACTIONS

	SELECT_ROOM_TO_WALK => array(,
		"name" => "walk",
		"description" => clienttranslate('${actplayer} must choose a Room to Walk to'),
		"descriptionmyturn" => clienttranslate('${you} must choose a Room to Wak to'),
		"type" => "activeplayer",
		"possibleactions" => array("act_walk"),
		"args" => "arg_walk",
		"transition" => ["roomChosen" => CHECK_FOR_BATTLE,  "dead" => RESPAWN, "exit" => CHECK_FOR_WIN]
	),

	SELECT_ROOM_TO_RUN => array(,
		"name" => "run",
		"description" => clienttranslate('${actplayer} can choose a second Room to Run to'),
		"descriptionmyturn" => clienttranslate('${you} must choose a second Room to Run to or choose another Action.'),
		"type" => "activeplayer",
		"possibleactions" => array("act_run"),
		"args" => "arg_run",
		"transition" => ["roomChosen" => CHECK_FOR_BATTLE, "dead" => RESPAWN, "exit" => CHECK_FOR_WIN]
	),

	ELIMINATE_DECKHAND => array(,
		"name" => "eliminateDeckhand",
		"description" => clienttranslate('Removing a deckhand...'),
		"type" => "game",
		"action" => "st_eliminateDeckhand",
		"transition" => ["nextAction" => SELECT_ACTION]
	),

	FIGHT_FIRE => array(,
		"name" => "fightFire",
		"description" => clienttranslate('Lowering Fire Level...'),
		"type" => "game",
		"action" => "st_fightFire",
		"transition" => ["nextAction" => SELECT_ACTION]
	),

	PICKUP_TOKEN => array(,
		"name" => "pickupToken",
		"description" => clienttranslate('${actplayer} must choose a token to pickup'),
		"descriptionmyturn" => clienttranslate('${you} must choose a token to pickup'),
		"type" => "activeplayer",
		"possibleactions" => array("act_selectToken"),
		"action" => "st_pickupToken",
		"args" => "arg_pickupToken",
		"transition" => ["nextAction" => SELECT_ACTION],
	),

	REST => array(,
		"name" => "rest",
		"description" => clienttranslate('${actplayer} is resting'),
		"type" => "game",
		"action" => "st_rest",
		"transition" => ["nextAction" => SELECT_ACTION]
	),

	INCREASE_BATTE_STRENGTH => array(,
		"name" => "increaseStrength",
		"description" => clienttranslate('${actplayer} increases their Battle strength...'),
		"descriptionmyturn" => clienttranslate('${you} increase your Battle strength...'),
		"type" => "game",
		"action" => "st_increaseStrength",
		"transition" => ["nextAction" => SELECT_ACTION]
	),

	SWAP_ITEM => array(,
		"name" => "swapItem",
		"description" => clienttranslate('${actplayer} must choose another Item to pickup'),
		"descriptionmyturn" => clienttranslate('Choose an Item to take, from the table or from another player'),
		"type" => "activeplayer",
		"possibleactions" => array("act_swapItem"),
		"args" => "arg_swapItem",
		"transition" => ["nextAction" => SELECT_ACTION, "takeFromAnotherPlayer" => ACTIVATE_SECOND_PLAYER]
	),

	ACTIVATE_SECOND_PLAYER => array(,
		"name" => "activateSecondPlayer",
		"description" => clienttranslate('Switching to other player...'),
		"type" => "game",
		"action" => "st_activateSecondPlayer",
		"transition" => ["" => REPLACE_ITEM]
	),

	REPLACE_ITEM => array(,
		"name" => "replaceItem",
		"description" => clienttranslate('${actplayer} must choose a new Item'),
		"descriptionmyturn" => clienttranslate('Choose an Item to take from the table'),
		"type" => "activeplayer",
		"possibleactions" => array("act_replaceItem"),
		"args" => "arg_replaceItem",
		"transition" => ["itemReplaced" => ACTIVATE_PREV_PLAYER]
	),

	ACTIVATE_PREV_PLAYER => array(,
		"name" => "reactivatePrevPlayer",
		"description" => clienttranslate('Returning to turn player...'),
		"type" => "game",
		"action" => "act_reactivatePrevPlayer",
		"transition" => ["nextAction" => SELECT_ACTION]
	),

	PASS => array(,
		"name" => "pass",
		"description" => clienttranslate('Passing remaining actions to next player...'),
		"type" => "game",
		"action" => "st_pass",
		"transition" => ["" => SKELIT_REVENGE]
	),

	TAKE_BREATHER => array(,
		"name" => "takeBreahter",
		"description" => clienttranslate('${actplayer} takes a breaher'),
		"descriptionmyturn" => clienttranslate('${you} take a breahter'),
		"type" => "game",
		"action" => "st_takeBreahter",
		"transition" => ["" => PASS]
	),

	//SKELIT REVENGE

	SKELIT_REVENGE => array(,
		"name" => "skelitRevenge",
		"description" => clienttranslate("Skelit's revenge"),
		"type" => "game",
		"action" => "st_skelitRevenge",
		"transition" => ["" => CHECK_FOR_LOSS]
	),

	//BATTLE 

	CHECK_FOR_BATTLE => array(,
		"name" => "checkBattle",
		"description" => clienttranslate('Checking for Battles...'),
		"type" => "game",
		"action" => "st_checkBattle",
		"transition" => ["noBatlleAfterMovement" => SELECT_ACTION, "noBattleAfterSkelit" => NEXT_PLAYER_TURN, "battle" => INITIATE_BATTLE]
	),

	INITIATE_BATTLE => array(,
		"name" => "initiateBattle",
		"description" => clienttranslate('Initiating battle'),
		"type" => "game",
		"action" => "st_initiateBattle",
		"transition" => ["" => BATTLE_ROUND]
	),

	CHOOSE_TARGET => array(,
		"name" => "chooseTarget",
		"description" => clienttranslate('${actplayer} must choose who to fight'),
		"descriptionmyturn" => clienttranslate('Choose a target to fight'),
		"type" => "activeplayer",
		"possibleactions" => array("act_chooseTarget"),
		"args" => "arg_chooseTarget",
		"transition" => ["" => BATTLE_ROUND]
	),

	BATTLE_ROUND => array(,
		"name" => "battleRound",
		"description" => clienttranslate('${activeplayer} is fighting'),
		"descriptionmyturn" => clienttranslate('Use Battle Strenght?'),
		"type" => "activeplayer",
		"possibleactions" => array("act_useBattle"),
		"action" => "st_battleRound",
		"args" => "arg_battleRound",
		"transition" => ["win" => BATTLE_END_WIN, "lost" => BATTLE_END_LOSE, "dead" => RESPAWN]
	),

	BATTLE_END_WIN => array(,
		"name" => "battleEndWin",
		"description" => clienttranslate('Battle won!'),
		"type" => "game",
		"action" => "st_battleEndWin",
		"transition" => ["" => CHECK_FOR_BATTLE]
	),

	BATTLE_END_LOSE => array(,
		"name" => "battleEndLose",
		"description" => clienttranslate('${actplayer} lost the Battle'),
		"descriptionmyturn" => clienttranslate('${you} lost the Battle'),
		"type" => "activeplayer",
		"possibleactions" => array("act_ChooseOutcome"),
		"action" => "st_battleEndLose",
		"args" => "arg_battleEndLose",
		"transition" => ["chooseRetreat" => PLAYER_RETREATS, "" => CHECK_FOR_BATTLE, "fightAgain" => INITIATE_BATTLE]
	),

	PLAYER_RETREATS => array(,
		"name" => "playerRetreats",
		"description" => clienttranslate('${actplayer} must retreat'),
		"descriptionmyturn" => clienttranslate('Choose a Room to retreat to'),
		"type" => "activeplayer",
		"possibleactions" => array("act_playerRetreats"),
		"args" => "arg_playerRetreats",
		"transition" => ["" => CHECK_FOR_BATTLE]
	),

	RESPAWN => array(,
		"name" => "respawn",
		"description" => clienttranslate('${actplayer} died. They must choose another character'),
		"descriptionmyturn" => clienttranslate('Choose another character. Your turn is over.'),
		"type" => "activeplayer",
		"possibleactions" => array("act_respawn"),
		"action" => "st_respawn",
		"args" => "arg_respawn",
		"transition" => ["newCharacter" => CHECK_FOR_BATTLE, "noMoreCharacters" => CHECK_FOR_LOSS]
	),


	//FREE ACTIONS
	DROP_TOKEN => array(,
		"name" => "dropToken",
		"description" => clienttranslate('Dropping Treasure...'),
		"type" => "game",
		"action" => "st_dropToken",
		"transition" => ["nextAction" => SELECT_ACTION]
	),

	DRINK_GROG => array(,
		"name" => "drinkGrog",
		"description" => clienttranslate('Drinking grog...'),
		"type" => "game",
		"action" => "st_drinkGrog",
		"transition" => ["nextAction" => SELECT_ACTION]
	),

	//WIN & LOSE

	CHECK_FOR_WIN => array(,
		"name" => "checkWin",
		"description" => clienttranslate('Checking victory condition'),
		"type" => "game",
		"action" => "st_checkWin",
		"transition" => ["win" => GAME_END, "notWin" => TAKE_BREATHER]
	),

	CHECK_FOR_LOSS => array(,
		"name" => "checkLose",
		"description" => clienttranslate('Checking loss condition'),
		"type" => "game",

		"action" => "st_checkLose",

		"transition" => ["lost" => GAME_END, "notLost" => CHECK_FOR_BATTLE]
	),
	// Final state.
	// Please do not modify (and do not overload action/args methods).
	GAME_END => [
		"name" => "gameEnd",
		"description" => clienttranslate("End of game"),
		"type" => "manager",
		"action" => "stGameEnd",
		"args" => "argGameEnd"
	],

];

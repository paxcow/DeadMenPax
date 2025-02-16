<?php

namespace Bga\Games\deadmenpax\Actions;

class ActionNotifier
{
    private static $game;
    private $player_id;

    public static function setGame(\Table $game)
    {
        self::$game = $game;
    }

    public function __construct(string $player_id = null)
    {
        $this->player_id = $player_id;
    }

    public function notifyPlayerAndOthers(string $notifType, array|string $notifLog, array $notifArgs)
    {
        if (is_array($notifLog)) {
            $notifLogPublic = $notifLog["public"];
            $notifLogPrivate = $notifLog["private"];
        } else {
            $notifLogPublic = $notifLog;
            $notifLogPrivate = $notifLog;
        }
        if ($this->player_id) {
            $this->notifyCurrentPlayer("{$notifType}_private", $notifLogPrivate, $notifArgs);
        }
        $this->notifyAllPlayers($notifType, $notifLogPublic, $notifArgs);
    }

    public function notifyAll(string $notifType, string $notifLog, array $notifArgs)
    {
        $this->notifyAllPlayers($notifType, $notifLog, $notifArgs);
    }

    public function notifyAllNoMessage(string $notifType, array $notifArgs)
    {
        $this->notifyAllPlayers($notifType, "", $notifArgs);
    }

    public function notify(string $notifType, string $notifLog, array $notifArgs)
    {
        if ($this->player_id) {
            $this->notifyCurrentPlayer($notifType, $notifLog, $notifArgs);
        } else {
            $this->notifyAllPlayers($notifType, $notifLog, $notifArgs);
        }
    }

    public function notifyNoMessage(string $notifType, array $notifArgs)
    {
        if ($this->player_id) {
            $this->notifyCurrentPlayer($notifType, "", $notifArgs);
        } else {
            $this->notifyAllPlayers($notifType, "", $notifArgs);
        }
    }

    protected function notifyCurrentPlayer(string $notifType, string $notifLog, array $notifArgs)
    {
        self::$game->notifyPlayer($this->player_id, $notifType, $notifLog, $this->processNotifArgs($notifArgs));
    }

    protected function notifyAllPlayers(string $notifType, string $notifLog, array $notifArgs)
    {
        self::$game->notifyAllPlayers($notifType, $notifLog, $this->processNotifArgs($notifArgs));
    }

    protected function processNotifArgs(array $notifArgs)
    {
        $info = self::$game->loadPlayersBasicInfos();
        $playerName = '';
        if (array_key_exists($this->player_id, $info)) {
            $playerName = $info[$this->player_id]['player_name'];
        }
        return json_decode(json_encode(
            array_merge(
                [
                    'playerId' => $this->player_id,
                    'player_id' => $this->player_id,
                    'playerName' => $playerName,
                    'player_name' => $playerName,
                ],
                $notifArgs
            )
        ), true);
    }
}

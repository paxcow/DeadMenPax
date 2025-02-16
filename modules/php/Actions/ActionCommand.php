<?php

namespace Bga\Games\deadmenpax\Actions;



abstract class ActionCommand
{
    public $action_id;
    protected $player_id;

    public function __construct($player_id)
    {
        $this->player_id = $player_id;
    }

    public function getPlayerId()
    {
        return $this->player_id;
    }

    public function setHandlers($args)
    {
        if (is_array($args)) {
            foreach ($args as $propertyName => &$propertyValue) {
                if (property_exists($this, $propertyName)) {
                    $this->$propertyName = &$propertyValue;
                }
            }
        }
    }

    abstract public function do($notifier);
    abstract public function reload($notifier);
    abstract public function undo($notifier);
    abstract public function committ();
}

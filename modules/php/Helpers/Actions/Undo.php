<?php
namespace BGA\Games\DeadMenPax;

trait Undo
{
    function undo($unpass = false, $steps = 1, $changeStateAfter = null,)
    {
        $player_id = $this->getCurrentPlayerId();

        
        if ($unpass) {
            $players[] = $player_id;
            //reactivate player
            $this->gamestate->setPlayersMultiactive($players, null);
        }
        if ($this->gamestate->isPlayerActive($player_id)) {



            //calculate how many actions can be retraced
            $nbr_actions = count(ActionManager::getAllActions($player_id));
            $steps = min($steps, $nbr_actions);


            //reload pending actions to update volatile game situation
            ActionManager::reloadAllActions($player_id);

            //undo the last $step actions

            for ($steps; $steps > 0; $steps--) {
                $last_action = ActionManager::getLastAction($player_id);
                if ($last_action) {
                    self::trace("********** UNDO " . $last_action::class . "*******************");
                    $last_action->setHandlers($handlers);
                    $notifier = new ActionNotifier($player_id);
                    $last_action->undo($notifier);
                    self::trace("********** REMOVE ACTION " . $last_action->action_id . "*******************");

                    ActionManager::removeAction($last_action->action_id);
                }
            }

            //go to a different state
            if ($changeStateAfter) {
                $this->gamestate->nextState($changeStateAfter);
            }
        }
    }
}

?>
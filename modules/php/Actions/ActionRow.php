<?php

namespace Bga\Games\deadmenpax\Actions;

use Bga\Games\deadmenpax\DB\dbKey;
use Bga\Games\deadmenpax\DB\dbColumn;


class ActionRow
{
    #[dbKey(name: "action_id")]
    public $actionId;
    #[dbColumn(name: "action_json")]
    public $actionEncoded;

    private const MAX_ACTION_JSON_LENGTH = 65535;

    public function getAction()
    {
        $action = ActionManager::rebuildAction($this->actionEncoded);
        $action->action_id = $this->actionId;
        return $action;
    }

    public function setAction(ActionCommand $action)
    {
        $this->actionEncoded = ActionManager::serializeAction($action);
    }

    public function replaceAction(ActionCommand $action)
    {
        $this->actionEncoded = ActionManager::serializeAction($action);
        if (strlen($this->actionEncoded) > self::MAX_ACTION_JSON_LENGTH) {
            throw new \BgaSystemException("Serialized Action JSON is too long!");
        }
    }

    public function __construct($data)
    {
        if (is_object($data)) {
            $this->setAction($data);
        } else if ($data) {
            $this->actionId = $data["action_id"];
            $this->actionEncoded = $data["action_json"];
        }
    }
}

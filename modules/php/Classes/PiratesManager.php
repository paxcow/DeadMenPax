<?

namespace BGA\Games\DeadMenPax;

class PiratesManager {
    private static ?self $instance = null;
    private DBManager $db; // DB manager;
    public array $pirates = [];
    private RoomTilesManager $boardManager;


    private function __construct($board)
    {
        $this->db = DBManagerRegister::addManager("player", Pirate::class);
        $this->boardManager = $board;
        $pirates = $this->db->getAllObjects();
    }

    public static function init(RoomTilesManager $board): self
    {
        return self::$instance ??= new self($board);
    }

    public static function moveToLocation(int $pirateId, int $toPosIx, int $toPosY){
        [$startingPosX, $startingPosX] = self::$pirates[$pirateId]->getPosition();

        
    }

}
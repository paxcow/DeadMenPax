class PlayerBoard {

    constructor(private game: DeadMenPax) {}
  
    public init(targetDiv:Element, player:any ) {
        //create the board
        let board = document.createElement("div");
        board.id = "board_"+player.id;
        board.classList.add("player_board");
        targetDiv.insertAdjacentElement("beforeend",board);

        //create the fatigue dial
        let dial = document.createElement("div");
        dial.id = "fatigue_"+player.id;
        dial.classList.add("fatigue_dial");
        board.appendChild(dial);
        
        //create the battle marker posisitons
        for(let i=1; i<=5; i++){
            let battlestrenght = document.createElement("div");
            battlestrenght.id = "battle_"+i+"_"+player.id;
            battlestrenght.classList.add("battle_"+i);
            board.appendChild(battlestrenght);
        }

    }

    
}
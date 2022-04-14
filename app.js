const game = (
    
    function() {
        const player1 = Player('X');
        const player2 = Player('O');
        let playerInTurn;
        let round;
        let ended;

        const start = function() {
            this.playerInTurn='1';
            this.round=0;
            this.ended=false;
            gameBoard.reset();
            DOMController.updateDOM();
            DOMController.addClickHandlers();
        }

        const declareWinner = function(tiles) {
            let isWinner = false;
            for(let tileNo=0;tileNo<3;tileNo++) {
                isWinner ||= tiles[tileNo*3]==tiles[tileNo*3+1] && tiles[tileNo*3+1]==tiles[tileNo*3+2] && tiles[tileNo*3]!='';
                isWinner ||= tiles[tileNo]==tiles[tileNo+3] && tiles[tileNo+3]==tiles[tileNo+6] && tiles[tileNo]!='';
            }

            isWinner ||= tiles[0]==tiles[4] && tiles[4]==tiles[8]  && tiles[0]!='';
            isWinner ||= tiles[2]==tiles[4] && tiles[4]==tiles[6] && tiles[2]!='';

            return isWinner;

        }
        return {
            player1, 
            player2,
            start,
            ended,
            declareWinner,
            round,
            playerInTurn
        };
    }
)();


const DOMController = (
    function() {
        const addClickHandlers = function() {
            const domSquare = document.querySelectorAll('.tile')
            domSquare.forEach(
                (element, index) => {
                    element.addEventListener('click', () => {if(game.playerInTurn=='1') game.player1.move(index)})
                }
            )
            const resetBtn = document.querySelector('#resetBtn');
            resetBtn.addEventListener('click', () => game.start());
;        }

        const updateDOM = function() {
            gameBoard.tiles.forEach(
                (element, index) => {
                    document.querySelector('#tile'+(index+1)).innerHTML = element;
                }
            );
        }

        return {addClickHandlers, updateDOM};
    }

)();



const gameBoard = (
    function() {
        const tiles = new Array(9);
        const reset = function() {
            tiles.fill('');
        };
        return {
            tiles, reset
        };
    }
)();


const CPULogic = (function() {
    const calculateNextTile = function(tiles) {
        let perTileCalculation = [];
        let childs = calculateChilds(tiles, 'O');
        let childsIndex = 0;
        tiles.forEach(function(tile) {
            if(tile=='') {
                perTileCalculation.push(minmax(childs[childsIndex],1, false));
                childsIndex++;
            } else {
                perTileCalculation.push(-1*Number.MAX_SAFE_INTEGER);
            }
        })
        console.log(perTileCalculation);
        return perTileCalculation.findIndex((element) => element ==  Math.max(...perTileCalculation) );

    };



    const minmax = function(tiles, depth, maximizingPlayer) {
        const infinity = Number.MAX_SAFE_INTEGER;
        
        if(depth==0 || game.declareWinner(tiles)) {
            
            return staticEvaluation(tiles);
        }
        const childs = calculateChilds(tiles, maximizingPlayer?'O':'X');
        if(maximizingPlayer) {
            let maxEval = -1*infinity;
            
            childs.forEach(function(child) {
                maxEval = Math.max(maxEval,minmax(child, depth-1, false));
            })
            return maxEval;
        } else {
            let minEval = infinity;
            childs.forEach(function(child) {
                minEval = Math.min(minEval,minmax(child, depth-1, true));
            })
            return minEval;
        }
    };

    const calculateChilds = function (tiles, symbol) {
        let returnArray = [];
        for(let i = 0; i < tiles.length;i++) {
            if(tiles[i]=='') {
                const child = [...tiles];
                child[i] = symbol;
                returnArray.push(child);
            }
        } 
        return returnArray;
    }

    const staticEvaluation = function(tiles) {
        let result = 0;
        for(let tileNo=0;tileNo<3;tileNo++) {
            result += calculateLine(tiles[tileNo*3],tiles[tileNo*3+1],tiles[tileNo*3+2],'X','O');
            result += calculateLine(tiles[tileNo],tiles[tileNo+3],tiles[tileNo+6],'X','O');
        }
        result += calculateLine(tiles[0],tiles[4],tiles[8],'X','O');
        result += calculateLine(tiles[2],tiles[4],tiles[6],'X','O');
        return result;
        
    };

    const calculateLine = function(tile1, tile2, tile3, playerSymbol, CPUsymbol) {
        let result = 0;
        //when one symbol is present
        if((tile1==CPUsymbol && tile2=='' && tile3=='')||(tile1=='' && tile2==CPUsymbol && tile3=='')||(tile1=='' && tile2=='' && tile3==CPUsymbol)) {
            result++;

        } 
        
        else if((tile1==playerSymbol && tile2=='' && tile3=='')||(tile1=='' && tile2==playerSymbol && tile3=='')||(tile1=='' && tile2=='' && tile3==playerSymbol)) {
            result--;

        }
        //when two symbols are present
        else if((tile1==CPUsymbol && tile2==CPUsymbol && tile3=='')||(tile1=='' && tile2==CPUsymbol && tile3==CPUsymbol)||(tile1==CPUsymbol && tile2=='' && tile3==CPUsymbol)) {
            result+=10;
        }

        else if((tile1==playerSymbol && tile2==playerSymbol && tile3=='')||(tile1=='' && tile2==playerSymbol && tile3==playerSymbol)||(tile1==playerSymbol && tile2=='' && tile3==playerSymbol)) {
            result-=10;
        }

        //When three symbols are present
        else if(tile1==CPUsymbol && tile2==CPUsymbol && tile3==CPUsymbol) result+=100;
        else if(tile1==playerSymbol && tile2==playerSymbol && tile3==playerSymbol) result-=100;
        return result;
    }

    return {calculateNextTile};
})()


function Player(symbol) {
    const move = function(tileNum) {
        if(!game.ended && gameBoard.tiles[tileNum]=='') {
            gameBoard.tiles.splice(tileNum,1,symbol);
            advanceTurn();
            moveCPU();
        }
        
    }

    const moveCPU = function() {
        const tileNum = CPULogic.calculateNextTile(gameBoard.tiles);
        if(!game.ended && gameBoard.tiles[tileNum]=='') {
            gameBoard.tiles.splice(tileNum,1,'O');
            advanceTurn();
        }
    }

    const advanceTurn = function() {
        game.playerInTurn = game.playerInTurn=='1'?'2':'1';
        game.round++;
        if(game.declareWinner(gameBoard.tiles)) game.ended=true;
        DOMController.updateDOM();
        console.log('turn of player' + game.playerInTurn)
    }
    return {
        move
    };
}


game.start();
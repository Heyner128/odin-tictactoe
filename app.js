const game = (
    
    function() {
        //TO SOLVE it can't be two CPUs 
        const player1 = Player('X', false);
        const player2 = Player('O', true);
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
            //fix safari error 
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);


        }

        const reset = function() {
            this.playerInTurn='1';
            this.round=0;
            this.ended=false;
            gameBoard.reset();
            DOMController.updateDOM();
        }

        const declareWinner = function(tiles) {
            let symbol = '';
            for(let tileNo=0;tileNo<3;tileNo++) {
                const lineH = tiles[tileNo*3]==tiles[tileNo*3+1] && tiles[tileNo*3+1]==tiles[tileNo*3+2] && tiles[tileNo*3]!=''
                if(lineH) symbol=tiles[tileNo*3];
                const lineV = tiles[tileNo]==tiles[tileNo+3] && tiles[tileNo+3]==tiles[tileNo+6] && tiles[tileNo]!='';
                if(lineV) symbol=tiles[tileNo];
            }
            const lineD = tiles[0]==tiles[4] && tiles[4]==tiles[8]  && tiles[0]!='';
            if(lineD) symbol=tiles[0];
            const lineDR = tiles[2]==tiles[4] && tiles[4]==tiles[6] && tiles[2]!='';
            if(lineDR) symbol=tiles[2];
            return symbol;

        }

        const advanceTurn = function() {
            game.playerInTurn = game.playerInTurn=='1'?'2':'1';
            game.round++;
            const winner  = game.declareWinner(gameBoard.tiles);
            console.log(winner);
            if(winner!='') {
                console.log('game ended');
                game.ended=true;
                if(winner==player1.symbol) player1.wins++;
                if(winner==player2.symbol) player2.wins++;
            }
            DOMController.updateDOM();
            console.log('turn of player' + game.playerInTurn)
        }


        return {
            player1, 
            player2,
            advanceTurn,
            start,
            reset,
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
                    element.addEventListener('click',() =>  tileClickHandler(index));
                }
            )
            const resetBtn = document.querySelector('#resetBtn');
            resetBtn.addEventListener('click',() => game.reset());
;        }


        const tileClickHandler = function(tileIndex) {
            if(game.playerInTurn==1) {
                game.player1.move(tileIndex);
                if(game.player2.isCPU && game.playerInTurn==2) game.player2.move(tileIndex);
            } else {
                game.player2.move(tileIndex);
                if(game.player1.isCPU && game.playerInTurn==1) game.player1.move(tileIndex);

            }
        }

        const updateDOM = function() {
            gameBoard.tiles.forEach(
                (element, index) => {
                    document.querySelector('#tile'+(index+1)).innerHTML = element;
                }
            );
            //TO SOLVE 
            document.querySelector('#winsPlayer').innerHTML = game.player1.wins;
            document.querySelector('#winsCPU').innerHTML = game.player2.wins;
            // TO SOLVE

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


const CPULogic = (function(CPUSymbol, oponentSymbol) {
    const calculateNextTile = function(tiles) {
        let perTileCalculation = [];
        let childs = calculateChilds(tiles, CPUSymbol);
        let childsIndex = 0;
        tiles.forEach(function(tile) {
            if(tile=='') {
                perTileCalculation.push(minmax(childs[childsIndex],1, false));
                childsIndex++;
            } else {
                perTileCalculation.push(-1*Number.MAX_SAFE_INTEGER);
            }
        })
        return perTileCalculation.findIndex((element) => element ==  Math.max(...perTileCalculation) );

    };

    const minmax = function(tiles, depth, maximizingPlayer) {
        const infinity = Number.MAX_SAFE_INTEGER;
        
        if(depth==0 || game.declareWinner(tiles)!='') {
            
            return staticEvaluation(tiles);
        }
        const childs = calculateChilds(tiles, maximizingPlayer?CPUSymbol:oponentSymbol);
       if(!maximizingPlayer) {
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
            result += calculateLine(tiles[tileNo*3],tiles[tileNo*3+1],tiles[tileNo*3+2],oponentSymbol,CPUSymbol);
            result += calculateLine(tiles[tileNo],tiles[tileNo+3],tiles[tileNo+6],oponentSymbol,CPUSymbol);
        }
        result += calculateLine(tiles[0],tiles[4],tiles[8],oponentSymbol,CPUSymbol);
        result += calculateLine(tiles[2],tiles[4],tiles[6],oponentSymbol,CPUSymbol);
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
})(game.player1.isCPU?game.player1.symbol:game.player2.symbol,!game.player1.isCPU?game.player1.symbol:game.player2.symbol)


function Player(symbol, isCPU) {
    const move = function(tileNum) {
        if(isCPU) tileNum = CPULogic.calculateNextTile(gameBoard.tiles);
        if(!game.ended && gameBoard.tiles[tileNum]=='') {
            gameBoard.tiles.splice(tileNum,1,symbol);
            game.advanceTurn();
        }
        
    }

    const wins = 0;

    
    return {
        move, symbol, isCPU, wins
    };
}


game.start();
"use strict";
function handleEvent(event) {
	if (gameState === "GAME_START") {
		gameStartHandler(event);
	} else if (gameState === "GAME_RUNNING") {
		gameHandler(event);
	} else if (gameState === "GAME_OVER") {
		gameOverHandler(event);
	}
}

//handle keyboard events while game is in start screen and instructions
function gameStartHandler(event) {
	if (event.type === "keydown") {
	}
	if (event.type === "keyup") {
		switch(pageIndex) {
			case 0:
			if (event.key === "n") { //next page
				pageIndex += 1;
			}
			// if (event.key === "i") { //toggle info
			//    if (isShowingInfo) {
			//       isShowingInfo = false;
			//    } else {
			//       isShowingInfo = true;
			//    }
			// }
			break;
			case 1:
			if (event.key === "n") { //next page
				pageIndex += 1;
			}
			if (event.key === "b") { //previous page
				pageIndex -= 1;
			}
			break;
			case 2:
			if (event.key === "n") { //start game
				gameState = "GAME_RUNNING";
			}
			if (event.key === "b") { //previous page
				pageIndex -= 1;
			}
			break;
			default:
			break;
		}
	}
}

//handle keyboard events while game is running
function gameHandler(event) {
	/*keydown events*/
	if (event.type === "keydown") {
		//Player 1
		if (event.key === "a") {
			player1.setMoveLeft(true);
		}
		if (event.key === "d") {
			player1.setMoveRight(true);
		}
		if (event.key === "w") {
			player1.setMoveUp(true);
		}
		if (event.key === "s") {
			player1.setMoveDown(true);
		}
		if (event.key === "q") {
			player1.setRotCCW(true);
		}
		if (event.key === "e") {
			player1.setRotCW(true);
		}
		if (event.key === "c") {
			player1.tryCannon();
		}
		if (event.key === "v") {
			player1.tryShield();
		}
		//Player 2
		if (event.key === "j") {
			player2.setMoveLeft(true);
		}
		if (event.key === "l") {
			player2.setMoveRight(true);
		}
		if (event.key === "i") {
			player2.setMoveUp(true);
		}
		if (event.key === "k") {
			player2.setMoveDown(true);
		}
		if (event.key === "u") {
			player2.setRotCCW(true);
		}
		if (event.key === "o") {
			player2.setRotCW(true);
		}
		if (event.key === "[") {
			player2.tryCannon();
		}
		if (event.key === "]") {
			player2.tryShield();
		}
	}
	/*keyup events*/
	if (event.type === "keyup") {
		//Player 1
		if (event.key === "a") {
			player1.setMoveLeft(false);
		}
		if (event.key === "d") {
			player1.setMoveRight(false);
		}
		if (event.key === "w") {
			player1.setMoveUp(false);
		}
		if (event.key === "s") {
			player1.setMoveDown(false);
		}
		if (event.key === "q") {
			player1.setRotCCW(false);
		}
		if (event.key === "e") {
			player1.setRotCW(false);
		}
		if (event.key === "c") {
			player1.fireCannon();
		}
		if (event.key === "v") {
			player1.cancelShield();
		}
		//Player 2
		if (event.key === "j") {
			player2.setMoveLeft(false);
		}
		if (event.key === "l") {
			player2.setMoveRight(false);
		}
		if (event.key === "i") {
			player2.setMoveUp(false);
		}
		if (event.key === "k") {
			player2.setMoveDown(false);
		}
		if (event.key === "u") {
			player2.setRotCCW(false);
		}
		if (event.key === "o") {
			player2.setRotCW(false);
		}
		if (event.key === "[") {
			player2.fireCannon();
		}
		if (event.key === "]") {
			player2.cancelShield();
		}
	}
}

//handle keyboard events while game is over
function gameOverHandler(event) {
	if (event.type === "keydown") {
	}
	if (event.type === "keyup") {
		if (event.key === "y") {
			restartGame();  //reset game, skip start screen
		}
		if (event.key === "n") {
			resetGame(); //reset game to start screen
		}
	}
}

//monitor document's focus, and release any key booleans if document looses focus
function monitorFocus() {
	if (documentHasFocus) {
		if (document.hasFocus() === false && gameState === "GAME_RUNNING") {
			documentHasFocus = false;
			player1.releaseKeys();
			player2.releaseKeys();
		}
	} else if (!documentHasFocus) {
		if (document.hasFocus() === true) {
			documentHasFocus = true;
		}
	}
}
/* end Event Handler functions */

/* Event Listeners*/
document.addEventListener("keydown", function(event) {
	handleEvent(event);
});
document.addEventListener("keyup", function(event) {
	handleEvent(event);
});

//Toggle the countdownTimer on or off
// function toggleTimer() {
//   if (gameState === "GAME_RUNNING") {
//       if (timerRate === 1) {
//          timerRate = 0;
//       } else if (timerRate === 0) {
//          timerRate = 1;
//       }
//   }
// }
document.addEventListener("click", function(event) {
	if (gameState === "GAME_START" && pageIndex == 0) {
		pageIndex += 1;
	}
});

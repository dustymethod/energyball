"use strict";
function setup() {
	resetGame();
	ctx.fillStyle = "rgba(18, 18, 25, 1)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	documentHasFocus = true;
	window.requestAnimationFrame(tick);
}


//reset and start game
function restartGame() {
	resetGame();
	gameState = "GAME_RUNNING";
}

//reset game to start screen. reset and reassign game variables
function resetGame() {
	ship1 = null;
	ship2 = null;
	player1 = null;
	player2 = null;
	ship1 = new Ship(canvas.width/3, canvas.height/2, 0, -1); //x, y, rotation, player index
	ship2 = new Ship(canvas.width/3*2, canvas.height/2, 180, 1);
	player1 = new Player(ship1);
	player2 = new Player(ship2);
	ship1.setColor(new Color(65, 215, 255));
	ship2.setColor(new Color(255, 60, 50));
	ship1.spawnRespawnParticle(ship1.location.x, ship1.location.y);
	ship2.spawnRespawnParticle(ship2.location.x, ship2.location.y);
	countdownTimer = TIME_LIMIT;
	gameState = "GAME_START";
	isShowingInfo = false;
	pageIndex = 0;
}

//main game loop, called every frane. run and display appropriate game screens
function tick() {
	monitorFocus();
	if (gameState === "GAME_START") {
		tickGameStart();
	} else if (gameState === "GAME_RUNNING") {
		tickGame();
	} else if (gameState === "GAME_OVER") {
		tickGameOver();
	}
	window.requestAnimationFrame(tick);
}

//update and display game elements
function tickGame() {
	player1.tick();
	player2.tick();
	
	//Physics "engine" - detect collision between ships and their projectiles.
	checkProjectileCollision(ship1, ship2);
	checkProjectileCollision(ship2, ship1);
	
	//detect collision between ships
	if (isOverlapping(ship1.location, ship1.getRadius(), ship2.location, ship2.getRadius())) {
		calculateBounce(ship1, ship2);
	}
	repel(ship1, ship2);
	repel(ship2, ship1);
	
	
	countdownTimer -= timerRate;
	if (countdownTimer <= 0) {
		gameState = "GAME_OVER";
	}
	
	/* Display */
	drawBackground();
	ship1.display();
	ship2.display();
	ship1.displayParticles();
	ship2.displayParticles();
	
	//health bars
	const margin = 20;
	displayHealthBar(0 + margin, 0 + margin, ship1.health, ship1.maxHealth, 1, ship1.color);
	displayHealthBar(canvas.width - margin, 0 + margin, ship2.health, ship2.maxHealth, -1, ship2.color);
	displayScore();
	
	//countdown timer
	if (timerRate === 1) {
		ctx.fillStyle = "#00ffff";
		drawText("-" + countdownTimer + "-", canvas.width/2-1, 34, 30, "center");
		ctx.fillStyle = textColor;
		drawText("-" + countdownTimer + "-", canvas.width/2, 35, 30, "center");
	} else {
		// ctx.fillStyle = textColor;
		// drawText("timer disabled", canvas.width/2, 35, 25, "center");
		//drawTextFlicker("- demo mode -", canvas.width/2, 35, 20, "center");
	}
	
	//blue background overlay
	ctx.globalCompositeOperation = "color-dodge";
	ctx.drawImage(overlay, 0, 0);
	ctx.globalCompositeOperation = "overlay";
	ctx.fillStyle = "rgba(147, 255, 138, 0.1)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalCompositeOperation = "source-over";
}

//display start & instruction screens
function tickGameStart() {
	drawBackground();
	let flicker = getRandom(0, 0.01);
	ctx.fillStyle = "rgba(0, 0, 255, "+ flicker +")"; //slight background flicker
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = textColor;
	const line = 30;
	switch(pageIndex) {
		case 0:
		// if (isShowingInfo) {
		//    showGameInfo();
		// } else {
		drawTextFlicker("- energyball -", canvas.width/2, canvas.height/2, 35, "center");
		ctx.fillStyle = "rgba(100, 150, 225, 0.6)";
		// drawText("[i] info", canvas.width -30, canvas.height -30, 16, "right");
		drawTextFlicker("[n] next", canvas.width/2, canvas.height -50, 18, "center");
		// }
		
		showInfo2();
		break;
		case 1:
		drawText("- Instructions -", canvas.width/2, canvas.height/3, 30, "center");
		drawText("Deal damage, score points.", canvas.width/2, canvas.height/2, 18, "center");
		drawText("Bring the other player's health to zero for more points.", canvas.width/2, canvas.height/2 + line, 18, "center");
		drawText("The player with the most points wins.", canvas.width/2, canvas.height/2 + line * 2, 18, "center");
		drawText("[b] back", 50, canvas.height - 50, 18, "left");
		drawTextFlicker("[n] next", canvas.width/2, canvas.height -50, 18, "center");
		break;
		case 2:
		drawText("- Controls -", canvas.width/2, canvas.height/5, 30, "center");
		ctx.save();
		//player 1 instructions
		ctx.translate(canvas.width/3, 0);
		ctx.fillStyle = ship1.color.get();
		drawText("Player 1", 0, canvas.height/3, 18, "center");
		ctx.fillStyle = textColor;
		drawText("Move: [wasd]", 0, canvas.height/3 + line * 1, 18, "center");
		drawText("Aim: [qe]", 0, canvas.height/3 + line * 2, 18, "center");
		drawText("Charge/Fire: [c]", 0, canvas.height/3 + line * 3, 18, "center");
		drawText("Shield: [v]", 0, canvas.height/3 + line * 4, 18, "center");
		//player 2 instructions
		ctx.translate(canvas.width/3, 0);
		ctx.fillStyle = ship2.color.get();
		drawText("Player 2", 0, canvas.height/3, 18, "center");
		ctx.fillStyle = textColor;
		drawText("Move: [ijkl]", 0, canvas.height/3 + line * 1, 18, "center");
		drawText("Aim: [uo]", 0, canvas.height/3 + line * 2, 18, "center");
		drawText("Charge/Fire: [[]", 0, canvas.height/3 + line * 3, 18, "center");
		drawText("Shield: []]", 0, canvas.height/3 + line * 4, 18, "center");
		ctx.restore();
		drawText("[b] back", 50, canvas.height - 50, 18, "left");
		drawTextFlicker("[n] start game", canvas.width/2, canvas.height - 50, 18, "center");
		break;
		default:
		drawText("page error", canvas.width/2, canvas.height/2 + 30, 30, "center");
		break;
	}
}

//display game over screen
function tickGameOver() {
	//determine winning player, and display scores
	drawBackground();
	const line = 30;
	let score1 = ship1.getScore();
	let score2 = ship2.getScore();
	ctx.fillStyle = textColor;
	drawText("Winner: ", canvas.width/2, canvas.height/7, 35, "center");
	let winner = "";
	if (score1 > score2) {
		winner = "- Player 1 -";
		ctx.fillStyle = ship1.color.get();
	} else if (score1 < score2) {
		winner = "- Player 2 -";
		ctx.fillStyle = ship2.color.get();
	} else {
		winner = "- Tie -";
	}
	drawText("" + winner, canvas.width/2, canvas.height/6 + line*1, 30, "center");
	
	//display scores
	ctx.fillStyle = textColor;
	drawText("Damage", canvas.width/2, canvas.height/3 +line*3, 25, "center");
	drawText("Kills x100", canvas.width/2, canvas.height/3 +line*2, 25, "center");
	drawText("Score", canvas.width/2, canvas.height/3 +line*4, 25, "center");
	ctx.fillStyle = textColor;
	drawText("play again?", canvas.width/2, canvas.height/4*3 + line * 2, 25, "center");
	drawText("[y] yes [n] no", canvas.width/2, canvas.height/4*3 + line * 3, 25, "center");
	
	ctx.save();
	ctx.translate(canvas.width/2, 0);
	let killPts = 100;
	let offset = 200;
	ctx.fillStyle = ship1.color.get();
	drawText("Player 1", -offset, canvas.height/3, 28, "right");
	drawText(ship1.damageDealt, -offset, canvas.height/3 + line*3, 28, "right");
	drawText(ship1.kills*killPts, -offset, canvas.height/3 + line*2, 28, "right");
	drawText(ship1.getScore(), -offset, canvas.height/3 + line*4, 28, "right");
	
	ctx.fillStyle = ship2.color.get();
	drawText("Player 2", offset, canvas.height/3, 28, "left");
	drawText(ship2.damageDealt, offset, canvas.height/3 + line*3, 28, "left");
	drawText(ship2.kills*killPts, offset, canvas.height/3 + line*2, 28, "left");
	drawText(ship2.getScore(), offset, canvas.height/3 + line*4, 28, "left");
	ctx.restore();
}

function showGameInfo() { //game info toggled via bool isShowingInfo
	drawBackground();
	ctx.fillStyle = "rgba(100, 150, 225, 0.6)";
	let line = 30;
	drawText("Amanda Chan", canvas.width/2, canvas.height/2, 20, "center");
	drawText("CPSC 1045 - Web Programming", canvas.width/2, canvas.height/2 +line, 20, "center");
	drawText("2016", canvas.width/2, canvas.height/2 +line*2, 20, "center");
	drawText("[i] back", canvas.width -30, canvas.height -30, 16, "right");
	showInfo()
}
function showInfo2() {
	ctx.fillStyle = "rgba(100, 150, 225, 0.6)";
	let line = 20;
	const startX = 15;
	const startY = 85;
	const size = 15;
	drawText("CPSC 1045 - Web Programming", startX, startY - line*3, size, "left");
	drawText("Amanda Chan", startX, startY - line * 2, size, "left");
	drawText("2016", startX, startY - line*1, size, "left");
	// drawText("[i] back", canvas.width -30, canvas.height -30, 16, "right");
};

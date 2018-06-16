"use strict";
function setFillColor(color, a = color.a) {
	ctx.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + a + ")";
}

function setStrokeColor(color, a = color.a) {
	ctx.strokeStyle = "rgba("+color.r+","+color.g+","+color.b+","+ a+")";
}

//returns a getRandom number between a min and max range
function getRandom(min, max) { //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	return Math.random() * (max - min) + min;
}

function drawBackground() {
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function displayHealthBar(x, y, value, maxValue, dir, color) {
	value = value / maxValue * healthBarWidth;
	setFillColor(color, 0.5);
	ctx.fillRect(x, y, (value*dir), healthBarHeight);
	setStrokeColor(color, 1);
	ctx.strokeRect(x, y, healthBarWidth * dir, healthBarHeight);
}

function displayScore() {
	const margin = 30;
	ctx.fillStyle = ship1.color.get();
	drawText(ship1.getScore(), margin, canvas.height - margin, 30, "left");
	ctx.fillStyle = ship2.color.get();
	drawText(ship2.getScore(), canvas.width - margin, canvas.height - margin, 30, "right");
}

function spawnScoreParticle(player, dir) {
	const margin = 55;
	const xOffset = (canvas.width/2 - margin) * dir;
	player.pScoreKill.spawn(canvas.width/2 + xOffset, canvas.height - margin);
}

function drawText(text, x, y, scale, align) {
	ctx.font = scale + "px courier";
	ctx.textAlign = align;
	ctx.fillText(text, x, y);
}

//draw text with a flickering effect
function drawTextFlicker(text, x, y, scale, align) {
	let xo = getRandom(0, 1); //x and y offset
	let yo = getRandom(0, 1);
	ctx.font = scale + "px courier";
	ctx.textAlign = align;
	ctx.fillStyle = "#ff0000"; //red
	ctx.fillText(text, x+0.5, y-0.5);
	ctx.fillStyle = "#00ffff"; //cyan
	ctx.fillText(text, x-1, y+1);
	ctx.fillStyle = textColor;
	ctx.fillText(text, x+xo, y+yo);
}
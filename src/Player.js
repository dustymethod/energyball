"use strict";
//The Player class recieves input from an event handler, and calls its ship's appropriate functions.
class Player {
	constructor(ship) {
		this.ship = ship; //reference to controlled ship
		this.moveLeft = false;
		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;
		this.rotateCW = false;
		this.rotateCCW = false;
	}
	tick() {
		this.ship.tick();
		if (this.moveLeft) {
			this.ship.move(-1, 0); //left
		}
		if (this.moveRight) {
			this.ship.move(1, 0); //right
		}
		if (this.moveUp) {
			this.ship.move(0, -1); //up
		}
		if (this.moveDown) {
			this.ship.move(0, 1); //down
		}
		if (this.rotateCCW) {
			this.ship.rotate(-1); //rotate ccw
		}
		if (this.rotateCW) {
			this.ship.rotate(1); //rotate cw
		}
	}
	setMoveLeft(bool) {
		this.moveLeft = bool;
	}
	setMoveRight(bool) {
		this.moveRight = bool;
	}
	setMoveUp(bool) {
		this.moveUp = bool;
	}
	setMoveDown(bool) {
		this.moveDown = bool;
	}
	setRotCW(bool) {
		this.rotateCW = bool;
	}
	setRotCCW(bool) {
		this.rotateCCW = bool;
	}
	tryCannon() {
		this.ship.tryCannon();
	}
	fireCannon() {
		this.ship.fire();
	}
	cancelCannon() {
		this.ship.cancelCannon();
	}
	tryShield() {
		this.ship.tryShield();
	}
	cancelShield() {
		this.ship.cancelShield();
	}
	releaseKeys() {
		this.moveLeft = false;
		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;
		this.rotateCW = false;
		this.rotateCCW = false;
		this.ship.cancelCannon();
		this.ship.cancelShield();
	}
}

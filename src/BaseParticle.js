"use strict";
//Base Particle class
class BaseParticle {
	constructor() {
		this.location = new Vector(0, 0);
		this.velocity = new Vector(0, 0);
		this.rotation = 0;
		this.maxLife = 0;
		this.life = 0;
		this.decayRate = 0;
		this.radius = 0;
		this.color = new Color(255, 255, 255);
		this.isActive = false;
	}
	
	isOutOfBounds() {
		if (this.location.x - this.radius > canvas.width) {
			return true;
		}
		if (this.location.x + this.radius < 0) {
			return true;
		}
		if (this.location.y - this.radius > canvas.height) {
			return true;
		}
		if (this.location.y + this.radius < 0) {
			return true;
		}
		return false;
	}
	
	setColor(color, a = color.a) {
		this.color.setColor(color, a);
	}
	
	spawn(x, y) {
		console.log("super BaseParticle: spawn(x, y)");
	}
}
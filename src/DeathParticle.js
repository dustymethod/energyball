"use strict";
//particle spawned when a ship is destroyed
class DeathParticle extends BaseParticle {
	constructor() {
		super();
		this.radius = 25; //set to ship radius
		this.maxLife = 100;
		this.arcLength = 0;
		this.lineWidth = 0;
		this.reset();
	}
	
	reset() {
		this.velocity.set(getRandom(-1, 1), getRandom(-1, 1));
		const spd = getRandom(0.1, 1.5);
		this.velocity.mult(spd);
		this.rotation = getRandom(0, 360);
		this.rotationSpeed = getRandom(-0.5, 1);
		this.arcLength = getRandom(0, 0.35);
		this.lineWidth = getRandom(1, 3);
		this.life = this.maxLife;
		this.decayRate = getRandom(0.1, 5);
		this.isActive = false;
	}
	
	spawn(x, y) {
		if (!this.isActive) {
			this.location.set(x, y);
			this.isActive = true;
		}
	}
	
	tick() {
		if (this.isActive) {
			this.location.add(this.velocity);
			this.rotation += this.rotationSpeed;
			this.life -= this.decayRate;
			if (this.life <= 0) {
				this.reset();
			}
		}
	}
	
	display() {
		if (this.isActive) {
			const alpha = this.life / this.maxLife;
			setStrokeColor(this.color, alpha);
			ctx.save();
			ctx.translate(this.location.x, this.location.y);
			ctx.rotate(this.rotation * Math.PI/180);
			ctx.beginPath();
			ctx.arc(0, 0, this.radius, 0, this.arcLength * 2*Math.PI);
			ctx.lineWidth = this.lineWidth;
			ctx.stroke();
			ctx.lineWidth = 1;
			ctx.closePath();
			ctx.restore();
		}
	}
}
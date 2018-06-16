"use strict";
//Particle spawned when a ship is respawned
class SpawnParticle extends BaseParticle  {
	constructor() {
		super();
		this.maxLife = 100;
		this.maxGrowLife = 50;
		this.decayRate = 1.2;
		this.glowRadius = 40;
		this.glowAlpha = 0.12;
		this.reset();
	}
	reset() {
		this.life = this.maxLife;
		this.growLife = this.maxGrowLife;
		this.shrinkRadius = 35;
		this.growRadius = 35;
		this.isActive = false;
	}
	spawn(x, y) {
		this.location.set(x, y);
		this.isActive = true;
	}
	tick() {
		if (this.isActive) {
			this.life -= this.decayRate;
			this.growLife -= this.decayRate;
			let growRate = 1;
			this.growRadius += growRate;
			if (this.life <= 0 || this.isOutOfBounds()) {
				this.reset();
			}
		}
	}
	
	lifeLeft() {
		return this.life / this.maxLife;
	}
	
	display() {
		if (this.isActive) {
			const layers = 10;
			for (let i = 1; i <= layers; i += 1) {
				let flicker = getRandom(0, 0.1);
				let alpha = this.glowAlpha * this.lifeLeft() - flicker;
				setFillColor(this.color, alpha);
				ctx.beginPath();
				ctx.arc(this.location.x, this.location.y, i * this.glowRadius/layers, 0, 2*Math.PI);
				ctx.fill();
				ctx.closePath();
			}
			
			//grow
			setStrokeColor(this.color, this.growLife/this.maxGrowLife);
			ctx.beginPath();
			ctx.arc(this.location.x, this.location.y, this.growRadius, 0, 2*Math.PI);
			ctx.stroke();
			ctx.closePath();
			//shrink
			ctx.beginPath();
			ctx.arc(this.location.x, this.location.y, this.shrinkRadius * this.lifeLeft(), 0, 2*Math.PI);
			ctx.stroke();
			ctx.closePath();
		}
	}
}
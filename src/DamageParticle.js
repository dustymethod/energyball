"use strict";
//particle spawned when a projectile hits a player
class DamageParticle extends BaseParticle {
	constructor() {
		super();
		this.maxLife = 100;
		this.charge = 1;
		this.reset();
	}
	
	reset() {
		this.velocity.set(getRandom(-1, 1), getRandom(-1, 1));
		const spd = 10;
		this.velocity.mult(spd);
		this.decayRate = getRandom(0.1, 5);
		this.life = this.maxLife;
		this.isActive = false;
	}
	
	//setCharge(c) {
	//    this.charge = c;
	//}
	
	spawn(x, y) {
		this.location.set(x, y);
		//this.radius = getRandom(1, 35 * this.charge);
		this.radius = getRandom(1, 8);
		this.isActive = true;
	}
	
	tick() {
		if (this.isActive) {
			this.location.add(this.velocity);
			this.velocity.mult(0.9);
			this.radius *= 0.9;
			this.life -= this.decayRate;
			if (this.life <= 0) {
				this.reset();
			}
		}
	}
	
	display() {
		if (this.isActive) {
			setStrokeColor(this.color, this.life / this.maxLife);
			ctx.beginPath();
			ctx.arc(this.location.x, this.location.y, this.radius, 0, 2*Math.PI);
			ctx.stroke();
			ctx.closePath();
		}
	}
}

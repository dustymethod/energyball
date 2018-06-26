"use strict";
//class used to spawn and update multiple particle systems
class PSEmitter {
	constructor(particleClass, numParticles, numSystems, color) {
		this.particleSystems = [];
		for (let i = 0; i < numSystems; i += 1) {
			this.particleSystems.push(new ParticleSystem(particleClass, numParticles));
		}
		this.setColor(color, color.a);
	}
	
	spawnSystem(x, y) {
		let spawned = false;
		for (let i = 0; i < this.particleSystems.length && !spawned; i += 1) {
			if (!this.particleSystems[i].isActive()) {
				this.particleSystems[i].spawn(x, y);
				spawned = true;
			}
		}
	}
	
	tick() {
		for (let i = 0; i < this.particleSystems.length; i += 1) {
			this.particleSystems[i].tick();
		}
	}
	
	display() {
		for (let i = 0; i < this.particleSystems.length; i += 1) {
			this.particleSystems[i].display();
		}
	}
	
	setColor(color, a = color.a) {
		for (let i = 0; i < this.particleSystems.length; i += 1) {
			this.particleSystems[i].setColor(color, a);
		}
	}
}

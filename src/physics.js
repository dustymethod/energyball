"use strict";
//check if any of a player's projectiles are colliding with opponent.
//apply damage/healing, emit particles, play sound, and add to score.
function checkProjectileCollision(player, opponent) { //player ship, opponent ship
	for (let i = 0; i < player.projectiles.length; i+= 1) {
		let p = player.projectiles[i];
		if (p.isActive && isOverlapping(p.location, p.radius(), opponent.location, opponent.getRadius())) {
			if (opponent.isShielding) {
				opponent.heal(p.getDamage());
				// opponent.spawnDamageParticles(p.location.x, p.location.y);
				player.spawnDamageParticles(p.location.x, p.location.y);
			} else {
				opponent.damage(p.getDamage());
				opponent.applyCollisionForce(p.velocity, p.charge);
				player.addToScore("d", p.getDamage());
				// player.spawnHitParticles(p.location.x, p.location.y, 0.0); //spawn projectle hit particles
				opponent.spawnHitParticles(p.location.x, p.location.y, p.charge); //spawn projectle hit particles
				
				if (opponent.health <= 0) {
					player.addToScore("k", 0);
					spawnScoreParticle(player, player.index);
					opponent.spawnDeathParticles(opponent.location.x, opponent.location.y);
				}
			}
			p.reset();
		}
	}
}

function isOverlapping(locA, rA, locB, rB) { //location & radius of two objects
	const minDist = rA + rB;
	const dist = Math.sqrt((locA.x - locB.x)*(locA.x - locB.x) + (locA.y - locB.y)*(locA.y - locB.y));
	if (dist < minDist) {
		return true;
	}
	return false;
}

//calculate and apply bounce on two objects after a collision
//http://www.gamasutra.com/view/feature/131424/pool_hall_lessons_fast_accurate_.php?page=3
function calculateBounce(A, B) {
	//velocity
	let vecA = new Vector(A.velocity.x, A.velocity.y);
	let vecB = new Vector(B.velocity.x, B.velocity.y);
	const mA = 1;
	const mB = 1;
	let n = new Vector(vecA.x, vecA.y);
	n.sub(vecB);
	n.normalize();
	const a1 = vecA.dot(n);
	const a2 = vecB.dot(n);
	const optimizedP = (2 * Math.abs(a1 - a2)) / (mA + mB);
	let vecAf = new Vector(vecA.x - (n.x * optimizedP * mB), vecA.y - (n.y * optimizedP * mB));
	let vecBf = new Vector(vecB.x + (n.x * optimizedP * mA), vecB.y + (n.y * optimizedP * mA));
	A.velocity.set(vecAf.x, vecAf.y);
	B.velocity.set(vecBf.x, vecBf.y);
}

//Prevent two players from overlapping
function repel(A, B) {
	let locA = new Vector(A.location.x, A.location.y);
	let locB = new Vector(B.location.x, B.location.y);
	const sumRadii = A.getRadius() + B.getRadius();
	const dist = Math.sqrt((locA.x - locB.x)*(locA.x - locB.x) + (locA.y - locB.y) * (locA.y - locB.y));
	const x = locA.x - locB.x;
	const y = locA.y - locB.y;
	let c = new Vector(x, y);
	c.normalize();
	if (dist < sumRadii) {
		A.location.add(c);
	}
}
/* jshint -W119 */
/* jshint -W117 */
/* jshint -W104 */
/* jshint -W097 */
/*
CPSC 1045 Final Project
   Amanda Chan
   version: mar 29 2017

   //Stop or start the countdown timer during gameplay.
   toggleTimer(){};

*/

"use strict";
/* Global variables */
const canvas = document.getElementById("idCanvas");
const ctx = canvas.getContext("2d");
let documentHasFocus = false;

// other conststans
const healthBarHeight = 10;
const healthBarWidth = 200;

//Images
let overlay = new Image(); //bluish overlay
overlay.src = "images/overlay_005.png";

//Sound
let sGameOver = null; //sound played when game ends

//colors
const backgroundColor = "rgba(19, 18, 25, 0.75)";
const textColor = "#ffeeff";

//Game
const TIME_LIMIT = 4500;
let countdownTimer = 0; //game timer: game ends when timer reaches 0
// let timerRate = 1; //rate countdownTimer ticks
let timerRate = 0; //demo mode

let gameState = "GAME_START"; //Possible states: GAME_RUNNING, AT_STARTSCREEN, GAME_OVER
let pageIndex = 0; //page index for start screen & instructions
let isShowingInfo = false; //show or hide game info with [i] when at the start screen

//Ship and Player class object declarations
let ship1 = null;
let ship2 = null;
let player1 = null;
let player2 = null;
/* end Global variables */

/* Class definitions */

class Color {
   constructor(r, g, b, a = 1) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
   }
   get() {
      return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
   }
   set(r, g, b, a = 1) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
   }
   setColor(color, a = color.a) {
      this.r = color.r;
      this.g = color.g;
      this.b = color.b;
      this.a = a;
   }
}

class Vector {
   constructor(x, y) {
      this.x = x;
      this.y = y;
   }
   set(x, y) {
      this.x = x;
      this.y = y;
   }
   add(v) {
      this.x += v.x;
      this.y += v.y;
   }
   sub(v) {
      this.x -= v.x;
      this.y -= v.y;
   }
   mult(n) {
      this.x *= n;
      this.y *= n;
   }
   dot(v) {
      let dotProduct = (this.x * v.x) + (this.y * v.y);
      return dotProduct;
   }
   getMag() {
      let mag = (this.x * this.x) + (this.y * this.y);
      if (mag >= 0) {
         mag = Math.sqrt(mag);
         return mag;
      } else {
         console.log("getMag error");
         return 0;
      }
   }
   normalize() {
      let mag = this.getMag();
      if (mag > 0) {
         this.x /= mag;
         this.y /= mag;
      } else if (mag === 0) {
      } else {
         console.log("normalize() error");
      }
   }
   //limit the length of this vector. http://forum.libcinder.org/topic/limit-the-magnitude-of-vector
   limit(maxLength) {
      const lengthSquared = (this.x * this.x) + (this.y * this.y);
      if (lengthSquared > maxLength * maxLength && lengthSquared > 0) {
         const ratio = maxLength / Math.sqrt(lengthSquared);
         this.x *= ratio;
         this.y *= ratio;
      }
   }
}

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


//class used to spawn and update multiple particles
class ParticleSystem {
   constructor(particleClass, numParticles) {
      this.particles = [];
      for (let i = 0; i < numParticles; i += 1) {
         this.particles.push(new particleClass());
      }
   }
   isActive() {
      for (let i = 0; i < this.particles.length; i += 1) {
         if (this.particles[i].isActive) {
            return true;
         }
         return false;
      }
   }
   spawn (x, y) {
      if (!this.isActive()) {
         for (let i = 0; i < this.particles.length; i += 1) {
            this.particles[i].spawn(x, y);
         }
      }
   }
   tick() {
      for (let i = 0; i < this.particles.length; i += 1) {
         this.particles[i].tick();
      }
   }
   display() {
      for (let i = 0; i < this.particles.length; i += 1) {
         this.particles[i].display();
      }
   }
   setColor(color, a = color.a) {
      for (let i = 0; i < this.particles.length; i += 1) {
         this.particles[i].setColor(color, a);
      }
   }
}

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


//Particle spawned when a player scores a kill
class ScoreKillParticle extends BaseParticle {
   constructor(color) {
      super();
      this.maxLife = 100;
      this.life = 100;
      this.decayRate = 1;
      this.radius = 30;
      this.gravity = new Vector(0, 0.1);
      this.setColor(color, color.a);
      this.reset();
   }
   reset() {
      this.maxLife = 100;
      this.life = 100;
      this.velocity.set(0, -2);
      this.rotSpeed = 1;
      this.rotation = 0;
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
         this.velocity.add(this.gravity);
         this.rotation += this.rotSpeed;
         this.life -= this.decayRate;
         if (this.isOutOfBounds() || this.life < 0) {
            this.reset();
         }
      }
   }
   display() {
      if (this.isActive) {
         ctx.save();
         ctx.translate(this.location.x, this.location.y);
         ctx.rotate(this.rotation * Math.PI/180);
         ctx.textAlign = "center";
         ctx.fillStyle = this.color.get();
         ctx.fillText("+100", 0, 0);
         ctx.restore();
      }
   }
}

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

//Ship class contains movement, shooting & shielding, rendering, and sound functionality.
//Contains Projectile, Color, Sample, and Emitter objects.
class Ship {
   constructor(x, y, startRot, playerIndex) {
      this.index = playerIndex;
      //Physics
      this.spawnLocation = new Vector(x, y);
      this.location = new Vector(x, y);
      this.friction = new Vector(x, y);
      this.startRot = startRot; // initial rotation
      this.rotation = startRot;
      this.radius = 30;
      this.aimIndicatorOffset = this.radius * 1.4;
      this.movementSpd = 0.26;

      this.velocity = new Vector(0, 0);
      this.acceleration = new Vector(0, 0);
      this.maxSpeed = 7; //const
      this.rotSpeed = 0;

      this.maxHealth = 50; //const
      this.health = this.maxHealth;
      this.maxEnergy = 300; //const
      this.energy = 300;

      //score
      this.kills = 0;
      this.damageDealt = 0;
      this.score = 0;

      //Cannon
      this.charge = 0;
      this.isCharging = false; //true if player is charging cannon
      this.cannonConsumeRate = 0.5; //cannon's rate of energy consumption

      //Shield
      this.isShielding = false; //true if player is using shield
      this.minShieldEnergy = 75; //min energy required to deploy shield
      // this.shieldRadius = 35; //const
      this.shieldRadius = 52;

      //Appearance
      this.color = new Color(0, 255, 255, 1); //default cyan
      this.maxShieldOpacity = 0.1; //const
      this.shieldOpacity = 0;
      this.r = 0;
      this.g = 255;
      this.b = 255;
      this.alpha = 1;

      this.baseBrightness = 0.18;
      this.addnlBrightness = 0.4;
      this.maxGlowOpacity = 0.39;
      this.glowOpacity = 0;
      this.glowIncrRate = 0.004; //TODO: sin curve
      this.glowDecRate = 0.022;

      this.baseGlowRadius = 105;
      this.addnGlowRadius = 0;
      this.maxAddnGlowRad = 25;
      this.glowRadIncr = 0.1;
      this.glowRadDec = 0.5;

      //Projectiles
      this.projectiles = [];
      const numProjectiles = 40;
      for (let i = 0; i < numProjectiles; i += 1) {
         this.projectiles[i] = new Projectile();
         this.projectiles[i].setColor(this.color);
      }

      //Particle emitters
      this.pSpawnEmitter = new PSEmitter(SpawnParticle, 1, 2, this.color); //particle spawned when player respawns
      this.pHitEmitter = new PSEmitter(DamageParticle, 10, 10, this.color); //particles emitted from projctile on hitting enemy
      this.pDamageEmitter = new PSEmitter(DamageParticle, 10, 10, this.color); //particles emitted when damaged
      this.pDeathEmitter = new PSEmitter(DeathParticle, 45, 5, this.color); //particle emitted when ship is destroyed
      this.pScoreKill = new ScoreKillParticle(this.color);
   }

   tick() {
      this.updatePhysics();
      this.updateEnergy();
      // this.updateSounds();
      for (let i = 0; i < this.projectiles.length; i += 1) {
         this.projectiles[i].tick();
      }
      //update particles
      this.pSpawnEmitter.tick();
      this.pHitEmitter.tick();
      this.pDamageEmitter.tick();
      this.pDeathEmitter.tick();
      this.pScoreKill.tick();

      //health
      if (this.health <= 0) {
         this.respawn();
      }
   }

   /** INPUT **/
   move(x, y) {
      let direction = new Vector(x, y);
      direction.mult(this.movementSpd);
      this.acceleration.add(direction);
   }
   rotate(rotDir) {
      const rotForce = 0.2;
      this.rotSpeed += rotForce * rotDir;
   }
   tryCannon() {
      const minRequired = 5;
      if (this.energy > minRequired && !this.isShielding && !this.isCharging) {
         this.isCharging = true;
      }
   }
   cancelCannon() {
      this.isCharging = false;
      this.charge = 0;
   }
   tryShield() {
      if (this.energy > this.minShieldEnergy && !this.isCharging && !this.isShielding) {
         this.deployShield();
      }
   }
   cancelShield() {
      if (this.isShielding) {
         this.isShielding = false;
      }
   }

   /** Gameplay **/
   respawn() {
      this.location.set(this.spawnLocation.x, this.spawnLocation.y);
      this.rotation = this.startRot;
      this.rotSpeed = 0;
      this.velocity.mult(0);
      this.acceleration.mult(0);
      this.health = this.maxHealth;
      this.energy = this.maxEnergy;
      this.charge = 0;
      this.isShielding = false;
      this.isCharging = false;
      this.spawnRespawnParticle(this.location.x, this.location.y);
   }
   heal(hp) {
      this.health += hp;
      if (this.health > this.maxHealth) {
         this.health = this.maxHealth;
      }
   }
   damage(damage) {
      this.health -= damage;
      if (this.health < 0) {
         this.health = 0;
      }
      if (this.health > this.maxHealth) {
         this.health = this.maxHealth;
      }
   }
   addToScore(type, dmg) {
      dmg *= 0.5;
      let dmgPts = Number(dmg.toFixed());
      const killPts = 100;
      switch(type) {
         case "d": //damage
         this.damageDealt += dmgPts;
         break;
         case "h": //heal
         break;
         case "k": //kill
         this.kills =+ 1;
         break;
         default:
         break;
      }
   }
   getScore() {
      const killPts = 100;
      return this.damageDealt + (this.kills * killPts);
   }

   /** PHYSCIS **/
   updatePhysics() {
      this.addFriction();
      this.velocity.add(this.acceleration);
      this.velocity.mult(0.98); //more friction
      this.velocity.limit(this.maxSpeed);
      this.location.add(this.velocity);
      this.acceleration.mult(0);
      this.updateRotation();
      this.bounceOffBounds();
   }
   addFriction() {
      const f = 0.01;
      this.friction.set(this.velocity.x, this.velocity.y);

      this.friction.normalize();
      this.friction.mult(-f);
      this.acceleration.add(this.friction);
   }
   updateRotation() {
      const rotFriction = 0.95;
      const maxRotSpeed = 4;
      if (this.rotation > 360) {
         this.rotation = 0;
      }
      if (this.rotation < 0) {
         this.rotation = 360;
      }
      if (this.rotSpeed > maxRotSpeed) {
         this.rotSpeed = maxRotSpeed;
      }
      if (this.rotSpeed < -maxRotSpeed) {
         this.rotSpeed = -maxRotSpeed;
      }
      this.rotSpeed *= rotFriction;
      this.rotation += this.rotSpeed;
   }
   bounceOffBounds() {
      const bounceFactor = 0.25;
      if (this.location.x > canvas.width - this.radius) {
         this.location.x = canvas.width - this.radius;
         this.velocity.x *= -bounceFactor;
      }
      if (this.location.x < 0 + this.radius) {
         this.location.x = 0 + this.radius;
         this.velocity.x *= -bounceFactor;
      }
      if (this.location.y > canvas.height - this.radius) {
         this.location.y = canvas.height - this.radius;
         this.velocity.y *= -bounceFactor;
      }
      if (this.location.y < 0 + this.radius) {
         this.location.y = 0 + this.radius;
         this.velocity.y *= -bounceFactor;
      }
   }
   getRadius() {
      return this.isShielding ? this.shieldRadius : this.radius;
   }
   applyCollisionForce(dir, force) {
      const minForce = 0.5;
      dir.normalize();
      dir.mult(minForce + force * 5);
      this.acceleration.add(dir);
   }
   spawnHitParticles(x, y, charge) { //TODO: charge does nothing.
      this.pHitEmitter.spawnSystem(x, y);
   }
   spawnDamageParticles(x, y) { //spawn particles when hit by projectile
      this.pDamageEmitter.spawnSystem(x, y);
   }
   spawnDeathParticles(x, y) {
      this.pDeathEmitter.spawnSystem(x, y);
   }
   spawnRespawnParticle(x, y) {
      this.pSpawnEmitter.spawnSystem(x, y);
   }

   /** ENERGY, CANNON and SHIELD **/
   updateEnergy() {
      if (this.isShielding) {
         this.maintainShield();
         let flicker = getRandom(0.1, this.maxGlowOpacity/2);
         this.addnlBrightness = flicker;
         // this.addnGlowRadius = this.maxAddnGlowRad/3;
         if (this.energy <= 0) {
            this.cancelShield();
         }
      } else if (this.isCharging) {
         this.chargeCannon();
         this.addnlBrightness += this.glowIncrRate;
         this.addnGlowRadius += this.glowRadIncr;
         if (this.addnlBrightness > this.maxGlowOpacity) {
            this.addnlBrightness = this.maxGlowOpacity;
         }
         if (this.addnGlowRadius > this.maxAddnGlowRad) {
            this.addnGlowRadius = this.maxAddnGlowRad;
         }
         if (this.energy <= 0) {
            // this.cancelCannon();
            this.fire();
         }
      } else { //else if idle
         this.recharge();
         this.addnlBrightness -= this.glowDecRate;
         this.addnGlowRadius -= this.glowRadDec;
         if (this.addnlBrightness < 0) {
            this.addnlBrightness = 0;
         }
         if (this.addnGlowRadius < 0) {
            this.addnGlowRadius = 0;
         }
      }
      if (this.energy <= 0) {
         // this.cancelCannon();
         // this.cancelShield();
         this.energy = 0;
      }
      if (!this.isShielding) {
         const fadeRate = 0.008;
         this.shieldOpacity -= fadeRate;
      }
   }
   recharge() { //recover energy when idle
      const energyRechargeRate = 1.8;
      if (this.energy < this.maxEnergy) {
         this.energy += energyRechargeRate;
      }
      if (this.energy > this.maxEnergy) {
         this.energy = this.maxEnergy;
      }
   }
   chargeCannon() { //build charge
      const cannonChargeRate = 0.006;
      if (this.energy > 0) {
         this.consumeEnergy(this.cannonConsumeRate);
         this.charge += cannonChargeRate;
         const maxCharge = 1;
         if (this.charge > maxCharge) {
            this.charge = maxCharge;
         }
      }
   }
   fire() {
      if (this.isCharging) {
         let fired = false;
         const minConsume = 5;
         this.consumeEnergy(minConsume);
         //get next inactive (available) projectile in  array to fire
         for (let i = 0; i < this.projectiles.length && fired === false; i += 1) {
            if (!this.projectiles[i].isActive) {
               //calculate direction to fire
               const x = Math.cos(this.rotation * Math.PI/180);
               const y = Math.sin(this.rotation * Math.PI/180);
               const direction = new Vector(x, y);
               this.projectiles[i].fire(this.location, direction, this.charge); //spawn location, direction, charge
               fired = true;
            }
         }
         if (fired === false) {
            console.log("out of bullets");
         }
         this.addCannonRecoil();
         this.cancelCannon(); //reset cannon and charge
      }
   }
   deployShield() {
      this.cancelCannon();
      const minShieldConsumption = 25;
      this.consumeEnergy(minShieldConsumption);
      this.shieldOpacity = this.maxShieldOpacity;
      this.isShielding = true;
   }
   maintainShield() {
      const shieldConsumptionRate = 2.0;
      this.consumeEnergy(shieldConsumptionRate);
   }
   consumeEnergy(e) {
      this.energy -= e;
   }
   addCannonRecoil() {
      const x = Number(Math.cos(this.rotation * Math.PI / 180));
      const y = Number(Math.sin(this.rotation * Math.PI / 180));
      let dir = new Vector(x, y);
      const recoilStrength = 4.5;
      const minRecoil = 0.1;
      dir.mult((-this.charge * recoilStrength) - minRecoil);
      this.acceleration.add(dir);
   }

   /** Display **/
   display() {
      //ship glow
      let glowRadius = this.baseGlowRadius + this.addnGlowRadius;
      let gradient = ctx.createRadialGradient(this.location.x, this.location.y, glowRadius, this.location.x, this.location.y, 0);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      let flicker = getRandom(-0.02, 0.02);
      let alpha = this.baseBrightness + this.addnlBrightness + flicker;
      gradient.addColorStop(1, "rgba("+ this.color.r + "," + this.color.g + "," + this.color.b + "," + alpha + ")");
      ctx.fillStyle = gradient;
      ctx.fillRect(this.location.x - glowRadius, this.location.y - glowRadius, glowRadius*2, glowRadius*2);

      //shield(fill)
      setFillColor(this.color, this.shieldOpacity);
      const layers = 3;
      for (let i = 1; i <= layers; i +=1 ) {
         ctx.beginPath();
         ctx.arc(this.location.x, this.location.y, i * this.shieldRadius/layers, 0, 2*Math.PI);
         ctx.fill();
         ctx.closePath();
      }
      //shield (outline)
      setStrokeColor(this.color, this.shieldOpacity * 10);
      ctx.beginPath();
      ctx.arc(this.location.x, this.location.y, this.shieldRadius + Math.random()*3, 0, 2*Math.PI);
      ctx.lineWidth = getRandom(1, 1.5);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.closePath();

      setFillColor(this.color);
      setStrokeColor(this.color);

      //direction indicator
      ctx.save();
      ctx.translate(this.location.x, this.location.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(this.aimIndicatorOffset, 10);
      ctx.lineTo(this.aimIndicatorOffset + 10, 0);
      ctx.lineTo(this.aimIndicatorOffset, -10);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();

      //projectile charge ring
      ctx.beginPath();
      ctx.arc(this.location.x, this.location.y, this.charge * this.radius + 0.1, 0, 2*Math.PI);
      const a = this.charge * 0.75;
      setFillColor(this.color, a);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();

      //energy level ring
      const mappedEnergy = this.energy/this.maxEnergy;
      let endAngle = -(Math.PI/2) - (2*Math.PI * mappedEnergy);
      ctx.beginPath();
      ctx.arc(this.location.x, this.location.y, this.radius, -Math.PI/2, endAngle, true);
      // ctx.lineWidth = 4.5;
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.closePath();

      //min shield energy indicator
      if (this.energy < this.minShieldEnergy) {
         let startAngle = -(Math.PI/2) - (2*Math.PI * this.minShieldEnergy/this.maxEnergy);//start angle at 12 o clock
         let endAngle2 = -(Math.PI/2) - (2*Math.PI * this.minShieldEnergy/this.maxEnergy + (Math.PI/180 * 5));
         ctx.beginPath();
         ctx.arc(this.location.x, this.location.y, this.radius, startAngle, endAngle2, true);
         ctx.lineWidth = 7;
         ctx.stroke();
         ctx.lineWidth = 1;
         ctx.closePath();
         setStrokeColor(this.color, 0.25);
      } else {
         setStrokeColor(this.color, 1);
      }

      //base ring
      ctx.beginPath();
      ctx.arc(this.location.x, this.location.y, this.radius, 0, 2*Math.PI, true);
      ctx.stroke();
      ctx.closePath();
      this.displayProjectiles();
   }
   displayProjectiles() {
      for (let i = 0; i < this.projectiles.length; i += 1) {
         this.projectiles[i].display();
      }
   }
   displayParticles() {
      this.pSpawnEmitter.display();
      this.pHitEmitter.display();
      this.pDamageEmitter.display();
      this.pDeathEmitter.display();
      this.pScoreKill.display();
   }
   setColor(color, a = 1) {
      this.color = color;
      for (let i = 0; i < this.projectiles.length; i += 1) {
         this.projectiles[i].setColor(this.color);
      }
      this.pSpawnEmitter.setColor(this.color);
      this.pHitEmitter.setColor(this.color);
      this.pDamageEmitter.setColor(this.color);
      this.pDeathEmitter.setColor(this.color);
      this.pScoreKill.setColor(this.color);
   }
   getRGBA() {
      return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.alpha +")";
   }
}
/** End class Ship **/


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
/* end class player */

//A "bullet" that can be fired by a ship.
class Projectile {
   constructor() {
      this.location = new Vector(0,0);
      this.velocity = new Vector(0,0);

      this.charge = 0;
      this.baseRadius = 3;
      this.modRadius = 25;

      this.defaultSpeed = 2.5;
      this.maxSpeed = 20;

      this.baseDamage = 1;
      this.modDamage = 25;

      this.color = new Color(255, 0, 0, 1);
      this.isActive = false;
   }
   tick() {
      if (this.isActive) {
         this.location.add(this.velocity);
         if (this.isOffscreen() === true) {
            this.reset();
         }
      }
   }
   radius() { //vary size depending on charge from player
      return this.baseRadius + (this.modRadius * this.charge);
   }
   getDamage() { //vary damage depending on charge from player
      return this.baseDamage + (this.modDamage * this.charge);
   }
   fire(loc, dir, charge = 1) {
      this.charge = charge;
      this.location.set(loc.x, loc.y);
      this.velocity.set(dir.x, dir.y);
      const spd = 10 - (8 * this.charge); //vary speed depending on charge from player
      this.velocity.mult(spd);
      this.isActive = true;
   }
   reset() {
      this.charge = 0;
      this.isActive = false;
   }
   isOffscreen() {
      if (this.location.x > canvas.width + this.radius()) {
         return true;
      } else if (this.location.x < 0 - this.radius()) {
         return true;
      } else if (this.location.y > canvas.height + this.radius()) {
         return true;
      } else if (this.location.y < 0 - this.radius()) {
         return true;
      }
      return false;
   }
   setColor(color, a = 1) {
      this.color = color;
      this.color.a = a;
   }
   display() {
      if (this.isActive) {
         setStrokeColor(this.color);
         const alpha = this.charge * 0.75;
         setFillColor(this.color, alpha);
         ctx.beginPath();
         ctx.arc(this.location.x, this.location.y, this.radius(), 0, 2*Math.PI);
         ctx.fill();
         ctx.stroke();
         ctx.closePath();
      }
   }
}
//end class Projectile
/* End class definitions */


/** Gameplay Functions **/
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
      drawTextFlicker("- demo mode -", canvas.width/2, 35, 20, "center");
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
/**end Gameplay Functions **/


/* Physics functions */
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
/* end Physics functions */


/** Display functions **/
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
/** end Display functions **/


/* Event Handler functions */
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
function toggleTimer() {
   if (gameState === "GAME_RUNNING") {
      if (timerRate === 1) {
         timerRate = 0;
      } else if (timerRate === 0) {
         timerRate = 1;
      }
   }
}
document.addEventListener("click", function(event) {
   if (gameState === "GAME_START" && pageIndex == 0) {
      pageIndex += 1;
   }
});

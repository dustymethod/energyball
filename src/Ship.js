"use strict";
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
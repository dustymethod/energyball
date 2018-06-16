"use strict";
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
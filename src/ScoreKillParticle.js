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

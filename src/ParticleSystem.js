
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
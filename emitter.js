class Emitter {

  constructor(steamParticleDiameter, fps, potSides) {
    this.maxNoOfSteamParticles = maxNoOfSteamParticles;
    this.steamParticleDiameter = steamParticleDiameter;
    this.fps = fps;
    this.particles = [];
    this.potSides = potSides;
  }

  // Returns 1 if particle is emitted, else 0
  emit(emissionPos, particleVel, noOfSteamParticlesEmitted, maxNoOfSteamParticles, lifetimeInFrames) {
    // Emits a particle if there is still water left to turn into steam
    if (noOfSteamParticlesEmitted < maxNoOfSteamParticles) {
      // If the velocity generated > 0 i.e the particle has enough energy to evaporate,
      // emit a particle with that velocity, otherwise do not emit a particle
      if (particleVel > 0) {
        let initVel = createVector(0,-particleVel);
        let initAcc = createVector(0,0);
        let particle = new Particle(emissionPos, initVel, initAcc, lifetimeInFrames, this.steamParticleDiameter);
        this.particles.push(particle);
        return 1;
      }
  	}
    return 0;
  }

  update(wind) {
    // Loop backwards through particles, update the location of the particle
    // If the particle is off screen, delete it from the particle list
    // Iterating backwards through the list so that deletions won't mess up
    // looking at particles at indexes in the array yet to be processed
    for (var i = this.particles.length - 1; i >= 0; i--) {
      if (typeof this.particles[i] !== 'undefined') {
        if (this.particles[i].isOffScreen() || this.particles[i].isLifetimeOver()) {
            delete this.particles[i];
        } else {
          if (!this.particles[i].isInsidePot(this.potSides)) {
            this.particles[i].applyForce(createVector((wind/this.fps),0));
          }
          this.particles[i].update();
        }
      }
    }

  }

  // Displays & returns no. of particles this emitter generated that are currently alive
  show() {
    var aliveParticles = 0;
    for (var particle of this.particles) {
      if (typeof particle !== 'undefined') {
        particle.show();
        aliveParticles++;
      }
    }
    return aliveParticles;
  }

  // Clear out 'undefined' elements in the particle array due to deletion
  cleanParticleArr() { this.particles = this.particles.filter(function(p) { return typeof p !== 'undefined'; }); }
}

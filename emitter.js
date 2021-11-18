class Emitter {

  noOfSteamParticlesEmitted = 0;

  constructor(maxNoOfSteamParticles, steamParticleDiameter, pos) {
    this.maxNoOfSteamParticles = maxNoOfSteamParticles;
    this.steamParticleDiameter = steamParticleDiameter;
    this.pos = pos;
    this.particles = [];
  }

  getNoOfSteamParticlesEmitted() {
    return this.noOfSteamParticlesEmitted;
  }

  setPos(pos) {
    this.pos = pos;
  }

  emit() {
    // Emits a particle if there is still water left to turn into steam
    if (this.noOfSteamParticlesEmitted < this.maxNoOfSteamParticles) {
  		let initVel = createVector(0,-2);
  		let initAcc = createVector(0,0);
  		let particle = new Particle(this.pos, initVel, initAcc, this.steamParticleDiameter);
  		this.particles.push(particle);
  		this.noOfSteamParticlesEmitted++;
  	}
  }

  update() {
    for (let particle of this.particles) {
  		particle.update();
  	}
  }

  show() {
    for (let particle of this.particles) {
  		particle.show();
  	}
  }
}

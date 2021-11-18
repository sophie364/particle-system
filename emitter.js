class Emitter {

  noOfSteamParticlesEmitted = 0;

  constructor(maxNoOfSteamParticles, steamParticleDiameter, pos) {
    this.maxNoOfSteamParticles = maxNoOfSteamParticles;
    this.steamParticleDiameter = steamParticleDiameter;
    this.pos = pos;
    this.particles = [];
  }

  printParticleSize(){
    console.log("s ", this.particles.length)
  }

  setPos(pos) {
    this.pos = pos;
  }

  emit() {
    if (this.noOfSteamParticlesEmitted < this.maxNoOfSteamParticles) {
  		let initVel = createVector(0,-10);
  		let initAcc = createVector(0,0);
  		let particle = new Particle(this.pos, initVel, initAcc, this.steamParticleDiameter);
      particle.show();
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

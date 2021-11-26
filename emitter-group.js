class Emitter {

  noOfParticlesAlive = 0;
  noOfSteamParticlesEmitted = 0;
  pixelsPerM = 0.1;
  noOfBins = 10;
  lowestTemp = 0;
  highestTemp = 200;
  sizeOfOneBin = (this.highestTemp-this.lowestTemp)/this.noOfBins;

  // Each element is the midpoint temperature in the range that the bin represents, i.e. if binTemps[0] represents temp. range 0-10 deg C, binTemps[0] = 5
  binTemps = new Array(this.noOfBins);

  // The probabilities that a particle has energy in the range represented by each temperature bin (each element)
  particleTempProb = new Array(this.noOfBins);

  // The corresponding velocity of a steam particle given that it has energy corresponding to the bin indicated by the array index
  particleInitVelocities = new Array(this.noOfBins);

  constructor(maxNoOfSteamParticles, steamParticleDiameter, pos, lifetimeInFrames, fps, wind, potSides) {
    this.maxNoOfSteamParticles = maxNoOfSteamParticles;
    this.steamParticleDiameter = steamParticleDiameter;
    this.pos = pos;
    this.lifetimeInFrames = lifetimeInFrames;
    this.fps = fps;
    this.wind = wind;
    this.particles = [];
    this.potSides = potSides;
  }

  setLifetimeInFrames(lifetimeInFrames) {
    this.lifetimeInFrames = lifetimeInFrames;
  }

  setPos(pos) {
    this.pos = pos;
  }

  setWind(wind) {
    this.wind = wind;
  }

  setTemp(temp) {
    if (this.temp != temp) {
      // Calculate probabilities of initial velocities
      this.probabilityCumSum = 0;
      for (var i = 0; i < this.noOfBins; i++) {
        // midpoint value of the bin, e.g. for temp bin 0-10 deg. C, binTemp = 5
        this.binTemps[i] = this.lowestTemp+(i*this.sizeOfOneBin)+(this.sizeOfOneBin/2);

        // Calc probability that particle has energy corresponding to each temperature bin
        if (i==0) {
          this.particleTempProb[i] = 1-Math.exp((-1.5*(this.binTemps[i]))/(temp));
        } else {
          this.particleTempProb[i] = 1-Math.exp((-1.5*(this.binTemps[i]))/(temp)) - this.probabilityCumSum;
        }
        this.probabilityCumSum += this.particleTempProb[i];

        // If the energy that a particle has corresponds to <100 deg. C, it won't evaporate, so set velocity = 0
        if (this.binTemps[i]<100) {
          this.particleInitVelocities[i] = 0;
        } else {
          this.particleInitVelocities[i] = this.getVFromT(this.binTemps[i]);
        }
      }

      this.temp = temp;

      // Bin 0: P(particle has energy corresponding to between 0-50 degrees C)
      // this.particleTempProb[0] = 1-Math.exp((-1.5*25)/temp);
      // // Bin 1: P(particle has energy corresponding to between 50-100 degrees C)
      // this.particleTempProb[1] = 1-Math.exp((-1.5*75)/temp) - this.particleTempProb[0];
      // // Bin 2: P(particle has energy corresponding to between 100-150 degrees C)
      // this.particleTempProb[2] = 1-Math.exp((-1.5*125)/temp) - this.particleTempProb[1];
      // // Bin 3: P(particle has energy corresponding to between 150-200 degrees C)
      // this.particleTempProb[3] = 1-Math.exp((-1.5*175)/temp) - this.particleTempProb[2];

      // Init v for first 2 bins = 0 because they don't have enough energy to evaporate
      // this.particleInitVelocities[0] = 0;
      // this.particleInitVelocities[1] = 0;
      //
      // // Calculate initial velocities for the bins over 100 degrees C
      // this.particleInitVelocities[2] = this.getVFromT(125);
      // this.particleInitVelocities[3] = this.getVFromT(175);
    }
  }

  getVFromT(tempInC) {
    return this.pixelsPerM * Math.sqrt((3*1.38*(tempInC+273.15))/2.99);
  }

  genInitVel() {
    // Generate random 'num' that is within range from 0 to probabilityCumSum
    // (probabilityCumSum doesn't quite = 1 as it should due to making discrete bins/approximations)
    var num = Math.random() * this.probabilityCumSum,
        s = 0,
        lastIndex = this.particleTempProb.length;

    // Find the bin that the random num falls into, and return the corresponding particle velocity
    for (var i = 0; i < lastIndex; i++) {
        s += this.particleTempProb[i];
        if (num < s) {
            return this.particleInitVelocities[i];
        }
    }

    return this.particleInitVelocities[lastIndex];
  }

  emit() {
    // Emits a particle if there is still water left to turn into steam
    if (this.noOfSteamParticlesEmitted < this.maxNoOfSteamParticles) {
      let generatedVel = this.genInitVel();

      // If the velocity generated > 0 i.e the particle has enough energy to evaporate,
      // emit a particle with that velocity, otherwise do not emit a particle
      if (generatedVel > 0) {
        let initVel = createVector(0,-generatedVel);
        let initAcc = createVector(0,0);
        let particle = new Particle(this.pos, initVel, initAcc, this.lifetimeInFrames, this.steamParticleDiameter);
        this.particles.push(particle);
        this.noOfSteamParticlesEmitted++;
      }
  	}
  }

  update() {
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
            this.particles[i].applyForce(createVector((this.wind/this.fps),0));
          }
          this.particles[i].update();
        }
      }
    }

  }

  show() {
    this.noOfParticlesAlive = 0;
    for (var particle of this.particles) {
      if (typeof particle !== 'undefined') {
        particle.show();
        this.noOfParticlesAlive++;
      }
    }
  }

  // Clear out 'undefined' elements in the particle array due to deletion
  cleanParticleArr() { this.particles = this.particles.filter(function(p) { return typeof p !== 'undefined'; }); }
}

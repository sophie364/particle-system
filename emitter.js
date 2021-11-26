class Emitter {

  noOfSteamParticlesEmitted = 0;
  //initVProbabilities = [0.527, 0.367, 0.082, 0.018];
  //initVels = [0, 0, 23.48, 24.91];
  pixelsPerM = 0.1;
  noOfBins = 10;
  lowestTempInC = 0;
  highestTempInC = 200;
  sizeOfOneBin = (this.highestTempInC-this.lowestTempInC)/this.noOfBins;
  binTempsInK = new Array(this.noOfBins);
  initVProbabilities = new Array(this.noOfBins);
  initVels = new Array(this.noOfBins);

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

  getNoOfSteamParticlesEmitted() {
    return this.noOfSteamParticlesEmitted;
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

  setTemp(tempInC) {
    if (this.tempInC != tempInC) {
      // Calculate probabilities of initial velocities
      this.probabilityCumSum = 0;
      for (var i = 0; i < this.noOfBins; i++) {
        // midpoint value of the bin, e.g. for temp bin 0-10 deg. C, binTemp = 5
        this.binTempsInK[i] = this.celciusToKelvin(this.lowestTempInC+(i*this.sizeOfOneBin)+(this.sizeOfOneBin/2));
        var tempInK = this.celciusToKelvin(tempInC);
        if (i==0) {
          this.initVProbabilities[i] = 1-Math.exp((-1.5*(this.binTempsInK[i]))/(tempInK));
        } else {
          this.initVProbabilities[i] = 1-Math.exp((-1.5*(this.binTempsInK[i]))/(tempInK)) - this.probabilityCumSum;
        }
        this.probabilityCumSum += this.initVProbabilities[i];

        if (this.binTempsInK[i]<this.celciusToKelvin(100)) {
          this.initVels[i] = 0;
        } else {
          this.initVels[i] = this.getVFromT(this.binTempsInK[i]);
        }
      }

      this.tempInC = tempInC;

      // Bin 0: P(particle has energy corresponding to between 0-50 degrees C)
      // this.initVProbabilities[0] = 1-Math.exp((-1.5*25)/temp);
      // // Bin 1: P(particle has energy corresponding to between 50-100 degrees C)
      // this.initVProbabilities[1] = 1-Math.exp((-1.5*75)/temp) - this.initVProbabilities[0];
      // // Bin 2: P(particle has energy corresponding to between 100-150 degrees C)
      // this.initVProbabilities[2] = 1-Math.exp((-1.5*125)/temp) - this.initVProbabilities[1];
      // // Bin 3: P(particle has energy corresponding to between 150-200 degrees C)
      // this.initVProbabilities[3] = 1-Math.exp((-1.5*175)/temp) - this.initVProbabilities[2];

      // Init v for first 2 bins = 0 because they don't have enough energy to evaporate
      // this.initVels[0] = 0;
      // this.initVels[1] = 0;
      //
      // // Calculate initial velocities for the bins over 100 degrees C
      // this.initVels[2] = this.getVFromT(125);
      // this.initVels[3] = this.getVFromT(175);
    }
  }

  celciusToKelvin(tempInC) {
    return tempInC+273.15;
  }

  getVFromT(tempInK) {
    return this.pixelsPerM * Math.sqrt((3*1.38*(tempInK))/2.99);
  }

  genInitVel() {
    var num = Math.random() * this.probabilityCumSum,
        s = 0,
        lastIndex = this.initVProbabilities.length;

    for (var i = 0; i < lastIndex; i++) {
        s += this.initVProbabilities[i];
        if (num < s) {
            return this.initVels[i];
        }
    }

    return this.initVels[lastIndex];
  }

  emit() {
    // Emits a particle if there is still water left to turn into steam
    if (this.noOfSteamParticlesEmitted < this.maxNoOfSteamParticles) {
      let generatedVel = this.genInitVel();

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
    for (var particle of this.particles) {
      if (typeof particle !== 'undefined') {
        particle.show();
      }
    }
  }

  // Clear out 'undefined' elements in the particle array due to deletion
  cleanParticleArr() { this.particles = this.particles.filter(function(p) { return typeof p !== 'undefined'; }); }
}

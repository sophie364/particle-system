class EmitterGroup {

  noOfParticlesAlive = 0;
  noOfSteamParticlesEmitted = 0;
  pixelsPerM = 5;

  // Each element is the midpoint temperature in the range that the bin represents, i.e. if binTemps[0] represents temp. range 0-10 deg C, binTemps[0] = 5
  binTemps = new Array(this.noOfBins);

  // The probabilities that a particle has energy in the range represented by each temperature bin (each element)
  particleTempProb = new Array(this.noOfBins);

  // The corresponding velocity of a steam particle given that it has energy corresponding to the bin indicated by the array index
  particleInitVelocities = new Array(this.noOfBins);

  emitters = new Array(this.noOfEmitters);

  constructor(noOfEmitters, maxNoOfSteamParticles, steamParticleDiameter, surface, lifetimeInFrames, fps, wind, potSides, noOfBins, lowestTemp, highestTemp, renderType) {
    this.noOfEmitters = noOfEmitters;
    this.maxNoOfSteamParticles = maxNoOfSteamParticles;
    this.steamParticleDiameter = steamParticleDiameter;
    this.surface = surface;
    this.lifetimeInFrames = lifetimeInFrames;
    this.fps = fps;
    this.wind = wind;
    this.potSides = potSides;
    this.noOfBins = noOfBins;
    this.lowestTemp = lowestTemp;
    this.highestTemp = highestTemp;
    this.sizeOfOneBin = (this.highestTemp-this.lowestTemp)/this.noOfBins;
    this.renderType = renderType;

    // Will store no. of randomly generated velocities that were allocated to each bin
    this.randomGenerationsPerBin = new Array(this.noOfBins).fill(0);
  }

  getObservedBinProbability() {
    let obs = new Array(this.randomGenerationsPerBin.length);
    let sum = this.randomGenerationsPerBin.reduce((a, b) => a + b, 0);
    for (var i=0;i<obs.length;i++){
      obs[i] = this.randomGenerationsPerBin[i]/sum;
    }
    return obs;
  }

  generateEmitters() {
    for (var i=0; i <this.noOfEmitters; i++) {
      this.emitters[i] = new Emitter(this.steamParticleDiameter, this.fps, this.potSides, this.renderType)
    }
  }

  setLifetimeInFrames(lifetimeInFrames) {
    this.lifetimeInFrames = lifetimeInFrames;
  }

  setSurface(surface) {
    this.surface = surface;
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
    }
  }

  getVFromT(tempInC) {
    return (this.pixelsPerM * Math.sqrt((3*1.38*(tempInC+273.15))/2.99))/this.fps;
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
            this.randomGenerationsPerBin[i]++;
            return this.particleInitVelocities[i];
        }
    }
    this.randomGenerationsPerBin[lastIndex]++;
    return this.particleInitVelocities[lastIndex];
  }

  // Return random coordinate along the water surface line to potentially
  // emit a particle from
  generateEmitterLocation(surface) {
    // Gerenate a random x value between the x values of the water surface
    // (ensuring that emitted particles don't exceed the line ends on the x axis)
    var p1 = surface[0];
    var p2 = surface[1];

    var x = random(p1.x + this.steamParticleDiameter/2, p2.x - this.steamParticleDiameter/2);
    var y = p1.y - this.steamParticleDiameter/2;
    return createVector(x, y);
  }

  update() {
    this.noOfParticlesAlive = 0;
    for (var i = 0; i < this.noOfEmitters; i++) {
      this.noOfSteamParticlesEmitted += this.emitters[i].emit(
        this.generateEmitterLocation(this.surface), this.genInitVel(),
        this.noOfSteamParticlesEmitted, this.maxNoOfSteamParticles, this.lifetimeInFrames);
      this.emitters[i].update(this.wind);
      this.noOfParticlesAlive += this.emitters[i].show();
    }
  }

  cleanParticleArr() {
    for (var i = 0; i < this.noOfEmitters; i++) {
      this.emitters[i].cleanParticleArr();
    }
  }
}

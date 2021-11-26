class Particle {

  constructor(initPos, initVel, initAcc, lifetimeInFrames, pointDiameter) {
    this.pos = initPos;
    this.vel = initVel;
    this.acc = initAcc;
    this.lifetimeInFrames = lifetimeInFrames;
    this.pointDiameter = pointDiameter;
  }

  // isTouchingPotSide(potSides) {
  //   let leftPotSide = potSides[0];
  //   let rightPotSide = potSides[1];
  //   let leftEdgeOfParticle = this.pos.x - this.pointDiameter/2;
  //   let rightEdgeOfParticle = this.pos.x + this.pointDiameter/2;
  //
  //   if (this.pos.y >= leftPotSide[1] && this.pos.y <= leftPotSide[3]
  //       && leftEdgeOfParticle <= leftPotSide[0]) {
  //     this.vel = createVector(0,this.vel.y);
  //     return true;
  //   }
  //   if (this.pos.y >= rightPotSide[1] && this.pos.y <= rightPotSide[3]
  //       && rightEdgeOfParticle == rightPotSide[0]) {
  //     this.vel = createVector(0,this.vel.y);
  //     return true;
  //   }
  //   return false;
  // }

  isInsidePot(potSides) {
    let leftPotSide = potSides[0];
    let rightPotSide = potSides[1];
    let leftEdgeOfParticle = this.pos.x - this.pointDiameter/2;
    let rightEdgeOfParticle = this.pos.x + this.pointDiameter/2;

    if (this.pos.y >= leftPotSide[1] && this.pos.y <= leftPotSide[3]
      && leftEdgeOfParticle >= leftPotSide[0] && rightEdgeOfParticle <= rightPotSide[0]) {
        return true;
      }
    return false;
  }

  isOffScreen() {
    return this.pos.x < 0 || this.pos.x > windowWidth
      || this.pos.y < 0 || this.pos.y > windowHeight;
  }

  isLifetimeOver() {
    return this.lifetimeInFrames <= 0;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
    this.lifetimeInFrames--;
  }

  show() {
    stroke(0);
    strokeWeight(1);
    fill(255, 100);
    ellipse(this.pos.x, this.pos.y, this.pointDiameter);
    // stroke('gray');
    // strokeWeight(this.pointDiameter);
    // point(this.pos);

  }
}

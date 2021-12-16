class Particle {

  constructor(initPos, initVel, initAcc, lifetimeInFrames, pointDiameter, renderType) {
    this.pos = initPos;
    this.vel = initVel;
    this.acc = initAcc;
    this.lifetimeInFrames = lifetimeInFrames;
    this.pointDiameter = pointDiameter;
    this.renderType = renderType;
  }

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
    if (this.renderType=="Point"){
      stroke(220,220,220);
      strokeWeight(this.pointDiameter);
      point(this.pos);
    } else if (this.renderType=="Quad"){
      noStroke();
      rectMode(CENTER);
      fill(220,220,220);
      square(this.pos.x, this.pos.y, this.pointDiameter);
      rectMode(CORNER);
    } else {
      imageMode(CENTER);
      image(imgTexture, this.pos.x, this.pos.y, this.pointDiameter, this.pointDiameter);
    }
  }
}

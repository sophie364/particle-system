class Particle {

  constructor(initPos, initVel, initAcc, pointDiameter) {
    this.pos = initPos;
    this.vel = initVel;
    this.acc = initAcc;
    this.pointDiameter = pointDiameter;
  }

  isOffScreen() {
    return this.pos.x < 0 || this.pos.x > windowWidth
      || this.pos.y < 0 || this.pos.y > windowHeight;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
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

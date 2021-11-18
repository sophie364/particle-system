let fps = 60;

let bg = [220,220,220];
let canvasWidth = 2000;
let canvasHeight = 1100;

let waterColour = [15,90,160];
let initWaterHeight = 100;
let currentWaterHeight = initWaterHeight;
let waterWidth = 500;

let maxNoOfSteamParticles = 1000;
let steamParticleDiameter = 10;
let emitter;

// Lower the water height by 1 pixel for every 'lowerWater' water particles
// converted into steam particles
let lowerWater = maxNoOfSteamParticles/initWaterHeight;
let surface;

function setup() {
	createCanvas(canvasWidth, canvasHeight);
	// Set the number of times draw() executes per second
	frameRate(fps);
	init();
}

function init() {
	clear();
	currentWaterHeight = initWaterHeight;
	background(bg);
	surface = drawWater(initWaterHeight);
	emitter = new Emitter(maxNoOfSteamParticles, steamParticleDiameter, generateEmitterLocation(surface));
}

// Draws rectangle representing water, returns list of coords that can be
// used to make a line representing the water's surface
function drawWater(waterHeight) {
	topLeftX = canvasWidth/2-waterWidth/2;
	topLeftY = canvasHeight-waterHeight;
	noStroke();
	fill(waterColour);
	rect(topLeftX, topLeftY, waterWidth, waterHeight);

	p1 = createVector(topLeftX, topLeftY);
	p2 = createVector(topLeftX+waterWidth, topLeftY);
	return [p1, p2];
}

function updateBg() {
	background(bg);
	// Check if we need to move the water level down by a pixel
	noEmitted = emitter.getNoOfSteamParticlesEmitted();
	if (noEmitted>0 && noEmitted%lowerWater<1) {
		currentWaterHeight--;
	}
	// Draw water rectangle and update water surface coordinates
	surface = drawWater(currentWaterHeight);
}

function draw() {
	updateBg();
	emitter.setPos(generateEmitterLocation(surface));
	emitter.emit();
	emitter.update();
	emitter.show();
}

// Return random coordinate along the water surface line to potentially
// emit a particle from
function generateEmitterLocation(surface) {
	// Gerenate a random x value between the x values of the water surface
	// (ensuring that emitted particles don't exceed the line ends on the x axis)
	p1 = surface[0];
	p2 = surface[1];

	x = random(p1.x + steamParticleDiameter/2, p2.x - steamParticleDiameter/2);
	return createVector(x, p1.y - steamParticleDiameter/2);
}

// If spacebar pressed, reset
function keyTyped() {
  if (key === ' ') {
		init();
  }
}

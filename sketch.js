let fps = 60;

let bg = [220,220,220];
let canvasWidth = 2000;
let canvasHeight = 1100;
let settingsWidth = canvasWidth/5;
let displayWidth = canvasWidth-settingsWidth;

let waterColour = [15,90,160];
let defaultInitWaterHeight = 100;
let initWaterHeight = defaultInitWaterHeight;
let currentWaterHeight = initWaterHeight;
let waterWidth = 500;

let maxNoOfSteamParticles = 10000;
let steamParticleDiameter = 10;
let emitterGroup;

let sliderGap = 55;

let sliders = new Map();

let ttl = 3;

let noOfEmitters = 10;

let noOfBins = 10;
let lowestTemp = 0;
let highestTemp = 200;

// Lower the water height by 1 pixel for every 'lowerWater' water particles
// converted into steam particles
let lowerWater = maxNoOfSteamParticles/initWaterHeight;
let surface;

function setup() {
	createCanvas(canvasWidth, canvasHeight);
	// Set the number of times draw() executes per second
	frameRate(fps);
	init();

	sliders.set("Time to live for new particles", makeSlider(ttl, 1, 20, 1, " second(s)"));
	sliders.set("Wind (acceleration in x-direction)", makeSlider(0, -0.1, 0.1, 0.01, " pixels/s²"));
	sliders.set("Temperature", makeSlider(50, lowestTemp, highestTemp, 1, "°C"));

}

function updateMaxParticles() {
	maxNoOfSteamParticles = maxParticlesTextBox.value();
	if (maxNoOfSteamParticles<initWaterHeight) {
		initWaterHeight=maxNoOfSteamParticles;
	} else {
		initWaterHeight=defaultInitWaterHeight;
	}
	lowerWater = maxNoOfSteamParticles/initWaterHeight;

	init();
}

function updateNoOfEmitters() {
	noOfEmitters = noOfEmittersTextBox.value();
	init();
}

function init() {
	currentWaterHeight = initWaterHeight;
	background(bg);
	surface = drawWater(initWaterHeight);
	potSides = drawPotSides(initWaterHeight);
	emitterGroup = new EmitterGroup(noOfEmitters, maxNoOfSteamParticles, steamParticleDiameter, surface, ttl*fps, fps, 0, potSides, noOfBins, lowestTemp, highestTemp);
	emitterGroup.generateEmitters();
	// Every 1 second, clear each emitter's particle array of 'undefined' elements (deleted particles)
	setInterval(function () {
    emitterGroup.cleanParticleArr();
	}, 5000);
	drawSettingsTab();

	noOfEmittersTextBox = createInput(str(noOfEmitters));
	noOfEmittersTextBox.position(30,100);
	noOfEmittersTextBox.size(50);
	noOfEmittersBtn = createButton('Submit');
	noOfEmittersBtn.position(noOfEmittersTextBox.x + noOfEmittersTextBox.width+10, noOfEmittersTextBox.y);
	noOfEmittersBtn.mousePressed(updateNoOfEmitters);

	maxParticlesTextBox = createInput(str(maxNoOfSteamParticles));
	maxParticlesTextBox.position(30,160);
	maxParticlesTextBox.size(50);
	maxParticlesBtn = createButton('Submit');
	maxParticlesBtn.position(maxParticlesTextBox.x + maxParticlesTextBox.width+10, maxParticlesTextBox.y);
	maxParticlesBtn.mousePressed(updateMaxParticles);
}

// Return list, where index 0 = slider, index 1 = unit
function makeSlider(initValue, rangeLower, rangeUpper, step, unit) {
	sliderToMake = createSlider(rangeLower, rangeUpper, initValue, step);
	sliderToMake.position(30, 230+sliderGap*(sliders.size+1));
	sliderToMake.style('width', str(settingsWidth-settingsWidth/6)+"px");
	return [sliderToMake, unit];
}

function drawSettingsTab() {
	// Draw section for settings
	noStroke();
	fill(10,10,10);
	rect(0, 0, settingsWidth, canvasHeight);
	textSize(32);
	fill(230, 230, 230);
	text('Settings', 30, 50);
	textSize(16);
	text("No. of steam particle emitters: " + noOfEmitters, 30, 90);
	text("Max no. of steam particles: " + maxNoOfSteamParticles, 30, 150);
	text("No. of steam particles already emitted: " + emitterGroup.noOfSteamParticlesEmitted, 30, 205);
	text("No. of steam particles currently alive: " + emitterGroup.noOfParticlesAlive, 30, 225);
	index = 1;
	for (const [key, value] of sliders.entries()) {
		text(key+": "+value[0].value()+value[1], 30, 225+sliderGap*index);
		index++;
	}
	text("Probability of a particle having energy\ncorresponding to a temperature within a range,\nand the corresponding velocity of emitted\nsteam particles in each bin (ranges < 100°C mean\nthe particle doesn't have enough energy to\nevaporate therefore velocity = 0 pixels/s): ", 30, 450);
	probabilities = emitterGroup.particleTempProb;
	var lowerLim = lowestTemp;
	for (var i = 0; i < noOfBins; i++) {
		var upperLim = lowestTemp+((i+1)*emitterGroup.sizeOfOneBin);
		text("P ("+lowerLim+"°C - "+upperLim+"°C) = "+roundTo3DP(probabilities[i])
		  + "\t-> " + roundTo3DP(emitterGroup.particleInitVelocities[i])+" pixels/s", 30, 585+25*i);
		lowerLim = upperLim;
	}
}

function roundTo3DP(val) {
	return Math.round(val * 1000) / 1000;
}

// Draws rectangle representing water, returns list of coords that can be
// used to make a line representing the water's surface
function drawWater(waterHeight) {
	topLeftX = settingsWidth+displayWidth/2-waterWidth/2;
	topLeftY = canvasHeight-waterHeight;

	noStroke();
	fill(waterColour);
	rect(topLeftX, topLeftY, waterWidth, waterHeight);

	p1 = createVector(topLeftX, topLeftY);
	p2 = createVector(topLeftX+waterWidth, topLeftY);
	return [p1, p2];
}

// Return points that can be used to make two lines representing the inside surfaces of the pot
function drawPotSides(waterHeight) {
		topLeftX = settingsWidth+displayWidth/2-waterWidth/2;
		topLeftY = canvasHeight-initWaterHeight*2;

		noStroke();
		fill('gray');
		rect(topLeftX-5, topLeftY, 5, initWaterHeight*2);
		rect(topLeftX+waterWidth, topLeftY, 5, initWaterHeight*2);

		l1coords = [topLeftX, topLeftY, topLeftX, canvasHeight];
		l2coords = [topLeftX+waterWidth, topLeftY, topLeftX+waterWidth, canvasHeight];
		return [l1coords, l2coords];
}

function updateBg() {
	background(bg);
	drawSettingsTab();
	// Check if we need to move the water level down by a pixel
	noEmitted = emitterGroup.noOfSteamParticlesEmitted;
	pixelsToLowerSurfaceBy = noEmitted/lowerWater;
	currentWaterHeight = initWaterHeight-pixelsToLowerSurfaceBy;

	// Draw water rectangle and update water surface coordinates
	surface = drawWater(currentWaterHeight);
	drawPotSides(initWaterHeight);
}

function draw() {
	updateBg();
	emitterGroup.setSurface(surface);
	emitterGroup.setLifetimeInFrames(sliders.get("Time to live for new particles")[0].value()*fps);
	emitterGroup.setWind(sliders.get("Wind (acceleration in x-direction)")[0].value()*fps);
	emitterGroup.setTemp(sliders.get("Temperature")[0].value())
	emitterGroup.update();
}

// If spacebar pressed, reset
function keyTyped() {
  if (key === ' ') {
		init();
  }
}

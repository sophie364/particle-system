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

let maxNoOfSteamParticles = 1000;
let steamParticleDiameter = 10;
let emitter;

let sliderGap = 55;

let sliders = new Map();

// Lower the water height by 1 pixel for every 'lowerWater' water particles
// converted into steam particles
let lowerWater = maxNoOfSteamParticles/initWaterHeight;
let surface;

function setup() {
	createCanvas(canvasWidth, canvasHeight);
	// Set the number of times draw() executes per second
	frameRate(fps);
	init();

	sliders.set("Temperature", makeSlider(50, 0, 200, "°C"));
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

function init() {
	currentWaterHeight = initWaterHeight;
	background(bg);
	drawSettingsTab();
	surface = drawWater(initWaterHeight);
	emitter = new Emitter(maxNoOfSteamParticles, steamParticleDiameter, generateEmitterLocation(surface));

	maxParticlesTextBox = createInput(str(maxNoOfSteamParticles));
	maxParticlesTextBox.position(30,110)
	maxParticlesTextBox.size(50)
	//make a button to submit changes in the textbox
	maxParticlesBtn = createButton('Submit');
	maxParticlesBtn.position(maxParticlesTextBox.x + maxParticlesTextBox.width+10, maxParticlesTextBox.y);
	maxParticlesBtn.mousePressed(updateMaxParticles);
}

// Return list, where index 0 = slider, index 1 = unit
function makeSlider(initValue, rangeLower, rangeUpper, unit) {
	sliderToMake = createSlider(rangeLower, rangeUpper, initValue, 1);
	sliderToMake.position(30, 120+sliderGap*(sliders.size+1));
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
	text("Max no. of steam particles", 30, 100);
	index = 1;
	for (const [key, value] of sliders.entries()) {
		text(key+": "+value[0].value()+value[1], 30, 115+sliderGap*index);
		index++;
	}
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

function updateBg() {
	background(bg);
	drawSettingsTab();
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

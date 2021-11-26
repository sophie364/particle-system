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

let ttl = 5;

// Lower the water height by 1 pixel for every 'lowerWater' water particles
// converted into steam particles
let lowerWater = maxNoOfSteamParticles/initWaterHeight;
let surface;

function setup() {
	createCanvas(canvasWidth, canvasHeight);
	// Set the number of times draw() executes per second
	frameRate(fps);
	init();

	sliders.set("Temperature", makeSlider(50, 0, 200, 1, "°C"));
	sliders.set("Time to live for new particles", makeSlider(5, 1, 20, 1, " second(s)"));
	sliders.set("Wind (acceleration in x-direction)", makeSlider(0, -0.1, 0.1, 0.01, " pixels/s²"));
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
	potSides = drawPotSides(initWaterHeight);
	emitter = new Emitter(maxNoOfSteamParticles, steamParticleDiameter, generateEmitterLocation(surface), ttl*fps, fps, 0, potSides);
	// Every 1 second, clear the emitter's particle array of 'undefined' elements (deleted particles)
	setInterval(function () {
    emitter.cleanParticleArr();
	}, 1000);

	maxParticlesTextBox = createInput(str(maxNoOfSteamParticles));
	maxParticlesTextBox.position(30,110)
	maxParticlesTextBox.size(50)
	//make a button to submit changes in the textbox
	maxParticlesBtn = createButton('Submit');
	maxParticlesBtn.position(maxParticlesTextBox.x + maxParticlesTextBox.width+10, maxParticlesTextBox.y);
	maxParticlesBtn.mousePressed(updateMaxParticles);
}

// Return list, where index 0 = slider, index 1 = unit
function makeSlider(initValue, rangeLower, rangeUpper, step, unit) {
	sliderToMake = createSlider(rangeLower, rangeUpper, initValue, step);
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
	noEmitted = emitter.getNoOfSteamParticlesEmitted();
	pixelsToLowerSurfaceBy = noEmitted/lowerWater;
	currentWaterHeight = initWaterHeight-pixelsToLowerSurfaceBy;

	// Draw water rectangle and update water surface coordinates
	surface = drawWater(currentWaterHeight);
	drawPotSides(initWaterHeight);
}

function draw() {
	updateBg();
	emitter.setPos(generateEmitterLocation(surface));
	emitter.setLifetimeInFrames(sliders.get("Time to live for new particles")[0].value()*fps);
	emitter.setWind(sliders.get("Wind (acceleration in x-direction)")[0].value()*fps);
	emitter.setTemp(sliders.get("Temperature")[0].value())
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

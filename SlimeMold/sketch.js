const numOfAgents = 10000;
const speed = 3;
const viewDistance = 10;
const viewAngle = 3.14159265358979323846 / 3;
const turnAngle = 3.14159265358979323846 / 3;
// const outputWidth = 3840;
// const outputHeight = 2160;
const outputWidth = 1024;
const outputHeight = 1024;
const angleRandomness = 3.14159265358979323846 / 120;
const recordingFrameRate = 30;
const numFrames = 30 * recordingFrameRate;
const decayFactor = 1.001;

let blurShader;
let agentDrawerShader;
let agents = [];
let rollingFrameRate = [];
let agentPass;
let testPass;
let gauss = [
	0.003765, 0.015019, 0.023792, 0.015019, 0.003765, 0.015019, 0.059912,
	0.094907, 0.059912, 0.015019, 0.023792, 0.094907, 0.150342, 0.094907,
	0.023792, 0.015019, 0.059912, 0.094907, 0.059912, 0.015019, 0.003765,
	0.015019, 0.023792, 0.015019, 0.003765,
];
let recording = false;
let recordedFrames = 0;

function preload() {
	// load the shader
	blurShader = loadShader("shaders/blur.vert", "shaders/blur.frag");

	// used to record video
	HME.createH264MP4Encoder().then((enc) => {
		encoder = enc;
		encoder.outputFilename = "slimeMold";
		encoder.width = outputWidth;
		encoder.height = outputHeight;
		encoder.frameRate = recordingFrameRate;
		encoder.kbps = 50000; // video quality
		encoder.groupOfPictures = 10; // lower if you have fast actions.
		encoder.initialize();
	});
}

function setup() {
	pixelDensity(1);
	randomSeed(420);

	agentPass = createGraphics(outputWidth, outputHeight);
	testPass = createGraphics(outputWidth, outputHeight);
	blurPass = createGraphics(outputWidth, outputHeight, WEBGL);
	createCanvas(outputWidth, outputHeight);
	agentPass.stroke(255);
	agentPass.strokeWeight(0);
	noStroke();
	noSmooth();

	// create agents
	while (agents.length < numOfAgents) {
		// random position and angle pointing inwards
		let randomPos = createVector(random(-1, 1), random(-1, 1));
		let angle = randomPos.heading();

		randomPos.x *= (3 * width) / 8;
		randomPos.y *= (3 * height) / 8;
		randomPos.add(createVector(width / 2, height / 2));
		let distance = p5.Vector.sub(
			randomPos,
			createVector(width / 2, height / 2)
		).mag();

		// make sure they are in the circle
		if (distance < (3 * width) / 8) {
			agents.push({
				position: randomPos,
				angle: angle + PI,
			});
		}
	}

	agentPass.background(0);
	makeTestImage();
}

function draw() {
	agentPass.image(blurPass, 0, 0);
	agentPass.loadPixels();
	marchAgents();
	addAgents();
	agentPass.updatePixels();

	blurShader.setUniform("u_resolution", [width, height]);
	blurShader.setUniform("u_gauss", gauss);
	blurShader.setUniform("u_decayFactor", decayFactor);
	blurShader.setUniform("tex0", agentPass);
	blurPass.shader(blurShader);

	blurPass.rect(0, 0, width, height);

	image(blurPass, 0, 0);
	// printFrameRate();

	// record
	// keep adding new frame
	if (recording) {
		console.log("recording");
		encoder.addFrameRgba(
			drawingContext.getImageData(0, 0, encoder.width, encoder.height).data
		);
		recordedFrames++;
	}
	// finalize encoding and export as mp4
	if (recordedFrames === numFrames) {
		recording = false;
		recordedFrames = 0;
		console.log("recording stopped");

		encoder.finalize();
		const uint8Array = encoder.FS.readFile(encoder.outputFilename);
		const anchor = document.createElement("a");
		anchor.href = URL.createObjectURL(
			new Blob([uint8Array], { type: "video/mp4" })
		);
		anchor.download = encoder.outputFilename;
		anchor.click();
		encoder.delete();

		preload(); // reinitialize encoder
	}
}

// function that will set all the agent positions to white
function addAgents() {
	agents.forEach((agent) => {
		agentPass.pixels[getIndex(agent.position)] = 255;
		agentPass.pixels[getIndex(agent.position) + 1] = 255;
		agentPass.pixels[getIndex(agent.position) + 2] = 255;
	});
}

// function to iterate all agents forward
function marchAgents() {
	agents.forEach((agent) => {
		// handle collisions with sides
		if (agent.position.x < 0) agent.position.x += width;
		if (agent.position.x >= width) agent.position.x -= width;
		if (agent.position.y < 0) agent.position.y += height;
		if (agent.position.y >= height) agent.position.y -= height;

		// move in direction
		agent.position.add(
			createVector(cos(agent.angle), sin(agent.angle)).mult(speed)
		);

		// check 30 degrees to the left and right and if either of them
		// is brighter turn towards it
		agent.angle += turnAngle * bestDirection(agent);
		// add randomness
		agent.angle += random(-angleRandomness, angleRandomness);
	});
}

// get a pixel at a given offset from the current position
// direction is 0 for straight ahead, -1 for right and 1 for left
function getView(agent, direction) {
	let newPos = p5.Vector.add(
		agent.position,
		createVector(
			cos(agent.angle + direction * viewAngle),
			sin(agent.angle + direction * viewAngle)
		).mult(viewDistance)
	);

	// handle the edges of the screen
	if (newPos.x < 0) newPos.x += width;
	if (newPos.x >= width) newPos.x -= width;
	if (newPos.y < 0) newPos.y += height;
	if (newPos.y >= height) newPos.y -= height;

	return agentPass.pixels[getIndex(newPos)];
}

// gets which direction to turn
function bestDirection(agent) {
	let left = getView(agent, 1) || 0;
	let right = getView(agent, -1) || 0;
	let straight = getView(agent, 0) || 0;
	if (left > right && left > straight) return 1;
	else if (right > straight) return -1;
	else return 0;
}

// gets the index for a given x y coord
function getIndex(vector) {
	return (
		width * height * 4 - (floor(vector.y) * width + floor(vector.x + 1)) * 4
	);
}

// prints a rolling frame rate for debug
function printFrameRate() {
	let frequency = 100;
	rollingFrameRate.push(recordingFrameRate());
	if (rollingFrameRate.length > frequency) rollingFrameRate.shift();

	let totalFrameRate = 0;
	for (let i of rollingFrameRate) totalFrameRate += i;
	if (frameCount % frequency == 0) console.log(totalFrameRate / frequency);
}

// test function for debugging
function makeTestImage() {
	testPass.fill(255);
	testPass.background(48);
	testPass.rect(width / 4, -height / 4, width / 2, height / 2);
	testPass.fill(28);
	testPass.rect((3 * width) / 8, (3 * height) / 8, width / 4, height / 4);
}

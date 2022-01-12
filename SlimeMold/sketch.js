const numOfAgents = 10000;
const speed = 3;
const viewDistance = 10;
const viewAngle = 3.14159265358979323846 / 6;
const turnAngle = 3.14159265358979323846 / 16;
const outputWidth = 1024;
const outputHeight = 1024;
const angleRandomness = 3.14159265358979323846 / 6;

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
let decayFactor = 0.999;

function preload() {
	// load the shader
	blurShader = loadShader("shaders/blur.vert", "shaders/blur.frag");
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
	for (let i = 0; i < numOfAgents; i++) {
		agents.push({
			position: createVector(random(0, width), random(0, height)),
			angle: random(0, TWO_PI),
		});
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
}

// function that will set all the agent positions to white
function addAgents() {
	for (agent of agents) {
		// point(agent.position.x - width / 2, agent.position.y - height / 2);
		agentPass.pixels[getIndex(agent.position)] = 255;
		agentPass.pixels[getIndex(agent.position) + 1] = 255;
		agentPass.pixels[getIndex(agent.position) + 2] = 255;
	}
}

// function to iterate all agents forward
function marchAgents() {
	for (agent of agents) {
		// handle collisions with sides
		// if (agent.position.x < 0 || agent.position.x >= width)
		// 	agent.angle += (PI / 2 - agent.angle) * 2;
		// if (agent.position.y < 0 || agent.position.y >= height)
		// 	agent.angle += (PI - agent.angle) * 2;
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
	}
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

	// if looking out of bounds just return
	if (newPos.x < 0 || newPos.x >= width || newPos.y < 0 || newPos.y >= height)
		return 0;

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
	rollingFrameRate.push(frameRate());
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

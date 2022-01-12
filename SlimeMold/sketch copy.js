const numOfAgents = 2;
const speed = 1;
const viewDistance = 10;
const viewAngle = 3.14159265358979323846 / 6;
const turnAngle = 3.14159265358979323846 / 8;

let blurShader;
let agents = [];
let brandNew = true;

function preload() {
	// load the shader
	blurShader = loadShader("shaders/blur.vert", "shaders/blur.frag");
}

function setup() {
	pixelDensity(1);
	randomSeed(420);

	createCanvas(512, 512, WEBGL);
	stroke(255);
	strokeWeight(0);
	noSmooth();

	// create agents
	for (let i = 0; i < numOfAgents; i++) {
		agents.push({
			position: createVector(random(0, width), random(0, height)),
			angle: random(0, TWO_PI),
		});
	}

	// background(64);
	background(0);
}

function draw() {
	frameRate(1);
	if (brandNew) {
		for (let i = 0; i < 760; i++) {
			loadPixels();
			marchAgents();
			addAgents();
		}
		brandNew = false;
	}
	loadPixels();
	marchAgents();
	addAgents();

	// blurShader.setUniform("u_resolution", [width, height]);
	// blurShader.setUniform("u_pixels", pixels);

	// shader(blurShader);
	// quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

// plan is:
// manually move the agents
// then combine with previous pixels and blur

// function that will set all the agent positions to white
function addAgents() {
	// fill(255);
	for (agent of agents) {
		point(agent.position.x - width / 2, agent.position.y - height / 2);
		// rect(agent.position.x - width / 2, agent.position.y - height / 2, 1, 1);
		// pixels[floor((agent.position.x * width + agent.position.y) * 4)] = 255;
		// pixels[floor((agent.position.x * width + agent.position.y) * 4) + 1] = 255;
		// pixels[floor((agent.position.x * width + agent.position.y) * 4) + 2] = 255;
	}
}

// function to iterate all agents forward
function marchAgents() {
	for (agent of agents) {
		// handle collisions with sides
		if (agent.position.x < 0 || agent.position.x >= width)
			agent.angle += (PI / 2 - agent.angle) * 2;
		if (agent.position.y < 0 || agent.position.y >= height)
			agent.angle += (PI - agent.angle) * 2;

		// move in direction
		agent.position.add(createVector(cos(agent.angle), sin(agent.angle)));

		// check 30 degrees to the left and right and if either of them
		// is brighter turn towards it
		agent.angle += turnAngle * bestDirection(agent);
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

	stroke(0, 0, 255);
	point(newPos.x - width / 2, newPos.y - height / 2);
	stroke(255);
	if (pixels[getIndex(newPos)] != 0) {
		loadPixels();
		console.log(pixels[getIndex(newPos)]);
		console.log(pixels[getIndex(newPos) + 1]);
		console.log(pixels[getIndex(newPos) + 2]);
		console.log(`pos index: ${getIndex(agent.position)}`);
		console.log(`new pos index: ${getIndex(newPos)}`);
		console.log(
			`POS      x: ${floor(agent.position.x)}, y: ${floor(agent.position.y)}`
		);
		console.log(`NEW POS  x: ${floor(newPos.x)}, y: ${floor(newPos.y)}`);
		strokeWeight(10);
		stroke(0, 0, 255);
		point(newPos.x - width / 2, newPos.y - height / 2);
		stroke(0, 255, 0);
		point(agent.position.x - width / 2, agent.position.y - height / 2);
		stroke(255);
		strokeWeight(0);
		console.log(frameCount);
		// noLoop();
	}

	return pixels[getIndex(newPos)];
}

// gets which direction to turn
function bestDirection(agent) {
	let left = getView(agent, 1) || 0;
	let right = getView(agent, -1) || 0;
	let straight = getView(agent, 0) || 0;
	if (left != 0 || right != 0 || straight != 0) {
		console.log(`left: ${left}, right: ${right}, straight: ${straight}`);
		console.log(`pos: ${agent.position}`);
	}
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

const numOfAgents = 1000;
const speed = 1;
const viewDistance = 10;
const viewAngle = 3.14159265358979323846 / 6;
const turnAngle = 3.14159265358979323846 / 8;

let blurShader;
let agentDrawerShader;
let agents = [];
let rollingFrameRate = [];

function preload() {
	// load the shader
	blurShader = loadShader("shaders/blur.vert", "shaders/blur.frag");
	agentDrawerShader = loadShader(
		"shaders/agentDrawer.vert",
		"shaders/agentDrawer.frag"
	);
}

function setup() {
	pixelDensity(1);
	randomSeed(420);

	createCanvas(1024, 1024, WEBGL);
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
	loadPixels();
	marchAgents();
	// addAgents();
	drawAgents();

	rollingFrameRate.push(frameRate());
	if (rollingFrameRate.length > 20) rollingFrameRate.shift();

	let totalFrameRate = 0;
	for (let i of rollingFrameRate) totalFrameRate += i;
	console.log(totalFrameRate / 20);
}

// function that will draw the agents using a shader
function drawAgents() {
	// format into arrays to be passed to the shader
	let agentPositionsX = [];
	let agentPositionsY = [];
	// let agentRotations = [];
	agents.forEach((agent) => {
		agentPositionsX.push(floor(agent.position.x));
		agentPositionsY.push(floor(agent.position.y));
		// agentRotations.push(agent.rotations);
	});
	agentDrawerShader.setUniform("u_resolution", [width, height]);
	agentDrawerShader.setUniform("u_agentPositionsX", agentPositionsX);
	agentDrawerShader.setUniform("u_agentPositionsY", agentPositionsY);
	shader(agentDrawerShader);
	rect(0, 0, width, height);
}

// function that will set all the agent positions to white
function addAgents() {
	for (agent of agents) {
		point(agent.position.x - width / 2, agent.position.y - height / 2);
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

	return pixels[getIndex(newPos)];
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

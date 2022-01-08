const breakOffSegments = 5;
const speed = 0.01;
const loopTime = 100;
const blockSize = 50;

let splitBox;
let surroundBlocks;

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);

	// the simplest method to enable the camera
	createEasyCam();

	// suppress right-click context menu
	document.oncontextmenu = function () {
		return false;
	};
	splitBox = new SplitBlock(0, 0, 0, blockSize, breakOffSegments, {
		r: 255,
		g: 255,
		b: 255,
		a: 255,
	});
	surroundBlocks = surround(splitBox, breakOffSegments);
}

function draw() {
	background(64);

	// interesting lighting
	directionalLight(255, 0, 0, 0, 1, -1);
	directionalLight(
		0,
		255,
		0,
		cos(PI / 2 + TWO_PI / 3),
		sin(PI / 2 + TWO_PI / 3),
		-1
	);
	directionalLight(
		0,
		0,
		255,
		-cos(PI / 2 + TWO_PI / 3),
		sin(PI / 2 + TWO_PI / 3),
		-1
	);

	ambientLight(0);

	// scale to allow for perfect loop
	scale(pow(breakOffSegments / (breakOffSegments - 2), frameCount / loopTime));

	// amount to increase the size by to make the whole thing loop

	splitBox.draw();

	for (let block of surroundBlocks) {
		block.color = { r: 255, g: 255, b: 255, a: 255 };
		block.pos = block.pos.mult(1 + speed);
		block.draw();
	}

	if (frameCount % loopTime == 0) {
		surroundBlocks = surroundBlocks.concat(splitBox.surroundify());
	}
}

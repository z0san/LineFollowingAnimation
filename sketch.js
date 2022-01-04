const numOfLines = 5;
const colorWidth = 92;
const colorOffset = 0;
const strokeWeightVal = 5;
const padding = 100;
const deviation = 0.3;

let mode = "INFINITY";

// line will be an array of points
let testLine = [];
let infinityLine;

// sliders
let numOfLinesSlider;
let colorWidthSlider;
let colorOffsetSlider;
let strokeWeightSlider;
let sidesSlider;
let pointsPerSideSlider;
let deviationSlider;

function setup() {
	// set noise seed
	noiseSeed(0);

	createCanvas(600, 800);

	// set the color mode to hsb
	colorMode(HSB, 255);
	infinityLine = generateInfin(500);

	textSize(20);
	textAlign(LEFT, CENTER);

	// create sliders
	numOfLinesSlider = createSlider(1, 50, numOfLines, 1);
	numOfLinesSlider.position(10, 610);
	numOfLinesSlider.style("width", "80px");

	colorWidthSlider = createSlider(0, 255, colorWidth, 1);
	colorWidthSlider.position(10, 630);
	colorWidthSlider.style("width", "80px");

	colorOffsetSlider = createSlider(0, 255, colorOffset, 1);
	colorOffsetSlider.position(10, 650);
	colorOffsetSlider.style("width", "80px");

	strokeWeightSlider = createSlider(1, 30, strokeWeightVal, 1);
	strokeWeightSlider.position(10, 670);
	strokeWeightSlider.style("width", "80px");

	sidesSlider = createSlider(3, 30, 4, 1);
	sidesSlider.position(10, 690);
	sidesSlider.style("width", "80px");

	pointsPerSideSlider = createSlider(1, 50, 20, 1);
	pointsPerSideSlider.position(10, 710);
	pointsPerSideSlider.style("width", "80px");

	deviationSlider = createSlider(0, 4, deviation, 0.1);
	deviationSlider.position(10, 730);
	deviationSlider.style("width", "80px");
}

function draw() {
	background(0);
	// text
	fill(255);
	strokeWeight(0);
	text("Sides of polygon", 100, 610 + 10);

	if (mode == "INFINITY") testLine = infinityLine;
	else
		testLine = generatePoly(sidesSlider.value(), pointsPerSideSlider.value());

	strokeWeight(strokeWeightSlider.value());
	for (let i = 0; i < numOfLinesSlider.value(); i++) {
		let color = {
			// h: (i / numOfLines) * colorWidth + colorOffset,
			h:
				(i / numOfLinesSlider.value()) * colorWidthSlider.value() +
				colorOffsetSlider.value(),
			s: 255,
			b: 255,
		};
		traceLineWithVariation(testLine, color, deviationSlider.value(), i, 10);
	}
}

// draw array of points
function drawLine(points) {
	for (index in points) {
		start = points[index];
		end = points[(+index + 1) % points.length];
		conStart = convertPoint(start, padding);
		conEnd = convertPoint(end, padding);
		line(conStart.x, conStart.y, conEnd.x, conEnd.y);
	}
}

// trace line over time
function traceLine(points) {
	let currPoint = frameCount % points.length;
	for (index in points) {
		start = points[index];
		end = points[(+index + 1) % points.length];
		conStart = convertPoint(start, padding);
		conEnd = convertPoint(end, padding);

		// dictates how bright the line should be
		let brightness = index - currPoint;
		brightness %= points.length;
		brightness = brightness < 0 ? brightness + points.length : brightness;
		brightness = (brightness / points.length) * 255;
		stroke(brightness);

		line(conStart.x, conStart.y, conEnd.x, conEnd.y);
	}
}

// trace the line over time with a given amount of deviation and noise offset with is used to make different
// lines have different paths
function traceLineWithVariation(
	points,
	color,
	deviation,
	noiseOffset,
	timeVariation
) {
	let currPoint = frameCount % points.length;
	currPoint += int(noise(frameCount / timeVariation + noiseOffset));
	for (index in points) {
		start = points[index];
		end = points[(+index + 1) % points.length];

		// dictates how bright the line should be
		let brightness = index - currPoint;
		brightness %= points.length;
		brightness = brightness < 0 ? brightness + points.length : brightness;
		brightness = (brightness / points.length) * 255;
		stroke(color.h, color.s, brightness);

		// add deviation
		// the y is offset from the x by an amount so it looks different but is still similar frame to frame
		let startXNoiseLoc = start.x + noiseOffset;
		let startYNoiseLoc = start.y + noiseOffset + (2 << 32);
		let endXNoiseLoc = end.x + noiseOffset;
		let endYNoiseLoc = end.y + noiseOffset + (2 << 32);

		let noiseStart = { ...start };
		let noiseEnd = { ...end };

		noiseStart.x += (noise(startXNoiseLoc) - 0.5) * deviation;
		noiseStart.y += (noise(startYNoiseLoc) - 0.5) * deviation;
		noiseEnd.x += (noise(endXNoiseLoc) - 0.5) * deviation;
		noiseEnd.y += (noise(endYNoiseLoc) - 0.5) * deviation;

		conStart = convertPoint(noiseStart, padding);
		conEnd = convertPoint(noiseEnd, padding);

		line(conStart.x, conStart.y, conEnd.x, conEnd.y);
	}
}

// convert from unit coords to screen coords
// we use width twice to allow for the extra space at the bottom to be used for sliders
function convertPoint(point, padding) {
	shortenedWidth = width - padding;
	shortenedHeight = width - padding;
	let x = point.x * (shortenedWidth / 2);
	let y = point.y * (shortenedWidth / 2);
	x += width / 2;
	y += width / 2;
	return { x, y };
}

// generate infinity-shaped array of points
function generateInfin(resolution) {
	let line = [];
	for (let i = 0; i < resolution; i++) {
		let angle = (i / resolution) * TWO_PI;
		line.push({
			x: sin(angle * 2) * cos(angle),
			y: sin(angle * 2) * sin(angle),
		});
	}
	return line;
}

// generate square-shaped array of points
function generatePoly(sides, pointsPerSide) {
	let line = [];
	for (let startSide = 0; startSide < sides; startSide++)
		for (let i = 0; i < pointsPerSide; i++) {
			let endSide = (startSide + 1) % sides;
			let startAngle = (startSide / sides) * TWO_PI;
			let endAngle = (endSide / sides) * TWO_PI;
			let startCoord = { x: cos(startAngle), y: sin(startAngle) };
			let endCoord = { x: cos(endAngle), y: sin(endAngle) };

			// the coordinate interpolated along the line of the polygon
			let interpCoord = { x: 0, y: 0 };
			interpCoord.x =
				startCoord.x + (i / pointsPerSide) * (endCoord.x - startCoord.x);
			interpCoord.y =
				startCoord.y + (i / pointsPerSide) * (endCoord.y - startCoord.y);

			line.push(interpCoord);
		}
	return line;
}

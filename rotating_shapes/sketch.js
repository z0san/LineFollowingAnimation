
function setup() {
	// set noise seed
	noiseSeed(0);

	createCanvas(800, 800);

	// set the color mode to hsb
	colorMode(HSB, 255);
}

function draw() {
	background(0);
	// text
	fill(255);
	strokeWeight(3);
	stroke(255);
	let shape = generatePoly(5, 1);
	drawLine(shape);
}

// draw array of points
function drawLine(points) {
	for (index in points) {
		start = points[index];
		end = points[(+index + 1) % points.length];
		conStart = convertPoint(start);
		conEnd = convertPoint(end);
		line(conStart.x, conStart.y, conEnd.x, conEnd.y);
	}
}

// convert from unit coords to screen coords
// we use width twice to allow for the extra space at the bottom to be used for sliders
function convertPoint(point, padding = 0) {
	shortenedWidth = width - padding;
	shortenedHeight = width - padding;
	let x = point.x * (shortenedWidth / 2);
	let y = point.y * (shortenedWidth / 2);
	x += width / 2;
	y += width / 2;
	return { x, y };
}


// generate array of points to any polygon
function generatePoly(sides, pointsPerSide, sideLen = 1.05) {
	let line = [];
	for (let startSide = 0; startSide < sides; startSide++)
		for (let i = 0; i < pointsPerSide; i++) {
			let endSide = (startSide + 1) % sides;
			let startAngle = (startSide / sides) * TWO_PI;
			let endAngle = (endSide / sides) * TWO_PI;
			let startCoord = { x: sideLen * sin(startAngle), y: -sideLen * cos(startAngle) };
			let endCoord = { x: sideLen * sin(endAngle), y: -sideLen * cos(endAngle) };

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
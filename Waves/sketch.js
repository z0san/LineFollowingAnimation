const LinePaddingX = 0.05
const LinePaddingY = 0.2
const LineWidth = 10
const NumOfLines = 6
const PointsOnLine = 100

const BackgroundColor = 0

const E = 2.71828 
const PI = 3.14159

const Speed = 20
const GrowthSpeed = 150
const AdjustmentConst = 0.7
const DecayConst = 0.4
const FreqConst = 12.6

let time = 0
let lines = []

const createLine = () => {
	let line = []
	for (let point = 0; point < PointsOnLine; point ++) {
		line.push({
			x: point / (PointsOnLine - 1),
			y: 0
		})
	}
	return line
}

const drawLine = (points, color = 255) => {
	stroke(color)
	strokeWeight(LineWidth)
	noFill()
	beginShape()

	for (let point = 0; point < points.length - 1; point ++) {
		// if (point + 1 < points.length) {
		// 	line(
		// 		width * ((points[point].x * (1 - (2 * LinePaddingX)))  + LinePaddingX),
		// 		height * (1 - ((points[point].y * (1 - (2 * LinePaddingY)))  + LinePaddingY)),
		// 		width * ((points[point + 1].x * (1 - (2 * LinePaddingX)))  + LinePaddingX),
		// 		height * (1 - ((points[point + 1].y * (1 - (2 * LinePaddingY)))  + LinePaddingY)),
		// 	)
		// }
		curveVertex(
			width * ((points[point].x * (1 - (2 * LinePaddingX)))  + LinePaddingX),
			height * (1 - ((points[point].y * (1 - (2 * LinePaddingY)))  + LinePaddingY)),
		)
	}

	endShape()
}

function lineEquation(points, time, offset = 0) {
	for (let i = 0; i < points.length; i++) {
		// points[i].y = (cos(((time / speed) * i) + i * 50) * 0.5) + 0.5
		let x = 2 * (i / points.length) - 1
		let size = cos((time / GrowthSpeed) + offset) ** 2

		let adjustment = AdjustmentConst * E ** (-1 * ((x / DecayConst) ** 2))
		let decayTerm = E ** ((x / DecayConst) ** 2)
		let mainTerm = cos(FreqConst * size * x + ((time / Speed) + offset)) / decayTerm
		points[i].y = (mainTerm + adjustment) * size / 2
	}
	return points
}

function setup() {
	// set noise seed
	noiseSeed(0);
	drawLine(createLine())
	// set the color mode to hsb
	colorMode(HSB, 255)

	createCanvas(1000, 800)

	for (let i = 0; i < NumOfLines; i++) {
		lines.push(createLine())
	}
}

function draw() {
	time++
	background(BackgroundColor)

	for (let i = 0; i < NumOfLines; i++) {
		lines[i] = lineEquation(lines[i], time, i * (PI / NumOfLines))
		// console.log(lines[i])
		drawLine(lines[i], color(i * (255 / NumOfLines), 255, 255, 255 * 4  / NumOfLines))
	}
}
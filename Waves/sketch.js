const pointGridWidth = 25
const pointGridHeight = 25
const sparseness = 0.5

// runner speed in frames to move from one point to the next
const runnerSpeed = 5

let runners = []
let maze
let initDirection = 1

let mazeColor = 150
let dotColor = 50

const numRunners = 50
const runnerSize = 4
const trailLength = 1

// facing direction: 
// 0 = up
// 1 = right
// 2 = down
// 3 = left
function drawPoint(x, y) {
	point(width * ((x + 1) / (pointGridWidth + 1)), height * ((y + 1) / (pointGridHeight + 1)))
}

function drawPointGrid() {
	stroke(dotColor)
	strokeWeight(100 / pointGridWidth)
	for (let i = 0; i < pointGridWidth; i++) {
		for (let j = 0; j < pointGridWidth; j++) {
			drawPoint(i, j)
		}
	}
}

function createRunner(x = 0, y = 0, facing) {
	return {
		x,
		y,
		facing: facing || random([1, 2]),
		age: int(random(0, runnerSpeed)),
		color: random(0, 255)
	}
}

function drawRunner(runner) {
	stroke(runner.color, 255, 255);

	for (let i = 1; i <= trailLength; i++) {
		strokeWeight(((100 / pointGridWidth) / i) * runnerSize)
		// console.log(`age: ${runner.age - 1} i: ${i}`)
		switch (runner.facing) {
			case 0:
				drawPoint(runner.x , runner.y - ((1 / runnerSpeed) * ((runner.age % runnerSpeed) - i)))
				continue
			case 1:
				drawPoint(runner.x + ((1 / runnerSpeed) * ((runner.age  % runnerSpeed)- i)), runner.y)
				continue
			case 2:
				drawPoint(runner.x , runner.y + ((1 / runnerSpeed) * ((runner.age % runnerSpeed) - i)))
				continue
			case 3:
				drawPoint(runner.x - ((1 / runnerSpeed) * ((runner.age % runnerSpeed) - i)), runner.y)
				continue
		}
	}
}

function moveRunner(runner) {

	// TODO if runner is facing wall handle

	runner.age += 1

	if (runner.age % runnerSpeed != 0) return runner

	switch (runner.facing) {
		case 0:
			runner.y --;
			return runner
		case 1:
			runner.x ++;
			return runner
		case 2:
			runner.y ++;
			return runner
		case 3:
			runner.x --;
			return runner
	}
	return runner
}

function randomTurn(runner, maze) {
	// only make turn when on junction
	if (runner.age % runnerSpeed != 0) return runner
	// console.log(runner)

	// if dead end then and only then turn around
	if (
		maze[runner.x][runner.y].up +
		maze[runner.x][runner.y].right +
		maze[runner.x][runner.y].down +
		maze[runner.x][runner.y].left == 3
	) {
		runner.facing = (runner.facing + 2) % 4
		return runner
	}

	let newFacing = ((runner.facing + random([-1, 0, 1])) + 4) % 4

	switch (newFacing) {
		case 0:
			if (maze[runner.x][runner.y].up) return randomTurn(runner, maze)
			else break
		case 1:
			if (maze[runner.x][runner.y].right) return randomTurn(runner, maze)
			else break
		case 2:
			if (maze[runner.x][runner.y].down) return randomTurn(runner, maze)
			else break
		case 3:
			if (maze[runner.x][runner.y].left) return randomTurn(runner, maze)
			else break
	}

	runner.facing = newFacing
	return runner
}

function createMazeRecursive(maze, x, y, visited = [], history = []) {
	if (visited.length == pointGridWidth * pointGridHeight) return {
		maze,
		x,
		y,
		visited,
		history
	}

	if (!visited.includes(`x:${x}, ${y}`)) visited.push(`x:${x}, ${y}`)

	// 0 = up
	// 1 = right
	// 2 = down
	// 3 = left
	// console.log(`x: ${x} y: ${y} visited: ${visited.length} history: ${history.length}`)
	// console.log(visited)
	// console.log(visited.includes(`x:${x}, ${y}`))
	let directions = []
	if (y > 0 && !visited.includes(`x:${x}, ${y-1}`)) directions.push(0)
	if (x < pointGridWidth - 1 && !visited.includes(`x:${x+1}, ${y}`)) directions.push(1)
	if (y < pointGridHeight - 1 && !visited.includes(`x:${x}, ${y+1}`)) directions.push(2)
	if (x > 0 && !visited.includes(`x:${x-1}, ${y}`)) directions.push(3)

	if (directions.length == 0) {
		// console.log("backtracking")
		let last = history.pop()
		return {maze, x:last.x, y:last.y, visited, history}
	}


	let directionMoving = random(directions)
	// console.log(directions)
	// console.log(directionMoving)
	switch (directionMoving) {
		case 0:
			maze[x][y].up = false
			maze[x][y-1].down = false
			history.push({x, y})
			return {maze, x, y:y-1, visited, history}
		case 1:
			maze[x][y].right = false
			maze[x+1][y].left = false
			history.push({x, y})
			return {maze, x:x+1, y, visited, history}
		case 2:
			maze[x][y].down = false
			maze[x][y+1].up = false
			history.push({x, y})
			return {maze, x, y:y+1, visited, history}
		case 3:
			maze[x][y].left = false
			maze[x-1][y].right = false
			history.push({x, y})
			return {maze, x:x-1, y, visited, history}
	}
}

function createMaze() {
	let maze = []
	for (let i = 0; i < pointGridWidth; i++) {
		maze.push([])
		for (let j = 0; j < pointGridHeight; j++) {
			maze[i].push({
				up: true,
				right: true,
				down: true,
				left: true
			})
		}
	}

	let result = {
		maze,
		x: 0,
		y: 0,
		visited: [],
		history: []
	}
	while (result.visited.length < pointGridWidth * pointGridHeight) {
		result = createMazeRecursive(result.maze, result.x, result.y, result.visited, result.history)
	}
	// result = createMazeRecursive(result.maze, result.x, result.y, result.visited, result.history)

	maze = increaseMazeSparseness(result.maze, sparseness)
	// maze = result.maze

	return maze
}

function drawMaze(maze) {
	stroke(mazeColor)
	fill(mazeColor)
	strokeWeight(100 / pointGridWidth)
	for (let i = 0; i < pointGridWidth; i++) {
		for (let j = 0; j < pointGridHeight; j++) {
			if (maze[i][j].up && maze[i][j].right && maze[i][j].down && maze[i][j].left) {
				rect(
					width * ((i + 0.5) / (pointGridWidth + 1)),
					height * ((j + 0.5) / (pointGridHeight + 1)),
					width / (pointGridWidth + 1),
					height / (pointGridHeight + 1)
				)
			} else {
				if (maze[i][j].up) {
					line(
						width * ((i + 0.5) / (pointGridWidth + 1)),
						height * ((j + 0.5) / (pointGridHeight + 1)),
						width * ((i + 1.5) / (pointGridWidth + 1)),
						height * ((j + 0.5) / (pointGridHeight + 1))
					)
				}
				if (maze[i][j].right) {
					line(
						width * ((i + 1.5) / (pointGridWidth + 1)),
						height * ((j + 0.5) / (pointGridHeight + 1)),
						width * ((i + 1.5) / (pointGridWidth + 1)),
						height * ((j + 1.5) / (pointGridHeight + 1))
					)
				}
				if (maze[i][j].down) {
					line(
						width * ((i + 0.5) / (pointGridWidth + 1)),
						height * ((j + 1.5) / (pointGridHeight + 1)),
						width * ((i + 1.5) / (pointGridWidth + 1)),
						height * ((j + 1.5) / (pointGridHeight + 1))
					)
				}
				if (maze[i][j].left) {
					line(
						width * ((i + 0.5) / (pointGridWidth + 1)),
						height * ((j + 0.5) / (pointGridHeight + 1)),
						width * ((i + 0.5) / (pointGridWidth + 1)),
						height * ((j + 1.5) / (pointGridHeight + 1))
					)
				}
			}
		}
	}
}

function increaseMazeSparseness(maze, sparseness) {

	if (sparseness == 0) return maze

	for (let i = 0; i < pointGridWidth; i++) {
		for (let j = 0; j < pointGridHeight; j++) {
			if (random(0, 1) < sparseness && j > 0) {
				maze[i][j].up = false
				maze[i][j-1].down = false
			}

			if (random(0, 1) < sparseness && i > 0) {
				maze[i][j].left = false
				maze[i-1][j].right = false
			}
		}
	}
	return maze
}

function setup() {
	createCanvas(1000, 800)

	// set the color mode to hsb
	colorMode(HSB, 255)

	maze = createMaze()


	if (!maze[0][0].down) initDirection = 2
	else initDirection = 1

	for (let i = 0; i < numRunners; i++) {
		runners.push(createRunner(0, 0, initDirection))
	}
}

// let result = {
// 	maze: createMaze(),
// 	x: 0,
// 	y: 0,
// 	visited: [],
// 	history: []
// }

function draw() {
	background(0)
	drawPointGrid()
	// noLoop()


	drawMaze(maze)

	// draw current build location
	stroke(200, 255, 255)
	// frameRate(1)
	// drawPoint(result.x, result.y)

	runners
		.map(moveRunner)
		.map(runner => randomTurn(runner, maze))

	// check for completion
	for (let i = 0; i < numRunners; i++){
		runner = runners[i]
		if (runner.x == pointGridWidth - 1 && runner.y == pointGridHeight - 1) {
			runners = runners.map(() => createRunner(0, 0, initDirection))
			maze = createMaze()
			break
		}
	}

	runners.forEach(drawRunner)
}
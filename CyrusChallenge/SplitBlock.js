// creates blocks surrounding another given block
class SplitBlock {
	constructor(x, y, z, sizePerBlock, segments, color) {
		this.pos = createVector(x, y, z);
		this.sizePerBlock = sizePerBlock;
		this.segments = segments;
		this.size = sizePerBlock * segments;
		this.color = color;

		this.blocks = [];
		for (let xSegments = 0; xSegments < segments; xSegments++) {
			for (let ySegments = 0; ySegments < segments; ySegments++) {
				for (let zSegments = 0; zSegments < segments; zSegments++) {
					// can do this for efficiency of rendering
					if (
						xSegments == 0 ||
						xSegments == segments - 1 ||
						ySegments == 0 ||
						ySegments == segments - 1 ||
						zSegments == 0 ||
						zSegments == segments - 1
					) {
						this.blocks.push(
							new Block(
								x -
									(sizePerBlock * segments) / 2 +
									sizePerBlock / 2 +
									sizePerBlock * xSegments,
								y -
									(sizePerBlock * segments) / 2 +
									sizePerBlock / 2 +
									sizePerBlock * ySegments,
								z -
									(sizePerBlock * segments) / 2 +
									sizePerBlock / 2 +
									sizePerBlock * zSegments,
								sizePerBlock,
								color
							)
						);
					}
				}
			}
		}
	}

	// draw all boxes
	draw() {
		for (let block of this.blocks) {
			block.draw();
		}
	}

	// returns a set of surrounding blocks and resets current blocks to be seamless
	surroundify() {
		this.size -= 2 * this.sizePerBlock;
		this.sizePerBlock = this.size / this.segments;
		this.blocks = new SplitBlock(
			this.pos.x,
			this.pos.y,
			this.pos.z,
			this.sizePerBlock,
			this.segments,
			this.color
		).blocks;

		return surround(this, this.segments, this.color);
	}
}

// surrounds a block with a given number of more blocks
function surround(centerBlock, segments, color) {
	// ik this is a quick and dirty  solution but I am racing so good enough
	if (segments <= 2) {
		console.error("too few segments!!");
		return [];
	}

	// the size of each block
	let sizePerBlock = centerBlock.size / (segments - 2);
	// array to store all the blocks we create
	let blocks = [];
	for (let xSegments = 0; xSegments < segments; xSegments++) {
		for (let ySegments = 0; ySegments < segments; ySegments++) {
			for (let zSegments = 0; zSegments < segments; zSegments++) {
				if (
					xSegments == 0 ||
					xSegments == segments - 1 ||
					ySegments == 0 ||
					ySegments == segments - 1 ||
					zSegments == 0 ||
					zSegments == segments - 1
				) {
					blocks.push(
						new Block(
							centerBlock.pos.x -
								(sizePerBlock * segments) / 2 +
								sizePerBlock / 2 +
								sizePerBlock * xSegments,
							centerBlock.pos.y -
								(sizePerBlock * segments) / 2 +
								sizePerBlock / 2 +
								sizePerBlock * ySegments,
							centerBlock.pos.z -
								(sizePerBlock * segments) / 2 +
								sizePerBlock / 2 +
								sizePerBlock * zSegments,
							sizePerBlock,
							color
						)
					);
					// enable decay on these blocks
					blocks[blocks.length - 1].decay = true;
				}
			}
		}
	}

	return blocks;
}

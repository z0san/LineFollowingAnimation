// is a block that can be drawn
class Block {
	constructor(x, y, z, size, color) {
		this.pos = createVector(x, y, z);
		this.size = size;
		this.color = color;
		this.creation = frameCount;
		// true if this block should get more transparent over time
		this.decay = false;
	}

	// draws the current block
	draw() {
		fill(
			this.color.r,
			this.color.g,
			this.color.b,
			this.decay ? 255 - (frameCount - this.creation) : 255
		);
		translate(-this.pos.x, -this.pos.y, -this.pos.z);
		box(this.size);
		translate(this.pos.x, this.pos.y, this.pos.z);
	}
}

import { parameters } from './gui.js';

export default class Ball {
  constructor(x, y, diameter, color) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.mult(parameters.speed);
    this.acceleration = createVector(0, 0);
    this.diameter = diameter;
    this.color = color;
    this.strokeColor = color;
  }

  update(spectrum) {
    this.diameter = map(
      spectrum[int(random(parameters.lowFreqRangeStart, parameters.lowFreqRangeEnd))],
      0,
      255,
      parameters.size,
      width / parameters.sensitivity
    );
    this.velocity = p5.Vector.random2D();
    this.velocity.mult(parameters.ballSpeed);
    this.position.add(this.velocity);
  }

  updateEmoji(selectedEmoji) {
    this.emoji = selectedEmoji;
  }

  checkEdges() {
    if (this.position.x > width || this.position.x < 0) {
      this.velocity.x = this.velocity.x * -1;
    }
    if (this.position.y > height || this.position.y < 0) {
      this.velocity.y = this.velocity.y * -1;
    }
  }

  display() {
    if (this.emoji) {
      textSize(this.diameter);
      textAlign(CENTER, CENTER);
      text(this.emoji, this.position.x, this.position.y); // Display the emoji
    } else {
      noStroke();
      fill(this.color);
      strokeWeight(parameters.strokeWeight);
      stroke(parameters.strokeColor);
      if (parameters.shape === 'circle') {
        ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
      } else if (parameters.shape === 'square') {
        rect(this.position.x, this.position.y, this.diameter, this.diameter);
      }
      // Add more shapes as needed
    }
  }
}

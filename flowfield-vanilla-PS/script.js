const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 900;

const gui = new lil.GUI();

const image = document.getElementById("logo");
let imageData, data, flowField;

image.onload = function () {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  tempCtx.drawImage(image, 0, 0, canvas.width, canvas.height);
  imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
  data = imageData.data;
  createFlowField();
  animate();
};

function createFlowField() {
  const resolution = 20;
  flowField = new Array(Math.floor(canvas.width / resolution));
  for (let x = 0; x < flowField.length; x++) {
    const col = new Array(Math.floor(canvas.height / resolution));
    for (let y = 0; y < col.length; y++) {
      const index = (y * resolution * canvas.width + x * resolution) * 4;
      const brightness =
        data[index] * 0.3 + data[index + 1] * 0.59 + data[index + 2] * 0.11;
      const angle = (brightness / 255) * Math.PI * 2;
      const vector = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };
      col[y] = vector;
    }
    flowField[x] = col;
  }
}

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.speedX = 0;
    this.speedY = 0;
    this.size = effect.particleSize * Math.random();
    this.color = "white";
  }

  update() {
    const resolution = 20;
    const x = Math.floor(this.x / resolution);
    const y = Math.floor(this.y / resolution);
    const vector = flowField[x] && flowField[x][y];
    if (vector) {
      this.speedX = vector.x * effect.particleSpeed;
      this.speedY = vector.y * effect.particleSpeed;
    }
    this.x += this.speedX;
    this.y += this.speedY;
    if (
      this.x < 0 ||
      this.x > canvas.width ||
      this.y < 0 ||
      this.y > canvas.height
    ) {
      this.reset();
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

const particles = [];

class Effect {
  constructor() {
    this.numberOfParticles = 500;
    this.particleSpeed = 2;
    this.particleSize = 5;
    this.createGUI();
  }

  createParticles() {
    for (let i = 0; i < this.numberOfParticles; i++) {
      particles.push(new Particle());
    }
  }

  createGUI() {
    const settings = gui.addFolder("Particle Settings");
    settings.add(this, "numberOfParticles", 0, 5000).onChange(() => {
      particles.length = 0;
      this.createParticles();
    });
    settings.add(this, "particleSpeed", 0, 5);
    settings.add(this, "particleSize", 1, 50).onChange(() => {
      for (let particle of particles) {
        particle.size = this.particleSize * Math.random();
      }
    });
  }
}

const effect = new Effect();
effect.createParticles(); // Ensure particles are created after effect is initialized.

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let particle of particles) {
    particle.update();
    particle.draw();
  }
  requestAnimationFrame(animate);
}

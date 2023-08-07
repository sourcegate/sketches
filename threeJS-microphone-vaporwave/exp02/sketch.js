let canvas;
let tweakpane;
let params = {
  background: '#000000',
  noise: '#ffffff',
  weight: 1,
  noiseScale: 0.1,
  terrainDetail: 0.07,
  animationSpeed: 0.02,
};

let zoff = 0;

function setup() {
  const canvasWidth = windowWidth;
  const canvasHeight = windowHeight;
  canvas = createCanvas(canvasWidth, canvasHeight, WEBGL);
  canvas.position(0, 0);
  canvas.style('z-index', '1');
  colorMode(RGB);
  noFill();
  initializeTweakpane();
}

function initializeTweakpane() {
  // Tweakpane setup
  const tweakpaneWrapper = document.getElementById('tweakpane-wrapper');
  tweakpane = new Tweakpane();
  tweakpaneWrapper.appendChild(tweakpane.domElement);

  // Create a folder for the background color picker
  const backgroundFolder = tweakpane.addFolder({ title: 'Background Color' });
  backgroundFolder.addInput(params, 'background');
  backgroundFolder.addInput(params, 'noise');

  tweakpane.addInput(params, 'weight', { min: 0, max: 10 });
  tweakpane.addInput(params, 'noiseScale', { min: 0.01, max: 100, step: 0.01 });
  tweakpane.addInput(params, 'terrainDetail', { min: 0.01, max: 10, step: 0.01 });

  // Add the animation speed parameter
  tweakpane.addInput(params, 'animationSpeed', { min: 0.01, max: 5, step: 0.01 });

  // Adding the random color and download buttons
  tweakpane.addButton({ title: 'Random Color' }).on('click', () => {
    let r = Math.floor(random(256));
    let g = Math.floor(random(256));
    let b = Math.floor(random(256));

    params.background = rgbToHex(r, g, b);
    params.noise = rgbToHex(255 - r, 255 - g, 255 - b);
  });

  tweakpane.addButton({ title: 'Download Screenshot' }).on('click', () => {
    const currentDate = new Date();
    const dateString = currentDate.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_'); // Get formatted date string
    const filename = `screenshot_${dateString}.jpg`; // Appending date and time to the filename
    saveCanvas(canvas, filename, 'jpg');
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(params.background);

  // Creating the Perlin noise landscape
  stroke(params.noise);
  strokeWeight(params.weight);

  rotateX(PI / 3); // Adjusts the angle at which we view the landscape
  translate(-width / 2, -height / 3); // Adjusts the vertical position of the landscape

  for (let y = 0; y < height; y += 5) {
    beginShape();
    for (let x = 0; x < width; x += 5) {
      let nx = map(x, 0, width, -1, 1);
      let ny = map(y, 0, height, -1, 1);
      let nz = map(zoff, 0, width, -1, 1);
      let elevation = map(noise(nx * params.noiseScale, ny * params.noiseScale, nz * params.terrainDetail), 0, 1, -150, 150);
      vertex(x, y, elevation);
    }
    endShape();
  }

  // Animate the z offset with the given animation speed
  zoff += params.animationSpeed;

  // Add 3D rotation controls
  orbitControl();
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

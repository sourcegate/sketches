let canvas;
let params = {
  background: '#000000',
  noise: '#ffffff',
  weight: 1,
  noiseScale: 0.1,
  terrainDetail: 0.07,
  animationSpeed: 0.02,
  textShadowBlurBase: 10,
  glowSpeed: 0.05,
  easing: 'linear',
  mixBlendMode: 'screen',
  camera: 'none',  // New parameter
  rotationSpeed: 0.01  // New parameter
};
let textShadowBlur = params.textShadowBlurBase;
let zoff = 0;
let gui;
let randomAxis;

// Easing functions
const easingFunctions = {
  'linear': t => t,
  'easeInQuad': t => t * t,
  'easeOutQuad': t => t * (2 - t),
  'easeInOutQuad': t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  'easeInCubic': t => t * t * t,
  'easeOutCubic': t => (--t) * t * t + 1,
  'easeInOutCubic': t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};

function setup() {
  const canvasWidth = windowWidth;
  const canvasHeight = windowHeight;
  canvas = createCanvas(canvasWidth, canvasHeight, WEBGL);
  canvas.position(0, 0);
  canvas.style('z-index', '1');
  colorMode(RGB);
  noFill();

  gui = new lil.GUI();
  initializeLilGui();
  gui.hide();

  updateTitleShadow();
  updateMixBlendMode();
}

function initializeLilGui() {
  const urlParams = new URLSearchParams(window.location.search);
  params.background = urlParams.get('background') || params.background;
  params.noise = urlParams.get('noise') || params.noise;
  params.weight = parseFloat(urlParams.get('weight')) || params.weight;
  params.noiseScale = parseFloat(urlParams.get('noiseScale')) || params.noiseScale;
  params.terrainDetail = parseFloat(urlParams.get('terrainDetail')) || params.terrainDetail;
  params.animationSpeed = parseFloat(urlParams.get('animationSpeed')) || params.animationSpeed;
  params.glowSpeed = parseFloat(urlParams.get('glowSpeed')) || params.glowSpeed;
  params.easing = urlParams.get('easing') || params.easing;
  params.mixBlendMode = urlParams.get('mixBlendMode') || params.mixBlendMode;
  params.textShadowBlurBase = parseFloat(urlParams.get('textShadowBlurBase')) || params.textShadowBlurBase;
  params.camera = urlParams.get('camera') || params.camera;
  params.rotationSpeed = parseFloat(urlParams.get('rotationSpeed')) || params.rotationSpeed;

  const controllers = [
    gui.addColor(params, 'background'),
    gui.addColor(params, 'noise'),
    gui.add(params, 'weight', 0, 10),
    gui.add(params, 'noiseScale', 0.01, 100).step(0.01),
    gui.add(params, 'terrainDetail', 0.01, 10).step(0.01),
    gui.add(params, 'animationSpeed', 0.01, 5).step(0.01),
    gui.add(params, 'glowSpeed', 0.01, 2).step(0.01),
    gui.add(params, 'easing', ['linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeInCubic', 'easeOutCubic', 'easeInOutCubic']),
    gui.add(params, 'mixBlendMode', ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']).onChange(value => {
      params.mixBlendMode = value;
      updateMixBlendMode();
    }),
    gui.add(params, 'camera', ['none', 'horizontal', 'random']).onChange(value => {
      params.camera = value;
      if (value === 'random') {
        randomAxis = createVector(random(-1, 1), random(-1, 1), random(-1, 1));
      }
    }),
    gui.add(params, 'rotationSpeed', 0.01, 1).step(0.01),
    gui.add(params, 'textShadowBlurBase').min(0).max(30).step(1).onChange(value => {
      textShadowBlur = value;
      updateTitleShadow();
    })
  ];

  controllers.forEach(controller => {
    controller.onChange(() => {
      const urlParams = new URLSearchParams();
      urlParams.append('background', params.background);
      urlParams.append('noise', params.noise);
      urlParams.append('weight', params.weight);
      urlParams.append('noiseScale', params.noiseScale);
      urlParams.append('terrainDetail', params.terrainDetail);
      urlParams.append('animationSpeed', params.animationSpeed);
      urlParams.append('glowSpeed', params.glowSpeed);
      urlParams.append('easing', params.easing);
      urlParams.append('mixBlendMode', params.mixBlendMode);
      urlParams.append('camera', params.camera);
      urlParams.append('rotationSpeed', params.rotationSpeed);
      urlParams.append('textShadowBlurBase', params.textShadowBlurBase);

      const newUrl = window.location.origin + window.location.pathname + '?' + urlParams.toString();
      window.history.pushState({}, '', newUrl);
    });
  });

  gui.add({
    'Random Color': function() {
      let r = Math.floor(random(256));
      let g = Math.floor(random(256));
      let b = Math.floor(random(256));

      params.background = rgbToHex(r, g, b);
      params.noise = rgbToHex(255 - r, 255 - g, 255 - b);

      controllers[0].updateDisplay();
      controllers[1].updateDisplay();
    }
  }, 'Random Color');
}

function keyPressed() {
  if (key === 'h' || key === 'H') {
    if (gui.domElement.style.display === 'none') {
      gui.show();
    } else {
      gui.hide();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(params.background);

  stroke(params.noise);
  strokeWeight(params.weight);

  rotateX(PI / 3);
  translate(-width / 2, -height / 3);

  for (let y = 0; y < height; y += 5) {
    beginShape();
    for (let x = 0; x < width; x += 5) {
      if (params.camera === 'horizontal') {
        rotateY(frameCount * params.rotationSpeed);
      } else if (params.camera === 'random') {
        rotate(frameCount * params.rotationSpeed, randomAxis);
      }

      let nx = map(x, 0, width, -1, 1);
      let ny = map(y, 0, height, -1, 1);
      let nz = map(zoff, 0, width, -1, 1);
      let elevation = map(noise(nx * params.noiseScale, ny * params.noiseScale, nz * params.terrainDetail), 0, 1, -150, 150);
      vertex(x, y, elevation);
    }
    endShape();
  }

  zoff += params.animationSpeed;

  let t = (sin(frameCount * params.glowSpeed) + 1) / 2;
  textShadowBlur = params.textShadowBlurBase + easingFunctions[params.easing](t) * 8; // Update textShadowBlur
  updateTitleShadow();
}


function updateTitleShadow() {
  document.querySelector('#title').style.textShadow = `0 0 ${textShadowBlur}px #fff, 0 0 ${textShadowBlur * 3}px #fff, 0 0 ${textShadowBlur * 6}px #fff, 0 0 ${textShadowBlur * 9}px ${params.noise}, 0 0 ${textShadowBlur * 12}px ${params.noise}, 0 0 ${textShadowBlur * 15}px ${params.noise}, 0 0 ${textShadowBlur * 18}px ${params.noise}`;
}

function updateMixBlendMode() {
  document.querySelector('#title').style.mixBlendMode = params.mixBlendMode;
  void document.querySelector('#title').offsetHeight;
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

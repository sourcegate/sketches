// Define necessary global variables
let scene, camera, renderer, controls, stats, analyzer, data;

// Create a 3D primitive shapes
const shapes = [];

function init() {
  // Initialize scene, camera and renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();

  // Configure renderer and add it to the DOM
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Configure controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  
  // Configure stats (performance monitor)
  stats = new Stats();
  document.body.appendChild(stats.dom);

  // Create 3D primitive shapes and add them to the scene
  for(let i = 0; i < 50; i++) {
    const geometry = new THREE.SphereGeometry(Math.random(), Math.random(), Math.random()); // Geometry for the shape
    const material = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff}); // Material for the shape
    const shape = new THREE.Mesh(geometry, material); // Create the shape
    shapes.push(shape); // Add shape to the shapes array
    scene.add(shape); // Add shape to the scene
  }

  // Position the camera
  camera.position.z = 5;

  // Setup audio analysis
  setupAudioProcessing();
}

// Setup the audio processing
function setupAudioProcessing() {
  // Create an audio context
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Create an audio analyzer
  analyzer = audioContext.createAnalyser();
  analyzer.fftSize = 512; // Set the FFT size

  // Create audio source from the microphone
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyzer);

  // Create an array to hold the audio data
  data = new Uint8Array(analyzer.frequencyBinCount);

  // Start the rendering loop
  animate();
}

// Animate the scene
function animate() {
  // Request next frame
  requestAnimationFrame(animate);

  // Update the analyzer data
  analyzer.getByteFrequencyData(data);

  // Update the scale and color of each shape based on the audio data
  shapes.forEach((shape, i) => {
    // Scale the shape
    shape.scale.x = 1 + data[i] / 255;
    shape.scale.y = 1 + data[i] / 255;
    shape.scale.z = 1 + data[i] / 255;

    // Change the color of the shape
    shape.material.color.setHSL(data[i] / 255, 1, 0.5);
  });

  // Render the scene
  renderer.render(scene, camera);

  // Update controls
  controls.update();

  // Update stats
  stats.update();
}

// Call the initialization function when the window loads
window.onload = init;

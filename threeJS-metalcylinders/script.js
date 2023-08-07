let scene, camera, renderer, controls;
let cylinders = [];

// 2D vector to store the mouse position.
let mouse = new THREE.Vector2();

// Linear interpolation function
function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Add lights to enable the shiny metal material.
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.querySelector('#canvas-container').appendChild(renderer.domElement);

  // Add OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  for (let i = 0; i < 30; i++) {
    let geometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
    // Create a shiny metal material.
    let material = new THREE.MeshStandardMaterial({ color: new THREE.Color("hsl(" + Math.random() * 360 + ", 100%, 50%)"), metalness: 0.8, roughness: 0.2 });
    let cylinder = new THREE.Mesh(geometry, material);

    // Arrange the cylinders in a ring.
    let angle = i * Math.PI * 2 / 30; // Divide the circle into 30 segments.
    cylinder.position.x = Math.cos(angle);
    cylinder.position.z = Math.sin(angle);

    // Add a random float effect to each cylinder.
    cylinder.floatSpeed = Math.random() * 0.02 + 0.01;  // Random speed between 0.01 and 0.03
    cylinder.floatDirection = Math.random() > 0.5 ? 1 : -1;  // Random direction (up or down)

    scene.add(cylinder);
    cylinders.push(cylinder);
  }

  animateCylinders();

  // Initialize Hammer.js
  var hammertime = new Hammer(document.querySelector('#canvas-container'));
  hammertime.get('pinch').set({ enable: true });
  hammertime.on('pinchstart pinchmove', function(ev) {
    // prevent default browser behavior
    ev.preventDefault();
  });

  // Set gradient background.
  setGradientBackground();

  // Add mouse move listener.
  window.addEventListener('mousemove', onMouseMove, false);
}

function onMouseMove(event) {
  // Normalize the mouse position from -1 to 1.
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function animateCylinders() {
  cylinders.forEach((cylinder, i) => {
    // Rotate the cylinder around the center.
    let angle = Math.atan2(cylinder.position.z, cylinder.position.x) + 0.01;
    cylinder.position.x = Math.cos(angle);
    cylinder.position.z = Math.sin(angle);

    // Move the cylinder closer to or further from the center based on the mouse position.
    let distance = lerp(0.5, 1.5, (mouse.x + 1) / 2);
    cylinder.position.multiplyScalar(distance);

    // Rotate the cylinder to face the direction of movement.
    cylinder.rotation.y = angle + Math.PI / 2;

    // Rotate the cylinder based on the mouse position.
    cylinder.rotation.x += (mouse.y + 1) * 0.01;  // The "+ 1" is to normalize the mouse.y value to a 0-2 range
    cylinder.rotation.z += (mouse.x + 1) * 0.01;  // Same for mouse.x

    // Apply the floating effect.
    cylinder.position.y += cylinder.floatSpeed * cylinder.floatDirection;
    if (cylinder.position.y > 0.5) {
      cylinder.floatDirection = -1;
    } else if (cylinder.position.y < -0.5) {
      cylinder.floatDirection = 1;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();  // Update OrbitControls.
  animateCylinders();  // Add this line.
  renderer.render(scene, camera);
}

function setGradientBackground() {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'purple');
  gradient.addColorStop(1, 'skyblue');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);

  scene.background = texture;
}

init();
animate();

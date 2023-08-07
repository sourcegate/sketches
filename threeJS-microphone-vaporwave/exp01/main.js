import * as THREE from 'https://threejs.org/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let shapes = [];
const vaporWaveColors = ['#ff6ac1', '#18dcff', '#7d5fff', '#feca57', '#ff9ff3'];
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32);

let guiParams = {
  numShapes: 190,
  cubeColor: vaporWaveColors[0],
  sphereColor: vaporWaveColors[1],
  coneColor: vaporWaveColors[2],
  startShapeSize: 30,
  maxShapeSize: 3,
};

const gui = new dat.GUI();

let isGuiVisible = false;
gui.hide();
window.addEventListener('keypress', function(e) {
  if (e.key === 'h') {
    if (isGuiVisible) {
      gui.hide();
    } else {
      gui.show();
    }
    isGuiVisible = !isGuiVisible;
  }
});

const numShapesControl = gui.add(guiParams, 'numShapes', 1, 500).step(1);
const cubeColorControl = gui.addColor(guiParams, 'cubeColor');
const sphereColorControl = gui.addColor(guiParams, 'sphereColor');
const coneColorControl = gui.addColor(guiParams, 'coneColor');
const startSizeControl = gui.add(guiParams, 'startShapeSize', 0.1, 3);
const maxSizeControl = gui.add(guiParams, 'maxShapeSize', 1, 500);

function getRandomPosition() {
  const range = 10;
  return Math.random() * range - range / 2;
}

function addFadeOutStyle() {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    .fade-out {
      transition: opacity 1s ease-out;
      opacity: 0;
      visibility: hidden;
    }
  `;
  document.getElementsByTagName('head')[0].appendChild(style);
}

addFadeOutStyle();

function createShapes(numShapes) {
  shapes.forEach(shape => scene.remove(shape));
  shapes = [];
  for (let i = 0; i < numShapes; i++) {
    const shapeType = Math.floor(Math.random() * 3);
    const colorIndex = (shapeType === 0) ? 0 : ((shapeType === 1) ? 1 : 2);
    const shapeMaterial = new THREE.MeshBasicMaterial({ color: guiParams[`${shapeType === 0 ? 'cube' : (shapeType === 1 ? 'sphere' : 'cone')}Color`], wireframe: true });
    let shape;
    switch (shapeType) {
      case 0:
        shape = new THREE.Mesh(cubeGeometry, shapeMaterial);
        break;
      case 1:
        shape = new THREE.Mesh(sphereGeometry, shapeMaterial);
        break;
      case 2:
        shape = new THREE.Mesh(coneGeometry, shapeMaterial);
        break;
    }
    shape.position.set(getRandomPosition(), getRandomPosition(), getRandomPosition());
    shapes.push(shape);
    scene.add(shape);
  }
}

camera.position.z = 15;
let audioContext;
let microphoneStream;

numShapesControl.onChange((value) => {
  createShapes(value);
});

cubeColorControl.onChange(() => {
  createShapes(guiParams.numShapes);
});

sphereColorControl.onChange(() => {
  createShapes(guiParams.numShapes);
});

coneColorControl.onChange(() => {
  createShapes(guiParams.numShapes);
});

startSizeControl.onChange(() => {
  shapes.forEach(shape => shape.scale.set(guiParams.startShapeSize, guiParams.startShapeSize, guiParams.startShapeSize));
});

maxSizeControl.onChange(() => {
});

function initializeAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      microphoneStream = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      microphoneStream.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      function updateScene() {
        analyser.getByteFrequencyData(dataArray);
        const loudness = dataArray.reduce((acc, value) => acc + value, 0) / bufferLength;
        const scale = Math.min(loudness / 256, guiParams.maxShapeSize);
        shapes.forEach(shape => shape.scale.set(guiParams.startShapeSize * scale, guiParams.startShapeSize * scale, guiParams.startShapeSize * scale));
        requestAnimationFrame(updateScene);
      }
      updateScene();
    })
    .catch((err) => console.error('Error accessing microphone:', err));
  document.getElementById('startButtonContainer').classList.add('fade-out');
}

document.getElementById("startButton").addEventListener("click", function() {
  initializeAudio();
  createShapes(guiParams.numShapes);
});

function animate() {
  shapes.forEach(shape => shape.rotation.x += 0.01);
  shapes.forEach(shape => shape.rotation.y += 0.01);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

document.addEventListener("DOMContentLoaded", function() {
  document.ontouchmove = function(event) {
    event.preventDefault();
  }
});

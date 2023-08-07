import { togglePlay } from './main.js';

let trackOptions = [
  'ouat.mp3',
  'defame.mp3',
  'drum.mp3',
  'concrete.mp3',
  'lostsouls.mp3',
  'iridescene.mp3',
  'microphone'
];

let parameters = {
  size: 10,
  speed: 1,
  color: [255, 255, 255],
  sensitivity: 5,
  ballSpeed: 1,
  lowFreqRangeStart: 0,
  lowFreqRangeEnd: 10,
  midFreqRangeStart: 200,
  midFreqRangeEnd: 210,
  highFreqRangeStart: 1000,
  highFreqRangeEnd: 1010,
  strokeWeight: 2,
  strokeColor: [255, 255, 255],
  shape: 'circle',
  selectedTrack: 'concrete.mp3',
  selectedEmoji: '😀' // Default selected emoji
};

window.parameters = parameters;

window.onload = function() {
  // Load parameters from URL
  let urlParams = new URLSearchParams(window.location.search);
  for (let [key, value] of urlParams.entries()) {
    parameters[key] = JSON.parse(value);
  }

  let gui = new dat.GUI({ autoPlace: false, closed: true }); // Hide on load
  document.getElementById('gui-container').appendChild(gui.domElement); // Place in custom container
  gui.add(parameters, 'size', 1, 100).onChange(saveParameters);
  gui.add(parameters, 'speed', 0.1, 10).onChange(saveParameters);
  gui.addColor(parameters, 'color').onChange(saveParameters);
  gui.add(parameters, 'sensitivity', 1, 10).onChange(saveParameters);
  gui.add(parameters, 'ballSpeed', 0.1, 10).onChange(saveParameters);
  gui.add(parameters, 'lowFreqRangeStart', 0, 1024).onChange(saveParameters);
  gui.add(parameters, 'lowFreqRangeEnd', 0, 1024).onChange(saveParameters);
  gui.add(parameters, 'midFreqRangeStart', 0, 1024).onChange(saveParameters);
  gui.add(parameters, 'midFreqRangeEnd', 0, 1024).onChange(saveParameters);
  gui.add(parameters, 'highFreqRangeStart', 0, 1024).onChange(saveParameters);
  gui.add(parameters, 'highFreqRangeEnd', 0, 1024).onChange(saveParameters);
  gui.add(parameters, 'strokeWeight', 0, 10).onChange(saveParameters);
  gui.addColor(parameters, 'strokeColor').onChange(saveParameters);
  gui.add(parameters, 'shape', ['circle', 'square']).onChange(saveParameters);
  gui.add(parameters, 'selectedEmoji', ['😀', '😍', '🚀', '🌟', '🤖', '🌈']).onChange(saveParameters).name('Emoji Selection'); // Add emoji selection option
  gui.add(parameters, 'selectedTrack', trackOptions).onChange(function() {
    saveParameters();
    togglePlay();
  }).name('Track Selection');
  let screenshotButton = { 'Download Screenshot': function() { saveScreenshot(); } };
  gui.add(screenshotButton, 'Download Screenshot');

  // Hide or show the GUI when the "H" key is pressed
  window.addEventListener('keydown', function(event) {
    if (event.key === 'h' || event.key === 'H') {
      gui.closed = !gui.closed;
    }
  });

  console.log(`%c
  ██████╗ ███████╗
  ██╔══██╗██╔════╝
  ██████╔╝███████╗
  ██╔═══╝ ╚════██║
  ██║     ███████║
  ╚═╝     ╚══════╝

  Connect with me on Instagram: https://www.instagram.com/sourcegatekeeper/
  `, "font-family:monospace");
};

function saveParameters() {
  let urlParams = new URLSearchParams();
  for (let key in parameters) {
    urlParams.set(key, JSON.stringify(parameters[key]));
  }
  window.history.replaceState({}, '', '?' + urlParams.toString());
}

function saveScreenshot() {
  saveCanvas('screenshot', 'png');
}

export { parameters };

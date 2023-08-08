import { parameters } from "./gui.js";
import Ball from "./ball.js";

let balls = [];
let audioFiles = {};
let audio;
let fft;
let audioLoaded = false;

window.preload = function () {
  audioFiles = {
    "ouat.mp3": loadSound("ouat.mp3"),
    "defame.mp3": loadSound("defame.mp3"),
    "drum.mp3": loadSound("drum.mp3"),
    "concrete.mp3": loadSound("concrete.mp3"),
    "lostsouls.mp3": loadSound("lostsouls.mp3"),
    "iridescene.mp3": loadSound("iridescene.mp3"),
  };
};

window.setup = function () {
  createCanvas(windowWidth, windowHeight);
  fft = new p5.FFT(0.8, 1024);
  for (let i = 0; i < 200; i++) {
    balls[i] = new Ball(
      random(width),
      random(height),
      parameters.size,
      color(parameters.color)
    );
  }
  let button = select("#start");
  button.mousePressed(togglePlay);
};

window.draw = function () {
  background(0);
  let spectrum = fft.analyze();
  balls.forEach((ball) => {
    ball.update(spectrum);
    ball.checkEdges();
    ball.display();
  });
};

function togglePlay() {
  userStartAudio();
  if (!audioLoaded || parameters.selectedTrack !== audio.url) {
    if (audio) {
      audio.stop();
    }
    audio = audioFiles[parameters.selectedTrack];
    if (!audio) {
      console.error("Error loading audio file:", parameters.selectedTrack);
      return;
    }
    audioLoaded = true;
    audio.amp(parameters.volume);
    audio.loop();
    select("#start").html("Pause");
  } else {
    if (audio.isPlaying()) {
      audio.pause();
      select("#start").html("Play");
    } else {
      audio.play();
      select("#start").html("Pause");
    }
  }
}
export { togglePlay };

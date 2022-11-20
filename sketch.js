// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Basic Pitch Detection
=== */

let audioContext;
let mic;
let pitch;

function setup() {
  noCanvas();
  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(startPitch);
}

function startPitch() {
  pitch = ml5.pitchDetection('./model/', audioContext , mic.stream, modelLoaded);
}

function modelLoaded() {
  select('#status').html('Model Loaded');
  getPitch();
}

function noteFromFrequency(frequency) {
    const frequencyA4 = 440;
    // Source: http://www.phys.unsw.edu.au/jw/notes.html
    var n = Math.abs(Math.round(Math.log2(frequency/frequencyA4)));
    const noteNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    return noteNames[n % noteNames.length];
}

function getPitch() {
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      select('#result').html(frequency);
      select('#note').html(noteFromFrequency(frequency));
    } else {
      select('#result').html('No pitch detected');
    }
    getPitch();
  })
}

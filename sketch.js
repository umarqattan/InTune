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
let notes;
var initializedNotes = false;

function setup() {
    console.log("Setting up...");
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

function getPitch() {
  if (!initializedNotes) { 
    notes = new Notes();
    initializedNotes = true;
  }
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      select('#result').html(frequency);
      select('#note').html(notes.getNoteDescription(frequency));
    } else {
      select('#result').html('No pitch detected');
    }
    getPitch();
  })
}

class Notes {

    constructor() {
  
      this.notesMap = new Map();
      this.frequencyMap = new Map();
      this.noteFreqMap = new Map();
      this.numberOfSemitones = 7*9 + 9*5;
      
      var current = 0;
      var currentNote = '';
      var currentOctave = 0;
      var notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      var previousNote = '';
      var currentFrequency = 27.5;
      for (var i = 0; i < this.numberOfSemitones; i++) {
        if (previousNote.length === 0) {
          currentNote = notes[current];
          current = (current + 1) % notes.length;
        } else if (previousNote.includes('B') || previousNote.includes('E') || previousNote.includes('#')) {
          currentNote = notes[current];
          current = (current + 1) % notes.length;
        } else if (currentNote.includes('#') == false) {
          currentNote = `${currentNote}#`;
        } else {
          currentNote = notes[current];
          current = (current + 1) % notes.length;
        }
      
        if (currentNote === 'C') {
          currentOctave += 1;
        }
      
        previousNote = `${currentNote}${currentOctave}`;
        this.notesMap[`${i}`] = previousNote;
      
        this.frequencyMap[previousNote] = [currentFrequency, currentFrequency * Math.pow(2, 1.0 / 12.0) * 0.9999];
        this.noteFreqMap[previousNote] = currentFrequency;
        currentFrequency = (currentFrequency * Math.pow(2, 1.0 / 12.0));
      }
    }
  
    getNoteForFrequency(frequency) {
      return this.notesMap[this.getNumberOfSemitonesFromStartFrequency(frequency)];
    }
  
    getNumberOfSemitonesFromStartFrequency(frequency) {
      return Math.ceil(Math.log2(frequency/this.noteFreqMap['A0']));
    }
  
    getNumberOfCentsFromStartFrequency(frequency) {
      return ((Math.log2(frequency/this.noteFreqMap['A0'])) * 10) % 10 / 10;
    }
  
    getNoteDescription(frequency) {
      return `You are ${Math.round(this.getNumberOfCentsFromStartFrequency(frequency) * 100)}% from ${this.getNoteForFrequency(frequency)
    }`
  }
}
// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Basic Pitch Detection
=== */


const {
    Renderer,
    Stave,
    StaveNote,
    Voice,
    Formatter
  } = Vex.Flow;
  
  // Create an SVG renderer and attach it to the DIV element named "boo".
  const div = document.getElementById('output');
  const renderer = new Renderer(div, Renderer.Backends.SVG);
  
  // Configure the rendering context.
  renderer.resize(500, 500);
  const context = renderer.getContext();
  
  // Create a stave of width 400 at position 10, 40 on the canvas.
  const stave = new Stave(10, 40, 150);
  
  // Add a clef and time signature.
  stave.addClef('treble').addTimeSignature('4/4');
  
  // Connect it to the rendering context and draw!
  stave.setContext(context).draw();
  


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

function setFlat() { 
    notes.isFlat = !notes.isFlat;
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

        // Create the notes
        var notes_ = [
        // A quarter-note C.
        new StaveNote({
            keys: [`${notes.getNoteForFrequency(frequency)}`],
            duration: 'q'
        }),
  
    ];
  
    // Create a voice in 4/4 and add above notes
    const voice = new Voice({
        num_beats: 1,
        beat_value: 4
    });
    voice.addTickables(notes_);
  
    // Format and justify the notes to 150 pixels.
    new Formatter().joinVoices([voice]).format([voice], 150);
  
    // Render voice
    voice.draw(context, stave);

    } else {
      select('#result').html('No pitch detected');
    }
    getPitch();
  })
}

class Notes {
    constructor() {
      var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
      var flatNotes = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];
      this.numberOfOctaves = 9;
      this.currentOctave = 0;
      this.currentFlatOctave = 0;
      this.currentNote = '';
      this.currentFlatNote = '';
      this.currentFrequency = 27.5;
      this.noteFreqMap = new Map();
      this.noteFreqMapFlat = new Map();
      this.notesMap = new Map();
      this.isFlat = false;
  
      for (var i = 0; i < 109; i++) {
        this.currentNote = notes[i % notes.length];
        this.currentFlatNote = flatNotes[i % flatNotes.length];
        if (this.currentNote === 'C') {
          this.currentOctave += 1;
        }
        if (this.currentFlatNote === 'C') {
          this.currentFlatOctave += 1;
        }
  
        this.noteFreqMap[`${this.currentNote}/${this.currentOctave}`] = this.currentFrequency;
        this.noteFreqMapFlat[`${this.currentFlatNote}/${this.currentOctave}`] = this.currentFrequency;
        console.log(`${this.currentNote}/${this.currentOctave}: ${this.currentFrequency}`);
        console.log(`${this.currentFlatNote}/${this.currentFlatOctave}: ${this.currentFrequency}`);
        this.notesMap[`${i}`] = [`${this.currentFlatNote}/${this.currentFlatOctave}`, `${this.currentNote}/${this.currentOctave}`];
        this.currentFrequency = (this.currentFrequency * Math.pow(2, 1.0 / 12.0));
      }
    }
  
    getNoteForFrequency(frequency) {
      let index = this.isFlat ? 0 : 1;
      return this.notesMap[this.getNumberOfSemitonesFromStartFrequency(frequency)][index];
    }
  
    getNumberOfSemitonesFromStartFrequency(frequency) {
      return Math.floor(12 * Math.log2(frequency / this.noteFreqMap['A/0']));
    }
  
    getNumberOfCentsFromStartFrequency(frequency) {
      return ((12 * Math.log2(frequency / this.noteFreqMap['A/0'])) * 10) % 10 / 10;
    }
  
    getNoteDescription(frequency) {
      return `You are ${Math.round(this.getNumberOfCentsFromStartFrequency(frequency) * 100)}% from ${this.getNoteForFrequency(frequency)}`
    }
  }
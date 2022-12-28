// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Basic Pitch Detection
=== */


const { Renderer, TickContext, Stave, StaveNote, Accidental, Voice, KeySignature, Formatter, Beam } = Vex.Flow;

var context;
var context2;
var context3;
var stave;
var allNotes = [];
var beams = null;

let audioContext;
let mic;
let pitch;
let notes;
var noteExists = false;
var lastNote = null;
var currentFrequency;
var sameNoteCount = 0;
var currentBachNoteIndex = 0;

function pitchDetection() { 
    // Create an SVG renderer and attach it to the DIV element named "output".
    const div = document.getElementById('output');
    const renderer = new Renderer(div, Renderer.Backends.SVG);

    // Configure the rendering context.
    renderer.resize(500, 300);
    context = renderer.getContext();

    // Create a stave of width 300 at position 5, 5 on the canvas.
    stave = new Stave(10, 10, 200);

    // Add a clef and time signature.
    stave.addClef('treble');

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();
};

function bachPartita() { 
    const div = document.getElementById('output3');
    const renderer = new Renderer(div, Renderer.Backends.SVG);

    renderer.resize(500, 300);
    context3 = renderer.getContext();

    stave = new Stave(10, 10, 400);
    stave.addClef('treble').addTimeSignature('3/4');
    stave.setKeySignature('E');
    stave.setContext(context3).draw();

    const notes1 = [
        new StaveNote({keys: ['b/4'], duration: '8r'})
    ];

    const notes2 = [
        new StaveNote({keys: ['e/6'], duration: '16', auto_stem: true}),
        new StaveNote({keys: ['d#/6'], duration: '16', auto_stem: true}).addModifier(new Accidental('#'))
    ];

    const notes3 = [
        new StaveNote({keys: ['e/6'], duration: '8', auto_stem: true}),
        new StaveNote({keys: ['b/5'], duration: '8', auto_stem: true}),
        new StaveNote({keys: ['g#/5'], duration: '8', auto_stem: true}).addModifier(new Accidental('#')),
        new StaveNote({keys: ['b/5'], duration: '8', auto_stem: true})
    ];

    allNotes = notes1.concat(notes2).concat(notes3);
    allNotes[0].setStyle({fillStyle: 'purple', strokeStyle: 'purple'});
    beams = [new Beam(notes2), new Beam(notes3)];

    Formatter.FormatAndDraw(context3, stave, allNotes);
    
    beams.forEach((b) => { 
        b.setContext(context3).draw();
    });
};
 
function sightReading() { 
    const div2 = document.getElementById("output2");
    const renderer2 = new Renderer(div2, Renderer.Backends.SVG);
  
    renderer2.resize(500, 300);
    context2 = renderer2.getContext();
    const tickContext = new TickContext();
  
    const stave2 = new Stave(5, 5, 10000).addClef("treble");
    stave2.setKeySignature("E");
    stave2.addTimeSignature("3/4");
    stave2.setContext(context2).draw();
  
    const notes2 = [
      ["b", "", "4", "8r"],
      ["e", "", "6", "16"],
      ["d", "#", "6", "16"],
      ["e", "", "6", "8"],
      ["b", "", "5", "8"],
      ["g", "#", "5", "8"],
      ["b", "", "5", "8"],
      ["e", "", "5", "16"],
      ["f", "#", "5", "16"],
      ["e", "", "5", "16"],
      ["d", "#", "5", "16"]
    ].map(([letter, accidental, octave, duration]) => { 
      const note = new StaveNote({
          clef: "treble",
          keys: [`${letter}${accidental}/${octave}`],
          duration: duration,
          auto_stem: true
      })
      note.setContext(context2).setStave(stave2);
      if (accidental) { 
          note.addModifier(new Accidental(accidental));
      }
      tickContext.addTickable(note);
      return note;
    });
  
    tickContext.preFormat().setX(400);
  
    const visibleNoteGroups = [];
  
    document.getElementById("add-note").addEventListener("click", (e) => { 
      var note = notes2.shift();
      if (!note) { 
          console.log("Done");
          return;
      }
      const group = context2.openGroup();
      visibleNoteGroups.push(group);
      note.draw();
      context2.closeGroup();
      group.classList.add("scroll");
  
      const box = group.getBoundingClientRect();
      group.classList.add("scrolling");
  
      window.setTimeout(() => { 
          const index = visibleNoteGroups.indexOf(group);
          if (index === -1) return;
          group.classList.add("too-slow");
          visibleNoteGroups.shift();
      }, 5000);
    });
  
    document.getElementById("right-answer").addEventListener("click", (e) => {
      if (visibleNoteGroups.length === 0) return;
      group = visibleNoteGroups.shift();
      group.classList.add("correct");
  
      const transformMatrix = window.getComputedStyle(group).transform;
  
      const x = transformMatrix.split(",")[4].trim();
      group.style.transform = `translate(${x}px, -800px)`;
    });
};
  

function setup() {
    noCanvas();

    notes = new Notes();
    pitchDetection();
    sightReading();
    bachPartita();

    // TODO: fix weird y-axis issue with the Pitch Detection div
    console.log("Setting up...");
    
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
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
        
        select('#result').html(frequency);
        select('#note').html(notes.getNoteDescription2(frequency));

        let currentNote = `${notes.getNoteForFrequency(frequency)}`
        var newNote = new StaveNote({
            clef: 'treble',
            keys: [currentNote],
            duration: 'q',
            auto_stem: true
        })
        let accidental = `${notes.getAccidentalFromNote(currentNote)}`;
        if (accidental.length > 0) {
            newNote.addModifier(new Accidental(accidental));
        }

        // Create a voice in 4/4 and add above notes
        const voice = new Voice({
            num_beats: 1,
            beat_value: 4
        });
        voice.addTickables([newNote]);
  
        // Format and justify the notes to 150 pixels.
        new Formatter().joinVoices([voice]).format([voice], 150);
    
        if (lastNote !== null) {
            let distance = notes.getDistanceBetweenNotes(lastNote, currentNote)
            if (notes.isNoteWithinThreshold(currentNote)) { 
                if (!noteExists) { 
                    voice.draw(context, stave);
                    noteExists = true;
                } else { 
                    document.querySelector(".vf-stavenote").remove() 
                    noteExists = false;
                }
            }
        } else { 
            if (notes.isNoteWithinThreshold(currentNote)) { 
                if (!noteExists) { 
                    voice.draw(context, stave);
                    noteExists = true;
                }
            }
        }

        lastNote = currentNote;

        if (currentBachNoteIndex < allNotes.length && currentNote.toLowerCase() === allNotes[currentBachNoteIndex].keys[0] && allNotes[currentBachNoteIndex].noteType == 'n' && notes.getCentsFromFrequency(frequency) <= 30) {
            
            if (sameNoteCount < allNotes[currentBachNoteIndex].duration * 2) {
                sameNoteCount += 1;
            } else { 
                sameNoteCount = 0;
                updateCurrentNoteColor();
            }
        }
        
    } else {
        select('#result').html('No pitch detected');
        if (currentBachNoteIndex < allNotes.length) { 
            const restNote = allNotes[currentBachNoteIndex];
            if (restNote.noteType === 'r') { 
                if (sameNoteCount < restNote.duration) { 
                    sameNoteCount += 1;
                } else { 
                    sameNoteCount = 0;
                    updateCurrentNoteColor();
                }
            }
        } else { 

        }
        
    }
    getPitch();
  })
}

function updateCurrentNoteColor() {
    if (currentBachNoteIndex >= 0 && currentBachNoteIndex < allNotes.length-1) { 
        currentBachNoteIndex += 1;
        allNotes[currentBachNoteIndex-1].setStyle({fillStyle: 'green', strokeStyle: 'green'});
        allNotes[currentBachNoteIndex].setStyle({fillStyle: 'red', strokeStyle: 'red'});
    } else { 
        allNotes[currentBachNoteIndex].setStyle({fillStyle: 'green', strokeStyle: 'green'});
    }
    Formatter.FormatAndDraw(context3, stave, allNotes);
    beams.forEach((b) => { 
        b.setContext(context3).draw();
    });
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

    getNoteDescription2(frequency) { 
        let index = this.isFlat ? 0 : 1;
        let cents = this.getNumberOfCentsFromStartFrequency(frequency) * 100;
        let semitonesFromStartFrequency = this.getNumberOfSemitonesFromStartFrequency(frequency);
        
        if (cents <= 50) { 
            return `You are ${Math.round(cents)}% from ${this.notesMap[semitonesFromStartFrequency][index]}`;
        } else { 
            return `You are ${Math.round(100-cents)}% from ${this.notesMap[semitonesFromStartFrequency+1][index]}`;
        }
    }

    getCentsFromFrequency(frequency) { 
        return this.getNumberOfCentsFromStartFrequency(frequency) * 100;
    }

    getAccidentalFromNote(note) {
        if (note.includes("#")) {
            return '#'
        } else if (note.includes("b")) { 
            return 'b'
        } else { 
            return ''
        }
    }

    getAccidentalFromFrequency(frequency) { 
        let note = this.getNoteForFrequency(frequency);
        return this.getAccidentalFromNote(note);
    }

    getDistanceBetweenNotes(lnote, rnote) { 
        let lnoteFrequency = this.noteFreqMap[lnote];
        let rnoteFrequency = this.noteFreqMap[rnote];
        return Math.abs(Math.floor(12 * Math.log2(lnoteFrequency / rnoteFrequency)));
    }

    isNoteWithinThreshold(note) { 
        let frequency = this.noteFreqMap[note];
        let lFrequency = this.noteFreqMap['G/3'];
        let hFrequency = this.noteFreqMap['F/6'];

        return lFrequency <= frequency && frequency <= hFrequency;
    }
}

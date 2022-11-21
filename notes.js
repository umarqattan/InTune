
/*
    Distance between notes

    2^(1/12) = 1.059

    440 Hz / (2^(n/12)) where n is the number of notes to skip 
    if n < 0 then the frequency will be the next semitone
    if n > 0 then the frequency will be the previous semitone
    if n == 0 then the frequency is A4

    * The next semitone from A4 is A#4 or B♭4
    * The next semitone from A#4 or B♭4 is B4
    * The next semitone from B4 is B#4 or C5
    * Going from B to C increments the octave
    * B# is an alias of C
    * E# is an alias of F
    * Create a table starting from A0 all the way to A9
    * There are 7 major tones per octave and 5 semitones within an octave.
    * There are 9 octaves between A0 and A9 whose frequencies range between 440/(2^(48/12)) and 440/(2^(-60/12))
    *     spanning 108 semitones.
    * For each semitone from A0 to A9, set the frequency range for A0 from 440/(2^(48/12)) = 27.500 Hz up until the next semitone
    *     440/(2^((48-i)/12)) == 29.135 Hz where i ranges from 0 to 108
*/

export default class Notes {

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



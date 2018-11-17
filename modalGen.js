const fs = require('fs');
const MidiWriter = require('midi-writer-js');
const Tonal = require('tonal');
const Detect = require('tonal-detect');
const Scale = require('tonal-scale');
const Key = require('tonal-key');
const Note = require('tonal-note');
const Chord = require('tonal-chord');
const Range = require('tonal-range');
const tArray = require('tonal-array');
const Distance = require('tonal-distance');
const Interval = require('tonal-interval');
const Dictionary = require('tonal-dictionary');
const { List, fromJS, Set } = require('immutable');

const chroma = () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const shuffle = () => Math.random() - 0.5;
const ascending = (a, b) => a - b;
const descending = (a, b) => b - a;

const allScalesAsDegrees = fromJS(
  Scale.notes('a', 'chromatic')
    .reduce((acc, root) => {
      Dictionary.scale.names().forEach(scale => {
        acc[`${root} ${scale}`] = Set(Scale.notes(root, scale).map(n => Tonal.note(n).chroma)) 
      });
      return acc;
    }, {})
);

function possibleScales(notes) {
  const noteSet = Set(notes);
  return allScalesAsDegrees.filter(scaleSet => scaleSet.isSuperset(noteSet))
}

function pickTwoScalesFor(notes) {
  return possibleScales(notes)
    .filter(set => set.size == 6 || set.size == 7)
    .sort(shuffle)
    .take(2)
    .keySeq();
}

function getSeed() {
  return chroma().sort(shuffle).slice(-5).sort(ascending);
}

let seed;
let scales = List();

function getSeedAndTwoScales() {
  while (scales.size !== 2) {
    seed = getSeed();
    scales = pickTwoScalesFor(seed);
  }
}

getSeedAndTwoScales();

const firstScale = scales.first();
const secondScale = scales.last();
console.log(seed, Scale.notes(firstScale), Scale.notes(secondScale))
const firstChords = Set(Scale.chords(firstScale));
const secondChords = Set(Scale.chords(secondScale));

const uniqueToFirst = firstChords.subtract(secondChords);
const uniqueToSecond = secondChords.subtract(firstChords);
const intersection = firstChords.intersect(secondChords);

function chordFromScale(scale, chord) {
  const root = Scale.tokenize(scale)[0];
  return Chord.notes(root, chord).map(n => Note.from({ oct: 3 }, n));
}


const seedTrack = new MidiWriter.Track();
seedTrack.addEvent(seed.map(n => new MidiWriter.NoteEvent({ pitch: [n + 36], duration: '4' })));


// const firstChordsTrack = new MidiWriter.Track();
// firstChordsTrack.addEvent(uniqueToFirst.toArray().map(chord => {
//   console.log({ pitch: chordFromScale(firstScale, chord), duration: '4' })
//   return new MidiWriter.NoteEvent({ pitch: chordFromScale(firstScale, chord), duration: '4' }) })
// );
console.log(Scale.notes(firstScale).map(n => [Note.from({ oct: 3 }, n)]))
const firstScaleTrack = new MidiWriter.Track()
firstScaleTrack.addEvent(Scale.notes(firstScale).map(n => new MidiWriter.NoteEvent({ pitch: [Note.from({ oct: 3 }, n)], duration: '4' })));

fs.writeFileSync('seed.mid', new MidiWriter.Writer([seedTrack]).buildFile());
fs.writeFileSync('firstScale.mid', new MidiWriter.Writer([firstScaleTrack]).buildFile());

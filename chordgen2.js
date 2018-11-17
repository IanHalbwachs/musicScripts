
const fs = require('fs');
const fromJS = require('immutable').fromJS;
const OrderedSet = require('immutable').OrderedSet;
const MidiWriter = require('midi-writer-js');
const power = require('js-combinatorics').power;

const ascending = (a, b) => a - b;

function dissonanceFilter(chord) {
  let rubs = 0;
  for (let i = 1; i < chord.size; i++) {
    if (chord.get(i) - chord.get(i-1) === 1) {
      rubs += 1;
    }
  }
  return rubs < 2;
}

function openRubs(chord) {
  for (let i = 1; i < chord.size; i++) {
    if (chord.get(i) - chord.get(i-1) === 1) {
      return chord.update(i-1, n => n+12);
    }
  }
  return chord;
}

function getChords(pool) {
  return OrderedSet(fromJS(power(pool).toArray())
    .filter(c => c.size > 2 && c.size < 6)
    .map(c => c.sort())
    .filter(dissonanceFilter)
    .map(openRubs)
    .map(c => c.map(n => n + 60)));
}

const pool = [0,1,2,3,4,5,6,7,8,9,10,11]
  .sort(() => Math.random() - .5)
  .slice(0, 9);

const hexa = pool.slice(0, 6).sort(ascending);
a = pool.slice(6,7);
b = pool.slice(7,8);
const scale1 = hexa.concat(a).sort(ascending);
const scale2 = hexa.concat(b).sort(ascending);

const hexaChords = getChords(hexa);
const scale1Chords = getChords(scale1).subtract(hexaChords);
const scale2Chords = getChords(scale2).subtract(hexaChords);

const name = `${hexa.toString()}-${a},${b}.mid`;
const track = new MidiWriter.Track();

track.addEvent(hexa.map(n => new MidiWriter.NoteEvent({pitch: n + 60, duration: '8'})));
track.addEvent(hexaChords.toArray().map((c, i) =>
  new MidiWriter.NoteEvent({pitch: c.toArray(), duration: '4', wait: i ? null : '4' })));
track.addEvent(scale1.map((n, i) =>
  new MidiWriter.NoteEvent({pitch: n + 60, duration: '8', wait: i ? null : '4' })));
track.addEvent(scale1Chords.toArray().map((c, i) =>
  new MidiWriter.NoteEvent({pitch: c.toArray(), duration: '4', wait: i ? null : '4' })));
track.addEvent(scale2.map((n, i) =>
  new MidiWriter.NoteEvent({pitch: n + 60, duration: '8', wait: i ? null : '4'})));
track.addEvent(scale2Chords.toArray().map((c, i) =>
  new MidiWriter.NoteEvent({pitch: c.toArray(), duration: '4', wait: i ? null : '4' })));

fs.writeFileSync(name, (new MidiWriter.Writer([track])).buildFile());

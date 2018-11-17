
const fs = require('fs');
const fromJS = require('immutable').fromJS;
const MidiWriter = require('midi-writer-js');
const power = require('js-combinatorics').power;

const pool = fromJS([0,1,2,3,4,5,6,7,8,9,10,11])
  .sort(() => Math.random() - .5)
  .slice(0, 7)
  .sort()
  .toArray()

function dissonanceFilter(chord) {
  let rubs = 0;
  for (let i = 1; i < chord.size; i++) {
    if (chord.get(i) - chord.get(i-1) === 1) {
      rubs += 1
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
  return fromJS(power(pool).toArray())
    .filter(c => c.size > 2 && c.size < 6)
    .map(c => c.sort())
    .filter(dissonanceFilter)
    .map(openRubs)
    .map(c => c.map(n => n + 60));
}

const chords = getChords(pool);

console.log(chords.toJS())

const track = new MidiWriter.Track();
track.addEvent(chords.map(c => new MidiWriter.NoteEvent({pitch: c.toArray(), duration: '4'})).toArray());

fs.writeFileSync(`${pool.toString()}.mid`, (new MidiWriter.Writer([track])).buildFile());

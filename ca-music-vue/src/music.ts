import p5 from 'p5'

export type Note = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
export type Accidental = 'Sharp' | 'Natural' | 'Flat'
export type FullNote = [Note, Accidental, number]

export const A0 = 27.5

export function frequencyOf(note: Note, accidental: Accidental, octave: number): number {
  const noteFreqs: Record<Note, number> = {
    A: 0,
    B: 2,
    C: 3,
    D: 5,
    E: 7,
    F: 8,
    G: 10,
  }
  const accidentalFreqs: Record<Accidental, number> = {
    Sharp: 1,
    Natural: 0,
    Flat: -1,
  }
  return A0 * Math.pow(2, (noteFreqs[note] + accidentalFreqs[accidental]) / 12) * Math.pow(2, octave);
}

export class Synth {
  freq: number
  osc: p5.Oscillator
  playing: boolean = false
  envelope: [number, number, number, number] = [0.1, 0.1, 0.5, 0.5]

  constructor(
    note: Note,
    accidental: Accidental = 'Natural',
    octave: number = 4,
    shape: 'sine' | 'triangle' | 'sawtooth' | 'square' = 'sine',
  ) {
    this.freq = frequencyOf(note, accidental, octave)
    this.osc = new p5.Oscillator()
    this.osc.setType(shape)
    this.osc.freq(this.freq)
    this.osc.amp(0.5)
  }

  note(note: Note, accidental: Accidental, octave: number) {
    this.freq = frequencyOf(note, accidental, octave)
    this.osc.freq(this.freq)
  }

  freq(f: number) {
    this.freq = f
    this.osc.freq(f)
  }

  phase(phase: number) {
    this.osc.phase(phase)
  }

  adsr(a: number, d: number, s: number, r: number) {
    this.envelope = [a, d, s, r]
  }

  amp(amp: number) {
    this.osc.amp(amp)
  }

  start() {
    this.osc.start()
  }

  play() {
    const env = new p5.Envelope()
    env.setADSR(...this.envelope)
    env.play(this.osc)
  }
}

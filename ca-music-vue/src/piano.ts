import p5 from 'p5'
import $ from 'jquery'

import { Synth, Note } from './music'
import { Ca1D, CaRules } from './ca'

const pentatonicFreq = (i: number): [Note, number] => {
  const pentatonic = ['A', 'C', 'D', 'E', 'G']

  const note = pentatonic[i % pentatonic.length]
  const octave = Math.floor(i / pentatonic.length)
  return [note as Note, octave]
}

const sketch = (p: p5) => {
  let playing: boolean = false
  let synths: Array<Synth> = []
  let activeKeys: Set<number> = new Set()
  const keys = Array.from({ length: 25 }, (_, i) => pentatonicFreq(i))
  const ca = new Ca1D(25, new CaRules<number>([
    (cell, neighbors) => {

      if (Math.random() < 0.3) {
        return 0
      }

      if (cell === 1) {
        return (neighbors[1] === 0) ? 1 : 0
      } else {
        return (neighbors[0] + neighbors[1] === 1) ? 1 : 0
      }
    }
  ]), 0)

  p.setup = () => {
    const canvas = p.createCanvas(800, 800)
    const container = $('.tab-content')[0]
    canvas.parent(container)

    keys.forEach(([note, octave]) => {
      const synth = new Synth(note, 'Natural', octave, 'triangle')
      synth.amp(0.5)
      synth.phase(Math.random() * 360)
      synths.push(synth)
    })

    p.frameRate(3)
    p.noLoop()
    ca.row[5] = 1
  }

  const startKey = (i: number) => {
    activeKeys.add(i)
    setTimeout(() => activeKeys.delete(i), 100)
    const synth = synths[i]
    synth.play()
  }

  p.mousePressed = () => {
    if (!playing) {
      synths.forEach(s => {
        s.start()
        s.amp(0)
        s.adsr(0.1, 0.1, 0.5, 0.1)
      })

      playing = true
      p.loop()
    }
  }

  p.draw = () => {
    keys.forEach((_, i) => {
      p.fill(255)
      p.stroke(0)
      p.strokeWeight(1)
      p.rect(i * 32, 16, 32, 32)
      p.textSize(16)
      p.fill(0)
      const note = pentatonicFreq(i)[0]
      p.text(note, i * 32 + 8, 16+20)
    })

    ca.step((i, cell) => {
      if (cell === 1) {
        startKey(i)
      }
    })

    ca.row.forEach((cell, i) => {
      if (cell) {
        p.fill(255, 0, 0)
      } else {
        p.fill(255)
      }
      p.rect(i * 32, 64, 32, 32)
    })
  }
}

export default sketch

import { CaGrid, CaRules } from './ca'
import { Note, frequencyOf, Synth } from './music'

import p5 from 'p5'
import $ from 'jquery'

const pentatonicNote = (i: number, j: number) => {
  const pentatonic = ['A', 'C', 'D', 'E', 'G']

  const note = pentatonic[i % pentatonic.length]
  const octave = 2+Math.floor(j / pentatonic.length)

  return [note as Note, 'Natural', octave]
}

const sketch = (p: p5) => {
  const gridWidth = 20
  let synths = new Array(gridWidth)
  let playing = false
  const rules = new CaRules<number>([
    (cell, neighbors) => {
      // Game of Life
      const sum = neighbors.reduce((acc, n) => acc + (n ? 1 : 0), 0)

      if (cell >= 1) {
        return (sum === 2 || sum === 3) ? cell + 1 : 0
      } else {
        return (sum === 3) ? 1 : 0
      }
    }
  ])

  let caGrid = new CaGrid(gridWidth, rules, 0, 'moore')
  caGrid.randomize([0, 1])

  p.preload = () => {
    for (let j = 0; j < gridWidth; j++) {
      const synth = new Synth('A', 'Natural', 0, 'triangle')
      synths[j] = synth
    }
  }

  p.setup = () => {
    const canvas = p.createCanvas(800, 800)
    const container = $('.tab-content')[0]
    canvas.parent(container)
    p.background(0)
    p.noLoop()
    p.frameRate(10)
  }

  p.mousePressed = () => {
    if (!playing) {
      playing = true
      synths.forEach(s => s.start())
      p.loop()
    }
  }

  const env = new p5.Envelope()
  env.setADSR(0.1, 0.1, 0.5, 0.5)
  env.setRange(0.5, 0)

  p.draw = () => {
    p.background(20, 40, 60)

    // Draw grid
    const cellWidth = p.width / gridWidth
    const cellHeight = p.height / gridWidth
    for (let i = 0; i < gridWidth; i++) {
      for (let j = 0; j < gridWidth; j++) {
        if (caGrid.grid[i][j]) {
          p.fill(255, 0, 0)
        } else {
          p.fill(255)
        }
        p.rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight)
      }
    }

    let activeColumns: Array<number | undefined> = new Array(gridWidth)

    // Update grid
    caGrid.step((i, j, cell) => {
      if (cell > 0 && cell < 3) {
        activeColumns[j] = Math.max(activeColumns[j] || 0, i)
      }
    })

    synths.forEach((synth, j) => {
      if (activeColumns[j] !== undefined) {
        synth.note(...pentatonicNote(activeColumns[j], j))
        synth.phase(Math.random() * 360)
        synth.play()
      }
    })
  }
}

export default sketch

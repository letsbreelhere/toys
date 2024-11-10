import './style.css'

import p5 from "p5";
(window as any).p5 = p5;
await import("p5/lib/addons/p5.sound");

type Note = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
type Accidental = 'Sharp' | 'Natural' | 'Flat'

const A0 = 27.5

function frequencyOf(note: Note, accidental: Accidental, octave: number): number {
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

const pentatonicFreq = (i, j) => {
  const pentatonic = ['A', 'C', 'D', 'E', 'G']

  const note = pentatonic[i % pentatonic.length]
  const octave = 2+Math.floor(j / pentatonic.length)
  return frequencyOf(note as Note, 'Natural', octave)
}

class CaRules<Cell> {
  rules: Array<(cell: Cell, neighbors: Array<Cell>) => Cell>

  constructor(rules: Array<(cell: Cell, neighbors: Array<Cell>) => Cell>) {
    this.rules = rules
  }

  apply(cell: Cell, neighbors: Array<Cell>): Cell {
    return this.rules.reduce((acc, rule) => rule(acc, neighbors), cell)
  }
}

class CaGrid<Cell> {
  grid: Array<Array<Cell>>
  gridWidth: number
  rules: CaRules<Cell>
  initial: Cell
  neighborhood: 'moore' | 'von-neumann'

  constructor(gridWidth: number, rules: CaRules<Cell>, initial: Cell, neighborhood: 'moore' | 'von-neumann' = 'moore') {
    this.gridWidth = gridWidth
    this.grid = Array.from({ length: gridWidth }, () => Array.from({ length: gridWidth }, () => initial))
    this.rules = rules
    this.initial = initial
    this.neighborhood = neighborhood
  }

  step(callback: (i: number, j: number, cell: Cell) => void) {
    const newGrid = Array.from({ length: this.gridWidth }, () => Array.from({ length: this.gridWidth }, () => this.initial))
    for (let i = 0; i < this.gridWidth; i++) {
      for (let j = 0; j < this.gridWidth; j++) {
        let neighbors: Array<Cell> = []
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            if (x === 0 && y === 0) {
              continue
            }
            if (this.neighborhood === 'von-neumann' && Math.abs(x) + Math.abs(y) !== 1) {
              continue
            }

            const ni = (i + x + this.gridWidth) % this.gridWidth
            const nj = (j + y + this.gridWidth) % this.gridWidth
            neighbors = [...neighbors, this.grid[ni][nj]]
          }
        }
        newGrid[i][j] = this.rules.apply(this.grid[i][j], neighbors)
        callback(i, j, newGrid[i][j])
      }
    }

    this.grid = newGrid
  }

  randomize(choices: Array<Cell>) {
    this.grid = this.grid.map(row => row.map(() => choices[Math.floor(Math.random() * choices.length)]))
  }
}

const sketch = (p: p5) => {
  const gridWidth = 10
  let oscs = new Array(gridWidth)
  let playing = false
  const rules = new CaRules<number>([
    (cell, neighbors) => {
      const neighborSum = neighbors.reduce((acc, n) => acc + n, 0)
      if (cell === 1) {
        return neighborSum === 2 || neighborSum === 3 ? 1 : 0
      } else {
        return neighborSum === 2 ? 1 : 0
      }
    }
  ])

  let caGrid = new CaGrid(gridWidth, rules, 0, 'von-neumann')
  caGrid.randomize([0, 1])

  p.preload = () => {
    for (let j = 0; j < gridWidth; j++) {
      const osc = new p5.Oscillator()
      osc.setType('triangle')
      osc.amp(0)
      oscs[j] = osc
    }
  }

  p.setup = () => {
    p.createCanvas(800, 800)
    p.background(0)
    p.noLoop()
    p.frameRate(3)
  }

  p.mousePressed = () => {
    if (!playing) {
      playing = true
      for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridWidth; j++) {
          oscs[j].start()
        }
      }
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
      if (cell === 1) {
        activeColumns[j] = Math.max(activeColumns[j] || 0, i)
      }
    })

    oscs.forEach((osc, j) => {
      if (activeColumns[j] !== undefined) {
        osc.freq(pentatonicFreq(activeColumns[j], j))
        osc.phase(Math.random() * 360)
        osc.amp(0.5, 0.1)
      } else {
        osc.amp(0)
      }
    })
  }
}

new p5(sketch)

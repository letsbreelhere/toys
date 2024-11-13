export class CaRules<Cell> {
  rules: Array<(cell: Cell, neighbors: Array<Cell>) => Cell>

  constructor(rules: Array<(cell: Cell, neighbors: Array<Cell>) => Cell>) {
    this.rules = rules
  }

  apply(cell: Cell, neighbors: Array<Cell>): Cell {
    return this.rules.reduce((acc, rule) => rule(acc, neighbors), cell)
  }
}

export class CaGrid<Cell> {
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

export class Ca1D {
  rules: CaRules<number>;
  width: number;
  row: number[];


  constructor(width: number, rules: CaRules<number>, initial: number) {
    this.rules = rules;
    this.width = width;
    this.row = Array.from({ length: width }, () => initial);
  }

  step(callback: (i: number, cell: number) => void) {
    const newRow = Array.from({ length: this.width }, () => this.row[0]);
    for (let i = 0; i < this.width; i++) {
      const neighbors = [
        this.row[(i - 1 + this.width) % this.width],
        this.row[(i + 1) % this.width]
      ];
      newRow[i] = this.rules.apply(this.row[i], neighbors);
      callback(i, newRow[i]);
    }
    this.row = newRow;
  }
}

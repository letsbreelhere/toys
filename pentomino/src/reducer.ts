import { Point, PentominoShape, Puzzle, PuzzleCell, solvePlacement, fillRandom } from './Pentomino'

export type Action = {
  type: 'setPoint'
  point: Point,
  cell: PuzzleCell
} | {
  type: 'selectShape'
  shape: PentominoShape | 'blocked'
} | {
  type: 'solve'
} | {
  type: 'clear'
} | {
  type: 'generate'
}

export type GameState = {
  grid: Puzzle
  selectedShape: PentominoShape | 'blocked'
  index: number
}

const gridWidth = 10

export const defaultState: GameState = {
  grid: Array.from({ length: gridWidth }, () => Array.from({ length: gridWidth }, () => ({ type: 'empty' }))),
  selectedShape: 'blocked',
  index: 0
}

const reducer = (
  state: GameState,
  action: Action
) => {
  let newGrid: Puzzle
  switch (action.type) {
    case 'setPoint':
      newGrid = state.grid.map(row => row.slice())

      // Remove old filled cells, plus the new one
      newGrid = newGrid.map((row, i) => {
        return row.map((cell, j) => {
          if (cell.type === 'filled' || action.point[0] === i && action.point[1] === j) {
            return { type: 'empty' }
          } else {
            return cell
          }
        })
      })

      newGrid[action.point[0]][action.point[1]] = action.cell
      // Least unused index
      let index = 0
      const seenIndices = new Set<number>()
      newGrid.forEach(row => {
        row.forEach(cell => {
          if (cell.type === 'seed' || cell.type === 'filled') {
            seenIndices.add(cell.index)
          }
        })
      })
      while (seenIndices.has(index)) {
        index++
      }
      
      return { ...state, grid: newGrid, index }
    case 'selectShape':
      return { ...state, selectedShape: action.shape }
    case 'solve':
      const solution = solvePlacement(state.grid)
      if (!solution) {
        console.log('No solution found')
        return state
      }
      return { ...state, grid: solution }
    case 'clear':
      return { ...state, grid: defaultState.grid, index: 0 }
    case 'generate':
      let grid: Puzzle | null = state.grid.map(row => row.slice())
      grid = fillRandom(grid)

      if (!grid) {
        console.log('No solution found')
        return state
      }
      
      return { ...state, grid }
  }
}

export default reducer

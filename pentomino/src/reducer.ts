import { Point, PentominoShape, Puzzle, PuzzleCell, solvePlacement } from './Pentomino'

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

      // Remove old filled cells
      newGrid = newGrid.map(row => {
        return row.map(cell => {
          if (cell.type === 'filled') {
            return { type: 'empty' }
          } else {
            return cell
          }
        })
      })

      newGrid[action.point[0]][action.point[1]] = action.cell
      let newIndex = state.index
      if (action.cell.type === 'seed') {
        newIndex++
      }
      return { ...state, grid: newGrid, index: newIndex }
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
  }
}

export default reducer

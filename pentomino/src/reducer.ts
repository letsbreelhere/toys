import { Point, PentominoShape, PuzzleCell } from './Pentomino'

export type Action = {
  type: 'setPoint'
  point: Point,
  cell: PuzzleCell
} | {
  type: 'selectShape'
  shape: PentominoShape | 'blocked' | 'clear'
}

export type GameState = {
  grid: PuzzleCell[][]
  selectedShape: PentominoShape | 'blocked' | 'clear'
}

export const defaultState: GameState = {
  grid: Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => ({ type: 'empty' }))),
  selectedShape: 'F'
}

const reducer = (
  state: GameState,
  action: Action
) => {
  switch (action.type) {
    case 'setPoint':
      const newGrid = state.grid.map(row => row.slice())
      newGrid[action.point[0]][action.point[1]] = action.cell
      return { ...state, grid: newGrid }
    case 'selectShape':
      return { ...state, selectedShape: action.shape }
  }
}

export default reducer

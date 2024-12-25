import { useReducer } from 'react'
import classNames from 'classnames'
import './App.scss'
import { PuzzleCell, PentominoShape, ALL_BASE_POINTS, placements } from './Pentomino'
import reducer, {defaultState} from './reducer'

const gridWidth = 10;

type CellProps = {
  cell: PuzzleCell
  onClick: () => void
}

const SHAPE_COLORS: Record<PentominoShape, string> = {
  'F': '#a6cee3',
  'I': '#1f78b4',
  'L': '#b2df8a',
  'N': '#33a02c',
  'P': '#fb9a99',
  'T': '#e31a1c',
  'U': '#fdbf6f',
  'V': '#ff7f00',
  'W': '#cab2d6',
  'X': '#6a3d9a',
  'Y': '#ffff99',
  'Z': '#b15928',
}

const Cell = ({ cell, onClick }: CellProps) => {
  return (
    <div
      className={classNames('cell', cell.type)}
      style={{
        backgroundColor: cell.type === 'pentomino' ? SHAPE_COLORS[cell.shape] : undefined
      }}
      onClick={onClick}
    >
      {cell.type === 'pentomino' && <div className="pentomino-label">{cell.shape}</div>}
    </div>
  )
}

function App() {
  const initialGrid: PuzzleCell[][] = Array.from({ length: gridWidth }, () => Array.from({ length: gridWidth }, () => ({ type: 'empty' })))
  const [state, dispatch] = useReducer(reducer, defaultState)

  return (
    <div className="App">
      <div className="sidebar">
        <button
          className={classNames({ selected: state.selectedShape === 'clear' })}
          onClick={() => {
            dispatch({ type: 'selectShape', shape: 'clear' })
          }}
        >
          Clear
        </button>
        <button
          className={classNames({ selected: state.selectedShape === 'blocked' })}
          onClick={() => {
            dispatch({ type: 'selectShape', shape: 'blocked' })
          }}
        >
          Block
        </button>
        {Object.keys(ALL_BASE_POINTS).map(shape => (
          <button
            key={shape}
            style={{ backgroundColor: SHAPE_COLORS[shape as PentominoShape] }}
            className={classNames({ selected: state.selectedShape === shape })}
            onClick={() => {
              dispatch({ type: 'selectShape', shape: state.selectedShape === shape ? null : shape as PentominoShape })
            }}
          >
            {shape}
          </button>
        ))}
      </div>
      <div className="grid-container">
        <div className="grid">
          {state.grid.map((row: PuzzleCell[], i: number) => (
            <div key={i} className="row">
              {row.map((cell, j) => (
                <Cell
                  key={j}
                  cell={cell}
                  onClick={() => {
                    if (state.selectedShape === 'clear') {
                      dispatch({
                        type: 'setPoint',
                        point: [i, j],
                        cell: { type: 'empty' }
                      })
                      return
                    } else if (state.selectedShape === 'blocked') {
                      dispatch({
                        type: 'setPoint',
                        point: [i, j],
                        cell: { type: 'blocked' }
                      })
                      return
                    } else {
                      dispatch({
                        type: 'setPoint',
                        point: [i, j],
                        cell: cell.type === 'empty' ? { type: 'pentomino', shape: state.selectedShape } : { type: 'empty' }
                      })
                    }
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App

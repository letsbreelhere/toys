import { useReducer } from 'react'
import classNames from 'classnames'
import './App.scss'
import { PuzzleCell, PentominoShape, ALL_SHAPES } from './Pentomino'
import reducer, {defaultState} from './reducer'

type CellProps = {
  cell: PuzzleCell
  onClick: () => void
}

const SHAPE_COLORS: Record<PentominoShape, [number, number, number]> =
  ALL_SHAPES.reduce((acc, shape, i) => {
    acc[shape as PentominoShape] = [0, 25, 50]
    return acc
  }, {} as Record<PentominoShape, [number, number, number]>)

const Cell = ({ cell, onClick }: CellProps) => {
  let backgroundColor

  if (cell.type === 'seed' || cell.type === 'filled') {
    const c = SHAPE_COLORS[cell.shape]
    backgroundColor = `hsl(${c[0] + cell.index * 12}, ${(c[1] + cell.index * 20)%50+10}%, ${c[2]}%)`
  }

  return (
    <div
      className={classNames('cell', cell.type)}
      style={{
        backgroundColor
      }}
      onClick={onClick}
    >
      {cell.type === 'seed' && <div className="pentomino-label">{cell.shape}<br/>{cell.index}</div>}
    </div>
  )
}

function App() {
  const [state, dispatch] = useReducer(reducer, defaultState)

  return (
    <div className="App">
      <div className="sidebar">
        <button
          style={{ backgroundColor: '#f00' }}
          onClick={() => {
            dispatch({ type: 'solve' })
          }}
        >
          Sol
        </button>
        <button
          style={{ backgroundColor: '#888' }}
          onClick={() => {
            dispatch({ type: 'clear' })
          }}
        >
          Clr
        </button>
        <button
          className={classNames({ selected: state.selectedShape === 'blocked' })}
          onClick={() => {
            dispatch({ type: 'selectShape', shape: 'blocked' })
          }}
        >
          Blk
        </button>
        {ALL_SHAPES.map(shape => (
          <button
            key={shape}
            className={classNames({ selected: state.selectedShape === shape })}
            onClick={() => {
              if (state.selectedShape === shape) {
                dispatch({ type: 'selectShape', shape: 'blocked' })
              } else {
                dispatch({ type: 'selectShape', shape: shape as PentominoShape })
              }
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
                    const shouldEmpty =
                      (cell.type === 'seed' && cell.shape === state.selectedShape) ||
                      (cell.type === 'blocked' && state.selectedShape === 'blocked')
                    if (shouldEmpty) {
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
                        cell: { type: 'seed', shape: state.selectedShape, index: state.index }
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

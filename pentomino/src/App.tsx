import { useState } from 'react'
import classNames from 'classnames'
import './App.scss'
import { Point, PentominoShape, PuzzleCell, placements, ALL_BASE_POINTS } from './Pentomino'

const gridWidth = 10;

type CellProps = {
  cell: PuzzleCell
  onClick: () => void
}

const Cell = ({ cell, onClick }: CellProps) => {
  return (
    <div
      className={classNames('cell', cell.type)}
      onClick={onClick}
    />
  )
}

function App() {
  const [grid, setGrid] = useState<PuzzleCell[][]>(Array.from({ length: 10 }, () => Array.from({ length: gridWidth }, () => ({ type: 'empty' }))))

  return (
    <div className="App">
      <div className="grid">
        {grid.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <Cell
                key={j}
                cell={cell}
                onClick={() => {
                  const newGrid = grid.map(row => row.slice())
                  newGrid[i][j] = { type: 'pentomino', shape: 'F' }
                  setGrid(newGrid)
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App

import reducer, { defaultState, GameState, Action } from '../reducer';
import { PentominoShape, PuzzleCell } from '../Pentomino';

describe('Reducer', () => {
  describe('initial state', () => {
    it('should have a default state with an empty grid', () => {
      expect(defaultState.grid.length).toBe(10);
      expect(defaultState.grid[0].length).toBe(10);

      // All cells should be empty
      defaultState.grid.forEach(row => {
        row.forEach(cell => {
          expect(cell.type).toBe('empty');
        });
      });

      expect(defaultState.selectedShape).toBe('blocked');
      expect(defaultState.index).toBe(0);
    });
  });

  describe('setPoint action', () => {
    it('should update the grid with the new cell', () => {
      const initialState: GameState = {
        ...defaultState,
        selectedShape: 'F',
        index: 0
      };

      const action: Action = {
        type: 'setPoint',
        point: [3, 4],
        cell: { type: 'seed', shape: 'F', index: 0 }
      };

      const newState = reducer(initialState, action);

      // Cell should be updated
      expect(newState.grid[3][4].type).toBe('seed');

      // Type assertion to check cell properties
      if (newState.grid[3][4].type === 'seed') {
        expect(newState.grid[3][4].shape).toBe('F');
        expect(newState.grid[3][4].index).toBe(0);
      }
    });

    it('should clear filled cells when setting a new point', () => {
      // Create a state with some filled cells
      const initialGrid = defaultState.grid.map(row => [...row]);
      initialGrid[2][2] = { type: 'filled', shape: 'F', index: 0 };
      initialGrid[2][3] = { type: 'filled', shape: 'F', index: 0 };
      initialGrid[3][2] = { type: 'seed', shape: 'F', index: 0 };

      const initialState: GameState = {
        grid: initialGrid,
        selectedShape: 'F',
        index: 0
      };

      const action: Action = {
        type: 'setPoint',
        point: [5, 5],
        cell: { type: 'seed', shape: 'P', index: 1 }
      };

      const newState = reducer(initialState, action);

      // Filled cells should be cleared
      expect(newState.grid[2][2].type).toBe('empty');
      expect(newState.grid[2][3].type).toBe('empty');

      // Seed cell should remain
      expect(newState.grid[3][2].type).toBe('seed');

      // New cell should be set
      expect(newState.grid[5][5].type).toBe('seed');
      if (newState.grid[5][5].type === 'seed') {
        expect(newState.grid[5][5].shape).toBe('P');
        expect(newState.grid[5][5].index).toBe(1);
      }
    });

    it('should select the next available index', () => {
      // Create a state with some cells using indices 0 and 1
      const initialGrid = defaultState.grid.map(row => [...row]);
      initialGrid[1][1] = { type: 'seed', shape: 'F', index: 0 };
      initialGrid[5][5] = { type: 'seed', shape: 'P', index: 1 };

      const initialState: GameState = {
        grid: initialGrid,
        selectedShape: 'T',
        index: 2 // Current index
      };

      const action: Action = {
        type: 'setPoint',
        point: [7, 7],
        cell: { type: 'seed', shape: 'T', index: 2 }
      };

      const newState = reducer(initialState, action);

      // Next available index should be 3
      expect(newState.index).toBe(3);
    });

    it('should toggle off a seed cell if clicked again with the same shape', () => {
      // Create a state with a seed cell
      const initialGrid = defaultState.grid.map(row => [...row]);
      initialGrid[3][3] = { type: 'seed', shape: 'F', index: 0 };

      const initialState: GameState = {
        grid: initialGrid,
        selectedShape: 'F',
        index: 1
      };

      // Click on the same cell with the same shape
      const action: Action = {
        type: 'setPoint',
        point: [3, 3],
        cell: { type: 'empty' }
      };

      const newState = reducer(initialState, action);

      // Cell should be emptied
      expect(newState.grid[3][3].type).toBe('empty');
    });
  });

  describe('selectShape action', () => {
    it('should update the selected shape', () => {
      const initialState = defaultState;

      const action: Action = {
        type: 'selectShape',
        shape: 'T'
      };

      const newState = reducer(initialState, action);

      expect(newState.selectedShape).toBe('T');
    });
  });

  describe('clear action', () => {
    it('should reset the grid to empty and reset the index', () => {
      // Create a state with some cells
      const initialGrid = defaultState.grid.map(row => [...row]);
      initialGrid[1][1] = { type: 'seed', shape: 'F', index: 0 };
      initialGrid[2][2] = { type: 'filled', shape: 'F', index: 0 };
      initialGrid[5][5] = { type: 'blocked' };

      const initialState: GameState = {
        grid: initialGrid,
        selectedShape: 'P',
        index: 5
      };

      const action: Action = {
        type: 'clear'
      };

      const newState = reducer(initialState, action);

      // Grid should be reset to all empty cells
      newState.grid.forEach(row => {
        row.forEach(cell => {
          expect(cell.type).toBe('empty');
        });
      });

      // Index should be reset
      expect(newState.index).toBe(0);

      // Selected shape should be preserved
      expect(newState.selectedShape).toBe('P');
    });
  });

  // Note: The solve and generate actions are harder to test thoroughly as they depend on
  // the solvePlacement and fillRandom functions which are complex and probabilistic.
  // These tests provide basic verification that the actions work as expected.

  describe('solve action', () => {
    it('should return the original state when no solution is found', () => {
      // Create an unsolvable state (e.g., I pentomino in a 3x3 grid)
      const initialGrid: PuzzleCell[][] = Array.from(
        { length: 3 },
        () => Array.from({ length: 3 }, () => ({ type: 'empty' }))
      );

      initialGrid[1][1] = { type: 'seed', shape: 'I' as PentominoShape, index: 0 };

      const initialState: GameState = {
        grid: initialGrid,
        selectedShape: 'I',
        index: 1
      };

      const action: Action = {
        type: 'solve'
      };

      const newState = reducer(initialState, action);

      // State should be unchanged
      expect(newState).toBe(initialState);
    });
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import App from '../App';
import * as Pentomino from '../Pentomino';
import reducer from '../reducer';

// Mock the reducer and Pentomino functions that are used in App
jest.mock('../reducer', () => {
  return jest.fn((state, action) => {
    if (action.type === 'selectShape') {
      return { ...state, selectedShape: action.shape };
    }
    // Return a modified state for testing purposes
    return { ...state, mock: 'called' };
  });
});

jest.mock('../Pentomino', () => {
  const originalModule = jest.requireActual('../Pentomino');
  return {
    ...originalModule,
    solvePlacement: jest.fn(),
    fillRandom: jest.fn()
  };
});

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });

  it('renders the grid and sidebar', () => {
    render(<App />);

    // Check for sidebar buttons
    expect(screen.getByText('Sol')).toBeInTheDocument();
    expect(screen.getByText('Gen')).toBeInTheDocument();
    expect(screen.getByText('Clr')).toBeInTheDocument();
    expect(screen.getByText('Blk')).toBeInTheDocument();

    // Should have all pentomino shape buttons
    Pentomino.ALL_SHAPES.forEach(shape => {
      expect(screen.getByText(shape)).toBeInTheDocument();
    });

    // Should render the grid
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();

    // Grid should have rows
    const rows = grid.querySelectorAll('.row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('dispatches selectShape action when a shape button is clicked', () => {
    render(<App />);

    // Click on the P shape button
    const pButton = screen.getByText('P');
    fireEvent.click(pButton);

    // Expect reducer to be called with selectShape action
    expect(reducer).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'selectShape',
        shape: 'P'
      })
    );
  });

  it('dispatches setPoint action when a cell is clicked', () => {
    render(<App />);

    // Find the first cell and click it
    const firstCell = document.querySelector('.cell');
    if (firstCell) {
      fireEvent.click(firstCell);

      // Expect reducer to be called with setPoint action
      expect(reducer).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'setPoint',
          point: expect.any(Array),
          cell: expect.any(Object)
        })
      );
    }
  });

  it('dispatches solve action when solve button is clicked', () => {
    render(<App />);

    // Click on the solve button
    const solveButton = screen.getByText('Sol');
    fireEvent.click(solveButton);

    // Expect reducer to be called with solve action
    expect(reducer).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'solve'
      })
    );
  });

  it('dispatches generate action when generate button is clicked', () => {
    render(<App />);

    // Click on the generate button
    const genButton = screen.getByText('Gen');
    fireEvent.click(genButton);

    // Expect reducer to be called with generate action
    expect(reducer).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'generate'
      })
    );
  });

  it('dispatches clear action when clear button is clicked', () => {
    render(<App />);

    // Click on the clear button
    const clearButton = screen.getByText('Clr');
    fireEvent.click(clearButton);

    // Expect reducer to be called with clear action
    expect(reducer).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'clear'
      })
    );
  });

  it('visually highlights the selected shape button', () => {
    // Mock the useReducer hook to control state
    const mockUseReducer = jest.fn()
      .mockReturnValue([
        {
          grid: Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => ({ type: 'empty' }))),
          selectedShape: 'P',
          index: 0
        },
        jest.fn()
      ]);

    jest.spyOn(React, 'useReducer').mockImplementation(mockUseReducer);

    render(<App />);

    // The P button should have the selected class
    const pButton = screen.getByText('P');
    expect(pButton.className).toContain('selected');

    // Other buttons should not have the selected class
    const tButton = screen.getByText('T');
    expect(tButton.className).not.toContain('selected');
  });
});

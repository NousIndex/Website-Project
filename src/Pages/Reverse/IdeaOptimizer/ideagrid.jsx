import React, { useState } from 'react';

const Grid = () => {
  const [grid, setGrid] = useState(
    Array(5)
      .fill(null)
      .map(() => Array(5).fill(false))
  );
  const [dragging, setDragging] = useState(false);
  let savedGrid = [];

  const handleMouseDown = (row, col) => {
    const newGrid = [...grid];
    newGrid[row][col] = !newGrid[row][col]; // Toggle the state of the initial cell
    setGrid(newGrid);
    setDragging(true);
  };

  const handleMouseEnter = (row, col) => {
    if (dragging) {
      const newGrid = grid.map((rowArr, rowIndex) =>
        rowArr.map((cell, colIndex) =>
          rowIndex === row && colIndex === col ? true : cell
        )
      );
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const clearGrid = () => {
    const newGrid = grid.map((row) => row.map(() => false));
    setGrid(newGrid);
  };

  const handleSaveButton = () => {
    console.log(grid);
    savedGrid.push(grid);

    console.log(downsizedMatrix);
  };

  return (
    <div>
      <button onClick={clearGrid}>Clear Grid</button>
      <div className="ideagrid-grid no-selection">
        {grid.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="row"
          >
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`ideagrid-cell ${cell ? 'highlighted' : ''}`}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onMouseUp={handleMouseUp}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleSaveButton}>Save</button>
    </div>
  );
};

export default Grid;

async function findTopNCombinations(gridWidth, gridHeight, shapes, n) {
  // Sort shapes in descending order of value
  shapes.sort((a, b) => b.value - a.value);

  const grid = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(false)
  );
  const topCombinations = [];

  function containsFalse(array) {
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < array[i].length; j++) {
        if (array[i][j] === false) {
          return true; // Found false, return true
        }
      }
    }
    return false; // No false found in the array
  }

  function countFalse(array) {
    let count = 0;
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < array[i].length; j++) {
        if (array[i][j] === false) {
          count++;
        }
      }
    }
    return count;
  }

  function isBarShape(shape) {
    const rows = shape.form.length;
    if (rows === 0) return false; // No rows means it's not a bar shape.

    const cols = shape.form[0].length;
    if (cols === 0) return false; // No columns means it's not a bar shape.

    // Check that all rows have the same number of columns.
    if (containsFalse(shape.form)) {
      return false; // object is not a bar shape
    }

    const isHorizontalBar = rows === 1 && cols > 1;
    const isVerticalBar = cols === 1 && rows > 1;

    // if (isHorizontalBar || isVerticalBar) {
    //   console.log(shape);
    // }

    return isHorizontalBar || isVerticalBar;
  }

  function isSquareShape(shape) {
    const rows = shape.form.length;
    if (rows === 0) return false; // No rows means it's not a square shape.

    const cols = shape.form[0].length;
    if (cols === 0) return false; // No columns means it's not a square shape.

    // Check that all rows have the same number of columns.
    if (containsFalse(shape.form)) {
      return false; // object is not a square shape
    }

    // if (rows === cols) {
    //   console.log(shape);
    // }

    return rows === cols; // If rows and columns are equal, it's a square shape.
  }

  function isPlusShape(shape) {
    const rows = shape.form.length;
    if (rows === 0) return false; // No rows means it's not a square shape.

    const cols = shape.form[0].length;
    if (cols === 0) return false; // No columns means it's not a square shape.

    // Check that all rows have the same number of columns.
    const falseCount = countFalse(shape.form);
    const shapeIndex = rows * cols;

    // Check if it's a plus sign shape.
    if (rows % 2 === 1 && cols % 2 === 1) {
      const middleRow = Math.floor(rows / 2);
      const middleCol = Math.floor(cols / 2);

      const centerValue = shape.form[middleRow][middleCol];

      // Check the center value, it should be true (main intersection point).
      if (
        centerValue === true &&
        shape.form[middleRow].every((value) => value === true) &&
        shape.form.every((row) => row[middleCol] === true)
      ) {
        if (falseCount === shapeIndex - rows - cols + 1) {
          return true; // Plus sign pattern detected.
        }
      }
    }

    return false; // If rows and columns are equal, it's a square shape.
  }

  function canPlaceShape(shape, x, y, orientation) {
    const rotatedForm = rotateShape(shape.form, orientation);

    for (let i = 0; i < rotatedForm.length; i++) {
      for (let j = 0; j < rotatedForm[i].length; j++) {
        if (
          rotatedForm[i][j] &&
          (x + i >= gridHeight ||
            y + j >= gridWidth ||
            grid[x + i][y + j] !== false)
        ) {
          return false;
        }
      }
    }
    return true;
  }

  function placeShape(shape, x, y, orientation) {
    const rotatedForm = rotateShape(shape.form, orientation);

    for (let i = 0; i < rotatedForm.length; i++) {
      for (let j = 0; j < rotatedForm[i].length; j++) {
        if (rotatedForm[i][j]) {
          grid[x + i][y + j] = true;
        }
      }
    }
  }

  function removeShape(shape, x, y, orientation) {
    const rotatedForm = rotateShape(shape.form, orientation);

    for (let i = 0; i < rotatedForm.length; i++) {
      for (let j = 0; j < rotatedForm[i].length; j++) {
        if (rotatedForm[i][j]) {
          grid[x + i][y + j] = false;
        }
      }
    }
  }

  function rotateShape(form, times) {
    // Rotate the shape `times` times (90 degrees each time)
    let rotatedForm = form;
    for (let i = 0; i < times; i++) {
      rotatedForm = rotatedForm[0].map((_, colIndex) =>
        rotatedForm.map((row) => row[colIndex]).reverse()
      );
    }
    return rotatedForm;
  }

  function findNextEmptyCell() {
    for (let i = 0; i < gridHeight; i++) {
      for (let j = 0; j < gridWidth; j++) {
        if (grid[i][j] === false) {
          return { x: i, y: j };
        }
      }
    }
    return null;
  }

  function addObjectsTogether(object1, object2) {
    // Initialize a result object to store the sums
    const result = {};

    // Iterate over the keys of object1 (you can also use Object.keys(object1) for dynamic keys)
    for (const key in object1) {
      // Use parseFloat to convert string values to floating-point numbers
      const value1 = parseFloat(object1[key]);
      const value2 = parseFloat(object2[key]);

      if (
        key === 'ATK' ||
        key === 'DEF' ||
        key === 'HP' ||
        key === 'Mental DEF' ||
        key === 'Reality DEF'
      ) {
        if (value2 < 10) {
          // Check if the values are valid numbers
          if (!isNaN(value1) && !isNaN(value2)) {
            // Add the values and store the result in the result object
            result[key] = value1 + value2*8;
          }
        }
        else {
          // Check if the values are valid numbers
          if (!isNaN(value1) && !isNaN(value2)) {
            // Add the values and store the result in the result object
            result[key] = value1 + value2;
          }
        }
      } else {
        // Check if the values are valid numbers
        if (!isNaN(value1) && !isNaN(value2)) {
          // Add the values and store the result in the result object
          result[key] = value1 + value2;
        }
      }
    }
    if (Object.keys(result).length === 0) {
      return object2;
    } else {
      return result;
    }
  }

  const memo = new Map();

  function backtrack(currentValue, currentCombination, otherValues) {
    const emptyCell = findNextEmptyCell();
    if (!emptyCell) {
      if (topCombinations.length < n) {
        // If the list of top combinations is not full, add the current combination
        topCombinations.push({
          value: currentValue,
          combination: currentCombination.slice(),
          otherValues: otherValues,
        });
      } else {
        // If the list is full, check if the current combination has a higher value than the lowest in the list
        const lowestTopCombination = topCombinations[0];
        if (currentValue > lowestTopCombination.value) {
          // Replace the lowest combination with the current combination
          topCombinations[0] = {
            value: currentValue,
            combination: currentCombination.slice(),
            otherValues: otherValues,
          };
          // Sort the list by value in descending order
          topCombinations.sort((a, b) => b.value - a.value);
        }
      }
      return;
    }

    const { x, y } = emptyCell;
    for (const shape of shapes) {
      for (
        let orientation = 0;
        orientation <
        (isBarShape(shape)
          ? 2
          : isSquareShape(shape)
          ? 1
          : isPlusShape(shape)
          ? 1
          : 4);
        orientation++
      ) {
        if (shape.amount > 0 && canPlaceShape(shape, x, y, orientation)) {
          placeShape(shape, x, y, orientation);
          currentCombination.push({ ...shape, x, y, orientation, amount: 1 });
          shape.amount--;
          const newState = JSON.stringify(grid); // Convert grid to a string for memoization

          // Check memoization table for this state
          if (!memo.has(newState) || memo.get(newState) < currentValue) {
            // Only proceed if the state is not memoized or has a lower value
            memo.set(newState, currentValue, otherValues);
            backtrack(
              currentValue + shape.value,
              currentCombination,
              addObjectsTogether(otherValues, shape.otherValues)
            );
          }

          currentCombination.pop();
          shape.amount++;
          removeShape(shape, x, y, orientation);
        }
      }
    }
  }

  backtrack(0, []);

  // Extract the top n combinations
  const topNCombinations = topCombinations.slice(0, n);

  return topNCombinations;
}

async function createGridFromArray(shapeArray, width, height) {
  const grid = Array.from({ length: height }, () => Array(width).fill('.'));

  for (let i = 0; i < shapeArray.length; i++) {
    const shape = shapeArray[i];
    const symbol = String.fromCharCode(97 + i); // 'a', 'b', 'c', ...

    // Rotate the shape's form based on its orientation
    const rotatedForm = await rotateShape(shape.form, shape.orientation);

    for (let r = 0; r < rotatedForm.length; r++) {
      for (let c = 0; c < rotatedForm[r].length; c++) {
        if (rotatedForm[r][c]) {
          const gridRow = shape.x + r;
          const gridCol = shape.y + c;
          if (
            gridRow >= 0 &&
            gridRow < height &&
            gridCol >= 0 &&
            gridCol < width
          ) {
            grid[gridRow][gridCol] = shape.symbol + ':' + symbol;
          }
        }
      }
    }
  }

  return grid;
}

async function rotateShape(form, times) {
  // Rotate the shape `times` times (90 degrees each time)
  let rotatedForm = form;
  for (let i = 0; i < times; i++) {
    rotatedForm = rotatedForm[0].map((_, colIndex) =>
      rotatedForm.map((row) => row[colIndex]).reverse()
    );
  }
  return rotatedForm;
}

export async function findBestCombinationAPI(gridWidth, gridHeight, shapes) {
  // console.log(gridWidth, gridHeight, shapes);
  const topCombinations = await findTopNCombinations(
    gridWidth,
    gridHeight,
    shapes,
    5
  );

  const grids = [];

  for (const combination of topCombinations) {
    const grid = await createGridFromArray(
      combination.combination,
      gridWidth,
      gridHeight
    );
    grids.push({
      value: combination.value,
      grid: grid,
      otherValues: combination.otherValues,
    });
  }
  const sortedArray = grids.sort((a, b) => b.value - a.value);

  return sortedArray;
}

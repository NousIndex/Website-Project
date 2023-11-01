async function findBestCombination(gridWidth, gridHeight, shapes, numCombinationsToSave) {
  // Sort shapes in descending order of value
  shapes.sort((a, b) => b.value - a.value);

  const grid = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(false)
  );
  const topCombinations = [];
  // Memoization cache to store intermediate results
  const memoizationCache = new Map();

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
  function backtrack(currentValue, currentCombination) {
    const emptyCell = findNextEmptyCell();
    if (!emptyCell) {
      if (currentCombination.length > 0) {
        const combinationValue = currentCombination.reduce(
          (acc, shape) => acc + shape.value,
          0
        );
        currentCombination.value = combinationValue;

        if (topCombinations.length < numCombinationsToSave) {
          topCombinations.push({
            form: currentCombination,
            value: combinationValue,
          });
        } else {
          topCombinations.sort((a, b) => b.value - a.value);
          if (
            combinationValue > topCombinations[topCombinations.length - 1].value
          ) {
            topCombinations.pop();
            topCombinations.push({
              form: currentCombination,
              value: combinationValue,
            });
          }
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
          backtrack(currentValue + shape.value, currentCombination);
          currentCombination.pop();
          shape.amount++;
          removeShape(shape, x, y, orientation);
        }
      }
    }
  }

  backtrack(0, []);
  topCombinations.sort((a, b) => b.value - a.value);
  return topCombinations.slice(0, numCombinationsToSave);
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
  const bestCombination = await findBestCombination(
    gridWidth,
    gridHeight,
    shapes,
    5
  );
  console.log(bestCombination);
  // console.log(bestValue);
  const grid = await createGridFromArray(
    bestCombination,
    gridWidth,
    gridHeight
  );

  // return { bestValue, grid };
}

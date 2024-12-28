export type PentominoShape =
  | "F"
  | "I"
  | "L"
  | "N"
  | "P"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export type Point = [number, number];

export function pointsEqual(p1: Point[], p2: Point[]): boolean {
  let sorted1 = p1.slice().sort();
  let sorted2 = p2.slice().sort();

  return sorted1.every(
    (p, i) => p[0] === sorted2[i][0] && p[1] === sorted2[i][1],
  );
}

// Place the upper-leftmost point of the rectangle containing the pentomino at the origin
export function canonicalize(shape: Point[]): Point[] {
  const top = shape.reduce((min, [_x, y]) => Math.min(min, y), Infinity);
  const left = shape.reduce((min, [x, _y]) => Math.min(min, x), Infinity);

  return shape.map(([x, y]) => [x - left, y - top]);
}

export function isTranslation(s1: Point[], s2: Point[]): boolean {
  const c1 = canonicalize(s1);
  const c2 = canonicalize(s2);
  return c1.every((p) => c2.some((p2) => p === p2));
}

export function reflect(shape: Point[]): Point[] {
  return shape.map(([x, y]) => [-x, y]);
}

export function reflectY(shape: Point[]): Point[] {
  return shape.map(([x, y]) => [x, -y]);
}

function allVariants(shape: Point[]): Point[][] {
  let s = canonicalize(shape);
  const variants: Point[][] = [];
  for (let i = 0; i < 4; i++) {
    if (!variants.some((v) => pointsEqual(v, s))) {
      variants.push(canonicalize(s));
    }
    const s2 = canonicalize(reflect(s));
    if (!variants.some((v) => pointsEqual(v, s2))) {
      variants.push(s2);
    }

    const s3 = canonicalize(reflectY(s));
    if (!variants.some((v) => pointsEqual(v, s3))) {
      variants.push(s3);
    }

    // Rotate 90 degrees
    s = canonicalize(s.map(([x, y]) => [-y, x]));
  }
  return variants;
}

export const BASE_POINTS: Record<PentominoShape, Point[]> = {
  F: canonicalize([
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [-1, 1],
  ]),
  I: canonicalize([
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ]),
  L: canonicalize([
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 3],
  ]),
  N: canonicalize([
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
  ]),
  P: canonicalize([
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
  ]),
  T: canonicalize([
    [0, 0],
    [0, 1],
    [0, 2],
    [-1, 2],
    [1, 2],
  ]),
  U: canonicalize([
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 2],
  ]),
  V: canonicalize([
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [0, 2],
  ]),
  W: canonicalize([
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
    [2, 2],
  ]),
  X: canonicalize([
    [0, 0],
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ]),
  Y: canonicalize([
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 1],
  ]),
  Z: canonicalize([
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [2, 2],
  ]),
};

export const ALL_BASE_POINTS: Record<PentominoShape, Point[][]> = (function () {
  let res: Record<PentominoShape, Point[][]> = {} as Record<
    PentominoShape,
    Point[][]
  >;

  Object.keys(BASE_POINTS).forEach((shape) => {
    res[shape as PentominoShape] = allVariants(
      BASE_POINTS[shape as PentominoShape],
    );
  });

  return res;
})();

export const ALL_SHAPES: PentominoShape[] = Object.keys(
  ALL_BASE_POINTS,
).sort().map((s) => s as PentominoShape);

export function placements(point: Point, shape: PentominoShape): Point[][] {
  let res: Point[][] = [];
  ALL_BASE_POINTS[shape].forEach((s) => {
    s.forEach((p) => {
      const dx = point[0] - p[0];
      const dy = point[1] - p[1];

      const translated = s.map(([x, y]) => [x + dx, y + dy]) as Point[];
      res.push(translated);
    });
  });

  return res;
}

export type PuzzleCell =
  | {
      type: "empty";
    }
  | {
      type: "blocked";
    }
  | {
      type: "seed";
      shape: PentominoShape;
      index: number;
    }
  | {
      type: "filled";
      shape: PentominoShape;
      index: number;
    };

export type Puzzle = PuzzleCell[][];

function puzzleGroups(
  puzzle: Puzzle,
): Record<number, { points: Point[]; shape: PentominoShape }> {
  const groups: Record<number, { points: Point[]; shape: PentominoShape }> = {};

  puzzle.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell.type === "seed" || cell.type === "filled") {
        if (!groups[cell.index]) {
          groups[cell.index] = { points: [], shape: cell.shape };
        }

        groups[cell.index].points.push([i, j]);
      }
    });
  });

  return groups;
}

function validPlacements(
  puzzle: Puzzle,
  index: number,
  shape: PentominoShape,
): Point[][] {
  const groups = puzzleGroups(puzzle);
  const seed = groups[index].points.find(
    (p) => puzzle[p[0]][p[1]].type === "seed",
  );

  if (!seed) {
    const foundCells = groups[index].points.map((p) => puzzle[p[0]][p[1]]);
    throw new Error(`No seed found: expected seed for index ${index} in ${JSON.stringify(foundCells)}`);
  }

  return placements(seed, shape).filter((p) => {
    const inBounds = p.every(
      ([x, y]) => x >= 0 && x < puzzle.length && y >= 0 && y < puzzle[0].length,
    );

    if (!inBounds) {
      return false;
    }
    return p.every(
      ([x, y]) =>
        puzzle[x][y].type === "empty" ||
        (puzzle[x][y].type === "seed" && puzzle[x][y].index === index),
    );
  });
}

export function solvePlacement(
  puzzle: Puzzle,
  callback: (i: number) => void = () => {},
  reset = true,
): Puzzle | null {
  let finalResult: Puzzle | null = null;
  const groups = puzzleGroups(puzzle);
  const unfilledIndices = Object.keys(groups).filter(
    (i) => groups[parseInt(i)].points.length < 5,
  );

  if (unfilledIndices.length === 0) {
    return puzzle;
  }

  const index = parseInt(unfilledIndices[0]);

  const validPlacementsForIndex = validPlacements(
    puzzle,
    index,
    groups[index].shape,
  );

  if (validPlacementsForIndex.length === 0) {
    return null;
  }

  validPlacementsForIndex.forEach((p) => {
    const newPuzzle = puzzle.map((row) => row.slice());
    p.forEach(([x, y]) => {
      if (newPuzzle[x][y].type === "seed") {
        return;
      }
      newPuzzle[x][y] = { type: "filled", shape: groups[index].shape, index };
    });

    const result = solvePlacement(newPuzzle, callback, false);
    if (result) {
      finalResult = result;
      return;
    }
  });

  return finalResult;
}

export function fillRandom(puzzle: Puzzle): Puzzle | null {
  let curSolution: Puzzle | null = solvePlacement(puzzle);

  if (!curSolution) {
    return null;
  }

  let maxIndex = 0;
  curSolution.forEach((row) => {
    row.forEach((cell) => {
      if (cell.type === "filled" || cell.type === "seed") {
        maxIndex = Math.max(maxIndex, cell.index);
      }
    });
  });
  let emptyCells: [number, number][];

  outer:
  while (true) {
    if (!curSolution) throw new Error("No solution");
    emptyCells = [];
    curSolution.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell.type === "empty") {
          emptyCells.push([i, j]);
        }
      });
    });
    if (!emptyCells.length) break;

    const [i,j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    let solved = false;
    for (const shape of ALL_SHAPES.slice().sort(() => Math.random() - 0.5)) {
      curSolution[i][j] = { type: "seed", shape, index: maxIndex };
      const prev: PuzzleCell[][] = curSolution;
      curSolution = solvePlacement(curSolution);
      if (!!curSolution) {
        solved = true
        maxIndex++;
        break;
      } else {
        curSolution = prev;
      }
    }

    if (!solved) {
      curSolution![i][j] = { type: "blocked" };
    }
  }

  return curSolution;
}

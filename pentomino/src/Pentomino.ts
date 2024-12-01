export type PentominoShape = 'F' | 'I' | 'L' | 'N' | 'P' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z'

export type Point = [number, number]

export function pointsEqual (p1: Point[], p2: Point[]): boolean {
  let sorted1 = p1.slice().sort()
  let sorted2 = p2.slice().sort()

  return sorted1.every((p, i) => p[0] === sorted2[i][0] && p[1] === sorted2[i][1])
}

// Place the upper-leftmost point of the rectangle containing the pentomino at the origin
export function canonicalize(shape: Point[]): Point[] {
  const top = shape.reduce((min, [_x, y]) => Math.min(min, y), Infinity)
  const left = shape.reduce((min, [x, _y]) => Math.min(min, x), Infinity)

  return shape.map(([x, y]) => [x - left, y - top])};

export function isTranslation(s1: Point[], s2: Point[]): boolean {
  const c1 = canonicalize(s1)
  const c2 = canonicalize(s2)
  return c1.every(p => c2.some(p2 => p === p2))
}

export function reflect(shape: Point[]): Point[] {
  return shape.map(([x, y]) => [-x, y])
}

export function reflectY(shape: Point[]): Point[] {
  return shape.map(([x, y]) => [x, -y])
}

function allVariants(shape: Point[]): Point[][] {
  let s = canonicalize(shape);
  const variants: Point[][] = []
  for (let i = 0; i < 4; i++) {
    if (!variants.some(v => pointsEqual(v, s))) {
      variants.push(canonicalize(s))
    }
    const s2 = canonicalize(reflect(s))
    if (!variants.some(v => pointsEqual(v, s2))) {
      variants.push(s2)
    }

    const s3 = canonicalize(reflectY(s))
    if (!variants.some(v => pointsEqual(v, s3))) {
      variants.push(s3)
    }

    // Rotate 90 degrees
    s = canonicalize(s.map(([x, y]) => [-y, x]))
  }
  return variants
}

export const BASE_POINTS: Record<PentominoShape, Point[]> = {
  'F': canonicalize([[0, 0], [0, 1], [0, 2], [1, 0], [-1, 1]]),
  'I': canonicalize([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]),
  'L': canonicalize([[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]]),
  'N': canonicalize([[0, 0], [0, 1], [0, 2], [1, 2], [1, 3]]),
  'P': canonicalize([[0, 0], [0, 1], [0, 2], [1, 0], [1, 1]]),
  'T': canonicalize([[0, 0], [0, 1], [0, 2], [1, 1], [1, 2]]),
  'U': canonicalize([[0, 0], [0, 1], [0, 2], [1, 0], [1, 2]]),
  'V': canonicalize([[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]]),
  'W': canonicalize([[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]]),
  'X': canonicalize([[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0]]),
  'Y': canonicalize([[0, 0], [0, 1], [0, 2], [0, 3], [1, 1]]),
  'Z': canonicalize([[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]]),
}


export const ALL_BASE_POINTS: Record<PentominoShape, Point[][]> = function() {
  let res: Record<PentominoShape, Point[][]> = {} as Record<PentominoShape, Point[][]>

  Object.keys(BASE_POINTS).forEach(shape => {
    res[shape as PentominoShape] = allVariants(BASE_POINTS[shape as PentominoShape])
  })

  return res
}()

export function placements(point: Point, shape: PentominoShape): Point[][] {
  let res: Point[][] = []
  ALL_BASE_POINTS[shape].forEach(s => {
    s.forEach(p => {
      const dx = point[0] - p[0]
      const dy = point[1] - p[1]

      const translated = s.map(([x, y]) => [x + dx, y + dy]) as Point[]
      res.push(translated)
    })
  })

  return res
}

export type PuzzleCell = {
  type: 'empty'
} | {
  type: 'blocked'
} | {
  type: 'pentomino'
  shape: PentominoShape
}

export type Puzzle = PuzzleCell[][]

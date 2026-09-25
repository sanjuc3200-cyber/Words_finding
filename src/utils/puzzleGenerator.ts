import { Difficulty, Direction, DirectionName, GridPosition, PlacedWord, CategoryWord } from '../types/game';

export const DIRECTIONS: Record<DirectionName, Direction> = {
  E: { dRow: 0, dCol: 1, name: 'E', label: 'Horizontal (Left to Right)' },
  W: { dRow: 0, dCol: -1, name: 'W', label: 'Horizontal (Right to Left)' },
  S: { dRow: 1, dCol: 0, name: 'S', label: 'Vertical (Top to Bottom)' },
  N: { dRow: -1, dCol: 0, name: 'N', label: 'Vertical (Bottom to Top)' },
  SE: { dRow: 1, dCol: 1, name: 'SE', label: 'Diagonal (Down-Right)' },
  SW: { dRow: 1, dCol: -1, name: 'SW', label: 'Diagonal (Down-Left)' },
  NE: { dRow: -1, dCol: 1, name: 'NE', label: 'Diagonal (Up-Right)' },
  NW: { dRow: -1, dCol: -1, name: 'NW', label: 'Diagonal (Up-Left)' },
};

export const DIFFICULTY_CONFIGS: Record<Difficulty, { size: number; wordCount: number; directions: DirectionName[]; label: string }> = {
  easy: {
    size: 9,
    wordCount: 6,
    directions: ['E', 'S', 'SE'],
    label: 'Easy (9x9)',
  },
  medium: {
    size: 11,
    wordCount: 8,
    directions: ['E', 'S', 'SE', 'NE', 'W', 'N'],
    label: 'Medium (11x11)',
  },
  hard: {
    size: 13,
    wordCount: 11,
    directions: ['E', 'W', 'S', 'N', 'SE', 'SW', 'NE', 'NW'],
    label: 'Challenger (13x13)',
  },
};

// Seeded PRNG for Daily Puzzles
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getDateSeed(date: Date = new Date()): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

// Letter frequency weighted distribution for organic filler letters
const LETTER_WEIGHTS = 'EEEEEEEEEEEETTTTTTTTTAAAAAAAAAOOOOOOOOIIIIIIINNNNNNNSSSSSSSHHHHHHRRRRRRDDDDLLLLCCCUUUMMMWWFFGGYYPPBVKJXQZ';

export interface GeneratedPuzzle {
  grid: string[][];
  placedWords: PlacedWord[];
  size: number;
  unplacedCount: number;
}

export function generatePuzzle(
  rawWords: CategoryWord[],
  difficulty: Difficulty,
  seed?: number
): GeneratedPuzzle {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const size = config.size;
  const rand = seed !== undefined ? mulberry32(seed) : Math.random;

  // Shuffle input words
  const wordsPool = [...rawWords]
    .map((w) => ({
      ...w,
      word: w.word.toUpperCase().replace(/[^A-Z]/g, ''),
    }))
    .filter((w) => w.word.length >= 3 && w.word.length <= size);

  // Simple Fisher-Yates with rand
  for (let i = wordsPool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [wordsPool[i], wordsPool[j]] = [wordsPool[j], wordsPool[i]];
  }

  // Select target word count, sorted by length descending for best packing
  const targetWords = wordsPool.slice(0, Math.min(config.wordCount, wordsPool.length));
  targetWords.sort((a, b) => b.word.length - a.word.length);

  // Initialize empty grid with null
  const grid: (string | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );

  const placedWords: PlacedWord[] = [];
  const allowedDirNames = config.directions;

  // Palette color indices (0 through 11) for highlighting
  let colorCounter = 0;

  for (const item of targetWords) {
    const word = item.word;
    let placed = false;

    // Generate list of all possible (row, col, dir) combinations
    const candidates: { row: number; col: number; dir: DirectionName }[] = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        for (const dirName of allowedDirNames) {
          const dir = DIRECTIONS[dirName];
          const endRow = r + dir.dRow * (word.length - 1);
          const endCol = c + dir.dCol * (word.length - 1);

          if (endRow >= 0 && endRow < size && endCol >= 0 && endCol < size) {
            candidates.push({ row: r, col: c, dir: dirName });
          }
        }
      }
    }

    // Shuffle candidate spots
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // Prioritize candidates that overlap existing letters harmoniously
    candidates.sort((a, b) => {
      const overlapA = countOverlaps(grid, word, a.row, a.col, DIRECTIONS[a.dir]);
      const overlapB = countOverlaps(grid, word, b.row, b.col, DIRECTIONS[b.dir]);
      return overlapB - overlapA;
    });

    for (const cand of candidates) {
      const dir = DIRECTIONS[cand.dir];
      if (canPlaceWord(grid, word, cand.row, cand.col, dir)) {
        const path: GridPosition[] = [];
        for (let i = 0; i < word.length; i++) {
          const currR = cand.row + dir.dRow * i;
          const currC = cand.col + dir.dCol * i;
          grid[currR][currC] = word[i];
          path.push({ row: currR, col: currC });
        }

        placedWords.push({
          id: `w-${item.word}-${placedWords.length}`,
          word: item.word,
          clue: item.clue,
          trivia: item.trivia,
          start: path[0],
          end: path[path.length - 1],
          path,
          found: false,
          colorIndex: colorCounter++ % 12,
        });

        placed = true;
        break;
      }
    }

    if (!placed) {
      // Couldn't fit this specific word in current grid
    }
  }

  // Fill in blanks with organic random letter distribution
  const finalGrid: string[][] = [];
  for (let r = 0; r < size; r++) {
    finalGrid[r] = [];
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== null) {
        finalGrid[r][c] = grid[r][c]!;
      } else {
        const randIndex = Math.floor(rand() * LETTER_WEIGHTS.length);
        finalGrid[r][c] = LETTER_WEIGHTS[randIndex];
      }
    }
  }

  return {
    grid: finalGrid,
    placedWords,
    size,
    unplacedCount: targetWords.length - placedWords.length,
  };
}

function countOverlaps(
  grid: (string | null)[][],
  word: string,
  startRow: number,
  startCol: number,
  dir: Direction
): number {
  let overlaps = 0;
  for (let i = 0; i < word.length; i++) {
    const r = startRow + dir.dRow * i;
    const c = startCol + dir.dCol * i;
    const existing = grid[r][c];
    if (existing !== null) {
      if (existing === word[i]) {
        overlaps++;
      } else {
        return -1; // conflict
      }
    }
  }
  return overlaps;
}

function canPlaceWord(
  grid: (string | null)[][],
  word: string,
  startRow: number,
  startCol: number,
  dir: Direction
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = startRow + dir.dRow * i;
    const c = startCol + dir.dCol * i;
    const existing = grid[r][c];
    if (existing !== null && existing !== word[i]) {
      return false;
    }
  }
  return true;
}

// Check if a line from start to end matches one of the 8 grid directions
export function getStraightPath(
  start: GridPosition,
  end: GridPosition
): GridPosition[] | null {
  const dRow = end.row - start.row;
  const dCol = end.col - start.col;

  // Single cell
  if (dRow === 0 && dCol === 0) {
    return [start];
  }

  const stepRow = dRow === 0 ? 0 : dRow > 0 ? 1 : -1;
  const stepCol = dCol === 0 ? 0 : dCol > 0 ? 1 : -1;

  // Must be horizontal, vertical, or perfectly 45 degree diagonal
  const isHorizontal = dRow === 0;
  const isVertical = dCol === 0;
  const isDiagonal = Math.abs(dRow) === Math.abs(dCol);

  if (!isHorizontal && !isVertical && !isDiagonal) {
    return null;
  }

  const length = Math.max(Math.abs(dRow), Math.abs(dCol)) + 1;
  const path: GridPosition[] = [];

  for (let i = 0; i < length; i++) {
    path.push({
      row: start.row + stepRow * i,
      col: start.col + stepCol * i,
    });
  }

  return path;
}

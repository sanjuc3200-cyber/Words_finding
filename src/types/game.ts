export interface GridPosition {
  row: number;
  col: number;
}

export type DirectionName = 'E' | 'W' | 'S' | 'N' | 'SE' | 'SW' | 'NE' | 'NW';

export interface Direction {
  dRow: number;
  dCol: number;
  name: DirectionName;
  label: string;
}

export interface PlacedWord {
  id: string;
  word: string;
  clue?: string;
  trivia?: string;
  start: GridPosition;
  end: GridPosition;
  path: GridPosition[];
  found: boolean;
  colorIndex: number;
  foundAt?: number; // timestamp
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  size: number;
  wordCount: number;
  allowedDirections: DirectionName[];
  description: string;
}

export type ThemeId = 'midnight' | 'parchment' | 'emerald' | 'slate' | 'high-contrast';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bgClass: string;
  cardClass: string;
  gridBg: string;
  cellBg: string;
  cellHoverBg: string;
  cellSelectedBg: string;
  textColor: string;
  mutedColor: string;
  borderClass: string;
  accentBg: string;
  accentText: string;
}

export type GameMode = 'classic' | 'timed' | 'zen' | 'daily';

export type GameStatus = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY';

export type HintTier = 1 | 2 | 3 | 4;

export interface ActiveHint {
  wordId: string;
  tier: HintTier;
  targetWord: PlacedWord;
  description: string;
  highlightCells?: GridPosition[];
  highlightRow?: number;
  highlightCol?: number;
}

export interface CategoryWord {
  word: string;
  clue: string;
  trivia: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  description: string;
  words: CategoryWord[];
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalWordsFound: number;
  bestTimeSeconds: number;
  currentStreak: number;
  hintsUsedTotal: number;
}

export interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  clickToSelectMode: boolean; // alternative to drag
  soundEnabled: boolean;
}

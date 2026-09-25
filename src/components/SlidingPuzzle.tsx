import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ThemeConfig } from '../types/game';
import { playLetterTick, playWordFoundChime, playVictoryFanfare } from '../utils/sound';
import { RotateCcw, Undo2, Trophy, Clock, Footprints, HelpCircle, Sparkles } from 'lucide-react';

interface SlidingPuzzleProps {
  theme: ThemeConfig;
  onWin?: (moves: number, timeSec: number) => void;
}

type GridSize = 3 | 4 | 5;
type TileTheme = 'numbers' | 'emojis' | 'letters';

const EMOJI_SETS: Record<number, string> = {
  1: '🐶', 2: '🐱', 3: '🐭', 4: '🐹', 5: '🐰', 6: '🦊', 7: '🐻', 8: '🐼',
  9: '🐨', 10: '🐯', 11: '🦁', 12: '🐮', 13: '🐷', 14: '🐸', 15: '🐵',
  16: '🐔', 17: '🐧', 18: '🐦', 19: '🦆', 20: '🦅', 21: '🦉', 22: '🦇', 23: '🐺', 24: '🐗',
};

const LETTER_SETS: Record<number, string> = {
  1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F', 7: 'G', 8: 'H',
  9: 'I', 10: 'J', 11: 'K', 12: 'L', 13: 'M', 14: 'N', 15: 'O',
  16: 'P', 17: 'Q', 18: 'R', 19: 'S', 20: 'T', 21: 'U', 22: 'V', 23: 'W', 24: 'X',
};

export const SlidingPuzzle: React.FC<SlidingPuzzleProps> = ({ theme, onWin }) => {
  const [size, setSize] = useState<GridSize>(3);
  const [tileTheme, setTileTheme] = useState<TileTheme>('numbers');
  const [tiles, setTiles] = useState<number[]>([]);
  const [history, setHistory] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [hintIndex, setHintIndex] = useState<number | null>(null);

  // Best score tracker
  const [bestScore, setBestScore] = useState<{ moves: number; time: number } | null>(() => {
    try {
      const saved = localStorage.getItem(`sliding_best_${size}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  // Check if solved
  const checkWin = useCallback((currentTiles: number[]) => {
    if (currentTiles.length === 0) return false;
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i] !== i + 1) return false;
    }
    return currentTiles[currentTiles.length - 1] === 0;
  }, []);

  // Generate guaranteed solvable board by simulating random valid moves from solved state
  const resetGame = useCallback((newSize: GridSize = size) => {
    const totalTiles = newSize * newSize;
    // Solved state: [1, 2, ..., totalTiles - 1, 0]
    const solved: number[] = [];
    for (let i = 1; i < totalTiles; i++) solved.push(i);
    solved.push(0); // 0 is empty space

    let emptyIdx = totalTiles - 1;
    const current = [...solved];

    // Scramble by making 80-160 valid moves
    const scrambleMoves = newSize === 3 ? 80 : 150;
    let prevMove = -1;

    for (let s = 0; s < scrambleMoves; s++) {
      const row = Math.floor(emptyIdx / newSize);
      const col = emptyIdx % newSize;
      const validNeighbors: number[] = [];

      if (row > 0) validNeighbors.push(emptyIdx - newSize); // up
      if (row < newSize - 1) validNeighbors.push(emptyIdx + newSize); // down
      if (col > 0) validNeighbors.push(emptyIdx - 1); // left
      if (col < newSize - 1) validNeighbors.push(emptyIdx + 1); // right

      // Avoid immediately undoing the previous move
      const choices = validNeighbors.filter((idx) => idx !== prevMove);
      const targetIdx = choices.length > 0
        ? choices[Math.floor(Math.random() * choices.length)]
        : validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

      prevMove = emptyIdx;
      // swap
      [current[emptyIdx], current[targetIdx]] = [current[targetIdx], current[emptyIdx]];
      emptyIdx = targetIdx;
    }

    setTiles(current);
    setHistory([]);
    setMoves(0);
    setTimerSeconds(0);
    setIsPlaying(true);
    setIsWon(false);
    setHintIndex(null);

    // Update best score key
    try {
      const saved = localStorage.getItem(`sliding_best_${newSize}`);
      setBestScore(saved ? JSON.parse(saved) : null);
    } catch {
      // ignore
    }
  }, [size]);

  // Initial load
  const hasInit = useRef(false);
  useEffect(() => {
    if (!hasInit.current) {
      hasInit.current = true;
      resetGame(size);
    }
  }, [resetGame, size]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !isWon && moves > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isWon, moves]);

  // Move a tile if adjacent to empty (0)
  const moveTile = (index: number) => {
    if (isWon) return;
    const emptyIdx = tiles.indexOf(0);
    if (emptyIdx === -1) return;

    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIdx / size);
    const emptyCol = emptyIdx % size;

    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      playLetterTick(moves % 7);
      const nextTiles = [...tiles];
      [nextTiles[index], nextTiles[emptyIdx]] = [nextTiles[emptyIdx], nextTiles[index]];

      setHistory((prev) => [...prev, tiles]);
      setTiles(nextTiles);
      setMoves((prev) => prev + 1);
      setHintIndex(null);

      if (checkWin(nextTiles)) {
        setIsWon(true);
        setIsPlaying(false);
        playWordFoundChime();
        setTimeout(playVictoryFanfare, 300);

        // Confetti celebration
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });

        // Save best score
        const newBestMoves = !bestScore || (moves + 1) < bestScore.moves;
        if (newBestMoves) {
          const rec = { moves: moves + 1, time: timerSeconds };
          setBestScore(rec);
          try {
            localStorage.setItem(`sliding_best_${size}`, JSON.stringify(rec));
          } catch {
            // ignore
          }
        }

        onWin?.(moves + 1, timerSeconds);
      }
    }
  };

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWon) return;
      const emptyIdx = tiles.indexOf(0);
      if (emptyIdx === -1) return;

      const emptyRow = Math.floor(emptyIdx / size);
      const emptyCol = emptyIdx % size;
      let targetIdx = -1;

      // When player presses UP, the tile BELOW the empty space moves UP
      if (e.key === 'ArrowUp' && emptyRow < size - 1) {
        targetIdx = emptyIdx + size;
      } else if (e.key === 'ArrowDown' && emptyRow > 0) {
        targetIdx = emptyIdx - size;
      } else if (e.key === 'ArrowLeft' && emptyCol < size - 1) {
        targetIdx = emptyIdx + 1;
      } else if (e.key === 'ArrowRight' && emptyCol > 0) {
        targetIdx = emptyIdx - 1;
      }

      if (targetIdx !== -1) {
        e.preventDefault();
        moveTile(targetIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tiles, size, isWon, moves]);

  // Undo move
  const handleUndo = () => {
    if (history.length === 0 || isWon) return;
    const prev = history[history.length - 1];
    setTiles(prev);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => Math.max(0, m - 1));
  };

  // Provide a smart hint
  const handleHint = () => {
    const emptyIdx = tiles.indexOf(0);
    if (emptyIdx === -1) return;

    const row = Math.floor(emptyIdx / size);
    const col = emptyIdx % size;
    const candidates: number[] = [];

    if (row > 0) candidates.push(emptyIdx - size);
    if (row < size - 1) candidates.push(emptyIdx + size);
    if (col > 0) candidates.push(emptyIdx - 1);
    if (col < size - 1) candidates.push(emptyIdx + 1);

    // Pick candidate whose value is not currently in its home spot
    const bestCandidate = candidates.find((idx) => tiles[idx] !== idx + 1) || candidates[0];
    setHintIndex(bestCandidate);
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const renderTileContent = (val: number) => {
    if (val === 0) return null;
    if (tileTheme === 'emojis') {
      return (
        <span className="text-2xl sm:text-3xl filter drop-shadow-xs select-none">
          {EMOJI_SETS[val] || val}
        </span>
      );
    }
    if (tileTheme === 'letters') {
      return (
        <span className="text-xl sm:text-2xl font-bold font-mono">
          {LETTER_SETS[val] || val}
        </span>
      );
    }
    return (
      <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums">
        {val}
      </span>
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Controls HUD */}
      <div className={`w-full p-4 rounded-xl border ${theme.cardClass} mb-4 flex flex-wrap items-center justify-between gap-3 text-xs`}>
        {/* Grid Size Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Grid:</span>
          <div className="flex p-0.5 rounded-lg bg-slate-500/10 border border-slate-500/20">
            {([3, 4, 5] as GridSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  resetGame(s);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  size === s
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}×{s} ({s === 3 ? '8' : s === 4 ? '15' : '24'})
              </button>
            ))}
          </div>
        </div>

        {/* Tile Theme Style */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium hidden sm:inline">Theme:</span>
          <div className="flex p-0.5 rounded-lg bg-slate-500/10 border border-slate-500/20">
            {(['numbers', 'emojis', 'letters'] as TileTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTileTheme(t)}
                className={`px-2 py-1 rounded-md font-medium capitalize transition-all ${
                  tileTheme === t
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Restart & Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleHint}
            className="p-1.5 rounded-lg border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors"
            title="Show move hint"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0 || isWon}
            className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors"
            title="Undo move"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => resetGame(size)}
            className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Scramble & New Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="w-full flex items-center justify-between mb-3 px-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Footprints className="w-3.5 h-3.5 text-indigo-400" />
          <span>Moves:</span>
          <span className="font-mono font-bold text-slate-200 text-sm tabular-nums">
            {moves}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Time:</span>
          <span className="font-mono font-bold text-slate-200 text-sm tabular-nums">
            {timeFormatted}
          </span>
        </div>

        {bestScore && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Best:</span>
            <span className="font-mono font-bold text-amber-400 tabular-nums">
              {bestScore.moves} moves
            </span>
          </div>
        )}
      </div>

      {/* Main Sliding Grid */}
      <div
        className={`p-3 sm:p-4 rounded-2xl ${theme.gridBg} border ${theme.borderClass} shadow-xl relative select-none`}
      >
        <div
          className="grid gap-2 sm:gap-2.5"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            width: size === 3 ? '280px' : size === 4 ? '340px' : '380px',
            height: size === 3 ? '280px' : size === 4 ? '340px' : '380px',
            maxWidth: '85vw',
            maxHeight: '85vw',
          }}
        >
          {tiles.map((val, idx) => {
            const isEmpty = val === 0;
            const isCorrect = val === idx + 1;
            const isHint = hintIndex === idx;

            if (isEmpty) {
              return (
                <div
                  key="empty"
                  className="rounded-xl bg-slate-950/40 border border-dashed border-slate-700/50 flex items-center justify-center transition-all"
                />
              );
            }

            return (
              <button
                key={val}
                type="button"
                onClick={() => moveTile(idx)}
                className={`
                  rounded-xl flex items-center justify-center
                  cursor-pointer active:scale-95 transition-all duration-150
                  shadow-md font-sans relative
                  ${theme.cellBg}
                  ${isCorrect ? 'ring-1 ring-emerald-500/40' : ''}
                  ${isHint ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                  hover:brightness-110
                `}
              >
                {renderTileContent(val)}
                {isCorrect && (
                  <span className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Overlay */}
        {isWon && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold mb-1">Puzzle Solved!</h3>
            <p className="text-xs text-slate-300 mb-4">
              Arranged in <span className="font-mono font-bold text-white">{moves}</span> moves ({timeFormatted})
            </p>
            <button
              onClick={() => resetGame(size)}
              className={`px-5 py-2.5 rounded-xl ${theme.accentBg} text-xs font-semibold flex items-center gap-2 shadow-lg transition-all`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Next Round</span>
            </button>
          </div>
        )}
      </div>

      {/* Keyboard & Touch guidance */}
      <div className="mt-4 text-center text-xs text-slate-400 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Tap any tile adjacent to the empty spot to slide it. Keyboard arrows also supported!</span>
      </div>
    </div>
  );
};

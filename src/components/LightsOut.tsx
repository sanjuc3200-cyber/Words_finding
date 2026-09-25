import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ThemeConfig } from '../types/game';
import { playLetterTick, playWordFoundChime, playVictoryFanfare } from '../utils/sound';
import { RotateCcw, Lightbulb, Trophy, Footprints, Sparkles } from 'lucide-react';

interface LightsOutProps {
  theme: ThemeConfig;
  onWin?: (moves: number) => void;
}

type GridSize = 4 | 5;

export const LightsOut: React.FC<LightsOutProps> = ({ theme, onWin }) => {
  const [size, setSize] = useState<GridSize>(5);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Initialize board guaranteed solvable by pressing random switches from an all-off board
  const startNewGame = useCallback((newSize: GridSize = size) => {
    const total = newSize * newSize;
    const board: boolean[][] = Array.from({ length: newSize }, () =>
      Array.from({ length: newSize }, () => false)
    );

    const toggle = (r: number, c: number) => {
      const deltas = [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      deltas.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < newSize && nc >= 0 && nc < newSize) {
          board[nr][nc] = !board[nr][nc];
        }
      });
    };

    // Scramble with 8 to 15 random toggles
    const scrambleCount = newSize === 4 ? 8 : 12;
    for (let i = 0; i < scrambleCount; i++) {
      const r = Math.floor(Math.random() * newSize);
      const c = Math.floor(Math.random() * newSize);
      toggle(r, c);
    }

    setGrid(board);
    setMoves(0);
    setIsWon(false);
  }, [size]);

  // Initial load
  const hasInit = useRef(false);
  useEffect(() => {
    if (!hasInit.current) {
      hasInit.current = true;
      startNewGame();
    }
  }, [startNewGame]);

  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;

    playLetterTick(moves % 6);

    const nextGrid = grid.map((row) => [...row]);
    const deltas = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    deltas.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        nextGrid[nr][nc] = !nextGrid[nr][nc];
      }
    });

    setGrid(nextGrid);
    setMoves((m) => m + 1);

    // Check if all are off
    const allOff = nextGrid.every((row) => row.every((val) => !val));
    if (allOff) {
      setIsWon(true);
      playWordFoundChime();
      setTimeout(playVictoryFanfare, 250);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      onWin?.(moves + 1);
    }
  };

  const lightsOnCount = grid.reduce(
    (acc, row) => acc + row.filter((c) => c).length,
    0
  );

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Controls HUD */}
      <div className={`w-full p-4 rounded-xl border ${theme.cardClass} mb-4 flex flex-wrap items-center justify-between gap-3 text-xs`}>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Grid:</span>
          <div className="flex p-0.5 rounded-lg bg-slate-500/10 border border-slate-500/20">
            {([4, 5] as GridSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  startNewGame(s);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  size === s
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}×{s} Grid
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Lights On:</span>
            <span className="font-mono font-bold text-amber-400">{lightsOnCount}</span>
          </div>

          <button
            type="button"
            onClick={() => startNewGame(size)}
            className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Reset Puzzle"
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

        <div className="text-slate-400">
          Goal: Turn all tiles <strong className="text-slate-200">OFF</strong>
        </div>
      </div>

      {/* Main Grid */}
      <div
        className={`p-4 sm:p-5 rounded-2xl ${theme.gridBg} border ${theme.borderClass} shadow-xl relative select-none w-full max-w-sm`}
      >
        <div
          className="grid gap-2.5 sm:gap-3"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((isOn, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => handleCellClick(r, c)}
                className={`
                  aspect-square rounded-xl flex items-center justify-center
                  cursor-pointer transition-all duration-200 active:scale-95
                  shadow-md
                  ${
                    isOn
                      ? 'bg-amber-400 text-slate-950 shadow-amber-400/30 shadow-lg scale-100 ring-2 ring-amber-300'
                      : 'bg-slate-900 border border-slate-800 text-slate-600 hover:bg-slate-800'
                  }
                `}
              >
                <Lightbulb
                  className={`w-6 h-6 transition-transform ${
                    isOn ? 'fill-amber-400 text-amber-950 scale-110' : 'text-slate-700'
                  }`}
                />
              </button>
            ))
          )}
        </div>

        {/* Victory Overlay */}
        {isWon && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold mb-1">All Lights Cleared!</h3>
            <p className="text-xs text-slate-300 mb-4">
              Solved in <span className="font-mono font-bold text-white">{moves}</span> moves!
            </p>
            <button
              onClick={() => startNewGame(size)}
              className={`px-5 py-2.5 rounded-xl ${theme.accentBg} text-xs font-semibold flex items-center gap-2 shadow-lg transition-all`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Puzzle</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Tapping a light switches it and all four neighboring lights!</span>
      </div>
    </div>
  );
};

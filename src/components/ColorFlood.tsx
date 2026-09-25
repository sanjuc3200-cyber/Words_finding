import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ThemeConfig } from '../types/game';
import { playLetterTick, playWordFoundChime, playInvalidThud, playVictoryFanfare } from '../utils/sound';
import { RotateCcw, Trophy, Footprints, Sparkles, AlertCircle } from 'lucide-react';

interface ColorFloodProps {
  theme: ThemeConfig;
  onWin?: (moves: number) => void;
}

const FLOOD_COLORS = [
  { id: 0, name: 'Coral', bg: 'bg-rose-500', hex: '#F43F5E' },
  { id: 1, name: 'Amber', bg: 'bg-amber-400', hex: '#FBBF24' },
  { id: 2, name: 'Emerald', bg: 'bg-emerald-500', hex: '#10B981' },
  { id: 3, name: 'Cyan', bg: 'bg-cyan-500', hex: '#06B6D4' },
  { id: 4, name: 'Indigo', bg: 'bg-indigo-500', hex: '#6366F1' },
  { id: 5, name: 'Purple', bg: 'bg-purple-500', hex: '#A855F7' },
];

export const ColorFlood: React.FC<ColorFloodProps> = ({ theme, onWin }) => {
  const size = 10;
  const maxMoves = 22;

  const [grid, setGrid] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Generate random board
  const startNewGame = useCallback(() => {
    const board: number[][] = [];
    for (let r = 0; r < size; r++) {
      board[r] = [];
      for (let c = 0; c < size; c++) {
        board[r][c] = Math.floor(Math.random() * FLOOD_COLORS.length);
      }
    }
    setGrid(board);
    setMoves(0);
    setIsWon(false);
    setIsGameOver(false);
  }, [size]);

  // Initial load
  const hasInit = useRef(false);
  useEffect(() => {
    if (!hasInit.current) {
      hasInit.current = true;
      startNewGame();
    }
  }, [startNewGame]);

  // Handle color selection to flood
  const handleColorClick = (colorId: number) => {
    if (isWon || isGameOver) return;
    const currentColor = grid[0][0];
    if (colorId === currentColor) return; // same color, no-op

    playLetterTick(moves % 6);

    // Flood fill algorithm starting from (0,0)
    const nextGrid = grid.map((row) => [...row]);
    const visited: boolean[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => false)
    );

    const queue: [number, number][] = [[0, 0]];
    visited[0][0] = true;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      nextGrid[r][c] = colorId;

      const deltas = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      deltas.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (
          nr >= 0 &&
          nr < size &&
          nc >= 0 &&
          nc < size &&
          !visited[nr][nc] &&
          grid[nr][nc] === currentColor
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      });
    }

    const nextMoves = moves + 1;
    setGrid(nextGrid);
    setMoves(nextMoves);

    // Check if entire board is colorId
    const allSame = nextGrid.every((row) => row.every((c) => c === colorId));
    if (allSame) {
      setIsWon(true);
      playWordFoundChime();
      setTimeout(playVictoryFanfare, 200);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      onWin?.(nextMoves);
    } else if (nextMoves >= maxMoves) {
      setIsGameOver(true);
      playInvalidThud();
    }
  };

  const remaining = maxMoves - moves;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Controls HUD */}
      <div className={`w-full p-4 rounded-xl border ${theme.cardClass} mb-4 flex flex-wrap items-center justify-between gap-3 text-xs`}>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Footprints className="w-3.5 h-3.5 text-indigo-400" />
          <span>Moves:</span>
          <span className="font-mono font-bold text-slate-100 text-sm tabular-nums">
            {moves} / {maxMoves}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <span>Remaining:</span>
          <span
            className={`font-mono font-bold text-sm tabular-nums ${
              remaining <= 5 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {remaining}
          </span>
        </div>

        <button
          type="button"
          onClick={startNewGame}
          className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
          title="Restart Board"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Container */}
      <div
        className={`p-3 sm:p-4 rounded-2xl ${theme.gridBg} border ${theme.borderClass} shadow-xl relative select-none w-full max-w-sm`}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((colorId, c) => (
              <div
                key={`${r}-${c}`}
                className="aspect-square rounded-xs transition-colors duration-200"
                style={{ backgroundColor: FLOOD_COLORS[colorId]?.hex || '#fff' }}
              />
            ))
          )}
        </div>

        {/* Victory Overlay */}
        {isWon && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold mb-1">Board Flooded!</h3>
            <p className="text-xs text-slate-300 mb-4">
              Filled the board in <span className="font-mono font-bold text-white">{moves}</span> moves!
            </p>
            <button
              onClick={startNewGame}
              className={`px-5 py-2.5 rounded-xl ${theme.accentBg} text-xs font-semibold flex items-center gap-2 shadow-lg transition-all`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Puzzle</span>
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-1">Out of Moves!</h3>
            <p className="text-xs text-slate-300 mb-4">
              Used all {maxMoves} moves. Give it another try!
            </p>
            <button
              onClick={startNewGame}
              className={`px-5 py-2.5 rounded-xl ${theme.accentBg} text-xs font-semibold flex items-center gap-2 shadow-lg transition-all`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}
      </div>

      {/* Color Palette Selector Buttons */}
      <div className="mt-4 flex items-center justify-center gap-3">
        {FLOOD_COLORS.map((color) => {
          const isCurrentTopLeft = grid[0]?.[0] === color.id;

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => handleColorClick(color.id)}
              className={`
                w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-150 transform
                active:scale-90 shadow-md flex items-center justify-center
                ${isCurrentTopLeft ? 'ring-3 ring-white scale-110' : 'hover:scale-105'}
              `}
              style={{ backgroundColor: color.hex }}
              title={`Flood with ${color.name}`}
            />
          );
        })}
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Tap colors to flood from the top-left until the whole board is one color!</span>
      </div>
    </div>
  );
};

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GridPosition, PlacedWord, ActiveHint, ThemeConfig } from '../types/game';
import { getStraightPath } from '../utils/puzzleGenerator';
import { HIGHLIGHTER_COLORS } from '../utils/theme';
import { playLetterTick, playInvalidThud, playWordFoundChime } from '../utils/sound';

interface WordGridProps {
  grid: string[][];
  placedWords: PlacedWord[];
  theme: ThemeConfig;
  largeText: boolean;
  highContrast: boolean;
  clickToSelectMode: boolean;
  activeHint: ActiveHint | null;
  onWordDiscovered: (foundWord: PlacedWord) => void;
  onActiveSelectionChange?: (currentWord: string) => void;
}

export const WordGrid: React.FC<WordGridProps> = ({
  grid,
  placedWords,
  theme,
  largeText,
  highContrast,
  clickToSelectMode,
  activeHint,
  onWordDiscovered,
  onActiveSelectionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState<GridPosition | null>(null);
  const [currentPath, setCurrentPath] = useState<GridPosition[]>([]);
  const [selectedWordString, setSelectedWordString] = useState<string>('');

  const numRows = grid.length;
  const numCols = grid[0]?.length || 0;

  // Compute cell coordinates for SVG highlighter rendering
  const [cellSize, setCellSize] = useState<number>(44);

  // Measure cell size dynamically on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const firstCell = containerRef.current.querySelector<HTMLElement>('[data-cell]');
        if (firstCell) {
          const rect = firstCell.getBoundingClientRect();
          if (rect.width > 0) {
            setCellSize(rect.width);
          }
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [grid, largeText]);

  // Extract letter from grid position
  const getLetterAt = useCallback(
    (pos: GridPosition): string => {
      if (pos.row >= 0 && pos.row < numRows && pos.col >= 0 && pos.col < numCols) {
        return grid[pos.row][pos.col] || '';
      }
      return '';
    },
    [grid, numRows, numCols]
  );

  // Evaluate if current path forms an unplaced word
  const evaluateSelection = useCallback(
    (path: GridPosition[]) => {
      if (path.length < 2) {
        setIsSelecting(false);
        setStartPos(null);
        setCurrentPath([]);
        setSelectedWordString('');
        onActiveSelectionChange?.('');
        return;
      }

      const forwardWord = path.map((p) => getLetterAt(p)).join('');
      const backwardWord = forwardWord.split('').reverse().join('');

      const matchedWord = placedWords.find(
        (pw) => !pw.found && (pw.word === forwardWord || pw.word === backwardWord)
      );

      if (matchedWord) {
        playWordFoundChime();
        onWordDiscovered(matchedWord);
      } else {
        playInvalidThud();
      }

      setIsSelecting(false);
      setStartPos(null);
      setCurrentPath([]);
      setSelectedWordString('');
      onActiveSelectionChange?.('');
    },
    [getLetterAt, placedWords, onWordDiscovered, onActiveSelectionChange]
  );

  // Mouse / Pointer handlers
  const handlePointerDown = (row: number, col: number) => {
    if (clickToSelectMode) {
      if (!startPos) {
        // First click
        setStartPos({ row, col });
        const path = [{ row, col }];
        setCurrentPath(path);
        const wordStr = getLetterAt({ row, col });
        setSelectedWordString(wordStr);
        onActiveSelectionChange?.(wordStr);
        playLetterTick(0);
      } else {
        // Second click
        const straight = getStraightPath(startPos, { row, col });
        if (straight) {
          evaluateSelection(straight);
        } else {
          // Restart with new start pos
          setStartPos({ row, col });
          setCurrentPath([{ row, col }]);
          const wordStr = getLetterAt({ row, col });
          setSelectedWordString(wordStr);
          onActiveSelectionChange?.(wordStr);
          playLetterTick(0);
        }
      }
      return;
    }

    setIsSelecting(true);
    const start = { row, col };
    setStartPos(start);
    setCurrentPath([start]);
    const wordStr = getLetterAt(start);
    setSelectedWordString(wordStr);
    onActiveSelectionChange?.(wordStr);
    playLetterTick(0);
  };

  const handlePointerEnter = (row: number, col: number) => {
    if (clickToSelectMode) {
      if (startPos) {
        const straight = getStraightPath(startPos, { row, col });
        if (straight) {
          setCurrentPath(straight);
          const wordStr = straight.map((p) => getLetterAt(p)).join('');
          setSelectedWordString(wordStr);
          onActiveSelectionChange?.(wordStr);
        }
      }
      return;
    }

    if (!isSelecting || !startPos) return;

    const straight = getStraightPath(startPos, { row, col });
    if (straight) {
      if (straight.length !== currentPath.length) {
        playLetterTick(straight.length - 1);
      }
      setCurrentPath(straight);
      const wordStr = straight.map((p) => getLetterAt(p)).join('');
      setSelectedWordString(wordStr);
      onActiveSelectionChange?.(wordStr);
    }
  };

  const handlePointerUp = () => {
    if (clickToSelectMode) return;
    if (isSelecting && currentPath.length > 0) {
      evaluateSelection(currentPath);
    }
  };

  // Touch Move handler with elementFromPoint
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting || !startPos) return;
    const touch = e.touches[0];
    if (!touch) return;

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = element?.closest('[data-cell]');
    if (cell) {
      const row = Number(cell.getAttribute('data-row'));
      const col = Number(cell.getAttribute('data-col'));
      if (!isNaN(row) && !isNaN(col)) {
        const straight = getStraightPath(startPos, { row, col });
        if (straight) {
          if (straight.length !== currentPath.length) {
            playLetterTick(straight.length - 1);
          }
          setCurrentPath(straight);
          const wordStr = straight.map((p) => getLetterAt(p)).join('');
          setSelectedWordString(wordStr);
          onActiveSelectionChange?.(wordStr);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (clickToSelectMode) return;
    if (isSelecting && currentPath.length > 0) {
      evaluateSelection(currentPath);
    }
  };

  // Check if position is currently active in drag selection
  const isPosInCurrentPath = (row: number, col: number) => {
    return currentPath.some((p) => p.row === row && p.col === col);
  };

  // Render SVG highlighter pill paths for found words
  const renderFoundWordsHighlighters = () => {
    return placedWords
      .filter((pw) => pw.found && pw.path.length >= 2)
      .map((pw) => {
        const color = HIGHLIGHTER_COLORS[pw.colorIndex % HIGHLIGHTER_COLORS.length];
        const start = pw.path[0];
        const end = pw.path[pw.path.length - 1];

        // Coordinate calculations (center of cells)
        const x1 = start.col * cellSize + cellSize / 2;
        const y1 = start.row * cellSize + cellSize / 2;
        const x2 = end.col * cellSize + cellSize / 2;
        const y2 = end.row * cellSize + cellSize / 2;

        return (
          <line
            key={pw.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color.stroke}
            strokeWidth={cellSize * 0.78}
            strokeLinecap="round"
            strokeOpacity={0.35}
            className="transition-all duration-300 pointer-events-none"
          />
        );
      });
  };

  // Render SVG active selection line
  const renderActiveSelectionHighlighter = () => {
    if (currentPath.length < 2) return null;
    const start = currentPath[0];
    const end = currentPath[currentPath.length - 1];

    const x1 = start.col * cellSize + cellSize / 2;
    const y1 = start.row * cellSize + cellSize / 2;
    const x2 = end.col * cellSize + cellSize / 2;
    const y2 = end.row * cellSize + cellSize / 2;

    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#6366F1"
        strokeWidth={cellSize * 0.76}
        strokeLinecap="round"
        strokeOpacity={0.45}
        className="pointer-events-none"
      />
    );
  };

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* Live selection preview banner */}
      <div className="h-8 flex items-center justify-center mb-2">
        {selectedWordString ? (
          <div className="px-4 py-1 rounded-md bg-indigo-600/10 border border-indigo-500/30 text-indigo-500 dark:text-indigo-300 font-mono tracking-widest text-sm font-bold animate-fadeIn">
            {selectedWordString}
          </div>
        ) : activeHint?.description ? (
          <div className="px-3 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
            💡 {activeHint.description}
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {clickToSelectMode ? 'Click first & last letter to solve' : 'Drag or swipe across letters to find words'}
          </span>
        )}
      </div>

      {/* Grid container with relative overlay */}
      <div
        ref={containerRef}
        onPointerUp={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative inline-block p-2 md:p-3 rounded-xl ${theme.gridBg} no-select touch-none-all shadow-md`}
        style={{ touchAction: 'none' }}
      >
        {/* SVG overlay for highlighter pills */}
        <svg
          className="absolute inset-0 pointer-events-none z-10 m-2 md:m-3"
          width={numCols * cellSize}
          height={numRows * cellSize}
        >
          {renderFoundWordsHighlighters()}
          {renderActiveSelectionHighlighter()}
        </svg>

        {/* Letters Grid */}
        <div
          className="grid gap-1 md:gap-1.5 relative z-20"
          style={{
            gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const isSelected = isPosInCurrentPath(r, c);
              const isHintFirstLetter =
                activeHint &&
                activeHint.tier >= 2 &&
                activeHint.targetWord.start.row === r &&
                activeHint.targetWord.start.col === c;

              const isHintRow =
                activeHint &&
                activeHint.tier >= 3 &&
                activeHint.highlightRow === r;

              const isHintCol =
                activeHint &&
                activeHint.tier >= 3 &&
                activeHint.highlightCol === c;

              const isStartClickCell =
                clickToSelectMode &&
                startPos &&
                startPos.row === r &&
                startPos.col === c;

              return (
                <div
                  key={`${r}-${c}`}
                  data-cell
                  data-row={r}
                  data-col={c}
                  onPointerDown={() => handlePointerDown(r, c)}
                  onPointerEnter={() => handlePointerEnter(r, c)}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12
                    ${largeText ? 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14' : ''}
                    flex items-center justify-center
                    rounded-lg
                    font-sans font-bold
                    ${largeText ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg md:text-xl'}
                    cursor-pointer
                    transition-all duration-150
                    relative
                    ${theme.cellBg}
                    ${isSelected ? theme.cellSelectedBg : ''}
                    ${isStartClickCell ? 'ring-2 ring-indigo-500 scale-105' : ''}
                    ${isHintRow || isHintCol ? 'bg-amber-400/20' : ''}
                    ${highContrast ? 'border border-black font-extrabold' : ''}
                  `}
                >
                  <span
                    className={`
                      ${isSelected ? 'scale-110' : ''}
                      transition-transform duration-100
                      ${isHintFirstLetter ? 'animate-bounce text-amber-500 font-extrabold' : ''}
                    `}
                  >
                    {letter}
                  </span>

                  {/* Pulsing hint beacon on first letter */}
                  {isHintFirstLetter && (
                    <span className="absolute inset-0 rounded-lg ring-2 ring-amber-400 ring-offset-1 animate-pulse pointer-events-none" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

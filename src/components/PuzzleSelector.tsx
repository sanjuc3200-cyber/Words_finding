import React from 'react';
import { PuzzleType, ThemeConfig } from '../types/game';
import { Grid, Search, Layers, Droplet, Lightbulb } from 'lucide-react';

interface PuzzleSelectorProps {
  theme: ThemeConfig;
  activePuzzle: PuzzleType;
  onSelectPuzzle: (puzzle: PuzzleType) => void;
}

const PUZZLE_MODES: { id: PuzzleType; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { id: 'sliding', label: 'Sliding Tiles', icon: Grid, desc: 'Classic 15-Puzzle & 8-Puzzle' },
  { id: 'wordsearch', label: 'Word Search', icon: Search, desc: 'Find hidden words' },
  { id: 'memory', label: 'Memory Match', icon: Layers, desc: 'Pair matching cards' },
  { id: 'flood', label: 'Color Flood', icon: Droplet, desc: 'Fill the board in min moves' },
  { id: 'lights', label: 'Lights Out', icon: Lightbulb, desc: 'Toggle all lights off' },
];

export const PuzzleSelector: React.FC<PuzzleSelectorProps> = ({
  theme,
  activePuzzle,
  onSelectPuzzle,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-3 pb-1">
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800 overflow-x-auto no-scrollbar">
        {PUZZLE_MODES.map((item) => {
          const isActive = activePuzzle === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPuzzle(item.id)}
              className={`
                flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold
                whitespace-nowrap transition-all duration-150 shrink-0
                ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }
              `}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

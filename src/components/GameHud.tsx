import React from 'react';
import { Difficulty, GameMode, ThemeConfig, Category } from '../types/game';
import { CATEGORIES } from '../data/categories';
import { DIFFICULTY_CONFIGS } from '../utils/puzzleGenerator';
import { RotateCcw, Lightbulb, Clock, Sparkles } from 'lucide-react';

interface GameHudProps {
  theme: ThemeConfig;
  selectedCategory: Category;
  difficulty: Difficulty;
  gameMode: GameMode;
  timerSeconds: number;
  unfoundCount: number;
  onSelectCategory: (cat: Category) => void;
  onChangeDifficulty: (diff: Difficulty) => void;
  onChangeMode: (mode: GameMode) => void;
  onNewPuzzle: () => void;
  onTriggerRandomHint: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  theme,
  selectedCategory,
  difficulty,
  gameMode,
  timerSeconds,
  unfoundCount,
  onSelectCategory,
  onChangeDifficulty,
  onChangeMode,
  onNewPuzzle,
  onTriggerRandomHint,
}) => {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className={`w-full max-w-5xl mx-auto px-4 py-3 mb-4 rounded-xl border ${theme.cardClass} flex flex-wrap items-center justify-between gap-3 text-xs`}>
      {/* Category selector */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 font-medium hidden sm:inline">Theme:</span>
        <select
          value={selectedCategory.id}
          onChange={(e) => {
            const cat = CATEGORIES.find((c) => c.id === e.target.value);
            if (cat) onSelectCategory(cat);
          }}
          className={`px-3 py-1.5 rounded-lg border ${theme.borderClass} bg-transparent font-medium cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500`}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
              {c.name}
            </option>
          ))}
          {selectedCategory.id === 'custom' && (
            <option value="custom" className="bg-slate-900 text-slate-100">
              {selectedCategory.name}
            </option>
          )}
        </select>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex items-center p-0.5 rounded-lg bg-slate-500/10 border border-slate-500/20">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onChangeDifficulty(d)}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              difficulty === d
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {d === 'easy' ? '9×9 Easy' : d === 'medium' ? '11×11 Medium' : '13×13 Challenger'}
          </button>
        ))}
      </div>

      {/* Mode Tabs */}
      <div className="hidden lg:flex items-center p-0.5 rounded-lg bg-slate-500/10 border border-slate-500/20">
        {(['classic', 'timed', 'zen'] as GameMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChangeMode(m)}
            className={`px-2.5 py-1 rounded-md transition-all font-medium capitalize ${
              gameMode === m
                ? 'bg-slate-700/80 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Timer / Words Status */}
      <div className="flex items-center gap-3">
        {gameMode !== 'zen' ? (
          <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-300 font-semibold bg-slate-500/10 px-2.5 py-1 rounded-lg border border-slate-500/20">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{timeFormatted}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-slate-400 bg-slate-500/10 px-2.5 py-1 rounded-lg border border-slate-500/20">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Zen Mode</span>
          </div>
        )}

        {/* Quick Hint Button */}
        <button
          type="button"
          onClick={onTriggerRandomHint}
          disabled={unfoundCount === 0}
          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50"
          title="Get a clue"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Hint</span>
        </button>

        {/* New Puzzle Button */}
        <button
          type="button"
          onClick={onNewPuzzle}
          className="p-1.5 rounded-lg border border-slate-700/40 hover:bg-slate-700/40 text-slate-400 hover:text-slate-200 transition-colors"
          title="New grid"
          aria-label="New puzzle board"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

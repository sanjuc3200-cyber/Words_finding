import React, { useState } from 'react';
import { Difficulty, ThemeConfig, CategoryWord } from '../types/game';
import { X, Plus, Sparkles, AlertCircle } from 'lucide-react';

interface CustomPuzzleModalProps {
  isOpen: boolean;
  theme: ThemeConfig;
  onClose: () => void;
  onCreateCustomPuzzle: (name: string, words: CategoryWord[], difficulty: Difficulty) => void;
}

export const CustomPuzzleModal: React.FC<CustomPuzzleModalProps> = ({
  isOpen,
  theme,
  onClose,
  onCreateCustomPuzzle,
}) => {
  const [title, setTitle] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setError(null);
    const cleanedTitle = title.trim() || 'Custom Word Hunt';

    // Parse words split by commas, newlines, or spaces
    const rawList = wordInput
      .split(/[\n,]+/)
      .map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, ''))
      .filter((w) => w.length >= 3 && w.length <= 13);

    const uniqueWords = Array.from(new Set(rawList));

    if (uniqueWords.length < 4) {
      setError('Please provide at least 4 valid words (3 to 13 letters each).');
      return;
    }

    const categoryWords: CategoryWord[] = uniqueWords.map((word) => ({
      word,
      clue: `A custom word from "${cleanedTitle}"`,
      trivia: `Player-created challenge word: ${word}.`,
    }));

    onCreateCustomPuzzle(cleanedTitle, categoryWords, difficulty);
    onClose();
  };

  const loadSamplePreset = (presetName: string) => {
    if (presetName === 'fruits') {
      setTitle('Exotic Fruits');
      setWordInput('MANGO, PAPAYA, GUAVA, POMEGRANATE, PASSIONFRUIT, DRAGONFRUIT, KUMQUAT, LYCHEE');
    } else if (presetName === 'gemstones') {
      setTitle('Precious Gems');
      setWordInput('SAPPHIRE, EMERALD, AMETHYST, RUBY, TURQUOISE, OPAL, TOPAZ, TANZANITE');
    } else if (presetName === 'composers') {
      setTitle('Classical Maestros');
      setWordInput('MOZART, BEETHOVEN, CHOPIN, VIVALDI, BACH, TCHAIKOVSKY, DEBUSSY, SCHUBERT');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl border ${theme.cardClass} p-6 shadow-2xl relative`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          aria-label="Close custom creator"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Custom Puzzle Architect</h3>
            <p className="text-xs text-slate-400">
              Craft your own word search grid from any words you choose
            </p>
          </div>
        </div>

        {/* Presets quick load */}
        <div className="flex items-center gap-2 mb-4 text-xs">
          <span className="text-slate-400">Quick samples:</span>
          <button
            type="button"
            onClick={() => loadSamplePreset('fruits')}
            className="px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 hover:border-indigo-400 text-slate-300 transition-colors"
          >
            Fruits
          </button>
          <button
            type="button"
            onClick={() => loadSamplePreset('gemstones')}
            className="px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 hover:border-indigo-400 text-slate-300 transition-colors"
          >
            Gemstones
          </button>
          <button
            type="button"
            onClick={() => loadSamplePreset('composers')}
            className="px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 hover:border-indigo-400 text-slate-300 transition-colors"
          >
            Composers
          </button>
        </div>

        {/* Puzzle Name */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Puzzle Theme / Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My Favorite Authors, 7th Grade Science, Birthday Special..."
            className="w-full px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 text-sm focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Words Input */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Enter Words (separated by comma or newline)
          </label>
          <textarea
            rows={4}
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            placeholder="DIAMOND, PEARL, JADE, OBSIDIAN, GARNET, ONYX..."
            className="w-full px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 text-sm font-mono focus:outline-hidden focus:border-indigo-500 uppercase"
          />
          <span className="text-[11px] text-slate-400">
            Letters only (A-Z). Words will be placed automatically in optimal directions.
          </span>
        </div>

        {/* Difficulty choice */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Grid Scale & Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  difficulty === d
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                    : 'border-slate-700 hover:border-slate-600 text-slate-400'
                }`}
              >
                <div className="capitalize font-semibold">{d}</div>
                <div className="text-[10px] opacity-75">
                  {d === 'easy' ? '9x9' : d === 'medium' ? '11x11' : '13x13'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-inherit">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className={`px-5 py-2 rounded-lg ${theme.accentBg} text-xs font-medium flex items-center gap-2 shadow-sm transition-all`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Puzzle</span>
          </button>
        </div>
      </div>
    </div>
  );
};

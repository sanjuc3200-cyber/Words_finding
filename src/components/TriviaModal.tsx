import React from 'react';
import { PlacedWord, ThemeConfig } from '../types/game';
import { HIGHLIGHTER_COLORS } from '../utils/theme';
import { BookOpen, CheckCircle, X } from 'lucide-react';

interface TriviaModalProps {
  word: PlacedWord | null;
  isOpen: boolean;
  theme: ThemeConfig;
  onClose: () => void;
}

export const TriviaModal: React.FC<TriviaModalProps> = ({
  word,
  isOpen,
  theme,
  onClose,
}) => {
  if (!isOpen || !word) return null;

  const color = HIGHLIGHTER_COLORS[word.colorIndex % HIGHLIGHTER_COLORS.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-2xl border ${theme.cardClass} p-6 shadow-2xl relative`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
            style={{ backgroundColor: color.stroke }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-mono tracking-wider">{word.word}</h3>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-400">Lexicon Discovery Profile</p>
          </div>
        </div>

        {word.clue && (
          <div className="mb-3 p-3 rounded-lg bg-slate-500/10 border border-slate-500/20 text-xs">
            <span className="font-semibold text-slate-400">Definition: </span>
            <span>{word.clue}</span>
          </div>
        )}

        {word.trivia ? (
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm leading-relaxed">
            <div className="font-semibold text-indigo-400 text-xs mb-1 flex items-center gap-1">
              <span>Did You Know?</span>
            </div>
            <p className="text-slate-300">{word.trivia}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Found on the board starting at Row {word.start.row + 1}, Col {word.start.col + 1}.
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-medium rounded-lg ${theme.accentBg} transition-all`}
          >
            Back to Puzzle
          </button>
        </div>
      </div>
    </div>
  );
};

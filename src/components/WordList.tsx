import React from 'react';
import { PlacedWord, ThemeConfig } from '../types/game';
import { HIGHLIGHTER_COLORS } from '../utils/theme';
import { Check, HelpCircle, Info } from 'lucide-react';

interface WordListProps {
  placedWords: PlacedWord[];
  theme: ThemeConfig;
  largeText: boolean;
  onWordClick: (word: PlacedWord) => void;
  onTriviaClick: (word: PlacedWord) => void;
}

export const WordList: React.FC<WordListProps> = ({
  placedWords,
  theme,
  largeText,
  onWordClick,
  onTriviaClick,
}) => {
  const foundCount = placedWords.filter((w) => w.found).length;
  const totalCount = placedWords.length;
  const percentage = totalCount > 0 ? Math.round((foundCount / totalCount) * 100) : 0;

  return (
    <div className={`p-4 rounded-xl border ${theme.cardClass} flex flex-col h-full`}>
      {/* Header with clean progress */}
      <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
            Word Bank
          </h2>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
            <span className="font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
              {foundCount} of {totalCount} discovered
            </span>
            <span aria-hidden="true">·</span>
            <span>{percentage}%</span>
          </div>
        </div>
        <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Words Grid / List */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-1 gap-2 overflow-y-auto max-h-[380px] pr-1">
        {placedWords.map((item) => {
          const color = HIGHLIGHTER_COLORS[item.colorIndex % HIGHLIGHTER_COLORS.length];

          if (item.found) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTriviaClick(item)}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg text-left
                  transition-colors border border-transparent
                  hover:bg-slate-100 dark:hover:bg-slate-800/60
                  ${largeText ? 'text-base' : 'text-sm'}
                `}
                title="Click to view trivia"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color.stroke }}
                  />
                  <span className="line-through opacity-60 font-mono font-medium tracking-wide">
                    {item.word}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <Info className="w-3.5 h-3.5 hover:text-indigo-400 shrink-0" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onWordClick(item)}
              className={`
                flex items-center justify-between px-3 py-2 rounded-lg text-left
                transition-all border border-slate-200/50 dark:border-slate-800
                hover:border-indigo-400/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20
                ${largeText ? 'text-base font-bold' : 'text-sm font-semibold'}
                font-mono tracking-wider
              `}
              title="Click for hint"
            >
              <span>{item.word}</span>
              <span className="flex items-center gap-1 text-xs font-sans text-slate-400 hover:text-amber-500">
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Hint</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-3 border-t border-inherit text-[11px] text-slate-400 text-center">
        Tap any unfound word for a progressive clue, or a solved word for trivia.
      </div>
    </div>
  );
};

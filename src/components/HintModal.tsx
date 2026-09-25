import React, { useState } from 'react';
import { PlacedWord, HintTier, ThemeConfig } from '../types/game';
import { playHintShimmer } from '../utils/sound';
import { Lightbulb, Compass, Eye, Sparkles, X, ChevronRight } from 'lucide-react';

interface HintModalProps {
  word: PlacedWord | null;
  isOpen: boolean;
  theme: ThemeConfig;
  onClose: () => void;
  onApplyHint: (word: PlacedWord, tier: HintTier) => void;
  onRevealWord: (word: PlacedWord) => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  word,
  isOpen,
  theme,
  onClose,
  onApplyHint,
  onRevealWord,
}) => {
  const [currentTier, setCurrentTier] = useState<HintTier>(1);

  if (!isOpen || !word) return null;

  // Determine orientation label
  const dRow = word.end.row - word.start.row;
  const dCol = word.end.col - word.start.col;

  let orientationText = 'Horizontal (Left to Right)';
  if (dRow === 0 && dCol < 0) orientationText = 'Horizontal (Right to Left / Backwards)';
  else if (dRow > 0 && dCol === 0) orientationText = 'Vertical (Top to Bottom)';
  else if (dRow < 0 && dCol === 0) orientationText = 'Vertical (Bottom to Top)';
  else if (dRow > 0 && dCol > 0) orientationText = 'Diagonal (Downward Slant)';
  else if (dRow > 0 && dCol < 0) orientationText = 'Diagonal (Down-Left Backward)';
  else if (dRow < 0 && dCol > 0) orientationText = 'Diagonal (Up-Right Forward)';
  else if (dRow < 0 && dCol < 0) orientationText = 'Diagonal (Up-Left Backward)';

  const handleTierSelect = (tier: HintTier) => {
    playHintShimmer();
    setCurrentTier(tier);
    if (tier === 4) {
      onRevealWord(word);
      onClose();
    } else {
      onApplyHint(word, tier);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-2xl border ${theme.cardClass} p-6 shadow-2xl relative`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          aria-label="Close hints"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Hints for "{word.word}"</h3>
            <p className="text-xs text-slate-400">
              {word.word.length} letters · Choose how much assistance you want
            </p>
          </div>
        </div>

        {/* Word Semantic Clue */}
        {word.clue && (
          <div className="mb-4 p-3 rounded-lg bg-slate-500/10 border border-slate-500/20 text-xs">
            <span className="font-semibold text-slate-300">Definition clue: </span>
            <span className="text-slate-400">{word.clue}</span>
          </div>
        )}

        {/* 4-Tier Options */}
        <div className="space-y-2.5">
          {/* Tier 1: Orientation */}
          <button
            onClick={() => handleTierSelect(1)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/40 dark:border-slate-800 hover:border-amber-400/50 hover:bg-amber-500/5 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <span>Tier 1: Orientation Clue</span>
                  <span className="text-[10px] text-emerald-500 font-normal">Gentle</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Reveals angle: {orientationText}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </button>

          {/* Tier 2: First Letter Pulse */}
          <button
            onClick={() => handleTierSelect(2)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/40 dark:border-slate-800 hover:border-amber-400/50 hover:bg-amber-500/5 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <span>Tier 2: First Letter Beacon</span>
                  <span className="text-[10px] text-amber-500 font-normal">Moderate</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Pulses letter "{word.word[0]}" at (Row {word.start.row + 1}, Col {word.start.col + 1})
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </button>

          {/* Tier 3: Sector Line Highlight */}
          <button
            onClick={() => handleTierSelect(3)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/40 dark:border-slate-800 hover:border-amber-400/50 hover:bg-amber-500/5 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <span>Tier 3: Sector Highlight</span>
                  <span className="text-[10px] text-purple-400 font-normal">Targeted</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Highlights Row {word.start.row + 1} across the entire grid
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </button>

          {/* Tier 4: Direct Reveal */}
          <button
            onClick={() => handleTierSelect(4)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/40 dark:border-slate-800 hover:border-rose-400/50 hover:bg-rose-500/5 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <span>Tier 4: Reveal Word</span>
                  <span className="text-[10px] text-rose-400 font-normal">Complete</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Instantly marks and solves this word on the puzzle board
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-inherit flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

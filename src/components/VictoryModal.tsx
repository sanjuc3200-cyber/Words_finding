import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlacedWord, ThemeConfig } from '../types/game';
import { playVictoryFanfare } from '../utils/sound';
import { Trophy, Clock, Sparkles, RotateCcw, Share2, ArrowRight } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  theme: ThemeConfig;
  categoryName: string;
  difficulty: string;
  timeSeconds: number;
  hintsUsed: number;
  placedWords: PlacedWord[];
  onPlayAgain: () => void;
  onNextCategory: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  theme,
  categoryName,
  difficulty,
  timeSeconds,
  hintsUsed,
  placedWords,
  onPlayAgain,
  onNextCategory,
}) => {
  useEffect(() => {
    if (isOpen) {
      playVictoryFanfare();
      // Burst celebratory confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleShare = () => {
    const text = `🏆 Lexicon Quest Solved!\nCategory: ${categoryName} (${difficulty})\nTime: ${timeFormatted}\nWords: ${placedWords.length} solved with ${hintsUsed} hints.\nPlay now!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl border ${theme.cardClass} p-6 sm:p-8 shadow-2xl relative text-center`}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Trophy className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-1">
          Puzzle Completed!
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          You unearthed every hidden word in <span className="font-semibold text-slate-200">{categoryName}</span>
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-slate-500/10 border border-slate-500/20 text-left">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Time</span>
            </div>
            <div className="font-mono text-lg font-bold tabular-nums">
              {timeFormatted}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Words</span>
            </div>
            <div className="font-mono text-lg font-bold tabular-nums">
              {placedWords.length} / {placedWords.length}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span>Hints</span>
            </div>
            <div className="font-mono text-lg font-bold tabular-nums">
              {hintsUsed}
            </div>
          </div>
        </div>

        {/* Word Solved Badges */}
        <div className="mb-6 text-left">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Discovered Lexicon
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {placedWords.map((w) => (
              <span
                key={w.id}
                className="px-2.5 py-1 rounded bg-slate-500/10 text-xs font-mono font-medium tracking-wide"
              >
                {w.word}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Board</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={onNextCategory}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl ${theme.accentBg} text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all`}
          >
            <span>Next Category</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { PlayerStats, ThemeConfig } from '../types/game';
import { X, Award, Flame, CheckCircle, Clock } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  theme: ThemeConfig;
  stats: PlayerStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  theme,
  stats,
  onClose,
}) => {
  if (!isOpen) return null;

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const bestMinutes = Math.floor(stats.bestTimeSeconds / 60);
  const bestSeconds = stats.bestTimeSeconds % 60;
  const bestTimeStr =
    stats.bestTimeSeconds > 0
      ? `${bestMinutes}:${bestSeconds.toString().padStart(2, '0')}`
      : '--:--';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-2xl border ${theme.cardClass} p-6 shadow-2xl relative`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          aria-label="Close stats"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Player Statistics</h3>
            <p className="text-xs text-slate-400">Lifetime Lexicon Quest achievements</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <div className="text-xs text-slate-400 mb-1">Puzzles Solved</div>
            <div className="font-mono text-2xl font-bold tabular-nums">
              {stats.gamesWon}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Out of {stats.gamesPlayed} started
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <div className="text-xs text-slate-400 mb-1">Win Rate</div>
            <div className="font-mono text-2xl font-bold tabular-nums">
              {winRate}%
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Completion rate</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <div className="text-xs text-slate-400 mb-1">Fastest Time</div>
            <div className="font-mono text-2xl font-bold tabular-nums">
              {bestTimeStr}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Personal record</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <div className="text-xs text-slate-400 mb-1">Current Streak</div>
            <div className="font-mono text-2xl font-bold tabular-nums text-amber-400">
              {stats.currentStreak}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Consecutive solves</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-between text-xs">
          <span className="text-slate-400">Total Words Unearthed:</span>
          <span className="font-mono font-bold text-sm tabular-nums">
            {stats.totalWordsFound}
          </span>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg ${theme.accentBg} text-xs font-medium transition-all`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

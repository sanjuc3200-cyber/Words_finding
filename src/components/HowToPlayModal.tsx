import React from 'react';
import { ThemeConfig } from '../types/game';
import { X, Grid, Search, Layers, Droplet, Lightbulb } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  theme: ThemeConfig;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  theme,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl border ${theme.cardClass} p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          aria-label="Close rules"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-1">Simple Puzzles Guide</h3>
        <p className="text-xs text-slate-400 mb-5">
          Quick rules and tips for every casual puzzle game in the collection
        </p>

        <div className="space-y-4 text-xs leading-relaxed">
          {/* 1. Sliding Tiles */}
          <div className="flex gap-3 p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-0.5 text-slate-200">
                1. Sliding Tiles (15-Puzzle &amp; 8-Puzzle)
              </h4>
              <p className="text-slate-400">
                Tap or click any tile adjacent to the empty slot (or use keyboard arrow keys) to slide it. Arrange all tiles in numerical order (1, 2, 3...) from left to right, top to bottom!
              </p>
            </div>
          </div>

          {/* 2. Word Search */}
          <div className="flex gap-3 p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-0.5 text-slate-200">
                2. Word Search &amp; Finding
              </h4>
              <p className="text-slate-400">
                Drag or tap across letters horizontally, vertically, or diagonally to discover hidden theme words. Tap any unfound word for 4-tier hints, or tap found words for real-world trivia!
              </p>
            </div>
          </div>

          {/* 3. Memory Match */}
          <div className="flex gap-3 p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-0.5 text-slate-200">
                3. Memory Match Pairs
              </h4>
              <p className="text-slate-400">
                Tap any two cards to flip them. If their symbols match, they stay solved. If they differ, remember their locations as they flip back. Find all pairs in the fewest moves!
              </p>
            </div>
          </div>

          {/* 4. Color Flood */}
          <div className="flex gap-3 p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-0.5 text-slate-200">
                4. Color Flood Strategy
              </h4>
              <p className="text-slate-400">
                Starting from the top-left tile, tap color buttons below the board to flood adjacent matching tiles with that color. Flood the entire grid in one color in 22 moves or fewer!
              </p>
            </div>
          </div>

          {/* 5. Lights Out */}
          <div className="flex gap-3 p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-0.5 text-slate-200">
                5. Lights Out Logic
              </h4>
              <p className="text-slate-400">
                Tapping a light toggles itself and its four orthogonal neighbors (Up, Down, Left, Right). Your objective is to turn every single light OFF!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-inherit flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg ${theme.accentBg} text-xs font-medium transition-all`}
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};

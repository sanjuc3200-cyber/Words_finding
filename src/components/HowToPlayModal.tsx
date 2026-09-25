import React from 'react';
import { ThemeConfig } from '../types/game';
import { X, MousePointer, Sparkles, Lightbulb, Calendar, CheckCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
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

        <h3 className="text-xl font-bold mb-1">How to Play Lexicon Quest</h3>
        <p className="text-xs text-slate-400 mb-5">
          Master the art of word finding across classic, senior-accessible grids
        </p>

        <div className="space-y-4 text-xs leading-relaxed">
          {/* Rule 1 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <MousePointer className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-0.5 text-slate-200">
                1. Select Words with Touch or Mouse
              </h4>
              <p className="text-slate-400">
                Press and drag across letters to form a word in any valid direction: horizontal, vertical, or diagonal (forwards and backwards depending on difficulty). You can also switch to <strong>Click-to-Click mode</strong> in Settings if you prefer not dragging.
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-0.5 text-slate-200">
                2. Uncover the Entire Word Bank
              </h4>
              <p className="text-slate-400">
                Each word you find receives a vibrant distinct marker. Found words can also share intersecting letters. Tap any discovered word in the bank to view fascinating real-world trivia!
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-0.5 text-slate-200">
                3. Four-Tier Senior &amp; Accessibility Hints
              </h4>
              <p className="text-slate-400">
                Need guidance? Tap any unfound word in the list to choose your assistance tier:
              </p>
              <ul className="mt-1 space-y-1 list-disc list-inside text-slate-400 pl-1">
                <li><strong className="text-slate-300">Tier 1:</strong> Orientation Clue (Direction angle)</li>
                <li><strong className="text-slate-300">Tier 2:</strong> First Letter Beacon (Pulses start coordinate)</li>
                <li><strong className="text-slate-300">Tier 3:</strong> Sector Locator (Highlights target line)</li>
                <li><strong className="text-slate-300">Tier 4:</strong> Word Reveal (Direct solve)</li>
              </ul>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-0.5 text-slate-200">
                4. Daily Puzzles &amp; Custom Architect
              </h4>
              <p className="text-slate-400">
                A fresh curated Daily Puzzle updates every 24 hours with an identical seed for everyone worldwide. Or unleash your creativity using the Custom Maker to generate word searches from any word list.
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

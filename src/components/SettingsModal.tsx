import React from 'react';
import { ThemeConfig, ThemeId, AccessibilitySettings } from '../types/game';
import { THEMES } from '../utils/theme';
import { setSoundEnabled } from '../utils/sound';
import { X, Volume2, VolumeX, Eye, MousePointer, Palette, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  theme: ThemeConfig;
  settings: AccessibilitySettings;
  onClose: () => void;
  onThemeChange: (themeId: ThemeId) => void;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  onResetStats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  theme,
  settings,
  onClose,
  onThemeChange,
  onUpdateSettings,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const handleSoundToggle = () => {
    const next = !settings.soundEnabled;
    setSoundEnabled(next);
    onUpdateSettings({ soundEnabled: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-2xl border ${theme.cardClass} p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-1">Preferences &amp; Accessibility</h3>
        <p className="text-xs text-slate-400 mb-5">
          Fine-tune the display, sound, and touch ergonomics
        </p>

        <div className="space-y-4 text-xs">
          {/* Theme Palette */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Theme Atmosphere</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                const t = THEMES[tId];
                const isActive = theme.id === tId;
                return (
                  <button
                    key={tId}
                    type="button"
                    onClick={() => onThemeChange(tId)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-500/10 font-bold'
                        : 'border-slate-700/60 hover:border-slate-600 bg-slate-800/20'
                    }`}
                  >
                    <span>{t.name}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/20">
            <div className="flex items-center gap-2.5">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <div className="font-semibold text-slate-200">Sound Effects</div>
                <div className="text-[11px] text-slate-400">
                  Synthesized chimes, drag notes, and victory fanfare
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSoundToggle}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                } absolute top-1`}
              />
            </button>
          </div>

          {/* Senior Large Font Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/20">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-semibold text-slate-200">Large Type &amp; Touch Tiles</div>
                <div className="text-[11px] text-slate-400">
                  Enlarges grid cells and letters for effortless legibility
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ largeText: !settings.largeText })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.largeText ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.largeText ? 'translate-x-6' : 'translate-x-1'
                } absolute top-1`}
              />
            </button>
          </div>

          {/* Click to Select Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/20">
            <div className="flex items-center gap-2.5">
              <MousePointer className="w-4 h-4 text-blue-400" />
              <div>
                <div className="font-semibold text-slate-200">Click-to-Click Selection</div>
                <div className="text-[11px] text-slate-400">
                  Select words by tapping start &amp; end letter instead of dragging
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ clickToSelectMode: !settings.clickToSelectMode })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.clickToSelectMode ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.clickToSelectMode ? 'translate-x-6' : 'translate-x-1'
                } absolute top-1`}
              />
            </button>
          </div>

          {/* Reset Stats */}
          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all lifetime stats and streaks?')) {
                  onResetStats();
                }
              }}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game Statistics</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-inherit flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg ${theme.accentBg} text-xs font-medium transition-all`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

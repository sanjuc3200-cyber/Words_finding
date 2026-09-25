import React from 'react';
import { GameMode, ThemeConfig } from '../types/game';
import { Volume2, VolumeX, BarChart3, Settings, HelpCircle, PlusCircle, Calendar, Smartphone } from 'lucide-react';

interface HeaderProps {
  theme: ThemeConfig;
  gameMode: GameMode;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onOpenCustomCreator: () => void;
  onOpenInstallModal: () => void;
  onSelectDailyMode: () => void;
  onSelectClassicMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  gameMode,
  soundEnabled,
  onToggleSound,
  onOpenStats,
  onOpenSettings,
  onOpenHowToPlay,
  onOpenCustomCreator,
  onOpenInstallModal,
  onSelectDailyMode,
  onSelectClassicMode,
}) => {
  return (
    <header className={`w-full border-b ${theme.borderClass} ${theme.bgClass} px-4 sm:px-6 py-3 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark brand title (single text element) */}
        <button
          type="button"
          onClick={onSelectClassicMode}
          className="text-lg sm:text-xl font-bold tracking-tight text-left font-display hover:opacity-90 transition-opacity truncate shrink-0 cursor-pointer"
          style={{ fontFamily: 'var(--font-display), serif' }}
        >
          Lexicon Quest
        </button>

        {/* Zone 2: Clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
          <button
            type="button"
            onClick={onSelectClassicMode}
            className={`transition-colors hover:text-indigo-400 ${
              gameMode === 'classic' || gameMode === 'timed' || gameMode === 'zen'
                ? 'font-bold underline underline-offset-4 decoration-indigo-500'
                : 'text-slate-400'
            }`}
          >
            Classic Play
          </button>

          <button
            type="button"
            onClick={onSelectDailyMode}
            className={`flex items-center gap-1.5 transition-colors hover:text-indigo-400 ${
              gameMode === 'daily'
                ? 'font-bold underline underline-offset-4 decoration-indigo-500'
                : 'text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Challenge</span>
          </button>

          <button
            type="button"
            onClick={onOpenCustomCreator}
            className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Custom Maker</span>
          </button>

          <button
            type="button"
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install / APK</span>
          </button>

          <button
            type="button"
            onClick={onOpenHowToPlay}
            className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Rules</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Install Button */}
          <button
            type="button"
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 text-xs font-medium transition-all"
            title="Install app on mobile or get APK"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>

          {/* Audio Mute Button */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="p-2 rounded-lg border border-slate-700/40 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Stats Button */}
          <button
            type="button"
            onClick={onOpenStats}
            aria-label="View statistics"
            className="p-2 rounded-lg border border-slate-700/40 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="p-2 rounded-lg border border-slate-700/40 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

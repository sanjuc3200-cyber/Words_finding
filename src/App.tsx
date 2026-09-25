/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Difficulty,
  GameMode,
  ThemeId,
  Category,
  PlacedWord,
  ActiveHint,
  HintTier,
  PlayerStats,
  AccessibilitySettings,
  CategoryWord,
  GridPosition,
  PuzzleType,
} from './types/game';
import { CATEGORIES } from './data/categories';
import { THEMES } from './utils/theme';
import { generatePuzzle, getDateSeed } from './utils/puzzleGenerator';
import { getSoundEnabled, setSoundEnabled } from './utils/sound';
import { Header } from './components/Header';
import { PuzzleSelector } from './components/PuzzleSelector';
import { SlidingPuzzle } from './components/SlidingPuzzle';
import { MemoryMatch } from './components/MemoryMatch';
import { ColorFlood } from './components/ColorFlood';
import { LightsOut } from './components/LightsOut';
import { GameHud } from './components/GameHud';
import { WordGrid } from './components/WordGrid';
import { WordList } from './components/WordList';
import { HintModal } from './components/HintModal';
import { TriviaModal } from './components/TriviaModal';
import { VictoryModal } from './components/VictoryModal';
import { CustomPuzzleModal } from './components/CustomPuzzleModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { InstallAppModal } from './components/InstallAppModal';
import { OfflineIndicator } from './components/OfflineIndicator';

const STATS_KEY = 'lexicon_quest_stats';
const SETTINGS_KEY = 'lexicon_quest_settings';
const THEME_KEY = 'lexicon_quest_theme';
const ACTIVE_PUZZLE_KEY = 'lexicon_active_puzzle';

const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalWordsFound: 0,
  bestTimeSeconds: 0,
  currentStreak: 0,
  hintsUsedTotal: 0,
};

const DEFAULT_SETTINGS: AccessibilitySettings = {
  largeText: false,
  highContrast: false,
  clickToSelectMode: false,
  soundEnabled: true,
};

export default function App() {
  // Active Puzzle Type (Sliding, Word Search, Memory Match, Color Flood, Lights Out)
  const [activePuzzle, setActivePuzzle] = useState<PuzzleType>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_PUZZLE_KEY);
      if (saved && ['sliding', 'wordsearch', 'memory', 'flood', 'lights'].includes(saved)) {
        return saved as PuzzleType;
      }
    } catch {
      // ignore
    }
    return 'sliding';
  });

  const handleSelectPuzzle = (p: PuzzleType) => {
    setActivePuzzle(p);
    try {
      localStorage.setItem(ACTIVE_PUZZLE_KEY, p);
    } catch {
      // ignore
    }
  };

  // Theme state
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved && saved in THEMES) return saved as ThemeId;
    } catch {
      // ignore
    }
    return 'midnight';
  });

  const theme = THEMES[themeId];

  // Accessibility Settings state
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return { ...DEFAULT_SETTINGS, soundEnabled: getSoundEnabled() };
  });

  // Player Stats state
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) return { ...DEFAULT_STATS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_STATS;
  });

  // Word Search Game configuration
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('classic');

  // Word Search Board state
  const [grid, setGrid] = useState<string[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [activeHint, setActiveHint] = useState<ActiveHint | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [hintsUsedThisGame, setHintsUsedThisGame] = useState(0);

  // Modals state
  const [hintModalWord, setHintModalWord] = useState<PlacedWord | null>(null);
  const [triviaModalWord, setTriviaModalWord] = useState<PlacedWord | null>(null);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Sound ref sync
  useEffect(() => {
    setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Persist theme
  const handleThemeChange = (id: ThemeId) => {
    setThemeId(id);
    try {
      localStorage.setItem(THEME_KEY, id);
    } catch {
      // ignore
    }
  };

  // Persist settings
  const handleUpdateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Persist stats
  const saveStats = (updater: (prev: PlayerStats) => PlayerStats) => {
    setStats((prev) => {
      const updated = updater(prev);
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleResetStats = () => {
    setStats(DEFAULT_STATS);
    try {
      localStorage.removeItem(STATS_KEY);
    } catch {
      // ignore
    }
  };

  // Generic win tracker for sliding / memory / lights / flood
  const handleGenericWin = () => {
    saveStats((prev) => ({
      ...prev,
      gamesWon: prev.gamesWon + 1,
      gamesPlayed: prev.gamesPlayed + 1,
      currentStreak: prev.currentStreak + 1,
    }));
  };

  // Generate / start a new word search puzzle
  const startNewGame = useCallback(
    (
      cat: Category = selectedCategory,
      diff: Difficulty = difficulty,
      mode: GameMode = gameMode,
      seed?: number
    ) => {
      const puzzleSeed = mode === 'daily' ? (seed ?? getDateSeed()) : undefined;
      const result = generatePuzzle(cat.words, diff, puzzleSeed);

      setGrid(result.grid);
      setPlacedWords(result.placedWords);
      setActiveHint(null);
      setTimerSeconds(0);
      setIsTimerActive(true);
      setHintsUsedThisGame(0);
      setIsVictoryModalOpen(false);

      saveStats((prev) => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
      }));
    },
    [selectedCategory, difficulty, gameMode]
  );

  // Initialize word search board on mount
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      startNewGame();
    }
  }, [startNewGame]);

  // Stopwatch timer interval for word search
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && gameMode !== 'zen' && activePuzzle === 'wordsearch') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, gameMode, activePuzzle]);

  // Handle word discovered by player
  const handleWordDiscovered = (foundWord: PlacedWord) => {
    setPlacedWords((prev) => {
      const updated = prev.map((w) =>
        w.id === foundWord.id ? { ...w, found: true, foundAt: Date.now() } : w
      );

      if (activeHint?.targetWord.id === foundWord.id) {
        setActiveHint(null);
      }

      const allFound = updated.every((w) => w.found);
      if (allFound) {
        setIsTimerActive(false);
        setIsVictoryModalOpen(true);

        saveStats((prev) => {
          const isNewBest =
            prev.bestTimeSeconds === 0 || timerSeconds < prev.bestTimeSeconds;
          return {
            ...prev,
            gamesWon: prev.gamesWon + 1,
            totalWordsFound: prev.totalWordsFound + 1,
            bestTimeSeconds: isNewBest ? timerSeconds : prev.bestTimeSeconds,
            currentStreak: prev.currentStreak + 1,
          };
        });
      } else {
        saveStats((prev) => ({
          ...prev,
          totalWordsFound: prev.totalWordsFound + 1,
        }));
      }

      return updated;
    });
  };

  // 4-Tier Hint Actions
  const handleApplyHint = (word: PlacedWord, tier: HintTier) => {
    setHintsUsedThisGame((prev) => prev + 1);
    saveStats((prev) => ({ ...prev, hintsUsedTotal: prev.hintsUsedTotal + 1 }));

    let description = '';
    let highlightCells: GridPosition[] | undefined = undefined;
    let highlightRow: number | undefined = undefined;
    let highlightCol: number | undefined = undefined;

    if (tier === 1) {
      description = `Word "${word.word}" angle clue: from Row ${word.start.row + 1}, Col ${word.start.col + 1} to Row ${word.end.row + 1}, Col ${word.end.col + 1}.`;
    } else if (tier === 2) {
      description = `First letter "${word.word[0]}" pulses at Row ${word.start.row + 1}, Col ${word.start.col + 1}.`;
      highlightCells = [word.start];
    } else if (tier === 3) {
      description = `Row ${word.start.row + 1} contains the start of "${word.word}".`;
      highlightRow = word.start.row;
    }

    setActiveHint({
      wordId: word.id,
      tier,
      targetWord: word,
      description,
      highlightCells,
      highlightRow,
      highlightCol,
    });
  };

  const handleRevealWord = (word: PlacedWord) => {
    setHintsUsedThisGame((prev) => prev + 1);
    saveStats((prev) => ({ ...prev, hintsUsedTotal: prev.hintsUsedTotal + 1 }));
    handleWordDiscovered(word);
  };

  const handleTriggerRandomHint = () => {
    const unfound = placedWords.filter((w) => !w.found);
    if (unfound.length > 0) {
      const target = unfound[Math.floor(Math.random() * unfound.length)];
      setHintModalWord(target);
    }
  };

  const handleCategoryChange = (cat: Category) => {
    setSelectedCategory(cat);
    startNewGame(cat, difficulty, gameMode);
  };

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    startNewGame(selectedCategory, diff, gameMode);
  };

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    startNewGame(selectedCategory, difficulty, mode);
  };

  const handleSelectDailyMode = () => {
    setActivePuzzle('wordsearch');
    setGameMode('daily');
    const date = new Date();
    const catIndex = (date.getDate() + date.getMonth()) % CATEGORIES.length;
    const dailyCat = CATEGORIES[catIndex];
    setSelectedCategory(dailyCat);
    setDifficulty('medium');
    startNewGame(dailyCat, 'medium', 'daily', getDateSeed(date));
  };

  const handleSelectClassicMode = () => {
    setActivePuzzle('wordsearch');
    if (gameMode === 'daily') {
      setGameMode('classic');
      startNewGame(CATEGORIES[0], 'medium', 'classic');
    }
  };

  const handleCreateCustomPuzzle = (
    name: string,
    words: CategoryWord[],
    diff: Difficulty
  ) => {
    const customCat: Category = {
      id: 'custom',
      name,
      iconName: 'Sparkles',
      description: 'Player tailored puzzle',
      words,
    };
    setSelectedCategory(customCat);
    setDifficulty(diff);
    setGameMode('classic');
    setActivePuzzle('wordsearch');
    startNewGame(customCat, diff, 'classic');
  };

  const handleNextCategory = () => {
    const currentIndex = CATEGORIES.findIndex((c) => c.id === selectedCategory.id);
    const nextIndex = (currentIndex + 1) % CATEGORIES.length;
    const nextCat = CATEGORIES[nextIndex];
    setSelectedCategory(nextCat);
    startNewGame(nextCat, difficulty, gameMode);
  };

  const unfoundCount = placedWords.filter((w) => !w.found).length;

  return (
    <div className={`min-h-screen ${theme.bgClass} flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500/30`}>
      {/* Top Bar Contract (Wordmark - Navigation - Primary Actions) */}
      <Header
        theme={theme}
        gameMode={gameMode}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenCustomCreator={() => setIsCustomModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onSelectDailyMode={handleSelectDailyMode}
        onSelectClassicMode={handleSelectClassicMode}
      />

      {/* Simple Puzzle Type Switcher Bar */}
      <PuzzleSelector
        theme={theme}
        activePuzzle={activePuzzle}
        onSelectPuzzle={handleSelectPuzzle}
      />

      {/* Main Playing Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-3 sm:py-5 flex flex-col items-center">
        {/* GAME 1: Sliding Tile Puzzle */}
        {activePuzzle === 'sliding' && (
          <SlidingPuzzle theme={theme} onWin={handleGenericWin} />
        )}

        {/* GAME 2: Memory Match Cards */}
        {activePuzzle === 'memory' && (
          <MemoryMatch theme={theme} onWin={handleGenericWin} />
        )}

        {/* GAME 3: Color Flood Strategy */}
        {activePuzzle === 'flood' && (
          <ColorFlood theme={theme} onWin={handleGenericWin} />
        )}

        {/* GAME 4: Lights Out Logic */}
        {activePuzzle === 'lights' && (
          <LightsOut theme={theme} onWin={handleGenericWin} />
        )}

        {/* GAME 5: Word Search & Finder */}
        {activePuzzle === 'wordsearch' && (
          <>
            {/* HUD Bar (Theme/Category, Difficulty, Mode, Timer, Quick Hint) */}
            <GameHud
              theme={theme}
              selectedCategory={selectedCategory}
              difficulty={difficulty}
              gameMode={gameMode}
              timerSeconds={timerSeconds}
              unfoundCount={unfoundCount}
              onSelectCategory={handleCategoryChange}
              onChangeDifficulty={handleDifficultyChange}
              onChangeMode={handleModeChange}
              onNewPuzzle={() => startNewGame()}
              onTriggerRandomHint={handleTriggerRandomHint}
            />

            {/* Daily Banner if daily mode */}
            {gameMode === 'daily' && (
              <div className="w-full max-w-5xl mb-4 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-indigo-400">📅 Daily Word Challenge</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-300">
                    {new Date().toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  Same seed for word hunters worldwide
                </span>
              </div>
            )}

            {/* Arena Layout: Left Grid, Right Word Bank */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-7 lg:col-span-8 flex flex-col items-center justify-center">
                {grid.length > 0 && (
                  <WordGrid
                    grid={grid}
                    placedWords={placedWords}
                    theme={theme}
                    largeText={settings.largeText}
                    highContrast={settings.highContrast}
                    clickToSelectMode={settings.clickToSelectMode}
                    activeHint={activeHint}
                    onWordDiscovered={handleWordDiscovered}
                  />
                )}
              </div>

              <div className="md:col-span-5 lg:col-span-4 w-full">
                <WordList
                  placedWords={placedWords}
                  theme={theme}
                  largeText={settings.largeText}
                  onWordClick={(word) => setHintModalWord(word)}
                  onTriviaClick={(word) => setTriviaModalWord(word)}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Subtle, unadorned footer */}
      <footer className="w-full border-t border-inherit py-3 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Lexicon Quest &amp; Simple Puzzles Collection</span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="text-indigo-400 hover:underline transition-all"
            >
              Install App / APK
            </button>
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="hover:underline transition-all"
            >
              Game Rules
            </button>
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="hover:underline transition-all"
            >
              Make Custom Grid
            </button>
            <button
              onClick={() => handleUpdateSettings({ largeText: !settings.largeText })}
              className="hover:underline transition-all"
            >
              {settings.largeText ? 'Standard Font' : 'Senior Large Font'}
            </button>
          </div>
        </div>
      </footer>

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Modals */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        theme={theme}
        onClose={() => setIsInstallModalOpen(false)}
      />

      <HintModal
        word={hintModalWord}
        isOpen={Boolean(hintModalWord)}
        theme={theme}
        onClose={() => setHintModalWord(null)}
        onApplyHint={handleApplyHint}
        onRevealWord={handleRevealWord}
      />

      <TriviaModal
        word={triviaModalWord}
        isOpen={Boolean(triviaModalWord)}
        theme={theme}
        onClose={() => setTriviaModalWord(null)}
      />

      <VictoryModal
        isOpen={isVictoryModalOpen}
        theme={theme}
        categoryName={selectedCategory.name}
        difficulty={difficulty}
        timeSeconds={timerSeconds}
        hintsUsed={hintsUsedThisGame}
        placedWords={placedWords}
        onPlayAgain={() => startNewGame()}
        onNextCategory={handleNextCategory}
      />

      <CustomPuzzleModal
        isOpen={isCustomModalOpen}
        theme={theme}
        onClose={() => setIsCustomModalOpen(false)}
        onCreateCustomPuzzle={handleCreateCustomPuzzle}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        theme={theme}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        theme={theme}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onThemeChange={handleThemeChange}
        onUpdateSettings={handleUpdateSettings}
        onResetStats={handleResetStats}
      />

      <StatsModal
        isOpen={isStatsOpen}
        theme={theme}
        stats={stats}
        onClose={() => setIsStatsOpen(false)}
      />
    </div>
  );
}

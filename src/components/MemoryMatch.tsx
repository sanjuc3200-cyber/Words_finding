import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ThemeConfig } from '../types/game';
import { playLetterTick, playWordFoundChime, playInvalidThud, playVictoryFanfare } from '../utils/sound';
import { RotateCcw, Clock, Trophy, Sparkles, Footprints } from 'lucide-react';

interface MemoryMatchProps {
  theme: ThemeConfig;
  onWin?: (moves: number, timeSec: number) => void;
}

type MemoryTheme = 'animals' | 'cosmos' | 'sweets' | 'gems';
type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface CardItem {
  id: number;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const THEME_SYMBOLS: Record<MemoryTheme, { symbol: string; name: string }[]> = {
  animals: [
    { symbol: '🦁', name: 'Lion' },
    { symbol: '🐘', name: 'Elephant' },
    { symbol: '🐬', name: 'Dolphin' },
    { symbol: '🦉', name: 'Owl' },
    { symbol: '🦊', name: 'Fox' },
    { symbol: '🐼', name: 'Panda' },
    { symbol: '🦋', name: 'Butterfly' },
    { symbol: '🐢', name: 'Turtle' },
    { symbol: '🦚', name: 'Peacock' },
    { symbol: '🐨', name: 'Koala' },
  ],
  cosmos: [
    { symbol: '☀️', name: 'Sun' },
    { symbol: '🌙', name: 'Moon' },
    { symbol: '🪐', name: 'Saturn' },
    { symbol: '🚀', name: 'Rocket' },
    { symbol: '☄️', name: 'Comet' },
    { symbol: '🛸', name: 'UFO' },
    { symbol: '🌌', name: 'Galaxy' },
    { symbol: '⭐', name: 'Star' },
    { symbol: '🛰️', name: 'Satellite' },
    { symbol: '🔭', name: 'Telescope' },
  ],
  sweets: [
    { symbol: '🍰', name: 'Cake' },
    { symbol: '🍩', name: 'Donut' },
    { symbol: '🧁', name: 'Cupcake' },
    { symbol: '🍫', name: 'Chocolate' },
    { symbol: '🍦', name: 'Ice Cream' },
    { symbol: '🍪', name: 'Cookie' },
    { symbol: '🍓', name: 'Strawberry' },
    { symbol: '🍯', name: 'Honey' },
    { symbol: '🍮', name: 'Pudding' },
    { symbol: '🍭', name: 'Lollipop' },
  ],
  gems: [
    { symbol: '💎', name: 'Diamond' },
    { symbol: '🔮', name: 'Crystal' },
    { symbol: '👑', name: 'Crown' },
    { symbol: '💍', name: 'Ring' },
    { symbol: '🪙', name: 'Coin' },
    { symbol: '🏆', name: 'Trophy' },
    { symbol: '🪞', name: 'Mirror' },
    { symbol: '🛡️', name: 'Shield' },
    { symbol: '🔑', name: 'Key' },
    { symbol: '⚜️', name: 'Fleur' },
  ],
};

const DIFFICULTY_CONFIGS: Record<DifficultyLevel, { pairs: number; cols: number; label: string }> = {
  easy: { pairs: 6, cols: 4, label: 'Easy (12 Cards)' },
  medium: { pairs: 8, cols: 4, label: 'Medium (16 Cards)' },
  hard: { pairs: 10, cols: 5, label: 'Hard (20 Cards)' },
};

export const MemoryMatch: React.FC<MemoryMatchProps> = ({ theme, onWin }) => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [selectedTheme, setSelectedTheme] = useState<MemoryTheme>('animals');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const isLockRef = useRef(false);

  // Initialize and shuffle cards
  const startNewGame = useCallback((diff: DifficultyLevel = difficulty, tTheme: MemoryTheme = selectedTheme) => {
    const config = DIFFICULTY_CONFIGS[diff];
    const pool = [...THEME_SYMBOLS[tTheme]];

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const chosen = pool.slice(0, config.pairs);
    const cardPairs: CardItem[] = [];

    chosen.forEach((item, idx) => {
      // Card 1
      cardPairs.push({
        id: idx * 2,
        symbol: item.symbol,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      });
      // Card 2
      cardPairs.push({
        id: idx * 2 + 1,
        symbol: item.symbol,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    setCards(cardPairs);
    setFlippedIndices([]);
    setMoves(0);
    setMatchedCount(0);
    setTimerSeconds(0);
    setIsPlaying(true);
    setIsWon(false);
    isLockRef.current = false;
  }, [difficulty, selectedTheme]);

  // Initial mount
  const hasInit = useRef(false);
  useEffect(() => {
    if (!hasInit.current) {
      hasInit.current = true;
      startNewGame();
    }
  }, [startNewGame]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !isWon && moves > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isWon, moves]);

  // Card click handler
  const handleCardClick = (index: number) => {
    if (isLockRef.current || isWon) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    playLetterTick(flippedIndices.length);

    // Flip card
    const nextCards = [...cards];
    nextCards[index] = { ...card, isFlipped: true };
    setCards(nextCards);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      isLockRef.current = true;

      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = nextCards[firstIdx];
      const secondCard = nextCards[secondIdx];

      if (firstCard.symbol === secondCard.symbol) {
        // MATCH!
        playWordFoundChime();
        setTimeout(() => {
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx] = { ...updated[firstIdx], isMatched: true };
            updated[secondIdx] = { ...updated[secondIdx], isMatched: true };
            return updated;
          });
          setFlippedIndices([]);
          setMatchedCount((m) => {
            const newCount = m + 1;
            if (newCount === DIFFICULTY_CONFIGS[difficulty].pairs) {
              setIsWon(true);
              setIsPlaying(false);
              setTimeout(playVictoryFanfare, 200);
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
              onWin?.(moves + 1, timerSeconds);
            }
            return newCount;
          });
          isLockRef.current = false;
        }, 300);
      } else {
        // MISMATCH
        playInvalidThud();
        setTimeout(() => {
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx] = { ...updated[firstIdx], isFlipped: false };
            updated[secondIdx] = { ...updated[secondIdx], isFlipped: false };
            return updated;
          });
          setFlippedIndices([]);
          isLockRef.current = false;
        }, 900);
      }
    }
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const totalPairs = DIFFICULTY_CONFIGS[difficulty].pairs;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Controls HUD */}
      <div className={`w-full p-4 rounded-xl border ${theme.cardClass} mb-4 flex flex-wrap items-center justify-between gap-3 text-xs`}>
        {/* Difficulty */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Cards:</span>
          <div className="flex p-0.5 rounded-lg bg-slate-500/10 border border-slate-500/20">
            {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDifficulty(d);
                  startNewGame(d, selectedTheme);
                }}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition-all ${
                  difficulty === d
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium hidden sm:inline">Theme:</span>
          <div className="flex p-0.5 rounded-lg bg-slate-500/10 border border-slate-500/20">
            {(['animals', 'cosmos', 'sweets', 'gems'] as MemoryTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setSelectedTheme(t);
                  startNewGame(difficulty, t);
                }}
                className={`px-2 py-1 rounded-md font-medium capitalize transition-all ${
                  selectedTheme === t
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={() => startNewGame(difficulty, selectedTheme)}
          className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
          title="New Game"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="w-full flex items-center justify-between mb-3 px-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Matches:</span>
          <span className="font-mono font-bold text-slate-200 text-sm tabular-nums">
            {matchedCount} / {totalPairs}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Footprints className="w-3.5 h-3.5 text-indigo-400" />
          <span>Moves:</span>
          <span className="font-mono font-bold text-slate-200 text-sm tabular-nums">
            {moves}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Time:</span>
          <span className="font-mono font-bold text-slate-200 text-sm tabular-nums">
            {timeFormatted}
          </span>
        </div>
      </div>

      {/* Card Grid */}
      <div
        className={`p-3 sm:p-4 rounded-2xl ${theme.gridBg} border ${theme.borderClass} shadow-xl relative select-none w-full max-w-md`}
      >
        <div
          className="grid gap-2 sm:gap-2.5"
          style={{
            gridTemplateColumns: `repeat(${DIFFICULTY_CONFIGS[difficulty].cols}, minmax(0, 1fr))`,
          }}
        >
          {cards.map((card, idx) => {
            const isRevealed = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(idx)}
                className={`
                  aspect-square rounded-xl flex items-center justify-center
                  cursor-pointer transition-all duration-300 transform
                  shadow-md select-none text-2xl sm:text-3xl
                  ${isRevealed ? 'bg-indigo-600/30 border border-indigo-400/50' : `${theme.cellBg} hover:scale-105 active:scale-95`}
                  ${card.isMatched ? 'opacity-85 ring-2 ring-emerald-500/50' : ''}
                `}
              >
                {isRevealed ? (
                  <span className="animate-scaleIn drop-shadow-xs">{card.symbol}</span>
                ) : (
                  <span className="text-sm font-bold text-slate-500 font-mono">?</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Modal */}
        {isWon && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold mb-1">Pairs Cleared!</h3>
            <p className="text-xs text-slate-300 mb-4">
              All {totalPairs} pairs matched in <span className="font-mono font-bold text-white">{moves}</span> moves ({timeFormatted})
            </p>
            <button
              onClick={() => startNewGame(difficulty, selectedTheme)}
              className={`px-5 py-2.5 rounded-xl ${theme.accentBg} text-xs font-semibold flex items-center gap-2 shadow-lg transition-all`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Next Round</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Flip any two cards to reveal and pair them up!</span>
      </div>
    </div>
  );
};

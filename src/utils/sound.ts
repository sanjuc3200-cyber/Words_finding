// Web Audio API Synthesized Sound Effects for Lexicon Quest Word Search

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

// Initialize or resume AudioContext on first user interaction
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  try {
    localStorage.setItem('lexicon_sound_enabled', enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function getSoundEnabled(): boolean {
  try {
    const saved = localStorage.getItem('lexicon_sound_enabled');
    if (saved !== null) return saved === 'true';
  } catch {
    // ignore
  }
  return true;
}

// Subtle tick when dragging over a letter
export function playLetterTick(stepIndex: number = 0) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Pentatonic scale frequency offset based on selection length
  const baseFreq = 440; // A4
  const scale = [0, 2, 4, 7, 9, 12, 14, 16];
  const step = scale[Math.min(stepIndex, scale.length - 1)];
  const freq = baseFreq * Math.pow(2, step / 12);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

// Gentle invalid select thud
export function playInvalidThud() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.14);
}

// Uplifting major chord arpeggio for word discovered
export function playWordFoundChime() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.05);

    gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
    gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.05);
    osc.stop(now + idx * 0.05 + 0.36);
  });
}

// Shimmering bell for hint usage
export function playHintShimmer() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [880, 1108.73, 1318.51];

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.04);

    gain.gain.setValueAtTime(0.05, now + i * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.04);
    osc.stop(now + i * 0.04 + 0.29);
  });
}

// Grand celebratory victory melody
export function playVictoryFanfare() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const melody = [
    { freq: 523.25, time: 0, dur: 0.12 }, // C5
    { freq: 659.25, time: 0.12, dur: 0.12 }, // E5
    { freq: 783.99, time: 0.24, dur: 0.14 }, // G5
    { freq: 1046.5, time: 0.38, dur: 0.35 }, // C6
    { freq: 880.0, time: 0.74, dur: 0.12 }, // A5
    { freq: 1046.5, time: 0.86, dur: 0.55 }, // C6
  ];

  melody.forEach((item) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(item.freq, now + item.time);

    gain.gain.setValueAtTime(0.0001, now + item.time);
    gain.gain.linearRampToValueAtTime(0.09, now + item.time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + item.time + item.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + item.time);
    osc.stop(now + item.time + item.dur + 0.05);
  });
}

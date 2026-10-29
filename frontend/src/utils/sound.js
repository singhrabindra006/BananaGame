/**
 * Web Audio API Sound Effects Synthesizer
 * Zero-dependency sound effects for gameplay feedback.
 */

let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

export const isSoundEnabled = () => {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem("bananaQuiz_sound");
  return saved === null ? true : saved === "true";
};

export const setSoundEnabled = (enabled) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("bananaQuiz_sound", String(enabled));
  }
};

/**
 * Play short soft click tone
 */
export const playClick = () => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore audio errors on unsupported browsers
  }
};

/**
 * Play cheerful rising chord for correct answer
 */
export const playCorrect = () => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + index * 0.08;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  } catch {
    // Ignore audio errors
  }
};

/**
 * Play soft buzzer for wrong answer
 */
export const playIncorrect = () => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Ignore audio errors
  }
};

/**
 * Play triumphant victory fanfare
 */
export const playFanfare = () => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const melody = [
      { f: 523.25, d: 0.12 }, // C
      { f: 659.25, d: 0.12 }, // E
      { f: 783.99, d: 0.12 }, // G
      { f: 1046.5, d: 0.35 }, // C (high)
    ];

    let time = ctx.currentTime;
    melody.forEach(({ f, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, time);

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + d);
      time += d;
    });
  } catch {
    // Ignore audio errors
  }
};

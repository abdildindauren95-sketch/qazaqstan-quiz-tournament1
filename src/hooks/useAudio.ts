import { useEffect, useState } from "react";

export function useAudio() {
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioCtx) {
        audioCtx.close();
      }
    };
  }, [audioCtx]);

  const initAudio = () => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioCtx(ctx);
      return ctx;
    }
    return audioCtx;
  };

  const tone = (f: number, t: OscillatorType, d: number, v: number = 0.3) => {
    try {
      const ctx = initAudio();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = t;
      o.frequency.value = f;
      g.gain.setValueAtTime(v, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d);
      o.start();
      o.stop(ctx.currentTime + d);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const sfxOK = () => {
    tone(523, 'sine', 0.15);
    setTimeout(() => tone(659, 'sine', 0.15), 120);
    setTimeout(() => tone(784, 'sine', 0.25), 240);
  };

  const sfxErr = () => {
    tone(220, 'sawtooth', 0.2, 0.2);
    setTimeout(() => tone(180, 'sawtooth', 0.3, 0.15), 180);
  };

  const sfxTick = () => {
    tone(880, 'square', 0.05, 0.1);
  };

  const sfxWin = () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 'sine', 0.3), i * 100));
  };

  const sfxSel = () => {
    tone(440, 'sine', 0.08, 0.15);
  };

  return { sfxOK, sfxErr, sfxTick, sfxWin, sfxSel, initAudio };
}

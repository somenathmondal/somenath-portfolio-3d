// Slot-tick sound: tiny synthesized click, no audio asset needed.
let audioCtx: AudioContext | null = null;

export function ensureAudio() {
  if (!audioCtx && typeof window !== "undefined") {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  }
  audioCtx?.resume();
}

export function playTick(volume: number) {
  if (!audioCtx || audioCtx.state !== "running") return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.exponentialRampToValueAtTime(220, t + 0.045);
  gain.gain.setValueAtTime(Math.min(0.09, 0.02 + volume), t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}

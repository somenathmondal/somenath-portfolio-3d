import { create } from "zustand";

export const LAB_EFFECTS = [
  { key: "ripple", label: "Ripple" },
  { key: "bend", label: "Bend" },
  { key: "dissolve", label: "Dissolve" },
  { key: "aurora", label: "Aurora" },
  { key: "dust", label: "Dust" },
  { key: "poke", label: "Poke" },
  { key: "shockwave", label: "Shockwave" },
  { key: "sound", label: "Sound" },
] as const;

export type LabEffectKey = (typeof LAB_EFFECTS)[number]["key"];

interface LabState {
  effects: Record<LabEffectKey, boolean>;
  toggle: (key: LabEffectKey) => void;
}

export const useLab = create<LabState>((set) => ({
  // Defaults = the winning recipe from the first evaluation round. Poke lost (too strong,
  // since tamed in WheelPlane) but stays available for re-judging.
  effects: {
    ripple: true,
    bend: true,
    dissolve: true,
    aurora: true,
    dust: true,
    poke: false,
    shockwave: true,
    sound: true,
  },
  toggle: (key) =>
    set((state) => ({ effects: { ...state.effects, [key]: !state.effects[key] } })),
}));

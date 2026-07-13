import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import { Sun, Moon } from "lucide-react";
import { usePortfolio } from "../../lib/stores/usePortfolio";
import { useLab, LAB_EFFECTS } from "../../lib/stores/useLab";
import LabWheel from "./LabWheel";
import Aurora from "../Aurora";
import Dust from "../Dust";
import ProjectOverlay from "../ProjectOverlay";
import CustomCursor from "../CustomCursor";

const V2_EFFECTS = ["Flow Smear", "Glass Cursor"];

export default function EffectsLab() {
  const { theme, toggleTheme } = usePortfolio();
  const { effects, toggle } = useLab();
  const [copied, setCopied] = useState(false);
  const isLight = theme === "light";

  const copySelection = () => {
    const enabled = LAB_EFFECTS.filter((e) => effects[e.key]).map((e) => e.label);
    navigator.clipboard.writeText(enabled.length ? enabled.join(", ") : "none");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full h-full relative" style={{ background: isLight ? "#FAF6F0" : "#09090b" }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        className="absolute inset-0 z-10"
      >
        <color attach="background" args={[isLight ? "#FAF6F0" : "#09090b"]} />
        <Suspense fallback={null}>
          <Aurora enabled={() => useLab.getState().effects.aurora} />
          <Dust enabled={() => useLab.getState().effects.dust} />
          <ScrollControls pages={6} damping={0.2}>
            <LabWheel />
          </ScrollControls>
        </Suspense>
      </Canvas>

      {/* Lab chrome */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 md:p-8 flex justify-between items-center pointer-events-none">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = "";
            window.location.reload();
          }}
          className={`pointer-events-auto text-[9px] tracking-[0.3em] uppercase font-bold border-b pb-0.5 transition-colors ${
            isLight ? "text-black border-black hover:text-zinc-500" : "text-white border-white hover:text-orange-200"
          }`}
        >
          ← Portfolio
        </a>
        <span className={`text-[9px] tracking-[0.4em] uppercase font-mono ${isLight ? "text-zinc-400" : "text-stone-500"}`}>
          Effects Lab
        </span>
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className={`pointer-events-auto flex items-center justify-center p-2 rounded-full border transition-all duration-300 ${
            isLight
              ? "border-zinc-300 hover:border-black text-zinc-600 hover:text-black bg-white/50"
              : "border-stone-800 hover:border-white text-stone-300 hover:text-white bg-white/5"
          }`}
        >
          {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>
      </header>

      <ProjectOverlay />

      {/* Effect selector bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
        <div
          className={`pointer-events-auto flex items-center gap-1 md:gap-1.5 px-3 py-2 rounded-full border backdrop-blur-xl max-w-full overflow-x-auto ${
            isLight ? "bg-white/70 border-zinc-200 shadow-lg" : "bg-black/50 border-stone-800 shadow-2xl"
          }`}
        >
          {LAB_EFFECTS.map((effect) => {
            const on = effects[effect.key];
            return (
              <button
                key={effect.key}
                onClick={() => toggle(effect.key)}
                aria-pressed={on}
                className={`shrink-0 text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-mono px-2.5 md:px-3 py-1.5 rounded-full border transition-all duration-300 ${
                  on
                    ? isLight
                      ? "border-black bg-black text-white"
                      : "border-white bg-white text-black"
                    : isLight
                      ? "border-zinc-200 text-zinc-400 hover:text-black hover:border-zinc-400"
                      : "border-stone-800 text-stone-500 hover:text-white hover:border-stone-500"
                }`}
              >
                {effect.label}
              </button>
            );
          })}

          <span className={`shrink-0 w-px h-4 mx-1 ${isLight ? "bg-zinc-200" : "bg-stone-800"}`} />

          {V2_EFFECTS.map((label) => (
            <span
              key={label}
              title="Coming in round two"
              className={`shrink-0 text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-mono px-2.5 py-1.5 rounded-full border border-dashed opacity-40 ${
                isLight ? "border-zinc-300 text-zinc-400" : "border-stone-700 text-stone-500"
              }`}
            >
              {label} · v2
            </span>
          ))}

          <span className={`shrink-0 w-px h-4 mx-1 ${isLight ? "bg-zinc-200" : "bg-stone-800"}`} />

          <button
            onClick={copySelection}
            className={`shrink-0 text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-mono px-3 py-1.5 rounded-full transition-all duration-300 ${
              isLight ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" : "bg-white/10 text-stone-300 hover:bg-white/20"
            }`}
          >
            {copied ? "Copied ✓" : "Copy selection"}
          </button>
        </div>
      </div>

      <CustomCursor />
    </div>
  );
}

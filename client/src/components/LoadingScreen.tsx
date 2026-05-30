import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";

/**
 * LoadingScreen – an overlay that covers the app while the 3D canvas initializes.
 * 
 * After progress reaches 100%, it waits a brief moment for the WebGL context to
 * paint its first frame, then plays a radial-wipe dissolve reveal animation:
 * a circular mask expands from the center outward using CSS `clip-path` animated
 * via requestAnimationFrame for buttery-smooth 60fps performance.
 * 
 * The component unmounts itself after the reveal completes via `onFinished`.
 */
interface LoadingScreenProps {
  onFinished?: () => void;
}

export default function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">("loading");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fake progress bar — ticks up to 100
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 35); // Faster to feel snappy

    return () => clearInterval(timer);
  }, []);

  // When progress reaches 100, wait a beat for WebGL to paint, then begin reveal
  useEffect(() => {
    if (progress >= 100 && phase === "loading") {
      // Short 300ms grace period for the Canvas to render its first frame underneath
      const timeout = setTimeout(() => {
        setPhase("revealing");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [progress, phase]);

  // Radial wipe reveal animation using requestAnimationFrame + clip-path
  useEffect(() => {
    if (phase !== "revealing" || !overlayRef.current) return;

    const el = overlayRef.current;
    const startTime = performance.now();
    const duration = 1200; // 1.2 seconds for the full reveal sweep
    let animId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1.0);

      // Ease-in-out cubic for premium feel
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Expand a circle from center: 0% → 150% (overshoot to ensure full cover)
      const radius = eased * 150;
      el.style.clipPath = `circle(${radius}% at 50% 50%)`;
      // Invert: we want the circle to *reveal* what's behind, so we clip the overlay
      // Actually we want the overlay to shrink, so we invert:
      // At t=0 the overlay covers everything (circle 150%), at t=1 it covers nothing (circle 0%)
      const invertedRadius = (1 - eased) * 150;
      el.style.clipPath = `circle(${invertedRadius}% at 50% 50%)`;
      el.style.opacity = `${1 - eased * 0.3}`; // subtle fade as well

      if (t < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setPhase("done");
        onFinished?.();
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [phase, onFinished]);

  if (phase === "done") return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100000] flex items-center justify-center"
      style={{
        background: '#e5e5e5',
        clipPath: 'circle(150% at 50% 50%)', // starts fully covering
        willChange: 'clip-path, opacity',
      }}
    >
      {/* Only show the loading UI while in "loading" phase */}
      <AnimatePresence>
        {phase === "loading" && (
          <motion.div
            className="text-center"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
          >
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <h1 className="text-6xl font-serif italic text-black mb-4">
                Somenath Mondal.
              </h1>
              <motion.p
                className="text-zinc-500 text-[10px] font-medium tracking-[0.3em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Portfolio Showcase
              </motion.p>
            </motion.div>

            <motion.div
              className="w-64 h-px bg-zinc-300 mx-auto mb-6 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <motion.div
                className="h-full bg-black"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </motion.div>

            <motion.div
              className="text-zinc-400 font-light text-[10px] tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {progress}%
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

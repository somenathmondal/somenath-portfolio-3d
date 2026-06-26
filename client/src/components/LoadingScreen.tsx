import { useEffect, useState, useRef } from "react";
import { usePortfolio } from "../lib/stores/usePortfolio";

/**
 * LoadingScreen – an overlay that covers the app while the 3D canvas initializes.
 * 
 * It traces the letters S and M (for Somenath Mondal) with a glowing stroke
 * and fills them with animated, deep-ocean-teal water containing bubbles.
 * 
 * Dynamic behavior:
 * - When progress is active, overlay is solid and blocks inputs.
 * - After 3D loads, the overlay background and text dissolve away.
 * - The SVG loader remains fixed in the center at 50% opacity, allowing
 *   pointer events to pass through so the user can interact with the 3D initials.
 */
interface LoadingScreenProps {
  onFinished?: () => void;
}

export default function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const { theme, setLoading } = usePortfolio();
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">("loading");
  const backgroundOverlayRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for direct DOM manipulation to bypass React high-frequency re-renders
  const traceOutlineRefs = useRef<SVGPathElement[]>([]);
  const waterContainerRef = useRef<SVGGElement>(null);
  const progressTextRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (phase === "revealing") {
      setLoading(false);
    }
  }, [phase, setLoading]);

  // Smooth visual progress loop using direct DOM manipulation for buttery 60fps updates
  useEffect(() => {
    let animationFrameId: number;
    let target = 0;
    let current = 0;

    const totalDuration = 2200; // ms
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progressRatio = Math.min(elapsed / totalDuration, 1.0);
      
      const easeOutQuad = 1 - (1 - progressRatio) * (1 - progressRatio);
      target = easeOutQuad * 100;

      if (current < target) {
        current = Math.min(current + 1.2, target);
        const rounded = Math.round(current);

        // Update SVG trace outlines directly (stroke-dasharray is 600)
        const offset = 600 - (600 * (rounded / 100));
        traceOutlineRefs.current.forEach(path => {
          if (path) {
            path.style.strokeDashoffset = `${offset}`;
          }
        });

        // Update water level translation directly (translates from 166px down to 24px)
        const translateY = 166 - (142 * (rounded / 100));
        if (waterContainerRef.current) {
          waterContainerRef.current.style.transform = `translateY(${translateY}px)`;
        }

        // Update progress text content directly
        if (progressTextRef.current) {
          progressTextRef.current.textContent = `${rounded}%`;
        }
      }

      if (progressRatio < 1.0 || current < 100) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        // Enforce absolute final values on completion
        traceOutlineRefs.current.forEach(path => {
          if (path) path.style.strokeDashoffset = "0";
        });
        if (waterContainerRef.current) {
          waterContainerRef.current.style.transform = "translateY(24px)";
        }
        if (progressTextRef.current) {
          progressTextRef.current.textContent = "100%";
        }

        // Wait 500ms beat for WebGL paint, then begin reveal phase
        timeoutRef.current = setTimeout(() => {
          setPhase("revealing");
        }, 500);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Radial wipe reveal animation applied ONLY to the background overlay
  useEffect(() => {
    if (phase !== "revealing" || !backgroundOverlayRef.current) return;

    const el = backgroundOverlayRef.current;
    const startTime = performance.now();
    const duration = 1200;
    let animId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1.0);

      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const invertedRadius = (1 - eased) * 150;
      el.style.clipPath = `circle(${invertedRadius}% at 50% 50%)`;
      el.style.opacity = `${1 - eased * 0.3}`;

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

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-center overflow-hidden pointer-events-none">
      {/* Styles for SVG Liquid Tracing & Bubble Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .letters-svg {
          width: 648px;
          height: 360px;
          filter: drop-shadow(0 12px 40px rgba(0, 0, 0, ${isDark ? 0.5 : 0.08}));
        }

        @media (max-width: 768px) {
          .letters-svg {
            width: 90vw;
            height: auto;
            max-width: 360px;
          }
        }

        .guide-outline {
          stroke: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(9, 9, 11, 0.06)'};
          stroke-width: 1.5;
          stroke-linecap: round;
          fill: none;
        }

        .trace-outline {
          stroke: ${isDark ? '#75e6da' : '#0d98ba'};
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          stroke-width: 1.8;
          stroke-linecap: round;
          fill: none;
          filter: url(#tracerGlow);
        }

        .water-container {
          transform: translateY(166px);
        }

        .wave {
          fill-opacity: 0.8;
        }

        .wave-front {
          fill: url(#liquidGradFront);
          animation: waveScrollFront 3.5s linear infinite;
        }

        .wave-back {
          fill: url(#liquidGradBack);
          opacity: 0.65;
          animation: waveScrollBack 5.5s linear infinite;
        }

        @keyframes waveScrollFront {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-180px); }
        }

        @keyframes waveScrollBack {
          0% { transform: translateX(-240px); }
          100% { transform: translateX(0px); }
        }

        .bubble {
          fill: ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.45)'};
          stroke: ${isDark ? 'rgba(117, 230, 218, 0.35)' : 'rgba(13, 152, 186, 0.4)'};
          stroke-width: 0.5;
          opacity: 0;
        }

        .bubble-left {
          animation: floatUpWobbleLeft 3s infinite ease-in;
        }

        .bubble-right {
          animation: floatUpWobbleRight 3.4s infinite ease-in;
        }

        @keyframes floatUpWobbleLeft {
          0% {
            transform: translate(0, 0) scale(0.7);
            opacity: 0;
          }
          10% { opacity: 0.8; }
          50% { transform: translate(-8px, -60px) scale(1.0); }
          85% { opacity: 0.8; }
          100% {
            transform: translate(2px, -140px) scale(0.6);
            opacity: 0;
          }
        }

        @keyframes floatUpWobbleRight {
          0% {
            transform: translate(0, 0) scale(0.7);
            opacity: 0;
          }
          10% { opacity: 0.8; }
          50% { transform: translate(8px, -60px) scale(1.0); }
          85% { opacity: 0.8; }
          100% {
            transform: translate(-2px, -140px) scale(0.6);
            opacity: 0;
          }
        }
      `}} />

      {/* Layer 1: Background Solid Overlay (clips/radial-wipes away) */}
      <div
        ref={backgroundOverlayRef}
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isDark ? '#3B1E1E' : '#FAF6F0',
          clipPath: 'circle(150% at 50% 50%)',
          willChange: 'clip-path, opacity',
          pointerEvents: phase === "loading" ? "auto" : "none",
        }}
      />

      {/* Layer 2: Interactive Content Elements */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none">
        
        {/* Title & Subtitle */}
        <div
          className="text-center mb-6 transition-opacity duration-1000 ease-out"
          style={{ opacity: phase === "loading" ? 1 : 0 }}
        >
          <h1 className={`text-4xl md:text-5xl font-serif italic mb-2 font-light tracking-wide ${isDark ? 'text-white' : 'text-[#09090b]'}`}>
            Somenath Mondal.
          </h1>
          <p className={`text-[9px] font-mono tracking-[0.4em] uppercase opacity-80 ${isDark ? 'text-[#D4AF37]' : 'text-zinc-500'}`}>
            Creative Technologist & Spatial Dev
          </p>
        </div>

        {/* SVG Letter Tracing */}
        <div
          className="relative mb-6 flex justify-center items-center transition-opacity duration-1000 ease-in-out"
          style={{ opacity: phase === "loading" ? 1 : (isMobile ? 0 : 0.5) }}
        >
          <svg viewBox="0 0 360 200" className="letters-svg" id="portfolioLoaderSymbol">
            <defs>
              <filter id="tracerGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur1" />
                <feGaussianBlur stdDeviation="1.5" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="liquidGradFront" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? "#75e6da" : "#189ab4"} />
                <stop offset="40%" stopColor="#189ab4" />
                <stop offset="100%" stopColor="#05445e" />
              </linearGradient>

              <linearGradient id="liquidGradBack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? "#0d98ba" : "#75e6da"} />
                <stop offset="100%" stopColor="#052e42" />
              </linearGradient>

              <clipPath id="letters-clip">
                <path d="M 150.32 125.00 Q 150.32 145.58 132.68 158.18 Q 117.00 169.38 95.58 169.38 Q 71.64 169.38 56.24 156.22 Q 40.00 142.22 40.00 118.56 L 58.34 118.56 Q 58.34 134.94 68.00 144.46 Q 77.66 153.84 93.76 153.84 Q 107.06 153.84 117.98 147.68 Q 131.00 140.12 131.00 127.94 Q 131.00 112.68 108.60 105.68 Q 87.74 99.94 67.16 93.92 Q 44.62 83.98 44.62 62.28 Q 44.62 42.40 59.88 30.78 Q 73.88 20.00 94.32 20.00 Q 116.02 20.00 130.16 31.76 Q 145.84 44.36 145.84 65.50 L 127.50 65.50 Q 127.50 51.50 118.54 43.38 Q 109.58 35.12 95.30 35.12 Q 83.26 35.12 74.02 41.00 Q 62.96 48.00 62.96 59.48 Q 62.96 73.90 85.50 80.48 Q 106.50 86.22 127.50 92.10 Q 150.32 102.18 150.32 125.00 Z" />
                <path d="M 313.56 165.74 L 294.66 165.74 L 294.66 44.08 L 255.18 165.74 L 236.70 165.74 L 197.92 44.50 L 197.92 165.74 L 180.00 165.74 L 180.00 23.92 L 208.00 23.92 L 246.08 143.34 L 285.98 23.92 L 313.56 23.92 L 313.56 165.74 Z" />
              </clipPath>
            </defs>

            {/* Wireframe Outline */}
            <path d="M 150.32 125.00 Q 150.32 145.58 132.68 158.18 Q 117.00 169.38 95.58 169.38 Q 71.64 169.38 56.24 156.22 Q 40.00 142.22 40.00 118.56 L 58.34 118.56 Q 58.34 134.94 68.00 144.46 Q 77.66 153.84 93.76 153.84 Q 107.06 153.84 117.98 147.68 Q 131.00 140.12 131.00 127.94 Q 131.00 112.68 108.60 105.68 Q 87.74 99.94 67.16 93.92 Q 44.62 83.98 44.62 62.28 Q 44.62 42.40 59.88 30.78 Q 73.88 20.00 94.32 20.00 Q 116.02 20.00 130.16 31.76 Q 145.84 44.36 145.84 65.50 L 127.50 65.50 Q 127.50 51.50 118.54 43.38 Q 109.58 35.12 95.30 35.12 Q 83.26 35.12 74.02 41.00 Q 62.96 48.00 62.96 59.48 Q 62.96 73.90 85.50 80.48 Q 106.50 86.22 127.50 92.10 Q 150.32 102.18 150.32 125.00 Z" className="guide-outline" />
            <path d="M 313.56 165.74 L 294.66 165.74 L 294.66 44.08 L 255.18 165.74 L 236.70 165.74 L 197.92 44.50 L 197.92 165.74 L 180.00 165.74 L 180.00 23.92 L 208.00 23.92 L 246.08 143.34 L 285.98 23.92 L 313.56 23.92 L 313.56 165.74 Z" className="guide-outline" />

            {/* Glowing active outline */}
            <path ref={el => { if (el) traceOutlineRefs.current[0] = el }} d="M 150.32 125.00 Q 150.32 145.58 132.68 158.18 Q 117.00 169.38 95.58 169.38 Q 71.64 169.38 56.24 156.22 Q 40.00 142.22 40.00 118.56 L 58.34 118.56 Q 58.34 134.94 68.00 144.46 Q 77.66 153.84 93.76 153.84 Q 107.06 153.84 117.98 147.68 Q 131.00 140.12 131.00 127.94 Q 131.00 112.68 108.60 105.68 Q 87.74 99.94 67.16 93.92 Q 44.62 83.98 44.62 62.28 Q 44.62 42.40 59.88 30.78 Q 73.88 20.00 94.32 20.00 Q 116.02 20.00 130.16 31.76 Q 145.84 44.36 145.84 65.50 L 127.50 65.50 Q 127.50 51.50 118.54 43.38 Q 109.58 35.12 95.30 35.12 Q 83.26 35.12 74.02 41.00 Q 62.96 48.00 62.96 59.48 Q 62.96 73.90 85.50 80.48 Q 106.50 86.22 127.50 92.10 Q 150.32 102.18 150.32 125.00 Z" className="trace-outline" />
            <path ref={el => { if (el) traceOutlineRefs.current[1] = el }} d="M 313.56 165.74 L 294.66 165.74 L 294.66 44.08 L 255.18 165.74 L 236.70 165.74 L 197.92 44.50 L 197.92 165.74 L 180.00 165.74 L 180.00 23.92 L 208.00 23.92 L 246.08 143.34 L 285.98 23.92 L 313.56 23.92 L 313.56 165.74 Z" className="trace-outline" />

            {/* Liquid Fill */}
            <g clipPath="url(#letters-clip)">
              <path d="M 150.32 125.00 Q 150.32 145.58 132.68 158.18 Q 117.00 169.38 95.58 169.38 Q 71.64 169.38 56.24 156.22 Q 40.00 142.22 40.00 118.56 L 58.34 118.56 Q 58.34 134.94 68.00 144.46 Q 77.66 153.84 93.76 153.84 Q 107.06 153.84 117.98 147.68 Q 131.00 140.12 131.00 127.94 Q 131.00 112.68 108.60 105.68 Q 87.74 99.94 67.16 93.92 Q 44.62 83.98 44.62 62.28 Q 44.62 42.40 59.88 30.78 Q 73.88 20.00 94.32 20.00 Q 116.02 20.00 130.16 31.76 Q 145.84 44.36 145.84 65.50 L 127.50 65.50 Q 127.50 51.50 118.54 43.38 Q 109.58 35.12 95.30 35.12 Q 83.26 35.12 74.02 41.00 Q 62.96 48.00 62.96 59.48 Q 62.96 73.90 85.50 80.48 Q 106.50 86.22 127.50 92.10 Q 150.32 102.18 150.32 125.00 Z" fill="rgba(255, 255, 255, 0.025)" />
              <path d="M 313.56 165.74 L 294.66 165.74 L 294.66 44.08 L 255.18 165.74 L 236.70 165.74 L 197.92 44.50 L 197.92 165.74 L 180.00 165.74 L 180.00 23.92 L 208.00 23.92 L 246.08 143.34 L 285.98 23.92 L 313.56 23.92 L 313.56 165.74 Z" fill="rgba(255, 255, 255, 0.025)" />

              <g ref={waterContainerRef} className="water-container">
                <path className="wave wave-back" d="M 0 10 Q 60 20 120 10 T 240 10 T 360 10 T 480 10 T 600 10 T 720 10 T 840 10 T 960 10 L 960 250 L 0 250 Z" />
                <path className="wave wave-front" d="M 0 10 Q 45 18 90 10 T 180 10 T 270 10 T 360 10 T 450 10 T 540 10 T 630 10 T 720 10 L 720 250 L 0 250 Z" />
              </g>

              <g className="bubbles">
                <circle className="bubble bubble-left" cx="65" cy="170" r="3.2" style={{ animationDelay: '0.2s', animationDuration: '2.5s' }} />
                <circle className="bubble bubble-right" cx="95" cy="170" r="4.5" style={{ animationDelay: '0.8s', animationDuration: '3.2s' }} />
                <circle className="bubble bubble-left" cx="125" cy="170" r="2.5" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }} />
                <circle className="bubble bubble-right" cx="145" cy="170" r="3.8" style={{ animationDelay: '0.4s', animationDuration: '3.6s' }} />
                <circle className="bubble bubble-left" cx="205" cy="170" r="5.0" style={{ animationDelay: '1.1s', animationDuration: '3.0s' }} />
                <circle className="bubble bubble-right" cx="235" cy="170" r="2.2" style={{ animationDelay: '1.9s', animationDuration: '2.6s' }} />
                <circle className="bubble bubble-left" cx="265" cy="170" r="4.0" style={{ animationDelay: '2.3s', animationDuration: '3.3s' }} />
                <circle className="bubble bubble-right" cx="295" cy="170" r="3.0" style={{ animationDelay: '0.6s', animationDuration: '2.9s' }} />
              </g>
            </g>
          </svg>
        </div>

        {/* Numerical Progress */}
        <div
          ref={progressTextRef}
          className={`font-mono text-[11px] tracking-[0.25em] transition-opacity duration-1000 ease-out ${isDark ? 'text-[#C5A07F]' : 'text-zinc-500'}`}
          style={{ opacity: phase === "loading" ? 1 : 0 }}
        >
          0%
        </div>

      </div>
    </div>
  );
}

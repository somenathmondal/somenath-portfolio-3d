import { useEffect, useState, useRef } from "react";
import { usePortfolio } from "../lib/stores/usePortfolio";
import posthog from "posthog-js";

export default function CustomCursor() {
  const { theme, cursorRadius } = usePortfolio();
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isFinePointer, setIsFinePointer] = useState(true);

  const mousePos = useRef({ x: -300, y: -300 });
  const currentPos = useRef({ x: -300, y: -300 });
  const currentStretch = useRef(0);
  const currentAngle = useRef(0);
  const isHoveringRef = useRef(false);
  const cursorRadiusRef = useRef(cursorRadius);

  useEffect(() => {
    cursorRadiusRef.current = cursorRadius;
  }, [cursorRadius]);

  // Detect pointer capabilities to disable bubble on touchscreens
  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsFinePointer(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Track hover state via ref only (no React re-render on every mouseover!)
  useEffect(() => {
    if (!isFinePointer) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      isHoveringRef.current = Boolean(
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("cursor-pointer") ||
        target.closest(".group")
      );
    };

    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    return () => window.removeEventListener("mouseover", handleMouseOver);
  }, [isFinePointer]);

  useEffect(() => {
    if (!isFinePointer) return;

    let hasInitialized = false;
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;

    const handleResize = () => {
      winWidth = window.innerWidth;
      winHeight = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!hasInitialized) {
        currentPos.current.x = e.clientX;
        currentPos.current.y = e.clientY;
        mousePos.current.x = e.clientX;
        mousePos.current.y = e.clientY;
        hasInitialized = true;
      } else {
        mousePos.current.x = e.clientX;
        mousePos.current.y = e.clientY;
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let animationId: number;
    let currentRadius = cursorRadiusRef.current;

    let bubblePlayTime = 0;
    let lastTime = performance.now();
    let hasSentBubbleAnalytics = false;

    // Pure GPU-composited rAF loop: mutates ONLY `transform` (zero layout, zero paint)
    const updatePosition = (nowMs: number) => {
      const el = cursorRef.current;
      if (el && hasInitialized) {
        const baseRadius = cursorRadiusRef.current;
        const dx = mousePos.current.x - currentPos.current.x;
        const dy = mousePos.current.y - currentPos.current.y;

        currentPos.current.x += dx * 0.15;
        currentPos.current.y += dy * 0.15;

        const scrollOffset = (window as any).scrollOffset || 0;
        const scrollPages = (window as any).scrollPages || 3;
        const scrollFactor = Math.min(scrollOffset * scrollPages, 1.0);

        const targetRadius = baseRadius - (baseRadius - 16) * scrollFactor;
        const targetRadiusWithHover = isHoveringRef.current ? 16 : targetRadius;

        const rx = winWidth * 0.45;
        const ry = winHeight * 0.45;
        const dxN = (mousePos.current.x - winWidth * 0.5) / rx;
        const dyN = (mousePos.current.y - winHeight * 0.5) / ry;
        const ellipseVal = dxN * dxN + dyN * dyN;

        let ovalFactor = 1.0;
        if (ellipseVal > 1.0) {
          const tOval = Math.min(1.0, (ellipseVal - 1.0) / 0.4);
          ovalFactor = 1.0 - Math.sin(tOval * Math.PI * 0.5);
        }

        const targetRadiusWithOval = 16 + (targetRadiusWithHover - 16) * ovalFactor;
        currentRadius += (targetRadiusWithOval - currentRadius) * 0.15;

        const speed = Math.hypot(dx, dy);
        let targetStretch = 0;
        let targetAngle = currentAngle.current;
        if (speed > 1.0) {
          targetStretch = Math.min(speed / 160, 0.35);
          targetAngle = Math.atan2(dy, dx);
        }

        // Track bubble active play duration on the landing page
        const deltaSeconds = (nowMs - lastTime) / 1000;
        lastTime = nowMs;

        if (scrollOffset < 0.05) {
          if (speed > 1.5) bubblePlayTime += deltaSeconds;
          hasSentBubbleAnalytics = false;
        } else if (bubblePlayTime > 0.5 && !hasSentBubbleAnalytics) {
          const duration = Math.round(bubblePlayTime * 10) / 10;
          posthog.capture("bubble_played", { duration_seconds: duration });
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "bubble_played", {
              event_category: "Interaction",
              event_label: "Bubble Cursor",
              value: duration,
              duration_seconds: duration,
            });
          }
          bubblePlayTime = 0;
          hasSentBubbleAnalytics = true;
        }

        currentStretch.current += (targetStretch - currentStretch.current) * 0.15;

        let angleDiff = targetAngle - currentAngle.current;
        angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        currentAngle.current += angleDiff * 0.2;

        // Subtle organic GPU-only wobble & idle micro-float
        const t = nowMs * 0.003;
        const wobbleX = 1 + Math.sin(t * 1.1) * 0.03;
        const wobbleY = 1 + Math.cos(t * 1.4) * 0.03;
        const driftX = speed < 1.5 ? Math.sin(t * 0.7) * 2.0 : 0;
        const driftY = speed < 1.5 ? Math.cos(t * 0.5) * 2.0 : 0;

        const finalX = currentPos.current.x + driftX;
        const finalY = currentPos.current.y + driftY;

        const radiusScale = currentRadius / baseRadius;
        const scaleX = radiusScale * (1 + currentStretch.current) * wobbleX;
        const scaleY = radiusScale * (1 - currentStretch.current * 0.5) * wobbleY;

        el.style.transform = `translate3d(${finalX.toFixed(2)}px, ${finalY.toFixed(2)}px, 0) rotate(${currentAngle.current.toFixed(3)}rad) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`;
      }
      animationId = requestAnimationFrame(updatePosition);
    };

    animationId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [isFinePointer]);

  if (!isFinePointer) return null;

  const baseSize = cursorRadius * 2;
  const marginOffset = -cursorRadius;

  const sphereStyles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: `${baseSize}px`,
    height: `${baseSize}px`,
    marginLeft: `${marginOffset}px`,
    marginTop: `${marginOffset}px`,
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 99999,
    willChange: "transform",
    contain: "layout style paint",
    backdropFilter: "blur(4px) saturate(140%) contrast(104%)",
    transform: `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`,
    border: theme === "dark"
      ? "1.2px solid rgba(255, 255, 255, 0.45)"
      : "1.2px solid rgba(255, 255, 255, 0.65)",
    background: theme === "dark"
      ? `
        radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 30%),
        radial-gradient(circle at 75% 75%, rgba(0, 240, 255, 0.25) 0%, rgba(255, 0, 128, 0.2) 45%, rgba(255, 255, 255, 0) 75%),
        radial-gradient(circle at 20% 80%, rgba(255, 230, 100, 0.2) 0%, rgba(0, 255, 150, 0.1) 40%, rgba(255, 255, 255, 0) 70%),
        linear-gradient(135deg, rgba(255, 0, 128, 0.04), rgba(0, 240, 255, 0.04) 50%, rgba(255, 230, 100, 0.04) 100%)
      `
      : `
        radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 30%),
        radial-gradient(circle at 75% 75%, rgba(0, 240, 255, 0.3) 0%, rgba(255, 0, 128, 0.2) 45%, rgba(255, 255, 255, 0) 75%),
        radial-gradient(circle at 20% 80%, rgba(255, 230, 100, 0.25) 0%, rgba(0, 255, 150, 0.15) 40%, rgba(255, 255, 255, 0) 70%),
        linear-gradient(135deg, rgba(255, 0, 128, 0.06), rgba(0, 240, 255, 0.06) 50%, rgba(255, 230, 100, 0.06) 100%)
      `,
    boxShadow: `
      0 0 14px rgba(0, 240, 255, 0.22),
      inset 0 0 14px rgba(255, 255, 255, 0.5),
      inset 3px 8px 18px rgba(0, 240, 255, 0.3),
      inset -3px -8px 18px rgba(255, 0, 128, 0.3)
    `,
  };

  return (
    <div ref={cursorRef} style={sphereStyles}>
      <div
        className="absolute bg-white rounded-full opacity-80"
        style={{
          top: "12%",
          left: "12%",
          width: "12%",
          height: "8%",
          transform: "rotate(-45deg)",
        }}
      />
      <div
        className="absolute bg-white rounded-full opacity-30"
        style={{
          bottom: "15%",
          right: "15%",
          width: "6%",
          height: "4%",
          transform: "rotate(135deg)",
        }}
      />
    </div>
  );
}

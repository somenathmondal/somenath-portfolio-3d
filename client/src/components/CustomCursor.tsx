import { useEffect, useState, useRef } from "react";
import { usePortfolio } from "../lib/stores/usePortfolio";

export default function CustomCursor() {
  const { theme, cursorRadius } = usePortfolio();
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(true);
  
  // Track mouse coordinates, lerped coordinates, stretch deformation, and rotation angle
  const mousePos = useRef({ x: -200, y: -200 });
  const currentPos = useRef({ x: -200, y: -200 });
  const currentStretch = useRef(0);
  const currentAngle = useRef(0);
  const isHoveringRef = useRef(false);

  // Sync hovering state to a ref to avoid recreating the animation loop
  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);

  // Detect pointer capabilities to disable bubble on touchscreens
  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches);
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (!isFinePointer) return;

    let hasInitialized = false;

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

    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    
    // Direct, high-performance requestAnimationFrame loop with organic physical behaviors
    const updatePosition = () => {
      if (cursorRef.current) {
        const dx = mousePos.current.x - currentPos.current.x;
        const dy = mousePos.current.y - currentPos.current.y;
        
        // Smoothly lerp towards mouse position (0.15 factor for smooth organic glide)
        currentPos.current.x += dx * 0.15;
        currentPos.current.y += dy * 0.15;
        
        // Calculate velocity-based stretch deformation
        const speed = Math.sqrt(dx * dx + dy * dy);
        let targetStretch = 0;
        let targetAngle = currentAngle.current;
        
        if (speed > 1.0) {
          // Stretch is proportional to drag velocity, capped at 35% distortion
          targetStretch = Math.min(speed / 160, 0.35);
          targetAngle = Math.atan2(dy, dx);
        }
        
        // Interpolate stretch and angle parameters smoothly
        currentStretch.current += (targetStretch - currentStretch.current) * 0.15;
        
        // Rotate in the shortest direction to avoid 360-degree rotation glitches
        let angleDiff = targetAngle - currentAngle.current;
        angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        currentAngle.current += angleDiff * 0.2;
        
        // Soap Bubble Floating Wobble using absolute time
        const t = performance.now() * 0.0035;
        const isHover = isHoveringRef.current;
        
        // Boost surface activity / frequency on hover
        const wobbleFactor = isHover ? 1.4 : 1.0;
        const wobbleAmplitude = isHover ? 6.5 : 4.0;
        
        const b1 = 50 + Math.sin(t * 1.1 * wobbleFactor) * wobbleAmplitude;
        const b2 = 50 + Math.cos(t * 1.5 * wobbleFactor) * wobbleAmplitude;
        const b3 = 50 + Math.sin(t * 2.0 * wobbleFactor) * (wobbleAmplitude - 1);
        const b4 = 50 + Math.cos(t * 1.2 * wobbleFactor) * (wobbleAmplitude - 1);
        
        // Tiny Brownian micro-float when mouse is stationary
        const driftX = speed < 1.5 ? Math.sin(t * 0.7) * 2.5 : 0;
        const driftY = speed < 1.5 ? Math.cos(t * 0.5) * 2.5 : 0;
        
        const finalX = currentPos.current.x + driftX;
        const finalY = currentPos.current.y + driftY;
        
        // 1. Mutate border-radius dynamically to produce fluid wobble shape
        cursorRef.current.style.borderRadius = `${b1}% ${100 - b1}% ${b2}% ${100 - b2}% / ${b3}% ${b4}% ${100 - b4}% ${100 - b3}%`;
        
        // 2. Mutate transformation (translation coordinates, directional rotation, volume-preserving stretch)
        const scaleX = 1 + currentStretch.current;
        const scaleY = 1 - currentStretch.current * 0.5; // shrink thickness perpendicular to preserve area
        
        cursorRef.current.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) rotate(${currentAngle.current}rad) scale(${scaleX}, ${scaleY})`;
      }
      animationId = requestAnimationFrame(updatePosition);
    };
    
    animationId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [isFinePointer]);

  // Track hover state for clickable nodes to expand size dynamically
  useEffect(() => {
    if (!isFinePointer) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest("button") || 
        target.closest("a") || 
        target.classList.contains("cursor-pointer") ||
        target.closest(".group")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mouseover", handleMouseOver);
    return () => window.removeEventListener("mouseover", handleMouseOver);
  }, [isFinePointer]);

  // Use the decoupled cursorRadius (in pixels) directly from the Zustand store
  const baseSize = cursorRadius * 2; // Diameter in pixels
  const size = isHovering ? baseSize * 1.15 : baseSize; // Expand slightly on hover for visual bounce
  const marginOffset = -size / 2;

  const sphereStyles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: `${size}px`,
    height: `${size}px`,
    marginLeft: `${marginOffset}px`,
    marginTop: `${marginOffset}px`,
    pointerEvents: "none",
    zIndex: 99999, // Ensure it is above the Canvas and absolute overlay containers
    backdropFilter: "blur(5px) saturate(145%) contrast(105%)", // Replicates high refractive index lens with blur and contrast warp
    transform: `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`,
    transition: "width 0.3s cubic-bezier(0.25, 1, 0.5, 1), height 0.3s cubic-bezier(0.25, 1, 0.5, 1), margin 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease, border-color 0.3s ease",
    
    // Bright iridescent glass bubble edges
    border: theme === "dark" 
      ? "1.2px solid rgba(255, 255, 255, 0.45)" 
      : "1.2px solid rgba(255, 255, 255, 0.65)",

    // Layered gradients representing light interference:
    // 1. Specular white glare top-left
    // 2. Oil-slick purple/cyan refraction bottom-right
    // 3. Gold/green ground bounce highlight bottom-left
    // 4. Base transparent color gradient
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

    // Highly premium multi-layered iridescent glow shadows
    boxShadow: isHovering
      ? `
        0 0 20px rgba(0, 240, 255, 0.35),
        0 0 35px rgba(255, 0, 128, 0.25),
        inset 0 0 20px rgba(255, 255, 255, 0.7),
        inset 4px 10px 24px rgba(0, 240, 255, 0.45),
        inset -4px -10px 24px rgba(255, 0, 128, 0.45),
        inset 5px -5px 18px rgba(255, 230, 100, 0.35)
      `
      : `
        0 0 15px rgba(0, 240, 255, 0.25),
        0 0 25px rgba(255, 0, 128, 0.15),
        inset 0 0 15px rgba(255, 255, 255, 0.55),
        inset 3px 8px 20px rgba(0, 240, 255, 0.35),
        inset -3px -8px 20px rgba(255, 0, 128, 0.35),
        inset 4px -4px 15px rgba(255, 230, 100, 0.25)
      `
  };

  if (!isFinePointer) return null;

  return (
    <div ref={cursorRef} style={sphereStyles}>
      {/* 3D Specular Highlight crescent (scales proportionally) */}
      <div 
        className="absolute bg-white rounded-full opacity-80"
        style={{
          top: "12%",
          left: "12%",
          width: "12%",
          height: "8%",
          transform: "rotate(-45deg)",
          filter: "blur(0.5px)"
        }}
      />
      {/* Softer environmental bounce glare on the opposite side */}
      <div 
        className="absolute bg-white rounded-full opacity-30"
        style={{
          bottom: "15%",
          right: "15%",
          width: "6%",
          height: "4%",
          transform: "rotate(135deg)",
          filter: "blur(0.5px)"
        }}
      />
    </div>
  );
}


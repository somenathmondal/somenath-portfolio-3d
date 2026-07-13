import { useRef, useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Environment, Text3D, Center, ContactShadows, useScroll, Sky } from "@react-three/drei";
import posthog from "posthog-js";
import { EffectComposer, Bloom, Noise, DepthOfField } from "@react-three/postprocessing";
import * as THREE from "three";
import { usePortfolio } from "../lib/stores/usePortfolio";
import WavyGrass from "./WavyGrass";
import ProjectWheel from "./ProjectWheel";
import Aurora from "./Aurora";
import Dust from "./Dust";

// Debug-only tools, loaded on demand behind the #debug URL hash so they stay out of the main bundle
const Perf = lazy(() => import("r3f-perf").then((m) => ({ default: m.Perf })));

interface LandingPageProps { scrollProgress: number; }

interface DebugParams {
  letterSize: number;
  letterSpacing: number;
  springVelocity: number;
  influenceRadius: number;
  cursorRadius: number;
  damping: number;
  pushForce: number;
  showPerf: boolean;
  groupX: number;
  groupY: number;
}

function InteractiveLetter({ char, targetPosition, color, font, params, scrollOffset }: { 
  char: string, targetPosition: [number, number, number], color: string, font: string, params: DebugParams, scrollOffset: number 
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 7;
  const { isLoading } = usePortfolio();
  const velocity = useMemo(() => new THREE.Vector3(), []);
  const targetRotation = useMemo(() => new THREE.Euler(), []);
  const [hasMoved, setHasMoved] = useState(false);

  const transitionStartRef = useRef<number | null>(null);
  const transitionProgressRef = useRef(0);

  // Interaction duration tracking refs
  const interactionTimeRef = useRef(0);
  const hasSentAnalyticsRef = useRef(false);

  useEffect(() => {
    if (!isLoading && transitionStartRef.current === null) {
      transitionStartRef.current = performance.now();
    } else if (isLoading) {
      transitionStartRef.current = null;
      transitionProgressRef.current = 0;
    }
  }, [isLoading]);

  useEffect(() => {
    const handleMove = () => {
      if (!hasMoved) setHasMoved(true);
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchstart', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
    };
  }, [hasMoved]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (!groupRef.current) return;

    // Calculate transition progress (1s duration after a 2s delay)
    if (transitionStartRef.current !== null) {
      const elapsedMs = performance.now() - transitionStartRef.current;
      const delayMs = 2000; // 2 seconds delay
      const durationMs = 1000; // 1 second duration
      
      if (elapsedMs < delayMs) {
        transitionProgressRef.current = 0;
      } else {
        const activeElapsed = elapsedMs - delayMs;
        transitionProgressRef.current = Math.min(activeElapsed / durationMs, 1.0);
      }
    }

    const tProgress = transitionProgressRef.current;
    const ease = tProgress < 0.5 
      ? 4 * tProgress * tProgress * tProgress 
      : 1 - Math.pow(-2 * tProgress + 2, 3) / 2;

    let targetX = targetPosition[0];
    let targetY = targetPosition[1];
    let targetZ = targetPosition[2];

    if (isMobile) {
      const spacing = params.letterSpacing;
      if (char === "S") {
        const startX = -spacing;
        const startY = 0;
        const endX = 0;
        const endY = spacing / 2;
        targetX = THREE.MathUtils.lerp(startX, endX, ease);
        targetY = THREE.MathUtils.lerp(startY, endY, ease);
      } else if (char === "M") {
        const startX = spacing;
        const startY = 0;
        const endX = 0;
        const endY = -spacing / 2;
        targetX = THREE.MathUtils.lerp(startX, endX, ease);
        targetY = THREE.MathUtils.lerp(startY, endY, ease);
      }
    }

    const currentTargetPos = new THREE.Vector3(targetX, targetY, targetZ);
    currentTargetPos.y += scrollOffset * 10;
    currentTargetPos.z -= scrollOffset * 5;

    if (hasMoved) {
      const mouseWorld = new THREE.Vector3(
        (state.mouse.x * state.viewport.width) / 2, 
        (state.mouse.y * state.viewport.height) / 2, 
        0
      );
      const distToMouse = groupRef.current.position.distanceTo(mouseWorld);
      const radius = params.influenceRadius;
      
      if (distToMouse < radius) {
        const pushForceVec = new THREE.Vector3().subVectors(groupRef.current.position, mouseWorld).normalize();
        const power = (1 - distToMouse / radius) * params.pushForce;
        velocity.add(pushForceVec.multiplyScalar(power));
        targetRotation.x += (Math.random() - 0.5) * 0.2;
        targetRotation.y += (Math.random() - 0.5) * 0.2;

        // Accumulate active interaction time in seconds when inside the hero section
        if (scrollOffset < 0.05) {
          interactionTimeRef.current += delta;
        }
      }
    }

    // Report interaction duration as soon as the user scrolls away
    if (scrollOffset >= 0.05) {
      if (interactionTimeRef.current > 0.5 && !hasSentAnalyticsRef.current) {
        const duration = Math.round(interactionTimeRef.current * 10) / 10;
        
        // PostHog
        posthog.capture("letter_played", { letter: char, duration_seconds: duration });

        // Google Analytics
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "letter_played", {
            event_category: "Interaction",
            event_label: `3D Letter ${char}`,
            value: duration,
            letter: char,
            duration_seconds: duration
          });
        }

        interactionTimeRef.current = 0;
        hasSentAnalyticsRef.current = true;
      }
    } else {
      // Reset the analytics block if user scrolls back up
      hasSentAnalyticsRef.current = false;
    }

    const springForce = new THREE.Vector3().subVectors(currentTargetPos, groupRef.current.position);
    velocity.add(springForce.multiplyScalar(params.springVelocity));
    velocity.multiplyScalar(params.damping);
    groupRef.current.position.add(velocity);
    
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.x + Math.sin(t * 0.5) * 0.1, 0.1);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.y + Math.cos(t * 0.3) * 0.1, 0.1);
    
    targetRotation.x *= 0.95;
    targetRotation.y *= 0.95;
  });

  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
          font={font}
          size={params.letterSize}
          height={0.5}
          curveSegments={24}
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.03}
          bevelOffset={0}
          bevelSegments={8}
        >
          {char}
          <MeshTransmissionMaterial
            backside backsideThickness={10} thickness={1.5} samples={isMobile ? 4 : 16} transmission={0.95} clearcoat={1} clearcoatRoughness={0} chromaticAberration={0.8} anisotropy={0.3} roughness={0.0} distortion={0.2} distortionScale={0.1} temporalDistortion={0.0} color={color} ior={1.6}
          />
        </Text3D>
      </Center>
    </group>
  );
}

export default function LandingPage({ scrollProgress = 0 }: LandingPageProps) {
  const { viewport } = useThree();
  const scroll = useScroll();
  const isMobile = viewport.width < 7;
  const { theme, setInfluenceRadius, setCursorRadius } = usePortfolio();

  const sunPosition = useMemo<[number, number, number]>(() => {
    return theme === "dark" 
      ? [15, 0.015, -10]  // Low sun angle creates a gorgeous dark red/amber sunset matching RedSands background
      : [15, 0.45, -10];  // High sun angle creates a bright sunny day sky
  }, [theme]);

  const skyParams = useMemo(() => {
    return theme === "dark"
      ? { turbidity: 10, rayleigh: 4, mieCoefficient: 0.005, mieDirectionalG: 0.85 }
      : { turbidity: 6, rayleigh: 1.2, mieCoefficient: 0.002, mieDirectionalG: 0.8 };
  }, [theme]);
  
  const [params, setParams] = useState<DebugParams>({
    letterSize: isMobile ? 0.9 : 1.25,
    letterSpacing: isMobile ? 0.55 : 0.7, 
    springVelocity: 0.04,
    influenceRadius: 2.0,
    cursorRadius: 120, // Decoupled default in pixels (240px diameter)
    damping: 0.90,
    pushForce: 0.1,
    showPerf: false,
    groupX: -0.10,
    groupY: isMobile ? 0.0 : -0.10
  });

  const [currentScroll, setCurrentScroll] = useState(0);

  useEffect(() => {
    setInfluenceRadius(params.influenceRadius);
  }, [params.influenceRadius, setInfluenceRadius]);

  useEffect(() => {
    setCursorRadius(params.cursorRadius);
  }, [params.cursorRadius, setCursorRadius]);

  useFrame(() => {
    setCurrentScroll(scroll.offset);
    (window as any).scrollOffset = scroll.offset;
    (window as any).scrollPages = scroll.pages;
  });

  useEffect(() => {
    if (window.location.hash !== "#debug") return;
    let pane: any;
    let disposed = false;

    import("tweakpane").then(({ Pane }) => {
      if (disposed) return;
      pane = new Pane({ title: "Letter Physics Debug", expanded: true }) as any;

      const f1 = pane.addFolder({ title: "Letters" });
      f1.addBinding(params, "letterSize", { min: 0.1, max: 5, step: 0.1 });
      f1.addBinding(params, "letterSpacing", { min: -1, max: 2, step: 0.01 });

      const f2 = pane.addFolder({ title: "Physics & Cursor" });
      f2.addBinding(params, "springVelocity", { min: 0.01, max: 0.5, step: 0.01 });
      f2.addBinding(params, "influenceRadius", { min: 0.1, max: 10, step: 0.1, label: "Influence Radius (3D)" });
      f2.addBinding(params, "cursorRadius", { min: 10, max: 400, step: 1, label: "Cursor Radius (px)" });
      f2.addBinding(params, "damping", { min: 0.8, max: 0.99, step: 0.01 });
      f2.addBinding(params, "pushForce", { min: 0, max: 0.2, step: 0.01 });

      const fGroup = pane.addFolder({ title: "3D Group Position" });
      fGroup.addBinding(params, "groupX", { min: -2, max: 2, step: 0.01, label: "Group X" });
      fGroup.addBinding(params, "groupY", { min: -2, max: 2, step: 0.01, label: "Group Y" });

      const f3 = pane.addFolder({ title: "Diagnostics" });
      f3.addBinding(params, "showPerf", { label: "Show Stats" });

      pane.on("change", (ev: any) => {
        setParams((prev) => ({ ...prev, [ev.target.key as string]: ev.value }));
      });
    });

    return () => {
      disposed = true;
      pane?.dispose();
    };
  }, []);

  const exitProgress = Math.min(currentScroll * scroll.pages, 1.0);

  return (
    <>
      <color attach="background" args={[theme === 'light' ? "#FAF6F0" : "#09090b"]} />
      {params.showPerf && (
        <Suspense fallback={null}>
          <Perf position="bottom-right" minimal={isMobile} />
        </Suspense>
      )}
      
      <Environment preset="studio" />
      <ambientLight intensity={theme === "dark" ? 0.2 : 0.4} />
      <spotLight 
        position={[15, 15, 10]} 
        angle={0.25} 
        penumbra={1} 
        intensity={theme === "dark" ? 2.5 : 1.5} 
        color={theme === "dark" ? "#00f0ff" : "#ffffff"} // Cyan in dark mode, white in light mode
        castShadow 
      />
      <pointLight 
        position={[-10, -10, -10]} 
        color={theme === "dark" ? "#ff007f" : "#ffffff"} // Magenta in dark mode, white in light mode
        intensity={theme === "dark" ? 1.5 : 0.5} 
      />

      {!isMobile && (
        <EffectComposer>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={0.2} radius={0.4} />
          <Noise opacity={0.02} />
          <DepthOfField
            target={[0, 0, 0]}       // Lock focus exactly on centerstage floating initials
            focalLength={0.15}       // Shallow focal depth for smooth cinematic blur
            bokehScale={8.0}         // Exquisite large bokeh circle shapes
            height={480}             // Optimizing depth buffer resolution
          />
        </EffectComposer>
      )}

      {/* <WavyGrass scrollOffset={currentScroll} /> */}

      {/* Winning effects-lab atmosphere: only visible while the wheel section is on screen */}
      <Aurora enabled={() => usePortfolio.getState().wheelVisible} />
      <Dust enabled={() => usePortfolio.getState().wheelVisible} />
      <ProjectWheel />

      <group position={[params.groupX, params.groupY + exitProgress * 3, -exitProgress * 4]}>
        <InteractiveLetter 
          char="S" 
          targetPosition={isMobile ? [0, params.letterSpacing / 2, 0] : [-params.letterSpacing, 0, 0]} 
          color="#9edbb7" 
          font="/fonts/font.json" 
          params={params}
          scrollOffset={exitProgress}
        />
        <InteractiveLetter 
          char="M" 
          targetPosition={isMobile ? [0, -params.letterSpacing / 2, 0] : [params.letterSpacing, 0, 0]} 
          color="#b0c4de" 
          font="/fonts/font.json" 
          params={params}
          scrollOffset={exitProgress}
        />
        
        {!isMobile && (
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4 * (1 - exitProgress)} scale={15} blur={2} far={4.5}
          />
        )}
      </group>
    </>
  );
}

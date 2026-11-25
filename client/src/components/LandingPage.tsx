import { useRef, useEffect, useState, useMemo, lazy, Suspense, MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, Environment, Text3D, Center, ContactShadows, useScroll } from "@react-three/drei";
import posthog from "posthog-js";
import * as THREE from "three";
import { usePortfolio } from "../lib/stores/usePortfolio";

const LazyPerf = lazy(() => import("r3f-perf").then((m) => ({ default: m.Perf })));

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

const _currentTargetPos = new THREE.Vector3();
const _mouseWorld = new THREE.Vector3();
const _pushForceVec = new THREE.Vector3();
const _springForce = new THREE.Vector3();

function InteractiveLetter({ char, targetPosition, color, font, params, exitProgressRef }: {
  char: string;
  targetPosition: [number, number, number];
  color: string;
  font: string;
  params: DebugParams;
  exitProgressRef: MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 7;
  const { isLoading } = usePortfolio();
  const velocity = useMemo(() => new THREE.Vector3(), []);
  const targetRotation = useMemo(() => new THREE.Euler(), []);
  const hasMovedRef = useRef(false);

  const transitionStartRef = useRef<number | null>(null);
  const transitionProgressRef = useRef(0);

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
      hasMovedRef.current = true;
    };
    window.addEventListener("mousemove", handleMove, { passive: true, once: true });
    window.addEventListener("touchstart", handleMove, { passive: true, once: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchstart", handleMove);
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const scrollOffset = exitProgressRef.current;

    if (scrollOffset >= 1.0) {
      if (interactionTimeRef.current > 0.5 && !hasSentAnalyticsRef.current) {
        const duration = Math.round(interactionTimeRef.current * 10) / 10;
        posthog.capture("letter_played", { letter: char, duration_seconds: duration });
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "letter_played", {
            event_category: "Interaction",
            event_label: `3D Letter ${char}`,
            value: duration,
            letter: char,
            duration_seconds: duration,
          });
        }
        interactionTimeRef.current = 0;
        hasSentAnalyticsRef.current = true;
      }
      return;
    }

    const t = state.clock.elapsedTime;

    if (transitionStartRef.current !== null && transitionProgressRef.current < 1.0) {
      const elapsedMs = performance.now() - transitionStartRef.current;
      const delayMs = 2000;
      const durationMs = 1000;
      if (elapsedMs < delayMs) {
        transitionProgressRef.current = 0;
      } else {
        transitionProgressRef.current = Math.min((elapsedMs - delayMs) / durationMs, 1.0);
      }
    }

    const tProgress = transitionProgressRef.current;
    const ease = tProgress < 0.5
      ? 4 * tProgress * tProgress * tProgress
      : 1 - Math.pow(-2 * tProgress + 2, 3) / 2;

    let targetX = targetPosition[0];
    let targetY = targetPosition[1];
    const targetZ = targetPosition[2];

    if (isMobile) {
      const spacing = params.letterSpacing;
      if (char === "S") {
        targetX = THREE.MathUtils.lerp(-spacing, 0, ease);
        targetY = THREE.MathUtils.lerp(0, spacing / 2, ease);
      } else if (char === "M") {
        targetX = THREE.MathUtils.lerp(spacing, 0, ease);
        targetY = THREE.MathUtils.lerp(0, -spacing / 2, ease);
      }
    }

    _currentTargetPos.set(targetX, targetY + scrollOffset * 10, targetZ - scrollOffset * 5);

    if (hasMovedRef.current) {
      _mouseWorld.set(
        (state.mouse.x * state.viewport.width) / 2,
        (state.mouse.y * state.viewport.height) / 2,
        0
      );
      const distToMouse = groupRef.current.position.distanceTo(_mouseWorld);
      const radius = params.influenceRadius;

      if (distToMouse < radius) {
        _pushForceVec.subVectors(groupRef.current.position, _mouseWorld).normalize();
        const power = (1 - distToMouse / radius) * params.pushForce;
        velocity.add(_pushForceVec.multiplyScalar(power));
        targetRotation.x += (Math.random() - 0.5) * 0.2;
        targetRotation.y += (Math.random() - 0.5) * 0.2;

        if (scrollOffset < 0.05) {
          interactionTimeRef.current += delta;
        }
      }
    }

    if (scrollOffset >= 0.05) {
      if (interactionTimeRef.current > 0.5 && !hasSentAnalyticsRef.current) {
        const duration = Math.round(interactionTimeRef.current * 10) / 10;
        posthog.capture("letter_played", { letter: char, duration_seconds: duration });
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "letter_played", {
            event_category: "Interaction",
            event_label: `3D Letter ${char}`,
            value: duration,
            letter: char,
            duration_seconds: duration,
          });
        }
        interactionTimeRef.current = 0;
        hasSentAnalyticsRef.current = true;
      }
    } else {
      hasSentAnalyticsRef.current = false;
    }

    _springForce.subVectors(_currentTargetPos, groupRef.current.position);
    velocity.add(_springForce.multiplyScalar(params.springVelocity));
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
          curveSegments={16}
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.03}
          bevelOffset={0}
          bevelSegments={6}
        >
          {char}
          <MeshTransmissionMaterial
            backside
            backsideThickness={10}
            thickness={1.5}
            samples={isMobile ? 4 : 8}
            resolution={512}
            transmission={0.95}
            clearcoat={1}
            clearcoatRoughness={0}
            chromaticAberration={0.8}
            anisotropy={0.3}
            roughness={0.0}
            distortion={0.2}
            distortionScale={0.1}
            temporalDistortion={0.0}
            color={color}
            ior={1.6}
          />
        </Text3D>
      </Center>
    </group>
  );
}

export default function LandingPage({ scrollProgress = 0 }: LandingPageProps) {
  const { viewport, gl } = useThree();
  const scroll = useScroll();
  const isMobile = viewport.width < 7;
  const { theme, setInfluenceRadius, setCursorRadius } = usePortfolio();

  const heroGroupRef = useRef<THREE.Group>(null);
  const exitProgressRef = useRef(0);
  const isHeroVisibleRef = useRef(true);
  const [heroVisible, setHeroVisible] = useState(true);
  const [isDebug, setIsDebug] = useState(() =>
    typeof window !== "undefined" && window.location.hash.toLowerCase().includes("debug")
  );

  useEffect(() => {
    const onHashChange = () => {
      setIsDebug(window.location.hash.toLowerCase().includes("debug"));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const [params, setParams] = useState<DebugParams>({
    letterSize: isMobile ? 0.9 : 1.25,
    letterSpacing: isMobile ? 0.55 : 0.7,
    springVelocity: 0.04,
    influenceRadius: 2.0,
    cursorRadius: 120,
    damping: 0.90,
    pushForce: 0.1,
    showPerf: false,
    groupX: -0.10,
    groupY: isMobile ? 0.0 : -0.10,
  });

  useEffect(() => {
    setInfluenceRadius(params.influenceRadius);
  }, [params.influenceRadius, setInfluenceRadius]);

  useEffect(() => {
    setCursorRadius(params.cursorRadius);
  }, [params.cursorRadius, setCursorRadius]);

  useFrame(() => {
    const offset = scroll.offset;
    const pages = scroll.pages;
    (window as any).scrollOffset = offset;
    (window as any).scrollPages = pages;

    const exitProgress = Math.min(offset * pages, 1.0);
    exitProgressRef.current = exitProgress;

    const visibleNow = exitProgress < 0.98;
    if (heroGroupRef.current) {
      heroGroupRef.current.visible = visibleNow;
      if (visibleNow) {
        heroGroupRef.current.position.set(
          params.groupX,
          params.groupY + exitProgress * 3,
          -exitProgress * 4
        );
      }
    }

    if (visibleNow !== isHeroVisibleRef.current) {
      isHeroVisibleRef.current = visibleNow;
      setHeroVisible(visibleNow);
    }

    // Publish lightweight WebGL telemetry only when #debug is active
    if (isDebug) {
      (window as any).__PERF_TELEMETRY__ = {
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
        heroActive: visibleNow,
      };
    }
  });

  // Lazy-load Tweakpane only when #debug hash is present
  useEffect(() => {
    if (!isDebug) return;
    let disposed = false;
    let pane: any = null;

    import("tweakpane").then(({ Pane }) => {
      if (disposed) return;
      pane = new Pane({ title: "Letter Physics Debug", expanded: false }) as any;

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
  }, [isDebug]);

  return (
    <>
      <color attach="background" args={[theme === "light" ? "#FAF6F0" : "#09090b"]} />
      {params.showPerf && (
        <Suspense fallback={null}>
          <LazyPerf position="bottom-right" minimal={isMobile} />
        </Suspense>
      )}

      <Environment preset="studio" />
      <ambientLight intensity={theme === "dark" ? 0.2 : 0.4} />
      <spotLight
        position={[15, 15, 10]}
        angle={0.25}
        penumbra={1}
        intensity={theme === "dark" ? 2.5 : 1.5}
        color={theme === "dark" ? "#00f0ff" : "#ffffff"}
      />
      <pointLight
        position={[-10, -10, -10]}
        color={theme === "dark" ? "#ff007f" : "#ffffff"}
        intensity={theme === "dark" ? 1.5 : 0.5}
      />

      <group ref={heroGroupRef} position={[params.groupX, params.groupY, 0]}>
        <InteractiveLetter
          char="S"
          targetPosition={isMobile ? [0, params.letterSpacing / 2, 0] : [-params.letterSpacing, 0, 0]}
          color="#9edbb7"
          font="/fonts/font.json"
          params={params}
          exitProgressRef={exitProgressRef}
        />
        <InteractiveLetter
          char="M"
          targetPosition={isMobile ? [0, -params.letterSpacing / 2, 0] : [params.letterSpacing, 0, 0]}
          color="#b0c4de"
          font="/fonts/font.json"
          params={params}
          exitProgressRef={exitProgressRef}
        />

        {!isMobile && heroVisible && (
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={15}
            blur={2}
            far={4.5}
            resolution={256}
          />
        )}
      </group>
    </>
  );
}

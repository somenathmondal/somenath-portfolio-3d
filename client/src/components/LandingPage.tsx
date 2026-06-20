import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Environment, Text3D, Center, ContactShadows, useScroll, Sky } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, DepthOfField } from "@react-three/postprocessing";
import { Perf } from "r3f-perf";
import * as THREE from "three";
import { Pane } from "tweakpane";
import { usePortfolio } from "../lib/stores/usePortfolio";
import WavyGrass from "./WavyGrass";

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
}

function InteractiveLetter({ char, targetPosition, color, font, params, scrollOffset }: { 
  char: string, targetPosition: [number, number, number], color: string, font: string, params: DebugParams, scrollOffset: number 
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 7;
  const velocity = useMemo(() => new THREE.Vector3(), []);
  const targetPosVec = useMemo(() => new THREE.Vector3(...targetPosition), []);
  const targetRotation = useMemo(() => new THREE.Euler(), []);
  const [hasMoved, setHasMoved] = useState(false);

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

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!groupRef.current) return;

    // Apply scroll offset to Y position
    const currentTargetPos = targetPosVec.clone();
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
      }
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
    showPerf: false
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
  });

  useEffect(() => {
    if (window.location.hash !== "#debug") return;
    const pane = new Pane({ title: "Letter Physics Debug", expanded: true }) as any;
    
    const f1 = pane.addFolder({ title: "Letters" });
    f1.addBinding(params, "letterSize", { min: 0.1, max: 5, step: 0.1 });
    f1.addBinding(params, "letterSpacing", { min: -1, max: 2, step: 0.01 }); 
    
    const f2 = pane.addFolder({ title: "Physics & Cursor" });
    f2.addBinding(params, "springVelocity", { min: 0.01, max: 0.5, step: 0.01 });
    f2.addBinding(params, "influenceRadius", { min: 0.1, max: 10, step: 0.1, label: "Influence Radius (3D)" });
    f2.addBinding(params, "cursorRadius", { min: 10, max: 400, step: 1, label: "Cursor Radius (px)" });
    f2.addBinding(params, "damping", { min: 0.8, max: 0.99, step: 0.01 });
    f2.addBinding(params, "pushForce", { min: 0, max: 0.2, step: 0.01 });
    
    const f3 = pane.addFolder({ title: "Diagnostics" });
    f3.addBinding(params, "showPerf", { label: "Show Stats" });

    pane.on("change", (ev: any) => {
      setParams((prev) => ({ ...prev, [ev.target.key as string]: ev.value }));
    });
    return () => pane.dispose();
  }, []);

  return (
    <>
      <color attach="background" args={[theme === 'light' ? "#FAF6F0" : "#3B1E1E"]} />
      {params.showPerf && <Perf position="bottom-right" minimal={isMobile} />}
      
      <Environment preset="studio" />
      <ambientLight intensity={0.4} />
      <spotLight 
        position={[15, 15, 10]} 
        angle={0.25} 
        penumbra={1} 
        intensity={1.5} 
        color={theme === "dark" ? "#ff7f50" : "#ffffff"} // Warm sunset light in dark mode, white in light mode
        castShadow 
      />
      <pointLight position={[-10, -10, -10]} color={theme === "dark" ? "#ff4500" : "#ffffff"} intensity={0.5} />

      {theme === "dark" && (
        <Sky
          distance={450000}
          sunPosition={sunPosition}
          turbidity={skyParams.turbidity}
          rayleigh={skyParams.rayleigh}
          mieCoefficient={skyParams.mieCoefficient}
          mieDirectionalG={skyParams.mieDirectionalG}
        />
      )}

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

      <group position={[0, (isMobile ? 0 : 0.1) + currentScroll * 3, -currentScroll * 4]}>
        <InteractiveLetter 
          char="S" 
          targetPosition={isMobile ? [0, params.letterSpacing / 2, 0] : [-params.letterSpacing, 0, 0]} 
          color="#9edbb7" 
          font="/fonts/font.json" 
          params={params}
          scrollOffset={currentScroll}
        />
        <InteractiveLetter 
          char="M" 
          targetPosition={isMobile ? [0, -params.letterSpacing / 2, 0] : [params.letterSpacing, 0, 0]} 
          color="#b0c4de" 
          font="/fonts/font.json" 
          params={params}
          scrollOffset={currentScroll}
        />
        
        <ContactShadows
          position={[0, isMobile ? -2.0 : -1.5, 0]}
          opacity={0.4 * (1 - currentScroll)} scale={isMobile ? 8 : 15} blur={2} far={4.5}
        />
      </group>
    </>
  );
}

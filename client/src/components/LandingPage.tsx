import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Html, MeshTransmissionMaterial, Environment, Text3D, Center, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Pane } from "tweakpane";

interface LandingPageProps {
  scrollProgress: number;
}

interface DebugParams {
  letterSize: number;
  springVelocity: number;
  influenceRadius: number;
  damping: number;
  pushForce: number;
}

function InteractiveLetter({ 
  char, 
  position, 
  color, 
  font, 
  params 
}: { 
  char: string, 
  position: [number, number, number], 
  color: string, 
  font: string,
  params: DebugParams
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, mouse } = useThree();
  
  const targetPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const velocity = useMemo(() => new THREE.Vector3(), []);
  const targetRotation = useMemo(() => new THREE.Euler(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!meshRef.current) return;

    const mouseWorld = new THREE.Vector3(mouse.x * viewport.width / 2, mouse.y * viewport.height / 2, 0);
    const distToMouse = meshRef.current.position.distanceTo(mouseWorld);
    
    const pushForceVec = new THREE.Vector3();
    const radius = params.influenceRadius;
    
    if (distToMouse < radius) {
      pushForceVec.subVectors(meshRef.current.position, mouseWorld).normalize();
      const power = (1 - distToMouse / radius) * params.pushForce;
      velocity.add(pushForceVec.multiplyScalar(power));
      
      targetRotation.x += (Math.random() - 0.5) * 0.2;
      targetRotation.y += (Math.random() - 0.5) * 0.2;
    }

    const springForce = new THREE.Vector3().subVectors(targetPos, meshRef.current.position);
    velocity.add(springForce.multiplyScalar(params.springVelocity));

    velocity.multiplyScalar(params.damping);
    meshRef.current.position.add(velocity);
    
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation.x + Math.sin(t * 0.5) * 0.1, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation.y + Math.cos(t * 0.3) * 0.1, 0.1);
    
    targetRotation.x *= 0.95;
    targetRotation.y *= 0.95;
  });

  return (
    <Center position={position}>
      <Text3D
        ref={meshRef}
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
          backside
          backsideThickness={10}
          thickness={1.5}
          samples={16}
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
          ior={1.2}
        />
      </Text3D>
    </Center>
  );
}

export default function LandingPage({ scrollProgress = 0 }: LandingPageProps) {
  const { viewport } = useThree();
  const isMobile = viewport.width < 7;
  
  const [params, setParams] = useState<DebugParams>({
    letterSize: isMobile ? 1.5 : 2.0,
    springVelocity: 0.04,
    influenceRadius: 2.0,
    damping: 0.90,
    pushForce: 0.6
  });

  useEffect(() => {
    if (window.location.hash !== "#debug") return;

    const pane = new Pane({
      title: "Letter Physics Debug",
      expanded: true,
    });

    pane.addBinding(params, "letterSize", { min: 0.1, max: 5, step: 0.1 });
    pane.addBinding(params, "springVelocity", { min: 0.01, max: 0.5, step: 0.01 });
    pane.addBinding(params, "influenceRadius", { min: 0.5, max: 10, step: 0.1 });
    pane.addBinding(params, "damping", { min: 0.8, max: 0.99, step: 0.01 });
    pane.addBinding(params, "pushForce", { min: 0.1, max: 2, step: 0.1 });

    pane.on("change", (ev) => {
      setParams((prev) => ({ ...prev, [ev.target.key as string]: ev.value }));
    });

    return () => {
      pane.dispose();
    };
  }, []);

  return (
    <>
      <color attach="background" args={["#f0f0f0"]} />
      <Environment preset="studio" />
      
      <ambientLight intensity={0.4} />
      <spotLight position={[15, 15, 10]} angle={0.25} penumbra={1} intensity={1.5} castShadow />
      <pointLight position={[-10, -10, -10]} color="#ffffff" intensity={0.5} />

      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={0.5} radius={0.4} />
        <Noise opacity={0.02} />
      </EffectComposer>

      {/* Tighter vertical spacing on mobile: gap reduced from 2 to 1.2 */}
      <group position={[0, isMobile ? 0.3 : -0.2, 0]}>
        <InteractiveLetter 
          char="S" 
          position={isMobile ? [0, 0.6, 0] : [-0.45, 0, 0]} 
          color="#9edbb7" 
          font="/fonts/font.json" 
          params={params}
        />
        <InteractiveLetter 
          char="M" 
          position={isMobile ? [0, -0.6, 0] : [0.45, 0, 0]} 
          color="#b0c4de" 
          font="/fonts/font.json" 
          params={params}
        />
        
        <ContactShadows
          position={[0, isMobile ? -1.8 : -1.5, 0]}
          opacity={0.4}
          scale={isMobile ? 8 : 15}
          blur={2}
          far={4.5}
        />
      </group>

      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div className="w-full h-full relative overflow-hidden select-none flex flex-col justify-between">
          
          {/* Header */}
          <header className="w-full p-8 md:p-12 flex justify-between items-start z-30 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex flex-col pointer-events-auto"
            >
              <h1 className="text-3xl md:text-5xl font-serif italic text-black leading-tight">
                Somenath Mondal
              </h1>
              <span className="text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase text-zinc-400 font-medium mt-1 text-left">
                Portfolio Showcase / Vol. 1
              </span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-right flex flex-col items-end pointer-events-auto"
            >
              <span className="text-[8px] md:text-[10px] tracking-[0.4em] uppercase text-zinc-500 font-bold mb-2">
                Available
              </span>
              <div className="w-8 md:w-16 h-px bg-black" />
            </motion.div>
          </header>

          {/* Centered Main Content (Balanced for mobile) */}
          <main className="w-full flex-grow flex flex-col items-center justify-center pointer-events-none relative">
            <div className="max-w-7xl w-full px-8 md:px-12 grid grid-cols-12 gap-4 md:gap-8 items-center h-full">
              
              {/* Left text on desktop, Top on mobile */}
              <motion.div 
                className="col-span-12 md:col-span-3 order-2 md:order-1 flex justify-start items-center md:items-start"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                <div className="hidden md:block w-8 h-px bg-zinc-300 mb-6" />
                <p className="text-[10px] md:text-sm font-serif italic text-zinc-600 leading-relaxed max-w-[120px] md:max-w-[200px] text-left">
                  "Crafting immersive 3D experiences that blur the line between reality & imagination."
                </p>
              </motion.div>

              {/* Reserved space for letters */}
              <div className="col-span-12 md:col-span-6 h-[40vh] md:h-0 order-1 md:order-2" />

              {/* Right text on desktop, Bottom on mobile */}
              <motion.div 
                className="col-span-12 md:col-span-3 text-right flex flex-col items-end order-3 flex justify-end md:justify-center h-full"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <h2 className="text-lg md:text-3xl font-serif text-black leading-tight mb-2 md:mb-4">
                  Dreams <span className="italic">in</span> Pixels
                </h2>
                <p className="text-[8px] md:text-[10px] tracking-[0.2em] uppercase text-zinc-400 max-w-[100px] md:max-w-[150px]">
                  Refraction & magic
                </p>
                <div className="hidden md:block w-8 h-px bg-zinc-300 mt-6" />
              </motion.div>
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-center md:items-end z-30 pointer-events-none gap-6 md:gap-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="flex gap-8 md:gap-12 pointer-events-auto"
            >
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] tracking-widest uppercase text-zinc-400 mb-1">Location</span>
                <span className="text-[10px] md:text-xs text-black font-medium">Bangalore, India</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] tracking-widest uppercase text-zinc-400 mb-1">Expertise</span>
                <span className="text-[10px] md:text-xs text-black font-medium">XR / WebGL / iOS</span>
              </div>
            </motion.div>

            {/* "Poke them!" moved to background watermark */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.05 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0"
            >
              <h2 className="text-8xl md:text-[20vw] font-serif text-black tracking-tighter leading-none whitespace-nowrap">
                Poke them!
              </h2>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="flex flex-col items-center md:items-end gap-3 md:gap-4 pointer-events-auto"
            >
              <div className="flex gap-4 md:gap-8 flex-wrap justify-center md:justify-end">
                <a href="https://www.linkedin.com/in/somenath-mondal-xr-tech/" target="_blank" rel="noopener noreferrer" className="text-[8px] md:text-[10px] tracking-widest uppercase text-black font-bold border-b border-black">LinkedIn</a>
                <a href="https://github.com/somenathmondal" target="_blank" rel="noopener noreferrer" className="text-[8px] md:text-[10px] tracking-widest uppercase text-black font-bold border-b border-black">GitHub</a>
                <a href="https://www.youtube.com/@IITPodcastwithSomenath" target="_blank" rel="noopener noreferrer" className="text-[8px] md:text-[10px] tracking-widest uppercase text-black font-bold border-b border-black">YouTube</a>
                <a href="https://open.spotify.com/show/2OkRCNNTbwaAB2CElTDdYH?si=9_ikF-n-RBexQXMuwvxr9g" target="_blank" rel="noopener noreferrer" className="text-[8px] md:text-[10px] tracking-widest uppercase text-black font-bold border-b border-black">Spotify</a>
              </div>
              <span className="text-[8px] md:text-[9px] tracking-[0.5em] uppercase text-zinc-400">© 2026 Edition</span>
            </motion.div>
          </footer>
        </div>
      </Html>
    </>
  );
}

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import { usePortfolio } from "./lib/stores/usePortfolio";
import LandingPage from "./components/LandingPage";
import LoadingScreen from "./components/LoadingScreen";
import ProjectShowcase from "./components/ProjectShowcase";
import LandingHero from "./components/LandingHero";
import CustomCursor from "./components/CustomCursor";
import { Analytics } from "@vercel/analytics/react";
import "@fontsource/inter";

function App() {
  const { theme } = usePortfolio();
  const [loadingDone, setLoadingDone] = useState(false);

  return (
    <div className="w-full h-full relative" style={{ background: theme === 'light' ? '#e5e5e5' : '#3B1E1E' }}>
      <Analytics />

      {/* Canvas is ALWAYS mounted so it initializes & renders its first frame
          while the loading overlay is still covering the screen */}
      <Canvas
        dpr={[1, 1.5]} // Capping DPR at 1.5 for better performance
        camera={{
          position: [0, 0, 5],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
        className="absolute inset-0 z-10"
      >
        <Suspense fallback={null}>
          <ScrollControls pages={3} damping={0.2}>
            {/* 3D background elements */}
            <LandingPage scrollProgress={0} />
            
            {/* HTML content that scrolls */}
            <Scroll html style={{ width: '100%', left: 0, right: 0 }}>
              <div className="w-full">
                <LandingHero />
                <ProjectShowcase />
                <div className={`w-full h-[100vh] flex items-center justify-center ${theme === 'light' ? 'bg-zinc-900' : 'bg-[#2D1616] border-t border-stone-800'}`}>
                  <h2 className={`font-serif italic text-4xl ${theme === 'light' ? 'text-white' : 'text-stone-300'}`}>More to come...</h2>
                </div>
              </div>
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>

      {/* Loading overlay sits ON TOP (z-[100000]) and reveals the scene underneath
          with a radial wipe animation when loading completes */}
      {!loadingDone && (
        <LoadingScreen onFinished={() => setLoadingDone(true)} />
      )}

      <CustomCursor />
    </div>
  );
}

export default App;

import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import { usePortfolio } from "./lib/stores/usePortfolio";
import LandingPage from "./components/LandingPage";
import LoadingScreen from "./components/LoadingScreen";
import ProjectOverlay from "./components/ProjectOverlay";
import SeoIndex from "./components/SeoIndex";
import { WHEEL_SPACER_VH } from "./components/ProjectWheel";
import LandingHero from "./components/LandingHero";
import CustomCursor from "./components/CustomCursor";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const { theme } = usePortfolio();
  const [loadingDone, setLoadingDone] = useState(false);
  const [pagesCount, setPagesCount] = useState(5.0);
  const htmlContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!htmlContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.target.getBoundingClientRect().height;
        const viewportHeight = window.innerHeight;
        if (viewportHeight > 0) {
          setPagesCount(height / viewportHeight);
        }
      }
    });

    observer.observe(htmlContainerRef.current);

    const handleResize = () => {
      if (htmlContainerRef.current) {
        const height = htmlContainerRef.current.getBoundingClientRect().height;
        const viewportHeight = window.innerHeight;
        if (viewportHeight > 0) {
          setPagesCount(height / viewportHeight);
        }
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [loadingDone]);

  return (
    <div className="w-full h-full relative" style={{ background: theme === 'light' ? '#FAF6F0' : '#09090b' }}>
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
          <ScrollControls pages={pagesCount} damping={0.2}>
            {/* 3D background elements */}
            <LandingPage scrollProgress={0} />
            
            {/* HTML content that scrolls */}
            <Scroll html style={{ width: '100%', left: 0, right: 0 }}>
              <div ref={htmlContainerRef} className="w-full">
                <LandingHero />
                {/* Scroll room for the 3D project wheel; the wheel and its overlay render elsewhere */}
                <div style={{ height: `${WHEEL_SPACER_VH}vh` }} className="w-full pointer-events-none" />
                <div className={`w-full h-[100vh] flex items-center justify-center ${theme === 'light' ? 'bg-zinc-900' : 'bg-[#121214] border-t border-zinc-900'}`}>
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

      <ProjectOverlay />

      <SeoIndex />

      <CustomCursor />
    </div>
  );
}

export default App;

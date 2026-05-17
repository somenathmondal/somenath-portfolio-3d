import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { usePortfolio } from "./lib/stores/usePortfolio";
import LandingPage from "./components/LandingPage";
import LoadingScreen from "./components/LoadingScreen";
import "@fontsource/inter";

function App() {
  const { isLoading, setLoading } = usePortfolio();
  const [showCanvas, setShowCanvas] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Simulate loading time for assets
    const timer = setTimeout(() => {
      setLoading(false);
      setShowCanvas(true);
    }, 2000);

    // Handle scroll events (optional, kept for LandingPage if needed)
    const handleScroll = (event: WheelEvent) => {
      setScrollProgress(prev => {
        const newValue = prev + event.deltaY * 0.0008;
        return Math.max(0, Math.min(1, newValue));
      });
    };

    window.addEventListener('wheel', handleScroll, { passive: false });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('wheel', handleScroll);
    };
  }, [setLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full h-full relative" style={{ background: '#e5e5e5' }}>
      {showCanvas && (
        <Canvas
          dpr={[1, 2]}
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
            <LandingPage scrollProgress={scrollProgress} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

export default App;

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { usePortfolio } from "./lib/stores/usePortfolio";
import LandingPage from "./components/LandingPage";
import LoadingScreen from "./components/LoadingScreen";
import "@fontsource/inter";

function App() {
  const { isLoading, setLoading } = usePortfolio();
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    // Simulate loading time for assets
    const timer = setTimeout(() => {
      setLoading(false);
      setShowCanvas(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full h-full relative" style={{ background: '#e5e5e5' }}>
      {showCanvas && (
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
            <LandingPage scrollProgress={0} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

export default App;

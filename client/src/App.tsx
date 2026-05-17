import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { usePortfolio } from "./lib/stores/usePortfolio";
import LandingPage from "./components/LandingPage";
import Portfolio from "./components/Portfolio";
import ContactSection from "./components/ContactSection";
import Navigation from "./components/Navigation";
import LoadingScreen from "./components/LoadingScreen";
import ScrollCV from "./components/ScrollCV";
import CustomCursor from "./components/CustomCursor";
import { useScrollSection } from "./hooks/useScrollSection";
import "@fontsource/inter";

function App() {
  const { isLoading, setLoading } = usePortfolio();
  const { currentSection } = useScrollSection();
  const [showCanvas, setShowCanvas] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Simulate loading time for assets
    const timer = setTimeout(() => {
      setLoading(false);
      setShowCanvas(true);
    }, 2000);

    // Handle scroll events for CV reveal
    const handleScroll = (event: WheelEvent) => {
      if (currentSection === 'landing') {
        event.preventDefault();
        setScrollProgress(prev => {
          const newValue = prev + event.deltaY * 0.0008;
          return Math.max(0, Math.min(1, newValue));
        });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentSection === 'landing') {
        if (event.key === 'ArrowDown' || event.key === 'PageDown') {
          setScrollProgress(prev => Math.min(1, prev + 0.1));
        }
        if (event.key === 'ArrowUp' || event.key === 'PageUp') {
          setScrollProgress(prev => Math.max(0, prev - 0.1));
        }
      }
    };

    document.addEventListener('wheel', handleScroll, { passive: false });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('wheel', handleScroll);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setLoading, currentSection]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full h-full relative" style={{ background: '#e5e5e5' }}>
      {/* <Navigation /> */}
      {/* <CustomCursor /> */}
      
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

      {/* Overlay content */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="pointer-events-auto">
          {currentSection === 'portfolio' && <Portfolio />}
          {currentSection === 'contact' && <ContactSection />}
        </div>
      </div>

      {/* CV Scroll overlay - only show on landing page */}
      {currentSection === 'landing' && <ScrollCV scrollProgress={scrollProgress} />}
    </div>
  );
}

export default App;

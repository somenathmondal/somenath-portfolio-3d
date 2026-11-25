import { Suspense, useState, useEffect, useRef, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import { usePortfolio } from "./lib/stores/usePortfolio";
import LandingPage from "./components/LandingPage";
import LoadingScreen from "./components/LoadingScreen";
import ProjectShowcase from "./components/ProjectShowcase";
import LandingHero from "./components/LandingHero";
import CustomCursor from "./components/CustomCursor";
import { Analytics } from "@vercel/analytics/react";

const DebugPerfHUD = lazy(() => import("./components/DebugPerfHUD"));

function isDebugHash() {
  if (typeof window === "undefined") return false;
  return window.location.hash.toLowerCase().includes("debug");
}

function App() {
  const { theme } = usePortfolio();
  const [loadingDone, setLoadingDone] = useState(false);
  const [pagesCount, setPagesCount] = useState(5.0);
  const [debugMode, setDebugMode] = useState(isDebugHash);
  const htmlContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onHashChange = () => setDebugMode(isDebugHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!htmlContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
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
    <div className="w-full h-full relative" style={{ background: theme === "light" ? "#FAF6F0" : "#09090b" }}>
      <Analytics />

      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 5],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearAlpha(0);
        }}
        className="absolute inset-0 z-10"
      >
        <Suspense fallback={null}>
          <ScrollControls pages={pagesCount} damping={0.2}>
            <LandingPage scrollProgress={0} />

            <Scroll html style={{ width: "100%", left: 0, right: 0 }}>
              <div ref={htmlContainerRef} className="w-full">
                <LandingHero />
                <ProjectShowcase />
                <div className={`w-full h-[100vh] flex items-center justify-center ${theme === "light" ? "bg-zinc-900" : "bg-[#121214] border-t border-zinc-900"}`}>
                  <h2 className={`font-serif italic text-4xl ${theme === "light" ? "text-white" : "text-stone-300"}`}>More to come...</h2>
                </div>
              </div>
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>

      {!loadingDone && (
        <LoadingScreen onFinished={() => setLoadingDone(true)} />
      )}

      {debugMode && (
        <Suspense fallback={null}>
          <DebugPerfHUD
            onClose={() => {
              window.history.replaceState(null, "", window.location.pathname + window.location.search);
              setDebugMode(false);
            }}
          />
        </Suspense>
      )}

      <CustomCursor />
    </div>
  );
}

export default App;

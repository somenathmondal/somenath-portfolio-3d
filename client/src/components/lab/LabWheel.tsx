import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { projects } from "../../data/projects";
import { usePortfolio } from "../../lib/stores/usePortfolio";
import { useLab } from "../../lib/stores/useLab";
import { trackEvent } from "../../lib/analytics";
import { ensureAudio, playTick } from "../../lib/sound";
import WheelPlane, { WheelShared } from "../WheelPlane";

const N = projects.length;
const PLANE_ASPECT = 16 / 10;
const THEME_BG = { light: "#FAF6F0", dark: "#09090b" };
const TINT_STRENGTH = { light: 0.2, dark: 0.3 };

const getEffects = () => useLab.getState().effects;

export default function LabWheel() {
  const scroll = useScroll();
  const { viewport, scene } = useThree();
  const isMobile = viewport.width < 7;
  const theme = usePortfolio((s) => s.theme);

  const groupRef = useRef<THREE.Group>(null);
  const shared = useRef<WheelShared>({ rotation: 0, bend: 0 }).current;
  const activeRef = useRef(0);
  const prevOffset = useRef(0);
  const bgTarget = useMemo(() => new THREE.Color(), []);
  const baseColor = useMemo(() => new THREE.Color(), []);
  const accentColors = useMemo(() => projects.map((p) => new THREE.Color(p.accent)), []);

  const radius = isMobile ? 2.9 : 4.2;
  const planeW = isMobile ? 2.1 : 3.1;
  const planeH = planeW / PLANE_ASPECT;
  const step = (planeH + (isMobile ? 0.28 : 0.38)) / radius;
  const centerX = isMobile ? 0 : 0.9;
  const centerY = isMobile ? 0.55 : 0;
  const centerZ = (isMobile ? 1.6 : 1.2) - radius;

  const textures = useTexture(projects.map((p) => p.image!));
  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      t.needsUpdate = true;
    });
  }, [textures]);

  // The whole lab page is the wheel section
  useEffect(() => {
    usePortfolio.getState().setWheelVisible(true);
    usePortfolio.getState().setActiveProject(0);
    const el = scroll.el;
    usePortfolio.getState().setScrollToProject((i: number) => {
      const max = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: (max * i) / (N - 1), behavior: "smooth" });
    });
    window.addEventListener("pointerdown", ensureAudio, { once: true });
    return () => {
      usePortfolio.getState().setWheelVisible(false);
      usePortfolio.getState().setScrollToProject(null);
      window.removeEventListener("pointerdown", ensureAudio);
    };
  }, [scroll.el]);

  const openProject = (index: number) => {
    const project = projects[index];
    if (index === activeRef.current) {
      trackEvent("project_card_clicked", { project_id: project.id, link: project.link });
      window.open(project.link, "_blank", "noopener,noreferrer");
    } else {
      usePortfolio.getState().scrollToProject?.(index);
    }
  };

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const p = scroll.offset;

    // Signed scroll velocity drives the bend
    const velocity = delta > 0 ? (p - prevOffset.current) / delta : 0;
    prevOffset.current = p;
    easing.damp(shared, "bend", THREE.MathUtils.clamp(velocity * 2.2, -0.9, 0.9), 0.12, delta);

    groupRef.current.position.set(centerX, centerY, centerZ);
    easing.damp(groupRef.current.rotation, "x", -p * (N - 1) * step, 0.28, delta);
    shared.rotation = groupRef.current.rotation.x;

    const index = Math.round(p * (N - 1));
    if (index !== activeRef.current) {
      activeRef.current = index;
      usePortfolio.getState().setActiveProject(index);
      if (useLab.getState().effects.sound) playTick(Math.abs(velocity) * 0.15);
    }

    // Background tint toward the active accent (the aurora layers on top when enabled)
    baseColor.set(THEME_BG[theme]);
    bgTarget.copy(baseColor).lerp(accentColors[index], TINT_STRENGTH[theme]);
    if (scene.background instanceof THREE.Color) {
      easing.dampC(scene.background, bgTarget, 0.4, delta);
    }
  });

  return (
    <group ref={groupRef}>
      {projects.map((project, i) => (
        <WheelPlane
          key={project.id}
          index={i}
          texture={textures[i]}
          shared={shared}
          step={step}
          radius={radius}
          planeW={planeW}
          planeH={planeH}
          onActivate={openProject}
          getEffects={getEffects}
        />
      ))}
    </group>
  );
}

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { projects } from "../data/projects";
import { usePortfolio } from "../lib/stores/usePortfolio";
import { trackEvent } from "../lib/analytics";

/** Scroll room the wheel gets in the HTML layer, in viewport-heights. Keep in sync with App.tsx spacer. */
export const WHEEL_SPACER_VH = 550;

const N = projects.length;
const PLANE_ASPECT = 16 / 10;

// The wheel starts turning once the hero (first 100vh) has scrolled away
// and finishes when the spacer has WHEEL_SPACER_VH - 100 vh left below the fold.
const SECTION_START_VH = 100;
const SECTION_LENGTH_VH = WHEEL_SPACER_VH - 100;

const THEME_BG = { light: "#FAF6F0", dark: "#09090b" };
const TINT_STRENGTH = { light: 0.2, dark: 0.3 };

function coverFit(texture: THREE.Texture) {
  const img = texture.image as { width: number; height: number };
  if (!img?.width) return;
  const imageAspect = img.width / img.height;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  if (imageAspect > PLANE_ASPECT) {
    texture.repeat.set(PLANE_ASPECT / imageAspect, 1);
    texture.offset.set((1 - texture.repeat.x) / 2, 0);
  } else {
    texture.repeat.set(1, imageAspect / PLANE_ASPECT);
    texture.offset.set(0, (1 - texture.repeat.y) / 2);
  }
}

export default function ProjectWheel() {
  const scroll = useScroll();
  const { viewport, scene } = useThree();
  const isMobile = viewport.width < 7;
  const theme = usePortfolio((s) => s.theme);

  const groupRef = useRef<THREE.Group>(null);
  const planeRefs = useRef<(THREE.Group | null)[]>([]);
  const activeRef = useRef(-1);
  const visibleRef = useRef(false);
  const bgTarget = useMemo(() => new THREE.Color(), []);
  const accentColors = useMemo(() => projects.map((p) => new THREE.Color(p.accent)), []);
  const baseColor = useMemo(() => new THREE.Color(), []);

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
      coverFit(t);
      t.needsUpdate = true;
    });
  }, [textures]);

  // Expose "jump to project i" for the minimap: converts an index back into a scrollTop.
  useEffect(() => {
    const el = scroll.el;
    usePortfolio.getState().setScrollToProject((i: number) => {
      const vh = window.innerHeight / 100;
      const top = (SECTION_START_VH + (SECTION_LENGTH_VH * i) / (N - 1)) * vh;
      el.scrollTo({ top, behavior: "smooth" });
    });
    return () => usePortfolio.getState().setScrollToProject(null);
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

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const pages = scroll.pages;
    const scrollTopVh = scroll.offset * (pages - 1) * 100;
    const p = THREE.MathUtils.clamp((scrollTopVh - SECTION_START_VH) / SECTION_LENGTH_VH, 0, 1);

    // Only render (and tint the background) while the section is anywhere near the viewport
    const active = scrollTopVh > SECTION_START_VH - 60 && scrollTopVh < SECTION_START_VH + SECTION_LENGTH_VH + 60;
    groupRef.current.visible = active;
    if (active !== visibleRef.current) {
      visibleRef.current = active;
      usePortfolio.getState().setWheelVisible(active);
    }

    // Broadcast the project currently holding the front slot
    const index = Math.round(p * (N - 1));
    if (active && index !== activeRef.current) {
      activeRef.current = index;
      usePortfolio.getState().setActiveProject(index);
    }

    // Background tint: ease toward the active project's accent, or back to the theme base
    baseColor.set(THEME_BG[theme]);
    bgTarget.copy(baseColor);
    if (active) bgTarget.lerp(accentColors[index], TINT_STRENGTH[theme]);
    if (scene.background instanceof THREE.Color) {
      easing.dampC(scene.background, bgTarget, 0.4, delta);
    }

    // Rise-in while the hero scrolls away, then rotate with scroll
    const entrance = THREE.MathUtils.clamp((SECTION_START_VH - scrollTopVh) / 100, 0, 1);
    groupRef.current.position.set(centerX, centerY - entrance * 2.5, centerZ);
    easing.damp(groupRef.current.rotation, "x", -p * (N - 1) * step, 0.28, delta);

    // Emphasize the front plane, dim and shrink the neighbors
    const rotation = groupRef.current.rotation.x;
    planeRefs.current.forEach((plane, i) => {
      if (!plane) return;
      const worldAngle = -i * step - rotation;
      const t = THREE.MathUtils.clamp(1 - Math.abs(worldAngle) / step, 0, 1);
      const scale = 0.88 + 0.12 * t;
      easing.damp3(plane.scale, [scale, scale, 1], 0.2, delta);
      const mesh = plane.children[0] as THREE.Mesh;
      const material = mesh?.material as THREE.MeshBasicMaterial;
      if (material) material.color.setScalar(0.45 + 0.55 * t);
    });
  });

  return (
    <group ref={groupRef}>
      {projects.map((project, i) => (
        <group
          key={project.id}
          ref={(el) => (planeRefs.current[i] = el)}
          position={[0, -radius * Math.sin(i * step), radius * Math.cos(i * step)]}
          rotation={[i * step, 0, 0]}
        >
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              openProject(i);
            }}
          >
            <planeGeometry args={[planeW, planeH]} />
            <meshBasicMaterial map={textures[i]} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

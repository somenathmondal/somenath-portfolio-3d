import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { easing } from "maath";
import { projects } from "../data/projects";
import { usePortfolio } from "../lib/stores/usePortfolio";
import auroraVert from "../shaders/aurora.vert";
import auroraFrag from "../shaders/aurora.frag";

const THEME_BG = { light: "#FAF6F0", dark: "#09090b" };

export default function Aurora({ enabled }: { enabled: () => boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const accentColors = useMemo(() => projects.map((p) => new THREE.Color(p.accent)), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(projects[0].accent) },
      uBase: { value: new THREE.Color(THEME_BG.light) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIsDark: { value: 0 },
    }),
    []
  );

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const on = enabled();
    meshRef.current.visible = on;
    if (!on) return;

    const { theme, activeProject } = usePortfolio.getState();
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uIsDark.value = theme === "dark" ? 1 : 0;
    uniforms.uBase.value.set(THEME_BG[theme]);
    easing.dampC(uniforms.uAccent.value, accentColors[activeProject], 0.5, delta);
    easing.damp2(uniforms.uMouse.value, state.pointer, 0.25, delta);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -7]}>
      <planeGeometry args={[44, 22]} />
      <shaderMaterial vertexShader={auroraVert} fragmentShader={auroraFrag} uniforms={uniforms} depthWrite={false} />
    </mesh>
  );
}

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { easing } from "maath";
import { projects } from "../data/projects";
import { usePortfolio } from "../lib/stores/usePortfolio";

const COUNT = 300;
const BOUNDS = { x: 7, y: 4.5, zMin: -2, zMax: 2.5 };

export default function Dust({ enabled }: { enabled: () => boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const { viewport } = useThree();
  const accentColors = useMemo(() => projects.map((p) => new THREE.Color(p.accent)), []);
  const cursorWorld = useMemo(() => new THREE.Vector3(), []);

  const { positions, drift } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const drift = new Float32Array(COUNT * 2); // upward speed + horizontal wander phase
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * BOUNDS.x;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * BOUNDS.y;
      positions[i * 3 + 2] = BOUNDS.zMin + Math.random() * (BOUNDS.zMax - BOUNDS.zMin);
      drift[i * 2] = 0.08 + Math.random() * 0.22;
      drift[i * 2 + 1] = Math.random() * Math.PI * 2;
    }
    return { positions, drift };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !materialRef.current) return;
    const on = enabled();
    pointsRef.current.visible = on;
    if (!on) return;

    const { activeProject, cursorRadius } = usePortfolio.getState();
    easing.dampC(materialRef.current.color, accentColors[activeProject], 0.5, delta);

    cursorWorld.set(
      (state.pointer.x * viewport.width) / 2,
      (state.pointer.y * viewport.height) / 2,
      0
    );
    // The DOM bubble cursor's radius (px) mapped roughly into world units
    const repelRadius = Math.max(1.0, (cursorRadius / window.innerHeight) * viewport.height * 2);

    const attr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < COUNT; i++) {
      let x = arr[i * 3];
      let y = arr[i * 3 + 1];
      const z = arr[i * 3 + 2];

      y += drift[i * 2] * delta;
      x += Math.sin(t * 0.4 + drift[i * 2 + 1]) * 0.06 * delta;

      // Repelled by the cursor bubble (only meaningful near the z=0 plane)
      const dx = x - cursorWorld.x;
      const dy = y - cursorWorld.y;
      const distSq = dx * dx + dy * dy + z * z * 0.5;
      if (distSq < repelRadius * repelRadius && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const push = ((repelRadius - dist) / repelRadius) * 1.6 * delta;
        x += (dx / dist) * push;
        y += (dy / dist) * push;
      }

      if (y > BOUNDS.y) y = -BOUNDS.y;
      if (x > BOUNDS.x) x = -BOUNDS.x;
      if (x < -BOUNDS.x) x = BOUNDS.x;

      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}

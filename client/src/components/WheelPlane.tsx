import { useMemo, useRef } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { easing } from "maath";
import { projects } from "../data/projects";
import { ensureAudio } from "../lib/sound";
import wheelVert from "../shaders/wheelPlane.vert";
import wheelFrag from "../shaders/wheelPlane.frag";

const PLANE_ASPECT = 16 / 10;

/** Mutable per-frame state shared between a wheel parent and its planes */
export interface WheelShared {
  rotation: number;
  bend: number;
}

export interface WheelEffects {
  ripple: boolean;
  bend: boolean;
  dissolve: boolean;
  poke: boolean;
  shockwave: boolean;
}

function coverFitUniforms(texture: THREE.Texture): { scale: THREE.Vector2; offset: THREE.Vector2 } {
  const img = texture.image as { width: number; height: number };
  const scale = new THREE.Vector2(1, 1);
  const offset = new THREE.Vector2(0, 0);
  if (img?.width) {
    const imageAspect = img.width / img.height;
    if (imageAspect > PLANE_ASPECT) {
      scale.x = PLANE_ASPECT / imageAspect;
      offset.x = (1 - scale.x) / 2;
    } else {
      scale.y = imageAspect / PLANE_ASPECT;
      offset.y = (1 - scale.y) / 2;
    }
  }
  return { scale, offset };
}

interface WheelPlaneProps {
  index: number;
  texture: THREE.Texture;
  shared: WheelShared;
  step: number;
  radius: number;
  planeW: number;
  planeH: number;
  onActivate: (index: number) => void;
  getEffects: () => WheelEffects;
}

export default function WheelPlane({
  index,
  texture,
  shared,
  step,
  radius,
  planeW,
  planeH,
  onActivate,
  getEffects,
}: WheelPlaneProps) {
  const slotRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Pointer/effect targets, damped toward in the frame loop
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5));
  const activeTarget = useRef(0);
  const shockStart = useRef(-1);
  const poke = useRef({ rx: 0, ry: 0, vrx: 0, vry: 0 });
  const lastUv = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(() => {
    const { scale, offset } = coverFitUniforms(texture);
    return {
      uMap: { value: texture },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseActive: { value: 0 },
      uRipple: { value: 0 },
      uBend: { value: 0 },
      uShock: { value: 0 },
      uShockCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uSize: { value: new THREE.Vector2(planeW, planeH) },
      uBrightness: { value: 1 },
      uDevelop: { value: 1 },
      uDissolve: { value: 0 },
      uAccent: { value: new THREE.Color(projects[index].accent) },
      uUvScale: { value: scale },
      uUvOffset: { value: offset },
    };
  }, [texture, planeW, planeH, index]);

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    if (!e.uv) return;
    mouseTarget.current.copy(e.uv);
    activeTarget.current = 1;
    if (getEffects().poke) {
      // Gentle impulse proportional to how fast the pointer sweeps the surface
      poke.current.vry += (e.uv.x - lastUv.current.x) * 0.35;
      poke.current.vrx += (e.uv.y - lastUv.current.y) * 0.35;
    }
    lastUv.current.copy(e.uv);
  };

  const handleDown = (e: ThreeEvent<PointerEvent>) => {
    ensureAudio();
    if (getEffects().shockwave && e.uv) {
      uniforms.uShockCenter.value.copy(e.uv);
      shockStart.current = performance.now();
    }
  };

  useFrame((state, delta) => {
    if (!slotRef.current || !meshRef.current) return;
    const effects = getEffects();
    const u = uniforms;

    u.uTime.value = state.clock.elapsedTime;
    u.uRipple.value = effects.ripple ? 1 : 0;
    u.uDissolve.value = effects.dissolve ? 1 : 0;
    u.uBend.value = effects.bend ? shared.bend : 0;

    easing.damp2(u.uMouse.value, mouseTarget.current, 0.08, delta);
    easing.damp(u.uMouseActive, "value", activeTarget.current, 0.15, delta);

    // Shockwave progress: 0 → 1 over 0.9s, then idle
    if (shockStart.current >= 0) {
      const progress = (performance.now() - shockStart.current) / 900;
      u.uShock.value = progress >= 1 ? 0 : progress;
      if (progress >= 1) shockStart.current = -1;
    }

    // Slot emphasis from the wheel's current rotation
    const worldAngle = -index * step - shared.rotation;
    const t = THREE.MathUtils.clamp(1 - Math.abs(worldAngle) / step, 0, 1);
    const scale = 0.88 + 0.12 * t;
    easing.damp3(slotRef.current.scale, [scale, scale, 1], 0.2, delta);
    u.uBrightness.value = effects.dissolve ? 0.75 + 0.25 * t : 0.45 + 0.55 * t;
    easing.damp(u.uDevelop, "value", t, 0.18, delta);

    // Poke springs — soft nudge, snappy settle
    const p = poke.current;
    if (effects.poke) {
      p.vrx += -p.rx * 6 * delta * 60 * 0.016;
      p.vry += -p.ry * 6 * delta * 60 * 0.016;
      p.vrx *= 0.85;
      p.vry *= 0.85;
      p.rx += p.vrx;
      p.ry += p.vry;
    } else {
      p.rx = THREE.MathUtils.lerp(p.rx, 0, 0.1);
      p.ry = THREE.MathUtils.lerp(p.ry, 0, 0.1);
      p.vrx = 0;
      p.vry = 0;
    }
    meshRef.current.rotation.x = THREE.MathUtils.clamp(p.rx, -0.18, 0.18);
    meshRef.current.rotation.y = THREE.MathUtils.clamp(p.ry, -0.18, 0.18);
  });

  return (
    <group
      ref={slotRef}
      position={[0, -radius * Math.sin(index * step), radius * Math.cos(index * step)]}
      rotation={[index * step, 0, 0]}
    >
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onActivate(index);
        }}
        onPointerMove={handleMove}
        onPointerDown={handleDown}
        onPointerLeave={() => (activeTarget.current = 0)}
      >
        <planeGeometry args={[planeW, planeH, 64, 40]} />
        <shaderMaterial vertexShader={wheelVert} fragmentShader={wheelFrag} uniforms={uniforms} />
      </mesh>
    </group>
  );
}

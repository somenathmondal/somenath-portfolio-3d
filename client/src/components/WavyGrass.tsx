import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePortfolio } from "../lib/stores/usePortfolio";
import vertexShader from "../shaders/grass.vert";
import fragmentShader from "../shaders/grass.frag";

interface WavyGrassProps {
  scrollOffset?: number;
}

export default function WavyGrass({ scrollOffset = 0 }: WavyGrassProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { theme, influenceRadius } = usePortfolio();
  const { viewport } = useThree();
  const isMobile = viewport.width < 7;

  // Render 8,000 blades on desktop, 1,200 on mobile for optimal performance
  const instanceCount = isMobile ? 1200 : 8000;

  // Custom colors for grass blades based on the portfolio theme
  const themeColors = useMemo(() => {
    if (theme === "dark") {
      return {
        base: new THREE.Color("#0c150c"), // Deep forest shadow base
        tip: new THREE.Color("#c89b3c"),  // Sophisticated dry amber/copper-gold tip (matching RedSands vibe)
        windSpeed: 1.4
      };
    } else {
      return {
        base: new THREE.Color("#052e16"), // Lush rich emerald base
        tip: new THREE.Color("#86efac"),  // Bright sunny fresh mint-green tip
        windSpeed: 1.8
      };
    }
  }, [theme]);

  // Initializing instanced matrices and positions
  const instancedData = useMemo(() => {
    const tempObject = new THREE.Object3D();
    const matrices = [];

    // Distribute grass randomly across a rectangular lawn patch
    const width = isMobile ? 12 : 24;
    const depth = isMobile ? 6 : 10;

    for (let i = 0; i < instanceCount; i++) {
      // Uniform random coordinates with center focus
      const x = (Math.random() - 0.5) * width;
      const z = (Math.random() - 0.5) * depth - 1.5; // Offset slightly back
      
      // Keep grass height organic
      const heightScale = 0.5 + Math.random() * 0.6;
      const widthScale = 0.6 + Math.random() * 0.6;

      tempObject.position.set(x, 0, z);
      // Random heading rotation
      tempObject.rotation.set(
        (Math.random() - 0.5) * 0.25, // Slight pitch lean
        Math.random() * Math.PI,     // 360 yaw rotation
        (Math.random() - 0.5) * 0.25  // Slight roll lean
      );
      tempObject.scale.set(widthScale, heightScale, 1.0);
      tempObject.updateMatrix();
      
      matrices.push(tempObject.matrix.clone());
    }
    return matrices;
  }, [instanceCount, isMobile]);

  // Apply instanced matrices on mount or count change
  useEffect(() => {
    if (meshRef.current) {
      instancedData.forEach((matrix, index) => {
        meshRef.current!.setMatrixAt(index, matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [instancedData]);

  // Shaders uniforms
  const uniforms = useMemo(() => {
    return {
      time: { value: 0 },
      windSpeed: { value: themeColors.windSpeed },
      baseColor: { value: themeColors.base },
      tipColor: { value: themeColors.tip },
      uMousePosition: { value: new THREE.Vector3(-999, -999, -999) },
      uInfluenceRadius: { value: influenceRadius }
    };
  }, []);

  // Sync influence radius from Zustand store Tweakpane folder
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uInfluenceRadius.value = influenceRadius;
    }
  }, [influenceRadius]);

  // Sync colors when theme changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.baseColor.value = themeColors.base;
      materialRef.current.uniforms.tipColor.value = themeColors.tip;
      materialRef.current.uniforms.windSpeed.value = themeColors.windSpeed;
    }
  }, [themeColors]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = time;

      // Project mouse into 3D world space coordinate
      const mouseWorld = new THREE.Vector3(
        (state.mouse.x * state.viewport.width) / 2,
        (state.mouse.y * state.viewport.height) / 2,
        0
      );

      // Convert world position into local coordinate space of the instanced mesh
      const localMouse = new THREE.Vector3().copy(mouseWorld);
      if (meshRef.current) {
        meshRef.current.worldToLocal(localMouse);
      }

      // Sync mouse coordinates to the vertex shader uniform
      materialRef.current.uniforms.uMousePosition.value.copy(localMouse);
    }

    if (meshRef.current) {
      // Smoothly slide grass downwards on page scroll, matching the water animation
      meshRef.current.position.y = (isMobile ? -2.2 : -2.5) - scrollOffset * 4.0;
      // Gentle shift in alignment
      meshRef.current.position.z = -1.0 - scrollOffset * 2.0;
    }
  });

  // Tapered plane geometry representing a single blade of grass
  // Using 1 width segment and 4 vertical segments to allow beautiful bending
  const grassGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.08, 0.8, 1, 4);
    // Align blade origin to the base (y=0) instead of center, making rotation/scaling natural
    geo.translate(0, 0.4, 0);
    return geo;
  }, []);

  return (
    <instancedMesh
      ref={meshRef}
      args={[grassGeometry, null as any, instanceCount]}
      position={[0, isMobile ? -2.2 : -2.5, -1.0]}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide} // Grass is double-sided so blades look solid from all angles
      />
    </instancedMesh>
  );
}

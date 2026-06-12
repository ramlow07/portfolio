import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import Flame from './Flame';
import type { Quality } from '../../hooks/useEnable3D';

const PRESETS: Record<Quality, {
  dpr: [number, number];
  resolution: number;
  samples: number;
  envResolution: number;
}> = {
  high: { dpr: [1, 1.75], resolution: 512, samples: 10, envResolution: 256 },
  low: { dpr: [1, 1.5], resolution: 256, samples: 4, envResolution: 128 },
};

/**
 * Faceted glass gem: slow idle rotation, eases toward the pointer, scales in
 * on mount. Neutral crystal — its warmth comes from a real animated flame
 * reflected in the highlights (rendered into the environment map), not a tint.
 */
function Gem({ resolution, samples }: { resolution: number; samples: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const intro = useRef(0);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;

    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05;
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05;

    intro.current = Math.min(1, intro.current + delta * 0.9);
    const s = easeOutCubic(intro.current);
    m.scale.set(s, s, s);

    m.rotation.y += delta * 0.2;
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, pointer.current.y * 0.4, 0.1);
    m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, -pointer.current.x * 0.25, 0.1);

    m.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
  });

  return (
    <mesh ref={mesh} scale={0}>
      {/* detail 1 + flat shading => many facets that scintillate as it turns */}
      <icosahedronGeometry args={[1.25, 1]} />
      <MeshTransmissionMaterial
        flatShading
        samples={samples}
        resolution={resolution}
        thickness={0.5}
        roughness={0.02}
        chromaticAberration={0.16}
        distortion={0.04}
        distortionScale={0.2}
        temporalDistortion={0.04}
        ior={1.34}
        color="#ffffff"
        attenuationColor="#fff1e6"
        attenuationDistance={8}
      />
      {/* crisp edge lines tracing the facet structure */}
      <Edges threshold={12} color="#ffffff" />
    </mesh>
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

const GlassMonolith = ({ quality = 'high' }: { quality?: Quality }) => {
  const preset = PRESETS[quality];
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 38 }}
      dpr={preset.dpr}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} />

      <Gem resolution={preset.resolution} samples={preset.samples} />

      {/* frames=Infinity re-renders the env each frame so the animated flame
          inside it shows up as a live, flickering reflection on the glass */}
      <Environment resolution={preset.envResolution} frames={Infinity} environmentIntensity={1.3}>
        {/* neutral surround for crisp cut-glass facets (eased so flame reads) */}
        <Lightformer form="rect" intensity={6} position={[0, 6, 2]} scale={[10, 6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[0, -6, 2]} scale={[10, 5, 1]} color="#eef1f4" />
        <Lightformer form="rect" intensity={5} position={[-7, 1, 2]} scale={[3, 10, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={4} position={[7, 0, 2]} scale={[3, 10, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.5} position={[0, 0, 7]} scale={[10, 10, 1]} color="#dfe3e8" />

        {/* real flames — only ever seen as reflections; two of them so the
            warm light wraps further around the gem as it spins */}
        <Flame position={[-3.2, -1.4, 2.6]} rotation={[0, 0.5, 0]} scale={[4.4, 6]} intensity={2.8} />
        <Flame position={[3.4, -1.6, 1.5]} rotation={[0, -0.7, 0]} scale={[3.6, 5]} intensity={2.2} />
      </Environment>
    </Canvas>
  );
};

export default GlassMonolith;

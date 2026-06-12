import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Refractive glass object: slow idle rotation, eases toward the pointer,
 * and scales in on mount. Self-contained lighting via Lightformers so there's
 * no external HDRI fetch.
 */
function Monolith() {
  const mesh = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const intro = useRef(0);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;

    // ease pointer target (state.pointer is -1..1)
    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05;
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05;

    // scale-in intro
    intro.current = Math.min(1, intro.current + delta * 0.9);
    const s = 1.15 * easeOutCubic(intro.current);
    m.scale.set(s, s, s);

    // idle spin + pointer tilt
    m.rotation.y += delta * 0.18;
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, pointer.current.y * 0.4, 0.1);
    m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, -pointer.current.x * 0.25, 0.1);

    // gentle float
    m.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
  });

  return (
    <mesh ref={mesh} scale={0}>
      <icosahedronGeometry args={[1.25, 0]} />
      <MeshTransmissionMaterial
        samples={8}
        resolution={512}
        thickness={1.1}
        roughness={0.04}
        chromaticAberration={0.18}
        distortion={0.08}
        distortionScale={0.25}
        temporalDistortion={0.05}
        ior={1.45}
        color="#ffffff"
        attenuationColor="#ff5a36"
        attenuationDistance={3.2}
      />
    </mesh>
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

const GlassMonolith = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 38 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 5]} intensity={1} />
      {/* single subtle flame accent from below-left */}
      <pointLight position={[-4, -3, -2]} intensity={12} color="#ff5a36" distance={14} />

      <Monolith />

      {/* Self-contained studio environment: neutral key + fill, one warm edge */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={4}
          position={[3, 4, 4]}
          scale={[7, 7, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[-5, 1, 2]}
          scale={[4, 8, 1]}
          color="#cfd2d6"
        />
        <Lightformer
          form="circle"
          intensity={2.2}
          position={[-3, -3, 1]}
          scale={[2.5, 2.5, 1]}
          color="#ff6a3d"
        />
      </Environment>
    </Canvas>
  );
};

export default GlassMonolith;

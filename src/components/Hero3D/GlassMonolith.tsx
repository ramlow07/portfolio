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
        samples={6}
        resolution={512}
        thickness={1.4}
        roughness={0.06}
        anisotropy={0.6}
        chromaticAberration={0.5}
        distortion={0.2}
        distortionScale={0.4}
        temporalDistortion={0.1}
        ior={1.4}
        color="#f2ede3"
        attenuationColor="#ff7a45"
        attenuationDistance={2.4}
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
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      {/* flame rim light */}
      <pointLight position={[-4, -2, -3]} intensity={30} color="#ff4a2b" distance={12} />

      <Monolith />

      {/* Self-contained studio environment for crisp glass reflections */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={3}
          position={[3, 3, 4]}
          scale={[6, 6, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="circle"
          intensity={2}
          position={[-4, -1, 2]}
          scale={[3, 3, 1]}
          color="#ff7a45"
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[0, -4, 3]}
          scale={[8, 2, 1]}
          color="#aab0ff"
        />
      </Environment>
    </Canvas>
  );
};

export default GlassMonolith;

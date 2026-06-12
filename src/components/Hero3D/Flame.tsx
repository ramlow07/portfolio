import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A procedural animated flame on a plane. It's meant to be dropped *inside*
 * <Environment> so the glass reflects a living, flickering fire in its
 * highlights — rather than us just tinting the material orange.
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uColorLow;
  uniform vec3 uColorMid;
  uniform vec3 uColorHigh;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float x = uv.x - 0.5;

    // turbulent field rising over time
    float n = fbm(vec2(uv.x * 3.0, uv.y * 3.5 - uTime * 1.6));
    float flick = fbm(vec2(uv.x * 6.0 + 10.0, uv.y * 6.0 - uTime * 2.4));

    // flame silhouette: wide at base, tapering up, wavering with noise
    float width = (0.42 - uv.y * 0.34) * (0.8 + 0.4 * flick);
    float body = smoothstep(width, 0.0, abs(x + (n - 0.5) * 0.25));
    float vertical = smoothstep(0.0, 0.12, uv.y) * smoothstep(1.0, 0.45, uv.y);

    float flame = clamp(body * vertical * (0.5 + n), 0.0, 1.0);
    flame = pow(flame, 1.4);

    vec3 col = mix(uColorLow, uColorMid, smoothstep(0.15, 0.55, flame));
    col = mix(col, uColorHigh, smoothstep(0.55, 0.9, flame));

    gl_FragColor = vec4(col * flame, flame);
  }
`;

interface FlameProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number] | number;
  intensity?: number;
}

const Flame = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  intensity = 1,
}: FlameProps) => {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      // warm fire ramp: deep ember -> flame -> near-white tip
      uColorLow: { value: new THREE.Color('#8a1500').multiplyScalar(intensity) },
      uColorMid: { value: new THREE.Color('#ff4a1a').multiplyScalar(intensity) },
      uColorHigh: { value: new THREE.Color('#ffd27a').multiplyScalar(intensity) },
    }),
    [intensity]
  );

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  const s: [number, number] = typeof scale === 'number' ? [scale, scale] : scale;

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[s[0], s[1]]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default Flame;

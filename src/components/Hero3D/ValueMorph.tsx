import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ScrollTrigger } from '../../lib/gsap';
import type { Quality } from '../../hooks/useEnable3D';

const PRESETS: Record<Quality, { count: number; nodes: number; dpr: [number, number] }> = {
  high: { count: 2600, nodes: 12, dpr: [1, 1.75] },
  low: { count: 1100, nodes: 9, dpr: [1, 1.4] },
};

/* ---------- geometry generators ---------- */

// Particles arranged as a coin: two faces + a rim.
function makeCoin(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  const R = 1.35;
  const T = 0.16;
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    if (Math.random() < 0.16) {
      // rim
      arr[i * 3] = Math.cos(ang) * R;
      arr[i * 3 + 1] = Math.sin(ang) * R;
      arr[i * 3 + 2] = (Math.random() * 2 - 1) * T;
    } else {
      const r = R * Math.sqrt(Math.random());
      const side = Math.random() < 0.5 ? 1 : -1;
      arr[i * 3] = Math.cos(ang) * r;
      arr[i * 3 + 1] = Math.sin(ang) * r;
      arr[i * 3 + 2] = side * T + (Math.random() * 2 - 1) * 0.012;
    }
  }
  return arr;
}

// Node centres spread on a sphere (fibonacci) + jitter.
function makeNodes(n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const off = 2 / n;
  const inc = Math.PI * (3 - Math.sqrt(5));
  const Rn = 1.6;
  for (let i = 0; i < n; i++) {
    const y = i * off - 1 + off / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * inc;
    pts.push(
      new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r)
        .multiplyScalar(Rn)
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.35,
            (Math.random() - 0.5) * 0.35,
            (Math.random() - 0.5) * 0.35
          )
        )
    );
  }
  return pts;
}

// Particles clustered around the nodes (the network state).
function makeNet(count: number, nodes: THREE.Vector3[]): Float32Array {
  const arr = new Float32Array(count * 3);
  const rr = 0.14;
  for (let i = 0; i < count; i++) {
    const n = nodes[i % nodes.length];
    arr[i * 3] = n.x + (Math.random() * 2 - 1) * rr;
    arr[i * 3 + 1] = n.y + (Math.random() * 2 - 1) * rr;
    arr[i * 3 + 2] = n.z + (Math.random() * 2 - 1) * rr;
  }
  return arr;
}

// Connect each node to its 2 nearest neighbours.
function makeEdges(nodes: THREE.Vector3[]): [number, number][] {
  const seen = new Set<string>();
  const list: [number, number][] = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: a.distanceTo(b) }))
      .filter((o) => o.j !== i)
      .sort((x, y) => x.d - y.d);
    for (let k = 0; k < 2 && k < near.length; k++) {
      const j = near[k].j;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push([i, j]);
      }
    }
  });
  return list;
}

/* ---------- scene ---------- */

const pointVert = /* glsl */ `
  uniform float uMorph;
  uniform float uTime;
  uniform float uSize;
  uniform float uPR;
  attribute vec3 aNet;
  attribute float aRand;
  varying float vMix;
  void main() {
    vec3 p = mix(position, aNet, uMorph);
    vMix = uMorph;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float tw = 0.7 + 0.3 * sin(uTime * 2.0 + aRand * 6.2831);
    gl_PointSize = uSize * uPR * tw * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const pointFrag = /* glsl */ `
  uniform vec3 uColorCoin;
  uniform vec3 uColorNet;
  varying float vMix;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uColorCoin, uColorNet, vMix);
    gl_FragColor = vec4(col, a);
  }
`;

function Scene({ count, nodes: nodeCount }: { count: number; nodes: number }) {
  const group = useRef<THREE.Group>(null);
  const morph = useRef(0); // displayed
  const target = useRef(0); // scroll-driven
  const pointer = useRef({ x: 0, y: 0 });
  const intro = useRef(0);

  const { points, lineMat, pulses, pulseData, nodes, edges } = useMemo(() => {
    const coin = makeCoin(count);
    const nodes = makeNodes(nodeCount);
    const net = makeNet(count, nodes);
    const edges = makeEdges(nodes);

    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) rand[i] = Math.random();

    // points
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(coin, 3));
    geo.setAttribute('aNet', new THREE.BufferAttribute(net, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: pointVert,
      fragmentShader: pointFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uMorph: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 7 },
        uPR: { value: Math.min(window.devicePixelRatio, 2) },
        uColorCoin: { value: new THREE.Color('#ffcaa0') },
        uColorNet: { value: new THREE.Color('#ff5a2a') },
      },
    });
    const points = new THREE.Points(geo, mat);

    // shared material for the edge lines (geometry built in LinesFromMorph)
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#ff6a3d'),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // pulses (one travelling dot per edge)
    const pulsePos = new Float32Array(edges.length * 3);
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
    const pulseMat = new THREE.PointsMaterial({
      color: new THREE.Color('#ffd9a0'),
      size: 0.12,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const pulses = new THREE.Points(pulseGeo, pulseMat);
    const pulseData = edges.map(() => ({ phase: Math.random(), speed: 0.25 + Math.random() * 0.4 }));

    return { points, lineMat, pulses, pulseData, nodes, edges };
  }, [count, nodeCount]);

  // scroll → morph target
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: '#home',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        target.current = self.progress;
      },
    });
    return () => st.kill();
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // ease morph + intro scale
    morph.current += (target.current - morph.current) * 0.08;
    const m = morph.current;
    intro.current = Math.min(1, intro.current + delta * 0.9);
    const s = 1 - Math.pow(1 - intro.current, 3);

    const g = group.current;
    if (g) {
      g.scale.setScalar(s);
      // pointer ease + tilt
      pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05;
      pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05;
      // coin flips fast, network drifts slow
      g.rotation.y += delta * (0.55 * (1 - m) + 0.12 * m);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.current.y * 0.35, 0.08);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -pointer.current.x * 0.2, 0.08);
    }

    const pm = points.material as THREE.ShaderMaterial;
    pm.uniforms.uMorph.value = m;
    pm.uniforms.uTime.value = t;

    const net = Math.max(0, (m - 0.25) / 0.75); // 0 until coin starts opening
    lineMat.opacity = net * 0.3;

    const pulseMat = pulses.material as THREE.PointsMaterial;
    pulseMat.opacity = net;
    if (net > 0.001) {
      const pos = pulses.geometry.attributes.position as THREE.BufferAttribute;
      edges.forEach(([i, j], k) => {
        const a = nodes[i];
        const b = nodes[j];
        const tt = (t * pulseData[k].speed + pulseData[k].phase) % 1;
        pos.setXYZ(k, a.x + (b.x - a.x) * tt, a.y + (b.y - a.y) * tt, a.z + (b.z - a.z) * tt);
      });
      pos.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <primitive object={points} />
      <primitive object={pulses} />
      {/* lines rendered after so additive blends on top */}
      <LinesFromMorph nodes={nodes} edges={edges} lineMat={lineMat} />
    </group>
  );
}

// Static edge lines (geometry built once, opacity animated via shared material).
function LinesFromMorph({
  nodes,
  edges,
  lineMat,
}: {
  nodes: THREE.Vector3[];
  edges: [number, number][];
  lineMat: THREE.LineBasicMaterial;
}) {
  const geo = useMemo(() => {
    const pos = new Float32Array(edges.length * 2 * 3);
    edges.forEach(([i, j], k) => {
      const a = nodes[i];
      const b = nodes[j];
      pos.set([a.x, a.y, a.z, b.x, b.y, b.z], k * 6);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [nodes, edges]);
  return <lineSegments geometry={geo} material={lineMat} />;
}

const ValueMorph = ({ quality = 'high' }: { quality?: Quality }) => {
  const p = PRESETS[quality];
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 38 }} dpr={p.dpr} gl={{ alpha: true, antialias: true }}>
      <Scene count={p.count} nodes={p.nodes} />
    </Canvas>
  );
};

export default ValueMorph;

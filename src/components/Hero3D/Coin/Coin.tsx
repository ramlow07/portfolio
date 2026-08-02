/**
 * Coin — lazy hero centerpiece.
 *
 *   <Coin quality="high|low" finish="obsidian|bimetal|rose" edge="reeded|plain|lettered" />
 *
 * Transparent canvas (sits on the dark page, no panel), ACES tone mapping so the
 * mirror fields can clip to a crisp white flash while the body stays dark, and a
 * demand/never frameloop that parks the GPU when the hero scrolls away.
 *
 * Code-split: Hero.tsx imports this via React.lazy, so three + drei +
 * postprocessing stay out of the main bundle.
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA, TIERS, type EdgeStyle, type Finish, type Quality } from './coin-config';
import { CoinMesh } from './CoinMesh';
import { Lighting } from './Lighting';
import { Effects } from './Effects';

export interface CoinProps {
  quality?: Quality;
  finish?: Finish;
  edge?: EdgeStyle;
}

export default function Coin({ quality = 'high', finish = 'obsidian', edge = 'reeded' }: CoinProps) {
  const tier = TIERS[quality];
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Pause rendering when the hero is offscreen (battery + CPU).
  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.01,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="coin-canvas">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={tier.dpr}
        gl={{ alpha: true, antialias: !tier.postFX, powerPreference: 'high-performance' }}
        camera={{ fov: CAMERA.fov, position: CAMERA.position }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = CAMERA.exposure;
        }}
      >
        <Suspense fallback={null}>
          <Lighting quality={quality} />
          <CoinMesh quality={quality} finish={finish} edge={edge} />
          {tier.postFX && <Effects />}
        </Suspense>
      </Canvas>
    </div>
  );
}

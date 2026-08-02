/**
 * Coin — post FX. Tuned subtle (premium, not blown out).
 *
 * Bloom carries the proof sparkle: a low luminance threshold means only the
 * brightest field-flash and edge-shimmer bloom. SMAA keeps the reeding clean.
 * A faint vignette focuses attention.
 *
 * NOTE: SSAO is intentionally omitted — on a transparent, single-object canvas
 * it fringes the silhouette, and the relief/denticle/reed AO is already baked
 * into the cameo roughness + normal maps (coin-textures.ts).
 */

import { EffectComposer, Bloom, SMAA, Vignette } from '@react-three/postprocessing';
import { BLOOM, VIGNETTE } from './coin-config';

export function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        intensity={BLOOM.intensity}
        luminanceThreshold={BLOOM.luminanceThreshold}
        luminanceSmoothing={BLOOM.luminanceSmoothing}
        radius={BLOOM.radius}
      />
      <SMAA />
      <Vignette offset={VIGNETTE.offset} darkness={VIGNETTE.darkness} eskil={false} />
    </EffectComposer>
  );
}

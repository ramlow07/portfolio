/**
 * Coin — self-contained studio (no external HDRI fetch).
 *
 * drei <Environment> Lightformer panels give the metal something real to
 * reflect: a neutral key (upper-left), a bright kicker (back-right) that ignites
 * the chamfer + reeds, a dim cool fill, and the brand FLAME — the only warm
 * source, appearing purely as reflected light rolling along the edge/rim.
 */

import { Environment, Lightformer, ContactShadows } from '@react-three/drei';
import { LIGHTS, type Quality } from './coin-config';

export function Lighting({ quality }: { quality: Quality }) {
  const L = LIGHTS;
  return (
    <>
      <Environment resolution={L.envResolution[quality]} frames={1}>
        {/* dark surround so the body stays rich and dark */}
        <color attach="background" args={['#06060a']} />

        {/* key — large soft, upper-left */}
        <Lightformer
          form="rect"
          intensity={L.key.intensity}
          color={L.key.color}
          position={L.key.position as [number, number, number]}
          scale={L.key.scale as [number, number, number]}
          target={[0, 0, 0]}
        />
        {/* rim / kicker — narrow bright, back-right */}
        <Lightformer
          form="rect"
          intensity={L.rim.intensity}
          color={L.rim.color}
          position={L.rim.position as [number, number, number]}
          scale={L.rim.scale as [number, number, number]}
          target={[0, 0, 0]}
        />
        {/* fill — dim cool, lower-front */}
        <Lightformer
          form="rect"
          intensity={L.fill.intensity}
          color={L.fill.color}
          position={L.fill.position as [number, number, number]}
          scale={L.fill.scale as [number, number, number]}
          target={[0, 0, 0]}
        />
        {/* flame — two stacked panels fake the ember gradient (lower-left) */}
        <Lightformer
          form="rect"
          intensity={L.flameLow.intensity}
          color={L.flameLow.color}
          position={L.flameLow.position as [number, number, number]}
          scale={L.flameLow.scale as [number, number, number]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={L.flameHigh.intensity}
          color={L.flameHigh.color}
          position={L.flameHigh.position as [number, number, number]}
          scale={L.flameHigh.scale as [number, number, number]}
          target={[0, 0, 0]}
        />
      </Environment>

      {/* real specular to reinforce the once-per-pass field flash */}
      <directionalLight position={L.keySpot.position} intensity={L.keySpot.intensity} color="#fff5ea" />

      {L.contactShadow.enabled && (
        <ContactShadows
          position={[0, L.contactShadow.y, 0]}
          opacity={L.contactShadow.opacity}
          blur={L.contactShadow.blur}
          scale={L.contactShadow.scale}
          far={L.contactShadow.far}
          color="#000000"
          frames={quality === 'high' ? Infinity : 1}
        />
      )}
    </>
  );
}

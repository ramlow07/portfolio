/**
 * Coin — mesh assembly + motion.
 *
 * Three meshes share three materials (one body, two faces) → minimal draw calls:
 *   • body  — revolved metal: rim, chamfer, reeded edge (geometry).
 *   • front — obverse disc carrying the cameo relief (LR monogram + legends).
 *   • back  — reverse disc (value-flow). Rotated π about Y so it reads upright,
 *             un-mirrored, when the idle spin brings it to the camera.
 *
 * Motion is rAF-driven (composed each frame) rather than GSAP-tweened so the
 * intro, idle, cursor-tilt, drag inertia and flip never fight each other.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import {
  FINISHES,
  GEOMETRY,
  MOTION,
  TIERS,
  type EdgeStyle,
  type Finish,
  type Quality,
} from './coin-config';
import { makeCoinBody, makeFaceDisc } from './coin-geometry';
import {
  createEdgeNormalMap,
  createFaceTextures,
  disposeFaceTextures,
  type FaceTextureSet,
} from './coin-textures';

interface Props {
  quality: Quality;
  finish: Finish;
  edge: EdgeStyle;
}

const TAU = Math.PI * 2;
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

export function CoinMesh({ quality, finish, edge }: Props) {
  const group = useRef<THREE.Group>(null);
  const { gl } = useThree();

  // Keep the canvas element in a ref so cursor changes mutate a ref (the
  // sanctioned mutable container) rather than a hook return value.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    canvasRef.current = gl.domElement;
  }, [gl]);
  const setCursor = (c: string) => {
    if (canvasRef.current) canvasRef.current.style.cursor = c;
  };

  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const allowTilt = useMemo(
    () => typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches,
    []
  );

  /* ---------------------------------------------------- geometry + materials */
  const built = useMemo(() => {
    const fin = FINISHES[finish];
    const tier = TIERS[quality];

    const body = makeCoinBody(quality, edge);
    const rings = tier.displacement ? GEOMETRY.faceRings.high : GEOMETRY.faceRings.low;
    const discGeo = makeFaceDisc(body.fieldRadius * 1.005, rings, GEOMETRY.faceSegments[quality]);

    const obverse = createFaceTextures('obverse', tier.texture, tier.displacement);
    const reverse = createFaceTextures('reverse', tier.texture, tier.displacement);

    const bodyColor = finish === 'bimetal' ? fin.outer ?? fin.body : fin.body;
    const faceColor = finish === 'bimetal' ? fin.inner ?? fin.body : fin.body;

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(bodyColor),
      metalness: 1,
      roughness: fin.rimRoughness,
      envMapIntensity: fin.envMapIntensity,
      clearcoat: fin.clearcoat,
      clearcoatRoughness: fin.clearcoatRoughness,
    });

    let edgeMap: THREE.CanvasTexture | undefined;
    if (edge === 'lettered') {
      edgeMap = createEdgeNormalMap();
      edgeMap.repeat.set(1, 1);
      bodyMat.normalMap = edgeMap;
      bodyMat.normalScale = new THREE.Vector2(0.6, 0.6);
    }

    const makeFaceMat = (t: FaceTextureSet) =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(faceColor),
        metalness: 1,
        roughness: 1, // actual roughness comes from the cameo map
        roughnessMap: t.roughnessMap,
        normalMap: t.normalMap,
        normalScale: new THREE.Vector2(1, 1),
        displacementMap: t.displacementMap ?? null,
        displacementScale: t.displacementMap ? 0.02 : 0,
        displacementBias: t.displacementMap ? -0.01 : 0,
        envMapIntensity: fin.envMapIntensity,
        clearcoat: fin.clearcoat,
        clearcoatRoughness: fin.clearcoatRoughness,
      });

    return {
      body,
      discGeo,
      obverse,
      reverse,
      bodyMat,
      edgeMap,
      frontMat: makeFaceMat(obverse),
      backMat: makeFaceMat(reverse),
    };
  }, [quality, edge, finish]);

  // dispose everything we created by hand
  useEffect(
    () => () => {
      built.body.geometry.dispose();
      built.discGeo.dispose();
      built.bodyMat.dispose();
      built.frontMat.dispose();
      built.backMat.dispose();
      built.edgeMap?.dispose();
      disposeFaceTextures(built.obverse);
      disposeFaceTextures(built.reverse);
    },
    [built]
  );

  /* ----------------------------------------------------------------- motion */
  const introT = useRef(0);
  const spin = useRef(0); // accumulated Y rotation
  const spinVel = useRef(0); // extra angular velocity from drag (decays)
  const flipTarget = useRef(0); // +π per tap; eased into the spin
  const flipOffset = useRef(0);
  const hover = useRef(0); // eased 0→1
  const hoverActive = useRef(false); // raw hover flag, read by the frame loop
  const tiltX = useRef(0);
  const tiltY = useRef(0);

  // drag state
  const dragging = useRef(false);
  const lastX = useRef(0);
  const moved = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      moved.current += Math.abs(dx);
      spin.current += dx * 0.005; // immediate feedback
      spinVel.current += dx * 0.0009 * MOTION.dragSensitivity; // built-up throw velocity
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setCursor(hoverActive.current ? 'grab' : 'auto');
      if (moved.current < 6) flipTarget.current += Math.PI; // a click → flip faces
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    dragging.current = true;
    lastX.current = e.nativeEvent.clientX;
    moved.current = 0;
    setCursor('grabbing');
  };

  useFrame((state, rawDelta) => {
    const m = group.current;
    if (!m) return;
    const delta = Math.min(rawDelta, 1 / 30); // clamp after a tab-switch stall
    const t = state.clock.elapsedTime;

    // Reduced motion → a still, dignified ¾ beauty pose.
    if (reduced) {
      m.rotation.set(MOTION.baseTilt, -0.5, 0);
      m.position.y = 0;
      return;
    }

    // 1) Coin-toss intro: upward parabola + decelerating X-flips → settle.
    if (introT.current < 1) {
      introT.current = Math.min(1, introT.current + delta / MOTION.introDuration);
      const e = easeOutQuart(introT.current);
      spin.current += (TAU / MOTION.spinPeriod) * delta;
      m.rotation.x =
        MOTION.baseTilt +
        (1 - e) * MOTION.introFlips * TAU +
        Math.sin(introT.current * Math.PI) * MOTION.introOvershoot * (1 - e);
      m.rotation.y = spin.current;
      m.rotation.z = 0;
      m.position.y = Math.sin(e * Math.PI) * MOTION.introRise;
      const s = 0.9 + 0.1 * e;
      m.scale.setScalar(s);
      return;
    }
    m.scale.setScalar(1);

    // 2) Idle spin (+ hover speed-up + drag inertia, decaying back to idle).
    const targetHover = hoverActive.current && !dragging.current ? 1 : 0;
    hover.current += (targetHover - hover.current) * 0.08;
    const spinRate = (TAU / MOTION.spinPeriod) * (1 + hover.current * (MOTION.hoverSpinScale - 1));
    spin.current += (spinRate + spinVel.current) * delta;
    spinVel.current *= Math.pow(MOTION.dragFriction, delta * 60);

    // tap-to-flip eased on top of the idle phase
    flipOffset.current += (flipTarget.current - flipOffset.current) * MOTION.flipEase;

    // 3) Nutation (precession) + gentle bob.
    const nutX = Math.sin((t * TAU) / MOTION.nutationPeriod) * MOTION.nutationAmp;
    const nutZ = Math.cos((t * TAU) / (MOTION.nutationPeriod * 0.8)) * MOTION.nutationAmp * 0.6;

    // 4) Cursor parallax (eased, springy), off on touch.
    if (allowTilt && !dragging.current) {
      tiltX.current += (-state.pointer.y * MOTION.tiltStrength - tiltX.current) * MOTION.tiltEase;
      tiltY.current += (state.pointer.x * MOTION.tiltStrength - tiltY.current) * MOTION.tiltEase;
    }

    m.rotation.x = MOTION.baseTilt + nutX + tiltX.current;
    m.rotation.y = spin.current + flipOffset.current + tiltY.current * 0.6;
    m.rotation.z = nutZ;
    m.position.y = Math.sin((t * TAU) / MOTION.bobPeriod) * MOTION.bobAmp;
  });

  const fieldZ = built.body.fieldZ + 0.0015;

  return (
    <group
      ref={group}
      rotation={[MOTION.baseTilt, 0, 0]}
      onPointerDown={onPointerDown}
      onPointerOver={() => {
        hoverActive.current = true;
        if (!dragging.current) setCursor('grab');
      }}
      onPointerOut={() => {
        hoverActive.current = false;
        if (!dragging.current) setCursor('auto');
      }}
    >
      <mesh geometry={built.body.geometry} material={built.bodyMat} />
      <mesh geometry={built.discGeo} material={built.frontMat} position={[0, 0, fieldZ]} />
      <mesh
        geometry={built.discGeo}
        material={built.backMat}
        position={[0, 0, -fieldZ]}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  );
}

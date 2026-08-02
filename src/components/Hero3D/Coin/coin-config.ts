/**
 * Coin — central tunables.
 *
 * Everything visual/temporal that you'd want to nudge while dialing in the look
 * lives here so the components stay structural. Units are scene units unless a
 * field says otherwise. Safe to edit at runtime via HMR.
 */

export type Quality = 'high' | 'low';
export type Finish = 'obsidian' | 'bimetal' | 'rose';
export type EdgeStyle = 'reeded' | 'plain' | 'lettered';

/* ------------------------------------------------------------------ camera */

export const CAMERA = {
  fov: 35,
  /** Pulled back so the tilted coin fills ~70% of the column height. */
  position: [0, 0, 5.6] as [number, number, number],
  /** ACES exposure — high enough that mirror fields can clip to a white flash. */
  exposure: 1.05,
};

/* --------------------------------------------------------------- geometry */
/**
 * Diameter : thickness ≈ 11:1 (chunky commemorative). radius 1.3 → Ø 2.6,
 * thickness 0.24. All radial bands are expressed as absolute radii so the
 * profile reads top-to-bottom in coin-geometry.ts.
 */
export const GEOMETRY = {
  radius: 1.3, // outer edge radius
  halfThickness: 0.12, // → 0.24 thick
  /** Raised rim occupies the outer band of each face. */
  rimWidth: 0.13, // radial width of the rim ring
  rimDepth: 0.022, // how far the fields sit *below* the rim top
  /** Chamfer where each face meets the edge (≈3–5% of thickness). */
  chamfer: 0.03,
  /** Real reeded geometry. */
  reedCount: 120,
  reedDepth: 0.012, // ridge amplitude
  /** Profile + revolution resolution per tier. */
  profileSteps: { high: 10, low: 6 }, // subdivisions per straight profile run
  radialSegments: { high: 512, low: 256 }, // around the circumference (≥4 / reed)
  /** Concentric rings in each face disc (needed for high-tier displacement). */
  faceRings: { high: 40, low: 1 },
  faceSegments: { high: 256, low: 96 },
} as const;

/* ----------------------------------------------------------------- finishes */

export interface FinishPreset {
  /** Base specular tint of the metal (metalness = 1, so this is the F0 colour). */
  body: string;
  /** Two-zone tint for the bimetal token (outer ring / inner disc). */
  outer?: string;
  inner?: string;
  /** Cameo roughness: mirror fields vs frosted devices vs satin rim. */
  fieldRoughness: number;
  deviceRoughness: number;
  rimRoughness: number;
  /** Protective-lacquer sheen for proof finishes. */
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
}

export const FINISHES: Record<Finish, FinishPreset> = {
  // Default — "obsidian-flame proof": dark blackened-steel PVD, warmth comes
  // only from the reflected flame light, never from the base tint.
  obsidian: {
    body: '#1b1714',
    fieldRoughness: 0.08,
    deviceRoughness: 0.45,
    rimRoughness: 0.2,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.2,
  },
  // "Fintech token" — cool steel ring around a desaturated bronze disc (€1/€2).
  bimetal: {
    body: '#c9ccd2',
    outer: '#c9ccd2',
    inner: '#b87333',
    fieldRoughness: 0.12,
    deviceRoughness: 0.42,
    rimRoughness: 0.22,
    clearcoat: 0.22,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.05,
  },
  // Restrained low-saturation rose-gold.
  rose: {
    body: '#caa18a',
    fieldRoughness: 0.1,
    deviceRoughness: 0.42,
    rimRoughness: 0.2,
    clearcoat: 0.25,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.1,
  },
};

/* ------------------------------------------------------------------- motion */

export const MOTION = {
  /** Idle: one slow full turn about Y. 12–16s reads as heavy. */
  spinPeriod: 14, // seconds / revolution
  hoverSpinScale: 1.5, // speed-up while hovered (eased)
  /** Nutation — a few degrees of axis precession, like a coin settling. */
  nutationAmp: 0.05, // radians
  nutationPeriod: 9, // seconds
  /** Gentle levitation. */
  bobAmp: 0.03,
  bobPeriod: 4,
  /** ¾ resting pose: tilt off face-on so face AND thickness read (≈20°). */
  baseTilt: 0.36, // radians
  /** Cursor parallax / magnetic tilt — disabled on touch. */
  tiltStrength: 0.14, // max radians toward pointer
  tiltEase: 0.07, // per-frame lerp factor
  /** Coin-toss intro. */
  introDuration: 1.7, // seconds
  introFlips: 4, // X-axis flips before settling
  introRise: 0.55, // peak height of the parabola
  introOvershoot: 0.12, // settle wobble (radians)
  /** Drag-to-spin inertia. */
  dragSensitivity: 4.2, // velocity per unit pointer delta
  dragFriction: 0.93, // per-frame decay back to idle
  /** Click/tap flip about X to reveal the other face. */
  flipEase: 0.12,
} as const;

/* ----------------------------------------------------------------- lighting */
/**
 * Self-contained studio: drei <Environment> Lightformer panels. The flame is
 * the ONLY warm source and appears purely as reflected light on the edge/rim.
 */
export const LIGHTS = {
  envResolution: { high: 512, low: 256 },
  key: { intensity: 2.4, color: '#fff6ec', position: [-3.2, 2.4, 2.2], scale: [5, 5, 1] }, // upper-left
  rim: { intensity: 3.4, color: '#ffffff', position: [3.0, 1.4, -2.4], scale: [1.4, 3.6, 1] }, // back-right kicker
  fill: { intensity: 0.45, color: '#9fb3d6', position: [0, -2.4, 2.6], scale: [5, 2.4, 1] }, // cool lower-front
  // Flame: two stacked panels fake the #ff5a2a → #ff7a45 ember gradient.
  flameLow: { intensity: 2.6, color: '#ff5a2a', position: [-2.4, -2.0, 1.2], scale: [3.2, 1.4, 1] },
  flameHigh: { intensity: 2.2, color: '#ff7a45', position: [-2.0, -0.8, 1.6], scale: [2.6, 1.2, 1] },
  /** Reinforce the field flash with a real specular highlight. */
  keySpot: { intensity: 1.6, position: [-4, 4, 4] as [number, number, number] },
  /** Soft grounded shadow for the floating-rest read (very subtle). */
  contactShadow: { enabled: true, opacity: 0.32, blur: 2.8, scale: 6, y: -1.55, far: 2.2 },
} as const;

/* ------------------------------------------------------------------- bloom */
/**
 * Subtle. Low threshold so only the brightest field-flash / edge-shimmer
 * blooms — this is what makes the proof finish sparkle. Don't overdo it.
 */
export const BLOOM = {
  intensity: 0.62,
  luminanceThreshold: 0.7,
  luminanceSmoothing: 0.22,
  radius: 0.62,
} as const;

export const VIGNETTE = { offset: 0.32, darkness: 0.42 } as const;

/* --------------------------------------------------------------- per-tier */

export const TIERS: Record<
  Quality,
  { dpr: [number, number]; texture: number; postFX: boolean; displacement: boolean }
> = {
  high: { dpr: [1, 2], texture: 2048, postFX: true, displacement: true },
  low: { dpr: [1, 1.5], texture: 1024, postFX: true, displacement: false },
};

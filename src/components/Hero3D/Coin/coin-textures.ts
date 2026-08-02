/**
 * Coin — procedural face textures (hybrid path C from the spec).
 *
 * Everything struck on the flat fields — the LR monogram, the curved legends,
 * the denticle ring, the value-flow reverse — is *drawn* to an offscreen canvas
 * as a grayscale height field, then converted to a tangent-space NORMAL map and
 * paired with a CAMEO ROUGHNESS map (mirror fields ≈0.08 vs frosted devices
 * ≈0.45). The silhouette-critical parts (rim, chamfer, reeded edge) are real
 * geometry — see coin-geometry.ts.
 *
 * ── HOW TO SWAP THE ARTWORK ───────────────────────────────────────────────
 *   The two `draw*Face` functions below are the only thing you touch. They
 *   receive a canvas context and a `Palette` (which channel value = "raised"
 *   vs "recessed", "mirror" vs "frosted"). Draw your design in BOTH palettes
 *   (height + roughness) by calling the shared shape helpers. Geometry, lights
 *   and motion are unaffected.
 * ──────────────────────────────────────────────────────────────────────────
 */

import * as THREE from 'three';
import type { Finish } from './coin-config';

export interface FaceTextureSet {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  displacementMap?: THREE.CanvasTexture;
}

/** Grayscale codes for the two passes. Height: 128 = field plane. */
interface Palette {
  field: number; // background plane
  rim: number; // faint inner bevel that seats against the geometry rim
  denticle: number;
  legend: number;
  device: number; // monogram / emblem strokes
  accent: number; // arrow / brightest relief
}

const HEIGHT: Palette = { field: 128, rim: 150, denticle: 206, legend: 192, device: 202, accent: 214 };
// 0..255 → roughness 0..1. Mirror fields dark, frosted devices bright = cameo.
const ROUGH: Palette = { field: 20, rim: 52, denticle: 92, legend: 116, device: 116, accent: 104 };

const g = (v: number) => `rgb(${v},${v},${v})`;

/* --------------------------------------------------------------- helpers */

function ctx2d(size: number): CanvasRenderingContext2D {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  return ctx;
}

/** Curved legend. Top text reads L→R along the top arc; bottom text upright. */
function drawArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  radius: number,
  centerAngle: number,
  o: { size: number; color: string; flip?: boolean; tracking?: number; weight?: number; mono?: boolean }
) {
  const { size, color, flip = false, tracking = 0, weight = 600, mono = false } = o;
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${weight} ${size}px ${mono ? "'Geist Mono', ui-monospace" : "Geist, system-ui"}, sans-serif`;
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width + tracking);
  const total = widths.reduce((s, w) => s + w / radius, 0);
  const step = flip ? -1 : 1;
  let ang = centerAngle - step * (total / 2);
  for (let i = 0; i < chars.length; i++) {
    const aw = widths[i] / radius;
    ang += step * (aw / 2);
    ctx.save();
    ctx.rotate(ang);
    ctx.translate(0, -radius);
    if (flip) ctx.rotate(Math.PI);
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
    ang += step * (aw / 2);
  }
  ctx.restore();
}

/** Ring of fine jewel-like teeth just inside the rim. */
function drawDenticles(
  ctx: CanvasRenderingContext2D,
  radius: number,
  count: number,
  color: string,
  tooth: number
) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    ctx.save();
    ctx.rotate((i / count) * Math.PI * 2);
    ctx.beginPath();
    ctx.roundRect(-tooth * 0.4, -radius - tooth * 0.6, tooth * 0.8, tooth * 1.2, tooth * 0.3);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/** Interlocking LR monogram — bold, geometric, frosted device. */
function drawMonogram(ctx: CanvasRenderingContext2D, R: number, p: Palette) {
  ctx.save();
  ctx.fillStyle = g(p.device);
  ctx.strokeStyle = g(p.device);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const u = R * 0.064; // stroke unit
  ctx.lineWidth = u * 2;

  // L — left stem + foot
  ctx.beginPath();
  ctx.moveTo(-R * 0.34, -R * 0.42);
  ctx.lineTo(-R * 0.34, R * 0.42);
  ctx.lineTo(-R * 0.02, R * 0.42);
  ctx.stroke();

  // R — stem, bowl, leg (interlocks over the L's upper stem)
  const rx = R * 0.04;
  ctx.beginPath();
  ctx.moveTo(rx, R * 0.42);
  ctx.lineTo(rx, -R * 0.42);
  ctx.lineTo(R * 0.2, -R * 0.42);
  ctx.quadraticCurveTo(R * 0.42, -R * 0.42, R * 0.42, -R * 0.14);
  ctx.quadraticCurveTo(R * 0.42, R * 0.04, R * 0.2, R * 0.04);
  ctx.lineTo(rx, R * 0.04);
  ctx.moveTo(R * 0.18, R * 0.02);
  ctx.lineTo(R * 0.42, R * 0.42);
  ctx.stroke();

  // thin struck frame — a thin hexagon to read as a mintmark/seal
  ctx.lineWidth = u * 0.55;
  ctx.strokeStyle = g(p.legend);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const rr = R * 0.62;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/** Reverse device — "moving money": nodes joined by arcs with a directional arrow. */
function drawValueFlow(ctx: CanvasRenderingContext2D, R: number, p: Palette) {
  ctx.save();
  const nodes: [number, number][] = [
    [-R * 0.46, R * 0.2],
    [-R * 0.16, -R * 0.34],
    [R * 0.22, -R * 0.06],
    [R * 0.46, R * 0.34],
    [-R * 0.04, R * 0.4],
  ];
  // connecting arcs
  ctx.strokeStyle = g(p.legend);
  ctx.lineWidth = R * 0.05;
  ctx.lineCap = 'round';
  const link = (a: number, b: number, bow: number) => {
    const [ax, ay] = nodes[a];
    const [bx, by] = nodes[b];
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const nx = -(by - ay);
    const ny = bx - ax;
    const len = Math.hypot(nx, ny) || 1;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(mx + (nx / len) * bow, my + (ny / len) * bow, bx, by);
    ctx.stroke();
  };
  link(0, 1, R * 0.16);
  link(1, 2, R * 0.12);
  link(2, 3, R * 0.16);
  link(0, 4, -R * 0.1);
  link(4, 2, -R * 0.14);

  // nodes
  ctx.fillStyle = g(p.device);
  nodes.forEach(([x, y], i) => {
    ctx.beginPath();
    ctx.arc(x, y, i === 2 ? R * 0.1 : R * 0.066, 0, Math.PI * 2);
    ctx.fill();
  });

  // directional arrow riding the central flow (the "money moving")
  ctx.fillStyle = g(p.accent);
  ctx.strokeStyle = g(p.accent);
  ctx.lineWidth = R * 0.055;
  ctx.beginPath();
  ctx.moveTo(-R * 0.12, R * 0.06);
  ctx.lineTo(R * 0.16, -R * 0.18);
  ctx.stroke();
  ctx.save();
  ctx.translate(R * 0.16, -R * 0.18);
  ctx.rotate(Math.atan2(-0.24, 0.28));
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-R * 0.12, -R * 0.06);
  ctx.lineTo(-R * 0.12, R * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/** Faint anisotropic brushing + micro-scratches baked into the field roughness. */
function drawBrushing(ctx: CanvasRenderingContext2D, R: number, rough: boolean) {
  if (!rough) return;
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = g(40);
  ctx.lineWidth = R * 0.004;
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(0, 0, R * (0.12 + 0.6 * ((i * 53) % 100) / 100), a, a + 1.1);
    ctx.stroke();
  }
  // a couple of stray hairline scratches
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 5; i++) {
    const a = (i * 1.7) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * R * 0.1, Math.sin(a) * R * 0.1);
    ctx.lineTo(Math.cos(a + 0.4) * R * 0.7, Math.sin(a + 0.4) * R * 0.7);
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------------------------------- per-face drawing */

function paintFace(
  ctx: CanvasRenderingContext2D,
  size: number,
  face: 'obverse' | 'reverse',
  p: Palette,
  rough: boolean
) {
  const S = size;
  const R = S * 0.5; // disc radius in px (UV-inscribed)
  ctx.fillStyle = g(p.field);
  ctx.fillRect(0, 0, S, S);
  ctx.save();
  ctx.translate(S / 2, S / 2);

  drawBrushing(ctx, R, rough);

  // faint bevel ring that blends the field into the geometry rim
  ctx.strokeStyle = g(p.rim);
  ctx.lineWidth = R * 0.03;
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.965, 0, Math.PI * 2);
  ctx.stroke();

  drawDenticles(ctx, R * 0.93, 96, g(p.denticle), R * 0.022);

  if (face === 'obverse') {
    drawArcText(ctx, 'LUAM RAMLOW', R * 0.82, 0, { size: R * 0.092, color: g(p.legend), tracking: R * 0.01, weight: 600 });
    drawArcText(ctx, 'FINTECH ENGINEER', R * 0.82, Math.PI, { size: R * 0.07, color: g(p.legend), flip: true, tracking: R * 0.012, weight: 500, mono: true });
    drawMonogram(ctx, R, p);
    // EST. 2021 + tiny LR mintmark
    drawArcText(ctx, 'EST · 2021', R * 0.5, Math.PI, { size: R * 0.05, color: g(p.legend), flip: true, tracking: R * 0.006, mono: true });
    ctx.fillStyle = g(p.denticle);
    ctx.font = `600 ${R * 0.04}px 'Geist Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('LR', R * 0.66, R * 0.5);
  } else {
    drawValueFlow(ctx, R, p);
    drawArcText(ctx, 'MOVES MONEY', R * 0.82, Math.PI, { size: R * 0.082, color: g(p.legend), flip: true, tracking: R * 0.014, weight: 600 });
    drawArcText(ctx, '· VALUE IN MOTION ·', R * 0.82, 0, { size: R * 0.06, color: g(p.legend), tracking: R * 0.006, mono: true });
    // serialized first-edition nod
    ctx.fillStyle = g(p.accent);
    ctx.font = `700 ${R * 0.07}px 'Geist Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('001', 0, R * 0.6);
  }

  ctx.restore();
}

/* --------------------------------------------------- height → normal map */

function heightToNormal(src: ImageData, strength: number): ImageData {
  const { width: w, height: h, data } = src;
  const out = new ImageData(w, h);
  const o = out.data;
  const sample = (x: number, y: number) => {
    const cx = x < 0 ? 0 : x >= w ? w - 1 : x;
    const cy = y < 0 ? 0 : y >= h ? h - 1 : y;
    return data[(cy * w + cx) * 4] / 255;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (sample(x - 1, y) - sample(x + 1, y)) * strength;
      const dy = (sample(x, y - 1) - sample(x, y + 1)) * strength;
      const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const i = (y * w + x) * 4;
      o[i] = (dx * inv * 0.5 + 0.5) * 255;
      o[i + 1] = (dy * inv * 0.5 + 0.5) * 255;
      o[i + 2] = inv * 255; // nz (already normalized → inv = nz)
      o[i + 3] = 255;
    }
  }
  return out;
}

function canvasTexture(canvas: HTMLCanvasElement, srgb = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return t;
}

function imageDataToCanvas(img: ImageData): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  c.getContext('2d')!.putImageData(img, 0, 0);
  return c;
}

/**
 * Build the normal + cameo-roughness (+ optional displacement) set for one face.
 */
export function createFaceTextures(
  face: 'obverse' | 'reverse',
  size: number,
  withDisplacement: boolean
): FaceTextureSet {
  // 1. height pass (crisp)
  const hCtx = ctx2d(size);
  paintFace(hCtx, size, face, HEIGHT, false);

  // 2. soften the height so relief sides ramp (no vertical cliffs)
  const blurR = Math.max(1, Math.round(size / 380));
  const bCtx = ctx2d(size);
  bCtx.filter = `blur(${blurR}px)`;
  bCtx.drawImage(hCtx.canvas, 0, 0);
  const blurred = bCtx.getImageData(0, 0, size, size);

  // 3. normal map from softened height
  const normalImg = heightToNormal(blurred, (size / 512) * 2.4);
  const normalMap = canvasTexture(imageDataToCanvas(normalImg));

  // 4. cameo roughness pass
  const rCtx = ctx2d(size);
  paintFace(rCtx, size, face, ROUGH, true);
  const roughnessMap = canvasTexture(rCtx.canvas);

  const set: FaceTextureSet = { normalMap, roughnessMap };
  if (withDisplacement) set.displacementMap = canvasTexture(bCtx.canvas);
  return set;
}

/* ------------------------------------------------ edge lettering (optional) */

/**
 * Incuse repeating edge legend for `edge="lettered"` — wrapped around a plain
 * edge band as a normal map. Not used by the default reeded hero coin.
 */
export function createEdgeNormalMap(text = '· MOVES MONEY · EST 2021 ', repeats = 4): THREE.CanvasTexture {
  const w = 2048;
  const h = 256;
  const ctx = ctx2d(w) as CanvasRenderingContext2D;
  ctx.canvas.height = h;
  ctx.fillStyle = g(150);
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = g(96); // incuse (recessed)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${h * 0.42}px 'Geist Mono', monospace`;
  const full = text.repeat(repeats);
  const seg = w / full.length;
  for (let i = 0; i < full.length; i++) ctx.fillText(full[i], seg * (i + 0.5), h / 2);
  const blurCtx = ctx2d(w);
  blurCtx.canvas.height = h;
  blurCtx.filter = 'blur(2px)';
  blurCtx.drawImage(ctx.canvas, 0, 0);
  const normalImg = heightToNormal(blurCtx.getImageData(0, 0, w, h), 2.2);
  const tex = canvasTexture(imageDataToCanvas(normalImg));
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/** dispose helper for a face set */
export function disposeFaceTextures(set: FaceTextureSet) {
  set.normalMap.dispose();
  set.roughnessMap.dispose();
  set.displacementMap?.dispose();
}

export type { Finish };

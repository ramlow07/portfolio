/**
 * Coin — real geometry for the silhouette-critical parts (spec §2.4 path C).
 *
 * The body is a hand-built surface of revolution around Z so the two faces look
 * at ±Z. The profile traces: recessed field → raised rim → chamfer → edge →
 * chamfer → raised rim → field. The EDGE rings get per-angle radius modulation
 * to mint ~120 real reeds (this is what scintillates on rotation). The flat
 * fields are then covered by face discs (coin-textures.ts) that carry the
 * struck relief + cameo roughness.
 */

import * as THREE from 'three';
import { GEOMETRY, type EdgeStyle, type Quality } from './coin-config';

interface ProfilePoint {
  r: number;
  z: number;
  reed: boolean;
}

/** Outline runs from front-centre, around the edge, to back-centre. */
function profileRuns() {
  const { radius: R, halfThickness: halfT, rimWidth, rimDepth, chamfer } = GEOMETRY;
  const fieldR = R - rimWidth;
  const fieldZ = halfT - rimDepth; // recessed field plane
  const rimTopZ = halfT; // highest flat plane
  const edgeTopZ = halfT - chamfer; // where chamfer meets the edge band
  const rimOuterR = R - chamfer;

  const P = (r: number, z: number, reed = false): ProfilePoint => ({ r, z, reed });
  return {
    fieldR,
    fieldZ,
    runs: [
      [P(0, fieldZ), P(fieldR, fieldZ)], // field cap (front)
      [P(fieldR, fieldZ), P(fieldR, rimTopZ)], // rim inner wall
      [P(fieldR, rimTopZ), P(rimOuterR, rimTopZ)], // rim top (bright ring)
      [P(rimOuterR, rimTopZ), P(R, edgeTopZ)], // chamfer
      [P(R, edgeTopZ, true), P(R, -edgeTopZ, true)], // EDGE band (reeded)
      [P(R, -edgeTopZ), P(rimOuterR, -rimTopZ)], // chamfer
      [P(rimOuterR, -rimTopZ), P(fieldR, -rimTopZ)], // rim top
      [P(fieldR, -rimTopZ), P(fieldR, -fieldZ)], // rim inner wall
      [P(fieldR, -fieldZ), P(0, -fieldZ)], // field cap (back)
    ] as [ProfilePoint, ProfilePoint][],
  };
}

export interface CoinBody {
  geometry: THREE.BufferGeometry;
  fieldRadius: number;
  fieldZ: number;
}

export function makeCoinBody(quality: Quality, edge: EdgeStyle): CoinBody {
  const { reedCount, reedDepth } = GEOMETRY;
  const seg = GEOMETRY.radialSegments[quality];
  const steps = GEOMETRY.profileSteps[quality];
  const reeded = edge === 'reeded';
  const { runs, fieldR, fieldZ } = profileRuns();

  // Flatten runs into a single profile polyline (dedupe shared endpoints).
  const profile: ProfilePoint[] = [];
  runs.forEach(([a, b], ri) => {
    const n = ri === 4 ? steps * 2 : steps; // a little denser down the edge
    for (let s = 0; s <= n; s++) {
      if (ri > 0 && s === 0) continue;
      const t = s / n;
      profile.push({
        r: a.r + (b.r - a.r) * t,
        z: a.z + (b.z - a.z) * t,
        reed: a.reed && b.reed,
      });
    }
  });

  const rings = profile.length;
  const stride = seg + 1;
  const positions = new Float32Array(rings * stride * 3);
  const uvs = new Float32Array(rings * stride * 2);

  for (let p = 0; p < rings; p++) {
    const pp = profile[p];
    for (let i = 0; i <= seg; i++) {
      const theta = (i / seg) * Math.PI * 2;
      // rounded reed ridges: radius wobbles ±reedDepth/2 around the band
      const rr = pp.reed && reeded ? pp.r + reedDepth * 0.5 * Math.cos(theta * reedCount) : pp.r;
      const vi = (p * stride + i) * 3;
      positions[vi] = Math.cos(theta) * rr;
      positions[vi + 1] = Math.sin(theta) * rr;
      positions[vi + 2] = pp.z;
      const ui = (p * stride + i) * 2;
      uvs[ui] = i / seg;
      uvs[ui + 1] = p / (rings - 1);
    }
  }

  const indices: number[] = [];
  for (let p = 0; p < rings - 1; p++) {
    for (let i = 0; i < seg; i++) {
      const a = p * stride + i;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b, b, c, d); // CCW → outward normals
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return { geometry, fieldRadius: fieldR, fieldZ };
}

/**
 * Ring-subdivided disc facing +Z, with planar UVs matching THREE.CircleGeometry
 * (so the canvas relief registers). Rings give interior tessellation for the
 * high-tier displacement map; low tier uses a single fan.
 */
export function makeFaceDisc(radius: number, rings: number, segments: number): THREE.BufferGeometry {
  const positions: number[] = [0, 0, 0];
  const uvs: number[] = [0.5, 0.5];
  const normals: number[] = [0, 0, 1];

  for (let ring = 1; ring <= rings; ring++) {
    const rr = (radius * ring) / rings;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * rr;
      const y = Math.sin(theta) * rr;
      positions.push(x, y, 0);
      uvs.push(x / (2 * radius) + 0.5, y / (2 * radius) + 0.5);
      normals.push(0, 0, 1);
    }
  }

  const indices: number[] = [];
  const ringStride = segments + 1;
  // inner fan (centre → first ring)
  for (let i = 0; i < segments; i++) {
    indices.push(0, 1 + i, 1 + i + 1);
  }
  // outer quads
  for (let ring = 1; ring < rings; ring++) {
    const base = 1 + (ring - 1) * ringStride;
    const next = base + ringStride;
    for (let i = 0; i < segments; i++) {
      const a = base + i;
      const b = a + 1;
      const c = next + i;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

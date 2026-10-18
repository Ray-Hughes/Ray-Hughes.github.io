import { ROAD, SHOPS, TOWERS, HOUSES, TREES, PASTELS, M, rng } from './kit';

/* ─────────────────────────────────────────────────────────────────────
   The plan of the town.

   A grid of road tiles one unit square. Roads run every fourth tile, which
   leaves 3×3 blocks between them, and each block is given a use. The
   landmarks (the buildings that open something) take a whole block each and
   are drawn by their own components; everything else here is scenery and
   gets baked into a few static meshes.
───────────────────────────────────────────────────────────────────── */

export const RX = [0, 4, 8, 12, 16, 20];
export const RZ = [0, 4, 8, 12, 16];
const NI = 21, NJ = 17;
const OX = 10, OZ = 8;

export const tileToWorld = (i, j) => [i - OX, j - OZ];

/** Centre of block (bi, bj) in world units. */
export const blockCenter = (bi, bj) => tileToWorld(RX[bi] + 2, RZ[bj] + 2);

// What stands on each block. Rows run north (back) to south (front, nearest
// the camera), so the projects district is the row people see first.
export const BLOCKS = [
  ['houses', 'university', 'downtown', 'downtown', 'houses'],
  ['park', 'shops', 'office', 'shops', 'theater'],
  ['home', 'plaza', 'shops', 'postoffice', 'shops'],
  ['park', 'delphi', 'hospital', 'memophor', 'yard'],
];

/** The railway: a rounded rectangle round the outside of the ring road. */
export const RAIL = { hx: 11.75, hz: 9.75, r: 1.6 };

/** Signed distance from the rail loop's centre line; |d| < half a track is on it. */
export function railDistance(x, z) {
  const qx = Math.abs(x) - RAIL.hx + RAIL.r, qz = Math.abs(z) - RAIL.hz + RAIL.r;
  return Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - RAIL.r;
}

export const LANDMARK_BLOCKS = ['university', 'office', 'theater', 'home', 'postoffice', 'delphi', 'hospital', 'memophor', 'yard'];

export function landmarkPositions() {
  const out = {};
  BLOCKS.forEach((row, bj) => row.forEach((kind, bi) => {
    if (LANDMARK_BLOCKS.includes(kind)) out[kind] = blockCenter(bi, bj);
  }));
  return out;
}

const isRoad = (i, j) => i >= 0 && j >= 0 && i < NI && j < NJ && (RX.includes(i) || RZ.includes(j));

// Default openings of each tile as Kenney ships it, in (dx, dz).
const OPEN = {
  straight: [[-1, 0], [1, 0]],
  tee: [[-1, 0], [1, 0], [0, 1]],
  bend: [[-1, 0], [0, 1]],
  end: [[1, 0]],
};

// Rotating about +y by θ sends (x, z) to (x cosθ + z sinθ, −x sinθ + z cosθ).
const rot = ([x, z], k) => {
  const a = (k * Math.PI) / 2;
  return [Math.round(x * Math.cos(a) + z * Math.sin(a)), Math.round(-x * Math.sin(a) + z * Math.cos(a))];
};
const key = (d) => d.join(',');

function orient(kind, open) {
  const want = new Set(open.map(key));
  for (let k = 0; k < 4; k++) {
    const got = OPEN[kind].map((d) => key(rot(d, k)));
    if (got.length === want.size && got.every((g) => want.has(g))) return (k * Math.PI) / 2;
  }
  return 0;
}

/** Every road tile, typed and turned to join its neighbours. */
export function roadTiles() {
  const tiles = [];
  for (let i = 0; i < NI; i++) {
    for (let j = 0; j < NJ; j++) {
      if (!isRoad(i, j)) continue;
      const open = [[-1, 0], [1, 0], [0, -1], [0, 1]].filter(([dx, dz]) => isRoad(i + dx, j + dz));
      const [x, z] = tileToWorld(i, j);
      let url, rotation = 0;
      if (open.length === 4) url = ROAD.cross;
      else if (open.length === 3) { url = ROAD.tee; rotation = orient('tee', open); }
      else if (open.length === 2) {
        const straight = open[0][0] === -open[1][0] && open[0][1] === -open[1][1];
        if (straight) {
          // A zebra crossing on the tile either side of a junction.
          const along = open[0][0] !== 0 ? 'x' : 'z';
          const nearJunction = along === 'x'
            ? (RX.includes(i - 1) || RX.includes(i + 1))
            : (RZ.includes(j - 1) || RZ.includes(j + 1));
          url = nearJunction ? ROAD.crossing : ROAD.straight;
          rotation = orient('straight', open);
        } else { url = ROAD.bend; rotation = orient('bend', open); }
      } else { url = ROAD.end; rotation = orient('end', open); }
      tiles.push({ url, position: [x, 0, z], rotation });
    }
  }
  return tiles;
}

/** Junctions: where cars choose, and where the signals stand. */
export function junctions() {
  const out = [];
  RX.forEach((i, a) => RZ.forEach((j, b) => {
    const [x, z] = tileToWorld(i, j);
    const edge = a === 0 || b === 0 || a === RX.length - 1 || b === RZ.length - 1;
    out.push({ id: `${a}:${b}`, a, b, x, z, edge });
  }));
  return out;
}

/* ── Scenery ─────────────────────────────────────────────────────── */

const faceRoad = (dx, dz) => {
  // Kenney buildings front onto +z. Turn each to face its nearest street.
  if (Math.abs(dx) > Math.abs(dz)) return dx > 0 ? Math.PI / 2 : -Math.PI / 2;
  return dz > 0 ? 0 : Math.PI;
};

// Only the narrow ones fit a single lot on a 3-wide block.
const NARROW_SHOPS = [0, 1, 2, 3, 5, 6, 7].map((i) => SHOPS[i]);
const MID_SHOPS = [8, 10, 11, 12].map((i) => SHOPS[i]);

export function scenery() {
  const r = rng(7);
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const pastel = () => pick(PASTELS);
  const items = [];
  const add = (url, x, z, rotation = 0, scale = 1, tint, y = 0) => items.push({ url, position: [x, y, z], rotation, scale, tint });

  BLOCKS.forEach((row, bj) => row.forEach((kind, bi) => {
    const [cx, cz] = blockCenter(bi, bj);

    if (kind === 'shops') {
      // A ring of eight shopfronts, each turned out to its street, with a
      // tree in the yard behind them.
      for (const [dx, dz] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]) {
        const tall = r() < 0.3;
        add(pick(tall ? MID_SHOPS : NARROW_SHOPS), cx + dx, cz + dz, faceRoad(dx, dz), tall ? 0.78 : 0.92, pastel());
      }
      add(TREES.round, cx, cz, r() * 6, 0.55);
    }

    if (kind === 'downtown') {
      const towers = [...TOWERS].sort(() => r() - 0.5);
      [[-0.72, -0.72], [0.72, -0.72], [-0.72, 0.72], [0.72, 0.72]].forEach(([dx, dz], k) => {
        add(towers[k % towers.length], cx + dx, cz + dz, faceRoad(dx, dz), 1, pick(['#cfe8ff', '#e8f1ff', '#ffe9d6', '#e6fff4', '#f1e6ff']));
      });
    }

    if (kind === 'houses' || kind === 'home') {
      // Four houses on the corners, gardens between.
      [[-0.75, -0.8], [0.75, -0.8], [-0.75, 0.8], [0.75, 0.8]].forEach(([dx, dz], k) => {
        if (kind === 'home' && k === 3) return; // Ray's house is its own landmark
        add(pick(HOUSES), cx + dx, cz + dz, dz > 0 ? 0 : Math.PI, 0.82, pick(['#ffffff', '#fff4e0', '#e8f6ff', '#fff0f3', '#f2ffe8']));
      });
      for (let k = 0; k < 5; k++) add(pick([TREES.street, TREES.streetSmall, TREES.bush]), cx + (r() - 0.5) * 2.4, cz + (r() - 0.5) * 0.5, r() * 6, 0.9 + r() * 0.4);
    }

    if (kind === 'plaza') {
      // The town square: a fountain, market stalls, benches, four palms.
      add(M('town', 'fountain-round-detail'), cx, cz, 0, 0.85);
      for (const [dx, dz] of [[-1.15, -1.15], [1.15, -1.15], [-1.15, 1.15], [1.15, 1.15]]) add(TREES.palmBig, cx + dx, cz + dz, r() * 6, 0.45);
      add(M('town', 'stall-green'), cx - 1.15, cz, Math.PI / 2, 0.5);
      add(M('town', 'stall-red'), cx + 1.15, cz, -Math.PI / 2, 0.5);
      add(M('holiday', 'bench'), cx, cz - 1.2, 0, 0.32);
      add(M('holiday', 'bench'), cx, cz + 1.2, Math.PI, 0.32);
      for (const [dx, dz] of [[-0.6, -1.2], [0.6, -1.2], [-0.6, 1.2], [0.6, 1.2]]) add(M('town', 'lantern'), cx + dx, cz + dz, 0, 0.35);
    }

    if (kind === 'park') {
      for (let k = 0; k < 16; k++) {
        const t = pick([TREES.oak, TREES.round, TREES.detailed, TREES.fat, TREES.palm, TREES.cone]);
        const x = cx + (r() - 0.5) * 2.6, z = cz + (r() - 0.5) * 2.6;
        if (Math.hypot(x - cx, z - cz) < 0.7) continue; // the pond
        add(t, x, z, r() * 6, 0.45 + r() * 0.25);
      }
      for (let k = 0; k < 14; k++) add(pick([TREES.flowerRed, TREES.flowerYellow, TREES.flowerPurple, TREES.bushSmall]), cx + (r() - 0.5) * 2.7, cz + (r() - 0.5) * 2.7, r() * 6, 0.6);
    }
  }));

  // Street lights along the avenues, on the kerb.
  for (const i of RX) for (let j = 1; j < NJ; j += 2) {
    if (RZ.includes(j)) continue;
    const [x, z] = tileToWorld(i, j);
    add(ROAD.light, x - 0.44, z, Math.PI / 2, 1);
  }
  for (const j of RZ) for (let i = 2; i < NI; i += 2) {
    if (RX.includes(i)) continue;
    const [x, z] = tileToWorld(i, j);
    add(ROAD.light, x, z - 0.44, 0, 1);
  }

  // Palms along the beach front, south of the last road.
  for (let x = -11.5; x <= 11.5; x += 1.15) {
    add(pick([TREES.palm, TREES.palmBig, TREES.palmBend, TREES.palmShort]), x + (r() - 0.5) * 0.3, 10.3 + r() * 0.6, r() * 6, 0.5 + r() * 0.25);
  }
  // A scatter of trees and rocks over the green belt.
  for (let k = 0; k < 90; k++) {
    const side = Math.floor(r() * 3);
    let x, z;
    if (side === 0) { x = -10.7 - r() * 2.6; z = -9 + r() * 17; }          // west
    else if (side === 1) { x = -11 + r() * 22; z = -9.1 - r() * 2.2; }     // north
    else { x = 10.8 + r() * 1.0; z = -9 + r() * 6; }                       // north-east, clear of the harbour
    if (Math.abs(x) > 12.6 && Math.abs(z) > 10.2) continue;
    if (Math.abs(railDistance(x, z)) < 0.55) continue;
    add(pick([TREES.oak, TREES.round, TREES.cone, TREES.detailed, TREES.fat, TREES.bushLarge, TREES.rock]), x, z, r() * 6, 0.4 + r() * 0.3);
  }

  // The harbour on the east shore: stacked containers and a warehouse.
  const boxes = ['a', 'b', 'c'].map((l) => M('industrial', `shipping-container-${l}`));
  for (let k = 0; k < 14; k++) {
    const col = k % 5, layer = Math.floor(k / 5);
    add(pick(boxes), 12.75 + (col % 2) * 0.62, 3.0 + Math.floor(col / 2) * 1.35 + layer * 0.05, 0, 1.5, undefined, layer * 0.52);
  }
  add(M('industrial', 'building-g'), 13.1, 8.0, -Math.PI / 2, 0.9, '#e7f0ff');
  add(M('industrial', 'water-tower'), 13.3, 0.4, 0, 0.8);

  // The station on the west side of the loop.
  add(M('holiday', 'bench'), -12.35, -0.5, Math.PI / 2, 0.3);
  add(M('holiday', 'bench'), -12.35, 0.6, Math.PI / 2, 0.3);

  return items.filter((it) => Math.abs(railDistance(it.position[0], it.position[2])) > 0.45 || Math.abs(it.position[0]) < 10.6 && Math.abs(it.position[2]) < 8.6);
}

/** Every url the static bake needs, so it can all load in one suspense. */
export function sceneryUrls() {
  const urls = new Set([...roadTiles(), ...scenery()].map((i) => i.url));
  return [...urls];
}

export { M };

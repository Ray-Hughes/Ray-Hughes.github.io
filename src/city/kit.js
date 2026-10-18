import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* ─────────────────────────────────────────────────────────────────────
   The kit: every model the city is built from.

   All of it is CC0, from Kenney's kits (see public/models/CREDITS.md). A
   road tile is one unit square, and everything else is measured against
   that, so a building is roughly one tile wide and a car is scaled down
   until it sits inside a lane.
───────────────────────────────────────────────────────────────────── */

export const M = (pack, name) => `/models/${pack}/${name}.glb`;

export const ROAD = {
  straight: M('roads', 'road-straight'),
  cross: M('roads', 'road-crossroad-line'),
  tee: M('roads', 'road-intersection-line'),
  bend: M('roads', 'road-bend'),
  crossing: M('roads', 'road-crossing'),
  end: M('roads', 'road-end-round'),
  square: M('roads', 'road-square'),
  light: M('roads', 'light-square'),
  lightDouble: M('roads', 'light-square-double'),
  signal: M('roads', 'traffic-light'),
  cone: M('roads', 'construction-cone'),
  barrier: M('roads', 'construction-barrier'),
  fence: M('roads', 'construction-fence'),
  workLight: M('roads', 'construction-light'),
};

export const SHOPS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n'].map((l) => M('commercial', `building-${l}`));
export const TOWERS = ['a', 'b', 'c', 'd', 'e'].map((l) => M('commercial', `building-skyscraper-${l}`));
export const HOUSES = 'abcdefghijklmnopqrstu'.split('').map((l) => M('suburban', `building-type-${l}`));

export const CARS = ['sedan', 'taxi', 'van', 'suv', 'hatchback-sports', 'sedan-sports', 'suv-luxury', 'delivery', 'truck', 'police', 'garbage-truck'].map((n) => M('cars', n));

export const PEOPLE = ['female-a', 'female-b', 'female-c', 'female-d', 'female-e', 'female-f', 'male-a', 'male-b', 'male-c', 'male-d', 'male-e', 'male-f'].map((n) => M('people', `character-${n}`));

export const TREES = {
  palm: M('nature', 'tree_palmTall'),
  palmBig: M('nature', 'tree_palmDetailedTall'),
  palmBend: M('nature', 'tree_palmBend'),
  palmShort: M('nature', 'tree_palmShort'),
  oak: M('nature', 'tree_oak'),
  round: M('nature', 'tree_default'),
  detailed: M('nature', 'tree_detailed'),
  fat: M('nature', 'tree_fat'),
  cone: M('nature', 'tree_cone'),
  small: M('nature', 'tree_small'),
  street: M('suburban', 'tree-large'),
  streetSmall: M('suburban', 'tree-small'),
  bush: M('nature', 'plant_bush'),
  bushLarge: M('nature', 'plant_bushLarge'),
  bushSmall: M('nature', 'plant_bushSmall'),
  flowerRed: M('nature', 'flower_redA'),
  flowerYellow: M('nature', 'flower_yellowA'),
  flowerPurple: M('nature', 'flower_purpleA'),
  rock: M('nature', 'rock_largeA'),
  rockB: M('nature', 'rock_largeB'),
};

/** Sunny, a little chalky: the palette the white buildings get tinted toward. */
export const PASTELS = ['#ffd6a5', '#ffadad', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#fdffb6', '#ffe5ec', '#d0f4de', '#fcd5ce', '#e2ece9', '#ffffff', '#ffffff'];

/** A cheap deterministic random, so the city is the same city on every load. */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KEEP = ['position', 'normal', 'uv', 'color'];

/**
 * Bakes many placed copies of a few models into one mesh per material.
 *
 * A city is hundreds of tiles, buildings and trees that never move. Drawn
 * one by one that is well over a thousand draw calls; merged it is a
 * handful. Each placement may carry a tint, written into vertex colours,
 * which is how one white building becomes a whole street of colours.
 *
 * items: [{ url, position:[x,y,z], rotation: radians about y, scale, tint }]
 * scenes: { [url]: THREE.Object3D } already loaded
 */
export function bakeStatic(items, scenes) {
  const groups = new Map();
  const tmp = new THREE.Matrix4();
  const place = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const col = new THREE.Color();

  for (const it of items) {
    const root = scenes[it.url];
    if (!root) continue;
    root.updateMatrixWorld(true);
    const s = it.scale ?? 1;
    const sv = Array.isArray(s) ? new THREE.Vector3(...s) : new THREE.Vector3(s, s, s);
    q.setFromAxisAngle(up, it.rotation || 0);
    place.compose(new THREE.Vector3(...it.position), q, sv);
    col.set(it.tint || '#ffffff');

    root.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      tmp.multiplyMatrices(place, o.matrixWorld);
      const src = o.geometry;
      // A mesh can hold several materials, split by geometry groups.
      const parts = mats.length > 1 && src.groups.length
        ? src.groups.map((g) => ({ mat: mats[g.materialIndex], range: g }))
        : [{ mat: mats[0], range: null }];

      for (const { mat, range } of parts) {
        let g = src.index ? src.toNonIndexed() : src.clone();
        if (range) {
          const sub = new THREE.BufferGeometry();
          for (const k of Object.keys(g.attributes)) {
            const a = g.attributes[k];
            sub.setAttribute(k, new THREE.BufferAttribute(a.array.slice(range.start * a.itemSize, (range.start + range.count) * a.itemSize), a.itemSize));
          }
          g = sub;
        }
        for (const k of Object.keys(g.attributes)) if (!KEEP.includes(k)) g.deleteAttribute(k);
        const n = g.attributes.position.count;
        if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
        const c = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b; }
        g.setAttribute('color', new THREE.BufferAttribute(c, 3));
        g.applyMatrix4(tmp);
        if (!groups.has(mat.uuid)) groups.set(mat.uuid, { mat, geos: [] });
        groups.get(mat.uuid).geos.push(g);
      }
    });
  }

  const meshes = [];
  for (const { mat, geos } of groups.values()) {
    const merged = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (!merged) continue;
    const m = mat.clone();
    m.vertexColors = true;
    const mesh = new THREE.Mesh(merged, m);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshes.push(mesh);
  }
  return meshes;
}

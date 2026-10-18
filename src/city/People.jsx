import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { PEOPLE, rng } from './kit';
import { BLOCKS, blockCenter } from './layout';

/* ─────────────────────────────────────────────────────────────────────
   People.

   Kenney's mini characters come rigged, with walk, idle, sit and a few
   gestures, so a figure is a skinned clone with its own mixer. Walkers go
   round the pavement of a block; the rest are placed where people would
   be: a queue at the cinema, someone on a bench, a stroll on the beach.
───────────────────────────────────────────────────────────────────── */

const SCALE = 0.28;
const KERB = 1.6;   // from block centre to the middle of the pavement

/** A point on a closed loop of straight legs, plus the heading of that leg. */
function onLoop(pts, u, out) {
  let total = 0;
  const lens = pts.map((p, k) => { const q = pts[(k + 1) % pts.length]; const l = Math.hypot(q[0] - p[0], q[1] - p[1]); total += l; return l; });
  let d = ((u % total) + total) % total;
  for (let k = 0; k < pts.length; k++) {
    if (d <= lens[k]) {
      const p = pts[k], q = pts[(k + 1) % pts.length];
      const f = d / lens[k];
      out.x = p[0] + (q[0] - p[0]) * f;
      out.z = p[1] + (q[1] - p[1]) * f;
      out.h = Math.atan2(q[0] - p[0], q[1] - p[1]);
      return total;
    }
    d -= lens[k];
  }
  return total;
}

function makeFigure(gltf, clipName, seed) {
  const obj = SkeletonUtils.clone(gltf.scene);
  obj.scale.setScalar(SCALE);
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; } });
  const mixer = new THREE.AnimationMixer(obj);
  const clip = gltf.animations.find((a) => a.name === clipName) || gltf.animations[0];
  const action = mixer.clipAction(clip);
  action.play();
  action.time = seed * clip.duration;
  return { obj, mixer };
}

export default function People({ landmarks }) {
  const gltfs = useGLTF(PEOPLE);

  const crowd = useMemo(() => {
    const r = rng(11);
    const pick = () => gltfs[Math.floor(r() * gltfs.length)];
    const out = [];

    // Walkers: one or two per block, either way round.
    BLOCKS.forEach((row, bj) => row.forEach((_, bi) => {
      const [cx, cz] = blockCenter(bi, bj);
      const loop = [[cx - KERB, cz - KERB], [cx + KERB, cz - KERB], [cx + KERB, cz + KERB], [cx - KERB, cz + KERB]];
      const n = 1 + (r() < 0.6 ? 1 : 0);
      for (let k = 0; k < n; k++) {
        const dir = r() < 0.5 ? 1 : -1;
        const pts = dir > 0 ? loop : [...loop].reverse();
        out.push({ ...makeFigure(pick(), 'walk', r()), kind: 'walk', pts, u: r() * 12.8, speed: 0.22 + r() * 0.08 });
      }
    }));

    // The beach promenade: a long out-and-back walk.
    for (let k = 0; k < 6; k++) {
      const z = 13.55 + r() * 0.9;
      out.push({ ...makeFigure(pick(), 'walk', r()), kind: 'walk', pts: [[-11, z], [11, z]], u: r() * 44, speed: 0.18 + r() * 0.08 });
    }

    // Standing about where it makes sense.
    const at = (id, dx, dz, clip, face = 0) => {
      const p = landmarks[id];
      if (!p) return;
      const f = makeFigure(pick(), clip, r());
      f.obj.position.set(p[0] + dx, 0.02, p[1] + dz);
      f.obj.rotation.y = face;
      out.push({ ...f, kind: 'still' });
    };
    // A queue for the cinema.
    [0.95, 1.12, 1.28, 1.44].forEach((dz, k) => at('theater', 0.62 + (k % 2) * 0.05, dz, k === 0 ? 'interact-right' : 'idle', Math.PI));
    at('theater', -0.62, 1.3, 'emote-yes', 0.4);
    // Students on the quad.
    at('university', -0.35, 0.95, 'idle', 0.6);
    at('university', -0.12, 1.05, 'emote-yes', -2.4);
    at('university', 0.45, 0.35, 'sit', -Math.PI / 2);
    // Hard hats in the projects district.
    at('yard', -0.5, -0.05, 'interact-left', 0.3);
    at('yard', 0.55, 0.65, 'holding-both', -0.8);
    at('hospital', -1.15, 0.5, 'interact-right', -Math.PI / 2);
    at('delphi', 1.05, 0.55, 'holding-right', 2.2);
    at('memophor', 0.3, 1.05, 'idle', 0.3);
    // Visitors at the temple steps, a patient outside the hospital.
    at('delphi', -0.25, 1.35, 'emote-yes', Math.PI);
    at('hospital', 0.1, 1.42, 'wheelchair-sit', Math.PI * 0.85);
    at('postoffice', 0.2, 0.8, 'interact-right', Math.PI);
    at('office', -0.4, 1.7, 'idle', 0.2);
    at('office', -0.18, 1.72, 'emote-no', -0.4);

    return out;
  }, [gltfs, landmarks]);

  const p = useMemo(() => ({ x: 0, z: 0, h: 0 }), []);
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    for (const f of crowd) {
      f.mixer.update(dt);
      if (f.kind !== 'walk') continue;
      f.u += f.speed * dt;
      onLoop(f.pts, f.u, p);
      f.obj.position.set(p.x, 0.025, p.z);
      let d = p.h - f.obj.rotation.y;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      f.obj.rotation.y += d * Math.min(1, dt * 8);
    }
  });

  return crowd.map((f, k) => <primitive key={k} object={f.obj} />);
}

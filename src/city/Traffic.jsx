import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CARS, rng } from './kit';
import { RX, RZ, tileToWorld } from './layout';
import { Box, mat } from './parts';

/* ─────────────────────────────────────────────────────────────────────
   Traffic.

   The roads form a graph: junctions are nodes, the stretches between them
   are edges. A car drives on the right of an edge, and at the far junction
   it picks a next edge and swings through on a curve. Two rules keep it
   from looking like a screensaver: signals, which alternate the two axes
   with an all-red gap long enough for a turning car to clear, and a
   following distance, so queues form behind a red and release in order.
───────────────────────────────────────────────────────────────────── */

const LANE = 0.17;
const CRUISE = 0.95;
const GAP = 0.5;
const CYCLE = 11;          // seconds for a full signal cycle
const GREEN = 4.3;         // per axis; the rest of each half is all-red

const v2 = (x, z) => new THREE.Vector2(x, z);

function buildGraph() {
  const nodes = new Map();
  RX.forEach((i, a) => RZ.forEach((j, b) => {
    const [x, z] = tileToWorld(i, j);
    nodes.set(`${a}:${b}`, { id: `${a}:${b}`, p: v2(x, z), nbrs: [], offset: ((a * 3 + b * 5) % 4) * 0.9 });
  }));
  for (const n of nodes.values()) {
    const [a, b] = n.id.split(':').map(Number);
    for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = `${a + da}:${b + db}`;
      if (nodes.has(k)) n.nbrs.push(k);
    }
  }
  return nodes;
}

/** Which axis has green at this junction right now: 'x', 'z' or null. */
function signal(node, t) {
  const c = (t + node.offset) % CYCLE;
  if (c < GREEN) return 'x';
  if (c >= CYCLE / 2 && c < CYCLE / 2 + GREEN) return 'z';
  return null;
}

function laneGeom(A, B) {
  const d = B.clone().sub(A).normalize();
  const r = v2(-d.y, d.x);
  const start = A.clone().addScaledVector(d, 0.5).addScaledVector(r, LANE);
  const end = B.clone().addScaledVector(d, -0.5).addScaledVector(r, LANE);
  return { d, r, start, end, len: start.distanceTo(end), axis: Math.abs(d.x) > 0.5 ? 'x' : 'z' };
}

function bezier(p0, p1, p2, t, out) {
  const u = 1 - t;
  return out.set(u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y);
}

export default function Traffic({ count = 34 }) {
  const gltfs = useGLTF(CARS);
  const graph = useMemo(buildGraph, []);
  const group = useRef();

  const cars = useMemo(() => {
    const r = rng(42);
    const ids = [...graph.keys()];
    const out = [];
    const used = new Set();
    for (let k = 0; k < count; k++) {
      // Spread them over distinct edges so nobody starts inside anybody.
      let from, to, tries = 0;
      do {
        from = ids[Math.floor(r() * ids.length)];
        const n = graph.get(from);
        to = n.nbrs[Math.floor(r() * n.nbrs.length)];
        tries++;
      } while (used.has(`${from}>${to}`) && tries < 50);
      used.add(`${from}>${to}`);
      const g = gltfs[k % gltfs.length].scene.clone(true);
      const wheels = [];
      g.traverse((o) => {
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
        if (/wheel/i.test(o.name)) wheels.push(o);
      });
      const holder = new THREE.Group();
      g.scale.setScalar(0.15);
      holder.add(g);
      const lane = laneGeom(graph.get(from).p, graph.get(to).p);
      out.push({ obj: holder, wheels, from, to, lane, s: r() * lane.len * 0.8, v: CRUISE * 0.5, mode: 'road', turn: null, cruise: CRUISE * (0.85 + r() * 0.3) });
    }
    return out;
  }, [gltfs, graph, count]);

  const tmp = useMemo(() => v2(0, 0), []);
  const tmp2 = useMemo(() => v2(0, 0), []);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;

    for (const c of cars) {
      let want = c.cruise;

      if (c.mode === 'road') {
        // Nearest car ahead on this edge, or already swinging out of it.
        let ahead = Infinity;
        for (const o of cars) {
          if (o === c) continue;
          if (o.mode === 'road' && o.from === c.from && o.to === c.to && o.s > c.s) ahead = Math.min(ahead, o.s - c.s);
          if (o.mode === 'turn' && o.turn.from === c.from && o.turn.via === c.to) ahead = Math.min(ahead, c.lane.len - c.s + o.turn.t * o.turn.len);
        }
        const toLine = c.lane.len - c.s;
        const light = signal(graph.get(c.to), t);
        let stop = Infinity;
        if (light !== c.lane.axis && toLine > -0.01) stop = toLine;
        const room = Math.min(ahead - GAP, stop);
        want = Math.max(0, Math.min(c.cruise, room * 2.6));

        if (toLine <= 0.002 && light === c.lane.axis) {
          // At the line on a green: choose where next, if there is room there.
          const node = graph.get(c.to);
          const options = node.nbrs.filter((n) => n !== c.from);
          const pool = options.length ? options : node.nbrs;
          const pick = pool[Math.floor(Math.random() * pool.length)];
          const next = laneGeom(node.p, graph.get(pick).p);
          const tail = cars.some((o) => o !== c && o.mode === 'road' && o.from === c.to && o.to === pick && o.s < GAP + 0.1);
          if (!tail) {
            const p0 = c.lane.end.clone();
            const p2 = next.start.clone();
            const p1 = next.d.dot(c.lane.d) > 0.9
              ? p0.clone().add(p2).multiplyScalar(0.5)
              : node.p.clone().addScaledVector(c.lane.r, LANE).addScaledVector(next.r, LANE);
            let len = 0, prev = p0.clone();
            for (let k = 1; k <= 8; k++) { const q = bezier(p0, p1, p2, k / 8, tmp.clone()); len += q.distanceTo(prev); prev = q; }
            c.mode = 'turn';
            c.turn = { p0, p1, p2, len, t: 0, from: c.from, via: c.to, to: pick, next };
          } else want = 0;
        }
      } else {
        want = c.cruise * 0.7;
      }

      c.v = THREE.MathUtils.damp(c.v, want, want < c.v ? 6 : 1.6, dt);
      const step = c.v * dt;

      let px, pz, dx, dz;
      if (c.mode === 'road') {
        c.s = Math.min(c.s + step, c.lane.len);
        px = c.lane.start.x + c.lane.d.x * c.s;
        pz = c.lane.start.y + c.lane.d.y * c.s;
        dx = c.lane.d.x; dz = c.lane.d.y;
      } else {
        const tr = c.turn;
        tr.t = Math.min(1, tr.t + step / tr.len);
        const p = bezier(tr.p0, tr.p1, tr.p2, tr.t, tmp);
        const q = bezier(tr.p0, tr.p1, tr.p2, Math.min(1, tr.t + 0.02), tmp2);
        px = p.x; pz = p.y;
        dx = q.x - p.x; dz = q.y - p.y;
        if (tr.t >= 1) {
          c.mode = 'road';
          c.from = tr.via; c.to = tr.to; c.lane = tr.next; c.s = 0; c.turn = null;
        }
      }

      c.obj.position.set(px, 0.02, pz);
      if (dx * dx + dz * dz > 1e-8) {
        const target = Math.atan2(dx, dz);
        let diff = target - c.obj.rotation.y;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        c.obj.rotation.y += diff * Math.min(1, dt * 14);
      }
      for (const w of c.wheels) w.rotation.x += step / 0.045;
    }
  });

  return (
    <group ref={group}>
      {cars.map((c, k) => <primitive key={k} object={c.obj} />)}
      <Signals graph={graph} />
    </group>
  );
}

/**
 * The signal heads at each junction. They show the state the cars obey,
 * which is the point: a queue at a red light looks right only if the light
 * is red.
 */
function Signals({ graph }) {
  const heads = useMemo(() => {
    const out = [];
    for (const n of graph.values()) {
      if (n.nbrs.length < 3) continue;
      // One head per approach axis, on opposite corners.
      out.push({ node: n, axis: 'x', pos: [n.p.x - 0.46, n.p.y - 0.46] });
      out.push({ node: n, axis: 'z', pos: [n.p.x + 0.46, n.p.y + 0.46] });
    }
    return out;
  }, [graph]);
  const lit = useMemo(() => {
    const mk = (c) => { const m = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 3 }); m.toneMapped = false; return m; };
    return { red: mk('#ff3b30'), green: mk('#34e07a'), off: new THREE.MeshStandardMaterial({ color: '#2a2d33' }) };
  }, []);
  const refs = useRef([]);
  useFrame(({ clock }) => {
    heads.forEach((h, k) => {
      const g = refs.current[k];
      if (!g) return;
      const go = signal(h.node, clock.elapsedTime) === h.axis;
      g.children[1].material = go ? lit.off : lit.red;
      g.children[2].material = go ? lit.green : lit.off;
    });
  });
  const pole = mat('#4b5160');
  return heads.map((h, k) => (
    <group key={k} position={[h.pos[0], 0, h.pos[1]]}>
      <group ref={(el) => { refs.current[k] = el; }} position={[0, 0.3, 0]}>
        <Box size={[0.05, 0.12, 0.05]} m={pole} />
        <mesh position={[0, 0.03, 0.027]} material={lit.off}><sphereGeometry args={[0.016, 8, 6]} /></mesh>
        <mesh position={[0, -0.03, 0.027]} material={lit.off}><sphereGeometry args={[0.016, 8, 6]} /></mesh>
      </group>
      <Box size={[0.018, 0.26, 0.018]} position={[0, 0.13, 0]} m={pole} />
    </group>
  ));
}

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, Cyl, Sign, WindowGrid, TowerCrane, Bulbs, rectPoints, Flag, Scaffold, Model, mat, GLASS } from './parts';
import { M, TREES } from './kit';

/* ─────────────────────────────────────────────────────────────────────
   The buildings that open something.

   Each is drawn in its own block's local space: the block is 3×3 units
   centred on the origin, and the front of the building faces +z, toward
   the camera's default view. Everything here was built for this town; the
   kit supplies only the props around them (cars, trees, people).
───────────────────────────────────────────────────────────────────── */

const WHITE = '#f7f8fb';

function Bob({ children, amp = 0.06, speed = 1.2, spin = 0, position }) {
  const g = useRef();
  useFrame(({ clock }, dt) => {
    if (!g.current) return;
    g.current.position.y = (position?.[1] || 0) + Math.sin(clock.elapsedTime * speed) * amp;
    g.current.rotation.y += spin * Math.min(dt, 0.05);
  });
  return <group ref={g} position={position}>{children}</group>;
}

export function glowMat(color, intensity = 3) {
  const m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.3 });
  m.toneMapped = false;
  return m;
}

/* ── Résumé: Hughes Tower ─────────────────────────────────────────── */

export function OfficeTower() {
  const gondola = useRef();
  const beacon = useMemo(() => glowMat('#ff4b4b', 4), []);
  const floors = 17, fh = 0.31, base = 0.55;
  const top = base + floors * fh;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (gondola.current) gondola.current.position.y = base + 0.4 + (Math.sin(t * 0.18) * 0.5 + 0.5) * (top - base - 1.1);
    beacon.emissiveIntensity = Math.sin(t * 3) > 0.6 ? 6 : 0.4;
  });
  const glass = mat('#4f9fe0', GLASS);
  const slab = mat('#f2f5fa', { rough: 0.6 });
  return (
    <group>
      {/* Podium and lobby. */}
      <Box size={[2.5, base, 2.4]} position={[0, base / 2, 0]} color="#e3e8f0" />
      <Box size={[1.8, 0.4, 0.03]} position={[0, 0.25, 1.21]} m={mat('#9ad1ff', GLASS)} />
      <Box size={[1.1, 0.05, 0.42]} position={[0, 0.47, 1.38]} color="#2c3e66" />
      <Cyl r={0.025} h={0.45} position={[-0.5, 0.22, 1.55]} color="#2c3e66" />
      <Cyl r={0.025} h={0.45} position={[0.5, 0.22, 1.55]} color="#2c3e66" />
      <Sign size={0.13} color="#2c3e66" position={[0, 0.505, 1.6]} rotation={[-Math.PI / 2, 0, 0]}>HUGHES TOWER</Sign>

      {/* The shaft: glass bands between white slabs, one per floor. */}
      {Array.from({ length: floors }, (_, f) => (
        <group key={f} position={[0, base + f * fh, 0]}>
          <Box size={[1.9, fh - 0.05, 1.9]} position={[0, (fh - 0.05) / 2 + 0.05, 0]} m={glass} />
          <Box size={[2.02, 0.06, 2.02]} position={[0, 0.03, 0]} m={slab} />
        </group>
      ))}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], k) => (
        <Box key={k} size={[0.14, top - base, 0.14]} position={[sx * 0.98, (top + base) / 2, sz * 0.98]} m={slab} />
      ))}

      {/* Crown, mast, and the light that tells aircraft it is there. */}
      <Box size={[2.02, 0.08, 2.02]} position={[0, top + 0.04, 0]} m={slab} />
      <Box size={[1.4, 0.45, 1.4]} position={[0, top + 0.3, 0]} m={mat('#3e86c9', GLASS)} />
      <Box size={[1.5, 0.06, 1.5]} position={[0, top + 0.55, 0]} m={slab} />
      <Sign size={0.2} color="#ffffff" position={[0, top + 0.3, 0.71]} outline="#1f4f86">RÉSUMÉ</Sign>
      <Cyl r={0.03} rt={0.012} h={1.1} position={[0, top + 1.1, 0]} color="#cfd6df" />
      <mesh position={[0, top + 1.68, 0]} material={beacon}><sphereGeometry args={[0.05, 12, 8]} /></mesh>

      {/* A window cleaner, working their way up and down the front. */}
      <group ref={gondola} position={[0.3, 2, 1.0]}>
        <Box size={[0.42, 0.08, 0.1]} position={[0, 0, 0.05]} color="#ffb703" />
        <Box size={[0.006, 6, 0.006]} position={[-0.18, 3, 0.05]} color="#444" shadow={false} />
        <Box size={[0.006, 6, 0.006]} position={[0.18, 3, 0.05]} color="#444" shadow={false} />
        <Box size={[0.05, 0.1, 0.05]} position={[0, 0.09, 0.05]} color="#1d3557" />
        <mesh position={[0, 0.17, 0.05]} material={mat('#f1c27d')}><sphereGeometry args={[0.03, 8, 6]} /></mesh>
      </group>

      {/* Plaza out front. */}
      {[-1.1, 1.1].map((x) => <Model key={x} url={TREES.round} position={[x, 0.55, 1.05]} scale={0.32} />)}
    </group>
  );
}

/* ── Patientevity: the hospital ───────────────────────────────────── */

function Helicopter({ pad }) {
  const g = useRef();
  const rotor = useRef();
  const tail = useRef();
  useFrame(({ clock }, dt) => {
    // A thirty second round: wait on the pad, lift, circle the district, land.
    const t = clock.elapsedTime % 30;
    let y = 0, a = 0, r = 0;
    if (t > 6 && t < 26) {
      const k = (t - 6) / 20;
      y = Math.min(1, k * 6, (1 - k) * 6) * 2.4;
      r = Math.min(1, k * 4, (1 - k) * 4) * 2.2;
      a = k * Math.PI * 2;
    }
    if (g.current) {
      g.current.position.set(pad[0] + Math.sin(a) * r, pad[1] + y, pad[2] + (1 - Math.cos(a)) * r * -1);
      g.current.rotation.y = -a + (r > 0.1 ? -Math.PI / 2 : 0);
      g.current.rotation.z = r > 0.1 ? 0.12 : 0;
    }
    const spin = t > 4 && t < 28 ? 30 : 4;
    if (rotor.current) rotor.current.rotation.y += spin * dt;
    if (tail.current) tail.current.rotation.x += spin * dt;
  });
  return (
    <group ref={g}>
      <mesh castShadow position={[0, 0.12, 0]} material={mat('#ffffff', { rough: 0.4 })}><sphereGeometry args={[0.13, 14, 10]} /></mesh>
      <Box size={[0.2, 0.08, 0.02]} position={[0, 0.12, 0.12]} m={mat('#ef4444')} />
      <mesh position={[0.07, 0.15, 0.06]} material={mat('#9bd5ff', GLASS)}><sphereGeometry args={[0.08, 10, 8]} /></mesh>
      <Box size={[0.3, 0.035, 0.035]} position={[-0.25, 0.15, 0]} m={mat('#ffffff')} />
      <Box size={[0.02, 0.08, 0.02]} position={[-0.39, 0.19, 0]} m={mat('#ef4444')} />
      <group ref={tail} position={[-0.4, 0.18, 0.02]}><Box size={[0.005, 0.12, 0.012]} m={mat('#333')} shadow={false} /></group>
      <Box size={[0.03, 0.06, 0.2]} position={[0, 0.04, 0]} m={mat('#555')} />
      <Box size={[0.26, 0.012, 0.012]} position={[0, 0.0, 0.07]} m={mat('#555')} />
      <Box size={[0.26, 0.012, 0.012]} position={[0, 0.0, -0.07]} m={mat('#555')} />
      <group ref={rotor} position={[0, 0.27, 0]}>
        <Box size={[0.7, 0.008, 0.035]} m={mat('#333')} />
        <Box size={[0.035, 0.008, 0.7]} m={mat('#333')} />
      </group>
    </group>
  );
}

export function Hospital() {
  const cross = useMemo(() => glowMat('#ff3b3b', 1.6), []);
  return (
    <group>
      {/* Main ward block. */}
      <Box size={[2.5, 1.55, 1.3]} position={[0.1, 0.775, -0.45]} color={WHITE} />
      <Box size={[2.52, 0.1, 1.32]} position={[0.1, 1.6, -0.45]} color="#4d9fff" />
      <WindowGrid w={2.3} h={1.15} floors={4} cols={9} position={[0.1, 0.85, 0.21]} pane="#8fd3ff" frame="#4d9fff" />
      <WindowGrid w={1.1} h={1.15} floors={4} cols={4} position={[1.36, 0.85, -0.45]} rotation={[0, Math.PI / 2, 0]} pane="#8fd3ff" frame="#4d9fff" />

      {/* The cross, lit, on a white disc above the entrance. */}
      <group position={[0.1, 1.95, -0.1]}>
        <Cyl r={0.33} h={0.06} rotation={[Math.PI / 2, 0, 0]} color="#ffffff" />
        <Box size={[0.42, 0.13, 0.05]} position={[0, 0, 0.04]} m={cross} />
        <Box size={[0.13, 0.42, 0.05]} position={[0, 0, 0.04]} m={cross} />
        <Box size={[0.05, 0.35, 0.05]} position={[0, -0.33, -0.02]} color="#c9d2dc" />
      </group>

      {/* Entrance wing and canopy, where the ambulances pull in. */}
      <Box size={[1.4, 0.55, 0.75]} position={[-0.25, 0.275, 0.55]} color="#e8f1fb" />
      <Box size={[0.9, 0.36, 0.02]} position={[-0.25, 0.2, 0.93]} m={mat('#a8dcff', GLASS)} />
      <Box size={[1.6, 0.05, 0.55]} position={[-0.25, 0.5, 1.2]} color="#4d9fff" />
      <Box size={[1.6, 0.14, 0.04]} position={[-0.25, 0.52, 1.47]} color="#ffffff" />
      <Sign size={0.1} color="#2563eb" position={[-0.25, 0.52, 1.495]}>PATIENTEVITY</Sign>
      {[-0.95, 0.45].map((x) => <Cyl key={x} r={0.025} h={0.5} position={[x, 0.25, 1.42]} color="#dfe8f2" />)}
      <Model url={M('people', 'wheelchair')} position={[0.1, 0.02, 1.42]} rotation={Math.PI * 0.85} scale={0.28} />
      <Model url={M('cars', 'ambulance')} position={[0.75, 0.02, 1.15]} rotation={Math.PI / 2} scale={0.13} />

      {/* Helipad, and the helicopter that uses it. */}
      <Cyl r={0.42} h={0.04} position={[0.75, 1.67, -0.55]} color="#3d4452" />
      <Sign size={0.36} color="#ffd166" position={[0.75, 1.695, -0.55]} rotation={[-Math.PI / 2, 0, 0]}>H</Sign>
      <Helicopter pad={[0.75, 1.69, -0.55]} />

      {/* Still being built: the east wing in scaffolding, and a crane. */}
      <Box size={[0.7, 0.9, 1.1]} position={[-1.05, 0.45, -0.45]} color="#d9dee6" />
      <Scaffold w={1.1} h={1.25} position={[-1.42, 0, -0.45]} rotation={[0, -Math.PI / 2, 0]} />
      <TowerCrane position={[-1.0, 0, -1.25]} height={3.4} jib={2.1} phase={1.3} />
      {[[1.25, 1.3], [1.1, 1.36]].map(([x, z], k) => <Model key={k} url={M('roads', 'construction-cone')} position={[x, 0.02, z]} scale={1.6} />)}
    </group>
  );
}

/* ── Delphi: the temple of the oracle ─────────────────────────────── */

export function Pediment({ w, d, h, position, m }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.lineTo(-d / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
    g.translate(0, 0, -w / 2);
    g.rotateY(Math.PI / 2);
    return g;
  }, [w, d, h]);
  return <mesh geometry={geo} position={position} material={m} castShadow receiveShadow />;
}

/** The knowledge graph, hung in the air above the temple and turning. */
export function Constellation({ color, position, scale = 1 }) {
  const g = useRef();
  const { nodes, lines } = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 14; i++) {
      const y = 1 - (i / 13) * 2, rr = Math.sqrt(1 - y * y), th = i * 2.39996;
      pts.push(new THREE.Vector3(Math.cos(th) * rr * 0.75, y * 0.45, Math.sin(th) * rr * 0.75));
    }
    const seg = [];
    pts.forEach((a, i) => pts.forEach((b, j) => { if (j > i && a.distanceTo(b) < 0.62) seg.push(a, b); }));
    return { nodes: pts, lines: new THREE.BufferGeometry().setFromPoints(seg) };
  }, []);
  const nodeMat = useMemo(() => glowMat(color, 3), [color]);
  useFrame((_, dt) => { if (g.current) g.current.rotation.y += dt * 0.25; });
  return (
    <group ref={g} position={position} scale={scale}>
      {nodes.map((p, k) => <mesh key={k} position={p} material={nodeMat}><sphereGeometry args={[k % 4 ? 0.035 : 0.055, 10, 8]} /></mesh>)}
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={color} transparent opacity={0.7} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

export function Flame({ position }) {
  const ref = useRef();
  const m = useMemo(() => glowMat('#ffb347', 4), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 13 + position[0] * 5) * 0.15;
    ref.current.scale.set(1, s, 1);
  });
  return (
    <group position={position}>
      <Cyl r={0.05} rt={0.09} h={0.08} position={[0, 0.04, 0]} color="#c08a4a" />
      <Cyl r={0.025} h={0.22} position={[0, -0.1, 0]} color="#e8e2d6" />
      <mesh ref={ref} position={[0, 0.13, 0]} material={m}><coneGeometry args={[0.05, 0.14, 8]} /></mesh>
    </group>
  );
}

export function Temple({ color = '#4fd8e0' }) {
  const marble = mat('#f6f2ea', { rough: 0.55 });
  const accent = mat(color, { rough: 0.5 });
  const orb = useMemo(() => glowMat(color, 3.5), [color]);
  const door = useMemo(() => glowMat(color, 2), [color]);
  const cols = useMemo(() => {
    const out = [];
    for (let i = 0; i < 6; i++) { const x = -1.0 + i * 0.4; out.push([x, 0.72]); out.push([x, -0.72]); }
    for (let j = 1; j < 4; j++) { const z = -0.72 + j * 0.36; out.push([-1.0, z]); out.push([1.0, z]); }
    return out;
  }, []);
  const steps = [[2.7, 2.05], [2.5, 1.88], [2.32, 1.72]];
  return (
    <group position={[0, 0, -0.1]}>
      {steps.map(([w, d], k) => <Box key={k} size={[w, 0.1, d]} position={[0, 0.05 + k * 0.1, 0]} m={marble} />)}
      <Box size={[1.5, 0.95, 1.0]} position={[0, 0.775, 0]} m={mat('#ece5d6')} />
      <Box size={[0.38, 0.58, 0.02]} position={[0, 0.6, 0.51]} m={door} />
      {cols.map(([x, z], k) => (
        <group key={k} position={[x, 0.3, z]}>
          <Box size={[0.2, 0.05, 0.2]} position={[0, 0.025, 0]} m={marble} />
          <Cyl r={0.075} rt={0.065} h={0.95} seg={12} position={[0, 0.52, 0]} m={marble} />
          <Box size={[0.2, 0.06, 0.2]} position={[0, 1.02, 0]} m={marble} />
        </group>
      ))}
      <Box size={[2.32, 0.08, 1.72]} position={[0, 1.4, 0]} m={accent} />
      <Box size={[2.36, 0.16, 1.76]} position={[0, 1.52, 0]} m={marble} />
      <Sign size={0.15} color={color} outline="#0e4f55" position={[0, 1.52, 0.89]}>DELPHI</Sign>
      <Pediment w={2.4} d={1.8} h={0.42} position={[0, 1.6, 0]} m={mat('#8fe3e8', { rough: 0.5 })} />
      <Pediment w={2.42} d={1.84} h={0.03} position={[0, 1.6, 0]} m={marble} />

      {/* The oracle: a lit stone, and the graph it reads, turning above. */}
      <Bob position={[0, 2.65, 0]} amp={0.08} speed={1.1} spin={0.6}>
        <mesh material={orb}><icosahedronGeometry args={[0.16, 0]} /></mesh>
      </Bob>
      <Constellation color={color} position={[0, 2.65, 0]} />

      <Flame position={[-0.55, 0.42, 1.2]} />
      <Flame position={[0.55, 0.42, 1.2]} />
      {[[-1.25, 1.25], [1.25, 1.25], [-1.25, -1.2]].map(([x, z], k) => <Model key={k} url={TREES.oak} position={[x, 0, z]} scale={0.42} />)}
      <Scaffold w={1.0} h={1.1} position={[1.38, 0, -0.35]} rotation={[0, Math.PI / 2, 0]} />
      <TowerCrane position={[1.15, 0, -1.25]} height={3.6} jib={2.2} phase={3.1} />
    </group>
  );
}

/* ── Memophor: library and memory vault ───────────────────────────── */

function VaultLights({ color }) {
  const mats = useMemo(() => [0, 1, 2, 3].map(() => glowMat(color, 2)), [color]);
  useFrame(({ clock }) => {
    mats.forEach((m, k) => { m.emissiveIntensity = 1 + 2.5 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * (2 + k) + k * 2)); });
  });
  const rows = Array.from({ length: 24 }, (_, k) => [Math.floor(k / 6), k % 6]);
  return rows.map(([r, c], k) => (
    <Box key={k} size={[0.09, 0.03, 0.01]} position={[-0.32 + c * 0.13, 0.2 + r * 0.16, 0.81]} m={mats[(r + c) % 4]} shadow={false} />
  ));
}

export function Library({ color = '#a855f7' }) {
  const dome = mat(color, { rough: 0.35, metal: 0.35 });
  const stone = mat('#f3eef9', { rough: 0.6 });
  const shards = useRef();
  const shardMat = useMemo(() => glowMat('#d8b4fe', 2.5), []);
  useFrame((_, dt) => { if (shards.current) shards.current.rotation.y -= dt * 0.4; });
  return (
    <group>
      <group position={[-0.45, 0, -0.15]}>
        <Cyl r={1.0} h={0.16} position={[0, 0.08, 0]} seg={32} m={stone} />
        <Cyl r={0.82} h={1.0} position={[0, 0.66, 0]} seg={32} m={mat('#e9e0f7')} />
        {Array.from({ length: 14 }, (_, k) => {
          const a = (k / 14) * Math.PI * 2;
          return <Cyl key={k} r={0.05} h={1.0} seg={10} position={[Math.cos(a) * 0.92, 0.66, Math.sin(a) * 0.92]} m={stone} />;
        })}
        <Cyl r={0.98} h={0.12} position={[0, 1.22, 0]} seg={32} m={stone} />
        <Cyl r={0.7} h={0.22} position={[0, 1.39, 0]} seg={32} m={mat('#e9e0f7')} />
        <mesh position={[0, 1.5, 0]} material={dome} castShadow>
          <sphereGeometry args={[0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <Cyl r={0.1} h={0.2} position={[0, 2.25, 0]} m={stone} />
        <mesh position={[0, 2.42, 0]} material={shardMat}><sphereGeometry args={[0.08, 12, 8]} /></mesh>
        <group ref={shards} position={[0, 2.0, 0]}>
          {Array.from({ length: 6 }, (_, k) => {
            const a = (k / 6) * Math.PI * 2;
            return <mesh key={k} position={[Math.cos(a) * 0.95, Math.sin(k * 1.7) * 0.15, Math.sin(a) * 0.95]} material={shardMat}><octahedronGeometry args={[0.06]} /></mesh>;
          })}
        </group>
        <Box size={[0.5, 0.6, 0.3]} position={[0, 0.46, 0.82]} m={stone} />
        <Box size={[0.3, 0.42, 0.02]} position={[0, 0.37, 0.98]} m={mat('#5b2a86')} />
        <Sign size={0.12} color={color} outline="#ffffff" position={[0, 0.84, 0.98]}>LIBRARY</Sign>
      </group>

      {/* The vault: where the memory actually lives, blinking. */}
      <group position={[0.95, 0, 0.1]}>
        <Box size={[0.95, 0.95, 1.6]} position={[0, 0.475, 0]} color="#2a2340" />
        <Box size={[1.0, 0.06, 1.65]} position={[0, 0.98, 0]} m={dome} />
        <VaultLights color={color} />
        <Sign size={0.12} color="#ffffff" position={[0, 0.88, 0.815]}>MEMOPHOR</Sign>
        <Box size={[0.4, 0.12, 0.3]} position={[0.15, 1.07, -0.4]} color="#8b8fa3" />
        <Box size={[0.3, 0.12, 0.3]} position={[-0.2, 1.07, 0.3]} color="#8b8fa3" />
      </group>

      <Scaffold w={1.2} h={1.0} position={[0.95, 0, -0.82]} rotation={[0, Math.PI, 0]} />
      <TowerCrane position={[1.2, 0, -1.25]} height={3.0} jib={1.9} phase={5.2} color="#ff9f1c" />
      {[[-1.3, 1.25], [0.3, 1.3]].map(([x, z], k) => <Model key={k} url={TREES.cone} position={[x, 0, z]} scale={0.4} />)}
    </group>
  );
}

/* ── Blog: the cinema ─────────────────────────────────────────────── */

function Searchlight({ position, phase }) {
  const g = useRef();
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.z = Math.sin(clock.elapsedTime * 0.5 + phase) * 0.45;
  });
  return (
    <group position={position}>
      <Cyl r={0.06} h={0.1} position={[0, 0.05, 0]} color="#30343d" />
      <group ref={g} position={[0, 0.12, 0]}>
        <Cyl r={0.06} h={0.14} position={[0, 0.06, 0]} color="#c9ced6" />
        <mesh position={[0, 1.6, 0]}>
          <coneGeometry args={[0.22, 3.0, 20, 1, true]} />
          <meshBasicMaterial color="#fff6c9" transparent opacity={0.06} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

export function Theater() {
  const posters = useMemo(() => [glowMat('#ff7eb6', 0.6), glowMat('#5ec8ff', 0.6)], []);
  const marqueePts = useMemo(() => rectPoints(1.9, 0.42, 0.08, 0.27), []);
  const bladePts = useMemo(() => {
    const out = [];
    for (let y = -0.7; y <= 0.7; y += 0.09) { out.push([0.065, y, 0.19]); out.push([0.065, y, -0.19]); out.push([-0.065, y, 0.19]); out.push([-0.065, y, -0.19]); }
    return out;
  }, []);
  const letters = 'CINEMA'.split('');
  return (
    <group>
      {/* Auditorium behind, facade in front. */}
      <Box size={[2.3, 1.25, 1.75]} position={[0, 0.625, -0.45]} color="#b23a48" />
      <Box size={[2.34, 0.08, 1.79]} position={[0, 1.27, -0.45]} color="#ffd166" />
      <Box size={[2.5, 1.5, 0.2]} position={[0, 0.75, 0.52]} color="#f7e6c4" />
      <Box size={[1.5, 0.28, 0.2]} position={[0, 1.64, 0.52]} color="#f7e6c4" />
      <Box size={[0.8, 0.24, 0.2]} position={[0, 1.9, 0.52]} color="#f7e6c4" />
      {[-1.15, -0.95, 0.95, 1.15].map((x) => <Box key={x} size={[0.06, 1.5, 0.04]} position={[x, 0.75, 0.63]} color="#ffd166" />)}

      {/* The blade sign, lit letters stacked down both faces. */}
      <group position={[0, 1.9, 0.8]}>
        <Box size={[0.12, 1.5, 0.4]} color="#b23a48" />
        {letters.map((ch, k) => (
          <group key={k} position={[0, 0.55 - k * 0.22, 0]}>
            <Sign size={0.19} color="#fff3b0" glow position={[0.065, 0, 0]} rotation={[0, Math.PI / 2, 0]}>{ch}</Sign>
            <Sign size={0.19} color="#fff3b0" glow position={[-0.065, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>{ch}</Sign>
          </group>
        ))}
        <Bulbs points={bladePts} r={0.017} speed={5} />
      </group>

      {/* Marquee: the letter board says what is showing. */}
      <group position={[0, 0.92, 0.85]}>
        <Box size={[2.0, 0.5, 0.5]} color="#fbf3df" />
        <Box size={[1.7, 0.3, 0.02]} position={[0, 0, 0.26]} color="#1d1d24" />
        <Sign size={0.085} color="#fff8e1" position={[0, 0.06, 0.275]}>NOW SHOWING</Sign>
        <Sign size={0.1} color="#ffd166" position={[0, -0.06, 0.275]}>{"RAY'S BLOG"}</Sign>
        <Bulbs points={marqueePts} />
      </group>

      <Box size={[0.9, 0.5, 0.02]} position={[0, 0.27, 0.63]} m={mat('#ffe8a8', GLASS)} />
      {[-0.78, 0.78].map((x, k) => (
        <group key={x} position={[x, 0.36, 0.63]}>
          <Box size={[0.36, 0.5, 0.03]} color="#ffd166" />
          <Box size={[0.3, 0.44, 0.02]} position={[0, 0, 0.015]} m={posters[k]} />
        </group>
      ))}
      <Box size={[0.55, 0.012, 0.75]} position={[0, 0.03, 1.05]} color="#d7263d" shadow={false} />
      {[-0.4, 0.4].map((x) => <Cyl key={x} r={0.03} h={0.2} position={[x, 0.1, 1.35]} color="#ffd166" />)}
      <Searchlight position={[-0.8, 1.29, -0.9]} phase={0} />
      <Searchlight position={[0.8, 1.29, -0.9]} phase={2} />
    </group>
  );
}

/* ── Skills: the university ───────────────────────────────────────── */

function Clock({ position }) {
  const hour = useRef(), minute = useRef();
  useFrame(() => {
    const d = new Date();
    const m = d.getMinutes() + d.getSeconds() / 60;
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(((d.getHours() % 12) + m / 60) / 12) * Math.PI * 2;
  });
  return (
    <group position={position}>
      <Cyl r={0.17} h={0.03} rotation={[Math.PI / 2, 0, 0]} color="#fffaf0" />
      <group ref={hour} position={[0, 0, 0.02]}><Box size={[0.025, 0.1, 0.01]} position={[0, 0.05, 0]} color="#222" shadow={false} /></group>
      <group ref={minute} position={[0, 0, 0.025]}><Box size={[0.018, 0.14, 0.01]} position={[0, 0.07, 0]} color="#222" shadow={false} /></group>
    </group>
  );
}

export function University() {
  const brick = mat('#c8613f', { rough: 0.9 });
  const trim = mat('#fdf6ea', { rough: 0.6 });
  const roof = mat('#4fae95', { rough: 0.5, metal: 0.2 });
  return (
    <group>
      <Box size={[2.7, 0.95, 1.05]} position={[0, 0.475, -0.75]} m={brick} />
      <Box size={[2.74, 0.08, 1.09]} position={[0, 0.99, -0.75]} m={trim} />
      <WindowGrid w={2.5} h={0.7} floors={2} cols={10} position={[0, 0.5, -0.215]} pane="#bfe3ff" frame="#fdf6ea" />
      {/* Portico with columns and a pediment. */}
      <Box size={[1.1, 0.06, 0.45]} position={[0, 0.03, -0.0]} m={trim} />
      {[-0.42, -0.14, 0.14, 0.42].map((x) => <Cyl key={x} r={0.05} h={0.75} seg={12} position={[x, 0.43, 0.12]} m={trim} />)}
      <Box size={[1.1, 0.1, 0.5]} position={[0, 0.85, -0.02]} m={trim} />
      <Pediment w={1.12} d={0.52} h={0.24} position={[0, 0.9, -0.02]} m={trim} />
      <Sign size={0.08} color="#7a2e1d" position={[0, 0.85, 0.235]}>HUGHES UNIVERSITY</Sign>
      {/* Clock tower. */}
      <Box size={[0.55, 1.5, 0.55]} position={[0, 1.2, -0.9]} m={brick} />
      <Box size={[0.62, 0.08, 0.62]} position={[0, 1.97, -0.9]} m={trim} />
      <Clock position={[0, 1.68, -0.61]} />
      <Box size={[0.42, 0.35, 0.42]} position={[0, 2.18, -0.9]} m={trim} />
      <mesh position={[0, 2.62, -0.9]} rotation={[0, Math.PI / 4, 0]} material={roof} castShadow><coneGeometry args={[0.38, 0.55, 4]} /></mesh>
      {/* The quad. */}
      <Box size={[0.3, 0.01, 1.1]} position={[0, 0.03, 0.85]} m={mat('#efe3c8')} shadow={false} />
      {[[-1.0, 0.7], [1.0, 0.7], [-0.6, 1.25], [0.6, 1.25]].map(([x, z], k) => <Model key={k} url={k < 2 ? TREES.round : TREES.oak} position={[x, 0, z]} scale={0.42} />)}
      <Model url={M('holiday', 'bench')} position={[-0.5, 0.02, 0.6]} rotation={Math.PI / 2} scale={0.3} />
      <Model url={M('holiday', 'bench')} position={[0.5, 0.02, 0.6]} rotation={-Math.PI / 2} scale={0.3} />
    </group>
  );
}

/* ── Contact: the post office ─────────────────────────────────────── */

function PaperPlane() {
  const g = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.6;
    if (!g.current) return;
    g.current.position.set(Math.cos(t) * 1.2, 1.6 + Math.sin(t * 2) * 0.15, Math.sin(t) * 1.2);
    g.current.rotation.set(0, -t, Math.sin(t * 2) * 0.2);
  });
  const geo = useMemo(() => {
    const gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.18, -0.1, 0, -0.08, 0, 0.02, -0.04, 0, 0, 0.18, 0, 0.02, -0.04, 0.1, 0, -0.08, 0, 0, 0.18, 0, 0.02, -0.04, 0, -0.05, -0.06], 3));
    gg.computeVertexNormals();
    return gg;
  }, []);
  return (
    <group ref={g}>
      <mesh geometry={geo} castShadow rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function PostOffice() {
  return (
    <group>
      <Box size={[2.1, 0.9, 1.3]} position={[0, 0.45, -0.35]} color="#eef4fb" />
      <Box size={[2.14, 0.22, 1.34]} position={[0, 1.0, -0.35]} color="#2a6fdb" />
      <Box size={[2.15, 0.04, 1.35]} position={[0, 0.88, -0.35]} color="#e63946" />
      <Sign size={0.15} color="#ffffff" position={[0, 1.0, 0.34]}>POST OFFICE</Sign>
      <WindowGrid w={1.8} h={0.42} floors={1} cols={4} position={[0, 0.5, 0.31]} pane="#bfe3ff" frame="#2a6fdb" />
      <Box size={[0.42, 0.55, 0.03]} position={[0, 0.275, 0.31]} m={mat('#9fd0ff', GLASS)} />
      <Box size={[0.6, 0.04, 0.3]} position={[0, 0.6, 0.45]} color="#2a6fdb" />
      {[-0.55, 0.55].map((x) => (
        <group key={x} position={[x, 0, 0.75]}>
          <Box size={[0.16, 0.22, 0.14]} position={[0, 0.17, 0]} color="#2a6fdb" />
          <Cyl r={0.08} h={0.14} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.28, 0]} color="#2a6fdb" />
          <Box size={[0.1, 0.012, 0.01]} position={[0, 0.24, 0.072]} color="#ffffff" shadow={false} />
          <Box size={[0.04, 0.06, 0.04]} position={[0, 0.03, 0]} color="#1b3f80" />
        </group>
      ))}
      <Flag position={[1.25, 0, 0.9]} color="#e63946" />
      <Model url={M('cars', 'delivery')} position={[-1.05, 0.02, 0.95]} rotation={0} scale={0.13} tint="#ffffff" />
      <PaperPlane />
    </group>
  );
}

/* ── About: Ray's house ───────────────────────────────────────────── */

export function Home() {
  const water = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4cd3f0', roughness: 0.05, metalness: 0.1, emissive: '#1aa6d6', emissiveIntensity: 0.25 }), []);
  return (
    <group position={[0.75, 0, 0.75]}>
      <Model url={M('suburban', 'building-type-t')} position={[0, 0, -0.15]} scale={0.95} tint="#fff3e0" />
      {/* A Florida back yard: a pool and a palm. */}
      <Box size={[0.75, 0.04, 0.42]} position={[-0.25, 0.03, 0.62]} color="#f4f4f4" />
      <Box size={[0.65, 0.02, 0.32]} position={[-0.25, 0.045, 0.62]} m={water} shadow={false} />
      <Model url={TREES.palmBig} position={[0.55, 0, 0.62]} scale={0.48} />
      {/* The mailbox with the name on it. */}
      <group position={[0.35, 0, 0.7]}>
        <Cyl r={0.015} h={0.18} position={[0, 0.09, 0]} color="#7b5a3c" />
        <Box size={[0.12, 0.08, 0.07]} position={[0, 0.2, 0]} color="#e63946" />
      </group>
      <Model url={M('cars', 'suv')} position={[-0.6, 0.02, -0.1]} rotation={0} scale={0.12} tint="#2a9d8f" />
    </group>
  );
}

/* ── The empty lot: what is next ──────────────────────────────────── */

function Dozer() {
  const g = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.35;
    if (!g.current) return;
    g.current.position.x = Math.sin(t) * 0.7;
    g.current.rotation.y = Math.cos(t) > 0 ? Math.PI / 2 : -Math.PI / 2;
  });
  return <group ref={g} position={[-0.2, 0.02, 0.55]}><Model url={M('cars', 'tractor-shovel')} scale={0.14} /></group>;
}

export function Yard() {
  const steel = mat('#d6dbe2', { metal: 0.5, rough: 0.4 });
  const beams = [];
  for (let f = 0; f < 3; f++) {
    const y = 0.2 + f * 0.42;
    for (const x of [-0.7, 0, 0.7]) for (const z of [-0.9, -0.3]) {
      if (f === 2 && x > 0.3) continue;
      beams.push(<Box key={`c${f}${x}${z}`} size={[0.05, 0.42, 0.05]} position={[x, y + 0.21, z]} m={steel} />);
    }
    beams.push(<Box key={`b${f}a`} size={[f === 2 ? 0.75 : 1.45, 0.05, 0.05]} position={[f === 2 ? -0.35 : 0, y + 0.42, -0.9]} m={steel} />);
    beams.push(<Box key={`b${f}b`} size={[f === 2 ? 0.75 : 1.45, 0.05, 0.05]} position={[f === 2 ? -0.35 : 0, y + 0.42, -0.3]} m={steel} />);
  }
  return (
    <group>
      <Box size={[1.7, 0.2, 0.9]} position={[0, 0.1, -0.6]} color="#bfc3c9" />
      {beams}
      <Box size={[1.45, 0.03, 0.62]} position={[0, 0.645, -0.6]} color="#c7ccd3" />
      <TowerCrane position={[-1.1, 0, 0.2]} height={3.2} jib={2.0} phase={0.4} />
      <Dozer />
      <Model url={M('cars', 'truck-flat')} position={[1.0, 0.02, 0.1]} rotation={Math.PI} scale={0.16} />
      <Box size={[0.4, 0.18, 0.35]} position={[1.0, 0.09, 1.0]} color="#a0703d" />
      {/* The billboard. */}
      <group position={[0.75, 0, 1.2]} rotation={[0, -0.35, 0]}>
        {[-0.45, 0.45].map((x) => <Cyl key={x} r={0.02} h={0.55} position={[x, 0.27, 0]} color="#888" />)}
        <Box size={[1.1, 0.42, 0.04]} position={[0, 0.72, 0]} color="#ffd166" />
        <Box size={[1.1, 0.06, 0.05]} position={[0, 0.54, 0]} color="#222" />
        <Box size={[1.1, 0.06, 0.05]} position={[0, 0.9, 0]} color="#222" />
        <Sign size={0.11} color="#222" position={[0, 0.76, 0.025]}>COMING SOON</Sign>
        <Sign size={0.065} color="#222" position={[0, 0.65, 0.025]}>THE NEXT PROJECT</Sign>
      </group>
      {/* Hoarding round the back and sides, striped like the real thing. */}
      {[[0, -1.4, 0, 2.7], [-1.4, -0.4, Math.PI / 2, 1.9], [1.4, -0.4, Math.PI / 2, 1.9]].map(([x, z, ry, w], k) => (
        <group key={k} position={[x, 0, z]} rotation={[0, ry, 0]}>
          <Box size={[w, 0.16, 0.025]} position={[0, 0.1, 0]} color="#ffffff" />
          {Array.from({ length: Math.floor(w / 0.18) }, (_, i) => (
            <Box key={i} size={[0.07, 0.16, 0.03]} position={[-w / 2 + 0.09 + i * 0.18, 0.1, 0]} color="#ff7a1a" shadow={false} />
          ))}
        </group>
      ))}
      {[[-1.35, 1.35], [1.35, 1.35], [1.35, -0.2]].map(([x, z], k) => <Model key={k} url={M('roads', 'construction-light')} position={[x, 0.02, z]} scale={1.6} />)}
    </group>
  );
}

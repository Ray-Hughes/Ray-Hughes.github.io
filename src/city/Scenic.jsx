import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { M, rng } from './kit';
import { RAIL } from './layout';
import { Box, Cyl, Model, mat, FONT } from './parts';
import { glowMat } from './buildings';

/* ─────────────────────────────────────────────────────────────────────
   Everything that makes the town feel inhabited without being clickable:
   the train, the boats, the clouds and gulls, the beach and the harbour.
───────────────────────────────────────────────────────────────────── */

/* ── Railway ──────────────────────────────────────────────────────── */

function railCurve() {
  const { hx, hz, r } = RAIL;
  const pts = [];
  const corner = (cx, cz, a0) => {
    for (let k = 0; k <= 8; k++) {
      const a = a0 + (k / 8) * (Math.PI / 2);
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r));
    }
  };
  corner(hx - r, hz - r, 0);
  corner(-hx + r, hz - r, Math.PI / 2);
  corner(-hx + r, -hz + r, Math.PI);
  corner(hx - r, -hz + r, (3 * Math.PI) / 2);
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
}

function Track({ curve }) {
  const { bed, sleepers, rails } = useMemo(() => {
    const len = curve.getLength();
    const n = Math.floor(len / 0.16);
    const sl = [];
    const railPts = [[], []];
    const bedGeo = [];
    for (let k = 0; k < n; k++) {
      const u = k / n;
      const p = curve.getPointAt(u);
      const t = curve.getTangentAt(u);
      const side = new THREE.Vector3(-t.z, 0, t.x);
      const m = new THREE.Matrix4().makeRotationY(Math.atan2(t.x, t.z)).setPosition(p.x, 0.035, p.z);
      const g = new THREE.BoxGeometry(0.34, 0.03, 0.06);
      g.applyMatrix4(m);
      sl.push(g);
      const b = new THREE.BoxGeometry(0.48, 0.03, 0.18);
      b.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.atan2(t.x, t.z)).setPosition(p.x, 0.012, p.z));
      bedGeo.push(b);
      railPts[0].push(p.clone().addScaledVector(side, 0.1).setY(0.065));
      railPts[1].push(p.clone().addScaledVector(side, -0.1).setY(0.065));
    }
    const railGeos = railPts.map((ps) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ps, true), n, 0.012, 4, true));
    return { bed: mergeGeometries(bedGeo), sleepers: mergeGeometries(sl), rails: mergeGeometries(railGeos) };
  }, [curve]);
  return (
    <group>
      <mesh geometry={bed} receiveShadow material={mat('#b9b0a2', { rough: 1 })} />
      <mesh geometry={sleepers} receiveShadow castShadow material={mat('#8a5a3b')} />
      <mesh geometry={rails} castShadow material={mat('#b8c0cc', { metal: 0.8, rough: 0.3 })} />
    </group>
  );
}

function Train({ curve }) {
  const gl = useGLTF([M('train', 'train-electric-city-a'), M('train', 'train-electric-city-b')]);
  const cars = useMemo(() => [0, 1, 2, 3].map((k) => {
    const o = (k === 0 || k === 3 ? gl[0] : gl[1]).scene.clone(true);
    o.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
    o.scale.setScalar(0.3);
    if (k === 3) o.rotation.y = Math.PI; // the cab at the back faces back
    const h = new THREE.Group();
    h.add(o);
    return h;
  }), [gl]);
  const len = useMemo(() => curve.getLength(), [curve]);
  const u = useRef(0.2);
  const v = useRef(1);
  const dwellUntil = useRef(0);
  const look = useMemo(() => new THREE.Vector3(), []);
  // Where along the loop the platform is, found rather than guessed.
  const station = useMemo(() => {
    let best = 0, bestD = Infinity;
    for (let k = 0; k < 400; k++) {
      const p = curve.getPointAt(k / 400);
      const d = Math.hypot(p.x + 11.75, p.z - 0.05);
      if (d < bestD) { bestD = d; best = k / 400; }
    }
    return best;
  }, [curve]);
  useFrame(({ clock }, raw) => {
    const dt = Math.min(raw, 0.05);
    // Brake into the station, wait there a few seconds, pull away.
    const ahead = (((station - u.current) % 1) + 1) % 1 * len;
    const now = clock.elapsedTime;
    const want = now < dwellUntil.current ? 0 : ahead < 2.5 && ahead > 0.02 ? Math.max(0.12, ahead / 2.5) : 1;
    v.current = THREE.MathUtils.damp(v.current, want, 3, dt);
    const before = u.current;
    u.current = (u.current + (dt * 1.0 * v.current) / len) % 1;
    const crossed = ahead <= (dt * v.current) + 0.02 && now > dwellUntil.current + 5;
    if (crossed && before !== u.current) dwellUntil.current = now + 4;
    cars.forEach((c, k) => {
      const uk = (u.current - (k * 0.78) / len + 1) % 1;
      const p = curve.getPointAt(uk);
      c.position.set(p.x, 0.07, p.z);
      look.copy(curve.getPointAt((uk + 0.002) % 1));
      c.lookAt(look.x, 0.07, look.z);
    });
  });
  return cars.map((c, k) => <primitive key={k} object={c} />);
}

function Station() {
  return (
    <group position={[-12.35, 0, 0.05]}>
      <Box size={[0.5, 0.08, 2.2]} position={[0, 0.04, 0]} color="#d8d2c6" />
      {[-0.9, 0, 0.9].map((z) => <Cyl key={z} r={0.025} h={0.5} position={[0.12, 0.33, z]} color="#2f4858" />)}
      <Box size={[0.55, 0.04, 2.3]} position={[0.02, 0.6, 0]} rotation={[0, 0, -0.12]} color="#e76f51" />
      <Text font={FONT} fontSize={0.12} color="#2f4858" position={[0.26, 0.48, 0]} rotation={[0, Math.PI / 2, 0]}>STATION</Text>
    </group>
  );
}

/* ── Water ────────────────────────────────────────────────────────── */

function Sailing({ url, radius, speed, phase, scale, cx = 0, cz = 0, rx, rz }) {
  const g = useRef();
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime * speed + phase;
    const x = cx + Math.cos(t) * (rx ?? radius), z = cz + Math.sin(t) * (rz ?? radius);
    g.current.position.set(x, -0.1 + Math.sin(clock.elapsedTime * 1.7 + phase) * 0.02, z);
    // Heading along the ellipse, with a gentle roll.
    g.current.rotation.set(0, Math.atan2(-Math.sin(t) * (rx ?? radius) * Math.sign(speed), Math.cos(t) * (rz ?? radius) * Math.sign(speed)), Math.sin(clock.elapsedTime * 1.3 + phase) * 0.05);
  });
  return <group ref={g}><Model url={url} scale={scale} /></group>;
}

function Pier() {
  const planks = [];
  for (let x = 14.2; x < 19.2; x += 0.22) planks.push(<Box key={x} size={[0.2, 0.04, 0.8]} position={[x, 0.02, 0]} color={x % 0.44 < 0.22 ? '#b98552' : '#a8774a'} shadow={false} />);
  return (
    <group position={[0, 0, 6.0]}>
      {planks}
      {[14.5, 15.7, 16.9, 18.1, 19.0].flatMap((x) => [-0.36, 0.36].map((z) => <Cyl key={`${x}${z}`} r={0.04} h={0.4} position={[x, -0.15, z]} color="#7b5536" />))}
      <Model url={M('boats', 'ship-cargo-a')} position={[17.0, -0.12, 1.45]} rotation={Math.PI / 2} scale={0.3} />
      <Model url={M('boats', 'boat-fishing-small')} position={[15.4, -0.12, -0.8]} rotation={-Math.PI / 2} scale={0.25} />
      <Model url={M('boats', 'buoy-flag')} position={[19.8, -0.12, -1.3]} scale={0.22} />
    </group>
  );
}

function Lighthouse() {
  const beam = useRef();
  const lamp = useMemo(() => glowMat('#fff2a8', 5), []);
  useFrame((_, dt) => { if (beam.current) beam.current.rotation.y += dt * 0.9; });
  const stripes = [0, 1, 2, 3, 4];
  return (
    <group position={[13.5, 0, -11.3]}>
      <Model url={M('nature', 'rock_largeA')} position={[0.35, -0.05, 0.3]} scale={1.2} />
      <Model url={M('nature', 'rock_largeB')} position={[-0.4, -0.05, 0.1]} scale={1.0} />
      <Cyl r={0.42} h={0.18} position={[0, 0.05, 0]} color="#c9c2b5" />
      {stripes.map((k) => <Cyl key={k} r={0.3 - k * 0.025} rt={0.3 - (k + 1) * 0.025} h={0.36} position={[0, 0.32 + k * 0.36, 0]} color={k % 2 ? '#ffffff' : '#e63946'} />)}
      <Cyl r={0.24} h={0.04} position={[0, 2.12, 0]} color="#2b2d42" />
      <mesh position={[0, 2.28, 0]} material={lamp}><cylinderGeometry args={[0.13, 0.13, 0.26, 12]} /></mesh>
      <mesh position={[0, 2.5, 0]} castShadow material={mat('#e63946')}><coneGeometry args={[0.2, 0.22, 12]} /></mesh>
      <group ref={beam} position={[0, 2.28, 0]}>
        <mesh position={[2.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.35, 4.4, 16, 1, true]} />
          <meshBasicMaterial color="#fff6c9" transparent opacity={0.08} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Sky ──────────────────────────────────────────────────────────── */

function Clouds({ count = 9 }) {
  const group = useRef();
  const clouds = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: count }, () => {
      const puffs = [];
      const n = 4 + Math.floor(r() * 4);
      for (let k = 0; k < n; k++) {
        const g = new THREE.IcosahedronGeometry(0.5 + r() * 0.6, 1);
        g.translate((k - n / 2) * 0.7 + r() * 0.3, r() * 0.35, (r() - 0.5) * 0.8);
        puffs.push(g);
      }
      const base = mergeGeometries(puffs);
      base.scale(1, 0.62, 1);
      return { geo: base, x: -26 + r() * 52, z: -22 + r() * 40, y: 9 + r() * 4, s: 0.8 + r() * 0.8, v: 0.25 + r() * 0.25 };
    });
  }, [count]);
  const m = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, flatShading: true, emissive: '#dfefff', emissiveIntensity: 0.35 }), []);
  useFrame((_, dt) => {
    group.current?.children.forEach((c, k) => {
      c.position.x += clouds[k].v * Math.min(dt, 0.05);
      if (c.position.x > 30) c.position.x = -30;
    });
  });
  return (
    <group ref={group}>
      {clouds.map((c, k) => <mesh key={k} geometry={c.geo} material={m} position={[c.x, c.y, c.z]} scale={c.s} castShadow />)}
    </group>
  );
}

function Gulls({ count = 7 }) {
  const birds = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: count }, () => ({ cx: (r() - 0.5) * 20, cz: 8 + r() * 6, rad: 1.5 + r() * 2.5, y: 3 + r() * 2, sp: (0.25 + r() * 0.3) * (r() < 0.5 ? -1 : 1), ph: r() * 6 }));
  }, [count]);
  const refs = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    birds.forEach((b, k) => {
      const g = refs.current[k];
      if (!g) return;
      const a = t * b.sp + b.ph;
      g.position.set(b.cx + Math.cos(a) * b.rad, b.y + Math.sin(t * 0.7 + b.ph) * 0.2, b.cz + Math.sin(a) * b.rad);
      g.rotation.y = -a + (b.sp > 0 ? Math.PI : 0);
      const flap = Math.sin(t * 9 + b.ph) * 0.5;
      g.children[0].rotation.z = 0.25 + flap;
      g.children[1].rotation.z = -0.25 - flap;
    });
  });
  const wing = mat('#ffffff');
  return birds.map((b, k) => (
    <group key={k} ref={(el) => { refs.current[k] = el; }}>
      <mesh material={wing} position={[0, 0, 0]}><boxGeometry args={[0.02, 0.01, 0.3]} /></mesh>
      <mesh material={wing} position={[0, 0, 0]}><boxGeometry args={[0.02, 0.01, 0.3]} /></mesh>
    </group>
  ));
}

/* ── Beach ────────────────────────────────────────────────────────── */

function Beach() {
  const items = useMemo(() => {
    const r = rng(23);
    const out = [];
    for (let x = -10; x <= 10; x += 1.7 + r() * 0.8) {
      const z = 14.1 + r() * 0.3;
      out.push({ x, z, towel: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe', '#ff9ff3'][Math.floor(r() * 5)], rot: (r() - 0.5) * 0.6 });
    }
    return out;
  }, []);
  return (
    <group>
      {items.map((it, k) => (
        <group key={k} position={[it.x, -0.045, it.z]} rotation={[0, it.rot, 0]}>
          <Model url={M('commercial', 'detail-parasol-a')} scale={1.3} position={[0, 0, -0.15]} tint={['#ff6b6b', '#4ecdc4', '#ffd166'][k % 3]} />
          <Box size={[0.22, 0.008, 0.4]} position={[0.22, 0.004, 0.05]} color={it.towel} shadow={false} />
        </group>
      ))}
      {/* Lifeguard tower. */}
      <group position={[3.4, -0.045, 14.0]}>
        {[[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]].map(([x, z], k) => <Box key={k} size={[0.03, 0.4, 0.03]} position={[x, 0.2, z]} color="#f1faee" />)}
        <Box size={[0.36, 0.2, 0.36]} position={[0, 0.5, 0]} color="#e63946" />
        <Box size={[0.42, 0.04, 0.42]} position={[0, 0.62, 0]} color="#f1faee" />
        <Box size={[0.03, 0.4, 0.03]} position={[0.15, 0.82, 0.15]} color="#f1faee" />
      </group>
    </group>
  );
}

/** The name, in letters you could sit on, on the lawn above the beach. */
function BigLetters() {
  const word = 'RAY HUGHES';
  const colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7', '#748ffc', '#da77f2', '#f783ac', '#ff8787'];
  const letters = word.split('');
  const w = 0.62;
  return (
    <group position={[-((letters.length - 1) * w) / 2, 0, 12.05]}>
      {letters.map((ch, k) => ch === ' ' ? null : (
        <group key={k} position={[k * w, 0, 0]}>
          {/* Stacked copies, darker behind, read as a solid extruded letter. */}
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <Text
              key={d}
              font={FONT}
              fontSize={0.95}
              anchorX="center"
              anchorY="bottom"
              position={[0, 0, -d * 0.025]}
              color={d === 0 ? colors[k] : new THREE.Color(colors[k]).multiplyScalar(0.62).getStyle()}
              outlineWidth={d === 0 ? 0.02 : 0}
              outlineColor="#ffffff"
            >
              {ch}
            </Text>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function Scenic() {
  const curve = useMemo(railCurve, []);
  return (
    <group>
      <Track curve={curve} />
      <Train curve={curve} />
      <Station />
      <Pier />
      <Lighthouse />
        <Sailing url={M('boats', 'boat-sail-a')} rx={19} rz={17} cz={0.5} speed={0.025} phase={0.4} scale={0.22} />
        <Sailing url={M('boats', 'boat-sail-b')} rx={18.2} rz={16.4} cz={0.5} speed={-0.03} phase={2.6} scale={0.22} />
        <Sailing url={M('boats', 'boat-speed-a')} rx={20.5} rz={18} cz={0.5} speed={0.07} phase={4.0} scale={0.2} />
        <Sailing url={M('boats', 'boat-sail-a')} rx={22} rz={19.5} cz={0.5} speed={-0.02} phase={5.1} scale={0.25} />
        <Sailing url={M('boats', 'boat-tug-a')} rx={2.2} rz={1.4} cx={19} cz={3.5} speed={0.15} phase={1} scale={0.2} />
      <Beach />
      <BigLetters />
      <Clouds />
      <Gulls />
    </group>
  );
}

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────────────
   Pieces the landmarks are built from.

   The kit has no hospital, temple or cinema, so those are modelled here out
   of boxes and cylinders, in the same chunky, slightly rounded style as the
   kit so the two sit together. Materials are cached by their settings:
   a city of boxes is a lot of materials otherwise.
───────────────────────────────────────────────────────────────────── */

export const FONT = '/fonts/LilitaOne-Regular.ttf';

const cache = new Map();
export function mat(color, { rough = 0.8, metal = 0, emissive, glow = 0, opacity } = {}) {
  const k = [color, rough, metal, emissive, glow, opacity].join('|');
  if (!cache.has(k)) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    if (emissive) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = glow; }
    if (opacity !== undefined) { m.transparent = true; m.opacity = opacity; }
    cache.set(k, m);
  }
  return cache.get(k);
}

export const GLASS = { rough: 0.08, metal: 0.55 };

export function Box({ size = [1, 1, 1], position, rotation, color = '#fff', m, shadow = true, ...rest }) {
  return (
    <mesh position={position} rotation={rotation} castShadow={shadow} receiveShadow material={m || mat(color)} {...rest}>
      <boxGeometry args={size} />
    </mesh>
  );
}

export function Cyl({ r = 0.5, rt, h = 1, seg = 20, position, rotation, color = '#fff', m, shadow = true, ...rest }) {
  return (
    <mesh position={position} rotation={rotation} castShadow={shadow} receiveShadow material={m || mat(color)} {...rest}>
      <cylinderGeometry args={[rt ?? r, r, h, seg]} />
    </mesh>
  );
}

/** Lettering in the sign font. Flat, so it sits on a facade like paint. */
export function Sign({ children, size = 0.2, color = '#fff', outline, position, rotation, anchorY = 'middle', glow, ...rest }) {
  return (
    <Text
      font={FONT}
      fontSize={size}
      color={color}
      anchorX="center"
      anchorY={anchorY}
      position={position}
      rotation={rotation}
      outlineWidth={outline ? size * 0.08 : 0}
      outlineColor={outline}
      material-toneMapped={!glow}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** A row of windows: thin dark-blue panes with a white frame, one per floor. */
export function WindowGrid({ w, h, floors, cols, position, rotation, pane = '#7ec8ff', frame = '#ffffff', lit = 0 }) {
  const panes = useMemo(() => {
    const out = [];
    const cw = w / cols, fh = h / floors;
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
      out.push([-w / 2 + cw * (c + 0.5), fh * (f + 0.5) - h / 2, cw * 0.62, fh * 0.55]);
    }
    return out;
  }, [w, h, floors, cols]);
  const paneMat = lit ? mat(pane, { ...GLASS, emissive: '#ffd27a', glow: lit }) : mat(pane, GLASS);
  return (
    <group position={position} rotation={rotation}>
      {panes.map(([x, y, pw, ph], k) => (
        <group key={k} position={[x, y, 0]}>
          <mesh material={mat(frame)}><boxGeometry args={[pw + 0.04, ph + 0.04, 0.02]} /></mesh>
          <mesh position={[0, 0, 0.012]} material={paneMat}><boxGeometry args={[pw, ph, 0.01]} /></mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * A tower crane: a lattice mast, a jib that slews slowly, and a hook on a
 * cable that swings as it goes. Construction is the visual promise of the
 * projects district, so these are what say "being built" from a distance.
 */
export function TowerCrane({ position, height = 4.2, jib = 2.6, speed = 0.12, phase = 0, color = '#ffc93c' }) {
  const head = useRef();
  const hook = useRef();
  const lattice = useMemo(() => {
    const segs = [];
    const n = Math.round(height / 0.25);
    for (let i = 0; i < n; i++) segs.push(i * 0.25 + 0.125);
    return segs;
  }, [height]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    if (head.current) head.current.rotation.y = Math.sin(t) * 1.3 + t * 0.15;
    if (hook.current) {
      hook.current.position.x = 1.0 + Math.sin(t * 2.1) * 0.5;
      hook.current.rotation.z = Math.sin(clock.elapsedTime * 1.3 + phase) * 0.05;
    }
  });
  const y = mat(color, { rough: 0.6 });
  const dark = mat('#3b3f4a');
  return (
    <group position={position}>
      <Box size={[0.42, 0.12, 0.42]} position={[0, 0.06, 0]} m={mat('#9aa0a8')} />
      {/* Mast: four legs and cross bars, so it reads as lattice not as a post. */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], k) => (
        <Box key={k} size={[0.035, height, 0.035]} position={[sx * 0.1, height / 2, sz * 0.1]} m={y} />
      ))}
      {lattice.map((ly, k) => (
        <group key={k} position={[0, ly, 0]}>
          <Box size={[0.2, 0.02, 0.02]} position={[0, 0, 0.1]} rotation={[0, 0, k % 2 ? 0.8 : -0.8]} m={y} shadow={false} />
          <Box size={[0.02, 0.02, 0.2]} position={[0.1, 0, 0]} rotation={[k % 2 ? 0.8 : -0.8, 0, 0]} m={y} shadow={false} />
        </group>
      ))}
      <group ref={head} position={[0, height, 0]}>
        <Box size={[0.3, 0.22, 0.26]} position={[0, 0.11, 0]} m={y} />
        <Box size={[0.16, 0.14, 0.18]} position={[0.12, 0.26, 0]} m={mat('#e8f4ff', GLASS)} />
        <Box size={[jib, 0.09, 0.12]} position={[jib / 2, 0.26, 0]} m={y} />
        <Box size={[0.9, 0.08, 0.12]} position={[-0.45, 0.26, 0]} m={y} />
        <Box size={[0.32, 0.22, 0.2]} position={[-0.75, 0.16, 0]} m={mat('#8d929a')} />
        <Box size={[0.04, 0.5, 0.04]} position={[0, 0.5, 0]} m={y} />
        <group ref={hook} position={[1.0, 0.22, 0]}>
          <Box size={[0.08, 0.05, 0.1]} position={[0, 0, 0]} m={dark} />
          <Box size={[0.008, 1.4, 0.008]} position={[0, -0.7, 0]} m={dark} shadow={false} />
          <Box size={[0.05, 0.06, 0.05]} position={[0, -1.42, 0]} m={mat('#e04f3f')} />
          {/* The load: a pallet of something, so the hook has a job. */}
          <Box size={[0.22, 0.12, 0.16]} position={[0, -1.54, 0]} m={mat('#c58a4b')} />
        </group>
      </group>
    </group>
  );
}

/**
 * Bulbs that chase round a frame, the way a cinema marquee does. One
 * emissive material per phase, so a hundred bulbs cost three materials.
 */
export function Bulbs({ points, color = '#ffe27a', r = 0.022, speed = 7 }) {
  const mats = useMemo(() => [0, 1, 2].map(() => {
    const m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2 });
    m.toneMapped = false;
    return m;
  }), [color]);
  useFrame(({ clock }) => {
    const step = Math.floor(clock.elapsedTime * speed) % 3;
    mats.forEach((m, k) => { m.emissiveIntensity = k === step ? 4.5 : 0.6; });
  });
  const geo = useMemo(() => new THREE.SphereGeometry(r, 8, 6), [r]);
  return points.map((p, k) => <mesh key={k} position={p} geometry={geo} material={mats[k % 3]} />);
}

/** Points along a rectangle's edges, for the bulbs. */
export function rectPoints(w, h, step, z = 0) {
  const out = [];
  for (let x = -w / 2; x <= w / 2 + 1e-6; x += step) { out.push([x, h / 2, z]); out.push([x, -h / 2, z]); }
  for (let y = -h / 2 + step; y < h / 2 - 1e-6; y += step) { out.push([-w / 2, y, z]); out.push([w / 2, y, z]); }
  return out;
}

/** A flag that ripples: a strip of segments, each a beat behind the last. */
export function Flag({ position, color = '#e63946', h = 1.4 }) {
  const cloth = useRef();
  const geo = useMemo(() => new THREE.PlaneGeometry(0.5, 0.3, 12, 1), []);
  const base = useMemo(() => geo.attributes.position.array.slice(), [geo]);
  useFrame(({ clock }) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3] + 0.25;
      p.setZ(i, Math.sin(x * 9 - clock.elapsedTime * 6) * 0.04 * x);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return (
    <group position={position}>
      <Cyl r={0.018} h={h} position={[0, h / 2, 0]} color="#d9dde3" />
      <Cyl r={0.03} h={0.03} position={[0, h + 0.015, 0]} color="#ffd166" />
      <mesh ref={cloth} geometry={geo} position={[0.26, h - 0.18, 0]} castShadow>
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Scaffolding: a grid of poles and planks against a wall. */
export function Scaffold({ w = 1.6, h = 1.4, position, rotation }) {
  const poles = [];
  const nx = Math.max(2, Math.round(w / 0.4) + 1), ny = Math.max(2, Math.round(h / 0.35));
  for (let i = 0; i < nx; i++) poles.push(-w / 2 + (w * i) / (nx - 1));
  const pole = mat('#9aa3ad', { metal: 0.4, rough: 0.5 });
  const plank = mat('#d29a58');
  return (
    <group position={position} rotation={rotation}>
      {poles.map((x, k) => (
        <group key={k}>
          <Box size={[0.025, h, 0.025]} position={[x, h / 2, 0]} m={pole} shadow={false} />
          <Box size={[0.025, h, 0.025]} position={[x, h / 2, 0.22]} m={pole} shadow={false} />
        </group>
      ))}
      {Array.from({ length: ny }, (_, k) => (k + 1) * (h / ny)).map((y, k) => (
        <group key={k} position={[0, y, 0.11]}>
          <Box size={[w, 0.025, 0.24]} m={plank} />
          <Box size={[w, 0.015, 0.015]} position={[0, 0.16, 0.11]} m={pole} shadow={false} />
        </group>
      ))}
    </group>
  );
}

/** One kit model, placed. Clones share geometry, so repeats are cheap. */
export function Model({ url, position, rotation = 0, scale = 1, tint, center = false, ...rest }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => {
    const o = scene.clone(true);
    o.traverse((c) => {
      if (!c.isMesh) return;
      c.castShadow = true;
      c.receiveShadow = true;
      if (tint) { c.material = c.material.clone(); c.material.color = new THREE.Color(tint); }
    });
    if (!center) return o;
    // Furniture is modelled from a corner. Centre it on its footprint so it
    // can be placed and turned about its middle like everything else.
    const box = new THREE.Box3().setFromObject(o);
    const wrap = new THREE.Group();
    o.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
    wrap.add(o);
    return wrap;
  }, [scene, tint, center]);
  return <primitive object={obj} position={position} rotation={[0, rotation, 0]} scale={scale} {...rest} />;
}

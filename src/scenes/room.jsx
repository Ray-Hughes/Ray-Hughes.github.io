import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, Cyl, Model } from '../city/parts';
import { M } from '../city/kit';

/* ─────────────────────────────────────────────────────────────────────
   Pieces every interior shares: the floor and its base, the two walls
   with their windows, what is seen through those windows, and the small
   moving things that make a room feel lived in.
───────────────────────────────────────────────────────────────────── */

export const F = (n) => M('furniture', n);

const canvasTex = (w, h, draw, repeat) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
};

/** A flat picture: anything drawn on a canvas, unlit so it reads true. */
export function Screen({ tex, size, position, rotation, lit = true }) {
  const m = useMemo(() => {
    const mm = lit ? new THREE.MeshBasicMaterial({ map: tex }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
    mm.toneMapped = !lit;
    return mm;
  }, [tex, lit]);
  return (
    <mesh position={position} rotation={rotation} material={m}>
      <planeGeometry args={size} />
    </mesh>
  );
}

/** Wood boards, or tiles, across the floor. */
export function Floor({ w, d, kind = 'wood', tones }) {
  const tex = useMemo(() => canvasTex(256, 256, (g) => {
    if (kind === 'tile') {
      const t = tones || ['#eef1f4', '#e4e8ee'];
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        g.fillStyle = t[(x + y) % t.length]; g.fillRect(x * 64, y * 64, 64, 64);
        g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(x * 64, y * 64, 64, 2); g.fillRect(x * 64, y * 64, 2, 64);
      }
      return;
    }
    const t = tones || ['#d9bd93', '#d3b68b', '#dec49c', '#cfb185'];
    for (let row = 0; row < 8; row++) {
      let x = -(row % 3) * 40;
      while (x < 256) {
        const bw = 80 + ((row * 37 + x) % 50);
        g.fillStyle = t[(row + Math.abs(x)) % t.length];
        g.fillRect(x, row * 32, bw, 32);
        g.fillStyle = 'rgba(90,60,30,0.25)'; g.fillRect(x, row * 32, 2, 32);
        x += bw;
      }
      g.fillStyle = 'rgba(90,60,30,0.3)'; g.fillRect(0, row * 32, 256, 2);
    }
  }, [w / 1.6, d / 1.6]), [w, d, kind, tones]);
  return (
    <group>
      <Box size={[w + 0.3, 0.3, d + 0.3]} position={[0, -0.15, 0]} color={kind === 'tile' ? '#e9edf2' : '#d8c09a'} />
      <Box size={[w + 0.36, 0.08, d + 0.36]} position={[0, -0.32, 0]} color="#3b3f4a" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[w + 0.1, d + 0.1]} />
        <meshStandardMaterial map={tex} roughness={0.65} />
      </mesh>
    </group>
  );
}

/**
 * The back wall (along x at −d/2) and the left wall (along z at −w/2), built
 * from the kit's wall pieces. `gaps` lists piece indexes that are plain wall
 * rather than window, for things to hang on.
 */
export function Walls({ w, d, backPlain = [], sidePlain = [], color = '#f4efe6', tint }) {
  const nb = Math.round(w), ns = Math.round(d);
  return (
    <group>
      {Array.from({ length: nb }, (_, k) => (
        <Model key={`b${k}`} url={F(backPlain.includes(k) ? 'wall' : 'wallWindow')} position={[-w / 2 + k, 0, -d / 2]} tint={tint} />
      ))}
      {Array.from({ length: ns }, (_, k) => (
        <Model key={`s${k}`} url={F(sidePlain.includes(k) ? 'wall' : 'wallWindow')} position={[-w / 2, 0, d / 2 - k]} rotation={Math.PI / 2} tint={tint} />
      ))}
      <Box size={[w + 0.1, 0.06, 0.1]} position={[0, 1.32, -d / 2]} color={color} />
      <Box size={[0.1, 0.06, d + 0.1]} position={[-w / 2, 1.32, 0]} color={color} />
    </group>
  );
}

/** What the windows look out on: a city skyline, or the beach. */
export function Backdrop({ kind = 'city', w = 14, d = 12, back = -4.6, side = -5.6 }) {
  const tex = useMemo(() => canvasTex(1024, 256, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#7cc4ff'); grad.addColorStop(0.75, '#cfeaff'); grad.addColorStop(1, '#fff1d6');
    g.fillStyle = grad; g.fillRect(0, 0, 1024, 256);
    let s = 7;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    if (kind === 'beach') {
      g.fillStyle = '#3fb8d8'; g.fillRect(0, 170, 1024, 40);
      g.fillStyle = '#7ad7e8'; g.fillRect(0, 170, 1024, 6);
      g.fillStyle = '#f3dfa2'; g.fillRect(0, 205, 1024, 51);
      for (let k = 0; k < 9; k++) {
        const x = 40 + k * 120 + rnd() * 40, h = 90 + rnd() * 50;
        g.strokeStyle = '#8a5a3b'; g.lineWidth = 7;
        g.beginPath(); g.moveTo(x, 256); g.quadraticCurveTo(x + 14, 256 - h / 2, x + 6, 256 - h); g.stroke();
        g.fillStyle = '#3aa76d';
        for (let f = 0; f < 6; f++) {
          const a = (f / 6) * Math.PI * 2;
          g.beginPath(); g.ellipse(x + 6 + Math.cos(a) * 22, 256 - h + Math.sin(a) * 9, 26, 7, a, 0, Math.PI * 2); g.fill();
        }
      }
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(700, 168); g.lineTo(712, 120); g.lineTo(724, 168); g.fill();
      return;
    }
    let x = 0;
    while (x < 1024) {
      const bw = 30 + rnd() * 60, h = 50 + rnd() * 130;
      g.fillStyle = ['#a9c4e0', '#b8d0e8', '#9db8d6', '#c4d8ec'][Math.floor(rnd() * 4)];
      g.fillRect(x, 256 - h, bw, h);
      g.fillStyle = 'rgba(255,255,255,0.45)';
      for (let yy = 256 - h + 8; yy < 250; yy += 12) for (let xx = x + 5; xx < x + bw - 6; xx += 10) g.fillRect(xx, yy, 4, 5);
      x += bw + 4;
    }
  }), [kind]);
  return (
    <>
      <mesh position={[0, 1.1, back]}><planeGeometry args={[w, 3.5]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      <mesh position={[side, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[d, 3.5]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
    </>
  );
}

export function Steam({ position }) {
  const puffs = useRef([]);
  const mats = useMemo(() => [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false })), []);
  useFrame(({ clock }) => {
    puffs.current.forEach((p, k) => {
      if (!p) return;
      const t = (clock.elapsedTime * 0.5 + k / 3) % 1;
      p.position.set(Math.sin(t * 6 + k) * 0.015, t * 0.22, 0);
      p.scale.setScalar(0.4 + t);
      p.material.opacity = 0.45 * (1 - t);
    });
  });
  return (
    <group position={position}>
      {mats.map((m, k) => (
        <mesh key={k} ref={(el) => { puffs.current[k] = el; }} material={m}>
          <sphereGeometry args={[0.02, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

export function WallClock({ position, rotation }) {
  const hand = useRef();
  const min = useRef();
  useFrame(() => {
    const d = new Date();
    if (min.current) min.current.rotation.z = -((d.getMinutes() + d.getSeconds() / 60) / 60) * Math.PI * 2;
    if (hand.current) hand.current.rotation.z = -(((d.getHours() % 12) + d.getMinutes() / 60) / 12) * Math.PI * 2;
  });
  return (
    <group position={position} rotation={rotation}>
      <Cyl r={0.13} h={0.03} rotation={[Math.PI / 2, 0, 0]} color="#ffffff" />
      <Cyl r={0.14} h={0.02} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.01]} color="#2b2d42" />
      <group ref={hand} position={[0, 0, 0.02]}><Box size={[0.015, 0.07, 0.005]} position={[0, 0.035, 0]} color="#222" shadow={false} /></group>
      <group ref={min} position={[0, 0, 0.025]}><Box size={[0.01, 0.1, 0.005]} position={[0, 0.05, 0]} color="#222" shadow={false} /></group>
    </group>
  );
}

/**
 * A framed picture drawn by `draw(ctx, w, h)`: photos, a diploma, a map,
 * a poster. Frames hang flat on a wall facing +z.
 */
export function Frame({ draw, size = [0.4, 0.3], position, rotation, frame = '#6b4a2b', lit = false, deps = [] }) {
  const tex = useMemo(() => canvasTex(Math.round(size[0] * 640), Math.round(size[1] * 640), draw), deps); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group position={position} rotation={rotation}>
      <Box size={[size[0] + 0.05, size[1] + 0.05, 0.03]} color={frame} />
      <Screen tex={tex} size={size} position={[0, 0, 0.017]} lit={lit} />
    </group>
  );
}

export { canvasTex };

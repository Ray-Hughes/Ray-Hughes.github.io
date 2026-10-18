import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cyl, Model, Sign, TowerCrane, mat } from '../city/parts';
import Person from '../city/Person';
import Hotspot from './Hotspot';
import { Frame } from './room';
import { M } from '../city/kit';

/* ─────────────────────────────────────────────────────────────────────
   Lot 5, up close: the site where the next project breaks ground. It is
   outdoors, so instead of walls there is hoarding round the edge and sky
   above. Site spans x −4…4, z −3…3.
───────────────────────────────────────────────────────────────────── */

const YELLOW = '#e9a100';

const blueprint = (g, w, h) => {
  g.fillStyle = '#1f4f91'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,0.15)'; g.lineWidth = 1;
  for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.strokeStyle = '#e8f1ff'; g.lineWidth = 3;
  g.strokeRect(w * 0.15, h * 0.2, w * 0.45, h * 0.55);
  g.strokeRect(w * 0.6, h * 0.35, w * 0.25, h * 0.4);
  g.beginPath(); g.moveTo(w * 0.15, h * 0.2); g.lineTo(w * 0.375, h * 0.08); g.lineTo(w * 0.6, h * 0.2); g.stroke();
  g.fillStyle = '#e8f1ff'; g.font = `bold ${h * 0.08}px monospace`; g.fillText('LOT 5 · REV ?', w * 0.12, h * 0.92);
};

const notices = (g, w, h) => {
  g.fillStyle = '#c69c6d'; g.fillRect(0, 0, w, h);
  [['#b3e5fc', 'Delphi', '#2bb8c2'], ['#bbdefb', 'Patientevity', '#4d9fff'], ['#e1bee7', 'Memophor', '#a855f7']].forEach(([c, t, a], k) => {
    const x = 14 + k * (w - 28) / 3;
    g.fillStyle = c; g.fillRect(x, 20, (w - 28) / 3 - 10, h - 40);
    g.fillStyle = a; g.fillRect(x, 20, (w - 28) / 3 - 10, 16);
    g.fillStyle = '#333'; g.font = `bold ${h * 0.1}px sans-serif`; g.fillText(t, x + 6, 70);
    g.fillStyle = '#69db7c'; g.font = `bold ${h * 0.09}px sans-serif`; g.fillText('BUILT ✓', x + 6, h - 34);
  });
};

/** The dozer, pushing dirt back and forth all day. */
function Dozer() {
  const g = useRef();
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime * 0.3;
    g.current.position.x = -1.2 + Math.sin(t) * 1.6;
    g.current.rotation.y = Math.cos(t) > 0 ? Math.PI / 2 : -Math.PI / 2;
  });
  return <group ref={g} position={[0, 0.02, 1.6]}><Model url={M('cars', 'tractor-shovel')} scale={0.38} /></group>;
}

function Hoarding({ position, rotation, w }) {
  const n = Math.floor(w / 0.3);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box size={[w, 0.5, 0.04]} position={[0, 0.25, 0]} color="#ffffff" />
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} size={[0.12, 0.5, 0.05]} position={[-w / 2 + 0.15 + i * 0.3, 0.25, 0]} color="#ff7a1a" shadow={false} />
      ))}
    </group>
  );
}

export default function LotScene({ open }) {
  const dirt = mat('#d9b98c', { rough: 1 });
  const steel = mat('#cfd6df', { metal: 0.5, rough: 0.4 });
  const frame = [];
  for (let f = 0; f < 3; f++) {
    const y = 0.3 + f * 0.75;
    for (const x of [-1.2, 0, 1.2]) for (const z of [-2.3, -1.2]) {
      if (f === 2 && x > 0.5) continue;
      frame.push(<Box key={`c${f}${x}${z}`} size={[0.08, 0.75, 0.08]} position={[x, y + 0.375, z]} m={steel} />);
    }
    for (const z of [-2.3, -1.2]) frame.push(<Box key={`b${f}${z}`} size={[f === 2 ? 1.3 : 2.5, 0.08, 0.08]} position={[f === 2 ? -0.6 : 0, y + 0.75, z]} m={steel} />);
  }
  return (
    <group>
      {/* The site: a pad of dirt on a base, a foundation, steel going up. */}
      <Box size={[8.3, 0.3, 6.3]} position={[0, -0.15, 0]} m={dirt} />
      <Box size={[8.36, 0.08, 6.36]} position={[0, -0.32, 0]} color="#3b3f4a" />
      <Box size={[3.0, 0.3, 1.6]} position={[0, 0.15, -1.75]} color="#bfc3c9" />
      {frame}
      <Box size={[2.5, 0.05, 1.15]} position={[0, 1.08, -1.75]} color="#c7ccd3" />
      <Hoarding position={[0, 0, -3.0]} rotation={0} w={8} />
      <Hoarding position={[-4.0, 0, 0]} rotation={Math.PI / 2} w={6} />

      {/* The crane: its cab is the game. */}
      <TowerCrane position={[2.6, 0, -2.2]} height={4.4} jib={3.2} phase={0.6} />
      <Hotspot position={[2.6, 0, -1.3]} label="Climb into the crane: Tower Stack" icon="🏗️" color={YELLOW} onClick={() => open('stack')} badge={1.0} ring={0.5}>
        <Box size={[0.5, 0.45, 0.4]} position={[0, 0.22, 0]} color="#ffc93c" />
        <Box size={[0.3, 0.2, 0.02]} position={[0, 0.3, 0.21]} m={mat('#bfe3ff', { rough: 0.1, metal: 0.4 })} />
        <Sign size={0.07} color="#222" position={[0, 0.08, 0.205]}>CONTROLS</Sign>
      </Hotspot>

      {/* Blueprints on a trestle. */}
      <Hotspot position={[-1.6, 0, 0.3]} label="Blueprints: what is next" icon="📐" color="#1f4f91" onClick={() => open('next')} badge={0.9} ring={0.55}>
        {[-0.35, 0.35].map((x) => <Box key={x} size={[0.05, 0.4, 0.5]} position={[x, 0.2, 0]} color="#8a5a3b" />)}
        <Box size={[0.95, 0.03, 0.6]} position={[0, 0.41, 0]} color="#b98552" />
        <Frame draw={blueprint} size={[0.8, 0.5]} position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]} frame="#1f4f91" lit />
      </Hotspot>

      {/* The notice board: what is already standing. */}
      <Hotspot position={[0.9, 0, 2.2]} label="Notice board: already built" icon="📋" color="#2a9d8f" onClick={() => open('built')} badge={1.3} ring={0}>
        {[-0.5, 0.5].map((x) => <Cyl key={x} r={0.03} h={1.0} position={[x, 0.5, 0]} color="#7a5232" />)}
        <Frame draw={notices} size={[1.1, 0.5]} position={[0, 0.85, 0]} frame="#7a5232" />
      </Hotspot>

      {/* The site office. */}
      <Hotspot position={[-2.9, 0, -1.6]} label="Site office: build with me" icon="🦺" color="#e76f51" onClick={() => open('hire')} badge={1.05} ring={0}>
        <Box size={[1.0, 0.65, 1.6]} position={[0, 0.38, 0]} color="#f4f1ea" />
        <Box size={[1.06, 0.06, 1.66]} position={[0, 0.73, 0]} color="#e76f51" />
        <Box size={[0.02, 0.4, 0.26]} position={[0.51, 0.3, 0.3]} color="#7a5232" />
        <Box size={[0.02, 0.2, 0.4]} position={[0.51, 0.45, -0.35]} m={mat('#bfe3ff', { rough: 0.1, metal: 0.4 })} />
        {[-0.6, 0.6].map((z) => <Box key={z} size={[1.0, 0.06, 0.1]} position={[0, 0.03, z]} color="#555" />)}
      </Hotspot>

      <Dozer />
      <Model url={M('cars', 'truck-flat')} position={[3.0, 0.02, 1.6]} rotation={-Math.PI / 2} scale={0.4} />
      {[[-0.2, 2.6], [0.2, 2.75], [3.6, 0.2], [-3.6, 2.7]].map(([x, z], k) => <Model key={k} url={M('roads', 'construction-cone')} position={[x, 0, z]} scale={4} />)}
      <Box size={[0.8, 0.4, 0.6]} position={[3.2, 0.2, -0.2]} color="#a0703d" />
      <Box size={[0.8, 0.12, 0.6]} position={[3.2, 0.46, -0.2]} color="#c9ced6" />
      <Person who={7} clip="holding-both" position={[-0.3, 0, 0.6]} rotation={0.6} scale={0.75} />
      <Person who={2} clip="interact-left" position={[-1.6, 0, 0.9]} rotation={Math.PI} scale={0.75} />
      <Person who={11} clip="walk" scale={0.75} speed={0.3} path={[[-3.2, -0.4], [1.6, -0.4], [1.6, 0.0], [-3.2, 0.0]]} />
      <Person who={4} clip="interact-right" position={[0.7, 1.11, -1.75]} rotation={0.3} scale={0.75} />
    </group>
  );
}

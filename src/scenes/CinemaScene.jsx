import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, Cyl, Bulbs, rectPoints, Sign, mat } from '../city/parts';
import Person from '../city/Person';
import Hotspot from './Hotspot';
import { Floor, Walls, Frame, Screen } from './room';
import { cinemaScreen } from './screens';
import { POSTS } from '../data/posts';

/* ─────────────────────────────────────────────────────────────────────
   Inside the cinema: an auditorium with the lights down. The screen runs
   the trailers, the posters down the wall are the posts, and clicking one
   opens it. Room spans x −4…4, z −3…3; the rows rise toward the back.
───────────────────────────────────────────────────────────────────── */

const RED = '#b23a48';
const ROWS = [-0.4, 0.4, 1.2, 2.0];

function Seat({ position }) {
  const red = mat('#c0392b', { rough: 0.85 });
  return (
    <group position={position}>
      <Box size={[0.34, 0.16, 0.3]} position={[0, 0.16, 0]} m={red} />
      <Box size={[0.34, 0.34, 0.07]} position={[0, 0.3, 0.15]} m={red} />
      <Box size={[0.04, 0.22, 0.3]} position={[-0.19, 0.12, 0]} color="#2b1b20" />
    </group>
  );
}

const poster = (p) => (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, p.color); gr.addColorStop(1, '#1d1420');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.font = `${w * 0.34}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(p.icon, w / 2, h * 0.32);
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#fff'; g.font = `bold ${w * 0.085}px sans-serif`;
  // Wrap the title to the poster.
  const words = p.title.split(' ');
  let line = '', y = h * 0.62;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (g.measureText(test).width > w * 0.86) { g.fillText(line, w / 2, y); line = word; y += w * 0.1; } else line = test;
  }
  g.fillText(line, w / 2, y);
  g.fillStyle = '#ffd166'; g.font = `bold ${w * 0.06}px sans-serif`;
  g.fillText(`${p.minutes} MIN READ`, w / 2, h * 0.93);
};

function Projection() {
  const m = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fff3c4', transparent: true, opacity: 0.04, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }), []);
  useFrame(({ clock }) => { m.opacity = 0.035 + Math.sin(clock.elapsedTime * 7) * 0.006; });
  // A cone from the booth at the back to the screen.
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(1.45, 0.05, 5.6, 24, 1, true);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  return <mesh geometry={geo} material={m} position={[0, 1.15, -0.05]} />;
}

export default function CinemaScene({ open }) {
  const screen = useMemo(() => cinemaScreen(POSTS), []);
  useFrame((_, dt) => screen.tick(dt));
  const audience = useMemo(() => {
    const out = [];
    let s = 3;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    ROWS.forEach((z, r) => {
      for (let k = 0; k < 11; k++) {
        const x = -2.5 + k * 0.42;
        if (rnd() < 0.45) out.push({ x, z, y: r * 0.09, who: Math.floor(rnd() * 12), phase: rnd() });
      }
    });
    return out;
  }, []);
  const glowFrame = mat('#ffd166', { emissive: '#ffb703', glow: 0.6 });

  return (
    <group>
      <Floor w={8} d={6} tones={['#3a2530', '#35222c', '#3f2834', '#2f1e27']} />
      <Walls w={8} d={6} backPlain={[0, 1, 2, 3, 4, 5, 6, 7]} sidePlain={[0, 1, 2, 3, 4, 5]} tint="#4a2a35" />
      {/* Risers under the rows. */}
      {ROWS.map((z, r) => <Box key={z} size={[5.0, r * 0.09 + 0.01, 0.8]} position={[-0.4, (r * 0.09) / 2, z]} color="#2a1a22" />)}
      {ROWS.map((z, r) => Array.from({ length: 11 }, (_, k) => <Seat key={`${z}${k}`} position={[-2.5 + k * 0.42, r * 0.09, z]} />))}
      {audience.map((a, k) => (
        <Person key={k} who={a.who} clip="sit" position={[a.x, a.y + 0.14, a.z]} rotation={Math.PI} scale={0.6} phase={a.phase} />
      ))}

      {/* The screen, framed by curtains. */}
      <Hotspot position={[-0.4, 0, -2.85]} label="The screen: every post" icon="🎞️" color={RED} onClick={() => open('all')} badge={1.75} ring={0}>
        <Box size={[3.3, 1.6, 0.05]} position={[0, 0.98, 0]} color="#111" />
        <Screen tex={screen.tex} size={[3.1, 1.48]} position={[0, 0.98, 0.03]} />
        {[-1.95, 1.95].map((x) => (
          <group key={x} position={[x, 0, 0.06]}>
            {[0, 1, 2, 3].map((k) => <Box key={k} size={[0.16, 1.85, 0.08]} position={[(k - 1.5) * 0.15 * Math.sign(x), 0.93, (k % 2) * 0.05]} color={k % 2 ? '#9e1f2e' : '#b8293a'} />)}
          </group>
        ))}
        <Box size={[4.4, 0.25, 0.12]} position={[0, 1.9, 0.08]} color="#9e1f2e" />
      </Hotspot>
      <Projection />

      {/* One poster per post, down the side wall. */}
      {POSTS.map((p, k) => (
        <Hotspot key={p.slug} position={[-3.93, 0, -1.9 + k * 1.15]} rotation={Math.PI / 2} label={p.title} icon={p.icon} color={p.color} onClick={() => open(p.slug)} badge={1.35} ring={0}>
          <group position={[0, 0.85, 0]}>
            <Box size={[0.58, 0.8, 0.03]} m={glowFrame} />
            <Frame draw={poster(p)} size={[0.5, 0.72]} position={[0, 0, 0.02]} frame="#2a1a22" lit />
            <Bulbs points={rectPoints(0.58, 0.8, 0.1, 0.03)} r={0.012} speed={4} />
          </group>
        </Hotspot>
      ))}

      {/* The popcorn stand by the door. */}
      <group position={[3.0, 0, 2.3]} rotation={[0, -0.6, 0]}>
        <Box size={[0.8, 0.5, 0.4]} position={[0, 0.25, 0]} color="#f4f1ea" />
        {Array.from({ length: 8 }, (_, k) => <Box key={k} size={[0.05, 0.5, 0.41]} position={[-0.35 + k * 0.1, 0.25, 0]} color="#d7263d" shadow={false} />)}
        <Box size={[0.4, 0.4, 0.3]} position={[0, 0.72, 0]} m={mat('#fff7d6', { rough: 0.1, metal: 0.2, opacity: 0.55 })} />
        {Array.from({ length: 14 }, (_, k) => <mesh key={k} position={[-0.12 + (k % 5) * 0.06, 0.58 + Math.floor(k / 5) * 0.04, -0.05 + (k % 3) * 0.05]}><sphereGeometry args={[0.03, 6, 5]} /><meshStandardMaterial color="#fff3b0" /></mesh>)}
        <Sign size={0.08} color="#d7263d" position={[0, 0.98, 0]}>POPCORN</Sign>
        <Person who={5} clip="idle" position={[0, 0, -0.45]} scale={0.66} />
      </group>
      <Person who={9} clip="walk" scale={0.62} speed={0.25} path={[[2.6, 2.7], [2.6, -1.8], [2.3, -1.8], [2.3, 2.7]]} />
      <Cyl r={0.05} h={0.02} position={[-0.4, 1.95, 2.95]} color="#333" />
    </group>
  );
}

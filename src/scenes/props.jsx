import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, Cyl, Model, Sign, mat } from '../city/parts';
import Person from '../city/Person';
import { glowMat } from '../city/buildings';
import { F, Screen } from './room';
import { codeScreen } from './screens';

/* ─────────────────────────────────────────────────────────────────────
   Props for the stations in the project buildings. Each is something a
   milestone can be "kept in": a terminal, a bed, a tablet, a crate. They
   share a footprint of about half a unit so stations can be laid out on
   a simple grid.
───────────────────────────────────────────────────────────────────── */

/** A monitor on a stand, scrolling code in the project's colour. */
export function Terminal({ seed = 0, accent = '#7ee787' }) {
  const s = useMemo(() => codeScreen(seed, accent), [seed, accent]);
  useFrame((_, dt) => s.tick(dt));
  return (
    <group>
      <Model url={F('desk')} center scale={0.8} />
      <Box size={[0.46, 0.3, 0.03]} position={[0, 0.5, -0.06]} color="#1f2430" />
      <Screen tex={s.tex} size={[0.42, 0.26]} position={[0, 0.5, -0.04]} />
      <Box size={[0.04, 0.12, 0.04]} position={[0, 0.36, -0.08]} color="#3a4050" />
      <Model url={F('computerKeyboard')} center position={[0, 0.31, 0.06]} />
    </group>
  );
}

/** A heart monitor whose trace actually runs. */
export function Monitor({ color = '#34e07a' }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.userData.ctx = c.getContext('2d');
    return t;
  }, []);
  const x = useRef(0);
  useFrame((_, dt) => {
    const g = tex.userData.ctx;
    const step = Math.max(1, Math.round(dt * 120));
    for (let k = 0; k < step; k++) {
      x.current = (x.current + 1) % 256;
      const px = x.current;
      g.fillStyle = '#071a10'; g.fillRect(px, 0, 6, 128);
      const ph = (px % 64) / 64;
      const y = ph > 0.42 && ph < 0.46 ? 20 : ph > 0.46 && ph < 0.5 ? 110 : ph > 0.5 && ph < 0.54 ? 50 : 70 + Math.sin(px * 0.3) * 2;
      g.fillStyle = color; g.fillRect(px, y, 2, 3);
    }
    tex.needsUpdate = true;
  });
  return (
    <group>
      <Cyl r={0.02} h={0.6} position={[0, 0.3, 0]} color="#c9ced6" />
      <Box size={[0.3, 0.2, 0.05]} position={[0, 0.7, 0]} color="#e9edf2" />
      <Screen tex={tex} size={[0.26, 0.14]} position={[0, 0.7, 0.026]} />
    </group>
  );
}

/** A hospital bed with someone in it, and a monitor beside. */
export function Bed({ who = 2 }) {
  return (
    <group>
      <Model url={F('bedSingle')} center />
      <Box size={[0.5, 0.06, 0.6]} position={[0, 0.3, 0.2]} color="#9ad1ff" shadow={false} />
      <group position={[0.42, 0, -0.35]}><Monitor /></group>
      {/* Sitting up: the only way these characters can be in bed at all. */}
      <Person who={who} clip="sit" position={[0, 0.3, -0.25]} scale={0.6} />
    </group>
  );
}

/** A stone tablet, carved. */
export function Tablet({ color = '#2bb8c2', text = '' }) {
  return (
    <group>
      <Box size={[0.5, 0.1, 0.3]} position={[0, 0.05, 0]} color="#d9d2c3" />
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.4, 0.62, 0.08]} />
        <meshStandardMaterial color="#efe9dc" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.73, 0]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.08, 20, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#efe9dc" roughness={0.9} />
      </mesh>
      {[0, 1, 2, 3, 4].map((k) => <Box key={k} size={[0.28 - (k % 2) * 0.06, 0.015, 0.01]} position={[0, 0.58 - k * 0.07, 0.042]} color={color} shadow={false} />)}
      {text && <Sign size={0.07} color={color} position={[0, 0.66, 0.045]}>{text}</Sign>}
    </group>
  );
}

/** A pedestal with something lit floating over it. */
export function Pedestal({ color = '#2bb8c2', shape = 'ico' }) {
  const g = useRef();
  const m = useMemo(() => glowMat(color, 3), [color]);
  useFrame(({ clock }) => {
    if (!g.current) return;
    g.current.position.y = 0.72 + Math.sin(clock.elapsedTime * 1.4) * 0.04;
    g.current.rotation.y += 0.01;
  });
  return (
    <group>
      <Cyl r={0.18} rt={0.14} h={0.55} position={[0, 0.275, 0]} color="#efe9dc" />
      <Cyl r={0.2} h={0.05} position={[0, 0.575, 0]} color="#e2dacb" />
      <mesh ref={g} material={m}>
        {shape === 'ico' ? <icosahedronGeometry args={[0.1, 0]} /> : shape === 'oct' ? <octahedronGeometry args={[0.11]} /> : <torusKnotGeometry args={[0.06, 0.02, 48, 8]} />}
      </mesh>
    </group>
  );
}

/** Filing cabinet or card catalogue: a stack of drawers. */
export function Cabinet({ color = '#c9a27c', rows = 4, cols = 2 }) {
  const drawers = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) drawers.push([r, c]);
  return (
    <group>
      <Box size={[0.24 * cols + 0.06, 0.18 * rows + 0.06, 0.4]} position={[0, (0.18 * rows + 0.06) / 2, 0]} color={color} />
      {drawers.map(([r, c]) => (
        <group key={`${r}${c}`} position={[-0.12 * (cols - 1) + c * 0.24, 0.12 + r * 0.18, 0.205]}>
          <Box size={[0.2, 0.14, 0.01]} color="#f4efe6" shadow={false} />
          <Box size={[0.06, 0.015, 0.012]} position={[0, 0.02, 0.006]} color="#8a6a2a" shadow={false} />
        </group>
      ))}
    </group>
  );
}

/** A server rack whose lights blink in the project colour. */
export function Rack({ color = '#a855f7' }) {
  const leds = useMemo(() => [0, 1, 2].map(() => glowMat(color, 2)), [color]);
  useFrame(({ clock }) => {
    leds.forEach((m, k) => { m.emissiveIntensity = Math.sin(clock.elapsedTime * (4 + k * 2.3) + k) > 0 ? 3.2 : 0.4; });
  });
  return (
    <group>
      <Box size={[0.42, 1.0, 0.4]} position={[0, 0.5, 0]} color="#241f33" />
      {Array.from({ length: 8 }, (_, k) => (
        <group key={k} position={[0, 0.1 + k * 0.11, 0.201]}>
          <Box size={[0.36, 0.07, 0.01]} color="#332b47" shadow={false} />
          {[0, 1, 2, 3].map((j) => <Box key={j} size={[0.025, 0.015, 0.012]} position={[-0.12 + j * 0.06, 0, 0.006]} m={leds[(k + j) % 3]} shadow={false} />)}
        </group>
      ))}
    </group>
  );
}

/** A stack of shipping crates. */
export function Crates({ color = '#c58a4b', label = '' }) {
  return (
    <group>
      {[[-0.14, 0, 0, 0.26], [0.15, 0, 0.04, 0.24], [0, 0.26, 0.01, 0.22]].map(([x, y, z, s], k) => (
        <group key={k} position={[x, y + s / 2, z]} rotation={[0, k * 0.3, 0]}>
          <Box size={[s, s, s]} color={color} />
          <Box size={[s + 0.005, 0.03, s + 0.005]} color="#e8c48f" shadow={false} />
        </group>
      ))}
      {label && <Sign size={0.05} color="#3b2a1a" position={[-0.14, 0.13, 0.135]}>{label}</Sign>}
    </group>
  );
}

/** A table with an open book, a lamp and some loose paper. */
export function ReadingTable({ color = '#a855f7' }) {
  return (
    <group>
      <Model url={F('desk')} center scale={0.85} />
      <Box size={[0.28, 0.02, 0.2]} position={[-0.05, 0.335, 0]} rotation={[0, 0.2, 0]} color="#fffaf0" />
      <Box size={[0.01, 0.025, 0.2]} position={[-0.05, 0.338, 0]} rotation={[0, 0.2, 0]} color={color} />
      <Model url={F('lampRoundTable')} center position={[0.22, 0.325, -0.08]} />
      <Box size={[0.1, 0.006, 0.14]} position={[0.15, 0.33, 0.1]} rotation={[0, -0.4, 0]} color="#ffffff" shadow={false} />
    </group>
  );
}

/** A statue on a plinth: one of the agents, in marble. */
export function Statue({ color = '#efe9dc' }) {
  const m = mat(color, { rough: 0.8 });
  return (
    <group>
      <Box size={[0.36, 0.3, 0.36]} position={[0, 0.15, 0]} color="#d9d2c3" />
      <mesh position={[0, 0.48, 0]} material={m} castShadow><cylinderGeometry args={[0.1, 0.13, 0.36, 10]} /></mesh>
      <mesh position={[0, 0.74, 0]} material={m} castShadow><boxGeometry args={[0.2, 0.18, 0.18]} /></mesh>
      <mesh position={[0.16, 0.5, 0.05]} rotation={[0, 0, -0.5]} material={m} castShadow><boxGeometry args={[0.05, 0.26, 0.06]} /></mesh>
      <mesh position={[-0.16, 0.6, 0.08]} rotation={[0.3, 0, 0.3]} material={mat('#c9a44c', { metal: 0.5, rough: 0.4 })} castShadow><cylinderGeometry args={[0.12, 0.12, 0.03, 16]} /></mesh>
    </group>
  );
}

/** A wall of screens, the ops view. */
export function OpsWall({ accent = '#79c0ff' }) {
  return (
    <group>
      {[0, 1, 2, 3].map((k) => (
        <group key={k} position={[(k % 2) * 0.46 - 0.23, 0.75 + Math.floor(k / 2) * 0.3, 0]}>
          <Box size={[0.44, 0.28, 0.04]} color="#1f2430" />
          <TerminalFace seed={k} accent={accent} />
        </group>
      ))}
      <Box size={[0.06, 0.62, 0.06]} position={[0, 0.31, -0.03]} color="#3a4050" />
    </group>
  );
}

function TerminalFace({ seed, accent }) {
  const s = useMemo(() => codeScreen(seed, accent), [seed, accent]);
  useFrame((_, dt) => s.tick(dt));
  return <Screen tex={s.tex} size={[0.4, 0.24]} position={[0, 0, 0.022]} />;
}


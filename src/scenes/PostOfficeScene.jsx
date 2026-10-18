import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cyl, Model, Sign, mat } from '../city/parts';
import Person from '../city/Person';
import Hotspot from './Hotspot';
import { F, Floor, Walls, Backdrop, Frame, WallClock } from './room';

/* ─────────────────────────────────────────────────────────────────────
   The post office: every way to reach Ray, as something on the counter.
   Room spans x −3.5…3.5, z −2.5…2.5.
───────────────────────────────────────────────────────────────────── */

const BLUE = '#2a6fdb';

/** Parcels riding a belt into the back room, forever. */
function Conveyor({ position }) {
  const boxes = useRef([]);
  const n = 5, len = 2.4;
  useFrame(({ clock }) => {
    boxes.current.forEach((b, k) => {
      if (!b) return;
      const u = ((clock.elapsedTime * 0.18 + k / n) % 1);
      b.position.x = -len / 2 + u * len;
      b.visible = u > 0.03 && u < 0.97;
    });
  });
  const rollers = useMemo(() => Array.from({ length: 12 }, (_, k) => -len / 2 + (k + 0.5) * (len / 12)), []);
  return (
    <group position={position}>
      <Box size={[len, 0.04, 0.4]} position={[0, 0.34, 0]} color="#3a4050" />
      {rollers.map((x) => <Cyl key={x} r={0.02} h={0.38} rotation={[Math.PI / 2, 0, 0]} position={[x, 0.37, 0]} color="#9aa3ad" />)}
      {[-1.1, 1.1].map((x) => <Box key={x} size={[0.05, 0.34, 0.36]} position={[x, 0.17, 0]} color="#5b6475" />)}
      {Array.from({ length: n }, (_, k) => (
        <group key={k} ref={(el) => { boxes.current[k] = el; }} position={[0, 0.47, 0]}>
          <Box size={[0.2 + (k % 2) * 0.06, 0.16 + (k % 3) * 0.03, 0.22]} color="#c58a4b" />
          <Box size={[0.03, 0.17 + (k % 3) * 0.03, 0.225]} color="#e8c48f" shadow={false} />
        </group>
      ))}
    </group>
  );
}

function PoBoxes({ position }) {
  const doors = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) doors.push([c, r]);
  const brass = mat('#c9a44c', { metal: 0.6, rough: 0.35 });
  return (
    <group position={position}>
      <Box size={[1.95, 1.1, 0.12]} position={[0, 0.55, 0]} color="#7a5232" />
      {doors.map(([c, r]) => (
        <group key={`${c}${r}`} position={[-0.84 + c * 0.24, 0.17 + r * 0.2, 0.065]}>
          <Box size={[0.2, 0.16, 0.01]} m={brass} shadow={false} />
          <Box size={[0.08, 0.04, 0.012]} position={[0, 0.03, 0.002]} color="#2b2d42" shadow={false} />
        </group>
      ))}
    </group>
  );
}

const noticeBoard = (g, w, h) => {
  g.fillStyle = '#c69c6d'; g.fillRect(0, 0, w, h);
  const notes = [['#fff59d', 'LinkedIn'], ['#b3e5fc', 'GitHub'], ['#ffccbc', 'Hiring?'], ['#c8e6c9', 'Say hi!']];
  notes.forEach(([c, t], k) => {
    const x = 16 + (k % 2) * (w / 2), y = 16 + Math.floor(k / 2) * (h / 2);
    g.save(); g.translate(x + w / 4 - 16, y + h / 4 - 16); g.rotate((k - 1.5) * 0.06);
    g.fillStyle = c; g.fillRect(-w / 4 + 10, -h / 4 + 10, w / 2 - 28, h / 2 - 28);
    g.fillStyle = '#e63946'; g.beginPath(); g.arc(0, -h / 4 + 16, 5, 0, 7); g.fill();
    g.fillStyle = '#333'; g.font = `bold ${h * 0.09}px sans-serif`; g.textAlign = 'center'; g.fillText(t, 0, 8);
    g.restore();
  });
};

export default function PostOfficeScene({ open }) {
  return (
    <group>
      <Backdrop kind="city" />
      <Floor w={7} d={5} kind="tile" tones={['#eef3fb', '#e1e9f5']} />
      <Walls w={7} d={5} backPlain={[0, 1, 2, 4, 5, 6]} sidePlain={[2, 3]} color="#eaf1fb" />
      <Box size={[7.0, 0.22, 0.04]} position={[0, 1.15, -2.46]} color={BLUE} />
      <Sign size={0.13} color="#ffffff" position={[0, 1.15, -2.43]}>UNITED HUGHES POSTAL SERVICE</Sign>

      <PoBoxes position={[-2.3, 0, -2.38]} />

      {/* The counter, with a clerk behind it. */}
      <Box size={[3.0, 0.42, 0.45]} position={[0.9, 0.21, -1.0]} color="#f1f5fb" />
      <Box size={[3.08, 0.04, 0.53]} position={[0.9, 0.44, -1.0]} color={BLUE} />
      <Box size={[3.0, 0.12, 0.7]} position={[0.9, 0.06, -1.6]} color="#d5dde9" />
      <Person who={10} clip="idle" position={[0.6, 0.12, -1.6]} scale={0.72} />
      <Person who={3} clip="interact-right" position={[1.7, 0.12, -1.6]} scale={0.72} />

      {/* The letter slot: email. */}
      <Hotspot position={[-0.25, 0.46, -1.0]} label="Send a letter: email" icon="✉️" color={BLUE} onClick={() => open('email')} badge={0.55} ring={0}>
        <Box size={[0.28, 0.02, 0.2]} position={[0, 0.01, 0]} color="#ffffff" />
        <Box size={[0.26, 0.004, 0.18]} position={[0, 0.022, 0]} rotation={[0, 0.2, 0]} color="#fffaf0" shadow={false} />
        <Box size={[0.1, 0.004, 0.05]} position={[0.06, 0.026, -0.04]} rotation={[0, 0.2, 0]} color="#e63946" shadow={false} />
      </Hotspot>

      {/* A parcel on the scale: the résumé. */}
      <Hotspot position={[0.7, 0.46, -1.0]} label="Collect a parcel: résumé PDF" icon="📦" color="#c58a4b" onClick={() => open('resume')} badge={0.6} ring={0}>
        <Box size={[0.3, 0.05, 0.25]} position={[0, 0.025, 0]} color="#c9ced6" />
        <Box size={[0.24, 0.18, 0.2]} position={[0, 0.14, 0]} color="#c58a4b" />
        <Box size={[0.25, 0.04, 0.205]} position={[0, 0.14, 0]} color="#e8c48f" shadow={false} />
      </Hotspot>

      {/* The phone: call. */}
      <Hotspot position={[1.85, 0.46, -1.0]} label="Use the phone: call" icon="📞" color="#2a9d8f" onClick={() => open('phone')} badge={0.5} ring={0}>
        <Box size={[0.2, 0.06, 0.14]} position={[0, 0.03, 0]} color="#e63946" />
        <Box size={[0.24, 0.04, 0.05]} position={[0, 0.08, 0]} color="#c92f3c" />
      </Hotspot>

      {/* The notice board: LinkedIn. */}
      <Hotspot position={[-3.44, 0, -0.1]} rotation={Math.PI / 2} label="Notice board: LinkedIn" icon="📌" color="#0a66c2" onClick={() => open('linkedin')} badge={1.25} ring={0}>
        <Frame draw={noticeBoard} size={[0.8, 0.6]} position={[0, 0.85, 0]} frame="#7a5232" />
      </Hotspot>

      {/* The parcel belt: GitHub, where everything ships from. */}
      <Hotspot position={[1.6, 0, 1.0]} label="The shipping belt: GitHub" icon="🐙" color="#24292f" onClick={() => open('github')} badge={0.9} ring={0}>
        <Conveyor position={[0, 0, 0]} />
      </Hotspot>

      {/* Customers in the queue. */}
      <Person who={0} clip="idle" position={[-0.25, 0, -0.35]} rotation={Math.PI} scale={0.72} />
      <Person who={5} clip="idle" position={[-0.3, 0, 0.2]} rotation={Math.PI - 0.2} scale={0.72} />
      <Person who={7} clip="walk" scale={0.72} speed={0.25} path={[[-2.6, 2.0], [0.2, 2.0], [0.2, 1.6], [-2.6, 1.6]]} />

      {[-2.7, -2.2].map((x) => (
        <group key={x} position={[x, 0, 1.6]}>
          <Box size={[0.32, 0.5, 0.26]} position={[0, 0.25, 0]} color={BLUE} />
          <Cyl r={0.16} h={0.26} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]} color={BLUE} />
        </group>
      ))}
      <Model url={F('pottedPlant')} center position={[3.2, 0, -2.2]} />
      <Model url={F('benchCushionLow')} center position={[-3.1, 0, 0.9]} rotation={Math.PI / 2} />
      <WallClock position={[0.6, 0.85, -2.44]} />
    </group>
  );
}

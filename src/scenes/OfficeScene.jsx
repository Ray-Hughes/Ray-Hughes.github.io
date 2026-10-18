import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cyl, Model, mat, Sign } from '../city/parts';
import { glowMat } from '../city/buildings';
import Person from '../city/Person';
import { M } from '../city/kit';
import { codeScreen, resumeScreen, whiteboard, arcadeScreen } from './screens';
import { Screen, Steam, WallClock, Backdrop, Floor, Frame } from './room';
import Hotspot from './Hotspot';
import { EXPERIENCE } from '../data/profile';

/* ─────────────────────────────────────────────────────────────────────
   Inside Hughes Tower: one open-plan floor, cut away like a doll's house.

   Two rows of engineers type at screens that really do scroll code, two
   more walk the aisle, someone makes coffee, a meeting is going on in the
   corner. The big screen on the back wall shows the résumé, and clicking
   it opens the résumé properly.

   Furniture units: a desk is 0.72 wide, a wall 1.29 high, a seated person
   about half a wall. The room spans x −4…4 and z −3…3.
───────────────────────────────────────────────────────────────────── */

const F = (n) => M('furniture', n);

/** A desk, a chair, a monitor running code, and someone at it. */
function Workstation({ position, rotation = 0, who, seed, screens }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Model url={F('desk')} center />
      <Model url={F('computerScreen')} center position={[0, 0.38, -0.12]} />
      {/* The kit's monitor has no screen of its own; lay a live one over it. */}
      <Screen tex={screens[seed % screens.length].tex} size={[0.34, 0.2]} position={[0, 0.555, -0.07]} />
      <Model url={F('computerKeyboard')} center position={[0, 0.38, 0.06]} />
      <Model url={F('computerMouse')} center position={[0.2, 0.38, 0.06]} />
      {seed % 3 === 0 && <Model url={F('plantSmall2')} center position={[-0.28, 0.38, -0.1]} />}
      {seed % 3 === 1 && <Cyl r={0.025} h={0.06} position={[-0.25, 0.41, 0.02]} color={['#ff6b6b', '#4dabf7', '#ffd43b'][seed % 3]} />}
      <Model url={F('chairDesk')} center position={[0, 0, 0.42]} rotation={Math.PI} />
      <Person who={who} clip="sit" position={[0, 0.2, 0.42]} rotation={Math.PI} scale={0.7} typing phase={seed * 0.37} />
    </group>
  );
}

/** The printer, which every few seconds pushes out a sheet. */
function Printer({ position, rotation }) {
  const sheet = useRef();
  const led = useMemo(() => glowMat('#34e07a', 2), []);
  useFrame(({ clock }) => {
    if (!sheet.current) return;
    const t = (clock.elapsedTime % 6) / 6;
    const out = Math.min(1, Math.max(0, (t - 0.2) * 3));
    sheet.current.position.z = 0.06 + out * 0.14;
    sheet.current.visible = t > 0.2;
  });
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box size={[0.36, 0.38, 0.3]} position={[0, 0.19, 0]} color="#e9edf2" />
      <Box size={[0.36, 0.05, 0.3]} position={[0, 0.4, 0]} color="#5b6475" />
      <Box size={[0.08, 0.02, 0.02]} position={[0.1, 0.3, 0.155]} m={led} />
      <Box size={[0.26, 0.004, 0.2]} position={[0, 0.25, 0.1]} color="#cfd5de" shadow={false} />
      <Box ref={sheet} size={[0.22, 0.004, 0.28]} position={[0, 0.26, 0.06]} color="#ffffff" shadow={false} />
    </group>
  );
}

/** A rack of servers with lights that blink out of step with each other. */
function ServerRack({ position }) {
  const leds = useMemo(() => [0, 1, 2].map((k) => glowMat(['#34e07a', '#4dabf7', '#ffd43b'][k], 2)), []);
  useFrame(({ clock }) => {
    leds.forEach((m, k) => { m.emissiveIntensity = Math.sin(clock.elapsedTime * (5 + k * 3) + k) > 0 ? 3 : 0.3; });
  });
  return (
    <group position={position}>
      <Box size={[0.4, 0.95, 0.36]} position={[0, 0.475, 0]} color="#2b2f3a" />
      {Array.from({ length: 7 }, (_, k) => (
        <group key={k} position={[-0.201, 0.12 + k * 0.12, 0]}>
          <Box size={[0.005, 0.08, 0.3]} color="#3a4050" shadow={false} />
          {[0, 1, 2].map((j) => <Box key={j} size={[0.006, 0.015, 0.015]} position={[0, 0, -0.1 + j * 0.05]} m={leds[(k + j) % 3]} shadow={false} />)}
        </group>
      ))}
    </group>
  );
}

/** A robot vacuum doing laps of the open floor. */
function Robovac() {
  const g = useRef();
  const led = useMemo(() => glowMat('#4dabf7', 3), []);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime * 0.25;
    g.current.position.set(-0.9 + Math.sin(t) * 1.3, 0.02, 1.75 + Math.sin(t * 2) * 0.35);
    g.current.rotation.y = Math.atan2(Math.cos(t) * 1.3, Math.cos(t * 2) * 0.7);
  });
  return (
    <group ref={g}>
      <Cyl r={0.11} h={0.035} position={[0, 0.018, 0]} color="#e9edf2" />
      <Cyl r={0.06} h={0.012} position={[0, 0.04, 0]} color="#3a4050" />
      <mesh position={[0, 0.042, 0.07]} material={led}><sphereGeometry args={[0.012, 8, 6]} /></mesh>
    </group>
  );
}

/** The big display on the back wall, showing the résumé. It opens it. */
function ResumeWall({ onOpen }) {
  const screen = useMemo(resumeScreen, []);
  useFrame((_, dt) => screen.tick(dt));
  const glow = useRef();
  useFrame(({ clock }) => {
    if (glow.current) glow.current.material.opacity = 0.2 + Math.sin(clock.elapsedTime * 3) * 0.08;
  });
  return (
    <Hotspot position={[2.3, 0, -2.9]} label="The big screen: read the résumé" icon="📄" color="#3e86c9" onClick={onOpen} badge={1.55} ring={0}>
      <group position={[0, 0.82, 0]}>
        <mesh ref={glow} position={[0, 0, -0.01]}>
          <planeGeometry args={[1.75, 1.15]} />
          <meshBasicMaterial color="#5aa8ff" transparent opacity={0.2} toneMapped={false} />
        </mesh>
        <Box size={[1.62, 1.03, 0.05]} color="#1f2430" />
        <Screen tex={screen.tex} size={[1.54, 0.96]} position={[0, 0, 0.03]} />
        <Sign size={0.07} color="#33405a" position={[0, -0.6, 0.03]}>RAYMOND HUGHES · RÉSUMÉ</Sign>
      </group>
    </Hotspot>
  );
}

/** A plaque for one job, hung on the side wall. */
const plaque = (job) => (g, w, h) => {
  g.fillStyle = '#2c3e66'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c9a44c'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = '#c9a44c'; g.textAlign = 'center';
  g.font = `bold ${h * 0.13}px serif`;
  const words = job.company.replace(/,? (LLC|Inc\.)/, '').split(' ');
  const mid = Math.ceil(words.length / 2);
  g.fillText(words.slice(0, mid).join(' '), w / 2, h * 0.36);
  g.fillText(words.slice(mid).join(' '), w / 2, h * 0.52);
  g.fillStyle = '#e8eef7'; g.font = `${h * 0.075}px sans-serif`;
  g.fillText(job.period, w / 2, h * 0.76);
};

/** An arcade cabinet in the lounge, running Bug Squash. */
function Arcade({ onPlay }) {
  const screen = useMemo(arcadeScreen, []);
  useFrame((_, dt) => screen.tick(dt));
  const marquee = useMemo(() => glowMat('#ff7eb6', 1.4), []);
  return (
    <Hotspot position={[-1.6, 0, 2.6]} label="Arcade: play Bug Squash" icon="🕹️" color="#d6336c" onClick={onPlay} badge={1.25} ring={0.4}>
      <Box size={[0.48, 0.55, 0.42]} position={[0, 0.275, 0]} color="#5f3dc4" />
      <Box size={[0.48, 0.5, 0.3]} position={[0, 0.8, -0.06]} color="#5f3dc4" />
      <Box size={[0.5, 0.12, 0.32]} position={[0, 1.1, -0.05]} m={marquee} />
      <Box size={[0.5, 0.08, 0.2]} position={[0, 0.58, 0.12]} rotation={[0.35, 0, 0]} color="#3b2a8a" />
      <Cyl r={0.012} h={0.06} position={[-0.1, 0.64, 0.14]} color="#222" />
      <mesh position={[-0.1, 0.68, 0.14]}><sphereGeometry args={[0.025, 10, 8]} /><meshStandardMaterial color="#e63946" /></mesh>
      {[0.04, 0.12].map((x) => <Cyl key={x} r={0.022} h={0.02} position={[x, 0.63, 0.15]} color={x > 0.1 ? '#ffd43b' : '#4dabf7'} />)}
      <Screen tex={screen.tex} size={[0.4, 0.32]} position={[0, 0.83, 0.095]} rotation={[-0.12, 0, 0]} />
    </Hotspot>
  );
}

export default function OfficeScene({ open }) {
  const screens = useMemo(() => [0, 1, 2, 3].map((k) => codeScreen(k, ['#7ee787', '#79c0ff', '#ffa657', '#d2a8ff'][k])), []);
  const board = useMemo(whiteboard, []);
  useFrame((_, dt) => screens.forEach((s) => s.tick(dt)));

  const wallM = mat('#f4efe6');

  // Back wall windows along x, side wall windows along z.
  const backWall = Array.from({ length: 8 }, (_, k) => k);
  const sideWall = Array.from({ length: 6 }, (_, k) => k);

  return (
    <group>
      <Backdrop />
      <Floor w={8} d={6} />
      {/* Carpet under the desks. */}
      <Box size={[3.4, 0.012, 3.6]} position={[-1.8, 0.006, -0.3]} color="#7f9bc4" shadow={false} />

      {backWall.map((k) => <Model key={`b${k}`} url={F(k === 6 || k === 7 ? 'wall' : 'wallWindow')} position={[-4 + k, 0, -3]} />)}
      {sideWall.map((k) => <Model key={`s${k}`} url={F([0, 2, 3].includes(k) ? 'wall' : 'wallWindow')} position={[-4, 0, 3 - k]} rotation={Math.PI / 2} />)}
      <Box size={[8.1, 0.06, 0.1]} position={[0, 1.32, -3.0]} m={wallM} />
      <Box size={[0.1, 0.06, 6.1]} position={[-4.0, 1.32, 0]} m={wallM} />

      {/* Engineers at work. */}
      {[-2.8, -2.0, -1.2, -0.4].map((x, k) => (
        <Workstation key={`r1${k}`} position={[x, 0, -1.55]} who={k} seed={k} screens={screens} />
      ))}
      {[-2.8, -2.0, -1.2].map((x, k) => (
        <Workstation key={`r2${k}`} position={[x, 0, 0.55]} who={k + 5} seed={k + 2} screens={screens} />
      ))}

      {/* Two walking the aisle, one with a coffee. */}
      <Person who={8} clip="walk" scale={0.7} speed={0.32} path={[[-3.3, -0.35], [1.2, -0.35], [1.2, 2.2], [-3.3, 2.2]]} />
      <Person who={9} clip="walk" scale={0.7} speed={0.27} phase={1.7} path={[[1.2, 2.2], [-3.3, 2.2], [-3.3, -0.35], [1.2, -0.35]]}
        hold={<Cyl r={0.03} h={0.06} position={[0.16, 0.24, 0.08]} color="#ffffff" />} />

      {/* The résumé wall, and Ray beside it presenting. */}
      <ResumeWall onOpen={() => open('resume')} />

      {/* A plaque for each job, down the side wall. */}
      {EXPERIENCE.map((job, k) => (
        <Hotspot key={job.company} position={[-3.93, 0, 0.75 - k * 0.5]} rotation={Math.PI / 2} label={job.company} icon="🏅" color="#2c3e66" onClick={() => open(`job${k}`)} badge={1.17} ring={0}>
          <Frame draw={plaque(job)} size={[0.4, 0.3]} position={[0, 0.85, 0]} frame="#8a6a2a" />
        </Hotspot>
      ))}
      <Arcade onPlay={() => open('bugs')} />
      <Person who={6} clip="interact-right" position={[1.25, 0, -2.4]} rotation={0.7} scale={0.7} />
      <Model url={F('pottedPlant')} center position={[0.75, 0, -2.65]} />

      {/* The meeting corner: a round table, a whiteboard, a discussion. */}
      <group position={[2.3, 0, 0.9]}>
        <Model url={F('tableRound')} center position={[0, 0.27, 0]} />
        <Model url={F('laptop')} center position={[0.1, 0.37, 0.05]} rotation={-0.4} />
        <Model url={F('rugRound')} center position={[0, 0.004, 0]} scale={1.3} />
        {[[0, -0.62], [0.58, 0.25], [-0.55, 0.3]].map(([x, z]) => [x, z, Math.atan2(-x, -z)]).map(([x, z, r], k) => (
          <group key={k}>
            <Model url={F('chairModernCushion')} center position={[x, 0, z]} rotation={r} />
            <Person who={k + 1} clip={k === 1 ? 'emote-yes' : 'sit'} position={[x, 0.17, z]} rotation={r} scale={0.7} phase={k} />
          </group>
        ))}
        <Hotspot position={[0.2, 0, -1.25]} label="Whiteboard: the AI tooling" icon="🧠" color="#9b3fd6" onClick={() => open('tooling')} badge={1.3} ring={0}>
          {[-0.45, 0.45].map((x) => <Box key={x} size={[0.03, 0.9, 0.03]} position={[x, 0.45, 0]} color="#9aa3ad" />)}
          <Box size={[1.0, 0.55, 0.03]} position={[0, 0.85, 0]} color="#d8dde5" />
          <mesh position={[0, 0.85, 0.017]}><planeGeometry args={[0.96, 0.5]} /><meshStandardMaterial map={board} roughness={0.6} /></mesh>
        </Hotspot>
      </group>

      {/* Kitchen: coffee, a fridge, someone waiting on the machine. */}
      <group position={[-3.55, 0, -2.6]}>
        <Model url={F('kitchenBar')} center position={[0.2, 0, 0.1]} rotation={Math.PI / 2} />
        <Model url={F('kitchenBar')} center position={[0.2, 0, 0.55]} rotation={Math.PI / 2} />
        <Model url={F('kitchenCoffeeMachine')} center position={[0.18, 0.42, 0.12]} rotation={Math.PI / 2} />
        <Steam position={[0.22, 0.62, 0.12]} />
        <Model url={F('kitchenFridge')} center position={[0.2, 0, 1.05]} rotation={Math.PI / 2} />
        <Person who={10} clip="interact-left" position={[0.75, 0, 0.2]} rotation={-Math.PI / 2} scale={0.7} />
      </group>

      {/* The lounge by the front window. */}
      <group position={[-2.9, 0, 2.3]}>
        <Model url={F('rugRound')} center position={[0.4, 0.005, -0.1]} />
        <Model url={F('loungeSofa')} center position={[-0.55, 0, 0]} rotation={Math.PI / 2} />
        <Person who={11} clip="sit" position={[-0.5, 0.2, -0.2]} rotation={Math.PI / 2} scale={0.7} />
        <Model url={F('laptop')} center position={[-0.3, 0.38, -0.2]} rotation={Math.PI / 2} scale={0.8} />
        <Model url={F('tableCoffee')} center position={[0.25, 0, -0.1]} />
        <Model url={F('pottedPlant')} center position={[-0.7, 0, 0.55]} />
        <Model url={F('lampSquareFloor')} center position={[-0.7, 0, -0.65]} />
      </group>

      <Printer position={[0.4, 0, 2.5]} rotation={Math.PI} />
      <ServerRack position={[3.62, 0, -2.7]} />
      <ServerRack position={[3.62, 0, -2.25]} />
      <Robovac />
      <Person who={4} clip="walk" scale={0.7} speed={0.22} phase={3.1} path={[[3.0, 2.3], [1.6, 2.3], [1.6, -1.9], [3.0, -1.9]]}
        hold={<Box size={[0.16, 0.01, 0.12]} position={[0, 0.25, 0.12]} color="#c9ced6" />} />
      <Model url={F('pottedPlant')} center position={[1.5, 0, 2.7]} />
      <Model url={F('loungeChair')} center position={[3.3, 0, 1.9]} rotation={-2.4} />
      <Model url={F('pottedPlant')} center position={[3.6, 0, 2.6]} />
      <Model url={F('trashcan')} center position={[-0.05, 0, -0.85]} />
      <WallClock position={[-1.5, 1.08, -2.93]} />
      <Sign size={0.11} color="#3e86c9" position={[-1.5, 0.86, -2.94]}>FLOOR 17</Sign>
    </group>
  );
}

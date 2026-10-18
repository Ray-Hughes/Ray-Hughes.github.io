import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cyl, Model, Sign } from '../city/parts';
import Person from '../city/Person';
import Hotspot from './Hotspot';
import { F, Floor, Walls, Backdrop, Frame, Screen, WallClock } from './room';
import { tvScreen } from './screens';
import { PROFILE } from '../data/profile';

/* ─────────────────────────────────────────────────────────────────────
   Ray's house: a Florida living room with the beach through the windows.
   Room spans x −3.5…3.5, z −2.5…2.5; walls on the back and the left.
───────────────────────────────────────────────────────────────────── */

const C = '#2a9d8f';

/* Pictures for the frames, drawn rather than photographed. */
const sunset = (g, w, h) => {
  const s = g.createLinearGradient(0, 0, 0, h);
  s.addColorStop(0, '#ff9a5a'); s.addColorStop(0.55, '#ffd27a'); s.addColorStop(0.56, '#2a7fb8'); s.addColorStop(1, '#1d5f8a');
  g.fillStyle = s; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(w * 0.6, h * 0.55, h * 0.16, Math.PI, 0); g.fill();
  g.strokeStyle = '#3b2a1a'; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.2, h); g.quadraticCurveTo(w * 0.26, h * 0.6, w * 0.22, h * 0.32); g.stroke();
  g.fillStyle = '#2b4a2b';
  for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(w * 0.22 + Math.cos(k * 1.3) * 18, h * 0.32 + Math.sin(k * 1.3) * 6, 20, 5, k * 1.3, 0, 7); g.fill(); }
};
const codePic = (g, w, h) => {
  g.fillStyle = '#0f1724'; g.fillRect(0, 0, w, h);
  for (let l = 0; l < 9; l++) {
    g.fillStyle = ['#ff7b72', '#79c0ff', '#7ee787', '#d2a8ff'][l % 4];
    g.fillRect(14 + (l % 3) * 10, 14 + l * (h / 10), w * (0.3 + ((l * 37) % 50) / 100), 5);
  }
};
const familyPic = (g, w, h) => {
  g.fillStyle = '#bfe6ff'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f3dfa2'; g.fillRect(0, h * 0.7, w, h * 0.3);
  ['#e76f51', '#2a9d8f', '#e9c46a'].forEach((c, k) => {
    const x = w * (0.28 + k * 0.22);
    g.fillStyle = '#f1c27d'; g.beginPath(); g.arc(x, h * 0.42, h * 0.1, 0, 7); g.fill();
    g.fillStyle = c; g.fillRect(x - h * 0.1, h * 0.52, h * 0.2, h * 0.26);
  });
};
const diploma = (g, w, h) => {
  g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8a24a'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = '#5b3a1a'; g.textAlign = 'center';
  g.font = `bold ${h * 0.1}px serif`; g.fillText('Keiser University', w / 2, h * 0.26);
  g.font = `${h * 0.065}px serif`; g.fillText('Bachelor of Science', w / 2, h * 0.42);
  g.font = `bold ${h * 0.08}px serif`; g.fillText('Software Engineering', w / 2, h * 0.55);
  g.font = `italic ${h * 0.06}px serif`; g.fillText('with High Honors', w / 2, h * 0.68);
  g.fillStyle = '#c0392b'; g.beginPath(); g.arc(w * 0.8, h * 0.8, h * 0.08, 0, 7); g.fill();
};
const floridaMap = (g, w, h) => {
  g.fillStyle = '#a7dcf2'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#9bd17a';
  // The panhandle, then the peninsula running south-east.
  g.beginPath();
  g.moveTo(w * 0.05, h * 0.12); g.lineTo(w * 0.6, h * 0.12); g.lineTo(w * 0.62, h * 0.2);
  g.lineTo(w * 0.8, h * 0.45); g.lineTo(w * 0.86, h * 0.75); g.lineTo(w * 0.8, h * 0.92);
  g.lineTo(w * 0.72, h * 0.88); g.lineTo(w * 0.6, h * 0.62); g.lineTo(w * 0.5, h * 0.36);
  g.lineTo(w * 0.36, h * 0.3); g.lineTo(w * 0.05, h * 0.28); g.closePath(); g.fill();
  g.fillStyle = '#e63946'; g.beginPath(); g.arc(w * 0.82, h * 0.58, h * 0.04, 0, 7); g.fill();
  g.fillStyle = '#1d2433'; g.font = `bold ${h * 0.07}px sans-serif`; g.fillText('Port St. Lucie', w * 0.4, h * 0.6);
};

function Trophy({ position, color = '#f4c430' }) {
  return (
    <group position={position}>
      <Box size={[0.07, 0.03, 0.07]} position={[0, 0.015, 0]} color="#4a3a2a" />
      <Cyl r={0.012} h={0.06} position={[0, 0.06, 0]} color={color} />
      <Cyl r={0.04} rt={0.05} h={0.07} position={[0, 0.12, 0]} color={color} />
    </group>
  );
}

function Surfboard({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow scale={[0.17, 0.75, 0.03]}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshStandardMaterial color="#ffd166" roughness={0.4} />
      </mesh>
      <Box size={[0.03, 1.2, 0.035]} position={[0, 0, 0]} color="#e76f51" />
    </group>
  );
}

function TV({ onPlay }) {
  const screen = useMemo(tvScreen, []);
  useFrame((_, dt) => screen.tick(dt));
  return (
    <Hotspot position={[1.0, 0, -2.2]} label="Play Snake on the TV" icon="🎮" color="#7cc96b" onClick={onPlay} badge={1.15} ring={0.5}>
      <Model url={F('cabinetTelevision')} center />
      <Box size={[0.95, 0.56, 0.05]} position={[0, 0.7, -0.05]} color="#1f2430" />
      <Screen tex={screen.tex} size={[0.88, 0.5]} position={[0, 0.7, -0.02]} />
      <Box size={[0.12, 0.04, 0.08]} position={[0.3, 0.42, 0.05]} color="#e9edf2" />
      <Box size={[0.1, 0.025, 0.06]} position={[-0.25, 0.42, 0.08]} color="#3a4050" />
    </Hotspot>
  );
}

export default function HouseScene({ open }) {
  return (
    <group>
      <Backdrop kind="beach" back={-4.2} side={-5} />
      <Floor w={7} d={5} tones={['#e8d3ad', '#e2cba3', '#ecd8b4', '#dcc39a']} />
      <Walls w={7} d={5} backPlain={[1, 2, 4]} sidePlain={[1, 2, 3]} color="#fff4e6" />
      <Model url={F('rugRectangle')} center position={[0.6, 0.004, -0.2]} scale={1.3} />

      {/* The photo wall. */}
      <Hotspot position={[-1.5, 0, -2.42]} label="Photos: about me" icon="🖼️" color={C} onClick={() => open('about')} badge={1.25} ring={0}>
        <Frame draw={sunset} size={[0.5, 0.36]} position={[-0.35, 0.86, 0]} />
        <Frame draw={familyPic} size={[0.3, 0.38]} position={[0.2, 0.92, 0]} frame="#f4f4f4" />
        <Frame draw={codePic} size={[0.36, 0.26]} position={[0.62, 0.78, 0]} frame="#222" />
      </Hotspot>

      {/* Diploma and map on the left wall. */}
      <Hotspot position={[-3.44, 0, 1.0]} rotation={Math.PI / 2} label="Diploma: education" icon="🎓" color="#c8a24a" onClick={() => open('education')} badge={1.2} ring={0}>
        <Frame draw={diploma} size={[0.5, 0.36]} position={[0, 0.85, 0]} frame="#3b2a1a" />
      </Hotspot>
      <Hotspot position={[-3.44, 0, -0.2]} rotation={Math.PI / 2} label="Map: where I am" icon="📍" color="#e63946" onClick={() => open('where')} badge={1.25} ring={0}>
        <Frame draw={floridaMap} size={[0.55, 0.48]} position={[0, 0.85, 0]} frame="#f4f4f4" />
      </Hotspot>

      {/* Bookshelf: how I work. */}
      <Hotspot position={[-3.15, 0, -1.85]} rotation={Math.PI / 2} label="Bookshelf: how I work" icon="📚" color="#8e5ec2" onClick={() => open('how')} badge={1.1} ring={0.4}>
        <Model url={F('bookcaseOpen')} center scale={1.15} />
        <Model url={F('books')} center position={[0, 0.5, 0]} />
        <Model url={F('books')} center position={[0, 0.2, 0]} />
      </Hotspot>

      <TV onPlay={() => open('snake')} />

      {/* The sofa, and a friend waiting for a turn on the TV. */}
      <Model url={F('loungeSofa')} center position={[1.0, 0, 0.75]} rotation={Math.PI} scale={1.1} />
      <Person who={1} clip="sit" position={[0.75, 0.21, 0.7]} rotation={Math.PI} scale={0.72} />
      <Model url={F('tableCoffee')} center position={[1.0, 0, -0.4]} />
      <Model url={F('plantSmall3')} center position={[1.2, 0.23, -0.4]} />

      {/* The desk where the side projects happen. */}
      <Hotspot position={[2.7, 0, -1.7]} label="The desk: what I'm building now" icon="💻" color="#2bb8c2" onClick={() => open('now')} badge={1.15} ring={0.5}>
        <Model url={F('desk')} center rotation={-Math.PI / 2} />
        <Model url={F('laptop')} center position={[-0.05, 0.38, 0]} rotation={-Math.PI / 2} />
        <Model url={F('lampRoundTable')} center position={[0.05, 0.38, -0.28]} />
        <Model url={F('chairDesk')} center position={[-0.45, 0, 0]} rotation={-Math.PI / 2} />
        <Person who={6} clip="sit" position={[-0.45, 0.2, 0]} rotation={Math.PI / 2} scale={0.7} typing />
      </Hotspot>

      {/* The trophy shelf. */}
      <Hotspot position={[3.0, 0, 0.9]} label="Trophies: by the numbers" icon="🏆" color="#f4a300" onClick={() => open('numbers')} badge={0.95} ring={0.4}>
        <Model url={F('sideTableDrawers')} center rotation={-Math.PI / 2} />
        <Trophy position={[0, 0.42, -0.12]} />
        <Trophy position={[0, 0.42, 0.1]} color="#c0c7d0" />
        <Sign size={0.05} color="#5a4a2a" position={[-0.21, 0.3, 0]} rotation={[0, -Math.PI / 2, 0]}>10+ YRS</Sign>
      </Hotspot>

      <Surfboard position={[-2.6, 0.62, -2.3]} rotation={[0.12, 0.3, 0.05]} />
      <WallClock position={[0.0, 1.05, -2.44]} />
      <Model url={F('pottedPlant')} center position={[-0.2, 0, -2.2]} scale={1.2} />
      <Model url={F('pottedPlant')} center position={[3.2, 0, 2.2]} scale={1.1} />
      <Model url={F('lampSquareFloor')} center position={[2.0, 0, 1.0]} />
      <Model url={F('loungeChair')} center position={[-1.6, 0, 0.6]} rotation={2.5} />
      <Person who={9} clip="walk" scale={0.7} speed={0.2} path={[[-2.4, 1.6], [2.2, 1.6], [2.2, 2.1], [-2.4, 2.1]]} />
      <Sign size={0.09} color="#2a9d8f" position={[-1.5, 1.2, -2.43]}>{`WELCOME TO ${PROFILE.location.split(',')[0].toUpperCase()}`}</Sign>
    </group>
  );
}

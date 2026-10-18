import { Box, Cyl, Model, Sign } from '../city/parts';
import Person from '../city/Person';
import Hotspot from './Hotspot';
import { F, Floor, Walls, Backdrop, Frame, WallClock } from './room';
import { SKILLS } from '../data/profile';

/* ─────────────────────────────────────────────────────────────────────
   Hughes University, room 101: a classroom. The chalkboard has the whole
   syllabus; each poster on the back wall is one subject; the flashcards
   on the teacher's desk are a game. Room spans x −4…4, z −3…3.
───────────────────────────────────────────────────────────────────── */

const ICONS = ['🤖', '🛤️', '🖥️', '☁️', '🩺', '🧭'];

const chalk = (g, w, h) => {
  g.fillStyle = '#2f4a3a'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.05)';
  for (let k = 0; k < 40; k++) g.fillRect(Math.random() * w, Math.random() * h, 60, 2);
  g.fillStyle = '#f4f1e6'; g.font = `bold ${h * 0.11}px "Comic Sans MS", cursive`; g.textAlign = 'center';
  g.fillText('SKILLS 101', w / 2, h * 0.17);
  g.font = `${h * 0.065}px "Comic Sans MS", cursive`; g.textAlign = 'left';
  SKILLS.forEach((s, k) => {
    const x = k < 3 ? w * 0.06 : w * 0.54, y = h * (0.34 + (k % 3) * 0.22);
    g.fillStyle = s.color; g.fillText(`${k + 1}. ${s.cat}`, x, y);
    g.fillStyle = '#e8e4d8'; g.font = `${h * 0.045}px "Comic Sans MS", cursive`;
    g.fillText(s.items.slice(0, 3).join(', '), x + 12, y + h * 0.075);
    g.font = `${h * 0.065}px "Comic Sans MS", cursive`;
  });
};

const poster = (s, icon) => (g, w, h) => {
  g.fillStyle = s.color; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(w * 0.5, h * 0.36, w * 0.32, 0, 7); g.fill();
  g.font = `${w * 0.36}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(icon, w / 2, h * 0.37);
  g.fillStyle = '#fff'; g.font = `bold ${w * 0.11}px sans-serif`; g.textBaseline = 'alphabetic';
  const words = s.cat.split(' ');
  words.forEach((wd, k) => g.fillText(wd, w / 2, h * 0.74 + k * w * 0.13));
};

function StudentDesk({ position, who, phase }) {
  return (
    <group position={position}>
      <Model url={F('desk')} center scale={0.8} />
      <Box size={[0.2, 0.012, 0.14]} position={[0.05, 0.31, 0.02]} color="#fffaf0" />
      <Model url={F('chair')} center position={[0, 0, 0.36]} rotation={Math.PI} scale={0.9} />
      <Person who={who} clip="sit" position={[0, 0.19, 0.36]} rotation={Math.PI} scale={0.68} typing phase={phase} />
    </group>
  );
}

export default function UniversityScene({ open }) {
  const posters = [-3.25, -2.55, -1.85, 1.85, 2.55, 3.25];
  return (
    <group>
      <Backdrop kind="city" />
      <Floor w={8} d={6} tones={['#c99e6e', '#c39668', '#cfa577', '#bd8f60']} />
      <Walls w={8} d={6} backPlain={[0, 1, 2, 3, 4, 5, 6, 7]} sidePlain={[]} color="#f3e7d3" />

      {/* The chalkboard: the whole syllabus. */}
      <Hotspot position={[0, 0, -2.94]} label="Chalkboard: every subject" icon="🧑‍🏫" color="#3a7d5c" onClick={() => open('all')} badge={1.32} ring={0}>
        <Frame draw={chalk} size={[2.0, 0.95]} position={[0, 0.78, 0]} frame="#8a5a3b" />
        <Box size={[2.0, 0.03, 0.06]} position={[0, 0.27, 0.04]} color="#8a5a3b" />
      </Hotspot>

      {/* One poster per subject. */}
      {SKILLS.map((s, k) => (
        <Hotspot key={s.cat} position={[posters[k], 0, -2.94]} label={s.cat} icon={ICONS[k]} color={s.color} onClick={() => open(`s${k}`)} badge={1.2} ring={0}>
          <Frame draw={poster(s, ICONS[k])} size={[0.5, 0.66]} position={[0, 0.78, 0]} frame="#ffffff" />
        </Hotspot>
      ))}

      {/* The professor, at the board. */}
      <Person who={6} clip="interact-left" position={[1.05, 0, -2.35]} rotation={-0.6} scale={0.72} />

      {/* Teacher's desk, with the flashcards that are a game. */}
      <Hotspot position={[2.4, 0, -1.4]} label="Flashcards: play Memory Match" icon="🃏" color="#c8613f" onClick={() => open('memory')} badge={0.95} ring={0.55}>
        <Model url={F('desk')} center rotation={Math.PI} scale={1.1} />
        {[0, 1, 2, 3].map((k) => (
          <Box key={k} size={[0.12, 0.012, 0.17]} position={[-0.15 + k * 0.08, 0.43 + k * 0.004, 0]} rotation={[0, (k - 1.5) * 0.25, 0]} color={['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c'][k]} />
        ))}
        <mesh position={[0.25, 0.46, 0.05]} castShadow><sphereGeometry args={[0.04, 12, 8]} /><meshStandardMaterial color="#e63946" /></mesh>
        <group position={[0.25, 0.42, -0.15]}>
          <Cyl r={0.025} h={0.02} position={[0, 0.01, 0]} color="#8a5a3b" />
          <mesh position={[0, 0.1, 0]} castShadow><sphereGeometry args={[0.07, 16, 12]} /><meshStandardMaterial color="#4dabf7" roughness={0.5} /></mesh>
        </group>
      </Hotspot>

      {/* Rows of students. */}
      {[-2.4, -1.2, 0.0, 1.2].flatMap((x, i) => [-0.6, 0.6, 1.8].map((z, j) => (
        <StudentDesk key={`${i}${j}`} position={[x - 0.4, 0, z]} who={(i * 3 + j) % 12} phase={i * 3 + j} />
      )))}

      <Model url={F('bookcaseClosedWide')} center position={[-3.7, 0, 2.2]} rotation={Math.PI / 2} />
      <Model url={F('pottedPlant')} center position={[3.6, 0, -2.6]} />
      <Model url={F('pottedPlant')} center position={[3.6, 0, 2.6]} />
      <WallClock position={[0, 1.2, -2.94]} />
      <Sign size={0.09} color="#7a2e1d" position={[-2.55, 1.18, -2.93]}>ROOM 101</Sign>
      <Person who={8} clip="walk" scale={0.7} speed={0.25} path={[[3.3, 2.5], [3.3, -0.6], [2.9, -0.6], [2.9, 2.5]]} />
    </group>
  );
}

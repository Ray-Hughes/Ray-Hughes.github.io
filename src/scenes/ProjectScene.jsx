import { Box, Cyl, Model, Sign } from '../city/parts';
import { Constellation, Flame } from '../city/buildings';
import Person from '../city/Person';
import Hotspot from './Hotspot';
import { F, Floor, Walls, Backdrop, Frame, WallClock } from './room';
import { Terminal, Bed, Tablet, Pedestal, Cabinet, Rack, Crates, ReadingTable, Statue, OpsWall, Monitor } from './props';

/* ─────────────────────────────────────────────────────────────────────
   Inside the three project buildings. Each milestone of a project's
   write-up is a station in the room, so walking round the room is reading
   the story in order. Rooms span x −4…4, z −3…3.

   Station layouts are per building: [x, z, rotation, prop].
───────────────────────────────────────────────────────────────────── */

const Column = ({ position, h = 1.25 }) => (
  <group position={position}>
    <Box size={[0.26, 0.06, 0.26]} position={[0, 0.03, 0]} color="#e2dacb" />
    <Cyl r={0.09} rt={0.08} h={h} seg={14} position={[0, h / 2 + 0.06, 0]} color="#f6f2ea" />
    <Box size={[0.26, 0.06, 0.26]} position={[0, h + 0.09, 0]} color="#e2dacb" />
  </group>
);

const ROOMS = {
  patientevity: {
    floor: { kind: 'tile', tones: ['#f2f6fb', '#e4edf8'] },
    walls: { tint: '#eaf3ff', backPlain: [0, 3, 4], sidePlain: [] },
    bg: 'city',
    stations: (c) => [
      [-2.9, -2.1, 0, <Cabinet key="a" color="#dfe9f6" rows={4} cols={3} />],
      [-1.2, -1.9, 0, <Bed key="b" who={2} />],
      [0.6, -2.3, 0, <Terminal key="c" seed={1} accent={c} />],
      [2.4, -2.3, 0, <Terminal key="d" seed={3} accent="#7ee787" />],
      [-3.2, 0.9, Math.PI / 2, <Pedestal key="e" color={c} shape="oct" />],
      [3.0, 0.6, -0.5, <OpsWall key="f" accent={c} />],
    ],
    // Reception is the overview desk, with a nurse behind it.
    overview: [0, 0.6, (c) => (
      <>
        <Box size={[1.4, 0.4, 0.4]} position={[0, 0.2, 0]} color="#ffffff" />
        <Box size={[1.46, 0.04, 0.46]} position={[0, 0.42, 0]} color={c} />
        <Sign size={0.09} color={c} position={[0, 0.25, 0.205]}>RECEPTION</Sign>
      </>
    )],
    facts: [-0.9, 1.9],
    decor: (c) => (
      <>
        <Person who={3} clip="idle" position={[0.3, 0, 0.2]} scale={0.7} />
        <Bed who={7} />
        <group position={[-2.6, 0, 2.0]} rotation={[0, Math.PI / 2, 0]}><Bed who={9} /></group>
        <Model url={F('pottedPlant')} center position={[3.5, 0, -2.6]} />
        <Model url={F('benchCushion')} center position={[1.8, 0, 2.5]} />
        <Person who={0} clip="sit" position={[1.65, 0.2, 2.5]} rotation={0} scale={0.68} />
        <Person who={10} clip="wheelchair-sit" position={[1.0, 0.02, 1.8]} rotation={-0.5} scale={0.7} />
        <Model url={'/models/people/wheelchair.glb'} position={[1.0, 0.02, 1.8]} rotation={-0.5} scale={0.7} />
        <Person who={5} clip="walk" scale={0.7} speed={0.3} path={[[-1.8, -0.8], [1.8, -0.8], [1.8, -1.2], [-1.8, -1.2]]} />
        <WallClock position={[-0.1, 1.05, -2.94]} />
        <Sign size={0.12} color={c} position={[1.5, 1.12, -2.93]}>PATIENTEVITY GENERAL</Sign>
        <group position={[-0.1, 0, -2.88]}><Monitor color="#ff6b6b" /></group>
      </>
    ),
  },

  delphi: {
    floor: { kind: 'tile', tones: ['#f3efe6', '#e9e2d4'] },
    walls: { tint: '#efe8da', backPlain: [0, 1, 2, 3, 4, 5, 6, 7], sidePlain: [0, 1, 2, 3, 4, 5] },
    bg: 'city',
    stations: (c) => [
      [-2.9, -2.2, 0, <Tablet key="a" color={c} text="I" />],
      [-1.6, -2.3, 0, <Pedestal key="b" color={c} shape="knot" />],
      [0, -0.9, 0, <Pedestal key="c" color={c} shape="ico" />],
      [1.6, -2.3, 0, <Statue key="d" />],
      [2.9, -2.2, 0, <Statue key="e" color="#e8f6f7" />],
      [-3.2, 0.6, Math.PI / 2, <Crates key="f" label="v1.6" />],
      [2.9, 0.9, -Math.PI / 2, <ReadingTable key="g" color={c} />],
    ],
    overview: [0, 1.6, (c) => <Tablet color={c} text="DELPHI" />],
    facts: [-3.3, 2.3],
    decor: (c) => (
      <>
        {/* Columns down both walls and the oracle's graph over the centre. */}
        {[-3.5, -2.3, -1.1, 0.1, 1.3, 2.5, 3.6].map((x) => <Column key={x} position={[x, 0, -2.75]} />)}
        {[-1.6, -0.4, 0.8, 2.0].map((z) => <Column key={z} position={[-3.75, 0, z]} />)}
        <Constellation color={c} position={[0, 1.5, -0.9]} scale={1.3} />
        <Flame position={[-0.7, 0.22, -0.5]} />
        <Flame position={[0.7, 0.22, -0.5]} />
        <Box size={[1.6, 0.012, 2.4]} position={[0, 0.006, 0.2]} color="#7fd8de" shadow={false} />
        <Sign size={0.16} color="#0e6e74" position={[0, 1.15, -2.92]}>THE ORACLE AT DELPHI</Sign>
        <Person who={4} clip="interact-right" position={[0.55, 0, -0.35]} rotation={-2.6} scale={0.7} />
        <Person who={8} clip="emote-yes" position={[-0.6, 0, 0.1]} rotation={2.8} scale={0.7} />
        <Person who={11} clip="walk" scale={0.7} speed={0.25} path={[[-2.4, 1.0], [2.2, 1.0], [2.2, 2.3], [-2.4, 2.3]]} />
        {[[3.5, 2.5], [-0.9, 2.6]].map(([x, z], k) => <Model key={k} url={F('pottedPlant')} center position={[x, 0, z]} />)}
      </>
    ),
  },

  memophor: {
    floor: { kind: 'wood', tones: ['#b98a5e', '#b38357', '#bf9064', '#ac7c51'] },
    walls: { tint: '#efe6fb', backPlain: [0, 1, 2, 5, 6, 7], sidePlain: [0, 1, 4, 5] },
    bg: 'city',
    stations: (c) => [
      [-2.0, -1.9, 0, <ReadingTable key="a" color={c} />],
      [-0.5, -2.45, 0, <Cabinet key="b" rows={5} cols={3} color="#9b6b43" />],
      [1.1, -2.3, 0, <Terminal key="c" seed={2} accent="#d2a8ff" />],
      [0, -0.4, 0, <Pedestal key="d" color={c} shape="oct" />],
      [3.0, -0.4, -0.5, <group key="e"><group position={[-0.25, 0, 0]}><Rack color={c} /></group><group position={[0.25, 0, 0]}><Rack color="#79c0ff" /></group></group>],
      [-3.0, 1.2, Math.PI / 2, <Crates key="f" color="#9b6b43" label="FREE" />],
    ],
    overview: [1.6, 1.2, (c) => (
      <>
        <Box size={[1.1, 0.4, 0.45]} position={[0, 0.2, 0]} color="#7a5232" />
        <Box size={[1.16, 0.04, 0.5]} position={[0, 0.42, 0]} color={c} />
        <Model url={F('books')} center position={[-0.3, 0.44, 0]} />
      </>
    )],
    facts: [-3.3, -0.6],
    decor: (c) => (
      <>
        {[-3.4, -2.9, 2.6, 3.1].map((x) => <Model key={x} url={F('bookcaseClosedWide')} center position={[x, 0, -2.75]} />)}
        {[0.2, 0.7].map((z) => <Model key={z} url={F('bookcaseOpen')} center position={[-3.75, 0, z]} rotation={Math.PI / 2} scale={1.2} />)}
        <Constellation color={c} position={[0, 1.4, -0.4]} scale={1.1} />
        <Box size={[2.2, 0.012, 1.4]} position={[0.2, 0.006, 1.6]} color="#7b4bb3" shadow={false} />
        <Person who={1} clip="idle" position={[1.6, 0, 0.75]} scale={0.7} />
        <Person who={6} clip="sit" position={[-2.0, 0.2, -1.5]} rotation={Math.PI} scale={0.7} typing />
        <Model url={F('chair')} center position={[-2.0, 0, -1.5]} rotation={Math.PI} />
        <Person who={9} clip="walk" scale={0.7} speed={0.22} path={[[-2.2, 2.4], [0.8, 2.4], [0.8, 0.6], [-2.2, 0.6]]} />
        <Sign size={0.13} color="#5b2a86" position={[0, 1.12, -2.93]}>MEMOPHOR LIBRARY</Sign>
        <WallClock position={[0, 0.88, -2.94]} />
      </>
    ),
  },
};

const notice = (color) => (g, w, h) => {
  g.fillStyle = '#c69c6d'; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 4; k++) {
    g.save(); g.translate(w * (0.27 + (k % 2) * 0.46), h * (0.28 + Math.floor(k / 2) * 0.44)); g.rotate((k - 1.5) * 0.08);
    g.fillStyle = ['#fff59d', '#ffffff', '#c8e6c9', '#ffe0b2'][k]; g.fillRect(-w * 0.19, -h * 0.17, w * 0.38, h * 0.34);
    g.fillStyle = color; g.fillRect(-w * 0.19, -h * 0.17, w * 0.38, h * 0.05);
    g.fillStyle = '#999'; for (let l = 0; l < 3; l++) g.fillRect(-w * 0.15, -h * 0.06 + l * h * 0.06, w * 0.28, 3);
    g.restore();
  }
};

export default function ProjectScene({ slug, project, open }) {
  const room = ROOMS[slug];
  const c = project.color;
  const stations = room.stations(c);
  return (
    <group>
      <Backdrop kind={room.bg} />
      <Floor w={8} d={6} kind={room.floor.kind} tones={room.floor.tones} />
      <Walls w={8} d={6} backPlain={room.walls.backPlain} sidePlain={room.walls.sidePlain} tint={room.walls.tint} />
      {room.decor(c)}

      {project.milestones.map((m, k) => {
        const s = stations[k];
        if (!s) return null;
        const [x, z, r, prop] = s;
        return (
          <Hotspot key={m.number} position={[x, 0, z]} rotation={r} label={`${m.number} · ${m.title}`} icon={m.number} color={c} onClick={() => open(`m${k}`)} badge={1.25} ring={0.42}>
            {prop}
          </Hotspot>
        );
      })}

      <Hotspot position={[room.overview[0], 0, room.overview[1]]} label={`${project.name}: the overview`} icon="ℹ️" color={c} onClick={() => open('overview')} badge={0.9} ring={0.55}>
        {room.overview[2](c)}
      </Hotspot>
      <Hotspot position={[room.facts[0], 0, room.facts[1]]} label="Notice board: did you know?" icon="🎲" color={c} onClick={() => open('facts')} badge={1.3} ring={0}>
        {[-0.3, 0.3].map((x) => <Cyl key={x} r={0.025} h={0.9} position={[x, 0.45, 0]} color="#7a5232" />)}
        <Frame draw={notice(c)} size={[0.7, 0.5]} position={[0, 0.85, 0]} rotation={[0, Math.PI / 4, 0]} frame="#7a5232" deps={[c]} />
      </Hotspot>
    </group>
  );
}

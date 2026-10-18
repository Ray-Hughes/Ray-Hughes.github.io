import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { PLACES } from './places';
import { landmarkPositions } from './layout';
import { OfficeTower, Hospital, Temple, Library, Theater, University, PostOffice, Home, Yard } from './buildings';

const BUILDINGS = {
  office: OfficeTower, hospital: Hospital, delphi: Temple, memophor: Library, theater: Theater,
  university: University, postoffice: PostOffice, home: Home, yard: Yard,
};

/**
 * One clickable landmark. Hovering lifts it a touch, lights a ring on the
 * ground under it and opens its label. A click is ignored if the pointer
 * travelled, because that was someone dragging the map, not choosing.
 */
function Landmark({ place, position, onSelect, dim }) {
  const [hover, setHover] = useState(false);
  const lift = useRef();
  const ring = useRef();
  useCursor(hover);
  const Building = BUILDINGS[place.id];

  useFrame(({ clock }, dt) => {
    if (lift.current) lift.current.position.y = THREE.MathUtils.damp(lift.current.position.y, hover ? 0.08 : 0, 10, dt);
    if (ring.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.03;
      ring.current.scale.setScalar(s);
      ring.current.material.opacity = THREE.MathUtils.damp(ring.current.material.opacity, hover ? 0.85 : 0, 10, dt);
    }
  });

  const [ox, oz] = place.offset || [0, 0];
  return (
    <group position={[position[0], 0, position[1]]}>
      <group
        ref={lift}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => { e.stopPropagation(); if (e.delta < 6) onSelect(place.id); }}
      >
        <Building color={place.color} />
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[ox, 0.04, oz]}>
        <ringGeometry args={[place.offset ? 0.75 : 1.5, place.offset ? 0.85 : 1.62, 64]} />
        <meshBasicMaterial color={place.color} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <Html position={[ox, place.height, oz]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`pin ${hover ? 'pin-on' : ''} ${dim ? 'pin-dim' : ''}`} style={{ '--c': place.color }}>
          <button
            className="pin-chip"
            style={{ pointerEvents: 'auto' }}
            onClick={() => onSelect(place.id)}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
          >
            <span className="pin-icon" aria-hidden="true">{place.icon}</span>
            <span className="pin-text">
              <span className="pin-title">{place.title}</span>
              <span className="pin-sub">{place.sub}</span>
            </span>
          </button>
          <span className="pin-stem" />
        </div>
      </Html>
    </group>
  );
}

export default function Landmarks({ onSelect, focus }) {
  const pos = landmarkPositions();
  return PLACES.map((p) => (
    <Landmark key={p.id} place={p} position={pos[p.block]} onSelect={onSelect} dim={focus && focus !== p.id} />
  ));
}

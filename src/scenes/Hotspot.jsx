import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Something in a room you can click. The object itself is clickable, and a
 * small bobbing badge above it says so; hovering either opens its label.
 * A drag that started on it is not a click, so turning the camera never
 * opens anything by accident.
 */
export default function Hotspot({ position, rotation, label, icon = '✨', color = '#e9a100', onClick, children, badge = 0.6, ring = 0.32 }) {
  const [hover, setHover] = useState(false);
  const halo = useRef();
  useCursor(hover);
  useFrame(({ clock }, dt) => {
    if (!halo.current) return;
    halo.current.material.opacity = THREE.MathUtils.damp(halo.current.material.opacity, hover ? 0.75 : 0.22 + Math.sin(clock.elapsedTime * 2.5) * 0.1, 8, dt);
  });
  return (
    <group position={position} rotation={rotation ? [0, rotation, 0] : undefined}>
      <group
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => { e.stopPropagation(); if (e.delta < 6) onClick(); }}
      >
        {children}
      </group>
      {ring > 0 && (
        <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026, 0]}>
          <ringGeometry args={[ring, ring + 0.05, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} toneMapped={false} depthWrite={false} />
        </mesh>
      )}
      <Html position={[0, badge, 0]} center zIndexRange={[10, 0]}>
        <button
          className={`hs ${hover ? 'hs-on' : ''}`}
          style={{ '--c': color }}
          onClick={onClick}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          aria-label={label}
        >
          <span className="hs-dot" aria-hidden="true">{icon}</span>
          <span className="hs-label">{label}</span>
        </button>
      </Html>
    </group>
  );
}

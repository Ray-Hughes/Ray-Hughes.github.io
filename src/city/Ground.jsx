import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BLOCKS, blockCenter } from './layout';

/* ─────────────────────────────────────────────────────────────────────
   The island and the sea around it.

   The shore is a rounded rectangle, and the water knows that shape as a
   signed distance, so it can shade shallows near the beach, draw foam lines
   that roll in toward the sand, and fade to deep blue further out. None of
   it is a texture: it is all computed per pixel, so it stays sharp at any
   zoom.
───────────────────────────────────────────────────────────────────── */

export const ISLAND = { hx: 14.2, hz: 12.6, r: 3.6, cz: 0.6 };
const BEACH = 1.5;

function roundedRect(hx, hz, r) {
  const s = new THREE.Shape();
  s.moveTo(-hx + r, -hz);
  s.lineTo(hx - r, -hz);
  s.quadraticCurveTo(hx, -hz, hx, -hz + r);
  s.lineTo(hx, hz - r);
  s.quadraticCurveTo(hx, hz, hx - r, hz);
  s.lineTo(-hx + r, hz);
  s.quadraticCurveTo(-hx, hz, -hx, hz - r);
  s.lineTo(-hx, -hz + r);
  s.quadraticCurveTo(-hx, -hz, -hx + r, -hz);
  return s;
}

/** A flat slab in the shape of the island, with a soft dark rim below. */
function Slab({ hx, hz, r, y, depth, color, rough = 1 }) {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(hx, hz, r), {
      depth, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.06, bevelSegments: 3, curveSegments: 24,
    });
    g.rotateX(Math.PI / 2);
    g.translate(0, y, ISLAND.cz);
    return g;
  }, [hx, hz, r, y, depth]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={color} roughness={rough} />
    </mesh>
  );
}

const waterVert = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const waterFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  uniform vec4 uIsland; // hx, hz, r, cz
  varying vec3 vWorld;

  float sdRound(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    vec2 p = vWorld.xz - vec2(0.0, uIsland.w);
    float d = sdRound(p, uIsland.xy + ${BEACH.toFixed(2)}, uIsland.z + 0.8);
    float n = noise(vWorld.xz * 0.9 + uTime * 0.15) * 0.6 + noise(vWorld.xz * 2.3 - uTime * 0.2) * 0.4;

    // Shallow turquoise at the sand, deep blue past a few tiles out.
    float depth = smoothstep(0.0, 9.0, d + n * 0.8);
    vec3 col = mix(uShallow, uDeep, depth);

    // Foam: a bright lip on the sand, then lines that roll toward it.
    float lip = 1.0 - smoothstep(0.0, 0.22 + n * 0.12, d);
    float roll = fract(d * 0.55 - uTime * 0.18 + n * 0.25);
    float lines = smoothstep(0.92, 0.97, roll) * (1.0 - smoothstep(0.5, 4.5, d));
    col = mix(col, uFoam, clamp(lip + lines * 0.55, 0.0, 1.0));

    // Glints that drift: a cheap sparkle that reads as sunlight on water.
    float glint = smoothstep(0.82, 0.95, noise(vWorld.xz * 6.0 + vec2(uTime * 0.6, -uTime * 0.4)));
    col += glint * 0.12 * (1.0 - depth * 0.5);

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function Water() {
  const mat = useRef();
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uShallow: { value: new THREE.Color('#5fe0d6') },
    uDeep: { value: new THREE.Color('#1f7fc7') },
    uFoam: { value: new THREE.Color('#ffffff') },
    uIsland: { value: new THREE.Vector4(ISLAND.hx, ISLAND.hz, ISLAND.r, ISLAND.cz) },
  }), []);
  useFrame((_, dt) => { if (mat.current) mat.current.uniforms.uTime.value += dt; });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
      <planeGeometry args={[400, 400]} />
      <shaderMaterial ref={mat} vertexShader={waterVert} fragmentShader={waterFrag} uniforms={uniforms} />
    </mesh>
  );
}

/** Paved or planted pads under each block, so lots read as lots. */
function Pads() {
  const pads = useMemo(() => {
    const out = [];
    BLOCKS.forEach((row, bj) => row.forEach((kind, bi) => {
      const [x, z] = blockCenter(bi, bj);
      const green = ['park', 'houses', 'home', 'university', 'delphi'].includes(kind);
      const dirt = kind === 'yard';
      out.push({ x, z, color: dirt ? '#d9b98c' : green ? '#8fd46b' : kind === 'plaza' ? '#efd9b4' : '#d9d3c7' });
    }));
    return out;
  }, []);
  return pads.map((p, k) => (
    <mesh key={k} position={[p.x, 0.012, p.z]} receiveShadow>
      <boxGeometry args={[3.02, 0.024, 3.02]} />
      <meshStandardMaterial color={p.color} roughness={0.95} />
    </mesh>
  ));
}

export default function Ground() {
  return (
    <group>
      <Water />
      {/* Sand, then grass on top, each a slab so the edges have thickness. */}
      <Slab hx={ISLAND.hx + BEACH} hz={ISLAND.hz + BEACH} r={ISLAND.r + 0.8} y={-0.085} depth={0.3} color="#f2dca0" />
      <Slab hx={ISLAND.hx} hz={ISLAND.hz} r={ISLAND.r} y={-0.042} depth={0.1} color="#7fcf5f" />
      <Pads />
    </group>
  );
}

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PLACES } from './places';
import { landmarkPositions } from './layout';

/* ─────────────────────────────────────────────────────────────────────
   The camera's moves: a swoop in on arrival, a flight to a building when
   one is chosen, and back out to the overview. While it flies the map
   controls are off, so a stray drag cannot fight the animation.
───────────────────────────────────────────────────────────────────── */

export const HOME = { pos: [10, 26, 30], target: [0, 0, 1] };
const INTRO = { pos: [34, 48, 62], target: [0, 0, 1] };

const spots = landmarkPositions();
const DIR = new THREE.Vector3(0.42, 0.6, 0.68).normalize();

export const VIEWS = Object.fromEntries(PLACES.map((p) => {
  const [x, z] = spots[p.block];
  const [ox, oz] = p.offset || [0, 0];
  const target = new THREE.Vector3(x + ox, p.aim ?? Math.min(p.height * 0.38, 2.4), z + oz);
  const dist = p.dist ?? (p.offset ? 3.4 : 4.6) + p.height * 0.62;
  const dir = p.view ? new THREE.Vector3(...p.view).normalize() : DIR;
  const pos = target.clone().addScaledVector(dir, dist);
  return [p.id, { pos: pos.toArray(), target: target.toArray() }];
}));

/** Remembered across visits, so coming back out of a building starts beside it. */
let lastView = null;
export const rememberView = (id) => { lastView = id; };

/** Where the camera starts: beside the building just left, or the intro. */
export const startView = () => (lastView && VIEWS[lastView] ? VIEWS[lastView] : INTRO);

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const s = new THREE.Spherical();

if (typeof window !== "undefined") window.__views = VIEWS;

/**
 * The views were framed for a landscape screen. A tall, narrow one sees far
 * less of the town side to side, so pull back in proportion.
 */
function fitted(view, aspect, strength = 1) {
  const k = aspect < 1.35 ? Math.min(2.4, Math.pow(1.35 / aspect, 0.9 * strength)) : 1;
  if (k === 1) return view;
  const t = new THREE.Vector3(...view.target);
  const p = new THREE.Vector3(...view.pos).sub(t).multiplyScalar(k).add(t);
  return { pos: p.toArray(), target: view.target };
}

export default function CameraRig({ focus, onArrive, ready }) {
  const { camera, controls, size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  const anim = useRef(null);
  const arrived = useRef(onArrive);
  arrived.current = onArrive;
  const started = useRef(false);

  const fly = (to, dur, cb) => {
    if (!controls) return;
    controls.enabled = false;
    // Fly in orbit terms: the target slides, and the camera's distance and
    // angles around it ease together. Lerping positions straight would cut
    // a chord through the scene and swing the view on the way.
    const fromT = controls.target.clone(), toT = new THREE.Vector3(...to.target);
    const a = new THREE.Spherical().setFromVector3(camera.position.clone().sub(fromT));
    const b = new THREE.Spherical().setFromVector3(new THREE.Vector3(...to.pos).sub(toT));
    // Turn the short way round.
    let dTheta = b.theta - a.theta;
    dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
    anim.current = { fromT, toT, a, b, dTheta, t: 0, dur, cb };
  };

  // The opening: start high and far (or beside the building just left) and
  // settle onto the town. The camera is put at the start straight away,
  // behind the loader, so it never shows one place and then jumps.
  const from = useRef(null);
  useEffect(() => {
    if (!controls || from.current) return;
    from.current = startView();
    lastView = null;
    camera.position.set(...from.current.pos);
    controls.target.set(...from.current.target);
    controls.enabled = false;
    controls.update();
  }, [controls]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!controls || !ready || started.current || !from.current) return;
    started.current = true;
    fly(fitted(HOME, aspect), from.current === INTRO ? 3.6 : 2.2);
  }, [controls, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!controls || !started.current) return;
    if (focus && VIEWS[focus]) fly(fitted(VIEWS[focus], aspect, 0.6), 1.6, () => arrived.current?.(focus));
    else if (!focus) fly(fitted(HOME, aspect), 1.6);
  }, [focus, controls]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    const a = anim.current;
    if (!a) return;
    a.t = Math.min(1, a.t + dt / a.dur);
    const k = ease(a.t);
    controls.target.lerpVectors(a.fromT, a.toT, k);
    // Distance eases geometrically, so a long zoom feels even all the way in.
    const radius = a.a.radius * Math.pow(a.b.radius / a.a.radius, k);
    s.set(radius, THREE.MathUtils.lerp(a.a.phi, a.b.phi, k), a.a.theta + a.dTheta * k);
    camera.position.setFromSpherical(s).add(controls.target);
    camera.lookAt(controls.target);
    if (a.t >= 1) {
      anim.current = null;
      // Hand back to the controls without a kick: they pick up exactly here.
      controls.update();
      controls.enabled = true;
      a.cb?.();
    }
  });

  return null;
}

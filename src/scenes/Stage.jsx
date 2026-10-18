import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom, Vignette, ToneMapping, SMAA } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────────────
   A room to look into. The interiors (office, cinema, the project
   buildings) are dioramas: a floor on a base, two walls, the near walls
   cut away, and a camera that drifts in on arrival and can be turned a
   little but not walked off the edge.
───────────────────────────────────────────────────────────────────── */

const ease = (t) => 1 - Math.pow(1 - t, 3);

// Limits are set here, not as props on the controls: props are re-applied
// on render and would snap the camera back inside them during a close-up.
const limit = (c, l) => {
  c.minDistance = l.min ?? 3; c.maxDistance = l.max ?? 13;
  c.minPolarAngle = l.minPolar ?? 0.45; c.maxPolarAngle = l.maxPolar ?? 1.25;
  c.minAzimuthAngle = l.minAz ?? -0.35; c.maxAzimuthAngle = l.maxAz ?? 1.25;
};
const unlimit = (c) => {
  c.minDistance = 0; c.maxDistance = Infinity;
  c.minPolarAngle = 0; c.maxPolarAngle = Math.PI;
  c.minAzimuthAngle = -Infinity; c.maxAzimuthAngle = Infinity;
};

/**
 * Rooms are framed for a landscape screen. A tall, narrow one sees much
 * less of the room side to side, so the camera stands further back.
 */
const pullBack = (aspect) => (aspect < 1.35 ? Math.min(2.6, Math.pow(1.35 / aspect, 0.9)) : 1);
const back = (p, target, k) => p.map((v, i) => target[i] + (v - target[i]) * k);

function Intro({ from: from0, to: to0, target, dur = 2.6, focus, limits: limits0 }) {
  const { camera, controls, size } = useThree();
  const k = pullBack(size.width / Math.max(1, size.height));
  const from = back(from0, target, k);
  const to = back(to0, target, k);
  const limits = { ...limits0, max: (limits0.max ?? 13) * k };
  const anim = useRef({ t: 0, done: false });
  const fly = useRef(null);
  useEffect(() => {
    camera.position.set(...from);
    camera.lookAt(...target);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (controls) limit(controls, limits); }, [controls]); // eslint-disable-line react-hooks/exhaustive-deps

  // A focus is a camera move asked for after the intro, e.g. "look at the
  // screen". Clearing it flies home and puts the limits back.
  useEffect(() => {
    if (!controls) return;
    if (focus) unlimit(controls);
    const dest = focus || { pos: to, target };
    fly.current = { fromP: camera.position.clone(), fromT: controls.target.clone(), toP: new THREE.Vector3(...dest.pos), toT: new THREE.Vector3(...dest.target), t: 0, home: !focus };
  }, [focus, controls]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Lets the screenshot script place the camera.
    window.__cam = (p, t) => { anim.current.done = true; fly.current = null; camera.position.set(...p); controls?.target.set(...t); controls?.update(); };
  }, [camera, controls]);

  useFrame((_, dt) => {
    if (!controls) return;
    const a = anim.current;
    if (!a.done) {
      a.t = Math.min(1, a.t + dt / dur);
      camera.position.lerpVectors(new THREE.Vector3(...from), new THREE.Vector3(...to), ease(a.t));
      controls.target.set(...target);
      controls.update();
      if (a.t >= 1) {
        a.done = true;
        // A close-up asked for during the intro still runs; the default
        // "fly home" queued at mount is already where the intro ended.
        if (fly.current?.home) fly.current = null;
        else if (fly.current) { fly.current.fromP = camera.position.clone(); fly.current.fromT = controls.target.clone(); }
      }
      return;
    }
    const f = fly.current;
    if (!f) return;
    f.t = Math.min(1, f.t + dt / 1.2);
    camera.position.lerpVectors(f.fromP, f.toP, ease(f.t));
    controls.target.lerpVectors(f.fromT, f.toT, ease(f.t));
    controls.update();
    if (f.t >= 1) {
      if (f.home) limit(controls, limits);
      fly.current = null;
    }
  });
  return null;
}

/** Mounts only once everything beside it in the suspense has loaded. */
function Ready({ onReady }) {
  useEffect(() => { onReady?.(); }, [onReady]);
  return null;
}

export default function Stage({ children, camera, bg = '#f6efe4', sun = [-6, 9, -5], warm = '#fff1dc', limits = {}, focus, fov = 32, light = 1, onReady }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: camera.from, fov, near: 0.1, far: 120 }}
      gl={{ antialias: false }}
      onCreated={({ scene }) => { scene.background = new THREE.Color(bg); }}
    >
      <hemisphereLight args={['#fff7ea', '#b9a68a', 0.75 * light]} />
      <directionalLight
        position={sun}
        intensity={2.6 * light}
        color={warm}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[6, 5, 7]} intensity={0.6 * light} color="#dbe9ff" />
      <Environment resolution={128} frames={1} environmentIntensity={0.5 * light}>
        <Lightformer intensity={2} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
        <Lightformer intensity={1} position={[-6, 3, 4]} scale={[6, 3, 1]} color="#ffe2b8" />
      </Environment>

      {/* The intro is inside the suspense with the room, so the camera only
          starts moving once there is something to look at. */}
      <Suspense fallback={null}>
        {children}
        <Intro from={camera.from} to={camera.to} target={camera.target} focus={focus} limits={limits} />
        <Ready onReady={onReady} />
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
      />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <N8AO aoRadius={0.35} intensity={2} distanceFalloff={0.5} halfRes />
        <Bloom luminanceThreshold={1} intensity={0.5} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.3} darkness={0.4} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MapControls } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom, TiltShift2, Vignette, ToneMapping, SMAA } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import Ground from './Ground';
import StaticCity from './StaticCity';
import { startView } from './CameraRig';
import { markCityLoaded } from './Hud';

/* ─────────────────────────────────────────────────────────────────────
   The city: lights, sky, ground, and everything standing on it.

   The look comes mostly from light rather than from the models. A warm low
   sun throws long soft shadows, a sky-blue fill keeps the shadow side from
   going grey, ambient occlusion seats every object on the ground, and a
   tilt-shift blur at the top and bottom of the frame is what makes it read
   as a miniature rather than as a game.
───────────────────────────────────────────────────────────────────── */

const SKY = '#a9dcff';

function Sun() {
  const ref = useRef();
  return (
    <directionalLight
      ref={ref}
      position={[14, 22, 10]}
      intensity={3.2}
      color="#fff0d8"
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-camera-left={-20}
      shadow-camera-right={20}
      shadow-camera-top={20}
      shadow-camera-bottom={-20}
      shadow-camera-near={1}
      shadow-camera-far={70}
      shadow-bias={-0.0003}
      shadow-normalBias={0.02}
    />
  );
}

// Lets the screenshot script place the camera: window.__cam([x,y,z],[tx,ty,tz]).
function DebugCam() {
  const { camera, controls, scene } = useThree();
  useEffect(() => {
    window.__scene = scene;
    window.__cam = (p, t) => { camera.position.set(...p); controls?.target.set(...t); controls?.update(); };
  }, [camera, controls]);
  return null;
}

/** Mounts once the town has loaded, so a later visit knows not to show the loader. */
function Loaded() {
  useEffect(() => { markCityLoaded(); }, []);
  return null;
}

export default function CityScene({ children }) {
  // Read once: CameraRig clears the remembered view as soon as it has used it.
  const [start] = useState(startView);
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.75]}
      camera={{ position: start.pos, fov: 30, near: 0.5, far: 300 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      onCreated={({ scene }) => { scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(SKY, 55, 140); }}
    >
      <hemisphereLight args={['#cfe6ff', '#e9cfa0', 0.55]} />
      <Sun />
      <Environment resolution={128} frames={1} environmentIntensity={0.45}>
        <Lightformer intensity={2} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[20, 20, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-10, 4, 6]} scale={[10, 4, 1]} color="#ffe2b8" />
        <Lightformer intensity={1} position={[10, 4, -6]} scale={[10, 4, 1]} color="#bfe3ff" />
      </Environment>

      <Suspense fallback={null}>
        <Ground />
        <StaticCity />
        {children}
        <Loaded />
      </Suspense>

      <DebugCam />
      {/* No target prop: CameraRig sets it once. A prop here is re-applied on
          every render and would yank the view back mid-flight. minDistance
          sits below the closest building view (about 4.4), or the controls
          clamp the end of the flight and the camera pops back out. */}
      <MapControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={3.5}
        maxDistance={60}
        maxPolarAngle={1.15}
        minPolarAngle={0.35}
        screenSpacePanning={false}
      />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <N8AO aoRadius={0.6} intensity={2.2} distanceFalloff={0.6} halfRes />
        <Bloom luminanceThreshold={1} intensity={0.6} mipmapBlur />
        <TiltShift2 blur={0.06} taper={0.75} start={[0.5, 0.0]} end={[0.5, 1.0]} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.3} darkness={0.35} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}

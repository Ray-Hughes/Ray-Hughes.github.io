import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { PEOPLE } from './kit';

const X_AXIS = new THREE.Vector3(1, 0, 0);
const tap = new THREE.Quaternion();

/**
 * One of Kenney's mini characters, playing a clip.
 *
 * `typing` adds a small fast tap of the forearms on top of the seated pose,
 * which is all it takes for a figure at a desk to read as working rather
 * than as asleep. `path` makes the figure walk a closed loop of points.
 */
export default function Person({ who = 0, clip = 'idle', position = [0, 0, 0], rotation = 0, scale = 1, typing = false, path, speed = 0.35, phase = 0, hold }) {
  const url = typeof who === 'number' ? PEOPLE[who % PEOPLE.length] : who;
  const gltf = useGLTF(url);
  const { obj, mixer, arms } = useMemo(() => {
    const o = SkeletonUtils.clone(gltf.scene);
    o.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; c.frustumCulled = false; } });
    const m = new THREE.AnimationMixer(o);
    const arms = [o.getObjectByName('arm-left'), o.getObjectByName('arm-right')].filter(Boolean);
    return { obj: o, mixer: m, arms };
  }, [gltf]);

  useEffect(() => {
    const c = gltf.animations.find((a) => a.name === clip) || gltf.animations.find((a) => a.name === 'idle');
    const a = mixer.clipAction(c);
    a.reset().play();
    a.time = (phase * 7.3) % c.duration;
    return () => { a.stop(); };
  }, [clip, gltf, mixer, phase]);

  const g = useRef();
  const u = useRef(phase * 10);
  const tmp = useMemo(() => ({ x: 0, z: 0, h: 0 }), []);
  const lens = useMemo(() => {
    if (!path) return null;
    let total = 0;
    const l = path.map((p, k) => { const q = path[(k + 1) % path.length]; const d = Math.hypot(q[0] - p[0], q[1] - p[1]); total += d; return d; });
    return { l, total };
  }, [path]);

  useFrame(({ clock }, raw) => {
    const dt = Math.min(raw, 0.05);
    mixer.update(dt);
    // Typing: a small tap on top of the seated pose, whose hands already
    // rest forward. The mixer rewrites the arms every frame, so the tap is
    // applied to a fresh pose each time and cannot accumulate (an earlier
    // version added to the arms' own rotation, and they spun).
    if (typing && arms.length === 2) {
      const t = clock.elapsedTime * 16 + phase * 3;
      arms[0].quaternion.multiply(tap.setFromAxisAngle(X_AXIS, Math.sin(t) * 0.16));
      arms[1].quaternion.multiply(tap.setFromAxisAngle(X_AXIS, Math.sin(t + 1.7) * 0.16));
    }
    if (path && g.current) {
      u.current += speed * dt;
      let d = u.current % lens.total;
      for (let k = 0; k < path.length; k++) {
        if (d <= lens.l[k]) {
          const p = path[k], q = path[(k + 1) % path.length], f = d / lens.l[k];
          tmp.x = p[0] + (q[0] - p[0]) * f; tmp.z = p[1] + (q[1] - p[1]) * f;
          tmp.h = Math.atan2(q[0] - p[0], q[1] - p[1]);
          break;
        }
        d -= lens.l[k];
      }
      g.current.position.x = tmp.x;
      g.current.position.z = tmp.z;
      let diff = tmp.h - g.current.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      g.current.rotation.y += diff * Math.min(1, dt * 7);
    }
  });

  return (
    <group ref={g} position={position} rotation={[0, rotation, 0]} scale={scale}>
      <primitive object={obj} />
      {hold}
    </group>
  );
}

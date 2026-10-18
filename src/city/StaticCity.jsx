import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { bakeStatic } from './kit';
import { roadTiles, scenery, sceneryUrls } from './layout';

let baked = null;
const NONE = [];

/** Roads, filler buildings, street lights and trees: baked once, never touched again. */
export default function StaticCity({ extra = NONE }) {
  const urls = useMemo(() => [...new Set([...sceneryUrls(), ...extra.map((e) => e.url)])], [extra]);
  const gltfs = useGLTF(urls);
  const meshes = useMemo(() => {
    // The bake is the same every time, so it is done once per page load and
    // reused when the city is visited again after a building.
    if (baked && baked.extra === extra) return baked.meshes;
    const scenes = Object.fromEntries(urls.map((u, k) => [u, gltfs[k].scene]));
    baked = { extra, meshes: bakeStatic([...roadTiles(), ...scenery(), ...extra], scenes) };
    return baked.meshes;
  }, [gltfs, urls, extra]);
  // Kept alive for the next visit, so never disposed with this canvas.
  return meshes.map((m) => <primitive key={m.uuid} object={m} dispose={null} />);
}

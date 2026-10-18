import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { preloadCity } from '../routes';
import { useProgress } from '@react-three/drei';
import './interior.css';

/** The bar over any interior: the way back out, where you are, and what you can do here. */
export function InteriorHud({ icon, title, sub, color, actions }) {
  return (
    <div className="in-hud" style={{ '--c': color }}>
      <Link to="/?city" className="in-back" onPointerEnter={preloadCity} onFocus={preloadCity}>← Back to the city</Link>
      <div className="in-where">
        <span className="in-icon" aria-hidden="true">{icon}</span>
        <div>
          <div className="in-sub">{sub}</div>
          <div className="in-title">{title}</div>
        </div>
      </div>
      <div className="in-actions">{actions}</div>
    </div>
  );
}

/**
 * Covers the room until it is in the scene, then fades. Driven by the
 * room actually mounting rather than by load progress, which reads "done"
 * for a moment before anything has started and let a blank frame through.
 */
export function InteriorLoader({ label, ready }) {
  const { progress } = useProgress();
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setGone(true), 500);
    return () => clearTimeout(t);
  }, [ready]);
  if (gone) return null;
  return (
    <div className={`in-loader ${ready ? 'in-loader-out' : ''}`} role="status">
      <div>{label}</div>
      <div className="in-loader-bar"><span style={{ width: `${Math.max(5, progress)}%` }} /></div>
    </div>
  );
}

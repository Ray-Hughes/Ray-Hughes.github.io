import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '@react-three/drei';
import { PLACES, placeById } from './places';
import { PROFILE } from '../data/profile';

/* ─────────────────────────────────────────────────────────────────────
   Everything drawn over the town: the title card, the directory of
   buildings, and the loading screen. The
   directory matters most. The 3D is the fun way in, but every building is
   also one plain button away, for keyboards, screen readers and anyone in
   a hurry.
───────────────────────────────────────────────────────────────────── */

let cityLoaded = false;
export const markCityLoaded = () => { cityLoaded = true; };

export function Loader({ onDone }) {
  const { progress, active } = useProgress();
  // Coming back out of a building: the town is already in memory.
  const [cached] = useState(cityLoaded);
  const [mounted, setMounted] = useState(cityLoaded);
  useEffect(() => {
    if (mounted) return;
    const t = setInterval(() => { if (cityLoaded) setMounted(true); }, 100);
    return () => clearInterval(t);
  }, [mounted]);
  const done = mounted && !active && progress >= 100;
  const [gone, setGone] = useState(cached);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => { setGone(true); onDone?.(); }, cached ? 60 : 450);
    return () => clearTimeout(t);
  }, [done, onDone, cached]);
  if (gone) return null;
  return (
    <div className={`city-loader ${done ? 'city-loader-out' : ''}`} role="status" aria-live="polite">
      <div className="city-loader-card">
        <div className="city-loader-crane" aria-hidden="true">🏗️</div>
        <div className="city-loader-title">Building the city…</div>
        <div className="city-loader-bar"><span style={{ width: `${Math.max(4, progress)}%` }} /></div>
        <div className="city-loader-pct">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}

export function TitleCard() {
  return (
    <header className="hud-title">
      <div className="hud-name">{PROFILE.name}</div>
      <div className="hud-role">{PROFILE.title}</div>
      <div className="hud-links">
        <a href={PROFILE.resume} download>Résumé PDF</a>
        <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </header>
  );
}

export function Corner({ focus, onBack }) {
  return (
    <div className="hud-corner">
      {focus && <button className="hud-btn" onClick={onBack}>← Back to the map</button>}
      <Link className="hud-btn hud-btn-quiet" to="/classic">Skip the city</Link>
    </div>
  );
}

export function Directory({ focus, onPick }) {
  return (
    <nav className="hud-dir" aria-label="Buildings">
      {PLACES.map((p) => (
        <button
          key={p.id}
          className={`hud-dir-item ${focus === p.id ? 'is-on' : ''}`}
          style={{ '--c': p.color }}
          onClick={() => onPick(p.id)}
          title={`${p.title}: ${p.sub}`}
        >
          <span className="hud-dir-icon" aria-hidden="true">{p.icon}</span>
          <span className="hud-dir-label">{p.sub.replace(/^Project · /, '')}</span>
        </button>
      ))}
    </nav>
  );
}

export function Hint() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 9000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`hud-hint ${show ? '' : 'hud-hint-out'}`}>
      Click a building to go inside · drag to move · scroll to zoom · right-drag to turn
    </div>
  );
}

/** A short beat between choosing a building and arriving inside it. */
export function Entering({ id }) {
  const p = id && placeById[id];
  if (!p) return null;
  return (
    <div className="hud-enter" style={{ '--c': p.color }}>
      <div className="hud-enter-card">
        <span className="hud-enter-icon">{p.icon}</span>
        <span>Heading into <strong>{p.title}</strong>…</span>
      </div>
    </div>
  );
}

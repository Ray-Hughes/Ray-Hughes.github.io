import { useEffect, useRef, useState } from 'react';
import useBest from './useBest';

/* The crane swings a floor across; drop it on the one below. Whatever hangs
   over the edge is cut off, so the floors get narrower unless you are exact.
   Click, tap or press space. */

const W = 520, H = 400;
const FLOOR = 26;
const COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7', '#748ffc', '#da77f2'];

export default function TowerStack() {
  const canvas = useRef(null);
  const [state, setState] = useState('ready');
  const [score, setScore] = useState(0);
  const [best, offer] = useBest('tower');
  const g = useRef(null);

  const start = (e) => {
    // Hand focus to the canvas, so Space drops floors rather than pressing
    // this button again and restarting the game.
    e?.currentTarget?.blur();
    canvas.current?.focus();
    g.current = {
      floors: [{ x: W / 2 - 90, w: 180 }],
      moving: { x: 0, w: 180, dir: 1 },
      speed: 170, view: 0, chips: [], perfect: 0,
    };
    setScore(0); setState('play');
  };

  const drop = () => {
    const s = g.current;
    if (state !== 'play' || !s) return;
    const top = s.floors[s.floors.length - 1];
    const m = s.moving;
    const left = Math.max(m.x, top.x), right = Math.min(m.x + m.w, top.x + top.w);
    const w = right - left;
    if (w <= 0) { setState('over'); offer(s.floors.length - 1); return; }
    // Within a few pixels counts as exact, and an exact drop does not shrink.
    let nx = left, nw = w;
    if (Math.abs(m.x - top.x) < 5) { nx = top.x; nw = top.w; s.perfect++; }
    else {
      s.perfect = 0;
      const offX = m.x < top.x ? m.x : right;
      s.chips.push({ x: offX, w: m.w - w, y: s.floors.length, vy: 0, c: s.floors.length });
    }
    s.floors.push({ x: nx, w: nw });
    setScore(s.floors.length - 1);
    s.moving = { x: s.floors.length % 2 ? -nw : W, w: nw, dir: s.floors.length % 2 ? 1 : -1 };
    s.speed = Math.min(420, s.speed + 9);
  };

  useEffect(() => {
    const key = (e) => {
      if (e.code !== 'Space' || e.target instanceof HTMLButtonElement) return;
      e.preventDefault();
      drop();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    let raf, last = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = g.current;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#8fd3ff'); sky.addColorStop(1, '#e8f6ff');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      if (s) {
        if (state === 'play') {
          s.moving.x += s.moving.dir * s.speed * dt;
          if (s.moving.x > W - s.moving.w * 0.2) s.moving.dir = -1;
          if (s.moving.x < -s.moving.w * 0.8) s.moving.dir = 1;
        }
        const targetView = Math.max(0, s.floors.length - 9) * FLOOR;
        s.view += (targetView - s.view) * Math.min(1, dt * 5);
        const yOf = (i) => H - 30 - (i + 1) * FLOOR + s.view;
        // Ground and the site hoarding.
        ctx.fillStyle = '#d9b98c'; ctx.fillRect(0, H - 30 + s.view, W, 40);
        s.floors.forEach((f, i) => {
          ctx.fillStyle = i === 0 ? '#9aa0a8' : COLORS[i % COLORS.length];
          ctx.fillRect(f.x, yOf(i), f.w, FLOOR - 2);
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          for (let wx = f.x + 8; wx < f.x + f.w - 12; wx += 18) ctx.fillRect(wx, yOf(i) + 7, 9, 10);
        });
        s.chips = s.chips.filter((c) => { c.vy += 900 * dt; c.y -= (c.vy * dt) / FLOOR; return c.y > -20; });
        s.chips.forEach((c) => { ctx.fillStyle = COLORS[c.c % COLORS.length]; ctx.globalAlpha = 0.8; ctx.fillRect(c.x, yOf(c.y), c.w, FLOOR - 2); ctx.globalAlpha = 1; });
        if (state === 'play') {
          const m = s.moving, y = yOf(s.floors.length) - 40;
          // The crane's cable and hook, carrying the next floor.
          ctx.strokeStyle = '#3b3f4a'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(m.x + m.w / 2, 0); ctx.lineTo(m.x + m.w / 2, y + 40); ctx.stroke();
          ctx.fillStyle = '#ffc93c'; ctx.fillRect(0, 0, W, 10);
          ctx.fillStyle = COLORS[s.floors.length % COLORS.length];
          ctx.fillRect(m.x, y + 40, m.w, FLOOR - 2);
        }
        if (s.perfect > 0 && state === 'play') {
          ctx.fillStyle = '#ff6b6b'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(s.perfect > 1 ? `Perfect ×${s.perfect}!` : 'Perfect!', W / 2, 40);
        }
      }
      if (state !== 'play') {
        ctx.fillStyle = 'rgba(20,40,70,0.55)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 30px sans-serif';
        ctx.fillText(state === 'over' ? `${score} floors tall` : 'Tower Stack', W / 2, H / 2 - 10);
        ctx.font = '15px sans-serif';
        ctx.fillText(state === 'over' ? 'The inspector has some notes.' : 'Drop each floor squarely on the last.', W / 2, H / 2 + 22);
      }
      ctx.textAlign = 'left';
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [state, score]);

  return (
    <div className="game">
      <div className="game-bar">
        <span>🏗️ {score} floors</span>
        <span>Best {best}</span>
        <button onClick={start}>{state === 'play' ? 'Restart' : state === 'over' ? 'Build again' : 'Start'}</button>
      </div>
      <canvas ref={canvas} width={W} height={H} onPointerDown={drop} tabIndex={0} />
      <div className="game-help">Click, tap or press space to drop the floor.</div>
    </div>
  );
}

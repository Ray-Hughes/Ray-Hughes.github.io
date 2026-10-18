import { useEffect, useRef, useState } from 'react';
import useBest from './useBest';

/* Bugs surface in the codebase; squash them before they hide again.
   Thirty seconds, faster as it goes. */

const COLS = 4, ROWS = 3, W = 520, H = 340;
const ROUND = 30;

export default function BugSquash() {
  const canvas = useRef(null);
  const [state, setState] = useState('ready');
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(ROUND);
  const [best, offer] = useBest('bugsquash');
  const game = useRef(null);

  const start = () => {
    game.current = { bugs: [], splats: [], t: 0, next: 0.4, score: 0, missed: 0 };
    setScore(0); setLeft(ROUND); setState('play');
  };

  useEffect(() => {
    const c = canvas.current;
    const ctx = c.getContext('2d');
    const cw = W / COLS, ch = H / ROWS;
    let raf, last = performance.now();

    const draw = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;
      ctx.fillStyle = '#0f1724'; ctx.fillRect(0, 0, W, H);
      for (let r = 0; r < ROWS; r++) for (let k = 0; k < COLS; k++) {
        const x = k * cw + 6, y = r * ch + 6;
        ctx.fillStyle = '#18233a'; ctx.beginPath(); ctx.roundRect(x, y, cw - 12, ch - 12, 10); ctx.fill();
        ctx.fillStyle = '#2a3a58'; ctx.fillRect(x, y, cw - 12, 16);
        ctx.fillStyle = '#7a8aa6'; ctx.font = '10px monospace'; ctx.fillText(['app.rb', 'mcp.js', 'graph.py', 'db.sql'][(r * COLS + k) % 4], x + 8, y + 12);
        for (let l = 0; l < 5; l++) {
          ctx.fillStyle = ['#ff7b72', '#79c0ff', '#7ee787', '#d2a8ff', '#c9d4e5'][(r + k + l) % 5];
          ctx.globalAlpha = 0.55;
          ctx.fillRect(x + 10 + (l % 2) * 12, y + 26 + l * 14, (cw - 50) * (0.4 + ((r * 7 + k * 3 + l * 5) % 6) / 10), 5);
          ctx.globalAlpha = 1;
        }
      }
      if (g && state === 'play') {
        g.t += dt;
        const remain = Math.max(0, ROUND - g.t);
        setLeft(Math.ceil(remain));
        g.next -= dt;
        if (g.next <= 0) {
          const free = [];
          for (let i = 0; i < COLS * ROWS; i++) if (!g.bugs.some((b) => b.cell === i)) free.push(i);
          if (free.length) g.bugs.push({ cell: free[Math.floor(Math.random() * free.length)], age: 0, life: Math.max(0.65, 1.5 - g.t * 0.03) });
          g.next = Math.max(0.28, 0.85 - g.t * 0.02);
        }
        g.bugs.forEach((b) => { b.age += dt; });
        g.bugs = g.bugs.filter((b) => b.age < b.life);
        if (remain <= 0) {
          setState('over');
          offer(g.score);
        }
      }
      if (g) {
        for (const b of g.bugs) {
          const k = b.cell % COLS, r = Math.floor(b.cell / COLS);
          const pop = Math.min(1, b.age * 8) * Math.min(1, (b.life - b.age) * 8);
          ctx.save();
          ctx.translate(k * cw + cw / 2, r * ch + ch / 2 + 6);
          ctx.scale(pop, pop);
          ctx.rotate(Math.sin(b.age * 20) * 0.15);
          ctx.font = '46px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('🐛', 0, 0);
          ctx.restore();
        }
        g.splats = g.splats.filter((s) => (s.age += dt) < 0.6);
        for (const s of g.splats) {
          ctx.globalAlpha = 1 - s.age / 0.6;
          ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#7ee787';
          ctx.fillText('+1 fixed', s.x, s.y - s.age * 40);
          ctx.globalAlpha = 1;
        }
      }
      if (state !== 'play') {
        ctx.fillStyle = 'rgba(15,23,36,0.72)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 30px sans-serif';
        ctx.fillText(state === 'over' ? `${game.current.score} bugs squashed` : 'Bug Squash', W / 2, H / 2 - 10);
        ctx.font = '15px sans-serif'; ctx.fillStyle = '#c9d4e5';
        ctx.fillText(state === 'over' ? 'Production thanks you.' : 'Click the bugs before they get to production.', W / 2, H / 2 + 22);
        ctx.textAlign = 'left';
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [state, offer]);

  const hit = (e) => {
    const g = game.current;
    if (state !== 'play' || !g) return;
    const rect = canvas.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    const cell = Math.floor(x / (W / COLS)) + Math.floor(y / (H / ROWS)) * COLS;
    const bug = g.bugs.find((b) => b.cell === cell);
    if (bug) {
      g.bugs = g.bugs.filter((b) => b !== bug);
      g.score++;
      g.splats.push({ x, y, age: 0 });
      setScore(g.score);
    }
  };

  return (
    <div className="game">
      <div className="game-bar">
        <span>🐛 {score} squashed</span>
        <span>⏱ {left}s</span>
        <span>Best {best}</span>
        <button onClick={start}>{state === 'play' ? 'Restart' : state === 'over' ? 'Play again' : 'Start'}</button>
      </div>
      <canvas ref={canvas} width={W} height={H} onPointerDown={hit} />
    </div>
  );
}

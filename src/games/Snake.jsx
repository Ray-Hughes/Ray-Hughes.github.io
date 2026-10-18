import { useEffect, useRef, useState } from 'react';
import useBest from './useBest';

/* Snake on the living-room TV. Coffee makes it longer and faster.
   Arrow keys or WASD, or swipe on a touch screen. */

const GW = 22, GH = 14, CELL = 24;
const W = GW * CELL, H = GH * CELL;

export default function Snake() {
  const canvas = useRef(null);
  const [state, setState] = useState('ready');
  const [score, setScore] = useState(0);
  const [best, offer] = useBest('snake');
  const g = useRef(null);

  const place = (snake) => {
    let p;
    do p = { x: Math.floor(Math.random() * GW), y: Math.floor(Math.random() * GH) };
    while (snake.some((s) => s.x === p.x && s.y === p.y));
    return p;
  };

  const start = () => {
    const snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }];
    g.current = { snake, dir: { x: 1, y: 0 }, queue: [], food: place(snake), acc: 0, step: 0.13, score: 0 };
    setScore(0); setState('play');
    canvas.current?.focus();
  };

  useEffect(() => {
    const turn = (d) => {
      const s = g.current;
      if (!s) return;
      const last = s.queue[s.queue.length - 1] || s.dir;
      if (d.x === -last.x && d.y === -last.y) return;
      if (s.queue.length < 3) s.queue.push(d);
    };
    const key = (e) => {
      const m = { ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] }[e.code];
      if (!m) return;
      e.preventDefault();
      turn({ x: m[0], y: m[1] });
    };
    window.addEventListener('keydown', key);
    let sx = 0, sy = 0;
    const c = canvas.current;
    const down = (e) => { sx = e.clientX; sy = e.clientY; };
    const up = (e) => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
      turn(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
    };
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointerup', up);
    return () => { window.removeEventListener('keydown', key); c.removeEventListener('pointerdown', down); c.removeEventListener('pointerup', up); };
  }, []);

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    let raf, last = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = g.current;
      if (s && state === 'play') {
        s.acc += dt;
        while (s.acc >= s.step) {
          s.acc -= s.step;
          if (s.queue.length) s.dir = s.queue.shift();
          const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
          if (head.x < 0 || head.y < 0 || head.x >= GW || head.y >= GH || s.snake.some((p) => p.x === head.x && p.y === head.y)) {
            setState('over');
            offer(s.score);
            break;
          }
          s.snake.unshift(head);
          if (head.x === s.food.x && head.y === s.food.y) {
            s.score++; setScore(s.score);
            s.food = place(s.snake);
            s.step = Math.max(0.06, s.step - 0.004);
          } else s.snake.pop();
        }
      }
      // A CRT: dark glass, a faint grid, scanlines over the top.
      ctx.fillStyle = '#10241a'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(120,255,170,0.05)';
      for (let x = 0; x <= GW; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
      for (let y = 0; y <= GH; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }
      if (s) {
        ctx.font = `${CELL - 4}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('☕', s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2 + 1);
        s.snake.forEach((p, k) => {
          ctx.fillStyle = k === 0 ? '#b8ffcf' : `hsl(${140 + k * 3}, 80%, ${62 - Math.min(k, 20)}%)`;
          ctx.beginPath(); ctx.roundRect(p.x * CELL + 2, p.y * CELL + 2, CELL - 4, CELL - 4, 6); ctx.fill();
        });
      }
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
      if (state !== 'play') {
        ctx.fillStyle = 'rgba(8,20,14,0.7)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#b8ffcf'; ctx.textAlign = 'center'; ctx.font = 'bold 30px monospace';
        ctx.fillText(state === 'over' ? 'GAME OVER' : 'SNAKE', W / 2, H / 2 - 12);
        ctx.font = '14px monospace';
        ctx.fillText(state === 'over' ? `${s.score} coffees` : 'arrows / WASD / swipe', W / 2, H / 2 + 20);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [state, offer]);

  return (
    <div className="game">
      <div className="game-bar">
        <span>☕ {score}</span>
        <span>Best {best}</span>
        <button onClick={start}>{state === 'play' ? 'Restart' : state === 'over' ? 'Play again' : 'Start'}</button>
      </div>
      <canvas ref={canvas} width={W} height={H} tabIndex={0} />
      <div className="game-help">Arrow keys or WASD on a keyboard, swipe on a phone.</div>
    </div>
  );
}

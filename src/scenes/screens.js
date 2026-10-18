import * as THREE from 'three';
import { PROFILE, EXPERIENCE } from '../data/profile';

/* ─────────────────────────────────────────────────────────────────────
   What the monitors show. Each is a canvas texture redrawn a few times a
   second, so the code on a screen actually scrolls and the cursor blinks.
───────────────────────────────────────────────────────────────────── */

const SNIPPETS = [
  ['class AgentToolkit', '  def initialize(repo:)', '    @repo = repo', '    @mcp = Mcp::Client.new', '  end', '', '  def review(pr)', '    context = @mcp.call(:search, q: pr.title)', '    Claude.review(pr.diff, context:)', '  end', 'end'],
  ['export function undo(id) {', '  const entry = one(SQL.audit, { id })', '  if (entry.undone) throw new Error()', '  return replay(entry.before)', '}', '', 'server.tool("add_task", async (args) => {', '  const task = store.insert(args)', '  return { content: [task] }', '})'],
  ['consumer = Kafka::Consumer.new(', '  topic: "appeals.decisions",', '  group: "appeals-consumer"', ')', 'consumer.each_message do |msg|', '  Decision.ingest!(msg.value)', 'rescue => e', '  DeadLetter.push(msg, e)', 'end'],
  ['$ bundle exec rspec', '.........................', '.........................', '', 'Finished in 4.21 seconds', '842 examples, 0 failures', '', '$ git push origin main', 'remote: ✓ checks passed'],
];

const KW = /\b(class|def|end|export|function|const|return|if|throw|new|async|await|rescue|do)\b/g;

export function codeScreen(seed = 0, accent = '#7ee787') {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 160;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const lines = SNIPPETS[seed % SNIPPETS.length];
  let shown = 0, chars = 0, scroll = 0;

  const draw = (blink) => {
    ctx.fillStyle = '#0f1724';
    ctx.fillRect(0, 0, 256, 160);
    ctx.fillStyle = '#1b2638';
    ctx.fillRect(0, 0, 256, 14);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, k) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(9 + k * 10, 7, 3, 0, 7); ctx.fill(); });
    ctx.font = '11px monospace';
    const visible = lines.slice(0, shown + 1);
    visible.forEach((ln, k) => {
      const y = 30 + k * 13 - scroll;
      if (y < 18 || y > 160) return;
      const text = k === shown ? ln.slice(0, chars) : ln;
      ctx.fillStyle = '#4a5a74';
      ctx.fillText(String(k + 1).padStart(2), 6, y);
      ctx.fillStyle = text.trim().startsWith('$') || /✓|0 failures/.test(text) ? accent : '#c9d4e5';
      ctx.fillText(text, 26, y);
      // A crude highlight pass: keywords in a second colour on top.
      ctx.fillStyle = '#ff7b72';
      text.replace(KW, (m, _g, i) => { ctx.fillText(m, 26 + ctx.measureText(text.slice(0, i)).width, y); return m; });
      if (k === shown && blink) { ctx.fillStyle = accent; ctx.fillRect(26 + ctx.measureText(text).width + 1, y - 9, 6, 11); }
    });
    tex.needsUpdate = true;
  };

  let acc = 0, blinkT = 0;
  const tick = (dt) => {
    acc += dt; blinkT += dt;
    if (acc > 0.07) {
      acc = 0;
      chars++;
      if (chars > (lines[shown] || '').length) {
        chars = 0; shown++;
        if (30 + shown * 13 - scroll > 150) scroll += 13;
        if (shown >= lines.length) { shown = 0; scroll = 0; }
      }
      draw(Math.floor(blinkT * 2) % 2 === 0);
    }
  };
  draw(true);
  return { tex, tick };
}

/** The big screen at Ray's desk: the résumé, as a document on a monitor. */
export function resumeScreen() {
  const W = 512, H = 320;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  let t = 0;
  const draw = () => {
    ctx.fillStyle = '#e8eef7'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(14, 22, W - 28, H - 30);
    ctx.fillStyle = '#d5deeb'; ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = '#5b6b82'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('résumé.pdf', 12, 13);
    ctx.fillStyle = '#1d4f91'; ctx.fillRect(14, 22, W - 28, 64);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 28px sans-serif'; ctx.fillText(PROFILE.name, 30, 58);
    ctx.font = '14px sans-serif'; ctx.fillStyle = '#cfe0ff'; ctx.fillText(`${PROFILE.title} · ${PROFILE.location}`, 30, 77);
    let y = 108;
    EXPERIENCE.slice(0, 3).forEach((job) => {
      ctx.fillStyle = '#1d2433'; ctx.font = 'bold 14px sans-serif'; ctx.fillText(job.company, 30, y);
      ctx.fillStyle = '#7a8396'; ctx.font = '11px sans-serif'; ctx.fillText(job.period, W - 30 - ctx.measureText(job.period).width, y);
      ctx.fillStyle = '#2f6fd0'; ctx.font = '12px sans-serif'; ctx.fillText(job.role, 30, y + 16);
      ctx.fillStyle = '#c3cbd8';
      for (let k = 0; k < 2; k++) ctx.fillRect(30, y + 26 + k * 10, (W - 80) * (0.95 - k * 0.2), 5);
      y += 64;
    });
    // A pulsing call to action, so it reads as clickable.
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.fillStyle = `rgba(47,111,208,${0.85 + pulse * 0.15})`;
    ctx.beginPath(); ctx.roundRect(W / 2 - 92, H - 40, 184, 28, 14); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif';
    const label = 'Click to read the résumé';
    ctx.fillText(label, W / 2 - ctx.measureText(label).width / 2, H - 21);
    tex.needsUpdate = true;
  };
  let acc = 0;
  const tick = (dt) => { t += dt; acc += dt; if (acc > 0.1) { acc = 0; draw(); } };
  draw();
  return { tex, tick };
}

/** A whiteboard with an architecture sketch: boxes, arrows, a sticky note. */
export function whiteboard() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const c = canvas.getContext('2d');
  c.fillStyle = '#fbfcfe'; c.fillRect(0, 0, 512, 256);
  c.lineWidth = 3; c.lineCap = 'round';
  const box = (x, y, w, h, col, label) => {
    c.strokeStyle = col; c.strokeRect(x, y, w, h);
    c.fillStyle = col; c.font = 'bold 18px sans-serif'; c.fillText(label, x + 10, y + h / 2 + 6);
  };
  const arrow = (x1, y1, x2, y2) => {
    c.strokeStyle = '#334'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - 12 * Math.cos(a - 0.4), y2 - 12 * Math.sin(a - 0.4));
    c.moveTo(x2, y2); c.lineTo(x2 - 12 * Math.cos(a + 0.4), y2 - 12 * Math.sin(a + 0.4)); c.stroke();
  };
  box(24, 30, 120, 56, '#2f6fd0', 'Agents');
  box(200, 30, 110, 56, '#9b3fd6', 'MCP');
  box(370, 30, 118, 56, '#16a34a', 'Tracker');
  box(200, 160, 110, 56, '#e0662a', 'Kafka');
  arrow(144, 58, 196, 58); arrow(310, 58, 366, 58); arrow(255, 88, 255, 156);
  c.fillStyle = '#ffe66d'; c.fillRect(380, 150, 100, 80);
  c.fillStyle = '#5a4a00'; c.font = 'bold 15px sans-serif'; c.fillText('ship it', 395, 180); c.fillText('Friday ✓', 395, 205);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** The living-room TV in attract mode: a snake chasing coffee round the screen. */
export function tvScreen() {
  const W = 256, H = 160, C = 10;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  let t = 0, acc = 0;
  const path = (k) => {
    // A lap of the screen, one cell at a time.
    const cols = W / C - 4, rows = H / C - 6, per = 2 * (cols + rows);
    const s = ((k % per) + per) % per;
    if (s < cols) return [2 + s, 3];
    if (s < cols + rows) return [2 + cols, 3 + s - cols];
    if (s < 2 * cols + rows) return [2 + cols - (s - cols - rows), 3 + rows];
    return [2, 3 + rows - (s - 2 * cols - rows)];
  };
  const draw = () => {
    ctx.fillStyle = '#10241a'; ctx.fillRect(0, 0, W, H);
    const head = Math.floor(t * 9);
    for (let k = 0; k < 9; k++) {
      const [x, y] = path(head - k);
      ctx.fillStyle = k === 0 ? '#b8ffcf' : `hsl(${140 + k * 4}, 80%, ${60 - k * 2}%)`;
      ctx.fillRect(x * C + 1, y * C + 1, C - 2, C - 2);
    }
    const [fx, fy] = path(head + 14);
    ctx.font = '10px serif'; ctx.fillText('☕', fx * C, fy * C + 9);
    ctx.fillStyle = '#b8ffcf'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
    if (Math.floor(t * 1.5) % 2) ctx.fillText('PRESS START', W / 2, H / 2 + 6);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    tex.needsUpdate = true;
  };
  const tick = (dt) => { t += dt; acc += dt; if (acc > 0.08) { acc = 0; draw(); } };
  draw();
  return { tex, tick };
}

/** An arcade cabinet's marquee screen: bugs scurrying across code. */
export function arcadeScreen() {
  const W = 200, H = 160;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  let t = 0, acc = 0;
  const draw = () => {
    ctx.fillStyle = '#0f1724'; ctx.fillRect(0, 0, W, H);
    for (let l = 0; l < 9; l++) {
      ctx.fillStyle = ['#ff7b72', '#79c0ff', '#7ee787', '#d2a8ff'][l % 4];
      ctx.globalAlpha = 0.5;
      ctx.fillRect(14 + (l % 3) * 8, 18 + l * 14, 60 + ((l * 37) % 90), 5);
      ctx.globalAlpha = 1;
    }
    ctx.font = '26px serif';
    for (let k = 0; k < 3; k++) ctx.fillText('🐛', ((t * 40 + k * 70) % (W + 30)) - 30, 50 + k * 38 + Math.sin(t * 6 + k) * 4);
    ctx.fillStyle = '#ffd43b'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
    ctx.fillText('BUG SQUASH', W / 2, 22);
    if (Math.floor(t * 2) % 2) { ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.fillText('INSERT COIN', W / 2, H - 10); }
    ctx.textAlign = 'left';
    tex.needsUpdate = true;
  };
  const tick = (dt) => { t += dt; acc += dt; if (acc > 0.06) { acc = 0; draw(); } };
  draw();
  return { tex, tick };
}

/** The cinema screen: a slideshow of what is showing. */
export function cinemaScreen(posts) {
  const W = 640, H = 320;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  let t = 0, acc = 0;
  const draw = () => {
    const per = 4;
    const k = Math.floor(t / per) % posts.length;
    const f = (t % per) / per;
    const p = posts[k];
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, p.color); g.addColorStop(1, '#141018');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = Math.min(1, f * 6, (1 - f) * 6);
    ctx.font = '84px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.icon, W / 2, H * 0.36 + Math.sin(t * 2) * 4);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 30px sans-serif';
    ctx.fillText(p.title, W / 2, H * 0.68);
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '15px sans-serif';
    ctx.fillText('NOW SHOWING · RAY’S BLOG', W / 2, H * 0.84);
    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    tex.needsUpdate = true;
  };
  const tick = (dt) => { t += dt; acc += dt; if (acc > 0.05) { acc = 0; draw(); } };
  draw();
  return { tex, tick };
}

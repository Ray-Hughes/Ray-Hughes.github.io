import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────
   SpaceField

   The backdrop. A planet limb across the lower part of the frame with its
   atmosphere burning along the edge, and a starfield that turns about the
   planet's centre the way a long exposure over a horizon does.

   Two canvases, because the two halves cost very different amounts. The limb
   and its glow are a per-pixel job — three exponential shells dithered
   stochastically into three colours — so they are computed once per resize
   into an ImageData and then left alone. The stars are cheap and are redrawn
   on top every frame.

   Both are rendered below CSS resolution and scaled up with
   image-rendering: pixelated, which is what turns the dither into grain
   instead of a smooth gradient.

   The pair sit on a layer taller than the viewport that slides down as the
   page scrolls, so the planet sets and the rest of the site is read against
   plain sky. Pinning the limb to the bottom of the viewport instead left a
   bright band permanently wedged between the cards, which read as a bug.
───────────────────────────────────────────────────────────────────── */

/* Palette, straight off the tokens in index.css. */
const SKY    = [110, 231, 255];  // --cy
const VIOLET = [167, 139, 250];  // --vi
const PLUM   = [ 58,  22,  96];
const VOID   = [  7,   7,  14];  // --ink-0

/* Star shades, quantised so the draw loop never builds a string. */
const SHADES = Array.from({ length: 20 }, (_, i) =>
  `rgba(237,239,246,${((i + 1) / 20).toFixed(3)})`);

/* Radians per millisecond. Slow enough to read as drift rather than spin:
   roughly three pixels a second at the top of a laptop screen. */
const SPIN = 1.15e-6;

const PIXEL_BUDGET = 1.6e6;

/* Headroom above the viewport, as a fraction of it. This is both how far the
   planet can sink and how much extra sky there is to slide into view. */
const HEADROOM = 0.5;

/* How much of a scroll the sinking eats. Half, so the planet is gone about a
   screen and a half in. */
const SINK = 0.5;

/** Integer hash to [0, 1). Deterministic, so the same frame renders the same
    field on every load and the composition can be judged as a design. */
function hash(n) {
  let t = n >>> 0;
  t = Math.imul(t ^ (t >>> 16), 2246822507);
  t = Math.imul(t ^ (t >>> 13), 3266489909);
  return ((t ^ (t >>> 16)) >>> 0) / 4294967296;
}

/** Where the planet is, and how much sky there is around it. */
function geometry(W, H, crestY) {
  // Shell widths and star density are authored against this reference frame
  // and scaled from it, so the picture holds together at any size.
  const s = Math.min(2.2, Math.max(0.5, Math.sqrt((W * H) / (1440 * 810))));

  // Curvature is set against the width, not the diagonal. Tie it to the larger
  // dimension and a phone gets a circle so big the limb is a straight line.
  const R  = 2.0 * W;
  const cx = W * 0.53;
  const cy = crestY + R;

  // The visible sky is an annular sector. Walk the frame edge to find it.
  let thetaMin = Infinity, thetaMax = -Infinity, maxD = 0;
  for (let i = 0; i <= 24; i++) {
    const f = i / 24;
    const pts = [[W * f, 0], [W * f, H], [0, H * f], [W, H * f]];
    for (const [x, y] of pts) {
      const a = Math.atan2(y - cy, x - cx);
      if (a < thetaMin) thetaMin = a;
      if (a > thetaMax) thetaMax = a;
      const d = Math.hypot(x - cx, y - cy);
      if (d > maxD) maxD = d;
    }
  }

  return { s, R, cx, cy, thetaMin, thetaMax, maxD };
}

/* ── The limb ────────────────────────────────────────────────────────── */

function paintLimb(canvas, W, H, g) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const { s, R, cx, cy, thetaMin, thetaMax } = g;
  const img = ctx.createImageData(W, H);
  const px = img.data;

  // A wash that falls away from the middle of the frame, so the glow never
  // competes with the copy sitting on top of it.
  const vx = W / 2, vy = H / 2, vr = 1500 * s;
  const vig = (x, y) => {
    const dx = x - vx, dy = y - vy;
    const n = Math.sqrt(dx * dx + dy * dy) / vr;
    const v = 1 - n * n * n;
    return v > 0.25 ? v : 0.25;
  };

  // Three shells reaching up from the limb: a tight cyan rim, a violet halo,
  // and a broad plum haze. They stay low deliberately — the copy sits over the
  // top two thirds of the frame, and an atmosphere that reaches it turns into
  // a texture behind text rather than a horizon behind a page.
  const rim = 3 * s;
  const w1 = 9 * s,  a1w = 1.00;
  const w2 = 38 * s, a2w = 0.50;
  const w3 = 104 * s, a3w = 0.20;
  const r2 = 8 * s, r3 = 22 * s;                  // where the outer two fade in
  const cut = w3 * 6;                             // past here nothing is left to add
  const band = (Math.PI * 4.8) / (thetaMax - thetaMin);  // swell along the limb

  // The expensive part runs at half resolution; each 2×2 block shares a sample.
  const hw = Math.ceil(W / 2), hh = Math.ceil(H / 2);
  const rgb = new Float32Array(hw * hh * 3);
  const set = new Uint8Array(hw * hh);

  for (let j = 0; j < hh; j++) {
    const y = j * 2, dy = y - cy, dy2 = dy * dy;
    for (let i = 0; i < hw; i++) {
      const x = i * 2, dx = x - cx;
      const d = Math.sqrt(dx * dx + dy2) - R;
      if (d < -rim || d > cut) continue;   // planet body, or empty space

      let colour = null;
      let amt = vig(x + 1, y + 1);

      if (d < rim) {
        amt *= 1 + 0.18 * Math.sin(Math.atan2(dy, dx) * band);
        colour = SKY;
      } else {
        const a1 = Math.exp(-d / w1) * a1w;
        const a2 = Math.exp(-d / w2) * Math.min(1, d / r2) * a2w;
        const a3 = Math.exp(-d / w3) * Math.min(1, d / r3) * a3w;
        const tot = Math.min(1, a1 + a2 + a3);
        if (tot > 0.003) {
          // Stochastic rather than blended: which of the three shells wins is
          // decided per pixel by a coin toss weighted by their strength. That
          // dither is the whole texture.
          const u = hash((j * hw + i) ^ 0x9e3779b9);
          if (u < a1) {
            amt *= 1 + 0.18 * Math.sin(Math.atan2(dy, dx) * band);
            colour = SKY;
          } else if (u < a1 + a2) colour = VIOLET;
          else if (u < tot)       colour = PLUM;
        }
      }

      if (colour) {
        const k = j * hw + i;
        set[k] = 1;
        rgb[k * 3]     = colour[0] * amt;
        rgb[k * 3 + 1] = colour[1] * amt;
        rgb[k * 3 + 2] = colour[2] * amt;
      }
    }
  }

  // Expand to full resolution, adding a little grain so the flat areas are
  // never actually flat.
  let n = 0, p = 0;
  for (let y = 0; y < H; y++) {
    const row = (y >> 1) * hw;
    for (let x = 0; x < W; x++, n++, p += 4) {
      const k = row + (x >> 1);
      let r, gr, b;
      if (set[k]) {
        r = rgb[k * 3]; gr = rgb[k * 3 + 1]; b = rgb[k * 3 + 2];
      } else {
        const v = vig(x + 0.5, y + 0.5);
        r = VOID[0] * v; gr = VOID[1] * v; b = VOID[2] * v;
      }
      const grain = (hash(n ^ 0x85ebca6b) - 0.5) * 13;
      px[p]     = r + grain;
      px[p + 1] = gr + grain;
      px[p + 2] = b + grain;
      px[p + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

/* ── The stars ───────────────────────────────────────────────────────── */

function makeStars(W, H, g) {
  const { s, R, thetaMin, thetaMax, maxD } = g;

  // A little wider than the visible sector, so a star that wraps from one end
  // of the sector to the other does it off screen where nobody sees it pop.
  const t0 = thetaMin - 0.08;
  const span = (thetaMax - thetaMin) + 0.16;

  const count = Math.round(Math.min(4200, Math.max(800, (W * H) / 430)));
  const r0 = R, r1 = maxD;
  const wash = 120 * s;   // the glow drowns anything closer to the limb than this
  const stars = [];

  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(r0 * r0 + (r1 * r1 - r0 * r0) * hash(i * 4 + 1));
    const mag = 0.22 + 0.78 * Math.pow(hash(i * 4 + 2), 2.4);
    stars.push({
      a: hash(i * 4 + 3) * span,
      r,
      // Magnitude and the wash near the limb fold together, since neither moves.
      m: mag * Math.min(1, (r - R) / wash),
      big: mag > 0.86,
      ph: hash(i * 4 + 5) * Math.PI * 2,
      tw: 0.7 + hash(i * 9 + 7) * 1.9,
    });
  }

  return { stars, t0, span };
}

/** A meteor now and then. Rare enough to be a surprise rather than a feature. */
function spawnMeteor(W, H, now) {
  const dir = Math.PI * (0.12 + Math.random() * 0.16);   // shallow, heading down-right
  const life = 700 + Math.random() * 500;
  return {
    x: W * (-0.1 + Math.random() * 0.7),
    y: H * Math.random() * 0.55,
    vx: Math.cos(dir) * (W * 0.0011),
    vy: Math.sin(dir) * (W * 0.0011),
    born: now,
    life,
  };
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function SpaceField() {
  const hostRef = useRef(null);
  const skyRef  = useRef(null);
  const limbRef = useRef(null);
  const starRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const sky  = skyRef.current;
    const limb = limbRef.current;
    const star = starRef.current;
    if (!host || !sky || !limb || !star) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ctx = star.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let resizeRaf = 0;
    let dead = false;
    let W = 0, H = 0;
    let g = null;
    let field = null;
    let meteor = null;
    let nextMeteor = 0;

    // CSS size of the sliding layer, and the backing-store size we draw at.
    const size = () => {
      const rect = host.getBoundingClientRect();
      const vw = Math.max(320, rect.width);
      const vh = Math.max(320, rect.height);
      const sink = vh * HEADROOM;
      const skyH = vh + sink;
      const scale = Math.min(0.9, Math.max(0.4, Math.sqrt(PIXEL_BUDGET / (vw * skyH))));
      return {
        vh, sink, skyH,
        w: Math.round(vw * scale),
        h: Math.round(skyH * scale),
        // Where the crest lands once the layer is parked at its top position:
        // the same 90% down the viewport it would have had without the slide.
        crest: Math.round((sink + vh * 0.90) * scale),
      };
    };

    let maxSink = 0;

    const build = () => {
      const d = size();
      W = d.w; H = d.h;
      maxSink = d.sink;
      sky.style.top = `${-d.sink}px`;
      sky.style.height = `${d.skyH}px`;
      g = geometry(W, H, d.crest);
      field = makeStars(W, H, g);
      star.width = W;
      star.height = H;
      paintLimb(limb, W, H, g);
    };

    // The planet sets as the page scrolls. A transform on the layer, so it is a
    // composite and never touches the canvases.
    let sunkTo = -1;
    const settle = () => {
      const y = motion.matches ? 0 : Math.min(maxSink, window.scrollY * SINK);
      if (y === sunkTo) return;
      sunkTo = y;
      sky.style.transform = `translate3d(0, ${y}px, 0)`;
    };

    const drawStars = (t) => {
      ctx.clearRect(0, 0, W, H);
      const { stars, t0, span } = field;
      const { cx, cy } = g;
      const rot = t * SPIN;
      const beat = t * 0.0016;

      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        let a = st.a + rot;
        a -= Math.floor(a / span) * span;
        a += t0;

        const x = cx + st.r * Math.cos(a);
        if (x < -2 || x > W + 2) continue;
        const y = cy + st.r * Math.sin(a);
        if (y < -2 || y > H + 2) continue;

        const alpha = st.m * (0.68 + 0.32 * Math.sin(beat * st.tw + st.ph));
        if (alpha < 0.05) continue;

        ctx.fillStyle = SHADES[Math.min(19, (alpha * 20) | 0)];
        const sz = st.big ? 2 : 1;
        ctx.fillRect(x | 0, y | 0, sz, sz);
      }

      if (meteor) {
        const age = (t - meteor.born) / meteor.life;
        if (age >= 1) {
          meteor = null;
        } else {
          const hx = meteor.x + meteor.vx * (t - meteor.born);
          const hy = meteor.y + meteor.vy * (t - meteor.born);
          const sp = Math.hypot(meteor.vx, meteor.vy) || 1;
          const tail = 120 * g.s;
          const tx = hx - (meteor.vx / sp) * tail;
          const ty = hy - (meteor.vy / sp) * tail;
          const fade = Math.sin(age * Math.PI);
          const grad = ctx.createLinearGradient(tx, ty, hx, hy);
          grad.addColorStop(0, 'rgba(110,231,255,0)');
          grad.addColorStop(1, `rgba(224,246,255,${(fade * 0.85).toFixed(3)})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(hx, hy);
          ctx.stroke();
        }
      } else if (t > nextMeteor) {
        meteor = spawnMeteor(W, H, t);
        nextMeteor = t + 9000 + Math.random() * 14000;
      }
    };

    let start = performance.now();
    let clock = 0;

    const frame = (now) => {
      if (dead) return;
      clock = now - start;
      drawStars(clock);
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    };

    const run = () => {
      if (dead || raf || motion.matches || document.hidden) return;
      start = performance.now() - clock;
      raf = requestAnimationFrame(frame);
    };

    const restart = () => {
      stop();
      sunkTo = -1;
      settle();
      if (motion.matches) drawStars(clock);
      else run();
    };

    build();
    settle();
    drawStars(0);
    run();

    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; settle(); });
    };

    // Mobile browsers resize the viewport constantly as the URL bar hides, and
    // repainting the limb for that is both pointless and expensive. Only a real
    // change in shape earns a rebuild.
    let lastW = W, lastH = H;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        const { w, h } = size();
        if (w === lastW && Math.abs(h - lastH) < 140) return;
        lastW = w; lastH = h;
        build();
        sunkTo = -1;
        settle();
        drawStars(clock);
      });
    };

    const onVisibility = () => { if (document.hidden) stop(); else run(); };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    motion.addEventListener('change', restart);

    return () => {
      dead = true;
      stop();
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      motion.removeEventListener('change', restart);
    };
  }, []);

  const layer = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    imageRendering: 'pixelated',
  };

  return (
    <div ref={hostRef} className="spacefield" aria-hidden="true">
      <div ref={skyRef} className="spacefield-sky">
        <canvas ref={limbRef} style={layer} />
        <canvas ref={starRef} style={layer} />
      </div>
      <span className="spacefield-scan" />
    </div>
  );
}

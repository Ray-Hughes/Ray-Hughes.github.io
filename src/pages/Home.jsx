import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────────────── */

const EXPERIENCE = [
  {
    company: 'Take2 Consulting, LLC',
    sub: 'U.S. Dept. of Veterans Affairs · Booz Allen Hamilton Partnership',
    role: 'Solutions Architect / AI Engineer Lead',
    period: 'Mar 2023 – Present',
    current: true,
    bullets: [
      'Architect on the VA Appeals program — Caseflow, eFolder Express, Kafka appeals-consumer',
      'Designed autonomous AI agents for test generation, documentation synthesis and PR review',
      'Built the Appeals Agent Toolkit, a shared Copilot config layer standardising AI use across the team',
      'Architected multi-product MCP integration so AI assistants operate with cross-system context',
      'Pioneered anchor comment patterns and led a spec-driven development rollout from day one',
    ],
  },
  {
    company: 'Carepaths Inc.',
    sub: null,
    role: 'Senior Software Engineer',
    period: 'May 2016 – Mar 2023',
    current: false,
    bullets: [
      'Built and scaled a HIPAA-compliant behavioral health EHR serving thousands of clinicians',
      'Delivered full FHIR and HL7 integration with QRDA and CDA import and export',
      'Developed a cross-platform outcomes-tracking mobile app and an in-app fax service',
      'Mentored engineers through coaching, code review and technical guidance',
    ],
  },
  {
    company: 'A1 Roof Trusses',
    sub: null,
    role: 'Software Engineer I',
    period: 'Nov 2014 – Nov 2015',
    current: false,
    bullets: [
      'Developed and maintained proprietary truss design software used in manufacturing',
      'Managed connected device network infrastructure across the organisation',
    ],
  },
  {
    company: 'Cypress Communications Inc.',
    sub: null,
    role: 'Systems Engineer',
    period: 'Oct 2006 – May 2013',
    current: false,
    bullets: [
      'Installed and maintained commercial VoIP and cable systems for enterprise clients',
      'Managed customer relationships and resolved technical escalations',
    ],
  },
];

const SKILLS = [
  { cat: 'AI & Agents',    color: '#6ee7ff', items: ['LLM Integration', 'Agentic Pipelines', 'MCP', 'Claude Code', 'GitHub Copilot', 'RAG', 'Knowledge Graphs', 'Prompt Engineering', 'Spec-Driven Development'] },
  { cat: 'Backend',        color: '#a78bfa', items: ['Ruby on Rails', 'Apache Kafka', 'SQS / Shoryuken', 'Event-Driven Architecture', 'REST APIs', 'PostgreSQL', 'SQLite'] },
  { cat: 'Frontend',       color: '#4ade80', items: ['JavaScript', 'React', 'Electron', 'HTML / CSS'] },
  { cat: 'Cloud & DevOps', color: '#fb923c', items: ['AWS (EC2, S3)', 'Docker', 'GitHub Actions', 'Dynatrace', 'New Relic', 'OpenTelemetry'] },
  { cat: 'Healthcare',     color: '#4d9fff', items: ['HIPAA', 'HL7', 'FHIR', 'QRDA / CDA', 'VBMS Architecture'] },
  { cat: 'Leadership',     color: '#f472b6', items: ['Technical Architecture', 'Team Mentorship', 'Agile / Scrum', 'Stakeholder Alignment'] },
];

// Delphi is the one anyone can run, so it is presented as a product rather than
// as a card: the screenshot, what it does, and a button that downloads it.
const FEATURED = {
  slug: 'delphi',
  name: 'Delphi',
  tagline: 'A project tracker your AI agents keep current themselves',
  color: '#4fd8e0',
  repo: 'https://github.com/Ray-Hughes/delphi',
  site: 'https://ray-hughes.github.io/delphi/',
  shot: '/shots/delphi-overview.png',
  icon: '/shots/delphi-icon.png',
  blurb:
    'Projects hold tasks, memory notes and links, with a deterministic knowledge graph underneath. Claude Code and GitHub Copilot read and write the same store over MCP, so what one agent works out survives into the next session.',
  points: [
    ['43 MCP tools', 'Agents read and write the tracker directly, and every change is attributed to them'],
    ['One write path', 'The app, the command line and every agent go through one store, so History shows which agent did what'],
    ['Rules that cannot lose work', 'A Workbench refuses to finish while anything is unpushed, and Discard keeps a copy for thirty days first'],
    ['Reviewed adversarially', 'Bugs were reproduced before they were fixed, including a packaged server that had not started since 1.3.0'],
    ['Zero runtime dependencies', 'The MCP server speaks JSON-RPC 2.0 with no SDK to break on an npm bump'],
    ['Everything reversible', 'Each write stores the row as it was, so undo replays state rather than guessing'],
    ['Local by default', 'One SQLite file, embeddings through Ollama, nothing leaves the machine'],
  ],
  tags: ['MCP', 'Electron', 'SQLite', 'Knowledge Graph', 'Ollama', 'Local-First'],
};

const PROJECTS = [
  {
    slug: 'patientevity',
    org: 'Patientevity',
    label: 'github.com/Patientevity',
    tagline: 'Healthcare & AI Tooling Platform',
    color: '#4d9fff',
    description:
      'A multi-product organisation spanning HIPAA-compliant behavioral health EHR infrastructure, an AI-native spec-driven PM platform, an AI desktop companion, a context engine, and a TUI for AI workflows.',
    repos: [
      ['epicevity', 'AI-native spec-driven PM with Claude API'],
      ['ava-plus', 'AI desktop companion with local file access'],
      ['gacs_pack', 'Token-budgeted graph context engine'],
      ['terminevity', 'TUI for AI workflows'],
      ['phlexor', 'Service management platform'],
    ],
    tags: ['Rails 8', 'Claude API', 'HIPAA', 'FHIR', 'Kafka', 'Electron'],
  },
  {
    slug: 'memophor',
    org: 'Memophor',
    label: 'github.com/memophor',
    tagline: 'Federated AI Memory Architecture',
    color: '#a855f7',
    description:
      'A distributed AI memory architecture. Knowlemesh is the multi-tenant control plane orchestrating policy, lifecycle automation and governance across SynaGraph graph memory and Scedge edge cache clusters.',
    repos: [
      ['knowlemesh', 'Control plane for the federated mesh'],
      ['synagraph', 'Graph-based semantic memory layer'],
      ['scedge-core', 'Cache and edge routing for AI context'],
      ['memophor', 'Core memory orchestration engine'],
    ],
    tags: ['AI Memory', 'RAG', 'Knowledge Graph', 'Rails', 'Multi-tenant', 'Apache 2.0'],
  },
];

/* ─────────────────────────────────────────────────────────────────────
   CareerGraph

   The hero visual, and also a control. Nodes are the things this career is
   actually made of, edges are where they touch. It reacts to the pointer and
   the project nodes navigate, so the decoration is doing a job rather than
   sitting behind the text looking technical.
───────────────────────────────────────────────────────────────────── */

const NODES = [
  { id: 'agents',   label: 'AI Agents',        r: 7,   hero: true },
  { id: 'mcp',      label: 'MCP',              r: 6.5, hero: true },
  { id: 'graphs',   label: 'Knowledge Graphs', r: 6,   hero: true },
  { id: 'llm',      label: 'LLM Integration',  r: 5.5 },
  { id: 'rails',    label: 'Rails',            r: 5.5 },
  { id: 'kafka',    label: 'Kafka',            r: 5 },
  { id: 'electron', label: 'Electron',         r: 4.5 },
  { id: 'sqlite',   label: 'SQLite',           r: 4.5 },
  { id: 'embed',    label: 'Embeddings',       r: 4.5 },
  { id: 'hipaa',    label: 'HIPAA / FHIR',     r: 4.5 },
  { id: 'aws',      label: 'AWS',              r: 4 },
  { id: 'delphi',   label: 'Delphi',           r: 8,   project: 'work', colour: '#4fd8e0' },
  { id: 'patient',  label: 'Patientevity',     r: 7,   project: 'work', colour: '#4d9fff' },
  { id: 'memo',     label: 'Memophor',         r: 7,   project: 'work', colour: '#a855f7' },
];

const EDGES = [
  ['agents', 'mcp'], ['agents', 'llm'], ['agents', 'delphi'], ['mcp', 'delphi'],
  ['graphs', 'delphi'], ['graphs', 'memo'], ['embed', 'delphi'], ['embed', 'graphs'],
  ['sqlite', 'delphi'], ['electron', 'delphi'], ['rails', 'patient'], ['rails', 'memo'],
  ['hipaa', 'patient'], ['kafka', 'patient'], ['llm', 'patient'], ['aws', 'patient'],
  ['mcp', 'memo'], ['agents', 'memo'], ['llm', 'mcp'], ['kafka', 'aws'], ['graphs', 'llm'],
];

function CareerGraph({ onPick }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ nodes: [], pointer: { x: -999, y: -999 }, hover: null });
  const [cursor, setCursor] = useState('default');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let W = 0, H = 0;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Seeded placement rather than random, so the composition is the same on
      // every load and can be judged as a design instead of a lottery.
      stateRef.current.nodes = NODES.map((n, i) => {
        const golden = i * 2.399963;
        const spread = 0.34 + 0.62 * Math.sqrt((i + 0.6) / NODES.length);
        return {
          ...n,
          x:  W / 2 + Math.cos(golden) * spread * W * 0.42,
          y:  H / 2 + Math.sin(golden) * spread * H * 0.42,
          vx: 0, vy: 0,
          seed: i * 1.7,
        };
      });
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);

    const byId = () => Object.fromEntries(stateRef.current.nodes.map((n) => [n.id, n]));

    let t = 0;
    const draw = () => {
      const { nodes, pointer } = stateRef.current;
      const map = byId();
      t += 0.006;
      ctx.clearRect(0, 0, W, H);

      // Exactly one project node may be magnetic at a time, and it is the nearest.
      // Attracting all three meant two of them trailed the pointer at once and
      // the graph looked like it was falling apart.
      let magnet = null;
      if (pointer.x > -500) {
        for (const n of nodes) {
          if (!n.project) continue;
          const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
          if (d < 190 && (!magnet || d < magnet.d)) magnet = { node: n, d };
        }
      }

      // Drift, then push away from the pointer. The push is what makes it feel
      // like a thing rather than a video.
      let hover = null;
      for (const n of nodes) {
        n.x += Math.cos(t + n.seed) * 0.16;
        n.y += Math.sin(t * 0.9 + n.seed) * 0.16;

        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d  = Math.hypot(dx, dy);

        // The scatter is the fun part, but applied to everything it made the
        // project nodes impossible to click: they fled the cursor faster than it
        // could arrive. So the nearest one is magnetic instead, and the others
        // stay where they are.
        if (n.project) {
          if (magnet && magnet.node === n && d > 3) {
            const pull = (1 - d / 190) ** 2 * 0.55;
            n.vx -= (dx / d) * pull;
            n.vy -= (dy / d) * pull;
            // Braked hard once it arrives, so it parks under the pointer rather
            // than orbiting it.
            if (d < 34) { n.vx *= 0.55; n.vy *= 0.55; }
          }
        } else if (d < 150) {
          const force = (1 - d / 150) ** 2 * 1.6;
          n.vx += (dx / (d || 1)) * force;
          n.vy += (dy / (d || 1)) * force;
        }

        // A generous hit area on the clickable ones, because a 8px circle is a
        // target you have to aim at rather than one you can just reach.
        const reach = n.project ? n.r + 30 : n.r + 22;
        if (d < reach && (!hover || d < hover.d)) hover = { node: n, d };

        n.vx *= 0.9; n.vy *= 0.9;
        n.x += n.vx; n.y += n.vy;

        const pad = 28;
        n.x = Math.max(pad, Math.min(W - pad, n.x));
        n.y = Math.max(pad, Math.min(H - pad, n.y));
      }
      stateRef.current.hover = hover ? hover.node : null;
      setCursor(hover && hover.node.project ? 'pointer' : 'default');

      const lit = (id) =>
        stateRef.current.hover &&
        (stateRef.current.hover.id === id ||
          EDGES.some(([a, b]) =>
            (a === id && b === stateRef.current.hover.id) || (b === id && a === stateRef.current.hover.id)));

      for (const [a, b] of EDGES) {
        const na = map[a], nb = map[b];
        if (!na || !nb) continue;
        const active = stateRef.current.hover && (a === stateRef.current.hover.id || b === stateRef.current.hover.id);
        ctx.strokeStyle = active ? 'rgba(110,231,255,0.55)' : 'rgba(150,170,220,0.13)';
        ctx.lineWidth   = active ? 1.4 : 0.7;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }

      for (const n of nodes) {
        const active = stateRef.current.hover === n;
        const near   = lit(n.id);
        const colour = n.colour || (n.hero ? '#6ee7ff' : '#8fa2c9');
        const pulse  = 1 + 0.12 * Math.sin(t * 2.4 + n.seed);

        if (n.project || n.hero || active) {
          ctx.shadowColor = colour;
          ctx.shadowBlur  = active ? 26 : 14;
        }
        ctx.fillStyle = active ? '#ffffff' : colour;
        ctx.globalAlpha = n.project ? 1 : near || active ? 1 : 0.72;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (active ? 1.35 : pulse), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        if (n.project) {
          ctx.strokeStyle = colour;
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 7 + 2 * Math.sin(t * 2 + n.seed), 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Labels where they earn their place. Holding a node names everything it
        // connects to, which is the point of a graph: hiding those was answering
        // "what is this connected to" with a picture of lines.
        if (n.project || active || near || (n.hero && !stateRef.current.hover)) {
          const strong = active || n.project || near;
          ctx.font = `${strong ? 600 : 500} ${n.project ? 13 : near ? 12 : 11.5}px Manrope, system-ui, sans-serif`;
          ctx.fillStyle = active ? '#ffffff'
            : near ? 'rgba(237,239,246,0.94)'
            : n.project ? '#edeff6'
            : 'rgba(237,239,246,0.62)';
          ctx.textAlign = 'center';

          // A dark plate behind a highlighted label, or it lands on top of an edge
          // and neither is readable.
          if (strong && (active || near)) {
            const w = ctx.measureText(n.label).width;
            ctx.fillStyle = 'rgba(7,7,14,0.72)';
            ctx.fillRect(n.x - w / 2 - 5, n.y - n.r - 22, w + 10, 16);
            ctx.fillStyle = active ? '#ffffff' : 'rgba(237,239,246,0.94)';
          }
          ctx.fillText(n.label, n.x, n.y - n.r - 11);
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    const move = (e) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const leave = () => { stateRef.current.pointer = { x: -999, y: -999 }; };
    const click = () => {
      const n = stateRef.current.hover;
      if (n && n.project) onPick(n.project);
    };

    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', leave);
    canvas.addEventListener('click', click);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('click', click);
    };
  }, [onPick]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ width: '100%', height: '100%', display: 'block', cursor, touchAction: 'none' }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Hooks
───────────────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Moves the spotlight in .spot cards to wherever the pointer is. */
function spotlight(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

/** The current release, so the download button can say what it is giving you. */
function useRelease() {
  const [release, setRelease] = useState(null);
  useEffect(() => {
    let live = true;
    fetch('https://api.github.com/repos/Ray-Hughes/delphi/releases/latest')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no release'))))
      .then((data) => { if (live) setRelease(data); })
      .catch(() => {});
    return () => { live = false; };
  }, []);
  return release;
}

const isWindows = () => typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent);

/* ─────────────────────────────────────────────────────────────────────
   Chrome
───────────────────────────────────────────────────────────────────── */

const NAV = [['Work', 'work'], ['About', 'about'], ['Experience', 'experience'], ['Skills', 'skills'], ['Contact', 'contact']];

function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen]   = useState(false);

  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: solid || open ? 'rgba(7,7,14,0.82)' : 'transparent',
      backdropFilter: solid || open ? 'saturate(180%) blur(16px)' : 'none',
      WebkitBackdropFilter: solid || open ? 'saturate(180%) blur(16px)' : 'none',
      borderBottom: `1px solid ${solid || open ? 'var(--line)' : 'transparent'}`,
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div className="wrap" style={{ height: 68, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="display"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.15rem', padding: 0 }}
        >
          Raymond<span className="gradient-text"> Hughes</span>
        </button>

        <div style={{ flex: 1 }} />

        <nav className="nav-desktop">
          {NAV.map(([label, id]) => (
            <button key={id} onClick={() => go(id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.5rem 0.85rem', borderRadius: 9,
              fontSize: '0.92rem', fontWeight: 600, color: 'var(--fg-2)',
              transition: 'color 0.2s, background 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-2)'; e.currentTarget.style.background = 'none'; }}
            >{label}</button>
          ))}
          <Link to="/fde" style={{
            padding: '0.5rem 0.85rem', borderRadius: 9,
            fontSize: '0.92rem', fontWeight: 700, color: 'var(--cy)',
            transition: 'background 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(110,231,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >FDE</Link>
          <a className="btn btn-ghost" href="/resume.pdf" download style={{ marginLeft: '0.5rem', padding: '0.6rem 1.1rem', fontSize: '0.88rem' }}>
            Resume
          </a>
        </nav>

        <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} style={{
          background: 'none', border: '1px solid var(--line-hi)', borderRadius: 10,
          width: 40, height: 40, cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ display: 'grid', gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ display: 'block', width: 16, height: 1.5, background: 'var(--fg)', borderRadius: 2 }} />
            ))}
          </span>
        </button>
      </div>

      {open && (
        <div className="wrap" style={{ paddingBottom: '1rem', display: 'grid', gap: '0.2rem' }}>
          {NAV.map(([label, id]) => (
            <button key={id} onClick={() => go(id)} style={{
              background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
              padding: '0.7rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--fg)',
              borderBottom: '1px solid var(--line-soft)',
            }}>{label}</button>
          ))}
          <a className="btn btn-primary" href="/resume.pdf" download style={{ marginTop: '0.7rem' }}>Download resume</a>
        </div>
      )}
    </header>
  );
}

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="reveal" style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
      <div className="eyebrow" style={{ marginBottom: '0.7rem' }}>{eyebrow}</div>
      <h2 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.25rem)' }}>{title}</h2>
      {sub && <p className="lede" style={{ marginTop: '0.85rem', maxWidth: '58ch' }}>{sub}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Hero
───────────────────────────────────────────────────────────────────── */

function Hero() {
  const jump = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section style={{ position: 'relative', minHeight: '100svh', display: 'flex', alignItems: 'center', paddingTop: 68 }}>
      <div className="wrap" style={{ width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.92fr)',
          gap: 'clamp(1.5rem, 4vw, 3.5rem)',
          alignItems: 'center',
        }} className="hero-grid">
          <div>
            {/* The first thing anyone reads says what I am looking for, and it is
                a door rather than a status line. */}
            <Link to="/fde" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
              padding: '0.4rem 0.9rem 0.4rem 0.8rem', borderRadius: 99,
              border: '1px solid var(--line-hi)', background: 'rgba(255,255,255,0.03)',
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--fg-2)',
              marginBottom: '1.6rem', animation: 'floatIn 0.6s ease both',
              transition: 'color 0.2s, border-color 0.2s, background 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'var(--cy)'; e.currentTarget.style.background = 'rgba(110,231,255,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-2)'; e.currentTarget.style.borderColor = 'var(--line-hi)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            >
              <span className="dot-live" style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--cy)' }} />
              Looking for Forward Deployed Engineer roles
              <span style={{ color: 'var(--cy)' }}>→</span>
            </Link>

            <h1 className="display" style={{ fontSize: 'clamp(2.2rem, 4.8vw, 3.35rem)', animation: 'floatIn 0.7s 0.05s ease both' }}>
              I build systems<br />that <span className="gradient-text">think with you</span>
            </h1>

            <p className="lede" style={{ margin: '1.5rem 0 0', maxWidth: '52ch', animation: 'floatIn 0.7s 0.15s ease both' }}>
              AI Engineer and Solutions Architect. A decade of Ruby on Rails, and the last three years
              spent building agentic systems that actually ship: MCP integrations, knowledge graphs,
              and tools my own team uses every day.
            </p>

            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '2.2rem', animation: 'floatIn 0.7s 0.25s ease both' }}>
              <button className="btn btn-primary" onClick={() => jump('work')}>See what I have built</button>
              <a className="btn btn-ghost" href="/resume.pdf" download>Download resume</a>
            </div>

            <div style={{ display: 'flex', gap: '2.2rem', flexWrap: 'wrap', marginTop: '3rem', animation: 'floatIn 0.7s 0.35s ease both' }}>
              {[['10+', 'Years shipping Rails'], ['3+', 'Years AI engineering'], ['1', 'App you can download']].map(([v, l]) => (
                <div key={l}>
                  <div className="display gradient-text" style={{ fontSize: '1.9rem' }}>{v}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--fg-3)', fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* The graph. Interactive, and the project nodes navigate. */}
          <div className="hero-graph" style={{ position: 'relative', height: 'min(60vh, 520px)' }}>
            <CareerGraph onPick={jump} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center',
              fontSize: '0.76rem', color: 'var(--fg-3)', pointerEvents: 'none',
            }}>
              Move your cursor through it. The three ringed nodes are projects, and they open.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Featured project
───────────────────────────────────────────────────────────────────── */

function Featured() {
  const release = useRelease();
  const win = isWindows();
  const file = win ? 'Delphi-Setup.exe' : 'Delphi-mac-arm64.dmg';
  const href = `https://github.com/Ray-Hughes/delphi/releases/latest/download/${file}`;

  return (
    <div className="reveal panel spot" onMouseMove={spotlight}
      style={{ '--tint': FEATURED.color, padding: 'clamp(1.5rem, 4vw, 2.75rem)', marginBottom: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)', gap: 'clamp(1.5rem, 4vw, 3rem)', alignItems: 'center' }} className="feature-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.1rem' }}>
            <img src={FEATURED.icon} alt="" width={52} height={52} style={{ borderRadius: 13 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.9rem' }}>{FEATURED.name}</h3>
                <span className="chip" style={{ borderColor: `${FEATURED.color}66`, color: FEATURED.color, background: `${FEATURED.color}14` }}>
                  {release ? release.tag_name : 'Shipped'}
                </span>
              </div>
              <div style={{ color: FEATURED.color, fontWeight: 600, fontSize: '0.95rem' }}>{FEATURED.tagline}</div>
            </div>
          </div>

          <p style={{ color: 'var(--fg-2)', marginBottom: '1.5rem' }}>{FEATURED.blurb}</p>

          <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.8rem' }}>
            {FEATURED.points.map(([head, detail]) => (
              <div key={head} style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: FEATURED.color, flexShrink: 0, marginTop: '0.45em', width: 6, height: 6, borderRadius: 99, background: FEATURED.color }} />
                <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                  <strong style={{ fontWeight: 700 }}>{head}</strong>
                  <span style={{ color: 'var(--fg-3)' }}> — {detail}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href={href}>
              Download for {win ? 'Windows' : 'Mac'}
            </a>
            <Link className="btn btn-ghost" to={`/projects/${FEATURED.slug}`}>How I built it</Link>
            <a className="btn btn-ghost" href={FEATURED.repo} target="_blank" rel="noopener noreferrer">Source</a>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--fg-3)', marginTop: '0.9rem' }}>
            Free and open source, macOS and Windows.{' '}
            <a href={FEATURED.site} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fg-2)', textDecoration: 'underline' }}>
              Docs and install guide
            </a>
          </div>
        </div>

        <div style={{
          border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden',
          background: 'var(--ink-0)', boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', gap: 6, padding: '0.65rem 0.9rem', borderBottom: '1px solid var(--line-soft)' }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
              <span key={c} style={{ width: 10, height: 10, borderRadius: 99, background: c, opacity: 0.75 }} />
            ))}
          </div>
          <img src={FEATURED.shot} alt="Delphi showing a project with its tasks, linked repositories and memory notes" />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ p }) {
  return (
    <Link to={`/projects/${p.slug}`} className="reveal panel spot" onMouseMove={spotlight}
      style={{ '--tint': p.color, display: 'block', padding: 'clamp(1.4rem, 3vw, 2rem)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.74rem', color: 'var(--fg-3)', fontWeight: 600, marginBottom: '0.35rem' }}>{p.label}</div>
          <h3 style={{ fontSize: '1.45rem' }}>{p.org}</h3>
          <div style={{ color: p.color, fontWeight: 600, fontSize: '0.92rem', marginTop: '0.2rem' }}>{p.tagline}</div>
        </div>
        <span style={{
          width: 42, height: 42, flexShrink: 0, borderRadius: 12,
          display: 'grid', placeItems: 'center',
          border: `1px solid ${p.color}44`, background: `${p.color}12`,
          color: p.color, fontFamily: 'var(--font-display)', fontWeight: 800,
        }}>{p.org[0]}</span>
      </div>

      <p style={{ color: 'var(--fg-2)', fontSize: '0.92rem', marginBottom: '1.2rem' }}>{p.description}</p>

      <div style={{ display: 'grid', gap: '0.35rem', marginBottom: '1.2rem' }}>
        {p.repos.map(([name, desc]) => (
          <div key={name} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: p.color, flexShrink: 0 }}>{name}</span>
            <span style={{ color: 'var(--fg-3)' }}>{desc}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
        {p.tags.map((t) => <span key={t} className="chip">{t}</span>)}
      </div>

      <div style={{ color: p.color, fontWeight: 700, fontSize: '0.88rem' }}>Read the breakdown →</div>
    </Link>
  );
}

function Work() {
  return (
    <section id="work" className="section">
      <div className="wrap">
        <SectionHead
          eyebrow="Work"
          title="Things I built, and how"
          sub="Each one has a full breakdown: the problem, the decisions, and the real code that came out of them. One of them you can install right now."
        />
        <Featured />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '1.5rem' }}>
          {PROJECTS.map((p) => <ProjectCard key={p.slug} p={p} />)}
        </div>
        <FdeBand />
      </div>
    </section>
  );
}

/** The through line between the work above and the job I am after. */
function FdeBand() {
  return (
    <Link to="/fde" className="reveal panel spot" onMouseMove={spotlight}
      style={{ display: 'block', marginTop: '1.5rem', padding: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '1.5rem', alignItems: 'center' }} className="feature-grid">
        <div>
          <div className="eyebrow" style={{ color: 'var(--cy)', marginBottom: '0.6rem' }}>What I am looking for next</div>
          <h3 style={{ fontSize: 'clamp(1.3rem, 2.8vw, 1.75rem)', marginBottom: '0.7rem' }}>
            Forward Deployed Engineer
          </h3>
          <p style={{ color: 'var(--fg-2)', maxWidth: '62ch', marginBottom: '1rem' }}>
            Three years embedded in a customer’s estate through Take2 and Booz Allen Hamilton,
            two regulated domains learned properly, and tooling left behind that their own
            engineers use. That is the job, under a different title.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {['Embedded delivery', 'Domain immersion', 'Ambiguous problems', 'Ships and finishes'].map((c) => (
              <span key={c} className="chip">{c}</span>
            ))}
          </div>
        </div>
        <span className="btn btn-primary" style={{ pointerEvents: 'none' }}>Read the case →</span>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   About / Experience / Skills / Contact
───────────────────────────────────────────────────────────────────── */

function About() {
  return (
    <section id="about" className="section">
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'clamp(2rem, 5vw, 4rem)', alignItems: 'start' }}>
          <div>
            <SectionHead eyebrow="About" title="A decade of Rails, three years of AI" />
            <p className="reveal" style={{ color: 'var(--fg-2)', marginBottom: '1.1rem' }}>
              I am an AI Engineer and Solutions Architect with over a decade of Ruby on Rails behind me and deep
              hands-on work in production agentic systems, LLM integration and event-driven architecture.
            </p>
            <p className="reveal" style={{ color: 'var(--fg-2)' }}>
              Currently Architect on the VA Appeals modernisation programme alongside Booz Allen Hamilton, owning
              technical direction across several platforms and leading a team-wide AI tooling transformation.
              Equally happy designing a system from nothing, aligning stakeholders on a roadmap, or mentoring the
              engineer next to me. Seven years of that decade were spent in behavioral health EHR systems, which
              is where the healthcare depth comes from.
            </p>
          </div>

          <div className="reveal" style={{ display: 'grid', gap: '0.85rem' }}>
            {[
              ['Port St. Lucie, FL', 'Remote friendly'],
              ['B.S. Software Engineering', 'Keiser University · 3.85 GPA · High Honors'],
              ['raymond.hughes@live.com', 'Best way to reach me'],
            ].map(([head, sub]) => (
              <div key={head} className="panel" style={{ padding: '1.1rem 1.3rem' }}>
                <div style={{ fontWeight: 700 }}>{head}</div>
                <div style={{ color: 'var(--fg-3)', fontSize: '0.88rem' }}>{sub}</div>
              </div>
            ))}
            <div className="panel" style={{ padding: '1.1rem 1.3rem', display: 'flex', gap: '1.4rem', flexWrap: 'wrap' }}>
              {[['LinkedIn', 'https://www.linkedin.com/in/raymond-h-13838369/'], ['GitHub', 'https://github.com/Ray-Hughes']].map(([l, h]) => (
                <a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: 'var(--cy)' }}>{l} ↗</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section id="experience" className="section">
      <div className="wrap">
        <SectionHead eyebrow="Experience" title="Where I have done it" />
        <div style={{ display: 'grid', gap: '1rem' }}>
          {EXPERIENCE.map((job) => (
            <div key={job.company} className="reveal panel spot" onMouseMove={spotlight} style={{ padding: 'clamp(1.3rem, 3vw, 1.9rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>{job.company}</h3>
                    {job.current && (
                      <span className="chip" style={{ borderColor: 'rgba(110,231,255,0.45)', color: 'var(--cy)', background: 'rgba(110,231,255,0.1)' }}>
                        <span className="dot-live" style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--cy)' }} />
                        Current
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--cy)', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.15rem' }}>{job.role}</div>
                  {job.sub && <div style={{ color: 'var(--fg-3)', fontSize: '0.85rem' }}>{job.sub}</div>}
                </div>
                <div style={{ color: 'var(--fg-3)', fontSize: '0.86rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{job.period}</div>
              </div>
              <ul style={{ listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
                {job.bullets.map((b) => (
                  <li key={b} style={{ display: 'flex', gap: '0.7rem', color: 'var(--fg-2)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                    <span style={{ color: 'var(--vi)', flexShrink: 0 }}>▸</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="section">
      <div className="wrap">
        <SectionHead eyebrow="Skills" title="What I reach for" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
          {SKILLS.map(({ cat, color, items }) => (
            <div key={cat} className="reveal panel spot" onMouseMove={spotlight} style={{ '--tint': color, padding: '1.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: color, boxShadow: `0 0 12px ${color}` }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>{cat}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {items.map((i) => (
                  <span key={i} className="chip" style={{ borderColor: `${color}33`, color: `${color}dd`, background: `${color}0d` }}>{i}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section">
      <div className="wrap">
        <div className="reveal panel" style={{
          padding: 'clamp(2rem, 6vw, 4rem)', textAlign: 'center',
          background: 'radial-gradient(70rem 30rem at 50% 0%, rgba(110,231,255,0.09), transparent 60%), linear-gradient(180deg, var(--ink-2), var(--ink-1))',
        }}>
          <h2 style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)' }}>
            Let us build something <span className="gradient-text">that thinks</span>
          </h2>
          <p className="lede" style={{ margin: '1rem auto 2rem', maxWidth: '46ch' }}>
            Open to AI engineering and architecture work. The fastest way to reach me is email.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href="mailto:raymond.hughes@live.com">raymond.hughes@live.com</a>
            <a className="btn btn-ghost" href="/resume.pdf" download>Download resume</a>
          </div>
          <div style={{ display: 'flex', gap: '1.6rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.2rem', color: 'var(--fg-3)', fontSize: '0.9rem' }}>
            <a href="https://www.linkedin.com/in/raymond-h-13838369/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://github.com/Ray-Hughes" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="tel:7726661600">772-666-1600</a>
            <span>Port St. Lucie, FL</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)' }}>
      <div className="wrap" style={{ padding: '1.8rem 0', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', color: 'var(--fg-3)', fontSize: '0.85rem' }}>
        <span>Raymond Hughes · {new Date().getFullYear()}</span>
        <span>Built with React and Vite. The graph is a canvas, not a library.</span>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────── */

export default function Home() {
  useReveal();

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

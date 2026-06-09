import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────────────── */

const ROLES = ['AI Engineer', 'Solutions Architect', 'Ruby on Rails Tech Lead'];

const EXPERIENCE = [
  {
    company: 'Take2 Consulting, LLC',
    sub: 'U.S. Dept. of Veterans Affairs · Booz Allen Hamilton Partnership',
    role: 'Solutions Architect / AI Engineer Lead',
    period: 'Mar 2023 – Present',
    current: true,
    bullets: [
      'Architect on VA Appeals program — Caseflow, eFolder Express, Kafka appeals-consumer',
      'Designed autonomous AI agents for test generation, documentation synthesis, and PR review',
      'Built Appeals Agent Toolkit — shared GitHub Copilot config layer for team-wide AI standardization',
      'Architected multi-product MCP integration enabling AI assistants to operate with cross-system context',
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
      'Built and scaled a HIPAA-compliant behavioral health EHR platform serving thousands of clinicians',
      'Delivered full FHIR/HL7 integration with QRDA and CDA import/export capabilities',
      'Developed a cross-platform outcomes-tracking mobile app and in-app fax service',
      'Mentored engineers through coaching, code review, and technical guidance',
    ],
  },
  {
    company: 'A1 Roof Trusses',
    sub: null,
    role: 'Software Engineer I',
    period: 'Nov 2014 – Nov 2015',
    current: false,
    bullets: [
      'Developed and maintained proprietary truss design software used in manufacturing operations',
      'Managed connected device network infrastructure across the organization',
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
      'Managed customer relationships and resolved technical escalations to ensure service quality',
    ],
  },
];

const SKILLS = [
  {
    cat: 'AI & Agents', color: '#00d4ff',
    items: ['LLM Integration', 'Agentic Pipelines', 'MCP', 'GitHub Copilot', 'Claude Code', 'RAG', 'Prompt Engineering', 'Spec-Driven Development'],
  },
  {
    cat: 'Backend', color: '#a855f7',
    items: ['Ruby on Rails', 'Apache Kafka', 'SQS / Shoryuken', 'Event-Driven Architecture', 'REST APIs'],
  },
  {
    cat: 'Frontend', color: '#00ff88',
    items: ['JavaScript', 'React', 'HTML / CSS'],
  },
  {
    cat: 'Cloud & DevOps', color: '#ff8c42',
    items: ['AWS (EC2, S3)', 'Docker', 'GitHub Actions', 'Dynatrace', 'New Relic', 'OpenTelemetry'],
  },
  {
    cat: 'Healthcare', color: '#4d9fff',
    items: ['HIPAA', 'HL7', 'FHIR', 'QRDA / CDA', 'VBMS Architecture'],
  },
  {
    cat: 'Leadership', color: '#f059da',
    items: ['Technical Architecture', 'Team Mentorship', 'Agile / Scrum', 'Stakeholder Alignment', 'Jira'],
  },
];

const PROJECTS = [
  {
    org: 'Patientevity',
    orgUrl: 'https://github.com/Patientevity',
    tagline: 'Healthcare & AI Tooling Platform',
    description:
      'A multi-product organization spanning HIPAA-compliant behavioral health EHR infrastructure, an AI-native spec-driven project management platform (Epicevity), an AI desktop companion (AVA+), a context engine (GACS Pack), and a TUI for AI workflows. Built on Rails 8, Kafka, and deep LLM integration.',
    repos: [
      { name: 'epicevity', desc: 'AI-native spec-driven PM with Claude API' },
      { name: 'ava-plus', desc: 'AI desktop companion with local file access' },
      { name: 'gacs_pack', desc: 'Token-budgeted graph context engine' },
      { name: 'terminevity', desc: 'TUI for AI workflows' },
      { name: 'phlexor', desc: 'Service management platform (Rails + React)' },
    ],
    tags: ['Ruby on Rails', 'Claude API', 'HIPAA', 'FHIR', 'Kafka', 'Electron', 'LLM'],
    color: '#4d9fff',
  },
  {
    org: 'Memophor',
    orgUrl: 'https://github.com/memophor',
    tagline: 'Federated AI Memory & Knowledge Mesh',
    description:
      'A distributed AI memory architecture — Knowlemesh serves as the multi-tenant control plane orchestrating policy, lifecycle automation, and governance across SynaGraph and Scedge clusters. Exposes an API-first surface for provisioning memory meshes and integrating observability workflows.',
    repos: [
      { name: 'knowlemesh', desc: 'Control plane for the federated knowledge mesh' },
      { name: 'synagraph', desc: 'Graph-based semantic memory layer' },
      { name: 'scedge-core', desc: 'Cache + edge routing for AI context' },
      { name: 'memophor', desc: 'Core memory orchestration engine' },
    ],
    tags: ['AI Memory', 'RAG', 'Knowledge Graph', 'Ruby on Rails', 'Multi-tenant', 'Apache'],
    color: '#a855f7',
  },
];

/* ─────────────────────────────────────────────────────────────────────
   Neural Canvas
───────────────────────────────────────────────────────────────────── */

function NeuralCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const setSize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);

    const N = 72;
    const nodes = Array.from({ length: N }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.38,
      vy:    (Math.random() - 0.5) * 0.38,
      r:     Math.random() * 1.4 + 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.phase += 0.014;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height)  n.vy *= -1;
      });

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < 148) {
            ctx.strokeStyle = `rgba(0,212,255,${(1 - d / 148) * 0.27})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const a = 0.32 + 0.58 * ((Math.sin(n.phase) + 1) / 2);
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur  = 7;
        ctx.fillStyle   = `rgba(0,212,255,${a})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 0.25 * Math.sin(n.phase), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   useTypewriter
───────────────────────────────────────────────────────────────────── */

function useTypewriter(texts) {
  const [text, setText]       = useState('');
  const [idx, setIdx]         = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused]   = useState(false);

  useEffect(() => {
    const full = texts[idx];
    if (paused) {
      const id = setTimeout(() => { setPaused(false); setDeleting(true); }, 2500);
      return () => clearTimeout(id);
    }
    if (deleting) {
      if (!text.length) { setDeleting(false); setIdx(i => (i + 1) % texts.length); return; }
      const id = setTimeout(() => setText(s => s.slice(0, -1)), 40);
      return () => clearTimeout(id);
    }
    if (text.length === full.length) { setPaused(true); return; }
    const id = setTimeout(() => setText(full.slice(0, text.length + 1)), 85);
    return () => clearTimeout(id);
  }, [text, idx, deleting, paused, texts]);

  return text;
}

/* ─────────────────────────────────────────────────────────────────────
   useReveal — intersection observer for scroll animations
───────────────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────────────────────────────
   Nav
───────────────────────────────────────────────────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const linkStyle = {
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
    color: 'var(--text2)', letterSpacing: '0.12em', textTransform: 'uppercase',
    transition: 'color 0.2s',
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(1rem, 5vw, 3.5rem)',
      background: scrolled ? 'rgba(2,12,27,0.94)' : 'transparent',
      backdropFilter: scrolled ? 'blur(18px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(18px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,212,255,0.1)' : '1px solid transparent',
      transition: 'background 0.35s, border-color 0.35s',
    }}>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1rem',
          color: '#00d4ff', letterSpacing: '0.1em', background: 'none',
          border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        RH<span style={{ color: 'rgba(0,212,255,0.35)' }}>.io</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1.2rem, 2.5vw, 2.2rem)' }}>
        {[['About','#about'],['Experience','#experience'],['Projects','#projects'],['Skills','#skills'],['Contact','#contact']].map(([label, href]) => (
          <a key={label} href={href} className="nav-link" style={linkStyle}
            onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}
          >
            {label}
          </a>
        ))}
        <a
          href="/resume.pdf" download
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '0.45rem 1.1rem',
            border: '1px solid rgba(0,212,255,0.45)', color: '#00d4ff',
            borderRadius: 3, transition: 'all 0.22s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; e.currentTarget.style.boxShadow = '0 0 22px rgba(0,212,255,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          Download CV
        </a>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   SectionHeader
───────────────────────────────────────────────────────────────────── */

function SectionHeader({ label, title }) {
  return (
    <div style={{ marginBottom: '3.5rem' }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(0,212,255,0.6)',
        letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.75rem',
      }}>
        <span style={{ opacity: 0.45 }}>~/</span>{label}
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
        fontWeight: 700, letterSpacing: '0.06em', color: '#fff',
        textShadow: '0 0 30px rgba(0,212,255,0.2)',
      }}>
        {title}
      </h2>
      <div style={{
        marginTop: '0.75rem', width: 48, height: 2,
        background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
        borderRadius: 99,
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Hero
───────────────────────────────────────────────────────────────────── */

function Hero() {
  const role = useTypewriter(ROLES);

  const btnPrimary = {
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.15em',
    textTransform: 'uppercase', padding: '0.9rem 2.2rem',
    background: '#00d4ff', color: '#020c1b', border: 'none',
    borderRadius: 4, cursor: 'pointer', fontWeight: 500, display: 'inline-block',
    boxShadow: '0 0 32px rgba(0,212,255,0.35)', transition: 'all 0.22s',
  };
  const btnSecondary = {
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.15em',
    textTransform: 'uppercase', padding: '0.9rem 2.2rem',
    background: 'transparent', color: '#00d4ff',
    border: '1px solid rgba(0,212,255,0.45)',
    borderRadius: 4, cursor: 'pointer', display: 'inline-block', transition: 'all 0.22s',
  };

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <NeuralCanvas />

      {/* Radial overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(2,12,27,0.25) 0%, rgba(2,12,27,0.82) 75%)',
      }} />
      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 220,
        background: 'linear-gradient(to bottom, transparent, var(--bg))', pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 clamp(1rem, 5vw, 2rem)', maxWidth: 860 }}>
        {/* System badge */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(0,212,255,0.45)',
          letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '2rem',
          animation: 'fadeInUp 0.6s ease both',
        }}>
          SYSTEM.INIT // PORTFOLIO v2.0 // STATUS: ONLINE
        </div>

        {/* Name */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.8rem, 9vw, 6.5rem)',
          fontWeight: 900, letterSpacing: '0.07em', lineHeight: 1.0,
          color: '#fff',
          textShadow: '0 0 50px rgba(0,212,255,0.25), 0 0 100px rgba(0,212,255,0.12)',
          marginBottom: '1.5rem',
          animation: 'fadeInUp 0.7s 0.1s ease both',
        }}>
          RAYMOND<br />
          <span style={{ color: '#00d4ff' }}>HUGHES</span>
        </h1>

        {/* Typewriter role */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.85rem, 2.5vw, 1.15rem)',
          color: 'var(--text2)', marginBottom: '3rem', minHeight: '2em',
          animation: 'fadeInUp 0.7s 0.2s ease both',
        }}>
          <span style={{ color: '#00d4ff' }}>{'> '}</span>
          {role}
          <span style={{
            display: 'inline-block', width: 2, height: '1.1em',
            background: '#00d4ff', verticalAlign: 'text-bottom',
            marginLeft: 2, animation: 'blink 1s step-end infinite',
          }} />
        </div>

        {/* Divider */}
        <div style={{
          width: 200, height: 1, margin: '0 auto 3rem',
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)',
          animation: 'fadeInUp 0.7s 0.3s ease both',
        }} />

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
          animation: 'fadeInUp 0.7s 0.4s ease both',
        }}>
          <a href="#about" style={btnPrimary}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 50px rgba(0,212,255,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 32px rgba(0,212,255,0.35)'; e.currentTarget.style.transform = ''; }}
          >
            View My Work
          </a>
          <a href="/resume.pdf" download style={btnSecondary}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.08)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,212,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
          >
            Download Resume
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        opacity: 0.35, animation: 'fadeInUp 1s 1.2s ease both',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text2)' }}>Scroll</span>
        <div style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, rgba(0,212,255,0.7), transparent)' }} />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   About
───────────────────────────────────────────────────────────────────── */

function About() {
  const stats = [
    { value: '10+', label: 'Years Rails' },
    { value: '3+',  label: 'Years AI Engineering' },
    { value: '4',   label: 'Companies' },
    { value: '3.85', label: 'University GPA' },
  ];

  return (
    <section id="about" style={{ padding: 'clamp(5rem, 10vw, 7rem) clamp(1rem, 6vw, 5rem)', maxWidth: 1100, margin: '0 auto' }}>
      <div className="reveal">
        <SectionHeader label="README.md" title="ABOUT ME" />
      </div>

      {/* Stats row */}
      <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {stats.map(({ value, label }) => (
          <div key={label} style={{
            padding: '1.5rem', background: 'var(--card)', border: '1px solid rgba(0,212,255,0.14)',
            borderRadius: 8, textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: '#00d4ff', letterSpacing: '0.04em', lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.4rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Summary card */}
      <div className="glow-card reveal" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(0,212,255,0.5)', letterSpacing: '0.2em', marginBottom: '1rem' }}>
          // PROFESSIONAL SUMMARY
        </div>
        <p style={{ fontSize: 'clamp(0.85rem, 1.8vw, 0.98rem)', color: 'var(--text)', lineHeight: 1.85, marginBottom: '1.25rem' }}>
          AI Engineer and Solutions Architect with over a decade of Ruby on Rails experience and deep hands-on expertise building production-grade agentic systems, LLM integrations, and event-driven architecture.
        </p>
        <p style={{ fontSize: 'clamp(0.85rem, 1.8vw, 0.98rem)', color: 'var(--text2)', lineHeight: 1.85 }}>
          Currently serving as Architect on the VA Appeals modernization program alongside Booz Allen Hamilton, owning technical direction across multiple platforms and leading a team-wide AI tooling transformation. Equally comfortable designing systems from scratch, aligning stakeholders on technical roadmaps, and mentoring engineers — with seven years of additional domain depth in behavioral health EHR systems.
        </p>

        {/* Contact row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,212,255,0.1)' }}>
          {[
            { icon: '✉', label: 'raymond.hughes@live.com', href: 'mailto:raymond.hughes@live.com' },
            { icon: '◎', label: 'Port St. Lucie, FL',      href: null },
            { icon: '⬡', label: 'LinkedIn',                 href: 'https://www.linkedin.com/in/raymond-h-13838369/' },
            { icon: '⎔', label: 'GitHub',                   href: 'https://github.com/Ray-Hughes' },
          ].map(({ icon, label, href }) => (
            href
              ? <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}
                >
                  <span style={{ color: '#00d4ff', fontSize: '0.8rem' }}>{icon}</span> {label}
                </a>
              : <span key={label} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#00d4ff', fontSize: '0.8rem' }}>{icon}</span> {label}
                </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Experience
───────────────────────────────────────────────────────────────────── */

function Experience() {
  return (
    <section id="experience" style={{ padding: 'clamp(5rem, 10vw, 7rem) clamp(1rem, 6vw, 5rem)', maxWidth: 1100, margin: '0 auto' }}>
      <div className="reveal">
        <SectionHeader label="git log" title="EXPERIENCE" />
      </div>

      <div style={{ position: 'relative', paddingLeft: 'clamp(1.5rem, 4vw, 3rem)' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute', left: 0, top: 8, bottom: 8, width: 1,
          background: 'linear-gradient(to bottom, #00d4ff 0%, #7c3aed 60%, rgba(124,58,237,0.1) 100%)',
        }} />

        {EXPERIENCE.map((job, i) => (
          <div key={i} className="reveal" style={{ position: 'relative', marginBottom: i < EXPERIENCE.length - 1 ? '3rem' : 0 }}>
            {/* Timeline dot */}
            <div
              className={job.current ? 'dot-current' : ''}
              style={{
                position: 'absolute', left: 'calc(-1 * clamp(1.5rem, 4vw, 3rem) - 5px)',
                top: '1.25rem', width: 11, height: 11, borderRadius: '50%',
                background: job.current ? '#00d4ff' : 'var(--bg3)',
                border: `2px solid ${job.current ? '#00d4ff' : 'rgba(0,212,255,0.35)'}`,
              }}
            />

            {/* Card */}
            <div className="glow-card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.18)'}
            >
              {/* Header */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: '#fff' }}>{job.company}</span>
                    {job.current && (
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em',
                        padding: '0.15rem 0.6rem', background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.35)', color: '#00d4ff', borderRadius: 99,
                        textTransform: 'uppercase',
                      }}>Current</span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#00d4ff', marginTop: '0.25rem' }}>{job.role}</div>
                  {job.sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', marginTop: '0.2rem', fontStyle: 'italic' }}>{job.sub}</div>}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{job.period}</div>
              </div>

              {/* Bullets */}
              <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {job.bullets.map((b, j) => (
                  <li key={j} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text2)', lineHeight: 1.7 }}>
                    <span style={{ color: '#00d4ff', flexShrink: 0, marginTop: '0.35em', fontSize: '0.5rem' }}>◆</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Projects
───────────────────────────────────────────────────────────────────── */

function Projects() {
  return (
    <section id="projects" style={{ padding: 'clamp(5rem, 10vw, 7rem) clamp(1rem, 6vw, 5rem)', background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg2) 50%, var(--bg) 100%)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="reveal">
          <SectionHeader label="projects.json" title="FEATURED PROJECTS" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '1.5rem' }}>
          {PROJECTS.map((proj, i) => (
            <div key={i} className="reveal">
              <Link
                to={`/projects/${proj.org.toLowerCase()}`}
                style={{
                  display: 'block', height: '100%',
                  background: 'var(--card)', borderRadius: 10,
                  border: `1px solid ${proj.color}28`,
                  padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                  transition: 'all 0.28s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = proj.color + '55';
                  e.currentTarget.style.boxShadow = `0 0 40px ${proj.color}22, 0 0 80px ${proj.color}10`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = proj.color + '28';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.transform = '';
                }}
              >
                {/* Org header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.2em', color: proj.color, textTransform: 'uppercase', marginBottom: '0.4rem', opacity: 0.7 }}>
                      github.com/{proj.org}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                      {proj.org}
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', color: proj.color, marginTop: '0.25rem', fontWeight: 600 }}>
                      {proj.tagline}
                    </div>
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0, marginLeft: '1rem',
                    background: `radial-gradient(circle, ${proj.color}22 0%, transparent 70%)`,
                    border: `1px solid ${proj.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 900, color: proj.color,
                  }}>
                    {proj.org[0]}
                  </div>
                </div>

                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text2)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  {proj.description}
                </p>

                {/* Repo list */}
                {proj.repos && (
                  <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {proj.repos.map(r => (
                      <div key={r.name} style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: proj.color, flexShrink: 0 }}>⎔ {r.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)' }}>— {r.desc}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {proj.tags.map(tag => (
                    <span key={tag} style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '0.2rem 0.6rem',
                      border: `1px solid ${proj.color}33`, color: proj.color,
                      borderRadius: 99, letterSpacing: '0.05em', background: `${proj.color}0a`,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* View link */}
                <div style={{ marginTop: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: proj.color, letterSpacing: '0.1em', opacity: 0.7 }}>
                  VIEW PROJECT BREAKDOWN →
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Skills
───────────────────────────────────────────────────────────────────── */

function Skills() {
  return (
    <section id="skills" style={{ padding: 'clamp(5rem, 10vw, 7rem) clamp(1rem, 6vw, 5rem)', maxWidth: 1100, margin: '0 auto' }}>
      <div className="reveal">
        <SectionHeader label="skills.json" title="TECHNICAL SKILLS" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
        {SKILLS.map(({ cat, color, items }) => (
          <div key={cat} className="reveal glow-card" style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
            {/* Category header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.18em', color, textTransform: 'uppercase', fontWeight: 700 }}>{cat}</span>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {items.map(item => (
                <span
                  key={item}
                  className="skill-badge"
                  style={{ color: `${color}cc`, borderColor: `${color}30`, background: `${color}08` }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color       = color;
                    e.currentTarget.style.borderColor = `${color}70`;
                    e.currentTarget.style.background  = `${color}15`;
                    e.currentTarget.style.boxShadow   = `0 0 12px ${color}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color       = `${color}cc`;
                    e.currentTarget.style.borderColor = `${color}30`;
                    e.currentTarget.style.background  = `${color}08`;
                    e.currentTarget.style.boxShadow   = '';
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Education
───────────────────────────────────────────────────────────────────── */

function Education() {
  return (
    <section id="education" style={{ padding: 'clamp(3rem, 8vw, 5rem) clamp(1rem, 6vw, 5rem)', maxWidth: 1100, margin: '0 auto' }}>
      <div className="reveal">
        <SectionHeader label="education.md" title="EDUCATION" />
      </div>

      <div className="reveal glow-card" style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(0,212,255,0.5)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            // UNIVERSITY
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)', fontWeight: 700, color: '#fff' }}>Keiser University</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#00d4ff', marginTop: '0.25rem' }}>B.S. in Software Engineering</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text2)', marginTop: '0.2rem' }}>Jan 2013 – Dec 2016</div>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: '#00d4ff', lineHeight: 1 }}>3.85</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.3rem' }}>GPA</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', color: 'rgba(0,212,255,0.8)', fontWeight: 600, lineHeight: 1.3 }}>High<br />Honors</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.3rem' }}>Graduation</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Contact
───────────────────────────────────────────────────────────────────── */

function Contact() {
  const methods = [
    { label: 'Email', value: 'raymond.hughes@live.com', href: 'mailto:raymond.hughes@live.com', color: '#00d4ff' },
    { label: 'LinkedIn', value: 'raymondhughes13838369', href: 'https://www.linkedin.com/in/raymond-h-13838369/', color: '#a855f7' },
    { label: 'Phone', value: '772-666-1600', href: 'tel:7726661600', color: '#00ff88' },
    { label: 'GitHub', value: 'github.com/Ray-Hughes', href: 'https://github.com/Ray-Hughes', color: '#ff8c42' },
  ];

  return (
    <section id="contact" style={{
      padding: 'clamp(5rem, 10vw, 8rem) clamp(1rem, 6vw, 5rem)',
      background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div className="reveal">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(0,212,255,0.5)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <span style={{ opacity: 0.45 }}>~/</span>contact.sh
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
            fontWeight: 900, letterSpacing: '0.06em', color: '#fff',
            textShadow: '0 0 40px rgba(0,212,255,0.25)', marginBottom: '1rem',
          }}>
            LET'S BUILD SOMETHING<br />
            <span style={{ color: '#00d4ff' }}>INTELLIGENT</span>
          </h2>
          <div style={{ width: 48, height: 2, background: 'linear-gradient(90deg, #00d4ff, #7c3aed)', borderRadius: 99, margin: '0 auto 3rem' }} />
        </div>

        {/* Contact cards */}
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {methods.map(({ label, value, href, color }) => (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
              style={{
                padding: '1.5rem 1rem', background: 'var(--card)',
                border: `1px solid ${color}20`, borderRadius: 8,
                display: 'block', transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}55`; e.currentTarget.style.boxShadow = `0 0 30px ${color}18`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}20`; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem', opacity: 0.7 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text)', wordBreak: 'break-all' }}>{value}</div>
            </a>
          ))}
        </div>

        {/* Resume download */}
        <div className="reveal">
          <a
            href="/resume.pdf" download
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(124,58,237,0.15) 100%)',
              border: '1px solid rgba(0,212,255,0.35)', color: '#00d4ff',
              borderRadius: 6, transition: 'all 0.25s',
              boxShadow: '0 0 30px rgba(0,212,255,0.1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 50px rgba(0,212,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.6)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,212,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'; e.currentTarget.style.transform = ''; }}
          >
            <span style={{ fontSize: '1rem' }}>↓</span>
            Download Full Resume (PDF)
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Footer
───────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer style={{
      padding: '2rem clamp(1rem, 5vw, 3rem)',
      borderTop: '1px solid rgba(0,212,255,0.08)',
      display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.1em' }}>
        <span style={{ color: 'rgba(0,212,255,0.4)' }}>// </span>
        RAYMOND HUGHES · {new Date().getFullYear()} · PORT ST. LUCIE, FL
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)', letterSpacing: '0.08em' }}>
        BUILT WITH REACT · VITE
      </span>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   App
───────────────────────────────────────────────────────────────────── */

export default function Home() {
  useReveal();

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

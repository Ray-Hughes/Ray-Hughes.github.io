import { useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Interior from '../scenes/Interior';
import ProjectScene from '../scenes/ProjectScene';
import { PROJECTS_MAP } from '../data/projectsData';

/* A project building, inside: one station per milestone of its story. */

const PLACE = { delphi: 'delphi', patientevity: 'hospital', memophor: 'memophor' };

function itemsFor(slug, p) {
  return [
    {
      id: 'overview', title: p.name, short: 'Overview', icon: 'ℹ️', kicker: p.tagline,
      body: (
        <>
          <p>{p.description}</p>
          <div className="ip-facts" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {p.stats.map((s) => <div key={s.label}><strong style={{ fontSize: '1.3rem', fontFamily: 'var(--f-display)', color: p.color }}>{s.value}</strong><span>{s.label}</span></div>)}
          </div>
          <p style={{ marginTop: '1rem' }}><strong>Built with</strong></p>
          <div className="ip-chips">{p.stack.map((s) => <span key={s.label}>{s.label}</span>)}</div>
          <p style={{ marginTop: '1rem' }}><strong>Repositories</strong></p>
          <div className="ip-actions">
            {p.repos.map((r) => (
              <a key={r.name} className="ip-btn" href={r.url} target="_blank" rel="noopener noreferrer">
                <code>{r.name}</code> <span style={{ fontWeight: 600, color: 'var(--c-ink-3)' }}>· {r.label}</span>
              </a>
            ))}
            <Link className="ip-btn ip-btn-main" to={`/projects/${slug}/story`}>📖 Read the full write-up</Link>
          </div>
        </>
      ),
    },
    ...p.milestones.map((m, k) => ({
      id: `m${k}`, title: m.title, short: m.phase.charAt(0) + m.phase.slice(1).toLowerCase(), icon: m.number, kicker: `${m.number} · ${m.phase}`,
      body: (
        <>
          <p><strong>{m.subtitle}</strong></p>
          <p>{m.description}</p>
          {m.screenshot && <img className="ip-shot" src={m.screenshot} alt={m.screenshotAlt || ''} loading="lazy" />}
          {m.code && (
            <>
              <span className="ip-code-name">{m.codeFile}</span>
              <pre className="ip-code">{m.code}</pre>
            </>
          )}
          <div className="ip-chips">{m.tags.map((t) => <span key={t}>{t}</span>)}</div>
        </>
      ),
    })),
    {
      id: 'facts', title: 'Did you know?', short: 'Notice board', icon: '🎲', kicker: 'Pinned to the board',
      body: <ul>{p.diceFacts.map((f) => <li key={f}>{f}</li>)}</ul>,
    },
  ];
}

export default function Project() {
  const { slug } = useParams();
  const p = PROJECTS_MAP[slug];
  const items = useMemo(() => (p ? itemsFor(slug, p) : []), [slug, p]);
  if (!p || !PLACE[slug]) return <Navigate to="/" replace />;
  return (
    <Interior
      key={slug}
      place={PLACE[slug]}
      camera={{ from: [1.2, 1.4, 4.6], to: [5.8, 5.2, 7.2], target: [0, 0.3, -0.5] }}
      limits={{ min: 3, max: 12 }}
      tip="Each numbered station is a chapter of the build. Start at 01."
      items={items}
      bg={slug === 'memophor' ? '#f3ecfb' : slug === 'delphi' ? '#f4f0e6' : '#eef5ff'}
      light={slug === 'patientevity' ? 0.8 : 1}
      actions={<Link className="in-btn in-btn-main" to={`/projects/${slug}/story`}>Read the full write-up</Link>}
      loading={`Walking into ${p.name}…`}
    >
      {(open) => <ProjectScene slug={slug} project={p} open={open} />}
    </Interior>
  );
}

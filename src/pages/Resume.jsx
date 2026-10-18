import { useEffect } from 'react';
import Interior from '../scenes/Interior';
import OfficeScene from '../scenes/OfficeScene';
import BugSquash from '../games/BugSquash';
import { PROFILE, EXPERIENCE, SKILLS } from '../data/profile';

/** The résumé itself, as a window you could have opened on that screen. */
export function ResumeWindow({ onClose }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="rw-veil" onClick={onClose}>
      <article className="rw" role="dialog" aria-label="Résumé" onClick={(e) => e.stopPropagation()}>
        <div className="rw-bar">
          <button className="rw-dot" style={{ background: '#ff5f57' }} onClick={onClose} aria-label="Close" />
          <span className="rw-dot" style={{ background: '#febc2e' }} />
          <span className="rw-dot" style={{ background: '#28c840' }} />
          <span className="rw-file">résumé — Raymond Hughes</span>
          <div className="rw-tools">
            <button onClick={() => window.print()}>Print</button>
            <a href={PROFILE.resume} download>Download PDF</a>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="rw-body">
          <header className="rw-head">
            <h1>{PROFILE.name}</h1>
            <p>{PROFILE.title} · {PROFILE.location}</p>
            <div className="rw-contact">
              <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
              <a href={`tel:${PROFILE.phone.replace(/-/g, '')}`}>{PROFILE.phone}</a>
              <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </header>
          <section className="rw-section">
            <h2>Summary</h2>
            <p>{PROFILE.about.slice(0, 2).join(' ')}</p>
          </section>
          <section className="rw-section">
            <h2>Experience</h2>
            {EXPERIENCE.map((job) => (
              <div key={job.company} className="rw-job">
                <div className="rw-job-top">
                  <div>
                    <h3>{job.company}{job.current && <span className="rw-now">Current</span>}</h3>
                    <div className="rw-role">{job.role}</div>
                    {job.sub && <div className="rw-org">{job.sub}</div>}
                  </div>
                  <div className="rw-period">{job.period}</div>
                </div>
                <ul>{job.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              </div>
            ))}
          </section>
          <section className="rw-section">
            <h2>Skills</h2>
            <div className="rw-skills">
              {SKILLS.map((s) => (
                <div key={s.cat} style={{ '--c': s.color }}>
                  <strong>{s.cat}</strong>
                  <span>{s.items.join(' · ')}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="rw-section">
            <h2>Education</h2>
            <p><strong>{PROFILE.education.degree}</strong>, {PROFILE.education.school} · {PROFILE.education.note}</p>
          </section>
        </div>
      </article>
    </div>
  );
}

const TOOLING = [
  ['The Appeals Agent Toolkit', 'A shared GitHub Copilot configuration layer, so the team had one way of working with AI rather than a dozen private ones.'],
  ['Agents that do real work', 'Autonomous agents for test generation, documentation synthesis and PR review, in use on the VA Appeals program.'],
  ['Context across systems', 'Multi-product MCP integration, so AI assistants operate with context from every platform instead of one repository at a time.'],
  ['Somewhere for context to live', 'Anchor comment patterns give an agent a reliable place to attach context, and a spec-driven development rollout ran from day one.'],
];

const ITEMS = [
  {
    id: 'resume', title: 'Résumé', short: 'Résumé', icon: '📄',
    focus: { pos: [2.3, 0.95, -0.6], target: [2.3, 0.82, -2.9] },
    window: ResumeWindow,
  },
  ...EXPERIENCE.map((job, k) => ({
    id: `job${k}`, title: job.company, short: job.company.replace(/,? (LLC|Inc\.)/, ''), icon: '🏅', kicker: job.period, color: '#2c3e66',
    focus: { pos: [-2.0, 1.0, 0.75 - k * 0.5], target: [-3.9, 0.85, 0.75 - k * 0.5] },
    body: (
      <>
        <p><strong>{job.role}</strong>{job.current ? ' · current' : ''}</p>
        {job.sub && <p>{job.sub}</p>}
        <ul style={{ marginTop: '0.8rem' }}>{job.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
      </>
    ),
  })),
  {
    id: 'tooling', title: 'The AI tooling', short: 'Whiteboard', icon: '🧠', kicker: 'On the whiteboard', color: '#9b3fd6',
    focus: { pos: [2.6, 1.1, 1.3], target: [2.5, 0.85, -0.35] },
    body: (
      <>
        <p>What the last three years on the VA Appeals program have added up to, drawn on one board:</p>
        <ul style={{ marginTop: '0.8rem' }}>{TOOLING.map(([h, t]) => <li key={h}><strong>{h}.</strong> {t}</li>)}</ul>
      </>
    ),
  },
  { id: 'bugs', title: 'Bug Squash', short: 'Arcade', icon: '🕹️', color: '#d6336c', game: BugSquash },
];

export default function Resume() {
  return (
    <Interior
      place="office"
      sub="Hughes Tower · Floor 17"
      camera={{ from: [1.5, 1.3, 4.5], to: [6.2, 5.4, 7.4], target: [0, 0.3, -0.2] }}
      limits={{ min: 3, max: 12 }}
      tip="Click the big screen on the back wall to read the résumé"
      items={ITEMS}
      actions={<a className="in-btn" href={PROFILE.resume} download>Download PDF</a>}
      loading="Taking the elevator to floor 17…"
    >
      {(open) => <OfficeScene open={open} />}
    </Interior>
  );
}

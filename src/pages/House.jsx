import { Link } from 'react-router-dom';
import Interior from '../scenes/Interior';
import HouseScene from '../scenes/HouseScene';
import Snake from '../games/Snake';
import { PROFILE } from '../data/profile';

/* About me, as a house you can walk round. */

const HOW = [
  ['Learn the domain properly', 'Seven years in a HIPAA-compliant behavioral health EHR (FHIR R4, HL7 v2, QRDA and CDA), then three in veterans’ appeals and VBMS. Two regulated domains, learned to the level where the details matter.'],
  ['Scope the real problem', 'Multi-product MCP integration began as “our agents cannot see enough to be useful”, which is a complaint, not a specification. Turning that into a system is the job.'],
  ['Be a generalist who ships', 'Rails and Kafka in production, React and Electron on the front, AWS and GitHub Actions underneath. Delphi is the proof in one artefact: schema, app, MCP server, installers and a release pipeline, all of it shipped.'],
  ['Multiply the team', 'The Appeals Agent Toolkit gave a whole team one way of working with AI instead of a dozen private ones, and the spec-driven rollout started on day one. Infrastructure for other people’s work.'],
  ['Carry what you learn back', 'Delphi exists because agents kept re-deriving the same findings every session with nowhere durable to put them. Seen in the field, then built, used and shipped.'],
];

const ITEMS = [
  {
    id: 'about', title: 'About me', short: 'About me', icon: '🖼️', kicker: 'The photo wall',
    focus: { pos: [-1.2, 1.0, 0.4], target: [-1.5, 0.85, -2.4] },
    body: (
      <>
        {PROFILE.about.map((t) => <p key={t}>{t}</p>)}
        <div className="ip-actions">
          <Link className="ip-btn ip-btn-main" to="/resume">💼 See the résumé in Hughes Tower</Link>
        </div>
      </>
    ),
  },
  {
    id: 'education', title: 'Education', short: 'Diploma', icon: '🎓', kicker: 'On the wall', color: '#b8892f',
    focus: { pos: [-1.2, 1.0, 1.0], target: [-3.4, 0.85, 1.0] },
    body: (
      <>
        <p><strong>{PROFILE.education.degree}</strong></p>
        <p>{PROFILE.education.school} · {PROFILE.education.note}</p>
        <p>The degree came after years of hands-on systems work: installing and running commercial VoIP and cable systems, then truss design software for a manufacturer. It formalised what the field had already been teaching.</p>
      </>
    ),
  },
  {
    id: 'where', title: 'Where I am', short: 'Map', icon: '📍', kicker: 'The map', color: '#e63946',
    focus: { pos: [-1.2, 1.0, -0.2], target: [-3.4, 0.85, -0.2] },
    body: (
      <>
        <p><strong>{PROFILE.location}</strong>, on Florida’s Treasure Coast. Eastern time.</p>
        <p>Remote friendly, and used to working with teams spread across the country: the VA Appeals programme is a federal estate with people everywhere.</p>
      </>
    ),
  },
  {
    id: 'how', title: 'How I work', short: 'Bookshelf', icon: '📚', kicker: 'The bookshelf', color: '#8e5ec2',
    body: (
      <ul>
        {HOW.map(([h, t]) => <li key={h}><strong>{h}.</strong> {t}</li>)}
      </ul>
    ),
  },
  {
    id: 'now', title: 'What I’m building now', short: 'The desk', icon: '💻', kicker: 'The desk', color: '#2bb8c2',
    body: (
      <>
        <p><strong>Delphi</strong>: a project tracker your AI agents keep current themselves. Projects hold tasks, memory notes and links, with a knowledge graph underneath, and Claude Code and GitHub Copilot read and write the same store over MCP.</p>
        <p>It ships as installers for macOS and Windows, free and open source.</p>
        <div className="ip-actions">
          <Link className="ip-btn ip-btn-main" to="/projects/delphi">🏛️ Visit the Temple of Delphi</Link>
          <a className="ip-btn" href="https://github.com/Ray-Hughes/delphi" target="_blank" rel="noopener noreferrer">⬇️ Download it on GitHub</a>
        </div>
      </>
    ),
  },
  {
    id: 'numbers', title: 'By the numbers', short: 'Trophies', icon: '🏆', kicker: 'The trophy shelf', color: '#e09100',
    body: (
      <div className="ip-facts">
        {PROFILE.stats.map(([v, l]) => <div key={l}><strong style={{ fontSize: '1.6rem', fontFamily: 'var(--f-display)' }}>{v}</strong><span>{l}</span></div>)}
        <div><strong style={{ fontSize: '1.6rem', fontFamily: 'var(--f-display)' }}>2</strong><span>Regulated domains learned properly: healthcare and veterans’ appeals</span></div>
      </div>
    ),
  },
  { id: 'snake', title: 'Snake', short: 'Play Snake', icon: '🎮', color: '#3fa34d', game: Snake },
];

export default function House() {
  return (
    <Interior
      place="home"
      camera={{ from: [1.2, 1.2, 4.2], to: [5.2, 4.4, 6.0], target: [0, 0.3, -0.3] }}
      limits={{ min: 2.5, max: 10 }}
      tip="Click the glowing things in the room, or pick from the list below"
      items={ITEMS}
      bg="#fff4e6"
      loading="Opening the front door…"
    >
      {(open) => <HouseScene open={open} />}
    </Interior>
  );
}

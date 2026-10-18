import { Link } from 'react-router-dom';
import Interior from '../scenes/Interior';
import LotScene from '../scenes/LotScene';
import TowerStack from '../games/TowerStack';
import { PROFILE, PROJECT_CARDS } from '../data/profile';

/* The empty lot: what is next. */

const ITEMS = [
  {
    id: 'next', title: 'The next project', short: 'Blueprints', icon: '📐', kicker: 'Breaking ground soon', color: '#1f4f91',
    focus: { pos: [-0.6, 1.6, 1.6], target: [-1.6, 0.4, 0.3] },
    body: (
      <>
        <p>This lot is reserved for whatever I build next. The blueprints are still being drawn, and like the rest of the district it will open with a full write-up: the problem, the decisions, and the real code.</p>
        <p>Follow along on GitHub to see it go up.</p>
        <div className="ip-actions"><a className="ip-btn ip-btn-main" href={PROFILE.github} target="_blank" rel="noopener noreferrer">🐙 github.com/Ray-Hughes</a></div>
      </>
    ),
  },
  {
    id: 'built', title: 'Already built', short: 'Notice board', icon: '📋', kicker: 'The projects district', color: '#2a9d8f',
    body: (
      <div className="ip-actions">
        {PROJECT_CARDS.map((p) => (
          <Link key={p.slug} className="ip-btn" to={`/projects/${p.slug}`} style={{ borderLeft: `4px solid ${p.color}` }}>
            <strong>{p.name}</strong> · {p.tagline}<br />
            <span style={{ fontSize: '0.82rem', color: p.color }}>Visit {p.building} →</span>
          </Link>
        ))}
      </div>
    ),
  },
  {
    id: 'hire', title: 'Build something with me', short: 'Site office', icon: '🦺', kicker: 'The site office', color: '#e76f51',
    body: (
      <>
        <p>Got a lot of your own that needs building on? I am open to AI engineering and architecture work.</p>
        <div className="ip-actions">
          <a className="ip-btn ip-btn-main" href={`mailto:${PROFILE.email}`}>✉️ {PROFILE.email}</a>
          <Link className="ip-btn" to="/post-office">🏤 Visit the post office</Link>
        </div>
      </>
    ),
  },
  { id: 'stack', title: 'Tower Stack', short: 'Crane game', icon: '🏗️', color: '#e9a100', game: TowerStack },
];

export default function Lot() {
  return (
    <Interior
      place="yard"
      sub="Coming soon · the projects district"
      camera={{ from: [2.0, 2.0, 6.0], to: [6.4, 6.0, 8.0], target: [0, 0.5, -0.3] }}
      limits={{ min: 3, max: 14, maxPolar: 1.2 }}
      tip="Climb into the crane to play, or look at the blueprints"
      items={ITEMS}
      bg="#cfeaff"
      loading="Putting on a hard hat…"
    >
      {(open) => <LotScene open={open} />}
    </Interior>
  );
}

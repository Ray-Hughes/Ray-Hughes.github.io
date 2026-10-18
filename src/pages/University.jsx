import Interior from '../scenes/Interior';
import UniversityScene from '../scenes/UniversityScene';
import MemoryMatch from '../games/MemoryMatch';
import { SKILLS } from '../data/profile';

/* Skills, taught in Room 101. */

const ICONS = ['🤖', '🛤️', '🖥️', '☁️', '🩺', '🧭'];

// What each subject has actually been used for, so the chips are not just a list.
const IN_PRACTICE = [
  'Autonomous agents for test generation, documentation synthesis and PR review on the VA Appeals program; the Appeals Agent Toolkit; Delphi’s 43-tool MCP server and knowledge graph.',
  'A decade of Ruby on Rails, the Kafka appeals-consumer, event-driven services and SQS / Shoryuken workers; SQLite as Delphi’s single local store.',
  'React for this site and for Delphi’s interface, Electron for Delphi and AVA+, shipped as installers for macOS and Windows.',
  'AWS, Docker and GitHub Actions underneath; Dynatrace, New Relic and OpenTelemetry to see what production is actually doing.',
  'Seven years in a HIPAA-compliant behavioral health EHR with full FHIR and HL7 integration and QRDA / CDA import and export, then VBMS architecture for veterans’ appeals.',
  'Technical direction across several platforms, stakeholder alignment on roadmaps, and mentoring through code review and coaching.',
];

const ITEMS = [
  {
    id: 'all', title: 'The syllabus', short: 'Chalkboard', icon: '🧑‍🏫', kicker: 'Every subject', color: '#3a7d5c',
    focus: { pos: [0, 1.0, 0.6], target: [0, 0.78, -2.9] },
    body: (
      <div style={{ display: 'grid', gap: '1rem' }}>
        {SKILLS.map((s) => (
          <section key={s.cat}>
            <strong style={{ color: s.color, fontFamily: 'var(--f-display)', fontSize: '1rem' }}>{s.cat}</strong>
            <div className="ip-chips" style={{ '--c': s.color }}>{s.items.map((i) => <span key={i}>{i}</span>)}</div>
          </section>
        ))}
      </div>
    ),
  },
  ...SKILLS.map((s, k) => ({
    id: `s${k}`, title: s.cat, short: s.cat, icon: ICONS[k], kicker: 'Subject', color: s.color,
    body: (
      <>
        <div className="ip-chips">{s.items.map((i) => <span key={i}>{i}</span>)}</div>
        <p style={{ marginTop: '1rem' }}><strong>In practice.</strong> {IN_PRACTICE[k]}</p>
      </>
    ),
  })),
  { id: 'memory', title: 'Memory Match', short: 'Flashcards', icon: '🃏', color: '#c8613f', game: MemoryMatch },
];

export default function University() {
  return (
    <Interior
      place="university"
      sub="Skills · Room 101"
      camera={{ from: [1.5, 1.4, 4.6], to: [5.8, 5.2, 7.2], target: [0, 0.3, -0.4] }}
      limits={{ min: 3, max: 12 }}
      tip="Click the chalkboard or a poster, or play the flashcards on the teacher's desk"
      items={ITEMS}
      bg="#f8eedf"
      loading="Finding a seat in Room 101…"
    >
      {(open) => <UniversityScene open={open} />}
    </Interior>
  );
}

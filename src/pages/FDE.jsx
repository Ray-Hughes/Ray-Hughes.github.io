import { useEffect } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────────
   The case for the role.

   Written as an argument rather than a pitch: what the job actually asks
   for, and the specific thing already done that answers it. Every claim on
   this page points at work that exists, because a page about being
   evidence-driven that is not evidence-driven refutes itself.
───────────────────────────────────────────────────────────────────── */

const TRAITS = [
  {
    n: '01',
    trait: 'Deploy into someone else\'s world',
    ask: 'The work happens inside the customer\'s environment, on their systems, against their constraints, with their people in the room.',
    evidence: 'Three years embedded in the VA Appeals modernisation programme through Take2 and the Booz Allen Hamilton partnership. Not writing specifications for the VA from the outside: working inside Caseflow, eFolder Express and the Kafka appeals-consumer, in their estate, to their rules.',
  },
  {
    n: '02',
    trait: 'Learn the domain properly',
    ask: 'You cannot design for a domain you only half understand. FDEs are expected to get fluent in the customer\'s subject matter fast enough to argue with experts.',
    evidence: 'Seven years building a HIPAA-compliant behavioral health EHR: FHIR R4, HL7 v2, QRDA and CDA, clinical workflows and the regulations around them. Then three years of veterans\' appeals and VBMS architecture. Two regulated domains, learned to the level where the details matter.',
  },
  {
    n: '03',
    trait: 'Scope the real problem',
    ask: 'The brief arrives as a business problem, not a ticket. Someone has to turn a vague operational pain into a system that can be built.',
    evidence: 'Solutions Architect owning technical direction across several platforms, and an architect on multi-product MCP integration so AI assistants operate with cross-system context. That work began as "our agents cannot see enough to be useful", which is a complaint, not a specification.',
  },
  {
    n: '04',
    trait: 'Be a generalist who ships',
    ask: 'Whatever the deployment needs. Backend one week, a desktop client the next, the pipeline that puts it in front of users after that.',
    evidence: 'Rails and Kafka in production, React and Electron on the front, AWS and GitHub Actions underneath, SQLite and Postgres for storage. Delphi is the proof in one artefact: schema, app, MCP server, installers and a release pipeline, all of it shipped.',
  },
  {
    n: '05',
    trait: 'Multiply the team, not just yourself',
    ask: 'A good deployment leaves the customer\'s own engineers faster than it found them. The best FDE work outlives the FDE.',
    evidence: 'Built the Appeals Agent Toolkit, a shared GitHub Copilot configuration layer that standardised AI use across the whole team, and led a spec-driven development rollout from day one. That is deliberately infrastructure for other people\'s work.',
  },
  {
    n: '06',
    trait: 'Carry what you learn back',
    ask: 'The deployment is also research. What breaks in the field is what the product should have handled, and someone has to bring that back.',
    evidence: 'Delphi exists because of a pattern seen repeatedly in the field: agents re-deriving the same findings every session, with nowhere durable to put them. It was built, used, and shipped as something anyone can install.',
  },
];

const PROOFS = [
  {
    tag: 'The deployment',
    title: 'Three years inside a federal modernisation programme',
    colour: '#6ee7ff',
    body: [
      'Architect on the VA Appeals program, working across Caseflow, eFolder Express and the Kafka appeals-consumer, under a Take2 contract in partnership with Booz Allen Hamilton.',
      'That arrangement is the shape of forward deployment: a vendor engineer embedded in a customer\'s mission-critical estate, accountable to their outcomes rather than to a statement of work, aligning stakeholders who do not report to me.',
    ],
    points: ['Customer estate, not ours', 'Regulated environment', 'Stakeholders outside my reporting line', 'Multi-platform technical direction'],
  },
  {
    tag: 'The force multiplier',
    title: 'Standardising how a whole team uses AI',
    colour: '#a78bfa',
    body: [
      'The Appeals Agent Toolkit is a shared Copilot configuration layer built so the team had one way of working with AI rather than a dozen private ones. Alongside it: autonomous agents for test generation, documentation synthesis and PR review, and anchor comment patterns that give an agent somewhere reliable to attach context.',
      'None of this is billable feature work. It is the unglamorous internal tooling that decides whether a deployment leaves anything behind, which is the part of the FDE job that separates a good one from a contractor.',
    ],
    points: ['Adopted team-wide', 'Agentic pipelines in real use', 'Spec-driven rollout from day one', 'Outlives any one engineer'],
  },
  {
    tag: 'The product instinct',
    title: 'Delphi, taken from an itch to an installer',
    colour: '#4fd8e0',
    body: [
      'A project tracker with a knowledge graph that AI agents keep current over MCP. Built because agents kept starting from nothing, shipped as signed installers for macOS and Windows from a tagged release, with documentation and a download page.',
      'It matters here because finishing is the rare part. Packaging surfaced a dozen problems that a prototype never would: read-only bundles, a database that had to move, a platform with no sqlite3, two CI runners racing to publish the same release. Field work is made of exactly those.',
    ],
    points: ['11 MCP tools', 'Zero runtime dependencies', 'macOS and Windows', 'Anyone can install it today'],
    link: { to: '/projects/delphi', label: 'Read the full breakdown' },
  },
];

export default function FDE() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const spotlight = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,7,14,0.86)',
        backdropFilter: 'saturate(180%) blur(16px)',
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div className="wrap" style={{ height: 64, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ color: 'var(--fg-2)', fontWeight: 600, fontSize: '0.92rem' }}>← Raymond Hughes</Link>
          <div style={{ flex: 1 }} />
          <a className="btn btn-ghost" href="/resume.pdf" download style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}>Resume</a>
          <a className="btn btn-primary" href="mailto:raymond.hughes@live.com" style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}>Get in touch</a>
        </div>
      </header>

      <main>
        {/* Thesis ------------------------------------------------------ */}
        <section className="section" style={{ paddingTop: 'clamp(3rem, 7vw, 5rem)' }}>
          <div className="wrap">
            <div className="eyebrow" style={{ marginBottom: '1rem' }}>The role I am aiming at</div>
            <h1 className="display" style={{ fontSize: 'clamp(2.2rem, 5.2vw, 3.6rem)', maxWidth: '18ch' }}>
              Forward Deployed <span className="gradient-text">Engineer</span>
            </h1>
            <p className="lede" style={{ marginTop: '1.5rem', maxWidth: '60ch', fontSize: 'clamp(1.05rem, 1.7vw, 1.25rem)' }}>
              I have spent three years doing this job under a different title: a vendor engineer
              embedded in a customer’s estate, learning their domain, building inside their systems,
              and leaving tooling behind that their own people use.
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              <a className="btn btn-primary" href="mailto:raymond.hughes@live.com">Talk to me about a deployment</a>
              <Link className="btn btn-ghost" to="/">See the work</Link>
            </div>
          </div>
        </section>

        {/* What the role is -------------------------------------------- */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="reveal panel" style={{ padding: 'clamp(1.6rem, 4vw, 2.6rem)' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1rem' }}>What the job actually is</h2>
              <p style={{ color: 'var(--fg-2)', marginBottom: '1rem', maxWidth: '70ch' }}>
                The title came out of Palantir and has since been picked up across the AI industry,
                because a frontier model does not become useful to an enterprise on its own. Someone
                has to go and make it useful, in place.
              </p>
              <p style={{ color: 'var(--fg-2)', marginBottom: '1rem', maxWidth: '70ch' }}>
                A Forward Deployed Engineer sits with the customer, learns their domain properly,
                works out what the real problem is behind the one they described, and then writes the
                code that solves it on top of the core product. When the field shows the product is
                missing something, they carry that back.
              </p>
              <p style={{ color: 'var(--fg-2)', maxWidth: '70ch' }}>
                It is not sales engineering, and it is not staff augmentation. The distinguishing
                feature is that you ship, you own the outcome, and you do it somewhere that is not
                your own office with people who do not work for you.
              </p>
            </div>
          </div>
        </section>

        {/* Traits ------------------------------------------------------ */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="reveal" style={{ marginBottom: '2rem' }}>
              <div className="eyebrow" style={{ marginBottom: '0.7rem' }}>The fit</div>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.25rem)' }}>What it asks for, and what I have already done</h2>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {TRAITS.map((t) => (
                <div key={t.n} className="reveal panel spot" onMouseMove={spotlight}
                  style={{ padding: 'clamp(1.3rem, 3vw, 1.9rem)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: 'clamp(1rem, 3vw, 2rem)' }}>
                    <div className="display gradient-text" style={{ fontSize: '1.6rem', lineHeight: 1 }}>{t.n}</div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t.trait}</h3>
                      <p style={{ color: 'var(--fg-3)', fontSize: '0.92rem', marginBottom: '0.9rem', maxWidth: '70ch' }}>
                        {t.ask}
                      </p>
                      <div style={{
                        borderLeft: '2px solid var(--cy)', paddingLeft: '1rem',
                        color: 'var(--fg-2)', fontSize: '0.94rem', maxWidth: '70ch',
                      }}>
                        {t.evidence}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Proofs ------------------------------------------------------ */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="reveal" style={{ marginBottom: '2rem' }}>
              <div className="eyebrow" style={{ marginBottom: '0.7rem' }}>Evidence</div>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.25rem)' }}>Three things that make the case</h2>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {PROOFS.map((p) => (
                <div key={p.title} className="reveal panel spot" onMouseMove={spotlight}
                  style={{ '--tint': p.colour, padding: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.8rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: p.colour, boxShadow: `0 0 12px ${p.colour}` }} />
                    <span style={{ color: p.colour, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.tag}</span>
                  </div>
                  <h3 style={{ fontSize: 'clamp(1.2rem, 2.6vw, 1.5rem)', marginBottom: '1rem' }}>{p.title}</h3>
                  {p.body.map((para) => (
                    <p key={para.slice(0, 24)} style={{ color: 'var(--fg-2)', marginBottom: '0.9rem', maxWidth: '72ch', fontSize: '0.95rem' }}>
                      {para}
                    </p>
                  ))}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '1.1rem' }}>
                    {p.points.map((pt) => (
                      <span key={pt} className="chip" style={{ borderColor: `${p.colour}44`, color: `${p.colour}dd`, background: `${p.colour}0d` }}>{pt}</span>
                    ))}
                  </div>
                  {p.link && (
                    <Link to={p.link.to} style={{ display: 'inline-block', marginTop: '1.2rem', color: p.colour, fontWeight: 700, fontSize: '0.9rem' }}>
                      {p.link.label} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why AI companies -------------------------------------------- */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="reveal panel" style={{ padding: 'clamp(1.6rem, 4vw, 2.6rem)' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1rem' }}>Why an AI company specifically</h2>
              <p style={{ color: 'var(--fg-2)', marginBottom: '1rem', maxWidth: '70ch' }}>
                The gap between what a model can do in a demo and what it does inside a real
                organisation is mostly integration, context and trust. That gap is where I have spent
                the last three years: MCP integration across products, agents doing real work in a
                regulated programme, and the standards that stopped a team from each inventing their
                own way of using them.
              </p>
              <p style={{ color: 'var(--fg-2)', maxWidth: '70ch' }}>
                I also build these tools for myself, which is the part I would bring on day one. Delphi
                came from noticing that agents forget everything between sessions, and it ended as a
                shipped product with a knowledge graph and an MCP server. I would rather arrive
                somewhere already holding opinions about what agents need, formed by having built it.
              </p>
            </div>
          </div>
        </section>

        {/* CTA --------------------------------------------------------- */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="reveal panel" style={{
              padding: 'clamp(2rem, 5vw, 3.5rem)', textAlign: 'center',
              background: 'radial-gradient(70rem 30rem at 50% 0%, rgba(110,231,255,0.09), transparent 60%), linear-gradient(180deg, var(--ink-2), var(--ink-1))',
            }}>
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
                Point me at a customer and a hard problem
              </h2>
              <p className="lede" style={{ margin: '1rem auto 2rem', maxWidth: '52ch' }}>
                Open to Forward Deployed Engineer roles, remote or travelling. Based in Port St. Lucie,
                Florida, and used to working across time zones and organisations.
              </p>
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a className="btn btn-primary" href="mailto:raymond.hughes@live.com">raymond.hughes@live.com</a>
                <a className="btn btn-ghost" href="/resume.pdf" download>Download resume</a>
                <a className="btn btn-ghost" href="https://www.linkedin.com/in/raymond-h-13838369/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap" style={{ padding: '1.8rem 0', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', color: 'var(--fg-3)', fontSize: '0.85rem' }}>
          <span>Raymond Hughes · {new Date().getFullYear()}</span>
          <Link to="/" style={{ color: 'var(--fg-2)' }}>Back to the portfolio</Link>
        </div>
      </footer>
    </>
  );
}

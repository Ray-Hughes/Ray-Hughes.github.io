import { useState } from 'react';
import Interior from '../scenes/Interior';
import PostOfficeScene from '../scenes/PostOfficeScene';
import { PROFILE } from '../data/profile';

/* Contact, at the counter. */

function CopyEmail() {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(PROFILE.email); setDone(true); setTimeout(() => setDone(false), 2000); } catch { /* clipboard refused: the mailto link still works */ }
  };
  return <button className="ip-btn" onClick={copy} style={{ border: 0, textAlign: 'left', font: 'inherit', cursor: 'pointer' }}>{done ? '✅ Copied' : '📋 Copy the address'}</button>;
}

const ITEMS = [
  {
    id: 'email', title: 'Send a letter', short: 'Email', icon: '✉️', kicker: 'The fastest way to reach me',
    focus: { pos: [-0.2, 1.3, 0.8], target: [-0.2, 0.45, -1.0] },
    body: (
      <>
        <p>Open to AI engineering and architecture work. Email gets the quickest reply.</p>
        <div className="ip-actions">
          <a className="ip-btn ip-btn-main" href={`mailto:${PROFILE.email}`}>✉️ {PROFILE.email}</a>
          <CopyEmail />
        </div>
      </>
    ),
  },
  {
    id: 'resume', title: 'A parcel for you', short: 'Résumé PDF', icon: '📦', kicker: 'Signed, sealed, delivered', color: '#b5793e',
    body: (
      <>
        <p>The résumé as a PDF, to keep or forward.</p>
        <div className="ip-actions"><a className="ip-btn ip-btn-main" href={PROFILE.resume} download>⬇️ Download résumé.pdf</a></div>
      </>
    ),
  },
  {
    id: 'phone', title: 'Use the phone', short: 'Call', icon: '📞', kicker: 'Eastern time', color: '#2a9d8f',
    body: (
      <>
        <p>Based in {PROFILE.location}. Calls are welcome; email first is kind.</p>
        <div className="ip-actions"><a className="ip-btn ip-btn-main" href={`tel:${PROFILE.phone.replace(/-/g, '')}`}>📞 {PROFILE.phone}</a></div>
      </>
    ),
  },
  {
    id: 'linkedin', title: 'The notice board', short: 'LinkedIn', icon: '📌', kicker: 'Connect', color: '#0a66c2',
    body: (
      <>
        <p>Work history, recommendations and the occasional post.</p>
        <div className="ip-actions"><a className="ip-btn ip-btn-main" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">💼 Open LinkedIn</a></div>
      </>
    ),
  },
  {
    id: 'github', title: 'The shipping belt', short: 'GitHub', icon: '🐙', kicker: 'Where things ship from', color: '#24292f',
    body: (
      <>
        <p>Delphi, this site, and the repositories behind Patientevity and Memophor.</p>
        <div className="ip-actions">
          <a className="ip-btn ip-btn-main" href={PROFILE.github} target="_blank" rel="noopener noreferrer">🐙 github.com/Ray-Hughes</a>
          <a className="ip-btn" href="https://github.com/Patientevity" target="_blank" rel="noopener noreferrer">🏥 github.com/Patientevity</a>
          <a className="ip-btn" href="https://github.com/memophor" target="_blank" rel="noopener noreferrer">📚 github.com/memophor</a>
        </div>
      </>
    ),
  },
];

export default function PostOffice() {
  return (
    <Interior
      place="postoffice"
      camera={{ from: [1.0, 1.3, 4.2], to: [5.0, 4.6, 6.0], target: [0, 0.3, -0.5] }}
      limits={{ min: 2.5, max: 10 }}
      tip="Everything on the counter is a way to get in touch"
      items={ITEMS}
      bg="#eef4fb"
      loading="Joining the queue at the post office…"
    >
      {(open) => <PostOfficeScene open={open} />}
    </Interior>
  );
}

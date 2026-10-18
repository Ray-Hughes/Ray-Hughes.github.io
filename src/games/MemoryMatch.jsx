import { useEffect, useMemo, useState } from 'react';
import useBest from './useBest';
import './games.css';

/* Pairs of the tools I use, face down. Turn two at a time; a pair stays up.
   Fewer moves is better, so the best score is the lowest. */

const PAIRS = [
  ['🤖', 'Claude Code'], ['🔌', 'MCP'], ['💎', 'Rails'], ['📨', 'Kafka'],
  ['⚛️', 'React'], ['🩺', 'FHIR'], ['🕸️', 'Knowledge Graphs'], ['🐳', 'Docker'],
];

function deal() {
  const cards = PAIRS.flatMap(([icon, name], k) => [{ k, icon, name }, { k, icon, name }]);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.map((c, id) => ({ ...c, id }));
}

export default function MemoryMatch() {
  const [cards, setCards] = useState(deal);
  const [up, setUp] = useState([]);
  const [done, setDone] = useState([]);
  const [moves, setMoves] = useState(0);
  // Part of each card's key: a new deal mounts fresh face-down cards rather
  // than flipping the old ones back and showing the new faces on the way.
  const [round, setRound] = useState(0);
  const [best, offer] = useBest('memory-inverse');
  const won = done.length === PAIRS.length;

  useEffect(() => {
    if (up.length !== 2) return;
    const [a, b] = up.map((id) => cards[id]);
    const t = setTimeout(() => {
      if (a.k === b.k) setDone((d) => [...d, a.k]);
      setUp([]);
    }, a.k === b.k ? 350 : 900);
    return () => clearTimeout(t);
  }, [up, cards]);

  // Stored as 100 − moves so "higher is better" still holds for the hook.
  useEffect(() => { if (won) offer(100 - moves); }, [won, moves, offer]);
  const bestMoves = useMemo(() => (best ? 100 - best : null), [best]);

  const flip = (c) => {
    if (up.length === 2 || up.includes(c.id) || done.includes(c.k)) return;
    if (up.length === 1) setMoves((m) => m + 1);
    setUp((u) => [...u, c.id]);
  };
  const again = () => { setCards(deal()); setUp([]); setDone([]); setMoves(0); setRound((r) => r + 1); };

  return (
    <div className="game">
      <div className="game-bar">
        <span>🃏 {moves} moves</span>
        <span>{done.length}/{PAIRS.length} pairs</span>
        <span>Best {bestMoves ?? '—'}</span>
        <button onClick={again}>Shuffle</button>
      </div>
      <div className="mm-grid">
        {cards.map((c) => {
          const shown = up.includes(c.id) || done.includes(c.k);
          return (
            <button key={`${round}-${c.id}`} className={`mm-card ${shown ? 'is-up' : ''} ${done.includes(c.k) ? 'is-done' : ''}`} onClick={() => flip(c)} aria-label={shown ? c.name : 'Face-down card'}>
              <span className="mm-inner">
                <span className="mm-back">🎓</span>
                <span className="mm-front"><span className="mm-icon">{c.icon}</span><span className="mm-name">{c.name}</span></span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="game-help">{won ? `All pairs in ${moves} moves. Class dismissed!` : 'Find the matching pairs of tools.'}</div>
    </div>
  );
}

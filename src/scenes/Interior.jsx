import { useCallback, useEffect, useState } from 'react';
import Stage from './Stage';
import { InteriorHud, InteriorLoader } from './InteriorHud';
import { placeById } from '../city/places';

/* ─────────────────────────────────────────────────────────────────────
   The frame every building's inside shares.

   A room scene, a bar across the top, and a list of the things in the room
   along the bottom. Each thing is either a card (something to read) or a
   game. The list and the hotspots in the scene open the same items, so the
   room can be explored by clicking around it or by just reading the list.
───────────────────────────────────────────────────────────────────── */

export function Panel({ item, color, onClose }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <aside className="ip" style={{ '--c': item.color || color }} role="dialog" aria-label={item.title}>
      <div className="ip-head">
        <span className="ip-icon" aria-hidden="true">{item.icon}</span>
        <div>
          {item.kicker && <div className="ip-kicker">{item.kicker}</div>}
          <h2>{item.title}</h2>
        </div>
        <button className="ip-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="ip-body">{item.body}</div>
    </aside>
  );
}

export function GameWindow({ item, color, onClose }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  const Game = item.game;
  return (
    <div className="gm-veil" onClick={onClose}>
      <div className="gm" style={{ '--c': item.color || color }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={item.title}>
        <div className="gm-head">
          <span aria-hidden="true">{item.icon}</span>
          <strong>{item.title}</strong>
          <button className="ip-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <Game />
      </div>
    </div>
  );
}

/**
 * place: id from places.js, for the colour, icon and name
 * items: [{ id, title, icon, kicker?, body? | game? | window?, focus? }]
 *   body is a card, game opens in a game window, window is a whole
 *   overlay of its own (the résumé) given onClose
 * children: (open) => the scene, which calls open(id) from its hotspots
 */
export default function Interior({ place, sub, camera, limits, tip, items, actions, loading, bg, light, children }) {
  const p = placeById[place];
  const [openId, setOpenId] = useState(null);
  const [focus, setFocus] = useState(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const open = useCallback((id) => {
    const it = items.find((i) => i.id === id);
    setOpenId(id);
    setFocus(it?.focus || null);
  }, [items]);
  const close = useCallback(() => { setOpenId(null); setFocus(null); }, []);
  useEffect(() => { document.title = `${p.title} · Raymond Hughes`; }, [p.title]);
  const item = items.find((i) => i.id === openId);

  return (
    <div className="in-root" style={bg ? { background: bg, '--in-bg': bg } : undefined}>
      <Stage camera={camera} limits={limits} focus={focus} bg={bg} light={light} onReady={onReady}>
        {children(open)}
      </Stage>
      <InteriorHud icon={p.icon} sub={sub || p.sub} title={p.title} color={p.color} actions={actions} />
      <nav className="in-items" aria-label="Things in this room">
        {items.map((it) => (
          <button key={it.id} className={`in-item ${openId === it.id ? 'is-on' : ''}`} onClick={() => open(it.id)} style={{ '--c': it.color || p.color }}>
            <span aria-hidden="true">{it.icon}</span>
            <span>{it.short || it.title}</span>
          </button>
        ))}
      </nav>
      {!item && tip && <div className="in-tip">{tip}</div>}
      {item && item.body && <Panel item={item} color={p.color} onClose={close} />}
      {item && item.game && <GameWindow item={item} color={p.color} onClose={close} />}
      {item && item.window && <item.window onClose={close} />}
      <InteriorLoader label={loading || `Opening the door to ${p.title}…`} ready={ready} />
    </div>
  );
}

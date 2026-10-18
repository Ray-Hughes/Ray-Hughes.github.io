import { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Interior from '../scenes/Interior';
import CinemaScene from '../scenes/CinemaScene';
import { POSTS, postBySlug, fmtDate } from '../data/posts';
import '../scenes/interior.css';

/* The blog: a cinema to browse it in, and a plain page for each post so a
   post can be linked to directly. */

export function Article({ post }) {
  return (
    <>
      <header className="rw-head" style={{ background: `linear-gradient(120deg, ${post.color}, #1d1420)` }}>
        <div style={{ fontSize: '2rem' }} aria-hidden="true">{post.icon}</div>
        <h1>{post.title}</h1>
        <p>{post.dek}</p>
        <div className="rw-contact">
          <span>{fmtDate(post.date)}</span>
          <span>{post.minutes} min read</span>
          <span>{post.tags.join(' · ')}</span>
        </div>
      </header>
      <div className="rw-section post-body">
        {post.blocks.map((b, k) => {
          if (b.h) return <h2 key={k}>{b.h}</h2>;
          if (b.p) return <p key={k}>{b.p}</p>;
          if (b.list) return <ul key={k}>{b.list.map((li) => <li key={li}>{li}</li>)}</ul>;
          if (b.code) return (
            <figure key={k}>
              {b.file && <figcaption>{b.file}</figcaption>}
              <pre><code>{b.code}</code></pre>
            </figure>
          );
          return null;
        })}
      </div>
    </>
  );
}

function PostWindow({ post, onClose }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="rw-veil" onClick={onClose}>
      <article className="rw" role="dialog" aria-label={post.title} onClick={(e) => e.stopPropagation()}>
        <div className="rw-bar">
          <button className="rw-dot" style={{ background: '#ff5f57' }} onClick={onClose} aria-label="Close" />
          <span className="rw-dot" style={{ background: '#febc2e' }} />
          <span className="rw-dot" style={{ background: '#28c840' }} />
          <span className="rw-file">Now showing: {post.title}</span>
          <div className="rw-tools">
            <Link to={`/blog/${post.slug}`}>Open as a page</Link>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="rw-body"><Article post={post} /></div>
      </article>
    </div>
  );
}

const ITEMS = [
  {
    id: 'all', title: 'Now showing', short: 'All posts', icon: '🎞️', kicker: 'The programme', color: '#b23a48',
    focus: { pos: [-0.4, 1.3, 2.4], target: [-0.4, 0.98, -2.8] },
    body: (
      <div className="ip-actions">
        {POSTS.map((p) => (
          <Link key={p.slug} className="ip-btn" to={`/blog/${p.slug}`} style={{ borderLeft: `4px solid ${p.color}` }}>
            {p.icon} <strong>{p.title}</strong><br />
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--c-ink-3)' }}>{p.dek}</span>
          </Link>
        ))}
      </div>
    ),
  },
  ...POSTS.map((p) => ({
    id: p.slug, title: p.title, short: p.title.length > 26 ? `${p.title.slice(0, 24)}…` : p.title, icon: p.icon, color: p.color,
    window: ({ onClose }) => <PostWindow post={p} onClose={onClose} />,
  })),
];

export default function Blog() {
  return (
    <Interior
      place="theater"
      sub="Blog · Screen 1"
      camera={{ from: [0.5, 1.4, 4.4], to: [5.6, 4.6, 6.6], target: [-0.4, 0.5, -0.4] }}
      limits={{ min: 3, max: 11 }}
      tip="Each poster on the wall is a post. Click one to watch… well, read it."
      items={ITEMS}
      bg="#1a1016"
      light={0.45}
      loading="Dimming the lights…"
    >
      {(open) => <CinemaScene open={open} />}
    </Interior>
  );
}

/** A post on a page of its own, for direct links and for reading at length. */
export function BlogPost() {
  const { slug } = useParams();
  const post = postBySlug[slug];
  useEffect(() => { if (post) document.title = `${post.title} · Raymond Hughes`; }, [post]);
  if (!post) return <Navigate to="/blog" replace />;
  const i = POSTS.indexOf(post);
  const next = POSTS[(i + 1) % POSTS.length];
  return (
    <div className="post-page">
      <nav className="post-nav">
        <Link to="/blog">← Back to the cinema</Link>
        <Link to="/">The city</Link>
      </nav>
      <article className="rw post-article"><Article post={post} /></article>
      <Link className="post-next" to={`/blog/${next.slug}`} style={{ '--c': next.color }}>
        <span>Up next</span>
        <strong>{next.icon} {next.title}</strong>
      </Link>
    </div>
  );
}

import { Suspense, useLayoutEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';

// The city and every interior pull in three.js, so they load on demand and
// the plain version of the site never downloads any of it.
import { City, Resume, House, University, PostOffice, Lot, Blog, BlogPost, Project, ProjectPage } from './routes';

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = '';
  }, [pathname]);
  return null;
}

function canRunCity() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * The front door. The city is the site, but a phone, a browser without
 * WebGL, or someone who asked for less motion gets the plain version, with
 * a way into the city from it. `/?city` always opens the city.
 */
function Front() {
  const { search } = useLocation();
  const asked = new URLSearchParams(search).has('city');
  const small = window.matchMedia('(max-width: 720px)').matches;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canRunCity()) return <Home />;
  if (!asked && (small || calm)) return <Home />;
  return <City />;
}

function Loading() {
  return <div style={{ position: 'fixed', inset: 0, background: '#a9dcff' }} />;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Front />} />
          <Route path="/classic" element={<Home />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/house" element={<House />} />
          <Route path="/university" element={<University />} />
          <Route path="/post-office" element={<PostOffice />} />
          <Route path="/lot-5" element={<Lot />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/projects/:slug" element={<Project />} />
          <Route path="/projects/:slug/story" element={<ProjectPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

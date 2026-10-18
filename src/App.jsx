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
 * The front door. The city is the site, on phones too; only a browser that
 * cannot draw it at all gets the plain version instead.
 */
function Front() {
  return canRunCity() ? <City /> : <Home />;
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

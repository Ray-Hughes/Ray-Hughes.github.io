import { lazy } from 'react';

/* Every page that pulls in three.js, loaded on demand. The loaders are kept
   by name so the city can start fetching a building's page the moment it
   is clicked, while the camera is still flying there; by the time the
   flight lands the page is ready and there is no blank beat between them. */

const load = {
  city: () => import('./pages/City'),
  resume: () => import('./pages/Resume'),
  house: () => import('./pages/House'),
  university: () => import('./pages/University'),
  postOffice: () => import('./pages/PostOffice'),
  lot: () => import('./pages/Lot'),
  blog: () => import('./pages/Blog'),
  project: () => import('./pages/Project'),
  story: () => import('./pages/ProjectPage'),
};

export const City = lazy(load.city);
export const Resume = lazy(load.resume);
export const House = lazy(load.house);
export const University = lazy(load.university);
export const PostOffice = lazy(load.postOffice);
export const Lot = lazy(load.lot);
export const Blog = lazy(load.blog);
export const BlogPost = lazy(() => load.blog().then((m) => ({ default: m.BlogPost })));
export const Project = lazy(load.project);
export const ProjectPage = lazy(load.story);

const BY_ROUTE = [
  [/^\/resume/, load.resume],
  [/^\/house/, load.house],
  [/^\/university/, load.university],
  [/^\/post-office/, load.postOffice],
  [/^\/lot-5/, load.lot],
  [/^\/blog/, load.blog],
  [/^\/projects\/[^/]+$/, load.project],
];

/** Start fetching the code for a route; harmless to call more than once. */
export function preload(route) {
  const hit = BY_ROUTE.find(([re]) => re.test(route));
  if (hit) hit[1]().catch(() => {});
}

export const preloadCity = () => load.city().catch(() => {});

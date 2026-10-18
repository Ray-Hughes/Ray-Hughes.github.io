/* The buildings that open something, what they are called on the map, and
   where they go. Every one has an inside, at `route`. `view` is the
   direction the camera arrives from, picked per building so nothing tall
   stands between the camera and it. */

export const PLACES = [
  { id: 'office', block: 'office', title: 'Hughes Tower', sub: 'Résumé', blurb: 'Step inside and watch the team ship. My résumé is on the big screen.', color: '#3e86c9', icon: '💼', route: '/resume', height: 7.2, aim: 0.8, dist: 6.2 },
  { id: 'hospital', block: 'hospital', title: 'Patientevity General', sub: 'Project · Healthcare EHR', blurb: 'HIPAA-compliant behavioral health EHR, FHIR and HL7, with AI built in.', color: '#4d9fff', icon: '🏥', route: '/projects/patientevity', height: 2.6 },
  { id: 'delphi', block: 'delphi', title: 'Temple of Delphi', sub: 'Project · Agent memory', blurb: 'A project tracker your AI agents keep current, over MCP.', color: '#2bb8c2', icon: '🏛️', route: '/projects/delphi', height: 3.3 },
  { id: 'memophor', block: 'memophor', title: 'Memophor Library', sub: 'Project · Federated memory', blurb: 'Distributed memory for AI agents: graph, edge cache and control plane.', color: '#a855f7', icon: '📚', route: '/projects/memophor', height: 2.9 },
  { id: 'theater', block: 'theater', title: 'The Cinema', sub: 'Blog', blurb: 'Now showing: write-ups on what I built and what I learned building it.', color: '#d7263d', icon: '🎬', route: '/blog', height: 2.8 },
  { id: 'university', block: 'university', title: 'Hughes University', sub: 'Skills', blurb: 'The stack I teach myself and use every day.', color: '#c8613f', icon: '🎓', route: '/university', height: 3.0, view: [-0.5, 0.75, 0.45] },
  { id: 'postoffice', block: 'postoffice', title: 'Post Office', sub: 'Contact', blurb: 'Drop me a line.', color: '#2a6fdb', icon: '✉️', route: '/post-office', height: 2.0, view: [0.05, 0.85, 0.5] },
  { id: 'home', block: 'home', title: "Ray's House", sub: 'About me', blurb: 'Port St. Lucie, Florida. Who I am and how I work.', color: '#2a9d8f', icon: '🏠', route: '/house', height: 1.6, offset: [0.75, 0.75], view: [-0.35, 0.7, 0.62] },
  { id: 'yard', block: 'yard', title: 'Lot 5', sub: 'Coming soon', blurb: 'The next project breaks ground here.', color: '#e9a100', icon: '🚧', route: '/lot-5', height: 2.2 },
];

export const placeById = Object.fromEntries(PLACES.map((p) => [p.id, p]));

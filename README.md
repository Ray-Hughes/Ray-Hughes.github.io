# Ray-Hughes.github.io

Personal site for **Raymond Hughes**, AI Engineer and Solutions Architect.

**Live:** [ray-hughes.github.io](https://ray-hughes.github.io)

---

## A town you can walk round

The home page is a small 3D island town. Every building that matters opens:

| Building                | What is inside                                                    |
|-------------------------|-------------------------------------------------------------------|
| Hughes Tower            | An office floor with the résumé on the big screen, a plaque per job, and a Bug Squash arcade |
| Patientevity General    | A hospital ward: one station per chapter of the Patientevity build |
| Temple of Delphi        | The oracle's sanctum: the Delphi story, station by station        |
| Memophor Library        | Stacks and a memory vault: the Memophor story                     |
| The Cinema              | The blog. Each poster on the wall is a post                       |
| Hughes University       | Skills, taught in Room 101, with a Memory Match flashcard game    |
| Post Office             | Every way to get in touch                                         |
| Ray's House             | About me, and Snake on the living-room TV                         |
| Lot 5                   | Where the next project goes up, and a crane stacking game         |

Cars stop at working signals, people walk the pavements, a train circles the island, boats sail, and the cranes in the projects district never stop.

Phones, browsers without WebGL and anyone who prefers reduced motion get a plain version of the site instead (`/#/classic`), with a way into the city from it. `/#/?city` always opens the city.

---

## Stack

- **React 19** and **Vite 6**
- **three.js** through **@react-three/fiber**, **drei** and **@react-three/postprocessing** (ambient occlusion, bloom, tilt-shift)
- Models from Kenney's CC0 kits, recompressed with meshopt; the landmark buildings are modelled in code (see `public/models/CREDITS.md`)
- Every page that uses three.js is code-split, so the plain version never downloads it

## Layout

```
src/city/     the town: layout, static bake, traffic, people, landmarks, camera
src/scenes/   the interiors: shared stage, hotspots, rooms and their props
src/pages/    one page per route
src/games/    the mini games
src/data/     profile, projects and posts: the content, in one place each
```

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
```

## Deployment

Push to `main`. GitHub Actions builds with Vite and deploys to GitHub Pages.

---

## Contact

- **Email:** raymond.hughes@live.com
- **LinkedIn:** [linkedin.com/in/raymond-h-13838369](https://www.linkedin.com/in/raymond-h-13838369/)
- **GitHub:** [github.com/Ray-Hughes](https://github.com/Ray-Hughes)

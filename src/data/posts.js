/* ─────────────────────────────────────────────────────────────────────
   The blog, as shown in the cinema. Each post is a list of blocks so the
   same words can render in the cinema's reading window and on a plain
   page: { p } a paragraph, { h } a heading, { list } bullets, and
   { code, file } a listing.

   These first four are drawn from building Delphi; every claim in them is
   in the project's own write-up.
───────────────────────────────────────────────────────────────────── */

export const POSTS = [
  {
    slug: 'mcp-server-with-no-dependencies',
    title: 'An MCP server with no dependencies',
    dek: 'Why Delphi speaks JSON-RPC 2.0 by hand, and what the Node it runs under taught me.',
    date: '2026-10-18',
    minutes: 5,
    color: '#2bb8c2',
    icon: '🔌',
    tags: ['MCP', 'Node', 'Delphi'],
    blocks: [
      { p: 'Delphi ships an MCP server with forty-three tools, so Claude Code, GitHub Copilot and anything else that speaks the protocol can read and write the same tracker. It has no runtime dependencies at all. It is written against JSON-RPC 2.0 directly rather than through an SDK, and that was a deliberate choice rather than an accident of getting started.' },
      { h: 'You do not choose the Node' },
      { p: 'An MCP server over stdio is started by the editor, with whatever Node that editor happens to find. Not the version in your project, not the one you tested on: whatever is on the path when the IDE launches. Every dependency is one more thing that has to work on a runtime you never picked, and one more thing an npm bump can break between your machine and someone else’s.' },
      { p: 'JSON-RPC over stdio is small enough to write by hand. Read a line, parse it, dispatch on the method, write a line back. Owning those few dozen lines meant owning every failure mode in them too.' },
      { h: 'The database had the same problem' },
      { p: 'The server needs SQLite. node:sqlite is in-process and fast, and on Windows it is the only route that works at all, because Windows ships no sqlite3 command. But it landed behind a flag in Node 22.5, so on plenty of versions requiring it simply throws. That throw turned out to be the whole feature test:' },
      { file: 'agent/mcp_server.js', code: `function openDatabase() {
  try {
    const { DatabaseSync }
      = require("node:sqlite");
    const handle = new DatabaseSync(DB);
    return {
      kind: "node:sqlite",
      query: (statement) =>
        handle.prepare(statement).all(),
    };
  } catch {
    const binary = findSqlite();
    return { kind: binary,
      query: (s) => viaBinary(binary, s) };
  }
}` },
      { p: 'Prefer the built-in; fall back to the sqlite3 binary where the built-in does not exist. One function, no package, and the server starts on every runtime it is likely to meet.' },
      { h: 'Reproduce it before you fix it' },
      { p: 'The bug that proved the point was in the packaged app: the MCP server inside the installer had not been able to start since 1.3.0. It surfaced in 1.6 because the review gates insisted every bug be reproduced before anyone fixed it, and reproducing it meant running the server the way an editor would, from the shipped bundle, not from a checkout.' },
      { list: ['Write against the protocol when the protocol is small.', 'Treat the runtime as hostile: feature-test, do not version-sniff.', 'Test the thing you ship, launched the way it will really be launched.'] },
    ],
  },
  {
    slug: 'undo-that-cannot-disagree',
    title: 'Undo that cannot disagree with history',
    dek: 'Delphi’s audit log is its undo button. That is the design, not a coincidence.',
    date: '2026-10-18',
    minutes: 4,
    color: '#4d9fff',
    icon: '⏪',
    tags: ['SQLite', 'Data integrity', 'Agents'],
    blocks: [
      { p: 'When AI agents write to the same store as people, mistakes stop being rare. An agent will misread a task, close the wrong thing, or rewrite a note it should have appended to. The question is not whether that happens but what it costs to take back.' },
      { h: 'One mechanism, not two' },
      { p: 'Most apps have an audit log and an undo feature, built separately. The log says what happened; undo tries to work out how to reverse it. Two systems describing the same events will eventually disagree, and when they do, undo does the wrong thing confidently.' },
      { p: 'In Delphi every mutation records the row as it was before the change. Undo is not a second system: it replays that stored state.' },
      { file: 'db.js', code: `function undo(auditId) {
  const entry = one(
    "SELECT * FROM audit WHERE id = :id",
    { id: auditId }
  );
  if (entry.undone) throw new Error(
    "That change has already been undone");

  const table  = TABLES[entry.entity];
  const before = entry.before_json
    ? JSON.parse(entry.before_json) : null;

  if (entry.action === "create") {
    run(\`DELETE FROM \${table}
         WHERE id = :id\`,
      { id: entry.entity_id });
  } else if (entry.action === "update") {
    const cols = Object.keys(before)
      .filter((c) => c !== "id");
    const sets = cols
      .map((c) => \`\${c} = :\${c}\`).join(", ");
    run(\`UPDATE \${table} SET \${sets}
         WHERE id = :id\`,
      { ...before, id: entry.entity_id });
  }
}` },
      { p: 'If a change is in the log it can be reversed, and if it cannot be reversed it is not in the log. There is no third case to reason about.' },
      { h: 'Agents go through the same door' },
      { p: 'The app, the delphi command line and every agent write through one path, and each entry is attributed to whoever made it. So History shows which agent did what, and an agent’s mistake is exactly as recoverable as a person’s. That is what makes it reasonable to let agents write at all.' },
      { h: 'The same instinct, elsewhere' },
      { list: ['Backups run VACUUM INTO rather than copying the file, because recent rows can still be sitting in the write-ahead log and a plain copy loses them silently.', 'Discarding a Workbench first commits the whole folder onto a ref no branch points at, and keeps it for thirty days.', 'Finish refuses while anything is unsaved or unpushed.'] },
      { p: 'The common thread: make losing work structurally impossible, then you do not have to be careful.' },
    ],
  },
  {
    slug: 'a-knowledge-graph-that-refuses-to-guess',
    title: 'A knowledge graph that refuses to guess',
    dek: 'An invented node is worse than a missing one. So Delphi’s graph extraction is deterministic.',
    date: '2026-10-18',
    minutes: 4,
    color: '#a855f7',
    icon: '🕸️',
    tags: ['Knowledge graphs', 'RAG', 'Ollama'],
    blocks: [
      { p: 'Delphi indexes notes and tasks as a graph of entities and the edges between them, so an agent can ask what connects to a thing rather than only what reads similarly to it. The obvious way to build that graph is to hand each note to a model and ask it for entities. I chose not to.' },
      { h: 'Missing versus wrong' },
      { p: 'A missing node returns less. A wrong node returns something false, with the same confidence as everything true around it. For a memory that agents act on, those are not equally bad: the second one sends an agent somewhere confidently mistaken.' },
      { p: 'So extraction matches only shapes that cannot be mistaken for prose, plus a curated vocabulary:' },
      { file: 'oracle.js', code: `// Only shapes that cannot be mistaken
// for prose. Add to the vocabulary rather
// than loosening a pattern: a loose
// pattern produces confident nonsense.

const PATTERNS = [
  { kind: "ticket",
    re: /\\b([A-Z][A-Z0-9]{1,9}-\\d{2,6})\\b/g },
  { kind: "file",
    re: /\\b([\\w./-]+\\.(?:rb|js|py|ya?ml|
         sql|sh|java|json|tf|md))\\b/g },
];` },
      { h: 'Where the graph earns its keep' },
      { p: 'The payoff is multi-hop. A question about a database concern can return a ticket it never mentions, because both were discussed alongside the same pipeline. Similarity search alone would not find it; the shared neighbour does.' },
      { h: 'Degrade, do not disappear' },
      { p: 'Embeddings run locally through Ollama, so nothing leaves the machine. When Ollama is not there, search falls back to lexical matching rather than failing. A memory that works worse is still a memory; one that errors is not.' },
      { list: ['Prefer precision when the reader is an agent that will act on it.', 'Grow the vocabulary, never loosen the pattern.', 'Every capability needs a graceful fallback.'] },
    ],
  },
  {
    slug: 'what-packaging-found',
    title: 'What packaging an Electron app found',
    dek: 'A prototype runs from a checkout. An installer runs from a read-only bundle on someone else’s machine.',
    date: '2026-10-18',
    minutes: 5,
    color: '#e9a100',
    icon: '📦',
    tags: ['Electron', 'Shipping', 'CI'],
    blocks: [
      { p: 'Delphi ships as installers for macOS and Windows from a single tagged release. Getting there surfaced a dozen problems a prototype never would. Most of them were latent bugs all along; packaging just stopped hiding them.' },
      { h: 'The database lived beside the source' },
      { p: 'The app wrote its database next to its own code, which is impossible inside a read-only bundle. Storage moved to per-user directories, with a migration for existing installs so nobody lost their data on upgrade.' },
      { h: 'Windows' },
      { list: ['The MCP server needed a Windows path, and Windows ships no sqlite3 command at all.', 'A frameless window on Windows has no close button, so it needed one of its own.'] },
      { h: 'Apple Silicon will not run an unsigned binary' },
      { p: 'Not a warning, not a prompt: the kernel refuses. Electron arrives ad-hoc signed, but packaging rewrites Info.plist and renames the binary, and either invalidates the signature. So unsigned builds are re-signed ad hoc after packing:' },
      { file: 'tools/after-pack.js', code: `exports.default = async function (context) {
  if (context.electronPlatformName
      !== "darwin") return;
  if (process.env.CSC_LINK) return;

  execFileSync("/usr/bin/codesign", [
    "--force", "--deep",
    "--sign", "-",
    "--timestamp=none",
    appPath,
  ]);
};` },
      { h: 'Two runners, one release' },
      { p: 'An early release shipped without its Windows installer, because the macOS and Windows runners raced to create the same GitHub release. Now both platforms build first, and the release is published only when both succeed.' },
      { p: 'None of these show up while you run the app from a checkout. All of them show up the first time somebody else installs it. Finishing is the rare part, and it is made of exactly these.' },
    ],
  },
];

export const postBySlug = Object.fromEntries(POSTS.map((p) => [p.slug, p]));

export const fmtDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

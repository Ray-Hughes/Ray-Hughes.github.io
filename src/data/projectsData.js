export const PROJECTS_MAP = {
  delphi: {
    id: 'delphi',
    name: 'Delphi',
    orgUrl: 'https://github.com/Ray-Hughes/delphi',
    tagline: 'A Project Tracker Your AI Agents Keep Current',
    color: '#4fd8e0',
    colorDim: 'rgba(79,216,224,0.12)',
    description: 'A desktop tracker where projects hold tasks, memory notes and links, and a knowledge graph sits underneath them. Claude Code and GitHub Copilot read and write the same store over MCP, so what one agent works out survives into the next session. Shipped as installers for macOS and Windows from a single tagged release, with zero runtime dependencies and an audit log that makes every change reversible.',
    repos: [
      { name: 'delphi', label: 'Electron app and MCP server', url: 'https://github.com/Ray-Hughes/delphi' },
      { name: 'agent/mcp_server.js', label: 'JSON-RPC 2.0 over stdio', url: 'https://github.com/Ray-Hughes/delphi/blob/main/agent/mcp_server.js' },
      { name: 'oracle.js', label: 'Knowledge graph extraction', url: 'https://github.com/Ray-Hughes/delphi/blob/main/oracle.js' },
      { name: 'agent/guard.py', label: 'Destructive command guard', url: 'https://github.com/Ray-Hughes/delphi/blob/main/agent/guard.py' },
    ],
    stack: [
      { label: 'Electron 43 + node:sqlite', pct: 92 },
      { label: 'Model Context Protocol', pct: 95 },
      { label: 'Knowledge Graph + Embeddings', pct: 85 },
      { label: 'Ollama (local vectors)', pct: 78 },
      { label: 'electron-builder (mac + win)', pct: 88 },
      { label: 'GitHub Actions release pipeline', pct: 82 },
    ],
    stats: [
      { value: '11', label: 'MCP Tools' },
      { value: '0', label: 'Runtime Deps' },
      { value: '2', label: 'Platforms Shipped' },
      { value: '100%', label: 'Local Data' },
    ],
    diceFacts: [
      'The MCP server has no dependencies at all. It is written against JSON-RPC 2.0 directly rather than through an SDK, so nothing can break it on an npm bump.',
      'It prefers node:sqlite and falls back to the sqlite3 binary, because an editor launches it with whatever Node it happens to have, and Windows ships no sqlite3 command at all.',
      'Graph extraction is deterministic rather than model driven. An invented node is worse than a missing one: a missing node returns less, a wrong node returns something false.',
      'Every write records the row as it was, so undo replays stored state rather than being a second mechanism that can disagree with the first.',
      'The menu bar icon is a simplified silhouette of the logo. The full mark is around forty strokes, and at sixteen pixels they average into a grey lump.',
      'Unsigned macOS builds are still ad-hoc signed, because Apple Silicon refuses to start a binary carrying no signature at all, quarantine or not.',
      'Backups run VACUUM INTO rather than copying the file, since recent rows can still be sitting in the write-ahead log and a plain copy loses them silently.',
    ],
    milestones: [
      {
        number: '01',
        phase: 'PROBLEM',
        title: 'Two Problems, One Tool',
        subtitle: 'Flat lists stop working · Agents start from nothing',
        description: 'Past about thirty items, a flat task list stops telling you which entries belong to the same piece of work. And every session an AI agent re-derives the same things: why an approach was rejected, which value was wrong last time. Those findings live in a chat log nobody reads again. Delphi makes the project the unit, and gives findings somewhere to live that is not a task pretending to be a note.',
        screenshot: '/shots/delphi-overview.png',
        screenshotAlt: 'A Delphi project dashboard showing open, blocked and overdue counts alongside its linked repositories',
        codeFile: 'schema.sql',
        code: `-- A note is a thing you want to remember,
-- not a thing you want to finish. Forcing
-- them into one table is how task lists
-- turn into junk drawers.

CREATE TABLE IF NOT EXISTS notes (
  id         INTEGER PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id)
               ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  kind       TEXT NOT NULL DEFAULT 'note'
    CHECK (kind IN ('note', 'decision',
      'gotcha', 'reference', 'contact')),
  pinned     INTEGER NOT NULL DEFAULT 0
);`,
        tags: ['SQLite', 'Schema Design', 'Product Thinking'],
      },
      {
        number: '02',
        phase: 'THE STORE',
        title: 'Every Change Reversible',
        subtitle: 'Audit trail as the undo mechanism',
        description: 'Every mutation records the row as it was before. Undo is not a second system that can drift out of step with the first: it replays the stored previous state. If a change is in the log it can be reversed, and if it cannot be reversed it is not in the log. Agents write through the same path, so an agent mistake is as recoverable as a human one.',
        screenshot: null,
        screenshotAlt: null,
        codeFile: 'db.js',
        code: `function undo(auditId) {
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
}`,
        tags: ['Audit Log', 'Undo', 'Data Integrity'],
      },
      {
        number: '03',
        phase: 'THE ORACLE',
        title: 'A Graph That Does Not Invent',
        subtitle: 'Deterministic extraction · Local embeddings',
        description: 'Notes and tasks are indexed as a graph of entities and the edges between them, so an agent can ask what connects to a thing rather than only what reads similarly to it. The payoff is multi-hop: a question about a database concern can return a ticket it never mentions, because both were discussed alongside the same pipeline. Extraction matches only shapes that cannot be mistaken for prose, plus a curated vocabulary. Embeddings run locally through Ollama and degrade to lexical search rather than disappearing.',
        screenshot: null,
        screenshotAlt: null,
        codeFile: 'oracle.js',
        code: `// Only shapes that cannot be mistaken
// for prose. Add to the vocabulary rather
// than loosening a pattern: a loose
// pattern produces confident nonsense.

const PATTERNS = [
  { kind: "ticket",
    re: /\\b([A-Z][A-Z0-9]{1,9}-\\d{2,6})\\b/g },
  { kind: "file",
    re: /\\b([\\w./-]+\\.(?:rb|js|py|ya?ml|
         sql|sh|java|json|tf|md))\\b/g },
];

function extract(text) {
  const found = new Map();
  for (const { kind, re } of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      add(kind, m[1], m.index, m[0].length);
    }
  }
  return [...found.values()];
}`,
        tags: ['Knowledge Graph', 'GraphRAG', 'Embeddings', 'Ollama'],
      },
      {
        number: '04',
        phase: 'AGENTS',
        title: 'One Store, Many Agents',
        subtitle: 'MCP over stdio · Zero dependencies',
        description: 'Delphi ships an MCP server exposing eighteen tools, so any agent that speaks the protocol can use it and several can share one store. They coordinate through shared state rather than messages: one writes a task, another picks it up, and both leave a trail attributed to their own actor name. The hard part was portability, since the server runs under whatever Node an editor launched it with.',
        screenshot: '/shots/delphi-memory.png',
        screenshotAlt: 'The Memory tab showing a pinned gotcha and a decision note rendered as prose',
        codeFile: 'agent/mcp_server.js',
        code: `// node:sqlite where it exists: in process,
// and the only route that works on Windows,
// which ships no sqlite3 command. It landed
// behind a flag in Node 22.5, so plenty of
// versions throw here. That throw is the
// whole test.

function openDatabase() {
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
}`,
        tags: ['MCP', 'JSON-RPC 2.0', 'Claude Code', 'Copilot'],
      },
      {
        number: '05',
        phase: 'SAFETY',
        title: 'A Guard for Agents Without Prompts',
        subtitle: 'PreToolUse hook · Intent over spelling',
        description: 'Running an agent with permission prompts disabled leaves nothing between a bad command and the disk. The guard is a PreToolUse hook that denies destructive commands and keeps working when prompts are off, because that is the case it exists for. It matches intent rather than exact spelling, so flags written separately or spaced oddly are still caught, and each command in a compound is judged on its own. Its limit is documented rather than hidden: it inspects text, so it stops accidents, not a determined agent.',
        screenshot: null,
        screenshotAlt: null,
        codeFile: 'agent/guard.py',
        code: `def has_recursive_force(cmd: str) -> bool:
    """True for rm with both recursive and
    force, however the flags are written."""
    if not re.search(r"\\brm\\b", cmd):
        return False
    flags = "".join(
        re.findall(r"\\s-([a-zA-Z]+)", cmd))
    return ("r" in flags.lower()
            and "f" in flags.lower())


def check_segment(cmd: str):
    """Judge one simple command. Returns a
    refusal reason, or None to allow."""
    c = norm(cmd)

    if has_recursive_force(c):
        for target in rm_targets(c):
            clean = target.strip("\\"'")
                          .rstrip("/")
            if clean in PROTECTED_ROOTS:
                return "refusing rm -rf on a
                        protected path"`,
        tags: ['Agent Safety', 'PreToolUse Hook', 'Python', 'CI Tested'],
      },
      {
        number: '06',
        phase: 'SHIPPING',
        title: 'From Checkout to Installer',
        subtitle: 'macOS + Windows · Signed pipeline · Landing page',
        description: 'Packaging surfaced what were really latent bugs. The app wrote its database beside its own source, which is impossible inside a read-only bundle, so storage moved to per-user directories with a migration for existing installs. The MCP server needed a Windows path. A frameless window on Windows has no close button. Releases now build both platforms and publish only when both succeed, after an earlier release shipped without its Windows installer because two runners raced to create it.',
        screenshot: null,
        screenshotAlt: null,
        codeFile: 'tools/after-pack.js',
        code: `// Apple Silicon will not run an executable
// with no signature at all. Not a warning,
// not a prompt: the kernel refuses. Electron
// arrives ad-hoc signed, but packaging
// rewrites Info.plist and renames the binary,
// and either invalidates it.

exports.default = async function (context) {
  if (context.electronPlatformName
      !== "darwin") return;
  if (process.env.CSC_LINK) return;

  execFileSync("/usr/bin/codesign", [
    "--force", "--deep",
    "--sign", "-",
    "--timestamp=none",
    appPath,
  ]);
};`,
        tags: ['electron-builder', 'Code Signing', 'GitHub Actions', 'Cross-platform'],
      },
    ],
  },

  patientevity: {
    id: 'patientevity',
    name: 'Patientevity',
    orgUrl: 'https://github.com/Patientevity',
    tagline: 'Healthcare Intelligence Platform',
    color: '#4d9fff',
    colorDim: 'rgba(77,159,255,0.12)',
    description: 'A suite of HIPAA-compliant tools built for behavioral health — spanning EHR workflows, AI-native project management, outcomes tracking, scheduling, and a desktop AI companion. Multi-tenant Rails 8 architecture with deep LLM integration.',
    repos: [
      { name: 'epicevity', label: 'AI-Native PM', url: 'https://github.com/Patientevity/epicevity' },
      { name: 'ava-plus', label: 'AI Desktop Companion', url: 'https://github.com/Patientevity/ava-plus' },
      { name: 'gacs_pack', label: 'Context Engine', url: 'https://github.com/Patientevity/gacs_pack' },
      { name: 'terminevity', label: 'TUI for AI', url: 'https://github.com/Patientevity/terminevity' },
      { name: 'phlexor', label: 'Service Management', url: 'https://github.com/Patientevity/phlexor' },
    ],
    stack: [
      { label: 'Ruby on Rails 8', pct: 95 },
      { label: 'PostgreSQL + pgvector', pct: 88 },
      { label: 'Claude API (Sonnet)', pct: 85 },
      { label: 'React + TypeScript', pct: 78 },
      { label: 'Turbo + Hotwire', pct: 82 },
      { label: 'Docker + Kamal', pct: 75 },
    ],
    stats: [
      { value: '7', label: 'Years Domain Depth' },
      { value: '5+', label: 'Applications' },
      { value: '100s', label: 'Clinicians Served' },
      { value: 'HIPAA', label: 'Compliant' },
    ],
    diceFacts: [
      'The EHR core handles FHIR R4 and HL7 v2 message parsing for cross-system interoperability.',
      'Epicevity uses Claude Sonnet 4.5 with streaming to generate specification documents in real time.',
      'AVA+ is an Electron app with local file access — AI that lives on your machine, not in a browser tab.',
      'The multi-tenant architecture uses organization-scoped slugs with Pundit policy enforcement on every query.',
      'GACS Pack produces token-budgeted context packs with auditable context_pack_ids for reproducible AI runs.',
      'Terminevity is a TUI built for AI workflows — pipe any CLI tool through a conversational AI layer.',
    ],
    milestones: [
      {
        number: '01',
        phase: 'FOUNDATION',
        title: 'Multi-Tenant EHR Core',
        subtitle: 'Rails 8 · PostgreSQL · Devise · Pundit',
        description: 'Scaffolded the multi-tenant backbone — organization-scoped data isolation, role-based permissions via Pundit, and invitation-based onboarding for clinical staff. Every query is policy-gated, every record is tenant-scoped.',
        screenshot: null,
        screenshotAlt: 'Patientevity Dashboard',
        codeFile: 'app/models/organization.rb',
        code: `class Organization < ApplicationRecord
  has_many :users, through: :memberships
  has_many :projects
  has_many :issues, through: :projects

  validates :name, :slug, presence: true
  validates :slug, uniqueness: true,
    format: { with: /\\A[a-z0-9-]+\\z/ }

  def self.resolve_from_request(request)
    find_by!(slug: request.subdomain)
  rescue ActiveRecord::RecordNotFound
    raise TenantNotFound,
      "unknown tenant: #{request.subdomain}"
  end
end`,
        tags: ['Rails 8', 'Multi-tenant', 'Pundit', 'Devise'],
      },
      {
        number: '02',
        phase: 'CLINICAL CORE',
        title: 'Patient Records & Scheduling',
        subtitle: 'HIPAA · FHIR R4 · HL7 · Real-time',
        description: 'Built the patient management layer — HIPAA-compliant records, provider scheduling with conflict detection, billing with invoice generation, and a real-time chat system for clinical communication. Full FHIR R4 export capability.',
        screenshot: null,
        screenshotAlt: null,
        codeFile: 'app/models/issue.rb',
        code: `class Issue < ApplicationRecord
  belongs_to :project
  belongs_to :assignee, class_name: "User",
    optional: true
  has_many :ai_conversations, as: :conversable
  has_many :artifacts, as: :artifactable

  enum :issue_type,
    { epic: 0, story: 1, task: 2, bug: 3 }
  enum :status,
    { backlog: 0, todo: 1, in_progress: 2,
      in_review: 3, done: 4 }

  def issue_key
    "#{project.key}-#{number}"
  end

  before_validation :assign_number, on: :create
end`,
        tags: ['HIPAA', 'FHIR R4', 'HL7', 'PostgreSQL'],
      },
      {
        number: '03',
        phase: 'AI INTEGRATION',
        title: 'Epicevity — Spec-Driven AI PM',
        subtitle: 'Claude API · Streaming · Turbo Streams',
        description: 'Built Epicevity — the first spec-driven PM platform where the ticket IS the plan. Claude Sonnet streams through four phases: brainstorm → requirements → structure → full spec. Every decision gate requires human approval before AI proceeds.',
        screenshot: null,
        screenshotAlt: 'AI Conversation Interface',
        codeFile: 'app/services/ai/spec_assistant.rb',
        code: `module AI
  class SpecAssistant
    def brainstorm_stream(
      context:, user_message:, &block
    )
      messages = build_conversation_messages(
        context, user_message
      )
      @client.stream_chat(
        messages: messages,
        system: brainstorm_system_prompt(context),
        temperature: 0.8,
        &block
      )
    end

    def gather_requirements(
      context:, user_message:
    )
      @client.chat(
        messages: build_conversation_messages(
          context, user_message
        ),
        system: requirements_system_prompt(context),
        temperature: 0.5
      )
    end
  end
end`,
        tags: ['Claude API', 'Streaming', 'LLM', 'Turbo Streams'],
        interactive: 'ai_chat',
      },
      {
        number: '04',
        phase: 'PATIENTS & BILLING',
        title: 'Clinical Workflows at Scale',
        subtitle: 'Outcomes Tracking · Invoicing · Reporting',
        description: 'Delivered full patient lifecycle management — intake, treatment planning, outcomes measurement, and financial reporting. The billing module generates HIPAA-compliant invoices and tracks payment status with real-time dashboard analytics.',
        screenshot: null,
        screenshotAlt: 'Patient Management',
        codeFile: 'app/controllers/api/v1/customers_controller.rb',
        code: `class Api::V1::CustomersController <
  ApplicationController

  def index
    @customers = Customer.all
    @customers = @customers
      .search(params[:search]) if params[:search]
    @customers = @customers
      .page(params[:page]).per(25)

    render json: {
      customers: CustomerSerializer
        .serialize_collection(@customers),
      meta: {
        current_page:  @customers.current_page,
        total_pages:   @customers.total_pages,
        total_count:   @customers.total_count
      }
    }
  end
end`,
        tags: ['REST API', 'Serializers', 'Pagination', 'Kaminari'],
      },
      {
        number: '05',
        phase: 'INTELLIGENCE LAYER',
        title: 'AVA+ — AI Desktop Companion',
        subtitle: 'Electron · TypeScript · Local File Access · Skills',
        description: 'Built AVA+ — an Electron-based AI companion that lives on your machine. It reads local files, connects to external integrations, and executes "Skills" — modular AI workflows that run locally. No browser tab required.',
        screenshot: null,
        screenshotAlt: 'Analytics & Reports',
        codeFile: 'electron/main.ts',
        code: `import { app, BrowserWindow,
  ipcMain, Tray } from 'electron'
import { setupTray } from './tray'
import { registerSkills } from './skills'

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 420, height: 680,
    frame: false, alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  const tray = setupTray(win)
  await registerSkills(ipcMain)

  win.loadURL(VITE_DEV_SERVER_URL)
})`,
        tags: ['Electron', 'TypeScript', 'AI Skills', 'IPC'],
      },
      {
        number: '06',
        phase: 'PRODUCTION',
        title: 'Deploy & Observability',
        subtitle: 'AWS ECR · Docker · Kamal · OpenTelemetry',
        description: 'Production-hardened with Docker multi-stage builds, AWS ECR for container registry, and Kamal for zero-downtime deploys. OpenTelemetry traces every request from edge to database. Solid Queue handles 50k+ background jobs per day.',
        screenshot: null,
        screenshotAlt: 'Billing & Invoices',
        codeFile: 'config/deploy.yml',
        code: `service: patientevity
image: <ecr>/patientevity

servers:
  web:
    hosts: [<prod-ip>]
    options:
      memory: 2g
  workers:
    hosts: [<prod-ip>]
    cmd: >
      bundle exec rails
      solid_queue:start

accessories:
  postgres:
    image: postgres:16
    env:
      secret: [DATABASE_URL]
  redis:
    image: redis:7-alpine

builder:
  multiarch: false
  remote:
    arch: amd64`,
        tags: ['AWS ECR', 'Docker', 'Kamal', 'Solid Queue'],
        interactive: 'deploy_sim',
      },
    ],
  },

  memophor: {
    id: 'memophor',
    name: 'Memophor',
    orgUrl: 'https://github.com/memophor',
    tagline: 'Federated AI Memory Architecture',
    color: '#a855f7',
    colorDim: 'rgba(168,85,247,0.12)',
    description: 'A distributed AI memory architecture — Knowlemesh serves as the multi-tenant control plane orchestrating policy, lifecycle automation, and governance across SynaGraph (graph memory) and Scedge (edge cache) clusters.',
    repos: [
      { name: 'knowlemesh', label: 'Control Plane', url: 'https://github.com/memophor/knowlemesh' },
      { name: 'synagraph', label: 'Graph Memory', url: 'https://github.com/memophor/synagraph' },
      { name: 'scedge-core', label: 'Edge Cache', url: 'https://github.com/memophor/scedge-core' },
      { name: 'memophor', label: 'Core Engine', url: 'https://github.com/memophor/memophor' },
    ],
    stack: [
      { label: 'Ruby on Rails 7+', pct: 90 },
      { label: 'Graph DB (SynaGraph)', pct: 85 },
      { label: 'Edge Cache (Scedge)', pct: 88 },
      { label: 'REST + Streaming APIs', pct: 92 },
      { label: 'Multi-tenant Orchestration', pct: 80 },
      { label: 'Apache 2.0 Open Source', pct: 100 },
    ],
    stats: [
      { value: '4', label: 'Repositories' },
      { value: 'API-First', label: 'Architecture' },
      { value: 'Multi-tenant', label: 'Control Plane' },
      { value: 'Apache 2.0', label: 'License' },
    ],
    diceFacts: [
      'Knowlemesh uses tenant-scoped provisioning — each AI client gets isolated memory boundaries by design.',
      'Scedge implements a key-based lookup with NotFoundError on cache miss, never returns stale data silently.',
      'SynaGraph stores semantic memory as a graph, enabling relationship-aware retrieval across knowledge nodes.',
      'The control plane dispatches cache directives cross-cluster without each cluster knowing about others.',
      'Every artifact stored has a stable key — retrieval is deterministic and auditable across time.',
      'Knowlemesh integrates billing and observability workflows via standard webhook patterns — no vendor lock-in.',
    ],
    milestones: [
      {
        number: '01',
        phase: 'PROBLEM',
        title: 'Why AI Needs Federated Memory',
        subtitle: 'The missing layer in AI agent architectures',
        description: 'Every AI agent starts fresh. Context windows expire. RAG systems are brittle. Memophor was designed to solve this — a persistent, distributed memory layer that AI agents can write to, read from, and reason about across sessions and systems.',
        screenshot: null,
        codeFile: 'ARCHITECTURE.md',
        code: `# Memophor Memory Architecture

## The Problem
  Agent A:  stores "user prefers X"  → LOST
  Agent B:  needs context from A     → NONE
  Session:  ends, restarts           → BLANK

## The Solution: Federated Mesh
  SynaGraph  → semantic graph storage
  Scedge     → fast edge cache layer
  Knowlemesh → multi-tenant control plane

## Flow
  write(key, artifact)  →  SynaGraph + Scedge
  read(key)             →  Scedge || SynaGraph
  federate(tenant)      →  Knowlemesh dispatch`,
        tags: ['Architecture', 'AI Memory', 'Agent Systems'],
      },
      {
        number: '02',
        phase: 'SCEDGE',
        title: 'Edge Cache Layer Built',
        subtitle: 'Key-based lookup · Purge · Store',
        description: 'Built Scedge-Core — a high-speed edge cache with a clean REST API. Agents store artifacts by key and retrieve them in milliseconds. The client handles NotFoundError as a cache miss signal, transparently falling back to SynaGraph for semantic retrieval.',
        screenshot: null,
        codeFile: 'app/services/edge_cache/client.rb',
        code: `module EdgeCache
  class Client
    def lookup(key:)
      response = request(:get, "/lookup",
        query: { key: key })
      parse_json(response)
    end

    def store(key:, artifact:)
      response = request(:post, "/store",
        body: { key: key, artifact: artifact })
      parse_json(response)
    end

    def purge(keys:)
      response = request(:post, "/purge",
        body: { keys: keys })
      parse_json(response)
    end

    private

    def request(method, path, **opts)
      # ... builds Net::HTTP request
      # raises NotFoundError on 404
      # raises Error on non-2xx
    end
  end
end`,
        tags: ['Edge Cache', 'REST API', 'Ruby', 'Net::HTTP'],
        interactive: 'cache_sim',
      },
      {
        number: '03',
        phase: 'KNOWLEMESH',
        title: 'Control Plane API Launched',
        subtitle: 'Rails 7 · Multi-tenant · Artifact API',
        description: 'Knowlemesh is the nervous system — it orchestrates tenant provisioning, routes cache directives, and manages lifecycle automation across SynaGraph and Scedge clusters. The API-first surface handles lookup, store, and purge with proper error codes.',
        screenshot: null,
        codeFile: 'app/controllers/api/v1/artifacts_controller.rb',
        code: `module Api::V1
  class ArtifactsController <
    ApplicationController

    def lookup
      key = params.require(:key)
      payload = edge_cache.lookup(key: key)
      render json: payload, status: :ok
    rescue EdgeCache::Client::NotFoundError => e
      render json: { error: e.message },
        status: :not_found
    end

    def store
      key      = params.require(:key)
      artifact = params.require(:artifact)
        .permit!.to_h
      payload  = edge_cache.store(
        key: key, artifact: artifact
      )
      render json: payload, status: :created
    end
  end
end`,
        tags: ['Rails API', 'Multi-tenant', 'REST', 'Error Handling'],
      },
      {
        number: '04',
        phase: 'SYNAGRAPH',
        title: 'Semantic Graph Memory',
        subtitle: 'Relationship-aware AI retrieval',
        description: 'SynaGraph stores memory as a directed graph — nodes are knowledge artifacts, edges are semantic relationships. When Scedge misses, agents fall back to SynaGraph for relationship-aware traversal. Memory isn\'t just stored, it\'s connected.',
        screenshot: null,
        codeFile: 'app/models/memory_node.rb',
        code: `class MemoryNode
  attr_reader :key, :payload, :edges

  def initialize(key:, payload:)
    @key     = key
    @payload = payload
    @edges   = []
  end

  def relate_to(other, type:, weight: 1.0)
    @edges << Edge.new(
      source: self,
      target: other,
      type:   type,
      weight: weight
    )
  end

  def traverse(depth: 2, &filter)
    # BFS across semantic edge graph
    visited = Set.new([key])
    queue   = [@edges]
    results = []

    depth.times do
      queue = queue.flat_map do |edges|
        edges.select(&filter).each do |e|
          next if visited.include?(e.target.key)
          visited << e.target.key
          results << e.target
        end
      end
    end
    results
  end
end`,
        tags: ['Graph DB', 'BFS', 'Semantic Memory', 'AI Retrieval'],
      },
      {
        number: '05',
        phase: 'FEDERATION',
        title: 'Cross-Cluster Memory Mesh',
        subtitle: 'Tenant isolation · Policy enforcement · Webhooks',
        description: 'The federated mesh allows multiple AI systems to share memory across organizational boundaries without violating tenant isolation. Knowlemesh dispatches lifecycle events (provision, expire, purge) via webhooks — each cluster remains unaware of others.',
        screenshot: null,
        codeFile: 'app/services/mesh_dispatcher.rb',
        code: `class MeshDispatcher
  EVENTS = %i[provision expire purge sync].freeze

  def dispatch(event:, tenant:, payload: {})
    raise ArgumentError,
      "unknown event: #{event}" unless
      EVENTS.include?(event)

    registered_clusters(tenant).each do |cluster|
      ClusterNotifier.new(cluster).notify(
        event:   event,
        tenant:  tenant.id,
        payload: payload,
        sig:     sign(cluster, payload)
      )
    end

    AuditLog.record(
      event: event, tenant: tenant,
      clusters: cluster_ids(tenant)
    )
  end

  private

  def sign(cluster, payload)
    HMAC::SHA256.sign(
      cluster.webhook_secret,
      payload.to_json
    )
  end
end`,
        tags: ['Webhooks', 'HMAC', 'Audit Log', 'Federated'],
      },
      {
        number: '06',
        phase: 'OPEN SOURCE',
        title: 'Apache 2.0 — Shipped to the World',
        subtitle: 'Docs · Contrib guides · Production-ready',
        description: 'Memophor was open-sourced under Apache 2.0 — the control plane, edge cache, and graph memory layer are all available. Written as a reference architecture for how AI systems should manage persistent, federated memory across agent lifecycles.',
        screenshot: null,
        codeFile: 'knowlemesh/config/routes.rb',
        code: `Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :artifacts,
        only: [:create] do
        collection do
          get  :lookup
          post :purge
        end
      end

      resources :tenants,
        only: [:create, :show, :destroy]

      resources :clusters,
        only: [:index, :create, :destroy]
    end
  end

  get "/health", to: "health#show"
  get "/metrics", to: "metrics#show"
end`,
        tags: ['Apache 2.0', 'Open Source', 'REST Routes', 'Health Checks'],
      },
    ],
  },
};

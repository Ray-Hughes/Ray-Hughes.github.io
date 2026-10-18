/* Who Ray is, in one place. The city's panels, the office's résumé screen
   and the plain text version all read from here, so they cannot drift. */

export const PROFILE = {
  name: 'Raymond Hughes',
  title: 'AI Engineer & Solutions Architect',
  location: 'Port St. Lucie, FL',
  email: 'raymond.hughes@live.com',
  phone: '772-666-1600',
  linkedin: 'https://www.linkedin.com/in/raymond-h-13838369/',
  github: 'https://github.com/Ray-Hughes',
  resume: '/resume.pdf',
  summary:
    'AI Engineer and Solutions Architect with over a decade of Ruby on Rails behind me and deep hands-on work in production agentic systems, LLM integration and event-driven architecture.',
  about: [
    'I am an AI Engineer and Solutions Architect with over a decade of Ruby on Rails behind me and deep hands-on work in production agentic systems, LLM integration and event-driven architecture.',
    'Currently Architect on the VA Appeals modernisation programme alongside Booz Allen Hamilton, owning technical direction across several platforms and leading a team-wide AI tooling transformation. Equally happy designing a system from nothing, aligning stakeholders on a roadmap, or mentoring the engineer next to me.',
    'Seven years of that decade were spent in behavioral health EHR systems, which is where the healthcare depth comes from.',
  ],
  education: { degree: 'B.S. Software Engineering', school: 'Keiser University', note: '3.85 GPA · High Honors' },
  stats: [['10+', 'Years shipping Rails'], ['3+', 'Years AI engineering'], ['1', 'App you can download']],
};

export const EXPERIENCE = [
  {
    company: 'Take2 Consulting, LLC',
    sub: 'U.S. Dept. of Veterans Affairs · Booz Allen Hamilton Partnership',
    role: 'Solutions Architect / AI Engineer Lead',
    period: 'Mar 2023 – Present',
    current: true,
    bullets: [
      'Architect on the VA Appeals program — Caseflow, eFolder Express, Kafka appeals-consumer',
      'Designed autonomous AI agents for test generation, documentation synthesis and PR review',
      'Built the Appeals Agent Toolkit, a shared Copilot config layer standardising AI use across the team',
      'Architected multi-product MCP integration so AI assistants operate with cross-system context',
      'Pioneered anchor comment patterns and led a spec-driven development rollout from day one',
    ],
  },
  {
    company: 'Carepaths Inc.',
    sub: null,
    role: 'Senior Software Engineer',
    period: 'May 2016 – Mar 2023',
    current: false,
    bullets: [
      'Built and scaled a HIPAA-compliant behavioral health EHR serving thousands of clinicians',
      'Delivered full FHIR and HL7 integration with QRDA and CDA import and export',
      'Developed a cross-platform outcomes-tracking mobile app and an in-app fax service',
      'Mentored engineers through coaching, code review and technical guidance',
    ],
  },
  {
    company: 'A1 Roof Trusses',
    sub: null,
    role: 'Software Engineer I',
    period: 'Nov 2014 – Nov 2015',
    current: false,
    bullets: [
      'Developed and maintained proprietary truss design software used in manufacturing',
      'Managed connected device network infrastructure across the organisation',
    ],
  },
  {
    company: 'Cypress Communications Inc.',
    sub: null,
    role: 'Systems Engineer',
    period: 'Oct 2006 – May 2013',
    current: false,
    bullets: [
      'Installed and maintained commercial VoIP and cable systems for enterprise clients',
      'Managed customer relationships and resolved technical escalations',
    ],
  },
];

export const SKILLS = [
  { cat: 'AI & Agents', color: '#0ea5c6', items: ['LLM Integration', 'Agentic Pipelines', 'MCP', 'Claude Code', 'GitHub Copilot', 'RAG', 'Knowledge Graphs', 'Prompt Engineering', 'Spec-Driven Development'] },
  { cat: 'Backend', color: '#7c5cf0', items: ['Ruby on Rails', 'Apache Kafka', 'SQS / Shoryuken', 'Event-Driven Architecture', 'REST APIs', 'PostgreSQL', 'SQLite'] },
  { cat: 'Frontend', color: '#16a34a', items: ['JavaScript', 'React', 'Electron', 'HTML / CSS'] },
  { cat: 'Cloud & DevOps', color: '#ea7a1a', items: ['AWS (EC2, S3)', 'Docker', 'GitHub Actions', 'Dynatrace', 'New Relic', 'OpenTelemetry'] },
  { cat: 'Healthcare', color: '#2f7fe0', items: ['HIPAA', 'HL7', 'FHIR', 'QRDA / CDA', 'VBMS Architecture'] },
  { cat: 'Leadership', color: '#db2777', items: ['Technical Architecture', 'Team Mentorship', 'Agile / Scrum', 'Stakeholder Alignment'] },
];

export const PROJECT_CARDS = [
  { slug: 'delphi', name: 'Delphi', tagline: 'A project tracker your AI agents keep current', color: '#2bb8c2', building: 'Temple of Delphi' },
  { slug: 'patientevity', name: 'Patientevity', tagline: 'Healthcare & AI tooling platform', color: '#4d9fff', building: 'Patientevity General' },
  { slug: 'memophor', name: 'Memophor', tagline: 'Federated AI memory architecture', color: '#a855f7', building: 'Memophor Library' },
];

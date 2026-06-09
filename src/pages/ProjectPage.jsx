import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PROJECTS_MAP } from '../data/projectsData';

/* ── helpers ──────────────────────────────────────────────────────── */

const C = {
  bg:    '#020c1b',
  bg2:   '#071222',
  card:  'rgba(11,26,46,0.9)',
  text:  '#ccd6f6',
  text2: '#8892b0',
  text3: '#4a5874',
};

function useRevealRefs() {
  const revealRef = useCallback(node => {
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { node.classList.add('pp-visible'); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(node);
  }, []);
  return revealRef;
}

/* ── Syntax highlighter (minimal, inline) ─────────────────────────── */
function highlight(code, color) {
  const keywords = /\b(class|module|def|end|do|return|if|unless|rescue|raise|then|else|begin|self|true|false|nil|require|include|attr_reader|enum|validates|belongs_to|has_many|through|before_action|render|redirect_to|namespace|resources|get|post|let|import|export|const|async|await|function|from|new|this|private)\b/g;
  const strings  = /(['"`])(?:(?!\1)[^\\]|\\.)*?\1/g;
  const comments = /#.*/g;
  const numbers  = /\b\d+(\.\d+)?\b/g;
  const methods  = /(\w+)(?=\()/g;
  const symbols  = /:\w+/g;

  return code
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(comments,  m => `<span style="color:#4a6080;font-style:italic">${m}</span>`)
    .replace(strings,   m => `<span style="color:#98d982">${m}</span>`)
    .replace(keywords,  m => `<span style="color:${color};font-weight:600">${m}</span>`)
    .replace(symbols,   m => `<span style="color:#e5c07b">${m}</span>`)
    .replace(methods,   m => `<span style="color:#61afef">${m}</span>`)
    .replace(numbers,   m => `<span style="color:#d19a66">${m}</span>`);
}

/* ── 3D Dice ──────────────────────────────────────────────────────── */
function Dice({ facts, color }) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace]       = useState(0);
  const [fact, setFact]       = useState(facts[0]);
  const [shown, setShown]     = useState(false);

  const rotations = [
    'rotateX(0deg)   rotateY(0deg)',
    'rotateX(-90deg) rotateY(0deg)',
    'rotateX(90deg)  rotateY(0deg)',
    'rotateX(0deg)   rotateY(-90deg)',
    'rotateX(0deg)   rotateY(90deg)',
    'rotateX(180deg) rotateY(0deg)',
  ];
  const dots = [1,2,3,4,5,6];

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setShown(false);
    const next = Math.floor(Math.random() * 6);
    setTimeout(() => {
      setFace(next);
      setFact(facts[next]);
      setRolling(false);
      setShown(true);
    }, 800);
  };

  const faces = dots.map(n => (
    <div key={n} style={{
      position:'absolute', width:60, height:60,
      background: `linear-gradient(135deg, ${C.bg2}, ${C.card})`,
      border: `1px solid ${color}44`,
      borderRadius: 8,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: '1.4rem', fontWeight: 900, color,
      fontFamily: 'var(--font-display)',
      backfaceVisibility:'hidden',
      ...faceStyle(n),
    }}>{n}</div>
  ));

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem', padding:'2rem', background: C.card, border:`1px solid ${color}22`, borderRadius:12 }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:`${color}99`, letterSpacing:'0.25em', textTransform:'uppercase' }}>
        // roll for a tech fact
      </div>

      {/* Dice scene */}
      <div style={{ perspective:300 }}>
        <div
          onClick={roll}
          style={{
            width:60, height:60, position:'relative',
            transformStyle:'preserve-3d',
            transform: rotations[face],
            transition: rolling ? 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)' : 'transform 0.3s ease',
            cursor: rolling ? 'wait' : 'pointer',
          }}
        >
          {faces}
        </div>
      </div>

      <button onClick={roll} disabled={rolling} style={{
        fontFamily:'var(--font-mono)', fontSize:'0.68rem', letterSpacing:'0.15em',
        textTransform:'uppercase', padding:'0.5rem 1.5rem',
        background: rolling ? `${color}22` : `${color}18`,
        border:`1px solid ${color}44`, color,
        borderRadius:4, cursor: rolling ? 'wait' : 'pointer',
        transition:'all 0.2s',
      }}>
        {rolling ? 'Rolling...' : `Roll D${face+1}`}
      </button>

      <div style={{
        maxWidth:380, textAlign:'center',
        fontFamily:'var(--font-mono)', fontSize:'0.78rem',
        color: shown ? C.text : 'transparent',
        lineHeight:1.7, transition:'color 0.5s ease',
        minHeight:'3em',
        padding:'0.75rem 1rem',
        background: shown ? `${color}08` : 'transparent',
        border: shown ? `1px solid ${color}22` : '1px solid transparent',
        borderRadius:6,
        transition:'all 0.4s ease',
      }}>
        {shown && <span style={{color}}>//&nbsp;</span>}
        {shown ? fact : 'Click Roll to reveal a tech fact'}
      </div>
    </div>
  );
}

function faceStyle(n) {
  const s = 30; // half size
  switch(n) {
    case 1: return { transform:'translateZ(30px)' };
    case 2: return { transform:'rotateX(90deg)  translateZ(30px)' };
    case 3: return { transform:'rotateY(-90deg) translateZ(30px)' };
    case 4: return { transform:'rotateY(90deg)  translateZ(30px)' };
    case 5: return { transform:'rotateX(-90deg) translateZ(30px)' };
    case 6: return { transform:'rotateX(180deg) translateZ(30px)' };
  }
}

/* ── AI Chat Sim ──────────────────────────────────────────────────── */
const CHAT_RESPONSES = {
  'default': `[ BRAINSTORM PHASE ]

Analyzing request...

• Breaking feature into spec components
• Identifying edge cases and dependencies
• Generating implementation blueprint

\`\`\`
SPEC-001: Feature Analysis
──────────────────────────
Scope:     Defined
Approach:  Multi-step validation
Risk:      Low — follows existing patterns
Next:      Requirements gathering phase
\`\`\`

Human approval required to proceed to requirements.`,
  'auth': `[ REQUIREMENTS PHASE ]

Analyzing authentication requirements...

Spec EPC-042: Authentication System
────────────────────────────────────
• Devise + OmniAuth integration
• Session timeout: 8h clinical sessions
• 2FA required for admin roles
• Audit log: every login/logout event
• HIPAA §164.312(a)(1): Access control ✓

Implementation ready. Awaiting approval.`,
  'api': `[ STRUCTURING PHASE ]

Generating API specification...

\`\`\`ruby
# Generated spec: EPC-089
module Api::V1
  class ResourceController
    before_action :authenticate!
    before_action :verify_org_scope

    # HIPAA audit trail on all writes
    after_action :log_access_event
  end
end
\`\`\`

4 subtasks created. Assign to sprint?`,
};

function AiChatSim({ color }) {
  const [messages, setMessages] = useState([
    { role:'system', content:'Epicevity AI Spec Assistant — type a feature request to begin spec generation.' }
  ]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const scrollRef                = useRef(null);

  const send = () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role:'user', content: userMsg }]);
    setTyping(true);

    const key = userMsg.toLowerCase().includes('auth') ? 'auth'
              : userMsg.toLowerCase().includes('api')  ? 'api'
              : 'default';

    let response = CHAT_RESPONSES[key];
    let displayed = '';
    let idx = 0;
    setMessages(m => [...m, { role:'assistant', content:'' }]);

    const interval = setInterval(() => {
      if (idx >= response.length) { clearInterval(interval); setTyping(false); return; }
      displayed += response[idx++];
      setMessages(m => {
        const copy = [...m];
        copy[copy.length-1] = { role:'assistant', content: displayed };
        return copy;
      });
    }, 12);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div style={{ background: C.bg2, border:`1px solid ${color}33`, borderRadius:10, overflow:'hidden', maxWidth:600 }}>
      <div style={{ padding:'0.75rem 1rem', borderBottom:`1px solid ${color}22`, display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}` }} />
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:`${color}aa`, letterSpacing:'0.15em' }}>EPICEVITY SPEC ASSISTANT v1.0</span>
      </div>
      <div ref={scrollRef} style={{ height:260, overflowY:'auto', padding:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            fontFamily:'var(--font-mono)', fontSize:'0.72rem', lineHeight:1.7,
            color: msg.role==='assistant' ? C.text : msg.role==='user' ? color : C.text3,
            padding: msg.role!=='system' ? '0.5rem 0.75rem' : 0,
            background: msg.role==='assistant' ? `${color}08` : msg.role==='user' ? `${color}12` : 'transparent',
            borderLeft: msg.role==='assistant' ? `2px solid ${color}44` : 'none',
            borderRadius: msg.role!=='system' ? 4 : 0,
            whiteSpace:'pre-wrap',
          }}>
            {msg.role==='user' && <span style={{opacity:0.6}}>{'> '}</span>}
            {msg.content}
            {msg.role==='assistant' && typing && i===messages.length-1 && (
              <span style={{ display:'inline-block', width:2, height:'0.9em', background:color, marginLeft:2, animation:'blink 0.8s step-end infinite', verticalAlign:'text-bottom' }}/>
            )}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', borderTop:`1px solid ${color}22` }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && send()}
          placeholder="Describe a feature to spec out..."
          style={{
            flex:1, background:'transparent', border:'none', outline:'none',
            fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:C.text,
            padding:'0.75rem 1rem',
          }}
        />
        <button onClick={send} disabled={typing} style={{
          fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.1em',
          padding:'0 1.25rem', background: typing ? `${color}18` : `${color}25`,
          border:'none', color, cursor: typing ? 'wait' : 'pointer',
          borderLeft:`1px solid ${color}22`,
        }}>
          {typing ? '...' : 'SEND →'}
        </button>
      </div>
    </div>
  );
}

/* ── Edge Cache Sim ───────────────────────────────────────────────── */
const CACHE_DATA = {
  'user:prefs:42': { name:'Alex Chen', preference:'concise', model:'sonnet', context_limit:8192 },
  'conv:session:99f1': { phase:'requirements', turns:7, last_intent:'auth_spec', pending_approval:true },
  'artifact:spec:EPC-042': { title:'Auth System Spec', status:'approved', story_points:13, assignee:'unassigned' },
  'mesh:tenant:acme': { clusters:['synagraph-1','scedge-us-east'], provisioned:'2025-10-01', plan:'enterprise' },
};

function CacheSim({ color }) {
  const [key, setKey]       = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const lookup = () => {
    if (!key.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const hit = CACHE_DATA[key.trim()];
      if (hit) { setResult(hit); setStatus('HIT'); }
      else { setResult(null); setStatus('MISS'); }
      setLoading(false);
    }, 600);
  };

  const exampleKeys = Object.keys(CACHE_DATA);

  return (
    <div style={{ background: C.bg2, border:`1px solid ${color}33`, borderRadius:10, overflow:'hidden', maxWidth:600 }}>
      <div style={{ padding:'0.75rem 1rem', borderBottom:`1px solid ${color}22`, display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}` }} />
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:`${color}aa`, letterSpacing:'0.15em' }}>SCEDGE EDGE CACHE — LIVE SIMULATOR</span>
      </div>

      <div style={{ padding:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:C.text3 }}>
          Try a key:&nbsp;
          {exampleKeys.map(k => (
            <button key={k} onClick={() => setKey(k)} style={{
              fontFamily:'var(--font-mono)', fontSize:'0.6rem', color, background:`${color}12`,
              border:`1px solid ${color}33`, borderRadius:4, padding:'0.1rem 0.4rem',
              cursor:'pointer', marginRight:'0.4rem', marginBottom:'0.25rem',
            }}>{k}</button>
          ))}
        </div>

        <div style={{ display:'flex', gap:'0.5rem' }}>
          <input value={key} onChange={e => setKey(e.target.value)} onKeyDown={e => e.key==='Enter' && lookup()}
            placeholder="Enter cache key..."
            style={{
              flex:1, background:`${color}08`, border:`1px solid ${color}33`, borderRadius:4,
              fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:C.text,
              padding:'0.5rem 0.75rem', outline:'none',
            }}
          />
          <button onClick={lookup} disabled={loading} style={{
            fontFamily:'var(--font-mono)', fontSize:'0.68rem', letterSpacing:'0.12em',
            padding:'0.5rem 1rem', background:`${color}22`, border:`1px solid ${color}44`,
            color, borderRadius:4, cursor: loading ? 'wait' : 'pointer',
          }}>
            {loading ? '...' : 'LOOKUP'}
          </button>
        </div>

        {status && (
          <div style={{
            padding:'0.75rem', borderRadius:6,
            background: status==='HIT' ? 'rgba(0,255,136,0.06)' : 'rgba(255,100,100,0.06)',
            border:`1px solid ${status==='HIT' ? '#00ff8844' : '#ff666644'}`,
          }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.2em', color: status==='HIT' ? '#00ff88' : '#ff6666', marginBottom:'0.5rem' }}>
              CACHE {status} — {status==='HIT' ? '~2ms' : '404: key not found'}
            </div>
            {result && (
              <pre style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:C.text, margin:0, whiteSpace:'pre-wrap', lineHeight:1.6 }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Deploy Sim ───────────────────────────────────────────────────── */
const DEPLOY_STEPS = [
  { delay:0,   text:'$ kamal deploy', color:'#00d4ff' },
  { delay:300, text:'  → Pulling image from ECR...', color:'#8892b0' },
  { delay:800, text:'  ✓  Image pulled  [2.1s]', color:'#00ff88' },
  { delay:1200,text:'  → Running pre-deploy hooks...', color:'#8892b0' },
  { delay:1700,text:'  ✓  Migrations complete  [0.8s]', color:'#00ff88' },
  { delay:2000,text:'  → Starting new container...', color:'#8892b0' },
  { delay:2600,text:'  ✓  Health check passed  [/up 200 OK]', color:'#00ff88' },
  { delay:3100,text:'  → Switching traffic...', color:'#8892b0' },
  { delay:3500,text:'  ✓  Zero-downtime deploy complete', color:'#00ff88' },
  { delay:3800,text:'  ✓  Solid Queue workers restarted', color:'#00ff88' },
  { delay:4200,text:'', color:'#8892b0' },
  { delay:4300,text:'🚀 Deployed to production in 4.3s', color:'#00d4ff' },
];

function DeploySim({ color }) {
  const [lines, setLines]   = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone]     = useState(false);
  const scrollRef            = useRef(null);

  const run = () => {
    if (running) return;
    setRunning(true); setDone(false); setLines([]);
    DEPLOY_STEPS.forEach(({ delay, text, color: c }) => {
      setTimeout(() => {
        setLines(l => [...l, { text, color: c }]);
        if (scrollRef.current) scrollRef.current.scrollTop = 9999;
      }, delay);
    });
    setTimeout(() => { setRunning(false); setDone(true); }, 4600);
  };

  return (
    <div style={{ background:'#020c1b', border:`1px solid ${color}33`, borderRadius:10, overflow:'hidden', maxWidth:560 }}>
      <div style={{ padding:'0.6rem 1rem', borderBottom:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:'0.4rem' }}>
          {['#ff5f57','#febc2e','#28c840'].map(c=>(
            <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }} />
          ))}
        </div>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:C.text3 }}>kamal — deploy</span>
        <div/>
      </div>
      <div ref={scrollRef} style={{ height:200, overflowY:'auto', padding:'0.75rem 1rem', display:'flex', flexDirection:'column', gap:'0.2rem' }}>
        {lines.map((l,i)=>(
          <div key={i} style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:l.color, whiteSpace:'pre' }}>{l.text}</div>
        ))}
        {running && lines.length < DEPLOY_STEPS.length && (
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:C.text3 }}>
            <span style={{ animation:'blink 1s step-end infinite' }}>█</span>
          </div>
        )}
      </div>
      <div style={{ padding:'0.75rem 1rem', borderTop:`1px solid ${color}22` }}>
        <button onClick={run} disabled={running} style={{
          fontFamily:'var(--font-mono)', fontSize:'0.68rem', letterSpacing:'0.12em',
          padding:'0.5rem 1.5rem', background: done ? `${color}22` : `${color}18`,
          border:`1px solid ${color}44`, color, borderRadius:4,
          cursor: running ? 'wait' : 'pointer', transition:'all 0.2s',
        }}>
          {running ? 'Deploying...' : done ? '✓ Run Again' : '🚀 Deploy to Production'}
        </button>
        {done && <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'#00ff88', marginLeft:'1rem' }}>All systems go ✓</span>}
      </div>
    </div>
  );
}

/* ── Code Block ───────────────────────────────────────────────────── */
function CodeBlock({ code, filename, color }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(()=>setCopied(false),1500); });
  };

  return (
    <div style={{ background:'#010810', border:`1px solid ${color}28`, borderRadius:8, overflow:'hidden', position:'relative' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0.75rem', background:`${color}08`, borderBottom:`1px solid ${color}18` }}>
        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
          {['#ff5f57','#febc2e','#28c840'].map(c=>(
            <div key={c} style={{ width:9, height:9, borderRadius:'50%', background:c }} />
          ))}
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:C.text3, marginLeft:'0.5rem' }}>{filename}</span>
        </div>
        <button onClick={copy} style={{
          fontFamily:'var(--font-mono)', fontSize:'0.58rem', color: copied ? '#00ff88' : C.text3,
          background:'transparent', border:'none', cursor:'pointer', letterSpacing:'0.1em',
        }}>
          {copied ? 'COPIED ✓' : 'COPY'}
        </button>
      </div>
      <pre style={{ margin:0, padding:'1rem', overflowX:'auto', lineHeight:1.65, fontSize:'0.72rem', fontFamily:'var(--font-mono)' }}
        dangerouslySetInnerHTML={{ __html: highlight(code, color) }}
      />
    </div>
  );
}

/* ── Milestone Card ───────────────────────────────────────────────── */
function Milestone({ milestone, index, color, isLeft, revealRef }) {
  const visual = milestone.screenshot
    ? <img src={milestone.screenshot} alt={milestone.screenshotAlt}
        style={{ width:'100%', borderRadius:8, border:`1px solid ${color}28`, display:'block', boxShadow:`0 0 40px ${color}18` }} />
    : <CodeBlock code={milestone.code} filename={milestone.codeFile} color={color} />;

  const desc = (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      <div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:`${color}88`, letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:'0.4rem' }}>
          {milestone.phase}
        </div>
        <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(1.1rem,2.5vw,1.4rem)', fontWeight:800, color:'#fff', lineHeight:1.2 }}>
          {milestone.title}
        </h3>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:color, marginTop:'0.3rem' }}>
          {milestone.subtitle}
        </div>
      </div>
      <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.78rem', color:C.text2, lineHeight:1.8 }}>
        {milestone.description}
      </p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
        {milestone.tags.map(t => (
          <span key={t} style={{
            fontFamily:'var(--font-mono)', fontSize:'0.6rem', padding:'0.2rem 0.65rem',
            border:`1px solid ${color}30`, color:`${color}cc`, borderRadius:99,
            background:`${color}08`,
          }}>{t}</span>
        ))}
      </div>
    </div>
  );

  const left  = isLeft ? visual : desc;
  const right = isLeft ? desc   : visual;

  return (
    <div ref={revealRef} className="pp-reveal" style={{ position:'relative', marginBottom:'clamp(3rem,8vw,5rem)' }}>
      {/* Milestone number behind */}
      <div style={{
        position:'absolute',
        left: isLeft ? 'auto' : '-0.5rem',
        right: isLeft ? '-0.5rem' : 'auto',
        top:'-1rem',
        fontFamily:'var(--font-display)', fontSize:'clamp(4rem,10vw,7rem)',
        fontWeight:900, color:`${color}06`, lineHeight:1, pointerEvents:'none',
        userSelect:'none', zIndex:0,
      }}>{milestone.number}</div>

      <div style={{ position:'relative', zIndex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(1.5rem,4vw,3rem)', alignItems:'start' }}>
        {left}
        {right}
      </div>

      {/* Interactive element */}
      {milestone.interactive === 'ai_chat' && (
        <div style={{ marginTop:'2rem' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:`${color}77`, letterSpacing:'0.2em', marginBottom:'1rem' }}>
            // Try the spec assistant — type any feature request
          </div>
          <AiChatSim color={color} />
        </div>
      )}
      {milestone.interactive === 'deploy_sim' && (
        <div style={{ marginTop:'2rem' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:`${color}77`, letterSpacing:'0.2em', marginBottom:'1rem' }}>
            // Simulate a zero-downtime Kamal deploy
          </div>
          <DeploySim color={color} />
        </div>
      )}
      {milestone.interactive === 'cache_sim' && (
        <div style={{ marginTop:'2rem', display:'grid', gridTemplateColumns:'1fr', gap:'1rem' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:`${color}77`, letterSpacing:'0.2em' }}>
            // Live edge cache simulator — try a lookup
          </div>
          <CacheSim color={color} />
        </div>
      )}
    </div>
  );
}

/* ── Progress Tracker ─────────────────────────────────────────────── */
function ProgressTracker({ milestones, activeIdx, color }) {
  return (
    <div style={{
      position:'fixed', right:'clamp(0.75rem,2vw,1.5rem)', top:'50%',
      transform:'translateY(-50%)', zIndex:50,
      display:'flex', flexDirection:'column', gap:'0.5rem', alignItems:'center',
    }}>
      {milestones.map((m, i) => (
        <div key={i} title={m.title} style={{
          width: i===activeIdx ? 8 : 5,
          height: i===activeIdx ? 8 : 5,
          borderRadius:'50%',
          background: i<=activeIdx ? color : C.text3,
          boxShadow: i===activeIdx ? `0 0 10px ${color}` : 'none',
          transition:'all 0.3s ease',
          cursor:'pointer',
        }} onClick={() => document.getElementById(`milestone-${i}`)?.scrollIntoView({behavior:'smooth'})} />
      ))}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────── */
export default function ProjectPage() {
  const { slug }             = useParams();
  const project              = PROJECTS_MAP[slug];
  const revealRef            = useRevealRefs();
  const [activeMilestone, setActiveMilestone] = useState(0);
  const milestoneRefs        = useRef([]);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // Inject CSS for reveal animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .pp-reveal { opacity:0; transform:translateY(32px); transition:opacity 0.7s ease,transform 0.7s ease; }
      .pp-visible { opacity:1; transform:translateY(0); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Track active milestone via IntersectionObserver
  useEffect(() => {
    if (!project) return;
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt(e.target.dataset.idx);
            if (!isNaN(idx)) setActiveMilestone(idx);
          }
        });
      },
      { threshold: 0.4 }
    );
    const nodes = document.querySelectorAll('[data-milestone-idx]');
    nodes.forEach(n => obs.observe(n));
    return () => obs.disconnect();
  }, [slug]);

  if (!project) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem' }}>
        <div style={{ fontFamily:'var(--font-display)', color:'#00d4ff', fontSize:'1.5rem' }}>PROJECT NOT FOUND</div>
        <Link to="/" style={{ fontFamily:'var(--font-mono)', color:'#8892b0', fontSize:'0.8rem' }}>← Back to portfolio</Link>
      </div>
    );
  }

  const { color, colorDim } = project;

  return (
    <div style={{ background:C.bg, color:C.text, minHeight:'100vh', overflowX:'hidden' }}>
      {/* Back nav */}
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100, height:56,
        background:'rgba(2,12,27,0.92)', backdropFilter:'blur(16px)',
        borderBottom:`1px solid ${color}18`,
        display:'flex', alignItems:'center', padding:'0 clamp(1rem,4vw,3rem)',
        justifyContent:'space-between',
      }}>
        <Link to="/" style={{
          fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:C.text2,
          letterSpacing:'0.1em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:'0.5rem',
          transition:'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = color}
        onMouseLeave={e => e.currentTarget.style.color = C.text2}
        >
          ← Portfolio
        </Link>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'0.85rem', color, fontWeight:700, letterSpacing:'0.1em' }}>
          {project.name}
        </div>
        <a href={project.orgUrl} target="_blank" rel="noopener noreferrer" style={{
          fontFamily:'var(--font-mono)', fontSize:'0.68rem', letterSpacing:'0.12em',
          padding:'0.35rem 0.85rem', border:`1px solid ${color}44`, color,
          borderRadius:3, transition:'all 0.2s', textTransform:'uppercase',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${color}15`; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          GitHub ↗
        </a>
      </div>

      {/* Hero */}
      <section style={{
        paddingTop:'clamp(5rem,12vw,9rem)',
        paddingBottom:'clamp(3rem,8vw,6rem)',
        padding:'clamp(5rem,12vw,9rem) clamp(1rem,6vw,5rem) clamp(3rem,6vw,5rem)',
        maxWidth:1100, margin:'0 auto',
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(2rem,5vw,4rem)', alignItems:'center',
      }}>
        {/* Left: title + repos */}
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:`${color}66`, letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:'1rem' }}>
            OPEN SOURCE PROJECT
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.5rem,6vw,4.5rem)', fontWeight:900, color:'#fff', letterSpacing:'0.06em', lineHeight:1, marginBottom:'1rem', textShadow:`0 0 60px ${color}30` }}>
            {project.name.toUpperCase()}
          </h1>
          <div style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(0.9rem,2vw,1.1rem)', color, fontWeight:600, marginBottom:'1.5rem' }}>
            {project.tagline}
          </div>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.8rem', color:C.text2, lineHeight:1.8, marginBottom:'2rem' }}>
            {project.description}
          </p>

          {/* Repo links */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {project.repos.map(r => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display:'flex', alignItems:'center', gap:'0.75rem',
                  fontFamily:'var(--font-mono)', fontSize:'0.7rem',
                  padding:'0.5rem 0.75rem', background:`${color}08`,
                  border:`1px solid ${color}22`, borderRadius:5,
                  transition:'all 0.2s', color:C.text2,
                }}
                onMouseEnter={e => { e.currentTarget.style.background=`${color}15`; e.currentTarget.style.borderColor=`${color}44`; e.currentTarget.style.color=color; }}
                onMouseLeave={e => { e.currentTarget.style.background=`${color}08`; e.currentTarget.style.borderColor=`${color}22`; e.currentTarget.style.color=C.text2; }}
              >
                <span style={{ color, fontSize:'0.7rem' }}>⎔</span>
                <span style={{ color, fontWeight:500 }}>{r.name}</span>
                <span style={{ opacity:0.5 }}>—</span>
                <span>{r.label}</span>
                <span style={{ marginLeft:'auto', opacity:0.4 }}>↗</span>
              </a>
            ))}
          </div>
        </div>

        {/* Right: dice + stack bars */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          <Dice facts={project.diceFacts} color={color} />

          {/* Stack bars */}
          <div style={{ background:C.card, border:`1px solid ${color}18`, borderRadius:8, padding:'1.25rem' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:`${color}66`, letterSpacing:'0.2em', marginBottom:'1rem' }}>// TECH STACK</div>
            {project.stack.map(({ label, pct }) => (
              <div key={label} style={{ marginBottom:'0.6rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.2rem' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:C.text2 }}>{label}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:`${color}88` }}>{pct}%</span>
                </div>
                <div style={{ height:3, background:`${color}15`, borderRadius:99 }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${color},${color}88)`, borderRadius:99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div ref={revealRef} className="pp-reveal" style={{ maxWidth:1100, margin:'0 auto', padding:'0 clamp(1rem,6vw,5rem)', marginBottom:'clamp(3rem,8vw,6rem)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'1rem' }}>
          {project.stats.map(({ value, label }) => (
            <div key={label} style={{ padding:'1.25rem', background:C.card, border:`1px solid ${color}18`, borderRadius:8, textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:900, color, lineHeight:1 }}>{value}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:C.text2, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:'0.4rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 clamp(1rem,6vw,5rem)', marginBottom:'clamp(3rem,8vw,5rem)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${color}44)` }} />
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:`${color}66`, letterSpacing:'0.25em', textTransform:'uppercase' }}>
            BUILD TIMELINE
          </div>
          <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${color}44,transparent)` }} />
        </div>
      </div>

      {/* Winding road milestones */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 clamp(1rem,6vw,5rem)', position:'relative' }}>
        {/* Vertical road line */}
        <div style={{
          position:'absolute', left:'50%', top:0, bottom:0, width:1,
          background:`linear-gradient(to bottom,${color}44,${color}22,transparent)`,
          transform:'translateX(-50%)', pointerEvents:'none',
          display:'none', // visible only on desktop via style tag below
        }} />

        {project.milestones.map((m, i) => (
          <div key={i} id={`milestone-${i}`} data-milestone-idx={i}>
            <Milestone
              milestone={m}
              index={i}
              color={color}
              isLeft={i % 2 === 0}
              revealRef={revealRef}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign:'center', padding:'clamp(3rem,8vw,6rem) 1rem' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:C.text3, marginBottom:'2rem', letterSpacing:'0.1em' }}>
          // {project.milestones.length} milestones · Open source · Built by Raymond Hughes
        </div>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <a href={project.orgUrl} target="_blank" rel="noopener noreferrer" style={{
            fontFamily:'var(--font-mono)', fontSize:'0.72rem', letterSpacing:'0.12em',
            padding:'0.75rem 2rem', background:`${color}18`, border:`1px solid ${color}44`,
            color, borderRadius:4, transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background=`${color}28`; e.currentTarget.style.transform='translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background=`${color}18`; e.currentTarget.style.transform=''; }}
          >
            View All Repos ↗
          </a>
          <Link to="/" style={{
            fontFamily:'var(--font-mono)', fontSize:'0.72rem', letterSpacing:'0.12em',
            padding:'0.75rem 2rem', background:'transparent', border:`1px solid ${C.text3}44`,
            color:C.text2, borderRadius:4, transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=`${color}44`; e.currentTarget.style.color=color; e.currentTarget.style.transform='translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor=`${C.text3}44`; e.currentTarget.style.color=C.text2; e.currentTarget.style.transform=''; }}
          >
            ← Back to Portfolio
          </Link>
        </div>
      </div>

      <ProgressTracker milestones={project.milestones} activeIdx={activeMilestone} color={color} />
    </div>
  );
}

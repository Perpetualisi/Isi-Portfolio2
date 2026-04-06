import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  motion, AnimatePresence, useInView,
  useMotionValue, useSpring, useTransform,
} from "framer-motion";
import { useGroq } from "../hooks/Usegroq";

// ─── THEME ──────────────────────────────────────────────────────────────────
const T = {
  bg: "#020204", surface: "#07070b", orange: "#F97316", orangeD: "#C2410C",
  orangeL: "#fb923c", amber: "#f59e0b",
  text: "#ffffff", muted: "rgba(255,255,255,0.40)", faint: "rgba(255,255,255,0.10)",
  border: "rgba(249,115,22,0.14)", borderB: "rgba(255,255,255,0.065)", borderH: "rgba(249,115,22,0.40)",
  green: "#22c55e", teal: "#14b8a6",
};

const CONTACT_INFO = [
  { label:"Email", value:"Perpetualokan0@gmail.com", href:"mailto:Perpetualokan0@gmail.com", desc:"Drop me a line",
    icon:(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>) },
  { label:"Phone", value:"+234-810-355-8837", href:"tel:+2348103558837", desc:"Let's talk",
    icon:(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>) },
  { label:"Location", value:"Lagos, Nigeria", href:"#", desc:"Where I'm based",
    icon:(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>) },
];

const FAQS = [
  { q:"What kind of projects do you take on?", a:"3D web experiences, interactive portfolios, SaaS dashboards, and full-stack web apps. If it involves Three.js, WebGL, or a complex React frontend — I'm in." },
  { q:"Are you available for full-time roles?", a:"Yes — open to both freelance contracts and full-time positions. Remote-first, but open to hybrid for the right team." },
  { q:"What's your typical response time?", a:"Usually within 24 hours on weekdays. I reply to every genuine message personally." },
  { q:"Do you work with international clients?", a:"Absolutely. Based in Lagos, Nigeria — but I work async with clients across Europe, North America, and beyond." },
  { q:"Can I see more work before reaching out?", a:"Of course — check the Portfolio section, or visit github.com/Perpetualisi for code and live demos." },
];

const FAQ_PROMPT = `You are a portfolio FAQ assistant for Perpetual Okan — a 3D Web Developer & Full-Stack Engineer (4+ years, Lagos Nigeria).
Skills: Three.js, WebGL, React, Next.js, Node.js, TypeScript, Tailwind CSS. 15+ shipped projects.
Answer in 1-2 concise sentences only. If unrelated, say: "I can only answer questions about Perpetual!"`;

const AUTO_REPLY_PROMPT = `You are writing a warm auto-reply on behalf of Perpetual Okan — a 3D Web Developer & Full-Stack Engineer in Lagos, Nigeria.
Write EXACTLY 2 sentences:
1. Start with "Hi [name]," and acknowledge what they wrote about specifically.
2. Say Perpetual will personally respond within 24 hours and is looking forward to it.
Tone: human, warm, confident. No corporate speak. No em dashes. No bullet points.`;

const SKILLS = [
  { label:"Three.js / WebGL", pct:94, color:T.orange },
  { label:"React / Next.js",  pct:97, color:T.orangeL },
  { label:"Node.js / APIs",   pct:89, color:T.amber },
  { label:"TypeScript",       pct:88, color:T.teal },
];

const STACK_TAGS = ["Three.js","WebGL","React","Next.js","Node.js","TypeScript","Tailwind","GSAP"];

// ─── CSS ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

#ct-root{
  --orange:#F97316;--orangeD:#C2410C;--orangeL:#fb923c;
  --bg:#020204;--text:#ffffff;
  --muted:rgba(255,255,255,.40);--faint:rgba(255,255,255,.10);
  --border:rgba(249,115,22,.14);--borderB:rgba(255,255,255,.065);--green:#22c55e;
  font-family:'Space Mono',monospace;background:var(--bg);color:var(--text);
}
/* Hide custom cursor on mobile */
@media (max-width: 768px) {
  #ct-root { cursor: auto; }
  .ctCursorDot, .ctCursorRing { display: none !important; }
}

#ct-root ::-webkit-scrollbar{width:2px;}
#ct-root ::-webkit-scrollbar-thumb{background:rgba(249,115,22,.25);border-radius:2px;}

/* Canvas BG */
.ctCanvasBg{position:absolute;inset:0;pointer-events:none;z-index:0;display:block;}

/* Depth fog */
.ctFog{position:absolute;inset:0;pointer-events:none;z-index:4;
  background:
    radial-gradient(ellipse 72% 52% at 50% 100%,rgba(2,2,4,.96) 0%,transparent 55%),
    radial-gradient(ellipse 55% 35% at 50% 0%,rgba(2,2,4,.82) 0%,transparent 45%),
    radial-gradient(ellipse 32% 65% at 0%  50%,rgba(2,2,4,.6) 0%,transparent 40%),
    radial-gradient(ellipse 32% 65% at 100% 50%,rgba(2,2,4,.6) 0%,transparent 40%);
}

/* Holo grid */
.ctGrid{
  position:absolute;
  background:linear-gradient(rgba(249,115,22,.032) 1px,transparent 1px),
             linear-gradient(90deg,rgba(249,115,22,.032) 1px,transparent 1px);
  background-size:54px 54px;transform-origin:50% 0%;pointer-events:none;
}

/* Scan beam */
.ctScan{
  position:absolute;left:0;right:0;height:1.5px;pointer-events:none;z-index:5;
  box-shadow:0 0 12px rgba(249,115,22,.4),0 0 24px rgba(249,115,22,.2);
  animation:ctScanAnim var(--sd,10s) linear infinite;
}
@keyframes ctScanAnim{0%{top:-2px;opacity:0}4%{opacity:1}96%{opacity:1}100%{top:100%;opacity:0}}

/* Orbit rings */
@keyframes spinCW {to{transform:translate(-50%,-50%) rotate(360deg);}}
@keyframes spinCCW{to{transform:translate(-50%,-50%) rotate(-360deg);}}

/* Layout */
.ctOuter{max-width:1440px;margin:0 auto;padding:11rem 5% 5rem;position:relative;z-index:10;}
.ctTwoCol{display:grid;grid-template-columns:5fr 6fr;gap:5rem;align-items:start;}
.ctTwoStat{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;}
.ctPhotoWrap{position:relative;width:100%;aspect-ratio:3/4;max-height:460px;border-radius:4px;overflow:hidden;flex-shrink:0;}

/* Form - Mobile optimizations */
.ctFormGrid{display:grid;grid-template-columns:1fr 1fr;gap:1.6rem;}
.ctFormFull{grid-column:1/-1;}
.ctInput,.ctTextarea{width:100%;background:transparent;border:none;border-bottom:1.5px solid rgba(255,255,255,.09);color:#fff;padding:.8rem 0;font-family:'Space Mono',monospace;font-size:.74rem;outline:none;resize:none;transition:border-color .25s;display:block;}
/* Prevent zoom on mobile */
@media (max-width: 768px) {
  .ctInput, .ctTextarea, .ctAiInput { font-size: 16px !important; }
}
.ctInput::placeholder,.ctTextarea::placeholder{color:rgba(255,255,255,.13);}
.ctInput:disabled,.ctTextarea:disabled{opacity:.5;}
.ctLabel{font-family:'Space Mono',monospace;font-size:.43rem;font-weight:700;text-transform:uppercase;letter-spacing:.32em;display:block;margin-bottom:.5rem;transition:color .25s;}
.ctSubmit{display:inline-flex;align-items:center;gap:.6rem;padding:.9rem 2.4rem;font-family:'Space Mono',monospace;font-size:.58rem;font-weight:700;letter-spacing:.24em;text-transform:uppercase;border:none;border-radius:4px;cursor:pointer;transition:opacity .25s,box-shadow .25s;position:relative;overflow:hidden;}
.ctSubmit::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.15) 0%,transparent 60%);opacity:0;transition:opacity .3s;}
.ctSubmit:hover::after{opacity:1;}
.ctSubmit:disabled{cursor:not-allowed;opacity:.65;}
.ctDivider{height:1px;background:linear-gradient(90deg,var(--orange) 0%,rgba(249,115,22,.12) 40%,transparent 80%);}

/* FAQ */
.ctFaqAccordion{border-radius:16px;overflow:hidden;}
.ctFaqBtn{width:100%;background:transparent;border:none;padding:1.1rem 1.4rem;cursor:pointer;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:1rem;transition:background .2s;}
.ctFaqBtn:hover{background:rgba(249,115,22,.03);}
.ctAiInput{flex:1;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.065);border-radius:100px;padding:.62rem 1rem;font-family:'Space Mono',monospace;font-size:.62rem;color:#fff;outline:none;transition:border-color .22s;letter-spacing:.02em;}
.ctAiInput:focus{border-color:rgba(249,115,22,.45);}
.ctAiInput::placeholder{color:rgba(255,255,255,.16);}

/* Badges */
.stackBadge{display:inline-flex;align-items:center;gap:.35rem;padding:.32rem .72rem;border-radius:100px;font-family:'Space Mono',monospace;font-size:.4rem;font-weight:700;text-transform:uppercase;letter-spacing:.18em;white-space:nowrap;border:1px solid rgba(249,115,22,.2);background:rgba(249,115,22,.055);color:rgba(249,115,22,.8);transition:all .25s;}
.stackBadge:hover{background:rgba(249,115,22,.14);border-color:rgba(249,115,22,.5);transform:translateY(-1px);}

/* Skill bar */
.skillTrack{height:2px;background:rgba(255,255,255,.055);border-radius:2px;overflow:hidden;margin-top:4px;}
.skillFill{height:100%;border-radius:2px;transition:width 1.6s cubic-bezier(.16,1,.3,1);}

/* Holo shimmer card */
.holoCard{position:relative;overflow:hidden;}
.holoCard::before{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(108deg,transparent 25%,rgba(249,115,22,.055) 45%,rgba(255,255,255,.08) 50%,rgba(249,115,22,.055) 55%,transparent 75%);transform:translateX(-120%);transition:transform .8s ease;}
.holoCard:hover::before{transform:translateX(120%);}

/* Typewriter cursor */
.typewriter-text{display:inline-block;}
.typewriter-cursor{display:inline-block;width:2px;height:1em;background:linear-gradient(135deg,#F97316 0%,#fb923c 100%);margin-left:3px;animation:blink 1s step-end infinite;vertical-align:middle;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

/* Glitch */
.glitchWrap{position:relative;display:inline-block;}
.glitchWrap::before,.glitchWrap::after{content:attr(data-text);position:absolute;top:0;left:0;right:0;background:linear-gradient(135deg,#F97316 0%,#fb923c 50%,rgba(255,255,255,.9) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.glitchWrap::before{animation:glitchA 6s infinite;clip-path:polygon(0 0,100% 0,100% 38%,0 38%);transform:translateX(-2px);}
.glitchWrap::after{animation:glitchB 6s infinite;clip-path:polygon(0 62%,100% 62%,100% 100%,0 100%);transform:translateX(2px);}
@keyframes glitchA{0%,88%,100%{transform:translateX(-2px) skewX(0)}90%{transform:translateX(4px) skewX(-6deg)}93%{transform:translateX(-1px) skewX(3deg)}}
@keyframes glitchB{0%,86%,100%{transform:translateX(2px) skewX(0)}89%{transform:translateX(-5px) skewX(5deg)}92%{transform:translateX(3px) skewX(-2deg)}}

/* Pings */
@keyframes ctPing{75%,100%{transform:scale(2.2);opacity:0;}}
@keyframes ctPulse{0%,100%{opacity:1;}50%{opacity:.28;}}
@keyframes ctSpin{to{transform:rotate(360deg);}}
@keyframes statusGlow{0%,100%{box-shadow:0 0 0 3px rgba(34,197,94,.12),0 0 10px rgba(34,197,94,.5);}50%{box-shadow:0 0 0 7px rgba(34,197,94,.04),0 0 22px rgba(34,197,94,.25);}}

/* Responsive */
@media(max-width:1100px){.ctTwoCol{grid-template-columns:1fr;gap:3.5rem;}.ctOuter{padding:9rem 5% 4rem;}}
@media(max-width:768px){
  .ctFormGrid{grid-template-columns:1fr;}
  .ctFormFull{grid-column:1;}
  .ctTwoStat{grid-template-columns:1fr;}
  .ctOuter{padding:8rem 5% 3rem;}
  .ctPhotoWrap{max-height:320px;}
  .ctSubmit { padding: 12px 20px; font-size: 12px; }
}
@media(max-width:480px){.ctOuter{padding:7rem 4% 2.5rem;}.ctPhotoWrap{max-height:240px;}}
`;

// ─── HOOKS ──────────────────────────────────────────────────────────────────
function useMousePos() {
  const [p, setP] = useState({ x:-200, y:-200 });
  useEffect(() => {
    const h = e => setP({ x:e.clientX, y:e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return p;
}

function useTilt(strength = 10) {
  const ref = useRef(null);
  const mx = useMotionValue(0); const my = useMotionValue(0);
  const mxS = useSpring(mx,{stiffness:170,damping:22});
  const myS = useSpring(my,{stiffness:170,damping:22});
  const rotX = useTransform(myS,[-0.5,0.5],[`${strength}deg`,`-${strength}deg`]);
  const rotY = useTransform(mxS,[-0.5,0.5],[`-${strength}deg`,`${strength}deg`]);
  const glare = useTransform([mxS,myS],([lx,ly]) =>
    `radial-gradient(circle 200px at ${(lx+0.5)*100}% ${(ly+0.5)*100}%, rgba(249,115,22,.11) 0%, transparent 65%)`);
  const onMove = useCallback(e => {
    const r = ref.current?.getBoundingClientRect(); if(!r) return;
    mx.set((e.clientX-r.left)/r.width-0.5);
    my.set((e.clientY-r.top)/r.height-0.5);
  },[mx,my]);
  const onLeave = useCallback(() => { mx.set(0); my.set(0); },[mx,my]);
  return { ref, rotX, rotY, glare, onMove, onLeave };
}

function useTypewriter(words, speed = 100, pauseDuration = 2000) {
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeout;
    const currentWord = words[wordIndex % words.length];
    
    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(timeout);
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        setWordIndex(prev => prev + 1);
      } else {
        timeout = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, speed / 2);
      }
    } else {
      if (displayText.length === currentWord.length) {
        setIsPaused(true);
      } else {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, speed);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, isPaused, wordIndex, words, speed, pauseDuration]);

  return displayText;
}

// ─── CANVAS PARTICLE NETWORK ────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef(null);
  const mouseRef = useRef({x:0,y:0});
  useEffect(() => {
    const c = ref.current; if(!c) return;
    const ctx = c.getContext("2d");
    let W, H, raf;
    const resize = () => {
      W = c.width = c.parentElement?.offsetWidth || window.innerWidth;
      H = c.height = c.parentElement?.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const onMouse = e => { mouseRef.current = {x:e.clientX, y:e.clientY}; };
    window.addEventListener("mousemove", onMouse);
    const N = 85;
    const pts = Array.from({length:N}, () => ({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.28, vy:(Math.random()-.5)*.28,
      r:.6+Math.random()*1.1, a:Math.random(),
    }));
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const {x:mx,y:my} = mouseRef.current;
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0) p.x=W; if(p.x>W) p.x=0;
        if(p.y<0) p.y=H; if(p.y>H) p.y=0;
        const dx=p.x-mx, dy=p.y-my, d=Math.hypot(dx,dy);
        if(d<130) { p.vx+=dx/d*.016; p.vy+=dy/d*.016; }
        p.vx*=.994; p.vy*=.994;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(249,115,22,${p.a*.48})`; ctx.fill();
      });
      for(let i=0;i<N;i++) for(let j=i+1;j<N;j++) {
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.hypot(dx,dy);
        if(d<118) {
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(249,115,22,${(1-d/118)*.1})`; ctx.lineWidth=.55; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); window.removeEventListener("mousemove",onMouse); };
  },[]);
  return <canvas ref={ref} className="ctCanvasBg" style={{width:"100%",height:"100%"}} />;
}

// ─── 3D WIREFRAME CUBE ──────────────────────────────────────────────────────
function WireCube({ size=80, style={}, opacity=.18, speed=18 }) {
  const s = size;
  const faces = [
    {transform:`translateZ(${s/2}px)`},
    {transform:`translateZ(-${s/2}px) rotateY(180deg)`},
    {transform:`rotateY(90deg) translateZ(${s/2}px)`},
    {transform:`rotateY(-90deg) translateZ(${s/2}px)`},
    {transform:`rotateX(90deg) translateZ(${s/2}px)`},
    {transform:`rotateX(-90deg) translateZ(${s/2}px)`},
  ];
  return (
    <div style={{position:"absolute",...style}}>
      <motion.div style={{width:s,height:s,transformStyle:"preserve-3d"}}
        animate={{rotateX:[0,360],rotateY:[0,270],rotateZ:[0,90]}}
        transition={{duration:speed,repeat:Infinity,ease:"linear"}}>
        {faces.map((f,i)=>(
          <div key={i} style={{position:"absolute",width:s,height:s,background:"transparent",border:`1px solid rgba(249,115,22,${opacity+(i%3)*.03})`,...f}}/>
        ))}
      </motion.div>
    </div>
  );
}

// ─── WIREFRAME RING CLUSTER ─────────────────────────────────────────────────
function WireRings({ cx, cy, radii, baseOpacity=.07 }) {
  return (
    <div style={{position:"absolute",left:cx,top:cy,transform:"translate(-50%,-50%)",transformStyle:"preserve-3d"}}>
      {radii.map((r,i)=>(
        <motion.div key={i}
          animate={{rotateX:[i*20,i*20+360],rotateY:[i*15,i*15-240]}}
          transition={{duration:14+i*5,repeat:Infinity,ease:"linear"}}
          style={{position:"absolute",width:r*2,height:r*2,left:-r,top:-r,borderRadius:"50%",border:`1px solid rgba(249,115,22,${baseOpacity-i*.01})`}}/>
      ))}
    </div>
  );
}

// ─── POLYGON WIREFRAME ──────────────────────────────────────────────────────
function WirePoly({ x, y, size, sides, speed=20, opacity=.15 }) {
  const pts = Array.from({length:sides},(_,i)=>{
    const a=(i/sides)*Math.PI*2-Math.PI/2;
    return `${size/2+(size/2-2)*Math.cos(a)},${size/2+(size/2-2)*Math.sin(a)}`;
  }).join(" ");
  return (
    <div style={{position:"absolute",left:x,top:y}}>
      <motion.svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        animate={{rotateZ:[0,360]}} transition={{duration:speed,repeat:Infinity,ease:"linear"}}>
        <polygon points={pts} fill="none" stroke={`rgba(249,115,22,${opacity})`} strokeWidth=".8"/>
        {Array.from({length:sides},(_,i)=>{
          const a=(i/sides)*Math.PI*2-Math.PI/2;
          return <line key={i} x1={size/2} y1={size/2} x2={size/2+(size/2-2)*Math.cos(a)} y2={size/2+(size/2-2)*Math.sin(a)} stroke={`rgba(249,115,22,${opacity*.5})`} strokeWidth=".5"/>;
        })}
      </motion.svg>
    </div>
  );
}

// ─── GLOW ORB ───────────────────────────────────────────────────────────────
function GlowOrb({ cx, cy, size, color=T.orange, delay=0 }) {
  return (
    <motion.div style={{position:"absolute",left:cx,top:cy,width:size,height:size,transform:"translate(-50%,-50%)",borderRadius:"50%",background:`radial-gradient(circle at 40% 38%, ${color}20, ${color}07 50%, transparent 70%)`,filter:`blur(${size*.28}px)`,pointerEvents:"none"}}
      animate={{scale:[1,1.18,1],opacity:[.55,.9,.55],y:[0,-18,0]}}
      transition={{duration:8+delay,repeat:Infinity,ease:"easeInOut",delay}}/>
  );
}

// ─── DATA GLYPH ─────────────────────────────────────────────────────────────
function DataGlyph({ x, y, val, delay }) {
  return (
    <motion.div style={{position:"absolute",left:x,top:y,fontFamily:"'JetBrains Mono',monospace",fontSize:".3rem",color:"rgba(249,115,22,.2)",pointerEvents:"none",userSelect:"none",letterSpacing:".04em"}}
      animate={{y:[0,-80,-160],opacity:[0,.7,0]}}
      transition={{duration:7,repeat:Infinity,delay,ease:"linear"}}>
      {val}
    </motion.div>
  );
}

// ─── FULL 3D SCENE - Reduced on mobile ──────────────────────────────────────
function Scene3D() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const glyphs = useMemo(()=>{
    const vals=["0xFF","∇·F","1011","π/2","{}=>","∞","async","0x2F","gl_","mat4","vec3","lerp"];
    // Reduce number of glyphs on mobile
    const count = isMobile ? 8 : 20;
    return Array.from({length:count},(_,i)=>({x:`${6+(i*4.7)%90}%`,y:`${(i*7.3)%78}%`,val:vals[i%vals.length],delay:i*.65}));
  },[isMobile]);

  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <div style={{position:"absolute",inset:0}}>
        <ParticleCanvas/>
      </div>

      {/* Fewer glow orbs on mobile */}
      {!isMobile && <GlowOrb cx="6%"  cy="12%" size={500} color={T.orange}  delay={0}/>}
      <GlowOrb cx="88%" cy="8%"  size={380} color={T.orangeD} delay={2.5}/>
      {!isMobile && <GlowOrb cx="75%" cy="72%" size={420} color={T.amber}   delay={5}/>}
      <GlowOrb cx="18%" cy="78%" size={300} color={T.orange}  delay={1.5}/>
      {!isMobile && <GlowOrb cx="48%" cy="40%" size={220} color={T.teal}    delay={3.5}/>}

      <motion.div className="ctGrid"
        style={{width:"220%",height:"220%",left:"-60%",top:"52%",transform:"rotateX(74deg) rotateZ(2deg)"}}
        animate={{opacity:[.38,.7,.38]}} transition={{duration:5,repeat:Infinity,ease:"easeInOut"}}/>

      <div className="ctScan" style={{"--sd":"11s",background:"linear-gradient(90deg,transparent 0%,rgba(249,115,22,.7) 40%,rgba(251,146,60,.85) 60%,transparent 100%)"}}/>
      
      {!isMobile && (
        <div className="ctScan" style={{"--sd":"17s",animationDelay:"6s",background:"linear-gradient(90deg,transparent 0%,rgba(20,184,166,.45) 40%,rgba(20,184,166,.6) 60%,transparent 100%)"}}/>
      )}

      {/* Orbit rings - fewer on mobile */}
      {[280,460,640,820].slice(0, isMobile ? 2 : 4).map((r,i)=>(
        <div key={i} style={{position:"absolute",left:"50%",top:"30%",width:r*2,height:r*2,borderRadius:"50%",border:`1px dashed rgba(249,115,22,${.055-i*.01})`,animation:`${i%2===0?"spinCW":"spinCCW"} ${22+i*9}s linear infinite`}}>
          {i===0&&<div style={{position:"absolute",top:"3%",left:"50%",width:6,height:6,borderRadius:"50%",background:T.orange,boxShadow:`0 0 14px ${T.orange}`,transform:"translate(-50%,-50%)"}}/>}
        </div>
      ))}

      {/* Wireframe cubes - fewer on mobile */}
      {!isMobile && <WireCube size={88}  style={{left:"9%",  top:"14%"}} opacity={.22} speed={20}/>}
      <WireCube size={52}  style={{left:"81%", top:"10%"}} opacity={.16} speed={16}/>
      {!isMobile && <WireCube size={128} style={{left:"85%", top:"58%"}} opacity={.11} speed={28}/>}
      <WireCube size={38}  style={{left:"3%",  top:"60%"}} opacity={.20} speed={14}/>
      {!isMobile && <WireCube size={64}  style={{left:"46%", top:"88%"}} opacity={.13} speed={22}/>}

      {/* Polygon wireframes - fewer on mobile */}
      {!isMobile && <WirePoly x="19%" y="68%" size={72} sides={6} speed={18} opacity={.16}/>}
      <WirePoly x="63%" y="18%" size={54} sides={5} speed={14} opacity={.15}/>
      {!isMobile && <WirePoly x="55%" y="80%" size={92} sides={8} speed={26} opacity={.10}/>}
      <WirePoly x="3%"  y="28%" size={48} sides={3} speed={12} opacity={.18}/>

      {/* Ring clusters - fewer on mobile */}
      <WireRings cx="14%" cy="44%" radii={[38,62,86]} baseOpacity={.08}/>
      {!isMobile && <WireRings cx="87%" cy="68%" radii={[28,46,66]} baseOpacity={.07}/>}

      {/* Neon burst lines - fewer on mobile */}
      {[
        {x:"0%",  y:"24%", w:180, angle:12,  delay:0},
        ...(isMobile ? [] : [{x:"62%", y:"6%",  w:220, angle:-9,  delay:1.4}]),
        {x:"38%", y:"88%", w:160, angle:20,  delay:2.8},
        ...(isMobile ? [] : [{x:"78%", y:"44%", w:190, angle:-16, delay:.7}]),
      ].map((l,i)=>(
        <motion.div key={i}
          style={{position:"absolute",left:l.x,top:l.y,width:l.w,height:1,background:"linear-gradient(90deg,transparent,rgba(249,115,22,.45),transparent)",transform:`rotate(${l.angle}deg)`,transformOrigin:"left center"}}
          animate={{scaleX:[0,1,0],opacity:[0,1,0]}}
          transition={{duration:3.2,repeat:Infinity,delay:l.delay,ease:"easeInOut"}}/>
      ))}

      {/* Floating code glyphs */}
      {glyphs.map((g,i)=><DataGlyph key={i} {...g}/>)}

      <div className="ctFog"/>

      {/* Film grain - reduced opacity on mobile */}
      <svg aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:6,opacity:isMobile ? 0.01 : 0.022,mixBlendMode:"overlay"}}>
        <filter id="ctGrain"><feTurbulence type="fractalNoise" baseFrequency=".74" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#ctGrain)"/>
      </svg>

      {/* CRT scanlines - removed on mobile */}
      {!isMobile && (
        <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:7,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,.005) 3px,rgba(255,255,255,.005) 4px)"}}/>
      )}
    </div>
  );
}

// ─── CUSTOM CURSOR - Disabled on mobile ──────────────────────────────────────
function CustomCursor() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const pos = useMousePos();
  const [big,setBig] = useState(false);
  const sc = {stiffness:900,damping:38}, rc = {stiffness:180,damping:28};
  const dotX = useSpring(pos.x,sc), dotY = useSpring(pos.y,sc);
  const ringX = useSpring(pos.x,rc), ringY = useSpring(pos.y,rc);
  
  useEffect(()=>{
    if (isMobile) return;
    const ov=()=>setBig(true), ou=()=>setBig(false);
    document.querySelectorAll("a,button").forEach(el=>{el.addEventListener("mouseenter",ov);el.addEventListener("mouseleave",ou);});
    return ()=>document.querySelectorAll("a,button").forEach(el=>{el.removeEventListener("mouseenter",ov);el.removeEventListener("mouseleave",ou);});
  },[isMobile]);
  
  // Don't render custom cursor on mobile
  if (isMobile) return null;
  
  return (<>
    <motion.div className="ctCursorDot" style={{left:dotX,top:dotY}}/>
    <motion.div className={`ctCursorRing${big?" big":""}`} style={{left:ringX,top:ringY}}/>
  </>);
}

// ─── LIVE CLOCK ─────────────────────────────────────────────────────────────
function LiveClock({ inView }) {
  const [time,setTime] = useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(t);},[]);
  const p = n=>String(n).padStart(2,"0");
  const hh=p(time.getHours()),mm=p(time.getMinutes()),ss=p(time.getSeconds());
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1,duration:.6}}
      style={{display:"flex",alignItems:"center",gap:".7rem",padding:".72rem 1.1rem",background:"rgba(9,9,13,.65)",border:`1px solid ${T.borderB}`,borderRadius:10,backdropFilter:"blur(12px)"}}>
      <motion.div animate={{opacity:[1,.3,1]}} transition={{duration:1,repeat:Infinity}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(249,115,22,.7)" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </motion.div>
      <div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:".7rem",color:"rgba(255,255,255,.85)",letterSpacing:".08em"}}>
          {hh}<motion.span animate={{opacity:[1,0,1]}} transition={{duration:1,repeat:Infinity}}>:</motion.span>
          {mm}<motion.span animate={{opacity:[1,0,1]}} transition={{duration:1,repeat:Infinity}}>:</motion.span>
          {ss}
        </div>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:".38rem",color:T.muted,textTransform:"uppercase",letterSpacing:".22em",marginTop:2}}>Lagos · WAT (UTC+1)</div>
      </div>
    </motion.div>
  );
}

// ─── SKILL BARS ─────────────────────────────────────────────────────────────
function SkillBars({ inView }) {
  return (
    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.95,duration:.6}}
      style={{padding:"1.2rem 1.4rem",background:"rgba(9,9,13,.65)",border:`1px solid ${T.borderB}`,borderRadius:12,backdropFilter:"blur(14px)"}}>
      <p style={{fontFamily:"'Space Mono',monospace",fontSize:".43rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".3em",color:T.orange,marginBottom:"1.1rem"}}>Core Stack</p>
      {SKILLS.map((s,i)=>(
        <div key={i} style={{marginBottom:i<SKILLS.length-1?".9rem":0}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:".3rem"}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:".5rem",color:"rgba(255,255,255,.58)"}}>{s.label}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:".48rem",color:s.color}}>{s.pct}%</span>
          </div>
          <div className="skillTrack">
            <motion.div className="skillFill"
              style={{background:`linear-gradient(90deg,${s.color},${s.color}bb)`}}
              initial={{width:0}}
              animate={{width:`${s.pct}%`}}
              transition={{duration:1.55,delay:1.05+i*.16,ease:[.16,1,.3,1]}}/>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ─── TYPING DOTS ────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{display:"flex",gap:5,alignItems:"center",padding:"2px 0"}}>
      {[0,.18,.36].map((d,i)=>(
        <motion.span key={i} animate={{y:[0,-4,0],opacity:[.35,1,.35]}} transition={{duration:.9,delay:d,repeat:Infinity}}
          style={{width:5,height:5,borderRadius:"50%",background:T.orange,display:"inline-block"}}/>
      ))}
    </div>
  );
}

// ─── FAQ SECTION ────────────────────────────────────────────────────────────
function FaqSection({ inView }) {
  const {ask,loading} = useGroq(FAQ_PROMPT,{maxTokens:120});
  const [openIdx,setOpenIdx] = useState(null);
  const [query,setQuery] = useState("");
  const [aiAnswer,setAiAnswer] = useState("");
  const [asked,setAsked] = useState(false);
  const handleAsk = async()=>{
    const q=query.trim(); if(!q||loading)return;
    setAsked(true); setAiAnswer("");
    const match=FAQS.find(f=>f.q.toLowerCase().includes(q.toLowerCase())||q.toLowerCase().split(" ").some(w=>w.length>3&&f.q.toLowerCase().includes(w)));
    if(match){setAiAnswer(match.a);return;}
    const ans=await ask(q); setAiAnswer(ans);
  };
  const resetAsk=()=>{setQuery("");setAiAnswer("");setAsked(false);};
  return (
    <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.2,ease:[.16,1,.3,1]}} style={{marginBottom:"4.5rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:".55rem",marginBottom:"1.4rem"}}>
        <div style={{height:1,width:18,background:`linear-gradient(to right,transparent,${T.orange})`,flexShrink:0}}/>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:".46rem",fontWeight:700,letterSpacing:".3em",textTransform:"uppercase",color:T.orange}}>FAQ</span>
        <div style={{height:1,width:18,background:`linear-gradient(to left,transparent,${T.border})`,flexShrink:0}}/>
      </div>
      <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.5rem,3vw,2.2rem)",fontWeight:300,color:T.text,margin:"0 0 .5rem",letterSpacing:"-.01em"}}>
        Common <span style={{fontStyle:"italic",color:T.orangeL}}>questions.</span>
      </h3>
      <p style={{fontFamily:"'Space Mono',monospace",fontSize:".58rem",color:T.muted,margin:"0 0 1.8rem",lineHeight:1.8,letterSpacing:".02em"}}>
        Can't find your answer? Ask the AI below — Groq · Llama 3
      </p>
      <div className="ctFaqAccordion" style={{background:"rgba(7,7,11,.78)",border:`1px solid ${T.borderB}`,marginBottom:"1rem",backdropFilter:"blur(18px)"}}>
        {FAQS.map((faq,i)=>(
          <div key={i} style={{borderBottom:i<FAQS.length-1?`1px solid ${T.borderB}`:"none"}}>
            <button className="ctFaqBtn" onClick={()=>setOpenIdx(openIdx===i?null:i)}>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:".62rem",color:openIdx===i?T.orange:"rgba(255,255,255,.7)",letterSpacing:".02em",lineHeight:1.5,transition:"color .2s"}}>{faq.q}</span>
              <motion.div animate={{rotate:openIdx===i?45:0}} transition={{duration:.2}} style={{flexShrink:0}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={openIdx===i?T.orange:"rgba(255,255,255,.22)"} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </motion.div>
            </button>
            <AnimatePresence>
              {openIdx===i&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.22}}>
                  <div style={{padding:".75rem 1.4rem 1.1rem",borderTop:"1px solid rgba(255,255,255,.04)"}}>
                    <p style={{fontFamily:"'Space Mono',monospace",fontSize:".6rem",color:T.muted,margin:0,lineHeight:1.9,letterSpacing:".02em"}}>{faq.a}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(7,7,11,.55)",border:`1px solid ${T.border}`,borderRadius:14,padding:"1rem 1.2rem",backdropFilter:"blur(14px)"}}>
        <p style={{fontFamily:"'Space Mono',monospace",fontSize:".44rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".26em",color:T.muted,marginBottom:".7rem"}}>Still have a question? Ask AI</p>
        <div style={{display:"flex",gap:8}}>
          <input className="ctAiInput" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!asked&&handleAsk()} placeholder="e.g. Do you work with Web3 stacks?"/>
          <motion.button whileHover={{scale:1.04}} whileTap={{scale:.95}} onClick={asked?resetAsk:handleAsk} disabled={loading||(!asked&&!query.trim())}
            style={{padding:".55rem 1.1rem",borderRadius:100,border:"none",background:asked?"rgba(255,255,255,.05)":query.trim()&&!loading?`linear-gradient(135deg,${T.orange},${T.orangeD})`:"rgba(255,255,255,.05)",color:asked?T.muted:query.trim()&&!loading?"#fff":"rgba(255,255,255,.18)",fontFamily:"'Space Mono',monospace",fontSize:".44rem",fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",cursor:loading?"wait":"pointer",whiteSpace:"nowrap",transition:"all .2s"}}>
            {loading?"…":asked?"Clear":"Ask"}
          </motion.button>
        </div>
        <AnimatePresence>
          {(loading||aiAnswer)&&(
            <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.2}}
              style={{marginTop:".8rem",padding:".85rem 1rem",background:"rgba(249,115,22,.045)",border:"1px solid rgba(249,115,22,.13)",borderRadius:10}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:".42rem",letterSpacing:".18em",textTransform:"uppercase",color:T.orange,marginBottom:8}}>AI · Llama 3</div>
              {loading?<TypingDots/>:<p style={{fontFamily:"'Space Mono',monospace",fontSize:".6rem",color:"rgba(255,255,255,.7)",margin:0,lineHeight:1.9,letterSpacing:".02em"}}>{aiAnswer}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="ctDivider" style={{marginTop:"3rem"}}/>
    </motion.div>
  );
}

// ─── AUTO REPLY CARD ────────────────────────────────────────────────────────
function AutoReplyCard({ reply, loading }) {
  if(!reply&&!loading) return null;
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.35,ease:[.16,1,.3,1]}}
      style={{marginTop:"1.2rem",padding:"1.1rem 1.3rem",background:"rgba(249,115,22,.045)",border:"1px solid rgba(249,115,22,.15)",borderRadius:12,backdropFilter:"blur(10px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:T.orange,boxShadow:`0 0 8px ${T.orange}`,flexShrink:0}}/>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:".42rem",letterSpacing:".22em",textTransform:"uppercase",color:T.orange,fontWeight:700}}>Auto-reply · AI · Groq</span>
      </div>
      {loading?<TypingDots/>:<p style={{fontFamily:"'Space Mono',monospace",fontSize:".6rem",color:"rgba(255,255,255,.7)",margin:0,lineHeight:1.9,letterSpacing:".02em"}}>{reply}</p>}
    </motion.div>
  );
}

// ─── CONTACT CARD ───────────────────────────────────────────────────────────
function ContactCard({ info, index, inView }) {
  const tilt = useTilt(8);
  const [hov,setHov] = useState(false);
  return (
    <motion.a href={info.href} ref={tilt.ref}
      onMouseMove={tilt.onMove} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>{tilt.onLeave();setHov(false);}}
      initial={{opacity:0,x:-28}} animate={{opacity:1,x:0}}
      transition={{duration:.6,delay:.7+index*.11,ease:[.16,1,.3,1]}}
      style={{rotateX:tilt.rotX,rotateY:tilt.rotY,transformStyle:"preserve-3d",perspective:"800px",display:"block",textDecoration:"none"}}>
      <div className="holoCard" style={{position:"relative",overflow:"hidden",padding:"1.2rem 1.35rem",borderRadius:12,background:hov?"rgba(18,14,10,.98)":"rgba(8,7,6,.72)",border:`1px solid ${hov?T.borderH:T.borderB}`,boxShadow:hov?`0 28px 64px rgba(0,0,0,.72),0 0 0 1px rgba(249,115,22,.06)`:`0 6px 28px rgba(0,0,0,.38)`,transition:"border-color .28s,box-shadow .38s,background .28s",backdropFilter:"blur(18px)"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${T.orange},transparent)`,opacity:hov?1:0,transition:"opacity .32s",borderRadius:"12px 12px 0 0"}}/>
        <motion.div style={{position:"absolute",inset:0,borderRadius:12,pointerEvents:"none",background:tilt.glare,opacity:hov?1:0,transition:"opacity .28s"}}/>
        <div style={{position:"absolute",bottom:0,left:0,height:1,background:`linear-gradient(90deg,${T.orange},transparent)`,width:hov?"100%":"0%",transition:"width .55s cubic-bezier(.16,1,.3,1)",borderRadius:"0 0 12px 12px"}}/>
        <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",transform:"translateZ(22px)"}}>
          <div style={{display:"flex",alignItems:"center",gap:".9rem"}}>
            <div style={{width:38,height:38,borderRadius:9,flexShrink:0,background:hov?"rgba(249,115,22,.12)":"rgba(255,255,255,.04)",border:`1px solid ${hov?"rgba(249,115,22,.28)":T.borderB}`,display:"flex",alignItems:"center",justifyContent:"center",color:hov?T.orange:"rgba(255,255,255,.36)",transition:"all .28s",transform:hov?"scale(1.1) rotate(4deg)":"scale(1) rotate(0deg)"}}>{info.icon}</div>
            <div>
              <p style={{fontFamily:"'Space Mono',monospace",fontSize:".42rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".28em",color:T.orange,marginBottom:3}}>{info.label}</p>
              <p style={{fontFamily:"'Space Mono',monospace",fontSize:".68rem",color:hov?T.text:"rgba(255,255,255,.7)",transition:"color .22s",marginBottom:2,fontWeight:500}}>{info.value}</p>
              <p style={{fontFamily:"'Space Mono',monospace",fontSize:".5rem",color:T.muted}}>{info.desc}</p>
            </div>
          </div>
          <motion.div animate={{opacity:hov?1:0,x:hov?0:10,y:hov?0:10}} transition={{duration:.22}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </motion.div>
        </div>
      </div>
    </motion.a>
  );
}

// ─── STAT BOX ───────────────────────────────────────────────────────────────
function StatBox({ num, label, delay, inView }) {
  return (
    <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.6,delay,ease:[.16,1,.3,1]}}
      style={{padding:"1.5rem 1.2rem",borderRight:`1px solid ${T.borderB}`,borderBottom:`1px solid ${T.borderB}`}}>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2rem,3.5vw,2.8rem)",fontWeight:300,color:T.text,lineHeight:1,marginBottom:6,letterSpacing:"-.02em"}}>{num}</div>
      <div style={{fontFamily:"'Space Mono',monospace",fontSize:".4rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".3em",color:T.muted}}>{label}</div>
    </motion.div>
  );
}

// ─── PHOTO SECTION ──────────────────────────────────────────────────────────
function PhotoSection({ inView }) {
  const tilt = useTilt(6);
  const [hov,setHov] = useState(false);
  const PHOTO = "/contact_image.jpeg";
  return (
    <motion.div ref={tilt.ref} onMouseMove={tilt.onMove} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>{tilt.onLeave();setHov(false);}}
      initial={{opacity:0,y:32}} animate={{opacity:1,y:0}} transition={{duration:.9,delay:.3,ease:[.16,1,.3,1]}}
      style={{rotateX:tilt.rotX,rotateY:tilt.rotY,transformStyle:"preserve-3d",perspective:"1000px"}}>
      {/* Orbital rings with satellite dots */}
      {[{inset:"-14%",dur:22,dir:1,dot:true},{inset:"-26%",dur:36,dir:-1,dot:false},{inset:"-40%",dur:52,dir:1,dot:false}].map((o,i)=>(
        <motion.div key={i} animate={{rotate:o.dir*360}} transition={{duration:o.dur,repeat:Infinity,ease:"linear"}}
          style={{position:"absolute",inset:o.inset,borderRadius:"50%",border:`1px dashed rgba(249,115,22,${.12-i*.03})`,pointerEvents:"none",zIndex:0}}>
          {o.dot&&<div style={{position:"absolute",top:"7%",left:"50%",width:7,height:7,borderRadius:"50%",background:T.orange,boxShadow:`0 0 14px ${T.orange}66`,transform:"translate(-50%,-50%)"}}/>}
        </motion.div>
      ))}
      <div className="ctPhotoWrap" style={{border:`1px solid ${hov?T.borderH:T.borderB}`,boxShadow:hov?`0 40px 100px rgba(0,0,0,.88),0 0 0 1px rgba(249,115,22,.08),0 0 60px rgba(249,115,22,.1)`:`0 20px 60px rgba(0,0,0,.6)`,transition:"border-color .3s,box-shadow .4s",position:"relative",overflow:"hidden"}}>
        <motion.div style={{position:"absolute",inset:0,zIndex:4,pointerEvents:"none",background:tilt.glare,opacity:hov?1:0,transition:"opacity .3s"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${T.orange},transparent)`,zIndex:5,opacity:hov?1:.35,transition:"opacity .3s"}}/>
        {["top-left","top-right","bottom-left","bottom-right"].map(pos=>{
          const t=pos.includes("top"),l=pos.includes("left");
          return <div key={pos} style={{position:"absolute",width:22,height:22,zIndex:5,top:t?10:undefined,bottom:!t?10:undefined,left:l?10:undefined,right:!l?10:undefined,borderTop:t?`1.5px solid ${T.orange}`:undefined,borderBottom:!t?`1.5px solid ${T.orange}`:undefined,borderLeft:l?`1.5px solid ${T.orange}`:undefined,borderRight:!l?`1.5px solid ${T.orange}`:undefined,opacity:hov?1:.35,transition:"opacity .3s"}}/>;
        })}
        {/* Image scan line */}
        <motion.div style={{position:"absolute",left:0,right:0,height:1.5,background:`linear-gradient(90deg,transparent,rgba(249,115,22,.6),transparent)`,zIndex:6}}
          animate={{top:["0%","100%"]}} transition={{duration:4.5,repeat:Infinity,ease:"linear",repeatDelay:2.5}}/>
        {PHOTO
          ?<img src={PHOTO} alt="Perpetual Okan" style={{width:"100%",height:"100%",objectFit:"cover",display:"block",filter:hov?"brightness(1.06) contrast(1.02)":"brightness(.9)",transition:"filter .4s"}}/>
          :<div style={{width:"100%",height:"100%",background:"linear-gradient(160deg,rgba(18,14,10,.98),rgba(6,5,4,.99))",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"'Space Mono',monospace",fontSize:".42rem",color:T.orange,textTransform:"uppercase",letterSpacing:".32em"}}>Add your photo</span></div>
        }
      </div>
      {/* Available badge */}
      <motion.div animate={{y:[0,-5,0]}} transition={{duration:3.5,repeat:Infinity,ease:"easeInOut",delay:1}}
        style={{position:"absolute",bottom:-16,right:-14,background:"rgba(6,5,4,.96)",border:"1px solid rgba(34,197,94,.32)",borderRadius:8,padding:".62rem .95rem",display:"flex",alignItems:"center",gap:".55rem",boxShadow:"0 14px 38px rgba(0,0,0,.6)",backdropFilter:"blur(16px)",zIndex:10,transform:"translateZ(30px)"}}>
        <span style={{position:"relative",display:"flex",width:8,height:8,flexShrink:0}}>
          <span style={{position:"absolute",inset:0,borderRadius:"50%",background:T.green,opacity:.6,animation:"ctPing 1.5s infinite"}}/>
          <span style={{position:"relative",width:8,height:8,borderRadius:"50%",background:T.green,animation:"statusGlow 2s ease-in-out infinite",display:"inline-flex"}}/>
        </span>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:".42rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".22em",color:"rgba(255,255,255,.52)",whiteSpace:"nowrap"}}>Available Now</span>
      </motion.div>
    </motion.div>
  );
}

// ─── FORM FIELD ─────────────────────────────────────────────────────────────
function Field({ label, name, type, required, placeholder, rows, focused, onFocus, onBlur, disabled }) {
  const active = focused===name;
  const Tag = rows?"textarea":"input";
  return (
    <div style={{display:"flex",flexDirection:"column"}}>
      <label className="ctLabel" style={{color:active?T.orange:T.muted}}>{label}{required&&" *"}</label>
      <div style={{position:"relative"}}>
        <Tag name={name} type={type} required={required} rows={rows} placeholder={placeholder} disabled={disabled} onFocus={onFocus} onBlur={onBlur}
          className={rows?"ctTextarea":"ctInput"} style={{borderBottomColor:active?"rgba(249,115,22,.5)":"rgba(255,255,255,.09)"}}/>
        <motion.div initial={{scaleX:0}} animate={{scaleX:active?1:0}} transition={{duration:.34,ease:[.16,1,.3,1]}}
          style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${T.orange},${T.orangeD})`,transformOrigin:"left",borderRadius:1}}/>
      </div>
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
export default function Contact() {
  const [submitting,setSubmitting] = useState(false);
  const [status,setStatus] = useState(null);
  const [focused,setFocused] = useState(null);
  const [autoReply,setAutoReply] = useState("");
  const [aiReplying,setAiReplying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const {ask:getAutoReply} = useGroq(AUTO_REPLY_PROMPT,{maxTokens:140,temperature:.65});

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const headerRef = useRef(null), formRef = useRef(null), formEl = useRef(null);
  const headerInView = useInView(headerRef,{once:true,amount:0});
  const formInView = useInView(formRef,{once:true,amount:0});

  const formMx=useMotionValue(0), formMy=useMotionValue(0);
  const formMxS=useSpring(formMx,{stiffness:60,damping:22});
  const formMyS=useSpring(formMy,{stiffness:60,damping:22});
  const formRotX=useTransform(formMyS,[-.5,.5],["4deg","-4deg"]);
  const formRotY=useTransform(formMxS,[-.5,.5],["-4deg","4deg"]);
  const formGlare=useTransform([formMxS,formMyS],([lx,ly])=>`radial-gradient(circle 420px at ${(lx+.5)*100}% ${(ly+.5)*100}%, rgba(249,115,22,.055) 0%, transparent 65%)`);
  const [formHov,setFormHov] = useState(false);

  const onFormMove = useCallback(e=>{
    const r=formEl.current?.getBoundingClientRect(); if(!r) return;
    formMx.set((e.clientX-r.left)/r.width-.5);
    formMy.set((e.clientY-r.top)/r.height-.5);
  },[formMx,formMy]);

  const typewriterWords = ["Conversation.", "Collaboration.", "Connection.", "Creation."];
  const displayWord = useTypewriter(typewriterWords, 120, 2000);

  async function onSubmit(e) {
    e.preventDefault(); setSubmitting(true); setAutoReply("");
    const data=new FormData(e.target);
    data.append("access_key","f03b99d4-599d-460a-998d-62046420b9ba");
    const name=data.get("name")||"", message=data.get("message")||"", subject=data.get("subject")||"General inquiry";
    try {
      const res=await fetch("https://api.web3forms.com/submit",{method:"POST",body:data});
      const json=await res.json();
      setStatus(json.success?"success":"error");
      if(json.success) {
        e.target.reset(); setAiReplying(true);
        const reply=await getAutoReply(`Name: ${name}\nSubject: ${subject}\nMessage: ${message}`);
        setAutoReply(reply); setAiReplying(false);
      }
    } catch { setStatus("error"); }
    finally { setSubmitting(false); setTimeout(()=>setStatus(null),7000); }
  }

  return (
    <section id="contact" style={{position:"relative",background:T.bg,color:T.text,overflow:"hidden",paddingTop:1}}>
      <style>{CSS}</style>
      <div id="ct-root">
        <CustomCursor/>
        <Scene3D/>
        <div className="ctOuter">

          <FaqSection inView={headerInView}/>

          {/* HEADER */}
          <header ref={headerRef} style={{marginBottom:"4.5rem",position:"relative",paddingBottom:"3rem"}}>
            <motion.div initial={{opacity:0,x:-22}} animate={{opacity:1,x:0}} transition={{duration:.7}}
              style={{display:"flex",alignItems:"center",gap:".7rem",marginBottom:"1.8rem"}}>
              <div style={{height:1,width:26,background:`linear-gradient(to right,transparent,${T.orange})`,flexShrink:0}}/>
              <div style={{display:"inline-flex",alignItems:"center",gap:".42rem",padding:".3rem .85rem",borderRadius:100,background:"rgba(249,115,22,.07)",border:"1px solid rgba(249,115,22,.22)",backdropFilter:"blur(12px)"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:T.orange,boxShadow:`0 0 9px ${T.orange}`,display:"inline-block",animation:"ctPulse 2s infinite"}}/>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:".48rem",fontWeight:700,letterSpacing:".3em",textTransform:"uppercase",color:"rgba(251,146,60,.9)"}}>Get In Touch</span>
              </div>
              <div style={{height:1,flex:1,background:`linear-gradient(to right,${T.border},transparent)`}}/>
            </motion.div>

            <div style={{position:"absolute",top:"-.5rem",left:"-.3rem",fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(5rem,14vw,13rem)",fontWeight:300,color:"rgba(249,115,22,.022)",lineHeight:1,pointerEvents:"none",userSelect:"none",letterSpacing:"-.04em",zIndex:0}}>CONTACT</div>

            <motion.h2 initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:.9,delay:.15,ease:[.16,1,.3,1]}}
              style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2.8rem,7vw,7.2rem)",fontWeight:300,lineHeight:.88,letterSpacing:"-.02em",color:T.text,margin:"0 0 1.4rem 0",position:"relative",zIndex:1}}>
              <span style={{color:"#ffffff",WebkitTextFillColor:"#ffffff"}}>Let's Start A</span><br/>
              <span style={{display:"inline-block",position:"relative",fontStyle:"italic",background:`linear-gradient(135deg,${T.orange} 0%,${T.orangeL} 55%,rgba(255,255,255,.92) 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",minWidth:"320px"}}>
                <span className="typewriter-text">{displayWord}</span>
                <span className="typewriter-cursor"></span>
              </span>
            </motion.h2>

            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.8,delay:.5}}
              style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(.64rem,1.1vw,.78rem)",color:T.muted,maxWidth:500,lineHeight:1.95,borderLeft:"2px solid rgba(249,115,22,.22)",paddingLeft:"1rem",margin:0}}>
              Have a project in mind or just want to discuss ideas? My inbox is always open for collaboration and interesting conversations.
            </motion.p>
            <motion.div initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration:1.1,delay:.55}}
              className="ctDivider" style={{position:"absolute",bottom:0,left:0,right:0,transformOrigin:"left"}}/>
          </header>

          {/* TWO COL */}
          <div className="ctTwoCol">
            {/* LEFT */}
            <div style={{display:"flex",flexDirection:"column",gap:"2.6rem"}}>
              <PhotoSection inView={headerInView}/>

              <motion.div initial={{opacity:0,x:-22}} animate={{opacity:1,x:0}} transition={{duration:.7,delay:.6}}>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.2rem,2.2vw,1.55rem)",fontWeight:400,color:"rgba(255,255,255,.88)",letterSpacing:"-.01em",margin:"0 0 .65rem 0"}}>Ready to bring your ideas to life?</h3>
                <p style={{fontFamily:"'Space Mono',monospace",fontSize:".66rem",color:T.muted,lineHeight:1.9,margin:"0 0 1rem"}}>Whether it's a complex web application, an interactive 3D experience, or a creative digital project — let's make it happen.</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:".45rem"}}>
                  {STACK_TAGS.map(tag=><span key={tag} className="stackBadge">{tag}</span>)}
                </div>
              </motion.div>

              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.6,delay:.65}}
                style={{border:`1px solid ${T.borderB}`,borderRadius:4,overflow:"hidden"}}>
                <div className="ctTwoStat">
                  <StatBox num="50+" label="Projects Done" delay={.7} inView={headerInView}/>
                  <StatBox num="32" label="Happy Clients"  delay={.8} inView={headerInView}/>
                </div>
              </motion.div>

              <SkillBars inView={headerInView}/>
              <LiveClock inView={headerInView}/>

              <div style={{display:"flex",flexDirection:"column",gap:".7rem"}}>
                {CONTACT_INFO.map((info,i)=><ContactCard key={i} info={info} index={i} inView={headerInView}/>)}
              </div>

              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.7,delay:1.2}}
                style={{display:"flex",alignItems:"center",gap:".7rem",paddingTop:"1.2rem",borderTop:`1px solid ${T.borderB}`}}>
                <span style={{position:"relative",display:"flex",width:10,height:10,flexShrink:0}}>
                  <span style={{position:"absolute",inset:0,borderRadius:"50%",background:T.green,opacity:.6,animation:"ctPing 1.5s infinite"}}/>
                  <span style={{position:"relative",width:10,height:10,borderRadius:"50%",background:T.green,animation:"statusGlow 2s ease-in-out infinite",display:"inline-flex"}}/>
                </span>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:".48rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".24em",color:T.faint}}>Available for projects</span>
              </motion.div>
            </div>

            {/* RIGHT: FORM */}
            <motion.div ref={formRef} initial={{opacity:0,y:44}} animate={{opacity:1,y:0}} transition={{duration:1.0,delay:.3,ease:[.16,1,.3,1]}}>
              <motion.div ref={formEl} onMouseMove={onFormMove} onMouseEnter={()=>setFormHov(true)} onMouseLeave={()=>{formMx.set(0);formMy.set(0);setFormHov(false);}}
                style={{rotateX:formRotX,rotateY:formRotY,transformStyle:"preserve-3d",perspective:"1200px"}}>
                <div className="holoCard" style={{position:"relative",overflow:"hidden",padding:"2.6rem clamp(1.5rem,3vw,2.6rem)",borderRadius:22,background:"linear-gradient(160deg,rgba(12,9,8,.99) 0%,rgba(5,4,3,.99) 100%)",border:`1px solid ${formHov?T.borderH:T.borderB}`,boxShadow:formHov?`0 64px 130px rgba(0,0,0,.9),0 0 0 1px rgba(249,115,22,.07),0 0 80px rgba(249,115,22,.055)`:`0 22px 64px rgba(0,0,0,.68)`,transition:"border-color .35s,box-shadow .45s",backdropFilter:"blur(24px)"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${T.orange} 40%,transparent)`,opacity:formHov?1:0,transition:"opacity .4s",borderRadius:"22px 22px 0 0"}}/>
                  <motion.div style={{position:"absolute",inset:0,borderRadius:22,pointerEvents:"none",background:formGlare,opacity:formHov?1:0,transition:"opacity .35s"}}/>
                  {["tl","tr","bl","br"].map(c=>(
                    <div key={c} style={{position:"absolute",width:22,height:22,top:c[0]==="t"?14:undefined,bottom:c[0]==="b"?14:undefined,left:c[1]==="l"?14:undefined,right:c[1]==="r"?14:undefined,borderTop:c[0]==="t"?"1.5px solid rgba(249,115,22,.42)":undefined,borderBottom:c[0]==="b"?"1.5px solid rgba(249,115,22,.42)":undefined,borderLeft:c[1]==="l"?"1.5px solid rgba(249,115,22,.42)":undefined,borderRight:c[1]==="r"?"1.5px solid rgba(249,115,22,.42)":undefined,opacity:formHov?.85:.28,transition:"opacity .3s",zIndex:5}}/>
                  ))}
                  {/* Bottom sweep bar */}
                  <motion.div style={{position:"absolute",bottom:0,left:0,height:2,background:`linear-gradient(90deg,${T.orange},${T.orangeD})`,borderRadius:"0 0 22px 22px"}}
                    animate={{width:formHov?"100%":"0%"}} transition={{duration:.55,ease:[.16,1,.3,1]}}/>

                  <div style={{position:"relative",transform:"translateZ(28px)"}}>
                    <div style={{marginBottom:"2rem"}}>
                      <div style={{display:"flex",alignItems:"center",gap:".55rem",marginBottom:".55rem"}}>
                        <div style={{width:16,height:2,background:`linear-gradient(to right,${T.orange},transparent)`,borderRadius:2}}/>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:".46rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".3em",color:T.orange}}>Send a Message</span>
                      </div>
                      <p style={{fontFamily:"'Space Mono',monospace",fontSize:".62rem",color:T.muted,margin:0,lineHeight:1.75}}>Fill out the form and I'll get back within 24 hours.</p>
                    </div>
                    <form onSubmit={onSubmit} style={{display:"flex",flexDirection:"column",gap:"1.7rem"}}>
                      <div className="ctFormGrid">
                        <Field label="Full Name"       name="name"    type="text"  required placeholder="John Doe"                      focused={focused} onFocus={()=>setFocused("name")}    onBlur={()=>setFocused(null)} disabled={submitting}/>
                        <Field label="Email Address"   name="email"   type="email" required placeholder="john@example.com"              focused={focused} onFocus={()=>setFocused("email")}   onBlur={()=>setFocused(null)} disabled={submitting}/>
                        <div className="ctFormFull"><Field label="Subject" name="subject" type="text" placeholder="Project inquiry..."   focused={focused} onFocus={()=>setFocused("subject")} onBlur={()=>setFocused(null)} disabled={submitting}/></div>
                        <div className="ctFormFull"><Field label="Your Message" name="message" required rows={5} placeholder="Tell me about your project or idea..." focused={focused} onFocus={()=>setFocused("message")} onBlur={()=>setFocused(null)} disabled={submitting}/></div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:".4rem",flexWrap:"wrap",gap:"1rem"}}>
                        <motion.button type="submit" disabled={submitting||status==="success"} className="ctSubmit"
                          whileHover={!isMobile ? {scale:1.04,boxShadow:`0 18px 48px rgba(249,115,22,.44)`} : {}}
                          whileTap={!isMobile ? {scale:.96} : {scale:.98}}
                          onMouseMove={!isMobile ? (e=>{const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty("--mx",`${((e.clientX-r.left)/r.width)*100}%`);e.currentTarget.style.setProperty("--my",`${((e.clientY-r.top)/r.height)*100}%`);}) : undefined}
                          style={{background:status==="success"?"rgba(34,197,94,.14)":`linear-gradient(135deg,${T.orange},${T.orangeD})`,border:status==="success"?"1px solid rgba(34,197,94,.38)":"1px solid transparent",color:"#fff",boxShadow:status==="success"?"none":`0 8px 28px rgba(249,115,22,.3),inset 0 1px 0 rgba(255,255,255,.14)`}}>
                          {submitting?(<><motion.span animate={{rotate:360}} transition={{duration:.85,repeat:Infinity,ease:"linear"}} style={{display:"inline-flex"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></motion.span>Sending…</>):status==="success"?(<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Sent!</>):(<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Send Message</>)}
                        </motion.button>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:".46rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".22em",color:T.faint}}>Response within 24h</span>
                      </div>
                      <AnimatePresence mode="wait">
                        {status&&(
                          <motion.div initial={{opacity:0,y:-10,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-10}} transition={{duration:.32}}
                            style={{display:"flex",alignItems:"center",gap:".7rem",padding:"1rem 1.2rem",borderRadius:12,background:status==="success"?"rgba(34,197,94,.065)":"rgba(239,68,68,.065)",border:`1px solid ${status==="success"?"rgba(34,197,94,.24)":"rgba(239,68,68,.24)"}`,color:status==="success"?"#4ade80":"#f87171"}}>
                            {status==="success"?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                            <div>
                              <p style={{fontFamily:"'Space Mono',monospace",fontSize:".52rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".18em",margin:"0 0 3px 0"}}>{status==="success"?"Message Delivered!":"Sending Failed"}</p>
                              <p style={{fontFamily:"'Space Mono',monospace",fontSize:".5rem",color:T.muted,margin:0}}>{status==="success"?"I'll get back to you soon!":"Please try again or email directly."}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <AutoReplyCard reply={autoReply} loading={aiReplying}/>
                    </form>
                  </div>
                </div>
              </motion.div>

              {/* WhatsApp */}
              <motion.a href="https://wa.me/2348103558837" target="_blank" rel="noopener noreferrer"
                initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.8}}
                whileHover={!isMobile ? {x:6,boxShadow:"0 10px 36px rgba(37,211,102,.18)"} : {}}
                whileTap={!isMobile ? {scale:.97} : {scale:.98}}
                className="holoCard"
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"1rem",padding:"1rem 1.4rem",borderRadius:14,background:"rgba(37,211,102,.045)",border:"1px solid rgba(37,211,102,.18)",textDecoration:"none",color:T.text,backdropFilter:"blur(12px)",transition:"box-shadow .3s"}}>
                <div style={{display:"flex",alignItems:"center",gap:".8rem"}}>
                  <div style={{width:36,height:36,borderRadius:9,flexShrink:0,background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.22)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </div>
                  <div>
                    <p style={{fontFamily:"'Space Mono',monospace",fontSize:".44rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".26em",color:"#25D366",marginBottom:3}}>WhatsApp</p>
                    <p style={{fontFamily:"'Space Mono',monospace",fontSize:".66rem",color:"rgba(255,255,255,.62)"}}>+234-810-355-8837</p>
                  </div>
                </div>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
              </motion.a>
            </motion.div>
          </div>

          {/* FOOTER */}
          <motion.footer initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.8,delay:1.0}}
            style={{marginTop:"5rem",paddingTop:"2rem",borderTop:`1px solid ${T.borderB}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem"}}>
            <p style={{fontFamily:"'Space Mono',monospace",fontSize:".48rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".28em",color:T.faint,margin:0}}>© 2024 — Built with passion & precision</p>
            <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
              {[
                {href:"#",label:"GitHub",icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>},
                {href:"#",label:"LinkedIn",icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>},
                {href:"#",label:"Twitter",icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>},
              ].map(s=>(
                <motion.a key={s.label} href={s.href} aria-label={s.label}
                  whileHover={!isMobile ? {scale:1.15,color:T.orange} : {}}
                  style={{color:"rgba(255,255,255,.22)",transition:"color .22s",display:"flex",textDecoration:"none"}}>
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.footer>
        </div>
      </div>
    </section>
  );
}
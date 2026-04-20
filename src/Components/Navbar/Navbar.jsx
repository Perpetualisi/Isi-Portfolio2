// src/components/Navbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PERPETUAL OKAN · NAVBAR v3.2
//
// v3.2 CHANGES:
//   • Cleaner mobile menu — removed BuildingTicker, reduced visual noise
//   • Simplified status chip (smaller, less prominent)
//   • Better spacing and typography
//   • Removed excessive decorative elements
//   • Improved touch targets and readability
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState, useEffect, useCallback, useRef,
  useReducer, useMemo, memo,
} from "react";
import { Link, useLocation } from "react-router-dom";
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  FiGithub, FiLinkedin, FiMenu, FiX,
  FiCommand, FiVolume2, FiVolumeX,
  FiMail,
} from "react-icons/fi";

/* ═══════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

:root {
  --nb-bg:        #020204;
  --nb-orange:    #F97316;
  --nb-orangeD:   #C2410C;
  --nb-orangeL:   #fb923c;
  --nb-text:      #ffffff;
  --nb-muted:     rgba(255,255,255,0.42);
  --nb-faint:     rgba(255,255,255,0.06);
  --nb-borderB:   rgba(255,255,255,0.065);
  --nb-borderO:   rgba(249,115,22,0.28);
  --nb-green:     #22c55e;
  --nb-font-mono: 'Space Mono', monospace;
  --nb-font-disp: 'Cormorant Garamond', serif;
  --nb-ease:      cubic-bezier(0.16, 1, 0.3, 1);
}

/* Reset */
.nb-root *, .nb-root *::before, .nb-root *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
.nb-root { font-family: var(--nb-font-mono); }

/* Skip to content */
.nb-skip {
  position: fixed; top: -100px; left: 50%; transform: translateX(-50%);
  z-index: 9999; padding: 0.6rem 1.2rem; border-radius: 6px;
  background: var(--nb-orange); color: #fff;
  font-family: var(--nb-font-mono); font-size: 0.55rem;
  font-weight: 700; letter-spacing: 0.1em; text-decoration: none;
  transition: top 0.18s ease;
}
.nb-skip:focus { top: 12px; }

/* Cursor spotlight */
.nb-spotlight {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
  border-radius: inherit;
}
.nb-spotlight-inner {
  position: absolute;
  width: 520px; height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249,115,22,0.055) 0%, transparent 65%);
  transform: translate(-50%, -50%);
  transition: opacity 0.4s ease;
  will-change: transform;
}

/* Logo */
.okan-logo { display:flex; align-items:center; justify-content:center; width:52px; height:52px; perspective:600px; cursor:pointer; position:relative; flex-shrink:0; }
.okan-box {
  width:52px; height:52px; border-radius:14px;
  background: linear-gradient(160deg,#1c1c1c 0%,#000 55%,#0e0e0e 100%);
  border:1px solid rgba(255,255,255,0.13);
  display:flex; align-items:center; justify-content:center;
  box-shadow: inset 0 2px 0 rgba(255,255,255,0.10), inset 0 -2px 0 rgba(0,0,0,0.9),
              0 14px 44px rgba(0,0,0,0.75), 0 4px 12px rgba(0,0,0,0.6);
  position:relative; overflow:hidden;
}
.okan-box::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(108deg, transparent 30%, rgba(249,115,22,0.09) 50%, transparent 70%);
  transform:translateX(-100%); transition:transform 0.7s ease;
}
.okan-logo:hover .okan-box::before { transform:translateX(100%); }
.okan-dot {
  position:absolute; bottom:-2px; right:-2px;
  width:9px; height:9px; border-radius:50%;
  background:var(--nb-green);
  box-shadow:0 0 10px var(--nb-green), 0 0 22px rgba(34,197,94,0.4);
  border:1.5px solid var(--nb-bg);
  animation: dotPulse 2.2s ease-in-out infinite;
}
@keyframes dotPulse {
  0%,100% { box-shadow:0 0 8px var(--nb-green), 0 0 18px rgba(34,197,94,0.35); }
  50%     { box-shadow:0 0 18px var(--nb-green), 0 0 38px rgba(34,197,94,0.55); }
}

/* Nav pill */
.nb-pill {
  display:flex; align-items:center; gap:2rem;
  padding:0.65rem 1.9rem; border-radius:100px;
  background:rgba(255,255,255,0.018);
  border:1px solid var(--nb-borderB);
  backdrop-filter:blur(24px) saturate(160%);
  box-shadow:0 4px 28px rgba(0,0,0,0.38),
             inset 0 1px 0 rgba(255,255,255,0.06),
             inset 0 -1px 0 rgba(0,0,0,0.25);
  white-space:nowrap; position:relative; overflow:hidden;
}
.nb-pill::after {
  content:''; position:absolute; top:0; left:15%; right:15%;
  height:1px; border-radius:1px;
  background:linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
  pointer-events:none;
}

/* Nav link */
.nb-link {
  font-family:var(--nb-font-mono);
  font-size:0.48rem; font-weight:700;
  letter-spacing:0.34em; text-transform:uppercase;
  text-decoration:none; padding:0.28rem 0; position:relative;
  transition:color 0.22s; outline:none;
}
.nb-link:focus-visible { outline:2px solid var(--nb-orange); outline-offset:4px; border-radius:3px; }

/* CTA button */
.nb-cta {
  display:inline-flex; align-items:center; gap:0.42rem;
  padding:0.58rem 1.4rem; border-radius:5px;
  font-family:var(--nb-font-mono);
  font-size:0.48rem; font-weight:700;
  letter-spacing:0.26em; text-transform:uppercase;
  text-decoration:none; transition:all 0.28s ease;
  cursor:pointer; border:none; outline:none;
  backdrop-filter:blur(12px); position:relative; overflow:hidden;
}
.nb-cta:focus-visible { outline:2px solid var(--nb-orange); outline-offset:3px; }

/* Social icon */
.nb-social {
  width:33px; height:33px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  text-decoration:none; transition:all 0.22s; cursor:pointer; outline:none;
  flex-shrink:0;
}
.nb-social:focus-visible { outline:2px solid var(--nb-orange); outline-offset:3px; }

/* Mobile overlay - cleaner version */
.nb-mobile-overlay {
  position:fixed; inset:0; z-index:60;
  background:rgba(2,2,4,0.98); backdrop-filter:blur(44px);
  display:flex; flex-direction:column;
  padding:0 6%;
  overflow-y:auto;
}

/* Mobile close button */
.nb-mobile-close {
  position:absolute; top:20px; right:20px;
  width:44px; height:44px; border-radius:12px;
  background:rgba(249,115,22,0.08);
  border:1px solid rgba(249,115,22,0.25);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:var(--nb-orange);
  transition:all 0.22s ease; z-index:71;
}
.nb-mobile-close:hover { background:rgba(249,115,22,0.15); transform:scale(1.02); }

/* Right cluster */
.nb-desktop-right {
  display:flex; align-items:center; gap:0.55rem;
  flex-shrink:0;
}

/* Command bar */
.nb-cmd-backdrop {
  position:fixed; inset:0; z-index:200;
  background:rgba(2,2,4,0.75); backdrop-filter:blur(12px);
}
.nb-cmd-panel {
  position:fixed; top:18vh; left:50%; transform:translateX(-50%);
  z-index:201; width:min(560px, calc(100vw - 32px));
  background:rgba(8,8,14,0.98);
  border:1px solid rgba(249,115,22,0.22);
  border-radius:18px;
  box-shadow:0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04),
             inset 0 1px 0 rgba(255,255,255,0.05);
  overflow:hidden;
}

/* Progress bar */
.nb-progress {
  position:fixed; top:0; left:0; height:2px; z-index:100; pointer-events:none;
  background:linear-gradient(90deg,var(--nb-orange),var(--nb-orangeL),var(--nb-orange));
  background-size:200% 100%; animation:shimmer 2s linear infinite; transform-origin:left;
}
@keyframes shimmer { 0%{background-position:0% 0%} 100%{background-position:200% 0%} }

/* Page flash */
.nb-page-flash {
  position:fixed; inset:0; z-index:500; pointer-events:none;
  background:rgba(249,115,22,0.04);
}

/* Responsive */
.nb-desktop { display:flex !important; }
.nb-desktop-right { display:flex !important; }
.nb-mobile-btn { display:none !important; }
@media(max-width:1180px) {
  .nb-pill { gap:1.4rem; padding:0.65rem 1.2rem; }
}
@media(max-width:900px) {
  .nb-desktop    { display:none !important; }
  .nb-desktop-right { display:none !important; }
  .nb-mobile-btn { display:flex !important; }
}

/* Tooltip */
.nb-tooltip {
  position:absolute; bottom:-30px; left:50%; transform:translateX(-50%);
  background:rgba(9,9,13,0.97); border:1px solid rgba(249,115,22,0.25);
  border-radius:5px; padding:3px 9px; white-space:nowrap;
  font-family:var(--nb-font-mono); font-size:0.37rem;
  letter-spacing:0.22em; text-transform:uppercase; color:rgba(249,115,22,0.85);
  pointer-events:none; backdrop-filter:blur(10px);
}

/* Animations */
@keyframes nbPing    { 75%,100%{transform:scale(2.2);opacity:0} }
@keyframes glowPulse { 0%,100%{box-shadow:0 0 10px var(--nb-orange),0 0 24px rgba(249,115,22,0.42)} 50%{box-shadow:0 0 20px var(--nb-orange),0 0 48px rgba(249,115,22,0.65)} }
@keyframes cmdSlide  { from{opacity:0;transform:translateX(-50%) translateY(-10px) scale(0.97)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
@keyframes breathe   { 0%,100%{opacity:0.42} 50%{opacity:0.58} }

/* Scrollbar */
.nb-scroll::-webkit-scrollbar { width:3px; }
.nb-scroll::-webkit-scrollbar-thumb { background:rgba(249,115,22,0.25); border-radius:3px; }

/* Reading badge */
.nb-reading-badge {
  display:inline-flex; align-items:center; gap:0.3rem;
  padding:0.22rem 0.65rem; border-radius:100px;
  background:rgba(249,115,22,0.06); border:1px solid rgba(249,115,22,0.16);
  font-family:var(--nb-font-mono); font-size:0.36rem;
  letter-spacing:0.18em; text-transform:uppercase; color:rgba(249,115,22,0.65);
  white-space:nowrap; flex-shrink:0;
}

/* Mobile nav link - cleaner */
.nb-mlink {
  display:flex; align-items:center; gap:1rem;
  text-decoration:none; padding:0.8rem 0;
  border-bottom:1px solid rgba(255,255,255,0.03);
  outline:none;
}
.nb-mlink:focus-visible { outline:2px solid var(--nb-orange); outline-offset:4px; border-radius:4px; }

/* Command group */
.nb-cmd-group {
  padding:8px 16px 4px;
  font-family:var(--nb-font-mono); font-size:9px;
  letter-spacing:0.3em; text-transform:uppercase;
  color:rgba(255,255,255,0.2);
  border-bottom:1px solid rgba(255,255,255,0.04);
}

/* Kbd badge */
.nb-kbd {
  font-family:var(--nb-font-mono); font-size:9px;
  color:rgba(255,255,255,0.25); background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.10); border-radius:4px;
  padding:1px 6px; flex-shrink:0;
}
`;

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { name: "Home",      href: "/",          readingTime: null },
  { name: "About",     href: "/about",     readingTime: "3 min" },
  { name: "Portfolio", href: "/portfolio", readingTime: "5 min" },
  { name: "Contact",   href: "/contact",   readingTime: null },
];

const CMD_GROUPS = [
  {
    label: "Navigation",
    items: [
      { id:"home",      label:"Go to Home",      icon:"🏠", href:"/",          kbd:null },
      { id:"about",     label:"Go to About",      icon:"👤", href:"/about",     kbd:null },
      { id:"portfolio", label:"Go to Portfolio",  icon:"🎨", href:"/portfolio", kbd:null },
      { id:"contact",   label:"Go to Contact",    icon:"✉️", href:"/contact",   kbd:null },
    ],
  },
  {
    label: "Actions",
    items: [
      { id:"email",  label:"Copy email address", icon:"📋", action:"copy-email", kbd:"C" },
      { id:"hire",   label:"Hire Perpetual",      icon:"⚡", href:"/contact",    kbd:"H" },
      { id:"resume", label:"Download résumé",     icon:"📄", action:"resume",    kbd:"R" },
    ],
  },
  {
    label: "External",
    items: [
      { id:"github",   label:"Open GitHub",   icon:"⌨️", href:"https://github.com/Perpetualisi/",           external:true },
      { id:"linkedin", label:"Open LinkedIn", icon:"💼", href:"https://linkedin.com/in/perpetual-okan",     external:true },
    ],
  },
];

const CMD_ITEMS_FLAT = CMD_GROUPS.flatMap(g => g.items);

/* ═══════════════════════════════════════════════════════════════
   OVERLAY STATE
═══════════════════════════════════════════════════════════════ */
const OVERLAY_INIT = { mobile: false, command: false };
function overlayReducer(state, action) {
  switch (action.type) {
    case "OPEN_MOBILE":   return { mobile: true,  command: false };
    case "CLOSE_MOBILE":  return { mobile: false, command: state.command };
    case "OPEN_COMMAND":  return { mobile: false, command: true };
    case "CLOSE_COMMAND": return { ...state,      command: false };
    case "CLOSE_ALL":     return OVERLAY_INIT;
    default:              return state;
  }
}

/* ═══════════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════════ */

function useSticky(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  const rafId = useRef(null);
  useEffect(() => {
    const handler = () => {
      rafId.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => { window.removeEventListener("scroll", handler); cancelAnimationFrame(rafId.current); };
  }, [threshold]);
  return { scrolled };
}

function useLocalTime() {
  const fmt = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2,"0");
    const m = String(d.getMinutes()).padStart(2,"0");
    return { h, m };
  };
  const [t, setT] = useState(fmt);
  const [colon, setColon] = useState(true);
  useEffect(() => {
    const id = setInterval(() => { setT(fmt()); setColon(c => !c); }, 1000);
    return () => clearInterval(id);
  }, []);
  return { ...t, colon };
}

function useAudioFeedback() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef(null);
  const play = useCallback(() => {
    if (!enabled) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(); osc.stop(ctx.currentTime + 0.06);
    } catch { /* ignore */ }
  }, [enabled]);
  const toggle = useCallback(() => setEnabled(v => !v), []);
  return { enabled, toggle, play };
}

function fuzzyMatch(str, query) {
  if (!query) return true;
  const s = str.toLowerCase(), q = query.toLowerCase();
  let si = 0;
  for (let qi = 0; qi < q.length; qi++) { si = s.indexOf(q[qi], si); if (si === -1) return false; si++; }
  return true;
}

function useCopyHelper() {
  const copy = useCallback((text) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    else {
      const el = Object.assign(document.createElement("textarea"), { value: text });
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
  }, []);
  return { copy };
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL PROGRESS
═══════════════════════════════════════════════════════════════ */
const ScrollProgress = memo(() => {
  const [pct, setPct] = useState(0);
  const rafId = useRef(null);
  useEffect(() => {
    const h = () => {
      rafId.current = requestAnimationFrame(() => {
        const el = document.documentElement;
        setPct(el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight));
      });
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => { window.removeEventListener("scroll", h); cancelAnimationFrame(rafId.current); };
  }, []);
  return <motion.div className="nb-progress" style={{ scaleX: pct }} />;
});
ScrollProgress.displayName = "ScrollProgress";

/* ═══════════════════════════════════════════════════════════════
   HEADER SPOTLIGHT
═══════════════════════════════════════════════════════════════ */
const HeaderSpotlight = memo(({ headerRef }) => {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onMove = e => {
      const r = el.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [headerRef]);
  return (
    <div className="nb-spotlight" aria-hidden="true">
      <div className="nb-spotlight-inner" style={{ left: pos.x, top: pos.y, opacity: visible ? 1 : 0 }} />
    </div>
  );
});
HeaderSpotlight.displayName = "HeaderSpotlight";

/* ═══════════════════════════════════════════════════════════════
   3D LOGO
═══════════════════════════════════════════════════════════════ */
const OkanLogo = memo(({ onNav }) => {
  const ref  = useRef(null);
  const mx   = useMotionValue(0);
  const my   = useMotionValue(0);
  const mxS  = useSpring(mx, { stiffness: 200, damping: 22 });
  const myS  = useSpring(my, { stiffness: 200, damping: 22 });
  const rotX = useTransform(myS, [-0.5, 0.5], ["14deg", "-14deg"]);
  const rotY = useTransform(mxS, [-0.5, 0.5], ["-14deg", "14deg"]);
  const [hov, setHov] = useState(false);
  const reduce = useReducedMotion();

  const onMove = useCallback(e => {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (r) { mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }
  }, [mx, my, reduce]);
  const onLeave = useCallback(() => { mx.set(0); my.set(0); setHov(false); }, [mx, my]);

  return (
    <Link to="/" style={{ textDecoration:"none", display:"block", position:"relative", zIndex:70 }}
      aria-label="Perpetual Okan — home" onClick={onNav}>
      <motion.div
        ref={ref}
        onMouseMove={onMove} onMouseEnter={() => setHov(true)} onMouseLeave={onLeave}
        whileTap={{ scale: 0.88 }}
        style={{ rotateX: reduce ? 0 : rotX, rotateY: reduce ? 0 : rotY, transformStyle:"preserve-3d", perspective:"600px" }}
        className="okan-logo"
      >
        <div className="okan-box">
          <div style={{ position:"relative", transformStyle:"preserve-3d" }}>
            <div style={{ position:"absolute", top:2, left:2, fontFamily:"var(--nb-font-mono)", fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.04em", color:"rgba(0,0,0,0.85)", userSelect:"none", transform:"translateZ(-6px)" }}>OKAN</div>
            <div style={{
              fontFamily:"var(--nb-font-mono)", fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.04em",
              background: hov ? "linear-gradient(160deg,#fff 0%,#d4d4d4 40%,#888 100%)" : "linear-gradient(160deg,#e8e8e8 0%,#c0c0c0 45%,#707070 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              transform:"translateZ(8px)", userSelect:"none", position:"relative", display:"block",
              filter: hov ? "drop-shadow(0 0 7px rgba(255,255,255,0.6))" : "drop-shadow(0 1px 2px rgba(0,0,0,0.9))",
              transition:"all 0.3s",
            }}>OKAN</div>
          </div>
          <motion.div animate={{ opacity: hov ? 1 : 0, scale: hov ? 1 : 0.7 }} transition={{ duration: 0.3 }}
            style={{ position:"absolute", inset:-1, borderRadius:14, border:"1px solid rgba(255,255,255,0.35)", boxShadow:"inset 0 0 20px rgba(255,255,255,0.07), 0 0 20px rgba(255,255,255,0.08)", pointerEvents:"none" }} />
        </div>
        <div className="okan-dot" />
        <AnimatePresence>
          {hov && (
            <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }} transition={{ duration:0.16 }} className="nb-tooltip">
              Perpetual Okan
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
});
OkanLogo.displayName = "OkanLogo";

/* ═══════════════════════════════════════════════════════════════
   NAV ITEM
═══════════════════════════════════════════════════════════════ */
const NavItem = memo(({ link, active, onNav, enterDelay = 0 }) => {
  const [hov, setHov] = useState(false);
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity:0, y:-6 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: enterDelay, duration: 0.5, ease:[0.16,1,0.3,1] }}
      style={{ position:"relative" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <Link
        to={link.href} className="nb-link"
        aria-current={active ? "page" : undefined}
        style={{ color: active ? "#fff" : hov ? "rgba(255,255,255,0.88)" : "var(--nb-muted)" }}
        onClick={onNav}
      >
        {link.name}
        <AnimatePresence>
          {active && (
            <motion.span layoutId="nav-pip"
              initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0 }}
              style={{ position:"absolute", bottom:-9, left:"50%", transform:"translateX(-50%)", width:5, height:5, borderRadius:"50%", display:"block", background:"var(--nb-orange)", boxShadow:"0 0 10px var(--nb-orange), 0 0 24px rgba(249,115,22,0.55)" }}
            />
          )}
        </AnimatePresence>
        {!active && (
          <motion.span
            initial={{ scaleX:0 }} animate={{ scaleX: hov ? 1 : 0 }}
            transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
            style={{ position:"absolute", bottom:-3, left:0, right:0, height:1, display:"block", background:"linear-gradient(90deg,transparent,var(--nb-orange),transparent)", transformOrigin:"left" }}
          />
        )}
      </Link>
    </motion.div>
  );
});
NavItem.displayName = "NavItem";

/* ═══════════════════════════════════════════════════════════════
   CONTACT BUTTON
═══════════════════════════════════════════════════════════════ */
const ContactBtn = memo(({ active, onNav }) => {
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  const [mpos, setMpos] = useState({ x:50, y:50 });
  const onMove = useCallback(e => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setMpos({ x:((e.clientX-r.left)/r.width)*100, y:((e.clientY-r.top)/r.height)*100 });
  }, []);
  return (
    <Link to="/contact" style={{ textDecoration:"none" }} onClick={onNav}>
      <motion.div
        ref={ref}
        whileHover={{ scale:1.06 }} whileTap={{ scale:0.93 }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onMouseMove={onMove}
        className="nb-cta"
        style={{
          background: active ? "rgba(249,115,22,0.14)" : hov ? "linear-gradient(135deg,var(--nb-orange),var(--nb-orangeD))" : "rgba(255,255,255,0.045)",
          border:`1px solid ${active || hov ? "rgba(249,115,22,0.55)" : "var(--nb-borderB)"}`,
          color: active || hov ? "#fff" : "var(--nb-muted)",
          boxShadow: hov ? "0 10px 32px rgba(249,115,22,0.32)" : "none",
        }}
      >
        <motion.div animate={{ opacity: hov ? 1 : 0 }} style={{ position:"absolute", inset:0, pointerEvents:"none", background:`radial-gradient(circle at ${mpos.x}% ${mpos.y}%, rgba(255,255,255,0.14) 0%, transparent 60%)` }} />
        <span style={{ position:"relative", zIndex:1 }}>Contact</span>
      </motion.div>
    </Link>
  );
});
ContactBtn.displayName = "ContactBtn";

/* ═══════════════════════════════════════════════════════════════
   SOCIAL BUTTON
═══════════════════════════════════════════════════════════════ */
const Social = memo(({ href, Icon, label, play }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.a
      href={href} target="_blank" rel="noreferrer"
      whileHover={{ scale:1.14, y:-2 }} whileTap={{ scale:0.9 }}
      onMouseEnter={() => { setHov(true); play?.(); }}
      onMouseLeave={() => setHov(false)}
      aria-label={label} title={label}
      className="nb-social"
      style={{
        background: hov ? "rgba(249,115,22,0.10)" : "rgba(255,255,255,0.04)",
        border:`1px solid ${hov ? "rgba(249,115,22,0.35)" : "var(--nb-borderB)"}`,
        color: hov ? "var(--nb-orange)" : "var(--nb-muted)",
        boxShadow: hov ? "0 4px 14px rgba(249,115,22,0.22)" : "none",
      }}
    ><Icon size={13} /></motion.a>
  );
});
Social.displayName = "Social";

/* ═══════════════════════════════════════════════════════════════
   READING BADGE
═══════════════════════════════════════════════════════════════ */
const ReadingBadge = memo(({ time }) => {
  if (!time) return null;
  return (
    <span className="nb-reading-badge">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      {time} read
    </span>
  );
});
ReadingBadge.displayName = "ReadingBadge";

/* ═══════════════════════════════════════════════════════════════
   COMMAND BAR
═══════════════════════════════════════════════════════════════ */
const CommandBar = memo(({ isOpen, onClose, onNav }) => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  const reduce = useReducedMotion();
  const { copy } = useCopyHelper();

  useEffect(() => {
    if (isOpen) { setQ(""); setSel(0); setTimeout(() => inputRef.current?.focus(), 60); }
  }, [isOpen]);

  const filteredGroups = useMemo(() => {
    if (!q) return CMD_GROUPS;
    return CMD_GROUPS.map(g => ({ ...g, items: g.items.filter(it => fuzzyMatch(it.label, q)) }))
      .filter(g => g.items.length > 0);
  }, [q]);

  const flatFiltered = useMemo(() => filteredGroups.flatMap(g => g.items), [filteredGroups]);

  useEffect(() => setSel(0), [flatFiltered.length]);

  const run = useCallback((item) => {
    if (item.action === "copy-email") { copy("Perpetualokan0@gmail.com"); onClose(); return; }
    if (item.action === "resume") { window.open("/resume.pdf", "_blank"); onClose(); return; }
    if (item.external) { window.open(item.href, "_blank"); onClose(); return; }
    onNav(item.href); onClose();
  }, [copy, onNav, onClose]);

  const onKey = useCallback(e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => (s+1) % flatFiltered.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => (s-1+flatFiltered.length) % flatFiltered.length); }
    else if (e.key === "Enter" && flatFiltered[sel]) run(flatFiltered[sel]);
    else if (e.key === "Escape") onClose();
  }, [flatFiltered, sel, run, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const h = e => {
      if (q) return;
      CMD_ITEMS_FLAT.forEach(it => { if (it.kbd && e.key === it.kbd.toLowerCase()) run(it); });
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, q, run]);

  if (!isOpen) return null;

  let flatIdx = 0;
  return (
    <>
      <div className="nb-cmd-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="nb-cmd-panel" role="dialog" aria-modal="true" aria-label="Command bar"
        style={{ animation: reduce ? "none" : "cmdSlide 0.22s var(--nb-ease) forwards" }}>

        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <FiCommand size={14} color="rgba(249,115,22,0.7)" />
          <input
            ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Search pages, actions, links…"
            aria-label="Command search"
            style={{ flex:1, background:"none", border:"none", outline:"none", fontFamily:"var(--nb-font-mono)", fontSize:13, color:"#fff", letterSpacing:"0.02em" }}
          />
          <kbd className="nb-kbd">ESC</kbd>
        </div>

        <div className="nb-scroll" style={{ maxHeight:320, overflowY:"auto" }}>
          {flatFiltered.length === 0 && (
            <div style={{ padding:"20px 16px", textAlign:"center", fontFamily:"var(--nb-font-mono)", fontSize:11, color:"rgba(255,255,255,0.2)" }}>
              No results for "{q}"
            </div>
          )}
          {filteredGroups.map(group => (
            group.items.length > 0 && (
              <div key={group.label}>
                <div className="nb-cmd-group">{group.label}</div>
                {group.items.map(it => {
                  const idx = flatIdx++;
                  return (
                    <button
                      key={it.id}
                      onClick={() => run(it)}
                      style={{
                        width:"100%", padding:"10px 16px", display:"flex", alignItems:"center", gap:12,
                        background: idx === sel ? "rgba(249,115,22,0.08)" : "none",
                        border:"none", borderBottom:"1px solid rgba(255,255,255,0.03)", cursor:"pointer",
                        color: idx === sel ? "#fff" : "rgba(255,255,255,0.55)",
                        fontFamily:"var(--nb-font-mono)", fontSize:12, textAlign:"left",
                        transition:"background 0.12s",
                      }}
                      onMouseEnter={() => setSel(idx)}
                    >
                      <span style={{ fontSize:15, width:22, textAlign:"center" }}>{it.icon}</span>
                      <span style={{ flex:1 }}>{it.label}</span>
                      {it.kbd && !q && <kbd className="nb-kbd">{it.kbd}</kbd>}
                      <span style={{ fontSize:9, color:"rgba(249,115,22,0.5)", letterSpacing:"0.15em", textTransform:"uppercase" }}>
                        {it.external ? "↗ open" : it.action ? "action" : "→ go"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )
          ))}
        </div>

        <div style={{ padding:"8px 16px", borderTop:"1px solid rgba(255,255,255,0.04)", display:"flex", gap:16, flexWrap:"wrap" }}>
          {[["↵","select"],["↑↓","navigate"],["esc","close"]].map(([k,v]) => (
            <span key={k} style={{ fontFamily:"var(--nb-font-mono)", fontSize:9, color:"rgba(255,255,255,0.22)" }}>
              <kbd className="nb-kbd" style={{ marginRight:5 }}>{k}</kbd>{v}
            </span>
          ))}
        </div>
      </div>
    </>
  );
});
CommandBar.displayName = "CommandBar";

/* ═══════════════════════════════════════════════════════════════
   AUDIO TOGGLE
═══════════════════════════════════════════════════════════════ */
const AudioToggle = memo(({ enabled, toggle }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      title={enabled ? "Mute UI sounds" : "Enable UI sounds"}
      aria-label={enabled ? "Mute UI sounds" : "Enable UI sounds"}
      className="nb-social"
      style={{
        background: hov ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.03)",
        border:`1px solid ${hov ? "rgba(249,115,22,0.3)" : "var(--nb-borderB)"}`,
        color: enabled ? "var(--nb-orange)" : "var(--nb-muted)",
      }}
    >
      {enabled ? <FiVolume2 size={13} /> : <FiVolumeX size={13} />}
    </motion.button>
  );
});
AudioToggle.displayName = "AudioToggle";

/* ═══════════════════════════════════════════════════════════════
   COMMAND BUTTON
═══════════════════════════════════════════════════════════════ */
const CommandBtn = memo(({ onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale:1.06 }} whileTap={{ scale:0.92 }}
      title="Command bar (⌘K)" aria-label="Open command bar"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:"inline-flex", alignItems:"center", gap:"0.4rem",
        padding:"0.42rem 0.8rem", borderRadius:7,
        background: hov ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.04)",
        border:`1px solid ${hov ? "rgba(249,115,22,0.3)" : "var(--nb-borderB)"}`,
        cursor:"pointer", color: hov ? "rgba(249,115,22,0.8)" : "var(--nb-muted)",
        fontFamily:"var(--nb-font-mono)", fontSize:"0.38rem", letterSpacing:"0.16em",
        transition:"all 0.2s", flexShrink:0, outline:"none",
      }}
    >
      <FiCommand size={10} />
      <span>⌘K</span>
    </motion.button>
  );
});
CommandBtn.displayName = "CommandBtn";

/* ═══════════════════════════════════════════════════════════════
   STATUS CHIP (simplified for mobile)
═══════════════════════════════════════════════════════════════ */
const StatusChip = memo(() => {
  const { h, m, colon } = useLocalTime();
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:"0.45rem",
      padding:"0.35rem 0.9rem", borderRadius:100,
      background:"rgba(34,197,94,0.06)",
      border:"1px solid rgba(34,197,94,0.18)",
      backdropFilter:"blur(8px)",
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--nb-green)", boxShadow:"0 0 6px var(--nb-green)" }} />
      <span style={{ fontFamily:"var(--nb-font-mono)", fontSize:"0.4rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.18em", color:"rgba(34,197,94,0.7)" }}>
        Available
      </span>
      <span style={{ fontFamily:"var(--nb-font-mono)", fontSize:"0.38rem", color:"rgba(34,197,94,0.45)", letterSpacing:"0.06em" }}>
        {h}<span style={{ opacity: colon ? 1 : 0.4 }}>:</span>{m}
      </span>
    </div>
  );
});
StatusChip.displayName = "StatusChip";

/* ═══════════════════════════════════════════════════════════════
   MOBILE NAV LINK - cleaner
═══════════════════════════════════════════════════════════════ */
const MobileNavLink = memo(({ item, idx, active, onClick, play }) => (
  <motion.div
    initial={{ opacity:0, x:-30 }}
    animate={{ opacity:1, x:0 }}
    transition={{ delay: 0.1 + idx * 0.05, duration:0.4, ease:[0.16,1,0.3,1] }}
  >
    <Link
      to={item.href}
      onClick={() => { play?.(); onClick(); }}
      className="nb-mlink"
      aria-current={active ? "page" : undefined}
    >
      <span style={{
        fontFamily:"var(--nb-font-mono)",
        fontSize:"0.4rem", fontWeight:700, letterSpacing:"0.18em",
        color: active ? "var(--nb-orange)" : "rgba(255,255,255,0.2)",
        minWidth:28,
      }}>
        {(idx+1).toString().padStart(2,"0")}
      </span>
      <span style={{
        fontFamily:"var(--nb-font-disp)",
        fontSize:"clamp(1.6rem,7vw,2.8rem)",
        fontWeight:400, letterSpacing:"-0.01em", lineHeight:1.2,
        color: active ? "#ffffff" : "rgba(255,255,255,0.15)",
        transition:"color 0.2s",
      }}>
        {item.name}
      </span>
      {item.readingTime && (
        <span style={{
          marginLeft:"auto",
          fontFamily:"var(--nb-font-mono)", fontSize:"0.35rem",
          color:"rgba(249,115,22,0.5)", letterSpacing:"0.12em",
          textTransform:"uppercase",
        }}>
          {item.readingTime}
        </span>
      )}
    </Link>
  </motion.div>
));
MobileNavLink.displayName = "MobileNavLink";

/* ═══════════════════════════════════════════════════════════════
   MAIN NAVBAR
═══════════════════════════════════════════════════════════════ */
export default function Navbar() {
  const [overlay, dispatch] = useReducer(overlayReducer, OVERLAY_INIT);
  const { scrolled } = useSticky(40);
  const { pathname } = useLocation();
  const audio = useAudioFeedback();
  const reduce = useReducedMotion();
  const headerRef = useRef(null);

  const [flash, setFlash] = useState(false);
  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 300);
    return () => clearTimeout(t);
  }, [pathname]);

  const activeLink = useMemo(() => NAV_LINKS.find(l => l.href === pathname), [pathname]);

  useEffect(() => { dispatch({ type:"CLOSE_ALL" }); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = overlay.mobile ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [overlay.mobile]);

  useEffect(() => {
    const handler = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "k") { e.preventDefault(); dispatch({ type: overlay.command ? "CLOSE_COMMAND" : "OPEN_COMMAND" }); return; }
      if (e.key === "Escape") { dispatch({ type:"CLOSE_ALL" }); return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [overlay.command]);

  const swipeStartY = useRef(null);
  const handleTouchStart = useCallback(e => { swipeStartY.current = e.touches[0].clientY; }, []);
  const handleTouchEnd = useCallback(e => {
    if (swipeStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - swipeStartY.current;
    if (delta > 60) dispatch({ type:"CLOSE_MOBILE" });
    swipeStartY.current = null;
  }, []);

  const handleNavCommand = useCallback((href) => { window.location.href = href; }, []);
  const handleNavClick   = useCallback(() => { audio.play(); dispatch({ type:"CLOSE_ALL" }); }, [audio]);
  const toggleMobile     = useCallback(() => {
    audio.play();
    overlay.mobile ? dispatch({ type:"CLOSE_MOBILE" }) : dispatch({ type:"OPEN_MOBILE" });
  }, [overlay.mobile, audio]);
  const closeMobile = useCallback(() => { audio.play(); dispatch({ type:"CLOSE_MOBILE" }); }, [audio]);

  return (
    <div className="nb-root" role="banner">
      <style>{GLOBAL_CSS}</style>

      <a href="#main-content" className="nb-skip">Skip to content</a>
      <ScrollProgress />

      <AnimatePresence>
        {flash && (
          <motion.div className="nb-page-flash"
            initial={{ opacity:1 }} animate={{ opacity:0 }} exit={{ opacity:0 }}
            transition={{ duration:0.3 }} aria-hidden="true" />
        )}
      </AnimatePresence>

      <CommandBar isOpen={overlay.command} onClose={() => dispatch({ type:"CLOSE_COMMAND" })} onNav={handleNavCommand} />

      <motion.header
        ref={headerRef}
        initial={{ y:-80, opacity:0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.5, ease:[0.16,1,0.3,1] }}
        style={{
          position:"fixed", top:0, left:0, width:"100%", zIndex:50,
          padding: scrolled ? "0.7rem 0" : "1.25rem 0",
          background: scrolled ? "rgba(2,2,4,0.93)" : "transparent",
          backdropFilter: scrolled ? "blur(32px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(249,115,22,0.09)" : "1px solid transparent",
          boxShadow: scrolled ? "0 8px 44px rgba(0,0,0,0.6)" : "none",
          transition:"padding 0.42s var(--nb-ease), background 0.42s, border-color 0.42s, box-shadow 0.42s",
          willChange:"transform", overflow:"hidden",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <HeaderSpotlight headerRef={headerRef} />

        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ scaleX:0 }} animate={{ scaleX:1 }} exit={{ scaleX:0 }}
              transition={{ duration:0.55 }}
              style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent 0%,rgba(249,115,22,0.5) 50%,transparent 100%)", transformOrigin:"left", pointerEvents:"none" }}
            />
          )}
        </AnimatePresence>

        <nav
          style={{ maxWidth:1400, margin:"0 auto", padding:"0 5%", display:"flex", alignItems:"center", gap:"1rem", position:"relative" }}
          aria-label="Site navigation"
        >
          <OkanLogo onNav={handleNavClick} />

          <div style={{ flex:1, display:"flex", justifyContent:"center" }}>
            <div className="nb-pill nb-desktop" role="menubar" aria-label="Page links">
              {NAV_LINKS.slice(0,3).map((link, i) => (
                <NavItem key={link.href} link={link} active={pathname === link.href} onNav={handleNavClick} enterDelay={i * 0.06} />
              ))}
            </div>
          </div>

          <div className="nb-desktop-right" style={{ flexShrink:0 }}>
            {activeLink?.readingTime && <ReadingBadge time={activeLink.readingTime} />}
            <div style={{ width:1, height:20, background:"var(--nb-borderB)", flexShrink:0 }} />
            <Social href="https://github.com/Perpetualisi/" Icon={FiGithub} label="GitHub" play={audio.play} />
            <Social href="https://linkedin.com/in/perpetual-okan" Icon={FiLinkedin} label="LinkedIn" play={audio.play} />
            <AudioToggle enabled={audio.enabled} toggle={audio.toggle} />
            <CommandBtn onClick={() => { audio.play(); dispatch({ type:"OPEN_COMMAND" }); }} />
            <div style={{ width:1, height:20, background:"var(--nb-borderB)", flexShrink:0 }} />
            <ContactBtn active={pathname === "/contact"} onNav={handleNavClick} />
          </div>

          <motion.button
            onClick={toggleMobile}
            whileTap={{ scale:0.85 }}
            className="nb-mobile-btn"
            aria-label={overlay.mobile ? "Close menu" : "Open menu"}
            aria-expanded={overlay.mobile}
            aria-controls="mobile-menu"
            style={{
              position:"relative", zIndex:70, width:46, height:46, borderRadius:13,
              background: overlay.mobile ? "rgba(249,115,22,0.14)" : "rgba(255,255,255,0.055)",
              border:`1px solid ${overlay.mobile ? "rgba(249,115,22,0.5)" : "var(--nb-borderB)"}`,
              alignItems:"center", justifyContent:"center",
              cursor:"pointer", color: overlay.mobile ? "var(--nb-orange)" : "var(--nb-muted)",
              transition:"all 0.26s ease", boxShadow: overlay.mobile ? "0 0 22px rgba(249,115,22,0.22)" : "none", outline:"none",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {overlay.mobile
                ? <motion.span key="x" initial={{ rotate:-90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:90, opacity:0 }} transition={{ duration:0.18 }} style={{ display:"flex" }}><FiX size={20} /></motion.span>
                : <motion.span key="m" initial={{ rotate:90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:-90, opacity:0 }} transition={{ duration:0.18 }} style={{ display:"flex" }}><FiMenu size={20} /></motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </nav>
      </motion.header>

      {/* Cleaner Mobile Overlay */}
      <AnimatePresence>
        {overlay.mobile && (
          <motion.div
            id="mobile-menu"
            role="dialog" aria-modal="true" aria-label="Navigation menu"
            initial={{ opacity:0, x:"100%" }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:"100%" }}
            transition={{ duration: reduce ? 0.2 : 0.4, ease:[0.16,1,0.3,1] }}
            className="nb-mobile-overlay"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <motion.button
              initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }}
              transition={{ delay:0.1, duration:0.2 }}
              onClick={closeMobile} className="nb-mobile-close" aria-label="Close menu"
            >
              <FiX size={22} />
            </motion.button>

            <div style={{ position:"relative", zIndex:10, marginTop:"12vh" }}>
              {/* Section label */}
              <motion.div
                initial={{ opacity:0, x:-15 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:0.05, duration:0.4 }}
                style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"2rem" }}
              >
                <div style={{ width:3, height:20, borderRadius:2, background:"var(--nb-orange)", boxShadow:"0 0 10px var(--nb-orange)" }} />
                <span style={{ fontFamily:"var(--nb-font-mono)", fontSize:"0.42rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.45em", color:"var(--nb-orange)" }}>Menu</span>
              </motion.div>

              {/* Nav items */}
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {NAV_LINKS.map((item, idx) => (
                  <MobileNavLink key={item.href} item={item} idx={idx} active={pathname === item.href} onClick={closeMobile} play={audio.play} />
                ))}
              </div>

              {/* Bottom actions - simplified */}
              <motion.div
                initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.35, duration:0.4 }}
                style={{ marginTop:"2.5rem", paddingTop:"1.5rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}
              >
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.8rem" }}>
                  <StatusChip />
                  <div style={{ display:"flex", gap:"0.5rem" }}>
                    {[
                      { href:"https://github.com/Perpetualisi/", Icon:FiGithub, label:"GitHub" },
                      { href:"https://linkedin.com/in/perpetual-okan", Icon:FiLinkedin, label:"LinkedIn" },
                      { href:"mailto:Perpetualokan0@gmail.com", Icon:FiMail, label:"Email" },
                    ].map(s => (
                      <a key={s.label} href={s.href} target={s.href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer" aria-label={s.label}
                        style={{
                          display:"flex", alignItems:"center", justifyContent:"center",
                          width:42, height:42, borderRadius:10,
                          background:"rgba(255,255,255,0.04)",
                          border:"1px solid var(--nb-borderB)",
                          color:"var(--nb-muted)",
                          transition:"all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(249,115,22,0.4)"; e.currentTarget.style.color="var(--nb-orange)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor="var(--nb-borderB)"; e.currentTarget.style.color="var(--nb-muted)"; }}
                      >
                        <s.Icon size={15} />
                      </a>
                    ))}
                    <button
                      onClick={() => { closeMobile(); setTimeout(() => dispatch({ type:"OPEN_COMMAND" }), 280); }}
                      style={{
                        display:"flex", alignItems:"center", justifyContent:"center",
                        width:42, height:42, borderRadius:10,
                        background:"rgba(249,115,22,0.08)",
                        border:"1px solid rgba(249,115,22,0.25)",
                        color:"rgba(249,115,22,0.7)",
                        cursor:"pointer",
                      }}
                    >
                      <FiCommand size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
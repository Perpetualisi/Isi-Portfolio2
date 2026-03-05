import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import {
  FiArrowRight,
  FiDownload,
  FiClock,
  FiLayers,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:        "#010103",
  card:      "#07070d",
  orange:    "#E8622A",
  orangeD:   "#C94E1A",
  orangeG:   "#F0845A",
  // Duller, desaturated copper-bronze for "Okan"
  okanA:     "#B8672A",   // deep burnt sienna
  okanB:     "#A0522D",   // saddle brown / duller
  okanC:     "#C8763A",   // mid copper
  gold:      "#D4923A",
  text:      "#F2EEF8",
  muted:     "rgba(242,238,248,0.40)",
  faint:     "rgba(242,238,248,0.08)",
  border:    "rgba(232,98,42,0.16)",
  borderB:   "rgba(255,255,255,0.055)",
  glass:     "rgba(7,7,13,0.82)",
};

// ─── STABLE PARTICLES (generated once) ───────────────────────────────────────
const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: (i * 37.3 + 11) % 100,
  y: (i * 53.7 + 7)  % 100,
  size: (i % 5) * 0.4 + 0.5,
  dur:  (i % 7) * 1.2 + 5,
  delay:(i % 9) * 1.1,
  opacity: (i % 6) * 0.06 + 0.08,
  type: i % 5 === 0 ? "star" : i % 3 === 0 ? "orange" : "white",
}));

function ParticleField() {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            opacity: [p.opacity, p.opacity * 0.1, p.opacity],
            y: [0, -26, 0],
            scale: p.type === "star" ? [1,1.8,1] : [1,1.1,1],
          }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: `${p.x}%`, top: `${p.y}%`,
            width:  p.type === "star" ? p.size * 1.6 : p.size,
            height: p.type === "star" ? p.size * 1.6 : p.size,
            borderRadius: p.type === "star" ? "2px" : "50%",
            transform: p.type === "star" ? "rotate(45deg)" : undefined,
            background: p.type === "orange" ? T.orange
              : p.type === "star"  ? T.gold
              : "rgba(255,255,255,0.88)",
            boxShadow: p.type === "orange" ? `0 0 ${p.size*5}px ${T.orange}`
              : p.type === "star"  ? `0 0 ${p.size*4}px ${T.gold}` : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── ORBITAL RINGS ────────────────────────────────────────────────────────────
function OrbitalRings({ scale = 1 }) {
  const rings = [
    { size: 240*scale, dur:20,  dir:1,  orbs:2, color:T.orange,  op:0.14 },
    { size: 360*scale, dur:34,  dir:-1, orbs:3, color:T.gold,    op:0.09 },
    { size: 480*scale, dur:52,  dir:1,  orbs:2, color:T.orangeG, op:0.05 },
    { size: 600*scale, dur:72,  dir:-1, orbs:1, color:T.orange,  op:0.03 },
  ];
  return (
    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", overflow:"hidden" }}>
      {rings.map((ring, i) => (
        <motion.div key={i}
          animate={{ rotate: 360 * ring.dir }}
          transition={{ duration: ring.dur, repeat: Infinity, ease: "linear" }}
          style={{ position:"absolute", width:ring.size, height:ring.size, borderRadius:"50%", border:`1px solid rgba(232,98,42,${ring.op})` }}
        >
          {Array.from({ length: ring.orbs }).map((_, j) => (
            <div key={j} style={{
              position:"absolute",
              top:    j===0 ? -4 : "auto",
              bottom: j===1 ? -4 : "auto",
              left:   j===2 ? -4 : "50%",
              transform: "translateX(-50%)",
              width:7, height:7, borderRadius:"50%",
              background: ring.color,
              boxShadow: `0 0 12px ${ring.color}, 0 0 24px ${ring.color}55`,
            }}/>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// ─── NOISE OVERLAY ────────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <div style={{
      position:"absolute", inset:0, pointerEvents:"none", zIndex:2, opacity:0.025,
      backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat:"repeat", backgroundSize:"128px",
    }}/>
  );
}

// ─── 3D PROFILE CARD ─────────────────────────────────────────────────────────
function ProfileCard3D({ time, isMobile }) {
  const ref   = useRef(null);
  const mx    = useMotionValue(0);
  const my    = useMotionValue(0);
  const rotX  = useSpring(useTransform(my, [-0.5,0.5], ["20deg","-20deg"]), { stiffness:60, damping:13 });
  const rotY  = useSpring(useTransform(mx, [-0.5,0.5], ["-20deg","20deg"]), { stiffness:60, damping:13 });
  const glareX= useTransform(mx, [-0.5,0.5], ["0%","100%"]);
  const glareY= useTransform(my, [-0.5,0.5], ["0%","100%"]);
  const glareBg = useTransform([glareX,glareY], (l) =>
    `radial-gradient(circle at ${l[0]} ${l[1]}, rgba(255,255,255,0.12) 0%, transparent 58%)`);
  const shadowX = useTransform(mx, [-0.5,0.5], [-36,36]);
  const shadowY = useTransform(my, [-0.5,0.5], [-24,24]);
  const dynShadow = useTransform([shadowX,shadowY], (l) =>
    `${l[0]}px ${l[1]}px 90px rgba(0,0,0,0.95), 0 0 0 1px rgba(232,98,42,0.12), 0 0 60px rgba(232,98,42,0.08)`);

  const [hov,     setHov]     = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setScanned(true), 1700);
    return () => clearTimeout(t);
  }, []);

  function handleMove(e) {
    if (isMobile) return;
    const r = ref.current?.getBoundingClientRect();
    if (r) { mx.set((e.clientX-r.left)/r.width-0.5); my.set((e.clientY-r.top)/r.height-0.5); }
  }

  const cardW = isMobile ? 260 : 400;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => { if (!isMobile) setHov(true); }}
      onMouseLeave={() => { mx.set(0); my.set(0); setHov(false); }}
      initial={{ opacity:0, scale:0.78, y:50, rotateX:15 }}
      animate={{ opacity:1, scale:1,    y:0,  rotateX:0  }}
      transition={{ duration:1.15, delay:0.3, ease:[0.16,1,0.3,1] }}
      style={{
        rotateX: isMobile ? 0 : rotX,
        rotateY: isMobile ? 0 : rotY,
        transformStyle:"preserve-3d",
        perspective:"1500px",
        position:"relative",
        width: cardW,
        cursor:"default",
        boxShadow: isMobile ? undefined : dynShadow,
      }}
    >
      {/* ── Ambient halos ── */}
      <motion.div animate={{ opacity: hov?1:0.55, scale: hov?1.12:1 }} transition={{ duration:0.9 }}
        style={{ position:"absolute", inset:-40, borderRadius:44,
          background:"radial-gradient(ellipse, rgba(232,98,42,0.2) 0%, rgba(232,98,42,0.05) 50%, transparent 70%)",
          filter:"blur(32px)", pointerEvents:"none", zIndex:-1 }}/>
      <motion.div animate={{ opacity: hov?0.55:0.18 }} transition={{ duration:1 }}
        style={{ position:"absolute", inset:-24, borderRadius:40,
          background:"radial-gradient(ellipse at 25% 75%, rgba(100,60,220,0.1) 0%, transparent 60%)",
          filter:"blur(22px)", pointerEvents:"none", zIndex:-1 }}/>

      {/* ── Stacked ghost frames ── */}
      <div style={{ position:"absolute", inset:-10, borderRadius:36, border:"1px solid rgba(232,98,42,0.1)",  transform:"rotate(3.8deg) scale(1.01)", background:"rgba(232,98,42,0.015)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", inset:-18, borderRadius:40, border:"1px solid rgba(232,98,42,0.055)", transform:"rotate(-2.2deg) scale(1.01)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", inset:-27, borderRadius:46, border:"1px solid rgba(232,98,42,0.025)", transform:"rotate(1.1deg)", pointerEvents:"none" }}/>

      {/* ── Card shell ── */}
      <div style={{
        position:"relative", padding:5, borderRadius:28,
        background:"linear-gradient(148deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.015) 100%)",
        border:"1px solid rgba(255,255,255,0.08)",
        boxShadow:"inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.35)",
        backdropFilter:"blur(24px)",
      }}>
        {/* Glare */}
        <motion.div style={{ position:"absolute", inset:0, borderRadius:28, pointerEvents:"none", zIndex:12,
          background: glareBg, opacity: hov?1:0, transition:"opacity 0.4s" }}/>

        {/* Scanline sweep */}
        <AnimatePresence>
          {scanned && (
            <motion.div
              key="scan"
              initial={{ top:"-6%" }}
              animate={{ top:"108%" }}
              exit={{ opacity:0 }}
              transition={{ duration:1.8, ease:"easeIn" }}
              style={{ position:"absolute", left:0, right:0, height:"9%",
                background:"linear-gradient(to bottom,transparent,rgba(232,98,42,0.07) 40%,rgba(232,98,42,0.1) 50%,rgba(232,98,42,0.07) 60%,transparent)",
                pointerEvents:"none", zIndex:14, borderRadius:28 }}/>
          )}
        </AnimatePresence>

        {/* ── Photo ── */}
        <div style={{ position:"relative", borderRadius:24, overflow:"hidden" }}>
          <img src="/profile41.jpeg" alt="Perpetual Okan"
            style={{
              width:"100%",
              aspectRatio: isMobile ? "3/4" : "4/5",
              objectFit:"cover", display:"block",
              filter: hov ? "saturate(1.28) brightness(1.08) contrast(1.07)" : "saturate(1.05)",
              transform: hov ? "scale(1.055)" : "scale(1)",
              transition:"all 0.95s cubic-bezier(0.16,1,0.3,1)",
            }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(232,98,42,0.06) 0%,transparent 35%,rgba(1,1,3,0.7) 100%)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", inset:0, boxShadow:"inset 0 0 0 1px rgba(232,98,42,0.1)", borderRadius:24, pointerEvents:"none" }}/>
        </div>

        {/* Role pill */}
        <div style={{
          position:"absolute", top:"0.85rem", left:"0.85rem",
          background:"rgba(1,1,3,0.82)", backdropFilter:"blur(20px)",
          border:"1px solid rgba(232,98,42,0.34)", borderRadius:100,
          padding:"0.3rem 0.8rem", display:"flex", alignItems:"center", gap:"0.42rem",
          boxShadow:"0 2px 14px rgba(232,98,42,0.14)",
        }}>
          <span className="live-dot" style={{ width:5, height:5, borderRadius:"50%", background:T.orange, boxShadow:`0 0 8px ${T.orange}`, display:"inline-block", flexShrink:0 }}/>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.44rem", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.88)" }}>Full-Stack Engineer</span>
        </div>

        {/* Portfolio year watermark */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.8 }}
          style={{ position:"absolute", bottom:"1.1rem", left:"1rem" }}>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.38rem", color:"rgba(255,255,255,0.35)", margin:0, letterSpacing:"0.22em", textTransform:"uppercase" }}>PORTFOLIO 2025</p>
        </motion.div>
      </div>

      {/* ── System Live badge ── */}
      <motion.div
        initial={{ opacity:0, x:22, y:12 }}
        animate={{ opacity:1, x:0,  y:0  }}
        transition={{ delay:1.25, duration:0.85, ease:[0.16,1,0.3,1] }}
        style={{
          position:"absolute",
          bottom: isMobile ? -26 : -32,
          right:  isMobile ? -8  : -24,
          zIndex:20,
          background:"linear-gradient(135deg,rgba(7,7,13,0.97) 0%,rgba(12,10,20,0.97) 100%)",
          backdropFilter:"blur(28px)",
          border:"1px solid rgba(232,98,42,0.26)", borderRadius:18,
          padding: isMobile ? "0.58rem 0.88rem" : "0.82rem 1.18rem",
          display:"flex", alignItems:"center", gap:"0.65rem",
          boxShadow:"0 22px 55px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ width:isMobile?32:38, height:isMobile?32:38, borderRadius:10, flexShrink:0,
          background:"linear-gradient(135deg,rgba(232,98,42,0.2) 0%,rgba(232,98,42,0.06) 100%)",
          border:"1px solid rgba(232,98,42,0.3)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`inset 0 1px 0 rgba(255,255,255,0.06), 0 0 14px rgba(232,98,42,0.1)`,
        }}>
          <FiClock style={{ color:T.orange, fontSize: isMobile?13:15 }}/>
        </div>
        <div>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.4rem", color:"rgba(232,98,42,0.72)", textTransform:"uppercase", letterSpacing:"0.18em", fontWeight:700, marginBottom:3, marginTop:0 }}>System Live</p>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize: isMobile?"0.72rem":"0.82rem", color:T.text, fontWeight:700, margin:0, letterSpacing:"0.04em" }}>{time}</p>
        </div>
      </motion.div>

      {/* ── Stack badge (hidden on very small mobile) ── */}
      {!isMobile && (
        <motion.div
          initial={{ opacity:0, x:-22 }}
          animate={{ opacity:1, x:0   }}
          transition={{ delay:1.45, duration:0.85, ease:[0.16,1,0.3,1] }}
          style={{
            position:"absolute", top:"22%", left:-40, zIndex:20,
            background:"linear-gradient(135deg,rgba(7,7,13,0.97) 0%,rgba(12,10,20,0.97) 100%)",
            backdropFilter:"blur(28px)",
            border:"1px solid rgba(232,98,42,0.2)", borderRadius:14,
            padding:"0.65rem 0.95rem",
            display:"flex", flexDirection:"column", gap:"0.12rem",
            boxShadow:"0 18px 44px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.38rem", color:"rgba(232,98,42,0.6)", textTransform:"uppercase", letterSpacing:"0.16em" }}>Tech Stack</span>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.1rem", color:T.text, letterSpacing:"0.06em", lineHeight:1 }}>React</span>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.38rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.1em" }}>Node · Next · TS</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── STAT CHIP ────────────────────────────────────────────────────────────────
function Stat({ icon: Icon, value, label, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0, y:18 }}
      animate={{ opacity:1, y:0   }}
      transition={{ delay, duration:0.65, ease:[0.16,1,0.3,1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:"flex", alignItems:"center", gap:"0.65rem",
        padding:"0.72rem 1rem", borderRadius:14, flex:1, minWidth:0,
        background: hov
          ? "linear-gradient(135deg,rgba(232,98,42,0.12) 0%,rgba(232,98,42,0.04) 100%)"
          : "linear-gradient(135deg,rgba(255,255,255,0.035) 0%,rgba(255,255,255,0.01) 100%)",
        border:`1px solid ${hov ? "rgba(232,98,42,0.38)" : T.borderB}`,
        boxShadow: hov ? "0 8px 28px rgba(232,98,42,0.12), inset 0 1px 0 rgba(255,255,255,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.03)",
        transition:"all 0.35s cubic-bezier(0.16,1,0.3,1)", cursor:"default",
      }}
    >
      <div style={{
        width:30, height:30, borderRadius:8, flexShrink:0,
        background: hov ? "rgba(232,98,42,0.2)" : "rgba(232,98,42,0.08)",
        border:`1px solid ${hov ? "rgba(232,98,42,0.44)" : "rgba(232,98,42,0.14)"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.35s ease",
        boxShadow: hov ? `0 0 18px rgba(232,98,42,0.22)` : "none",
      }}>
        <Icon style={{ color:T.orange, fontSize:12 }}/>
      </div>
      <div style={{ minWidth:0 }}>
        <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.08rem", color:T.text, lineHeight:1, margin:0, letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{value}</p>
        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.4rem", textTransform:"uppercase", letterSpacing:"0.2em", color:T.muted, marginTop:2, marginBottom:0, whiteSpace:"nowrap" }}>{label}</p>
      </div>
    </motion.div>
  );
}

// ─── SCROLL INDICATOR ─────────────────────────────────────────────────────────
function ScrollIndicator({ opacity }) {
  return (
    <motion.div style={{ opacity, position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:10, pointerEvents:"none" }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:2.6 }}>
      <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.38rem", textTransform:"uppercase", letterSpacing:"0.45em", color:"rgba(255,255,255,0.16)" }}>Scroll</span>
      <div style={{ width:20, height:34, border:"1px solid rgba(255,255,255,0.1)", borderRadius:100, display:"flex", justifyContent:"center", padding:"4px 0" }}>
        <motion.div animate={{ y:[0,13,0], opacity:[1,0,1] }} transition={{ duration:1.9, repeat:Infinity, ease:"easeInOut" }}
          style={{ width:3, height:8, background:`linear-gradient(to bottom,${T.orange},${T.orangeG})`, borderRadius:100, boxShadow:`0 0 7px ${T.orange}` }}/>
      </div>
    </motion.div>
  );
}

// ─── PER-CHAR 3D FLIP ────────────────────────────────────────────────────────
function FlipChar({ char, delay, style = {} }) {
  return (
    <motion.span
      initial={{ opacity:0, y:36, rotateX:-70 }}
      animate={{ opacity:1, y:0,  rotateX:0   }}
      transition={{ delay, duration:0.72, ease:[0.16,1,0.3,1] }}
      style={{ display:"inline-block", transformStyle:"preserve-3d", ...style }}
    >
      {char}
    </motion.span>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const containerRef = useRef(null);
  const { scrollY }  = useScroll();
  const [time,      setTime]      = useState(new Date());
  const [isMobile,  setIsMobile]  = useState(false);
  const [isSmall,   setIsSmall]   = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const mxS = useSpring(mouseX, { stiffness:50, damping:22 });
  const myS = useSpring(mouseY, { stiffness:50, damping:22 });

  const opacity   = useTransform(scrollY, [0, 420], [1, 0]);
  const yRaw      = useTransform(scrollY, [0, 600], [0, -85]);
  const yParallax = useSpring(yRaw, { stiffness:65, damping:28 });

  const spotlightBg = useTransform([mxS, myS], (l) =>
    `radial-gradient(950px circle at ${l[0]*100}% ${l[1]*100}%, rgba(232,98,42,0.07), transparent 62%)`);
  const goldVignette = useTransform([mxS, myS], (l) =>
    `radial-gradient(ellipse at ${l[0]*100}% ${l[1]*100}%, rgba(212,146,58,0.025) 0%, transparent 55%)`);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSmall( window.innerWidth < 480);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isMobile) return;
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top)  / r.height);
  }, [mouseX, mouseY, isMobile]);

  const formattedTime = time.toLocaleTimeString("en-US", { hour12:true, hour:"2-digit", minute:"2-digit", second:"2-digit" });

  const firstName = "Perpetual".split("");
  const lastName  = "Okan".split("");

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position:"relative", minHeight:"100vh",
        display:"flex", flexDirection:"column", justifyContent:"center",
        background: T.bg, overflow:"hidden",
        /* ─── KEY FIX: generous top padding so content clears navbar + breathes ─── */
        paddingTop:    isMobile ? "calc(var(--navbar-height, 70px) + 4.5rem)" : "calc(var(--navbar-height, 70px) + 5.5rem)",
        paddingBottom: isMobile ? "7rem" : "6rem",
        paddingLeft:   isSmall  ? "4%"   : isMobile ? "5%" : "6%",
        paddingRight:  isSmall  ? "4%"   : isMobile ? "5%" : "6%",
      }}
    >
      {/* ─── GLOBAL STYLES ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Two-column desktop ── */
        .hg {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          grid-template-areas: "text img";
          gap: 4.5rem;
          align-items: center;
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
        }
        .hg-text { grid-area: text; display:flex; flex-direction:column; }
        .hg-img  { grid-area: img;  display:flex; justify-content:center; align-items:center; }

        /* ── Tablet / mobile: image first, then text ── */
        @media (max-width: 1023px) {
          .hg {
            grid-template-columns: 1fr;
            grid-template-areas: "img" "text";
            gap: 3.5rem;
            text-align: center;
          }
          .hg-stats   { justify-content: center !important; }
          .hg-btns    { justify-content: center !important; }
          .hg-eyebrow { justify-content: center !important; }
          .hg-divider { display: none !important; }
          .hg-desc {
            margin-left: auto !important;
            margin-right: auto !important;
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid rgba(232,98,42,0.2) !important;
            padding-top: 1.1rem !important;
          }
        }

        /* ── Small phones ── */
        @media (max-width: 479px) {
          .hg-btns  { flex-direction: column !important; align-items: stretch !important; }
          .hg-stats { flex-wrap: wrap !important; }
        }

        /* ── Live dot pulse ── */
        @keyframes ldp { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.25;transform:scale(.65)} }
        .ldot { animation: ldp 2.2s infinite; }

        /* ── CTA shimmer ── */
        @keyframes shim { 0%{transform:translateX(-120%)} 100%{transform:translateX(320%)} }
        .shim { position:relative; overflow:hidden; }
        .shim::after {
          content:''; position:absolute; inset:0;
          background: linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.13) 50%,transparent 100%);
          animation: shim 3.8s infinite; border-radius: inherit;
        }
      `}</style>

      {/* ── Background layers ── */}
      <ParticleField />
      <NoiseOverlay />

      {/* Gradient mesh blobs */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-18%", right:"10%",  width:"58vw", height:"58vw", borderRadius:"50%", background:"radial-gradient(ellipse,rgba(232,98,42,0.07) 0%,transparent 65%)", filter:"blur(70px)" }}/>
        <div style={{ position:"absolute", bottom:"-12%", left:"2%",  width:"42vw", height:"42vw", borderRadius:"50%", background:"radial-gradient(ellipse,rgba(110,60,240,0.05) 0%,transparent 65%)", filter:"blur(55px)" }}/>
        <div style={{ position:"absolute", top:"25%",   left:"-5%",  width:"28vw", height:"28vw", borderRadius:"50%", background:"radial-gradient(ellipse,rgba(212,146,58,0.045) 0%,transparent 65%)", filter:"blur(45px)" }}/>
      </div>

      {/* Orbital rings — desktop */}
      {!isMobile && (
        <div style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", width:"48vw", height:"100vh", pointerEvents:"none", overflow:"hidden", zIndex:1 }}>
          <OrbitalRings scale={1} />
        </div>
      )}
      {/* Orbital rings — mobile (smaller, centred behind card) */}
      {isMobile && (
        <div style={{ position:"absolute", top:"3%", left:"50%", transform:"translateX(-50%)", width:"100vw", height:"54vh", pointerEvents:"none", overflow:"hidden", zIndex:1 }}>
          <OrbitalRings scale={0.62} />
        </div>
      )}

      {/* Mouse spotlight */}
      <motion.div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1, background:spotlightBg }}/>
      <motion.div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1, background:goldVignette }}/>

      {/* Fine grid lines */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"linear-gradient(rgba(255,255,255,0.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.016) 1px,transparent 1px)",
        backgroundSize:"70px 70px",
        maskImage:"radial-gradient(ellipse 85% 65% at 50% 0%,black 35%,transparent 100%)",
      }}/>

      {/* Diagonal accent lines */}
      <div style={{ position:"absolute", top:0, right:"36%", width:1, height:"100%", background:"linear-gradient(to bottom,transparent 0%,rgba(232,98,42,0.13) 45%,transparent 100%)", transform:"rotate(10deg)", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"absolute", top:0, right:"40%", width:1, height:"60%", background:"linear-gradient(to bottom,transparent 0%,rgba(212,146,58,0.055) 55%,transparent 100%)", transform:"rotate(10deg)", pointerEvents:"none", zIndex:0 }}/>

      {/* ── MAIN GRID ── */}
      <div style={{ position:"relative", zIndex:10 }}>
        <motion.div style={{ y: yParallax }} className="hg">

          {/* IMAGE col */}
          <div className="hg-img">
            <ProfileCard3D time={formattedTime} isMobile={isMobile} />
          </div>

          {/* TEXT col */}
          <div className="hg-text" style={{ gap: isMobile ? "1.55rem" : "1.9rem" }}>

            {/* ── Eyebrow ── */}
            <motion.div
              initial={{ opacity:0, y: isMobile?14:0, x: isMobile?0:-26 }}
              animate={{ opacity:1, y:0, x:0 }}
              transition={{ duration:0.8, delay:0.52 }}
              className="hg-eyebrow"
              style={{ display:"flex", alignItems:"center", gap:"0.8rem" }}
            >
              <div className="hg-divider" style={{ height:1, width:30, background:`linear-gradient(to right,transparent,${T.orange})`, flexShrink:0 }}/>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:"0.5rem",
                padding:"0.34rem 0.95rem", borderRadius:100,
                background:"linear-gradient(135deg,rgba(232,98,42,0.1) 0%,rgba(232,98,42,0.04) 100%)",
                border:"1px solid rgba(232,98,42,0.3)",
                backdropFilter:"blur(14px)",
                boxShadow:"0 4px 16px rgba(232,98,42,0.09), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}>
                <span className="ldot" style={{ width:6, height:6, borderRadius:"50%", background:T.orange, boxShadow:`0 0 10px ${T.orange},0 0 20px ${T.orange}44`, display:"inline-block", flexShrink:0 }}/>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.47rem", fontWeight:700, letterSpacing:"0.26em", textTransform:"uppercase", color:"rgba(240,132,90,0.95)", whiteSpace:"nowrap" }}>Full-Stack Engineer</span>
              </div>
              <div className="hg-divider" style={{ height:1, flex:1, background:`linear-gradient(to right,${T.border},transparent)` }}/>
            </motion.div>

            {/* ── Headline ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:"0.2rem" }}>
              <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.63, duration:0.6 }}
                style={{ fontFamily:"'Space Mono',monospace", fontSize: isSmall?"0.52rem":"0.62rem", fontWeight:700, letterSpacing:"0.36em", textTransform:"uppercase", color:T.muted, margin:0 }}>
                Hi, I'm
              </motion.p>

              <h1 style={{ margin:0, lineHeight:0.88, fontFamily:"'Bebas Neue',sans-serif",
                fontSize: isSmall ? "clamp(3rem,14vw,4.2rem)" : isMobile ? "clamp(3.2rem,10vw,5.5rem)" : "clamp(3.5rem,7.5vw,7.8rem)",
                fontWeight:400, letterSpacing:"-0.01em" }}>

                {/* "Perpetual" — pure white */}
                <div style={{ color:T.text }}>
                  {firstName.map((ch, i) => (
                    <FlipChar key={i} char={ch} delay={0.66 + i * 0.05} />
                  ))}
                </div>

                {/* "Okan" — dull desaturated burnt-copper, NOT vivid orange */}
                <div>
                  {lastName.map((ch, i) => (
                    <motion.span key={i}
                      initial={{ opacity:0, y:36, rotateX:-70 }}
                      animate={{ opacity:1, y:0,  rotateX:0  }}
                      transition={{ delay:0.92 + i*0.07, duration:0.72, ease:[0.16,1,0.3,1] }}
                      style={{
                        display:"inline-block",
                        transformStyle:"preserve-3d",
                        /* ── dull desaturated copper-bronze gradient ── */
                        background:`linear-gradient(140deg, ${T.okanA} 0%, ${T.okanC} 40%, ${T.okanB} 70%, ${T.okanA} 100%)`,
                        WebkitBackgroundClip:"text",
                        WebkitTextFillColor:"transparent",
                        /* subtle, not blinding */
                        filter:`drop-shadow(0 0 18px rgba(184,103,42,0.28)) drop-shadow(0 2px 6px rgba(0,0,0,0.5))`,
                      }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </div>
              </h1>

              <motion.h2 initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.88, duration:0.7 }}
                style={{ fontFamily:"'Space Mono',monospace",
                  fontSize: isSmall ? "0.6rem" : isMobile ? "0.68rem" : "clamp(0.65rem,1.35vw,0.9rem)",
                  fontWeight:400, color:T.muted, margin:"0.5rem 0 0",
                  letterSpacing:"0.12em", textTransform:"uppercase" }}>
                Full-Stack Developer
              </motion.h2>
            </div>

            {/* ── Description ── */}
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.94, duration:0.75 }}
              className="hg-desc"
              style={{
                fontFamily:"'Space Mono',monospace",
                fontSize: isSmall ? "0.6rem" : "clamp(0.64rem,1.1vw,0.78rem)",
                lineHeight:2, color:T.muted, maxWidth:470, margin:0,
                borderLeft:"2px solid rgba(232,98,42,0.28)",
                paddingLeft:"1.25rem",
              }}>
              I build websites and web apps that are responsive, easy to use, and work well on any device.
              I work on both the frontend and backend to turn ideas into real digital products.
            </motion.p>

            {/* ── CTAs ── */}
            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.04, duration:0.75 }}
              className="hg-btns"
              style={{ display:"flex", gap:"0.82rem", flexWrap:"wrap" }}>

              <Link to="/portfolio" style={{ textDecoration:"none", flex: isMobile ? 1 : "none" }}>
                <motion.div
                  whileHover={{ scale:1.045, boxShadow:`0 22px 55px rgba(232,98,42,0.44), 0 0 0 1px rgba(232,98,42,0.42)` }}
                  whileTap={{ scale:0.97 }}
                  className="shim"
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"0.55rem",
                    padding: isSmall ? "0.85rem 1.4rem" : "0.94rem 2.1rem",
                    borderRadius:6,
                    background:`linear-gradient(135deg,${T.orange} 0%,${T.orangeD} 60%,#b03a0e 100%)`,
                    color:"#fff", fontFamily:"'Space Mono',monospace",
                    fontSize: isSmall ? "0.55rem" : "0.58rem",
                    fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase",
                    boxShadow:`0 8px 32px rgba(232,98,42,0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.22)`,
                    cursor:"pointer", width:"100%", transition:"box-shadow 0.3s ease",
                  }}>
                  Explore Work <FiArrowRight style={{ fontSize:13 }}/>
                </motion.div>
              </Link>

              <motion.button
                whileHover={{ borderColor:"rgba(232,98,42,0.5)", color:T.text, background:"rgba(232,98,42,0.065)", boxShadow:"0 8px 28px rgba(232,98,42,0.09)" }}
                whileTap={{ scale:0.97 }}
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = "/Perpetuual-cv.pdf";
                  a.download = "Perpetual_Okan_Resume.pdf";
                  document.body.appendChild(a); a.click(); document.body.removeChild(a);
                }}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"0.55rem",
                  padding: isSmall ? "0.85rem 1.4rem" : "0.94rem 2.1rem",
                  borderRadius:6,
                  background:"rgba(255,255,255,0.02)",
                  border:"1px solid rgba(255,255,255,0.08)",
                  color:T.muted, fontFamily:"'Space Mono',monospace",
                  fontSize: isSmall ? "0.55rem" : "0.58rem",
                  fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase",
                  cursor:"pointer", transition:"all 0.3s ease",
                  backdropFilter:"blur(10px)", flex: isMobile ? 1 : "none",
                  boxShadow:"inset 0 1px 0 rgba(255,255,255,0.04)",
                }}>
                <FiDownload style={{ fontSize:13 }}/> Get Resume
              </motion.button>
            </motion.div>

            {/* ── Stats ── */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.18, duration:0.75 }}
              className="hg-stats"
              style={{ display:"flex", gap:"0.55rem", paddingTop:"1.2rem", borderTop:"1px solid rgba(255,255,255,0.055)" }}>
              <Stat icon={FiLayers}      value="15+"        label="Projects"   delay={1.22} />
              <Stat icon={FiZap}         value="React"      label="Expert"     delay={1.32} />
              <Stat icon={FiCheckCircle} value="Full-Stack" label="Specialist" delay={1.42} />
            </motion.div>

          </div>
        </motion.div>
      </div>

      <ScrollIndicator opacity={opacity} />
    </section>
  );
}
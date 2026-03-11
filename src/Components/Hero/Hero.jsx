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
  bg:      "#010103",
  orange:  "#E8622A",
  orangeD: "#C94E1A",
  orangeG: "#F0845A",
  okanA:   "#B8672A",
  okanB:   "#A0522D",
  okanC:   "#C8763A",
  gold:    "#D4923A",
  text:    "#F2EEF8",
  muted:   "rgba(242,238,248,0.40)",
  borderB: "rgba(255,255,255,0.055)",
  border:  "rgba(232,98,42,0.16)",
};

// ─── PARTICLES ────────────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  x: (i * 37.3 + 11) % 100,
  y: (i * 53.7 + 7) % 100,
  size: (i % 5) * 0.4 + 0.5,
  dur: (i % 7) * 1.2 + 5,
  delay: (i % 9) * 1.1,
  opacity: (i % 6) * 0.06 + 0.08,
  type: i % 5 === 0 ? "star" : i % 3 === 0 ? "orange" : "white",
}));

function ParticleField() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {PARTICLES.map((p) => (
        <motion.div key={p.id}
          animate={{ opacity: [p.opacity, p.opacity * 0.1, p.opacity], y: [0, -26, 0], scale: p.type === "star" ? [1, 1.8, 1] : [1, 1.1, 1] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
            width: p.type === "star" ? p.size * 1.6 : p.size,
            height: p.type === "star" ? p.size * 1.6 : p.size,
            borderRadius: p.type === "star" ? "2px" : "50%",
            transform: p.type === "star" ? "rotate(45deg)" : undefined,
            background: p.type === "orange" ? T.orange : p.type === "star" ? T.gold : "rgba(255,255,255,0.88)",
            boxShadow: p.type === "orange" ? `0 0 ${p.size * 5}px ${T.orange}` : p.type === "star" ? `0 0 ${p.size * 4}px ${T.gold}` : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── ORBITAL RINGS ────────────────────────────────────────────────────────────
function OrbitalRings({ scale = 1 }) {
  const rings = [
    { size: 240 * scale, dur: 20, dir: 1,  orbs: 2, color: T.orange,  op: 0.14 },
    { size: 360 * scale, dur: 34, dir: -1, orbs: 3, color: T.gold,    op: 0.09 },
    { size: 480 * scale, dur: 52, dir: 1,  orbs: 2, color: T.orangeG, op: 0.05 },
    { size: 600 * scale, dur: 72, dir: -1, orbs: 1, color: T.orange,  op: 0.03 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden" }}>
      {rings.map((ring, i) => (
        <motion.div key={i}
          animate={{ rotate: 360 * ring.dir }}
          transition={{ duration: ring.dur, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", width: ring.size, height: ring.size, borderRadius: "50%", border: `1px solid rgba(232,98,42,${ring.op})` }}
        >
          {Array.from({ length: ring.orbs }).map((_, j) => (
            <div key={j} style={{
              position: "absolute", top: j === 0 ? -4 : "auto", bottom: j === 1 ? -4 : "auto",
              left: j === 2 ? -4 : "50%", transform: "translateX(-50%)",
              width: 7, height: 7, borderRadius: "50%", background: ring.color,
              boxShadow: `0 0 12px ${ring.color}, 0 0 24px ${ring.color}55`,
            }} />
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
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, opacity: 0.025,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat", backgroundSize: "128px",
    }} />
  );
}

// ─── TYPEWRITER ───────────────────────────────────────────────────────────────
const ROLES = ["Full-Stack Engineer", "React Specialist", "Node.js Developer", "UI/UX Craftsman"];

function Typewriter() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    const target = ROLES[roleIdx];
    let timer;
    if (phase === "typing") {
      if (displayed.length < target.length) timer = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 68);
      else timer = setTimeout(() => setPhase("pausing"), 1800);
    } else if (phase === "pausing") {
      timer = setTimeout(() => setPhase("deleting"), 400);
    } else {
      if (displayed.length > 0) timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 36);
      else { setRoleIdx((i) => (i + 1) % ROLES.length); setPhase("typing"); }
    }
    return () => clearTimeout(timer);
  }, [displayed, phase, roleIdx]);

  return (
    <span style={{ color: T.text }}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
        style={{ display: "inline-block", width: 2, height: "0.85em", background: T.orange, marginLeft: 3, verticalAlign: "middle", borderRadius: 1 }}
      />
    </span>
  );
}

// ─── DESKTOP ONLY: AVAILABILITY BADGE ────────────────────────────────────────
function AvailBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.65 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.45rem",
        padding: "0.3rem 0.85rem", borderRadius: 100, alignSelf: "flex-start",
        background: "linear-gradient(135deg,rgba(34,197,94,0.09) 0%,rgba(34,197,94,0.03) 100%)",
        border: "1px solid rgba(34,197,94,0.24)", backdropFilter: "blur(12px)",
      }}
    >
      <motion.span
        animate={{ opacity: [1, 0.2, 1], scale: [1, 0.65, 1] }}
        transition={{ duration: 2.1, repeat: Infinity }}
        style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", display: "inline-block", flexShrink: 0 }}
      />
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.34rem,0.9vw,0.42rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(134,239,172,0.9)", fontWeight: 700 }}>
        Available for hire
      </span>
    </motion.div>
  );
}



// ─── DESKTOP ONLY: SKILL PROGRESS BARS ───────────────────────────────────────
const SKILL_BARS = [
  { label: "Frontend", pct: 95, color: T.orange   },
  { label: "Backend",  pct: 82, color: T.gold     },
  { label: "UI / UX",  pct: 78, color: T.orangeG  },
];

function SkillBars() {
  const [started, setStarted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setStarted(true), 1400); return () => clearTimeout(t); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.65 }}
      style={{
        padding: "0.85rem 1rem", borderRadius: 14,
        background: "linear-gradient(135deg,rgba(255,255,255,0.025) 0%,rgba(255,255,255,0.008) 100%)",
        border: "1px solid rgba(255,255,255,0.05)",
        display: "flex", flexDirection: "column", gap: "0.6rem",
      }}
    >
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.36rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(232,98,42,0.55)", marginBottom: "0.05rem" }}>Expertise</span>
      {SKILL_BARS.map(({ label, pct, color }) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.22rem" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.38rem", textTransform: "uppercase", letterSpacing: "0.16em", color: T.muted }}>{label}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.38rem", color, fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ height: 3, borderRadius: 100, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: started ? `${pct}%` : 0 }}
              transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              style={{ height: "100%", borderRadius: 100, background: `linear-gradient(90deg,${color},${T.orangeG})`, boxShadow: `0 0 8px ${color}55` }}
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ─── PROFILE CARD 3D ─────────────────────────────────────────────────────────
function ProfileCard3D({ time, isMobile }) {
  const ref  = useRef(null);
  const mx   = useMotionValue(0);
  const my   = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], ["20deg", "-20deg"]), { stiffness: 60, damping: 13 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], ["-20deg", "20deg"]), { stiffness: 60, damping: 13 });
  const glareX  = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY  = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);
  const glareBg = useTransform([glareX, glareY], (l) => `radial-gradient(circle at ${l[0]} ${l[1]}, rgba(255,255,255,0.12) 0%, transparent 58%)`);
  const shadowX   = useTransform(mx, [-0.5, 0.5], [-36, 36]);
  const shadowY   = useTransform(my, [-0.5, 0.5], [-24, 24]);
  const dynShadow = useTransform([shadowX, shadowY], (l) => `${l[0]}px ${l[1]}px 90px rgba(0,0,0,0.95), 0 0 0 1px rgba(232,98,42,0.12), 0 0 60px rgba(232,98,42,0.08)`);

  const [hov,     setHov]     = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => { const t = setTimeout(() => setScanned(true), 1700); return () => clearTimeout(t); }, []);

  function handleMove(e) {
    if (isMobile) return;
    const r = ref.current?.getBoundingClientRect();
    if (r) { mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }
  }

  const cardW = isMobile ? 248 : 380;

  return (
    <div style={{ position: "relative" }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseEnter={() => { if (!isMobile) setHov(true); }}
        onMouseLeave={() => { mx.set(0); my.set(0); setHov(false); }}
        initial={{ opacity: 0, scale: 0.78, y: 50, rotateX: 15 }}
        animate={{ opacity: 1, scale: 1,    y: 0,  rotateX: 0  }}
        transition={{ duration: 1.15, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          rotateX: isMobile ? 0 : rotX,
          rotateY: isMobile ? 0 : rotY,
          transformStyle: "preserve-3d",
          perspective: "1500px",
          position: "relative",
          width: cardW,
          cursor: "default",
          boxShadow: isMobile ? undefined : dynShadow,
        }}
      >
        {/* Ambient halo */}
        <motion.div animate={{ opacity: hov ? 1 : 0.55, scale: hov ? 1.12 : 1 }} transition={{ duration: 0.9 }}
          style={{ position: "absolute", inset: -40, borderRadius: 44, background: "radial-gradient(ellipse, rgba(232,98,42,0.2) 0%, rgba(232,98,42,0.05) 50%, transparent 70%)", filter: "blur(32px)", pointerEvents: "none", zIndex: -1 }} />

        {/* Ghost frames */}
        <div style={{ position: "absolute", inset: -10, borderRadius: 36, border: "1px solid rgba(232,98,42,0.1)", transform: "rotate(3.8deg) scale(1.01)", background: "rgba(232,98,42,0.015)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: -18, borderRadius: 40, border: "1px solid rgba(232,98,42,0.055)", transform: "rotate(-2.2deg) scale(1.01)", pointerEvents: "none" }} />

        {/* Card shell */}
        <div style={{ position: "relative", padding: 5, borderRadius: 28, background: "linear-gradient(148deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.015) 100%)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.35)", backdropFilter: "blur(24px)" }}>

          {/* Glare */}
          <motion.div style={{ position: "absolute", inset: 0, borderRadius: 28, pointerEvents: "none", zIndex: 12, background: glareBg, opacity: hov ? 1 : 0, transition: "opacity 0.4s" }} />

          {/* Scanline */}
          <AnimatePresence>
            {scanned && (
              <motion.div key="scan"
                initial={{ top: "-6%" }} animate={{ top: "108%" }} exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeIn" }}
                style={{ position: "absolute", left: 0, right: 0, height: "9%", background: "linear-gradient(to bottom,transparent,rgba(232,98,42,0.07) 40%,rgba(232,98,42,0.1) 50%,rgba(232,98,42,0.07) 60%,transparent)", pointerEvents: "none", zIndex: 14, borderRadius: 28 }} />
            )}
          </AnimatePresence>

          {/* Photo */}
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden" }}>
            <img src="/profile41.jpeg" alt="Perpetual Okan"
              style={{
                width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block",
                filter: hov ? "saturate(1.28) brightness(1.08)" : "saturate(1.05)",
                transform: hov ? "scale(1.055)" : "scale(1)",
                transition: "all 0.95s cubic-bezier(0.16,1,0.3,1)",
              }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(232,98,42,0.06) 0%,transparent 35%,rgba(1,1,3,0.7) 100%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 0 1px rgba(232,98,42,0.1)", borderRadius: 24, pointerEvents: "none" }} />
          </div>

          {/* Role pill */}
          <div style={{ position: "absolute", top: "0.7rem", left: "0.7rem", background: "rgba(1,1,3,0.82)", backdropFilter: "blur(20px)", border: "1px solid rgba(232,98,42,0.34)", borderRadius: 100, padding: "0.25rem 0.65rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.orange, boxShadow: `0 0 8px ${T.orange}`, display: "inline-block", flexShrink: 0, animation: "ldp 2.2s infinite" }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.38rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.88)" }}>Full-Stack</span>
          </div>

          {/* Year */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
            style={{ position: "absolute", bottom: "0.9rem", left: "0.9rem" }}>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.34rem", color: "rgba(255,255,255,0.28)", margin: 0, letterSpacing: "0.18em", textTransform: "uppercase" }}>PORTFOLIO 2025</p>
          </motion.div>
        </div>

        {/* Desktop-only floating badges */}
        {!isMobile && (
          <>
            {/* Live clock */}
            <motion.div
              initial={{ opacity: 0, x: 22, y: 12 }} animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.25, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "absolute", bottom: -32, right: -24, zIndex: 20, background: "linear-gradient(135deg,rgba(7,7,13,0.97) 0%,rgba(12,10,20,0.97) 100%)", backdropFilter: "blur(28px)", border: "1px solid rgba(232,98,42,0.26)", borderRadius: 18, padding: "0.82rem 1.18rem", display: "flex", alignItems: "center", gap: "0.65rem", boxShadow: "0 22px 55px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)" }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,rgba(232,98,42,0.2) 0%,rgba(232,98,42,0.06) 100%)", border: "1px solid rgba(232,98,42,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FiClock style={{ color: T.orange, fontSize: 15 }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.38rem", color: "rgba(232,98,42,0.72)", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 3, marginTop: 0 }}>System Live</p>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.82rem", color: T.text, fontWeight: 700, margin: 0 }}>{time}</p>
              </div>
            </motion.div>

            {/* Tech stack */}
            <motion.div
              initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.45, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "absolute", top: "22%", left: -40, zIndex: 20, background: "linear-gradient(135deg,rgba(7,7,13,0.97) 0%,rgba(12,10,20,0.97) 100%)", backdropFilter: "blur(28px)", border: "1px solid rgba(232,98,42,0.2)", borderRadius: 14, padding: "0.65rem 0.95rem", display: "flex", flexDirection: "column", gap: "0.12rem", boxShadow: "0 18px 44px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.06)" }}
            >
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.38rem", color: "rgba(232,98,42,0.6)", textTransform: "uppercase", letterSpacing: "0.16em" }}>Tech Stack</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.1rem", color: T.text, letterSpacing: "0.06em", lineHeight: 1 }}>React</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.38rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Node · Next · TS</span>
            </motion.div>
          </>
        )}

        {/* Mobile-only: compact clock badge overlaid on card bottom-right */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", bottom: -22, right: -10, zIndex: 20, background: "linear-gradient(135deg,rgba(7,7,13,0.97) 0%,rgba(12,10,20,0.97) 100%)", backdropFilter: "blur(20px)", border: "1px solid rgba(232,98,42,0.26)", borderRadius: 14, padding: "0.55rem 0.82rem", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 12px 32px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)" }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg,rgba(232,98,42,0.2) 0%,rgba(232,98,42,0.06) 100%)", border: "1px solid rgba(232,98,42,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiClock style={{ color: T.orange, fontSize: 11 }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.34rem", color: "rgba(232,98,42,0.72)", textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 700, marginBottom: 2, marginTop: 0 }}>Live</p>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.62rem", color: T.text, fontWeight: 700, margin: 0, letterSpacing: "0.03em" }}>{time}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ─── STAT CHIP ────────────────────────────────────────────────────────────────
function Stat({ icon: Icon, value, label, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "0.55rem",
        padding: "0.62rem 0.8rem", borderRadius: 12, flex: 1,
        background: hov ? "linear-gradient(135deg,rgba(232,98,42,0.12) 0%,rgba(232,98,42,0.04) 100%)" : "linear-gradient(135deg,rgba(255,255,255,0.035) 0%,rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${hov ? "rgba(232,98,42,0.38)" : T.borderB}`,
        transition: "all 0.3s ease", cursor: "default",
      }}
    >
      <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: hov ? "rgba(232,98,42,0.2)" : "rgba(232,98,42,0.08)", border: `1px solid ${hov ? "rgba(232,98,42,0.44)" : "rgba(232,98,42,0.14)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
        <Icon style={{ color: T.orange, fontSize: 10 }} />
      </div>
      <div>
        <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(0.85rem,2.8vw,1.05rem)", color: T.text, lineHeight: 1, margin: 0, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{value}</p>
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.3rem,1vw,0.36rem)", textTransform: "uppercase", letterSpacing: "0.16em", color: T.muted, marginTop: 2, marginBottom: 0, whiteSpace: "nowrap" }}>{label}</p>
      </div>
    </motion.div>
  );
}

// ─── SCROLL INDICATOR ─────────────────────────────────────────────────────────
function ScrollIndicator({ opacity }) {
  return (
    <motion.div style={{ opacity, position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, pointerEvents: "none" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.32rem", textTransform: "uppercase", letterSpacing: "0.45em", color: "rgba(255,255,255,0.14)" }}>Scroll</span>
      <div style={{ width: 18, height: 30, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, display: "flex", justifyContent: "center", padding: "4px 0" }}>
        <motion.div animate={{ y: [0, 11, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 3, height: 7, background: `linear-gradient(to bottom,${T.orange},${T.orangeG})`, borderRadius: 100 }} />
      </div>
    </motion.div>
  );
}

// ─── FLIP CHAR ────────────────────────────────────────────────────────────────
function FlipChar({ char, delay }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 36, rotateX: -70 }}
      animate={{ opacity: 1, y: 0,  rotateX: 0   }}
      transition={{ delay, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "inline-block", transformStyle: "preserve-3d" }}
    >
      {char}
    </motion.span>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const containerRef = useRef(null);
  const { scrollY }  = useScroll();
  const [time,     setTime]     = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const mxS = useSpring(mouseX, { stiffness: 50, damping: 22 });
  const myS = useSpring(mouseY, { stiffness: 50, damping: 22 });

  const opacity   = useTransform(scrollY, [0, 420], [1, 0]);
  const yRaw      = useTransform(scrollY, [0, 600], [0, -85]);
  const yParallax = useSpring(yRaw, { stiffness: 65, damping: 28 });
  const spotlightBg = useTransform([mxS, myS], (l) =>
    `radial-gradient(950px circle at ${l[0] * 100}% ${l[1] * 100}%, rgba(232,98,42,0.07), transparent 62%)`);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
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

  const formattedTime = time.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const firstName = "Perpetual".split("");
  const lastName  = "Okan".split("");

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center",
        background: T.bg, overflow: "hidden",
        paddingTop:    isMobile ? "calc(var(--navbar-height, 70px) + 5rem)" : "calc(var(--navbar-height, 70px) + 8rem)",
        paddingBottom: isMobile ? "6rem" : "7rem",
        paddingLeft: "6%", paddingRight: "6%",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .hg {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          grid-template-areas: "text img";
          gap: clamp(2.5rem, 4vw, 5rem);
          align-items: center;
          width: 100%; max-width: 1380px; margin: 0 auto;
        }
        .hg-text { grid-area: text; display: flex; flex-direction: column; }
        .hg-img  { grid-area: img;  display: flex; justify-content: center; align-items: center; }

        @media (max-width: 1023px) {
          .hg {
            grid-template-columns: 1fr;
            grid-template-areas: "img" "text";
            gap: 2.4rem; text-align: center;
          }
          .hg-eyebrow { justify-content: center !important; }
          .hg-divider { display: none !important; }
          .hg-btns    { justify-content: center !important; }
          .hg-stats   { justify-content: center !important; }
          .hg-desc {
            border-left: none !important; padding-left: 0 !important;
            border-top: 1px solid rgba(232,98,42,0.16) !important;
            padding-top: 1rem !important;
            margin-left: auto !important; margin-right: auto !important;
          }
        }

        @media (max-width: 480px) {
          .hg-btns { flex-direction: column !important; }
        }

        @keyframes ldp { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.25;transform:scale(.65)} }

        @keyframes shim { 0%{transform:translateX(-120%)} 100%{transform:translateX(320%)} }
        .shim { position: relative; overflow: hidden; }
        .shim::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,0.13) 50%,transparent);
          animation: shim 3.8s infinite; border-radius: inherit;
        }
      `}</style>

      {/* BG */}
      <ParticleField />
      <NoiseOverlay />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-18%", right: "10%", width: "58vw", height: "58vw", borderRadius: "50%", background: "radial-gradient(ellipse,rgba(232,98,42,0.07) 0%,transparent 65%)", filter: "blur(70px)" }} />
        <div style={{ position: "absolute", bottom: "-12%", left: "2%", width: "42vw", height: "42vw", borderRadius: "50%", background: "radial-gradient(ellipse,rgba(110,60,240,0.05) 0%,transparent 65%)", filter: "blur(55px)" }} />
        <div style={{ position: "absolute", top: "25%", left: "-5%", width: "28vw", height: "28vw", borderRadius: "50%", background: "radial-gradient(ellipse,rgba(212,146,58,0.045) 0%,transparent 65%)", filter: "blur(45px)" }} />
      </div>

      {/* Orbital rings — desktop only */}
      {!isMobile && (
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: "48vw", height: "100vh", pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
          <OrbitalRings scale={1} />
        </div>
      )}

      {/* Grid lines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.016) 1px,transparent 1px)", backgroundSize: "70px 70px", maskImage: "radial-gradient(ellipse 85% 65% at 50% 0%,black 35%,transparent 100%)" }} />
      <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, background: spotlightBg }} />

      {/* ── CONTENT ── */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <motion.div style={{ y: yParallax }} className="hg">

          {/* IMAGE col */}
          <div className="hg-img">
            <ProfileCard3D time={formattedTime} isMobile={isMobile} />
          </div>

          {/* TEXT col */}
          <div className="hg-text" style={{ gap: isMobile ? "1.2rem" : "1.6rem" }}>

            {/* ── DESKTOP ONLY: availability badge ── */}
            {!isMobile && <AvailBadge />}

            {/* Eyebrow pill */}
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : -26, y: isMobile ? 10 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.52 }}
              className="hg-eyebrow"
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div className="hg-divider" style={{ height: 1, width: 28, background: `linear-gradient(to right,transparent,${T.orange})`, flexShrink: 0 }} />
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.3rem 0.88rem", borderRadius: 100, background: "linear-gradient(135deg,rgba(232,98,42,0.1) 0%,rgba(232,98,42,0.04) 100%)", border: "1px solid rgba(232,98,42,0.28)", backdropFilter: "blur(14px)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.orange, boxShadow: `0 0 10px ${T.orange}`, display: "inline-block", flexShrink: 0, animation: "ldp 2.2s infinite" }} />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.36rem,1.2vw,0.44rem)", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(240,132,90,0.95)", whiteSpace: "nowrap" }}>Full-Stack Engineer</span>
              </div>
              <div className="hg-divider" style={{ height: 1, flex: 1, background: `linear-gradient(to right,${T.border},transparent)` }} />
            </motion.div>

            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.63, duration: 0.6 }}
                style={{ fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.4rem,1.4vw,0.58rem)", fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: T.muted, margin: 0 }}>
                Hi, I'm
              </motion.p>
              <h1 style={{ margin: 0, lineHeight: 0.9, fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? "clamp(3rem,12vw,5rem)" : "clamp(3.8rem,7.5vw,7.8rem)", fontWeight: 400, letterSpacing: "-0.01em" }}>
                <div style={{ color: T.text }}>
                  {firstName.map((ch, i) => <FlipChar key={i} char={ch} delay={0.66 + i * 0.05} />)}
                </div>
                <div>
                  {lastName.map((ch, i) => (
                    <motion.span key={i}
                      initial={{ opacity: 0, y: 36, rotateX: -70 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: 0.92 + i * 0.07, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
                      style={{ display: "inline-block", transformStyle: "preserve-3d", background: `linear-gradient(140deg, ${T.okanA} 0%, ${T.okanC} 40%, ${T.okanB} 70%, ${T.okanA} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 18px rgba(184,103,42,0.28)) drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}
                    >{ch}</motion.span>
                  ))}
                </div>
              </h1>
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.88, duration: 0.7 }}
                style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? "clamp(0.55rem,2.5vw,0.72rem)" : "clamp(0.62rem,1.3vw,0.86rem)", fontWeight: 400, color: T.muted, margin: "0.5rem 0 0", letterSpacing: "0.06em" }}>
                <Typewriter />
              </motion.h2>
            </div>

            {/* Bio */}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.94, duration: 0.75 }}
              className="hg-desc"
              style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? "clamp(0.55rem,2vw,0.68rem)" : "clamp(0.6rem,1.1vw,0.76rem)", lineHeight: 1.9, color: T.muted, maxWidth: 460, margin: 0, borderLeft: "2px solid rgba(232,98,42,0.24)", paddingLeft: "1.15rem" }}>
              I build responsive, easy-to-use websites and web apps.
              Working across the full stack — frontend to backend — I turn ideas into polished digital products.
            </motion.p>

            {/* ── DESKTOP ONLY: skill progress bars ── */}
            {!isMobile && <SkillBars />}

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.04, duration: 0.75 }}
              className="hg-btns"
              style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>

              <Link to="/portfolio" style={{ textDecoration: "none", flex: isMobile ? 1 : "none" }}>
                <motion.div
                  whileHover={{ scale: 1.04, boxShadow: `0 20px 50px rgba(232,98,42,0.42)` }}
                  whileTap={{ scale: 0.97 }}
                  className="shim"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.9rem 1.8rem", borderRadius: 6, background: `linear-gradient(135deg,${T.orange} 0%,${T.orangeD} 60%,#b03a0e 100%)`, color: "#fff", fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.48rem,1.8vw,0.56rem)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", boxShadow: `0 8px 30px rgba(232,98,42,0.28), inset 0 1px 0 rgba(255,255,255,0.2)`, cursor: "pointer", width: "100%", whiteSpace: "nowrap" }}>
                  Explore Work <FiArrowRight style={{ fontSize: 13 }} />
                </motion.div>
              </Link>

              <motion.button
                whileHover={{ borderColor: "rgba(232,98,42,0.5)", color: T.text, background: "rgba(232,98,42,0.07)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { const a = document.createElement("a"); a.href = "/Perpetuual-cv.pdf"; a.download = "Perpetual_Okan_Resume.pdf"; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.9rem 1.8rem", borderRadius: 6, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.09)", color: T.muted, fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.48rem,1.8vw,0.56rem)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.28s ease", backdropFilter: "blur(10px)", flex: isMobile ? 1 : "none", whiteSpace: "nowrap" }}>
                <FiDownload style={{ fontSize: 13 }} /> Get Resume
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.18, duration: 0.75 }}
              className="hg-stats"
              style={{ display: "flex", gap: "0.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
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
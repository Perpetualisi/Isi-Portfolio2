import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";

/* ── Theme ── */
const T = {
  bg:      "#010103",
  orange:  "#E8622A",
  orangeD: "#C94E1A",
  orangeG: "#F0845A",
  gold:    "#D4923A",
  text:    "#F2EEF8",
  muted:   "rgba(242,238,248,0.40)",
  faint:   "rgba(242,238,248,0.06)",
  border:  "rgba(232,98,42,0.16)",
  borderB: "rgba(255,255,255,0.06)",
};

/* ══════════════════════════════════════════
   SKILL DATA
══════════════════════════════════════════ */
const CATEGORIES = [
  {
    id:    "3d",
    label: "3D & Graphics",
    icon:  "◈",
    color: "#E8622A",
    tagline: "Immersive visual experiences",
    skills: [
      { name: "Three.js",  level: 92, yrs: 3 },
      { name: "WebGL",     level: 85, yrs: 3 },
      { name: "GLSL",      level: 72, yrs: 2 },
      { name: "Blender",   level: 60, yrs: 1 },
      { name: "Spline",    level: 78, yrs: 2 },
    ],
  },
  {
    id:    "frontend",
    label: "Frontend",
    icon:  "▣",
    color: "#D4923A",
    tagline: "Pixel-perfect interfaces",
    skills: [
      { name: "React",         level: 95, yrs: 4 },
      { name: "TypeScript",    level: 88, yrs: 3 },
      { name: "Next.js",       level: 85, yrs: 3 },
      { name: "Framer Motion", level: 82, yrs: 2 },
      { name: "Tailwind CSS",  level: 90, yrs: 3 },
      { name: "Vite",          level: 88, yrs: 2 },
    ],
  },
  {
    id:    "backend",
    label: "Backend",
    icon:  "⬡",
    color: "#F0845A",
    tagline: "Robust server-side systems",
    skills: [
      { name: "Node.js",    level: 82, yrs: 3 },
      { name: "Express",    level: 80, yrs: 3 },
      { name: "PostgreSQL", level: 72, yrs: 2 },
      { name: "MongoDB",    level: 75, yrs: 2 },
      { name: "REST APIs",  level: 88, yrs: 4 },
    ],
  },
  {
    id:    "tools",
    label: "Tools",
    icon:  "◎",
    color: "#C97040",
    tagline: "Streamlined dev workflows",
    skills: [
      { name: "Git",     level: 90, yrs: 4 },
      { name: "Docker",  level: 65, yrs: 1 },
      { name: "Figma",   level: 78, yrs: 3 },
      { name: "Vercel",  level: 85, yrs: 3 },
      { name: "VS Code", level: 95, yrs: 4 },
    ],
  },
];

/* ── Proficiency labels ── */
function proficiencyLabel(level) {
  if (level >= 90) return { text: "Expert",       color: "#22c55e" };
  if (level >= 80) return { text: "Advanced",     color: "#84cc16" };
  if (level >= 65) return { text: "Proficient",   color: T.gold };
  return               { text: "Familiar",        color: T.muted };
}

/* ── Radar math helpers ── */
function radarPts(skills, cx, cy, r) {
  return skills.map((s, i) => {
    const angle = (i / skills.length) * Math.PI * 2 - Math.PI / 2;
    const dist  = (s.level / 100) * r;
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      lx: cx + Math.cos(angle) * (r + 26),
      ly: cy + Math.sin(angle) * (r + 26),
      angle, name: s.name, level: s.level,
    };
  });
}

function gridPoly(n, cx, cy, r, pct) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return `${(cx + Math.cos(a) * r * pct).toFixed(1)},${(cy + Math.sin(a) * r * pct).toFixed(1)}`;
  }).join(" ");
}

function toPolyPts(pts) {
  return pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

/* ══════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════ */
function AnimCounter({ value, duration = 1.2, suffix = "%" }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    let start = null;
    const from = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setDisplay(Math.round(from + (value - from) * ease));
      if (prog < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <>{display}{suffix}</>;
}

/* ══════════════════════════════════════════
   RADAR CHART
══════════════════════════════════════════ */
function RadarChart({ category, onHover, hoveredSkill }) {
  const [revealed, setRevealed] = useState(false);
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (inView) setTimeout(() => setRevealed(true), 100);
  }, [inView]);

  const SIZE = 240, CX = 120, CY = 120, R = 84;
  const n    = category.skills.length;
  const pts  = radarPts(category.skills, CX, CY, R);
  const col  = category.color;
  const GRIDS = [0.25, 0.5, 0.75, 1.0];

  // Animated polygon points
  const flatPts  = toPolyPts(radarPts(category.skills.map(s => ({ ...s, level: 0 })), CX, CY, R));
  const fullPts  = toPolyPts(pts);

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", justifyContent: "center" }}>
      {/* Glow behind chart */}
      <div style={{
        position: "absolute",
        width: 120, height: 120,
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${col}22 0%, transparent 70%)`,
        filter: "blur(20px)",
        pointerEvents: "none",
        transition: "opacity 0.4s",
        opacity: revealed ? 1 : 0,
      }} />

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id={`rg-${category.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={col} stopOpacity="0.35" />
            <stop offset="100%" stopColor={col} stopOpacity="0.04" />
          </radialGradient>
          <filter id={`glow-${category.id}`}>
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Grid rings */}
        {GRIDS.map((pct, gi) => (
          <polygon key={gi}
            points={gridPoly(n, CX, CY, R, pct)}
            fill="none"
            stroke={gi === 3 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}
            strokeWidth={gi === 3 ? 1 : 0.5}
            strokeDasharray={gi === 3 ? "none" : "2,3"}
          />
        ))}

        {/* Spokes */}
        {pts.map((p, i) => {
          const ex = CX + Math.cos((i / n) * Math.PI * 2 - Math.PI / 2) * R;
          const ey = CY + Math.sin((i / n) * Math.PI * 2 - Math.PI / 2) * R;
          return (
            <line key={i} x1={CX} y1={CY} x2={ex} y2={ey}
              stroke="rgba(255,255,255,0.06)" strokeWidth="0.7" />
          );
        })}

        {/* Filled shape with gradient */}
        <motion.polygon
          points={fullPts}
          fill={`url(#rg-${category.id})`}
          stroke={col}
          strokeWidth={1.5}
          strokeOpacity={0.8}
          initial={{ opacity: 0, scale: 0.2 }}
          animate={revealed ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* Vertex dots */}
        {pts.map((p, i) => {
          const isHov = hoveredSkill?.name === category.skills[i].name;
          return (
            <g key={i}>
              {isHov && (
                <motion.circle cx={p.x} cy={p.y} r={10}
                  fill={col} fillOpacity={0.12}
                  animate={{ r: [8, 14, 8] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              )}
              <motion.circle
                cx={p.x} cy={p.y}
                r={isHov ? 4.5 : 3}
                fill={col}
                fillOpacity={isHov ? 1 : 0.7}
                stroke={isHov ? "#fff" : col}
                strokeWidth={isHov ? 1.2 : 0}
                strokeOpacity={0.5}
                filter={isHov ? `url(#glow-${category.id})` : "none"}
                initial={{ scale: 0 }}
                animate={revealed ? { scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                style={{ cursor: "pointer", transformOrigin: `${p.x}px ${p.y}px` }}
                onMouseEnter={() => onHover(category.skills[i])}
                onMouseLeave={() => onHover(null)}
              />
            </g>
          );
        })}

        {/* Axis labels */}
        {pts.map((p, i) => {
          const angle  = (i / n) * Math.PI * 2 - Math.PI / 2;
          const lx     = CX + Math.cos(angle) * (R + 24);
          const ly     = CY + Math.sin(angle) * (R + 24);
          const anchor = Math.abs(Math.cos(angle)) < 0.15 ? "middle"
            : Math.cos(angle) > 0 ? "start" : "end";
          const isHov  = hoveredSkill?.name === category.skills[i].name;
          return (
            <motion.text key={i}
              x={lx} y={ly}
              textAnchor={anchor}
              dominantBaseline="central"
              fill={isHov ? col : T.muted}
              fontSize={isHov ? 9.5 : 8.5}
              fontFamily="'Space Mono', monospace"
              letterSpacing="0.06em"
              fontWeight={isHov ? "700" : "400"}
              initial={{ opacity: 0 }}
              animate={revealed ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 + i * 0.06 }}
              style={{ textTransform: "uppercase", pointerEvents: "none", transition: "all 0.2s" }}
            >
              {category.skills[i].name}
            </motion.text>
          );
        })}

        {/* Center crosshair */}
        <circle cx={CX} cy={CY} r={2.5} fill={col} opacity={0.6} />
        <circle cx={CX} cy={CY} r={6}   fill="none" stroke={col} strokeWidth={0.5} strokeOpacity={0.25} />
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════
   SKILL BAR (premium)
══════════════════════════════════════════ */
function SkillBar({ skill, color, delay, isHighlighted, onHover }) {
  const [started, setStarted] = useState(false);
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  const prof   = proficiencyLabel(skill.level);

  useEffect(() => {
    if (inView) setTimeout(() => setStarted(true), delay * 1000);
  }, [inView, delay]);

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => onHover(skill)}
      onMouseLeave={() => onHover(null)}
      animate={{
        background: isHighlighted ? "rgba(232,98,42,0.06)" : "transparent",
      }}
      style={{
        marginBottom: 4, padding: "10px 12px", borderRadius: 10,
        border: `1px solid ${isHighlighted ? "rgba(232,98,42,0.2)" : "transparent"}`,
        cursor: "default", transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 10, color: isHighlighted ? T.text : T.muted,
            letterSpacing: "0.12em", textTransform: "uppercase",
            transition: "color 0.2s",
          }}>
            {skill.name}
          </span>
          {/* Proficiency badge */}
          <span style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 7, color: prof.color,
            border: `1px solid ${prof.color}40`,
            borderRadius: 4, padding: "1px 5px",
            letterSpacing: "0.12em", textTransform: "uppercase",
            opacity: isHighlighted ? 1 : 0,
            transition: "opacity 0.2s",
          }}>
            {prof.text}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {skill.yrs && (
            <span style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 8, color: "rgba(242,238,248,0.2)",
              opacity: isHighlighted ? 1 : 0,
              transition: "opacity 0.2s",
            }}>
              {skill.yrs}yr{skill.yrs > 1 ? "s" : ""}
            </span>
          )}
          <span style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 10, color: isHighlighted ? color : "rgba(242,238,248,0.3)",
            fontWeight: 700, transition: "color 0.2s", minWidth: 30, textAlign: "right",
          }}>
            {skill.level}%
          </span>
        </div>
      </div>

      {/* Track */}
      <div style={{
        height: 2, borderRadius: 100,
        background: "rgba(255,255,255,0.05)", overflow: "hidden",
        position: "relative",
      }}>
        {/* Glow layer */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: started ? `${skill.level}%` : 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute", top: 0, left: 0,
            height: "100%", borderRadius: 100,
            background: color,
            filter: "blur(4px)",
            opacity: 0.5,
          }}
        />
        {/* Main bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: started ? `${skill.level}%` : 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute", top: 0, left: 0,
            height: "100%", borderRadius: 100,
            background: `linear-gradient(90deg, ${color}, ${T.orangeG})`,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   COMPARE MODE — side-by-side radars
══════════════════════════════════════════ */
function CompareView({ catA, catB, isMobile }) {
  const [hov, setHov] = useState(null);
  return (
    <motion.div
      key="compare"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: "1.5rem",
      }}
    >
      {[catA, catB].map(cat => (
        <div key={cat.id} className="sg-card" style={{ padding: "1.5rem" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem",
          }}>
            <span style={{ fontSize: 16, color: cat.color }}>{cat.icon}</span>
            <span style={{
              fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase", color: cat.color,
            }}>
              {cat.label}
            </span>
            <span style={{
              fontFamily: "'Space Mono',monospace", fontSize: 9,
              color: "rgba(242,238,248,0.2)", marginLeft: "auto",
            }}>
              avg {Math.round(cat.skills.reduce((s, sk) => s + sk.level, 0) / cat.skills.length)}%
            </span>
          </div>
          <RadarChart category={cat} onHover={setHov} hoveredSkill={hov} />
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: 4 }}>
            {cat.skills.map(sk => (
              <div key={sk.name} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {sk.name}
                </span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: cat.color, fontWeight: 700 }}>
                  {sk.level}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   SEARCH / FILTER
══════════════════════════════════════════ */
function SearchSkill({ query, setQuery }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 240 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="rgba(242,238,248,0.25)" strokeWidth="2"
        style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search skills…"
        style={{
          width: "100%", boxSizing: "border-box",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 100, padding: "7px 14px 7px 30px",
          fontFamily: "'Space Mono',monospace", fontSize: 9,
          color: T.text, outline: "none",
          letterSpacing: "0.1em", textTransform: "uppercase",
          transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = "rgba(232,98,42,0.4)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
      />
      {query && (
        <button onClick={() => setQuery("")} style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer",
          color: T.muted, fontSize: 12, lineHeight: 1, padding: 0,
        }}>×</button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
export default function SkillGraph() {
  const [activeId,     setActiveId]     = useState("3d");
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [mode,         setMode]         = useState("explore");   // "explore" | "compare"
  const [compareIds,   setCompareIds]   = useState(["3d", "frontend"]);
  const [query,        setQuery]        = useState("");
  const [isMobile,     setIsMobile]     = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const sectionRef = useRef(null);
  const inView     = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const active    = CATEGORIES.find(c => c.id === activeId);
  const compareA  = CATEGORIES.find(c => c.id === compareIds[0]);
  const compareB  = CATEGORIES.find(c => c.id === compareIds[1]);
  const totalSkills = CATEGORIES.reduce((s, c) => s + c.skills.length, 0);
  const avgAll      = Math.round(
    CATEGORIES.flatMap(c => c.skills).reduce((s, sk) => s + sk.level, 0) /
    CATEGORIES.flatMap(c => c.skills).length
  );

  /* Search results */
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return CATEGORIES.flatMap(cat =>
      cat.skills
        .filter(sk => sk.name.toLowerCase().includes(q))
        .map(sk => ({ ...sk, cat }))
    );
  }, [query]);

  const toggleCompare = useCallback((id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev;
      return [prev[1], id];
    });
  }, []);

  /* Global stats */
  const expertCount   = CATEGORIES.flatMap(c => c.skills).filter(s => s.level >= 90).length;
  const advancedCount = CATEGORIES.flatMap(c => c.skills).filter(s => s.level >= 80 && s.level < 90).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&display=swap');
        .sg-wrap * { box-sizing: border-box; }

        .sg-tab {
          font-family: 'Space Mono', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 6px 14px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.06);
          background: transparent;
          color: rgba(242,238,248,0.3);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .sg-tab:hover { color: rgba(242,238,248,0.65); border-color: rgba(255,255,255,0.12); }
        .sg-tab.active { color: #F2EEF8; border-color: rgba(232,98,42,0.45); background: rgba(232,98,42,0.09); }

        .sg-mode-btn {
          font-family: 'Space Mono', monospace;
          font-size: 8px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 5px 12px; border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent; color: rgba(242,238,248,0.3);
          cursor: pointer; transition: all 0.18s;
        }
        .sg-mode-btn:hover { color: rgba(242,238,248,0.6); border-color: rgba(255,255,255,0.12); }
        .sg-mode-btn.active { background: rgba(232,98,42,0.1); border-color: rgba(232,98,42,0.4); color: #F0845A; }

        .sg-card {
          background: linear-gradient(140deg, rgba(255,255,255,0.028) 0%, rgba(255,255,255,0.008) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          transition: border-color 0.3s, box-shadow 0.3s;
          position: relative; overflow: hidden;
        }
        .sg-card::before {
          content: '';
          position: absolute; inset: 0; border-radius: 20px;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,98,42,0.04) 0%, transparent 60%);
          pointer-events: none;
        }
        .sg-card:hover { border-color: rgba(232,98,42,0.18); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }

        .sg-stat {
          display: flex; flex-direction: column; gap: 2px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .sg-search-result {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 12px; border-radius: 8px; cursor: default;
          transition: background 0.15s;
        }
        .sg-search-result:hover { background: rgba(232,98,42,0.07); }

        @media (max-width: 768px) {
          .sg-tab { font-size: 8px; padding: 5px 10px; }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="sg-wrap"
        style={{
          background:  T.bg,
          padding:     "clamp(3rem,8vw,8rem) clamp(4%,5vw,8%)",
          position:    "relative",
          overflow:    "hidden",
        }}
      >
        {/* Ambient background */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(232,98,42,0.05) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: -120, right: -80, pointerEvents: "none",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,98,42,0.04) 0%, transparent 65%)",
          filter: "blur(40px)",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ── Section Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75 }}
            style={{ marginBottom: "clamp(1.5rem,4vw,2.8rem)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "0.9rem" }}>
              <div style={{ height: 1, width: 24, background: `linear-gradient(to right, transparent, ${T.orange})` }} />
              <span style={{
                fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700,
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "rgba(240,132,90,0.8)",
              }}>Skills & Expertise</span>
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize:   "clamp(2.8rem,7vw,5rem)",
              fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 0.9,
              color: T.text, margin: "0 0 1rem",
            }}>
              What I{" "}
              <span style={{
                background: `linear-gradient(135deg,${T.orange},${T.gold})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Build With</span>
            </h2>
            <p style={{
              fontFamily: "'Space Mono',monospace",
              fontSize:   "clamp(0.52rem,1.1vw,0.7rem)",
              color:      T.muted, lineHeight: 1.95, margin: 0, maxWidth: 460,
            }}>
              Four years building across the full stack — from raw WebGL shaders to production APIs.
            </p>
          </motion.div>

          {/* ── Global Stats Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              display: "flex", gap: 10, flexWrap: "wrap",
              marginBottom: "clamp(1.5rem,3vw,2.2rem)",
            }}
          >
            {[
              { label: "Skills",    value: totalSkills, suffix: "" },
              { label: "Avg level", value: avgAll,      suffix: "%" },
              { label: "Expert",    value: expertCount, suffix: "" },
              { label: "Advanced",  value: advancedCount, suffix: "" },
            ].map(({ label, value, suffix }, i) => (
              <motion.div
                key={label}
                className="sg-stat"
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.07 }}
              >
                <span style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: "1.6rem", letterSpacing: "0.04em",
                  color: T.orange, lineHeight: 1,
                }}>
                  {inView ? <AnimCounter value={value} suffix={suffix} /> : `0${suffix}`}
                </span>
                <span style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 8, color: T.muted,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                }}>
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Controls row ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.18 }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              flexWrap: "wrap", marginBottom: "clamp(1rem,2.5vw,1.8rem)",
            }}
          >
            {/* Mode toggle */}
            <div style={{
              display: "flex", gap: 4, padding: 4,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 8,
            }}>
              {[
                { id: "explore", label: "Explore" },
                { id: "compare", label: "Compare" },
              ].map(m => (
                <button key={m.id}
                  className={`sg-mode-btn${mode === m.id ? " active" : ""}`}
                  onClick={() => setMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Category tabs */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
              {CATEGORIES.map(cat => {
                const isCompSel = mode === "compare" && compareIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    className={`sg-tab${
                      (mode === "explore" && activeId === cat.id) || isCompSel ? " active" : ""
                    }`}
                    onClick={() => {
                      if (mode === "explore") setActiveId(cat.id);
                      else toggleCompare(cat.id);
                    }}
                    style={
                      (mode === "explore" && activeId === cat.id) || isCompSel
                        ? { borderColor: `${cat.color}55`, background: `${cat.color}12`, color: T.text }
                        : {}
                    }
                  >
                    <span style={{ opacity: 0.7 }}>{cat.icon}</span>
                    {cat.label}
                    {isCompSel && <span style={{ fontSize: 7, opacity: 0.6 }}>
                      {compareIds.indexOf(cat.id) === 0 ? "A" : "B"}
                    </span>}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <SearchSkill query={query} setQuery={setQuery} />
          </motion.div>

          {/* ── Search Results Overlay ── */}
          <AnimatePresence>
            {query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="sg-card"
                style={{
                  padding: "1rem", marginBottom: "1.2rem",
                }}
              >
                <div style={{
                  fontFamily: "'Space Mono',monospace", fontSize: 8,
                  color: T.muted, letterSpacing: "0.2em", textTransform: "uppercase",
                  marginBottom: "0.8rem",
                }}>
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{query}"
                </div>
                {searchResults.length === 0 ? (
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(242,238,248,0.2)" }}>
                    No skills found.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {searchResults.map(({ name, level, yrs, cat }) => {
                      const prof = proficiencyLabel(level);
                      return (
                        <div key={`${cat.id}-${name}`} className="sg-search-result"
                          onClick={() => { setActiveId(cat.id); setMode("explore"); setQuery(""); }}
                          style={{ cursor: "pointer" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: cat.color, fontSize: 11 }}>{cat.icon}</span>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: T.text, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                              {name}
                            </span>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                              {cat.label}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: prof.color, border: `1px solid ${prof.color}40`, borderRadius: 4, padding: "1px 5px" }}>
                              {prof.text}
                            </span>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: cat.color, fontWeight: 700 }}>
                              {level}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main Content ── */}
          <AnimatePresence mode="wait">

            {/* COMPARE MODE */}
            {mode === "compare" && (
              <CompareView catA={compareA} catB={compareB} isMobile={isMobile} />
            )}

            {/* EXPLORE MODE */}
            {mode === "explore" && (
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "clamp(240px,34vw,340px) 1fr",
                  gap: "clamp(1rem,2.5vw,2rem)",
                  alignItems: "start",
                }}
              >
                {/* ── Left: Radar card ── */}
                <div className="sg-card" style={{
                  padding: "clamp(1.2rem,3vw,2rem)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "1.2rem",
                }}>
                  {/* Card header */}
                  <div style={{
                    width: "100%", display: "flex",
                    justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: active.color, fontSize: 14 }}>{active.icon}</span>
                      <span style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: 8, fontWeight: 700, letterSpacing: "0.2em",
                        textTransform: "uppercase", color: active.color,
                      }}>
                        {active.label}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 8, color: T.muted, fontStyle: "italic",
                    }}>
                      {active.tagline}
                    </span>
                  </div>

                  <RadarChart
                    category={active}
                    onHover={setHoveredSkill}
                    hoveredSkill={hoveredSkill}
                  />

                  {/* Tooltip area */}
                  <div style={{ minHeight: 52, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AnimatePresence mode="wait">
                      {hoveredSkill ? (
                        <motion.div
                          key={hoveredSkill.name}
                          initial={{ opacity: 0, scale: 0.9, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -4 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            textAlign: "center", padding: "10px 20px", borderRadius: 12,
                            background: `${active.color}12`,
                            border: `1px solid ${active.color}30`,
                            width: "100%",
                          }}
                        >
                          <div style={{
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: "2rem", letterSpacing: "0.06em",
                            color: active.color, lineHeight: 1,
                          }}>
                            {hoveredSkill.level}%
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 3 }}>
                            <span style={{
                              fontFamily: "'Space Mono',monospace",
                              fontSize: 9, color: T.muted,
                              textTransform: "uppercase", letterSpacing: "0.14em",
                            }}>
                              {hoveredSkill.name}
                            </span>
                            <span style={{
                              fontFamily: "'Space Mono',monospace", fontSize: 7,
                              color: proficiencyLabel(hoveredSkill.level).color,
                              border: `1px solid ${proficiencyLabel(hoveredSkill.level).color}40`,
                              borderRadius: 4, padding: "1px 5px",
                            }}>
                              {proficiencyLabel(hoveredSkill.level).text}
                            </span>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.p
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: 8, color: "rgba(242,238,248,0.15)",
                            letterSpacing: "0.18em", textTransform: "uppercase", margin: 0,
                          }}
                        >
                          Hover a vertex
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Footer stats */}
                  <div style={{
                    width: "100%", paddingTop: "0.8rem",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
                  }}>
                    {[
                      { label: "Skills",  value: active.skills.length, suffix: "" },
                      { label: "Avg",     value: Math.round(active.skills.reduce((s, sk) => s + sk.level, 0) / active.skills.length), suffix: "%" },
                      { label: "Expert",  value: active.skills.filter(s => s.level >= 90).length, suffix: "" },
                    ].map(({ label, value, suffix }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{
                          fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem",
                          color: active.color, letterSpacing: "0.06em", lineHeight: 1,
                        }}>
                          {value}{suffix}
                        </div>
                        <div style={{
                          fontFamily: "'Space Mono',monospace", fontSize: 7,
                          color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2,
                        }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Right: Bars + Overview ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Skill bars card */}
                  <div className="sg-card" style={{ padding: "clamp(1.2rem,3vw,1.8rem)" }}>
                    <div style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 8, fontWeight: 700, letterSpacing: "0.22em",
                      textTransform: "uppercase", color: active.color,
                      marginBottom: "1.2rem",
                    }}>
                      {active.label} · Breakdown
                    </div>

                    {active.skills.map((sk, i) => (
                      <SkillBar
                        key={sk.name}
                        skill={sk}
                        color={active.color}
                        delay={i * 0.09}
                        isHighlighted={hoveredSkill?.name === sk.name}
                        onHover={setHoveredSkill}
                      />
                    ))}
                  </div>

                  {/* All categories overview */}
                  <div className="sg-card" style={{ padding: "clamp(1rem,2vw,1.5rem)" }}>
                    <div style={{
                      fontFamily: "'Space Mono',monospace", fontSize: 8,
                      color: T.muted, letterSpacing: "0.22em", textTransform: "uppercase",
                      marginBottom: "1rem",
                    }}>
                      All categories
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {CATEGORIES.map(cat => {
                        const avg    = Math.round(cat.skills.reduce((s, sk) => s + sk.level, 0) / cat.skills.length);
                        const isCur  = cat.id === activeId;
                        const expert = cat.skills.filter(s => s.level >= 90).length;
                        return (
                          <div key={cat.id}
                            onClick={() => setActiveId(cat.id)}
                            style={{ cursor: "pointer" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                              <span style={{ color: cat.color, fontSize: 11 }}>{cat.icon}</span>
                              <span style={{
                                fontFamily: "'Space Mono',monospace", fontSize: 9,
                                color: isCur ? T.text : T.muted,
                                letterSpacing: "0.1em", textTransform: "uppercase",
                                flex: 1, transition: "color 0.2s",
                              }}>{cat.label}</span>
                              {expert > 0 && (
                                <span style={{
                                  fontFamily: "'Space Mono',monospace", fontSize: 7,
                                  color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)",
                                  borderRadius: 4, padding: "1px 5px",
                                  opacity: isCur ? 1 : 0.5,
                                }}>
                                  {expert} expert
                                </span>
                              )}
                              <span style={{
                                fontFamily: "'Space Mono',monospace", fontSize: 9,
                                color: isCur ? cat.color : T.muted,
                                fontWeight: 700, minWidth: 28, textAlign: "right",
                                transition: "color 0.2s",
                              }}>
                                {avg}%
                              </span>
                            </div>
                            <div style={{
                              height: isCur ? 2.5 : 1.5, borderRadius: 100,
                              background: "rgba(255,255,255,0.05)", overflow: "hidden",
                              transition: "height 0.2s",
                            }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${avg}%` }}
                                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                  height: "100%", borderRadius: 100,
                                  background: isCur
                                    ? `linear-gradient(90deg,${cat.color},${T.orangeG})`
                                    : cat.color,
                                  opacity: isCur ? 1 : 0.3,
                                  transition: "opacity 0.2s",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
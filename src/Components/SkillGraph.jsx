import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ── Theme — matches your Hero.jsx exactly ── */
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
   ✏️  EDIT YOUR SKILLS HERE
══════════════════════════════════════════ */
const CATEGORIES = [
  {
    id:    "3d",
    label: "3D & Graphics",
    color: "#E8622A",
    skills: [
      { name: "Three.js",  level: 92 },
      { name: "WebGL",     level: 85 },
      { name: "GLSL",      level: 72 },
      { name: "Blender",   level: 60 },
      { name: "Spline",    level: 78 },
    ],
  },
  {
    id:    "frontend",
    label: "Frontend",
    color: "#D4923A",
    skills: [
      { name: "React",        level: 95 },
      { name: "TypeScript",   level: 88 },
      { name: "Next.js",      level: 85 },
      { name: "Framer Motion",level: 82 },
      { name: "Tailwind CSS", level: 90 },
      { name: "Vite",         level: 88 },
    ],
  },
  {
    id:    "backend",
    label: "Backend",
    color: "#F0845A",
    skills: [
      { name: "Node.js",    level: 82 },
      { name: "Express",    level: 80 },
      { name: "PostgreSQL", level: 72 },
      { name: "MongoDB",    level: 75 },
      { name: "REST APIs",  level: 88 },
    ],
  },
  {
    id:    "tools",
    label: "Tools",
    color: "#B8672A",
    skills: [
      { name: "Git",      level: 90 },
      { name: "Docker",   level: 65 },
      { name: "Figma",    level: 78 },
      { name: "Vercel",   level: 85 },
      { name: "VS Code",  level: 95 },
    ],
  },
];

/* ── Radar chart points helper ── */
function radarPoints(skills, cx, cy, r) {
  return skills.map((s, i) => {
    const angle = (i / skills.length) * Math.PI * 2 - Math.PI / 2;
    const dist  = (s.level / 100) * r;
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      lx: cx + Math.cos(angle) * (r + 28),
      ly: cy + Math.sin(angle) * (r + 28),
      name: s.name, level: s.level, angle,
    };
  });
}

function gridPoints(n, cx, cy, r, pct) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * r * pct,
      y: cy + Math.sin(angle) * r * pct,
    };
  });
}

function toPath(pts) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
}

/* ── Radar SVG ── */
function RadarChart({ category, active, onHover }) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (inView) setTimeout(() => setRevealed(true), 150);
  }, [inView]);

  const SIZE  = 220;
  const CX    = SIZE / 2;
  const CY    = SIZE / 2;
  const R     = 78;
  const n     = category.skills.length;
  const pts   = radarPoints(category.skills, CX, CY, R);
  const color = category.color;

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <svg
        width={SIZE} height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ overflow: "visible" }}
      >
        {/* Grid rings */}
        {gridLevels.map((pct, gi) => (
          <polygon key={gi}
            points={gridPoints(n, CX, CY, R, pct).map(p => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={gi === 3 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}
            strokeWidth={gi === 3 ? 0.8 : 0.5}
          />
        ))}

        {/* Spokes */}
        {pts.map((p, i) => (
          <line key={i}
            x1={CX} y1={CY} x2={CX + Math.cos((i / n) * Math.PI * 2 - Math.PI / 2) * R}
            y2={CY + Math.sin((i / n) * Math.PI * 2 - Math.PI / 2) * R}
            stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"
          />
        ))}

        {/* Filled shape */}
        <motion.polygon
          points={pts.map(p => `${p.x},${p.y}`).join(" ")}
          fill={color}
          fillOpacity={active ? 0.22 : 0.1}
          stroke={color}
          strokeWidth={active ? 1.5 : 0.8}
          strokeOpacity={active ? 0.9 : 0.45}
          initial={{ scale: 0, opacity: 0 }}
          animate={revealed ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* Dots on vertices */}
        {pts.map((p, i) => (
          <motion.circle key={i}
            cx={p.x} cy={p.y} r={active ? 3.5 : 2.5}
            fill={color} fillOpacity={active ? 1 : 0.6}
            initial={{ scale: 0 }}
            animate={revealed ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{ cursor: "pointer", transformOrigin: `${p.x}px ${p.y}px` }}
            onMouseEnter={() => onHover(category.skills[i])}
            onMouseLeave={() => onHover(null)}
          />
        ))}

        {/* Labels */}
        {pts.map((p, i) => {
          const angle  = (i / n) * Math.PI * 2 - Math.PI / 2;
          const lx     = CX + Math.cos(angle) * (R + 22);
          const ly     = CY + Math.sin(angle) * (R + 22);
          const anchor = Math.abs(Math.cos(angle)) < 0.1 ? "middle"
            : Math.cos(angle) > 0 ? "start" : "end";
          return (
            <motion.text key={i}
              x={lx} y={ly}
              textAnchor={anchor}
              dominantBaseline="central"
              fill={active ? T.text : T.muted}
              fontSize={9}
              fontFamily="'Space Mono', monospace"
              letterSpacing="0.08em"
              initial={{ opacity: 0 }}
              animate={revealed ? { opacity: 1 } : {}}
              transition={{ delay: 0.7 + i * 0.05 }}
              style={{ textTransform: "uppercase", pointerEvents: "none" }}
            >
              {category.skills[i].name}
            </motion.text>
          );
        })}

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={2} fill={color} opacity={0.5} />
      </svg>
    </div>
  );
}

/* ── Horizontal bar row ── */
function SkillBar({ name, level, color, delay }) {
  const [started, setStarted] = useState(false);
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) setTimeout(() => setStarted(true), delay * 1000);
  }, [inView, delay]);

  return (
    <div ref={ref} style={{ marginBottom: 10 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", marginBottom: 5,
      }}>
        <span style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 10, color: T.muted,
          letterSpacing: "0.14em", textTransform: "uppercase",
        }}>{name}</span>
        <span style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 10, color, fontWeight: 700,
        }}>{level}%</span>
      </div>
      <div style={{
        height: 2, borderRadius: 100,
        background: "rgba(255,255,255,0.06)", overflow: "hidden",
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: started ? `${level}%` : 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: "100%", borderRadius: 100,
            background: `linear-gradient(90deg,${color},${T.orangeG})`,
            boxShadow: `0 0 8px ${color}44`,
          }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
export default function SkillGraph() {
  const [activeId,     setActiveId]     = useState("3d");
  const [hoveredSkill, setHoveredSkill] = useState(null);
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

  const active = CATEGORIES.find(c => c.id === activeId);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        .sg-wrap * { box-sizing: border-box; }
        .sg-tab {
          font-family: 'Space Mono', monospace;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 6px 14px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent;
          color: rgba(242,238,248,0.35);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .sg-tab:hover {
          color: rgba(242,238,248,0.7);
          border-color: rgba(255,255,255,0.14);
        }
        .sg-tab.active {
          color: #F2EEF8;
          border-color: rgba(232,98,42,0.5);
          background: rgba(232,98,42,0.1);
        }
        .sg-card {
          background: linear-gradient(135deg,rgba(255,255,255,0.025),rgba(255,255,255,0.008));
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          transition: border-color 0.3s;
        }
        .sg-card:hover { border-color: rgba(232,98,42,0.2); }
      `}</style>

      <section
        ref={sectionRef}
        className="sg-wrap"
        style={{
          background:    T.bg,
          padding:       "clamp(3rem,8vw,8rem) clamp(4%,5vw,8%)",
          position:      "relative",
          overflow:      "hidden",
        }}
      >
        {/* Background grid glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(232,98,42,0.04) 0%, transparent 70%)",
        }} />

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: "clamp(2rem,5vw,3.5rem)", maxWidth: 720 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
            <div style={{ height: 1, width: 28, background: `linear-gradient(to right, transparent, ${T.orange})` }} />
            <span style={{
              fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: "rgba(240,132,90,0.85)",
            }}>Skills & Expertise</span>
          </div>
          <h2 style={{
            fontFamily:  "'Bebas Neue', sans-serif",
            fontSize:    "clamp(2.8rem,7vw,5rem)",
            fontWeight:  400, letterSpacing: "-0.01em", lineHeight: 0.92,
            color:       T.text, margin: "0 0 1rem",
          }}>
            What I{" "}
            <span style={{
              background: `linear-gradient(135deg,${T.orange},${T.gold})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Build With</span>
          </h2>
          <p style={{
            fontFamily: "'Space Mono',monospace",
            fontSize:   "clamp(0.52rem,1.1vw,0.72rem)",
            color:      T.muted, lineHeight: 1.9, margin: 0, maxWidth: 480,
          }}>
            Four years of building across the full stack — from raw WebGL shaders to production APIs.
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            display: "flex", gap: 8, flexWrap: "wrap",
            marginBottom: "clamp(1.5rem,4vw,2.5rem)",
          }}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`sg-tab${activeId === cat.id ? " active" : ""}`}
              onClick={() => setActiveId(cat.id)}
              style={activeId === cat.id ? { borderColor: `${cat.color}55`, background: `${cat.color}14` } : {}}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Main content — radar + bars */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            style={{
              display:  "grid",
              gridTemplateColumns: isMobile ? "1fr" : "clamp(220px,32vw,320px) 1fr",
              gap:      "clamp(1.2rem,3vw,2.5rem)",
              alignItems: "start",
            }}
          >
            {/* Radar card */}
            <div className="sg-card" style={{
              padding:   "clamp(1.2rem,3vw,2rem)",
              display:   "flex", flexDirection: "column",
              alignItems: "center", gap: "1.2rem",
              width: "100%",
            }}>
              <div style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 9, fontWeight: 700, letterSpacing: "0.22em",
                textTransform: "uppercase", color: active.color, alignSelf: "flex-start",
              }}>
                {active.label} · Radar
              </div>

              <RadarChart
                category={active}
                active={true}
                onHover={setHoveredSkill}
              />

              {/* Hover tooltip */}
              <div style={{
                minHeight: 44, display: "flex", alignItems: "center",
                justifyContent: "center", width: "100%",
              }}>
                <AnimatePresence>
                  {hoveredSkill ? (
                    <motion.div
                      key={hoveredSkill.name}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        textAlign: "center",
                        padding: "8px 16px", borderRadius: 10,
                        background: `${active.color}14`,
                        border: `1px solid ${active.color}33`,
                      }}
                    >
                      <div style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: "1.4rem", letterSpacing: "0.06em",
                        color: active.color, lineHeight: 1,
                      }}>{hoveredSkill.level}%</div>
                      <div style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: 9, color: T.muted,
                        textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 2,
                      }}>{hoveredSkill.name}</div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: 9, color: "rgba(242,238,248,0.18)",
                        letterSpacing: "0.16em", textTransform: "uppercase",
                      }}
                    >Hover a point</motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Overall score */}
              <div style={{
                width: "100%", paddingTop: "0.8rem",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{
                  fontFamily: "'Space Mono',monospace", fontSize: 9,
                  color: T.muted, letterSpacing: "0.16em", textTransform: "uppercase",
                }}>Avg. proficiency</span>
                <span style={{
                  fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.3rem",
                  color: active.color, letterSpacing: "0.06em",
                }}>
                  {Math.round(active.skills.reduce((s, sk) => s + sk.level, 0) / active.skills.length)}%
                </span>
              </div>
            </div>

            {/* Bars card */}
            <div className="sg-card" style={{ padding: "clamp(1.2rem,3vw,2rem)" }}>
              <div style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 9, fontWeight: 700, letterSpacing: "0.22em",
                textTransform: "uppercase", color: active.color,
                marginBottom: "1.4rem",
              }}>
                {active.label} · Breakdown
              </div>

              {active.skills.map((sk, i) => (
                <SkillBar
                  key={sk.name}
                  name={sk.name}
                  level={sk.level}
                  color={active.color}
                  delay={i * 0.08}
                />
              ))}

              {/* All categories mini-overview */}
              <div style={{
                marginTop: "1.6rem", paddingTop: "1.2rem",
                borderTop: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  fontFamily: "'Space Mono',monospace", fontSize: 9,
                  color: T.muted, letterSpacing: "0.2em", textTransform: "uppercase",
                  marginBottom: "0.9rem",
                }}>All categories</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {CATEGORIES.map(cat => {
                    const avg = Math.round(cat.skills.reduce((s, sk) => s + sk.level, 0) / cat.skills.length);
                    return (
                      <div key={cat.id}
                        onClick={() => setActiveId(cat.id)}
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                      >
                        <span style={{
                          fontFamily: "'Space Mono',monospace", fontSize: 9,
                          color: cat.id === activeId ? T.text : T.muted,
                          letterSpacing: "0.1em", textTransform: "uppercase",
                          width: 90, flexShrink: 0, transition: "color 0.2s",
                        }}>{cat.label}</span>
                        <div style={{
                          flex: 1, height: 1.5, borderRadius: 100,
                          background: "rgba(255,255,255,0.05)", overflow: "hidden",
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${avg}%` }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                              height: "100%", borderRadius: 100,
                              background: cat.id === activeId
                                ? `linear-gradient(90deg,${cat.color},${T.orangeG})`
                                : cat.color,
                              opacity: cat.id === activeId ? 1 : 0.35,
                              transition: "opacity 0.2s",
                            }}
                          />
                        </div>
                        <span style={{
                          fontFamily: "'Space Mono',monospace", fontSize: 9,
                          color: cat.id === activeId ? cat.color : T.muted,
                          fontWeight: 700, minWidth: 28, textAlign: "right",
                          transition: "color 0.2s",
                        }}>{avg}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </>
  );
}
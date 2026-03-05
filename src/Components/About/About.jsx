import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { FiLayers, FiTerminal, FiCpu, FiZap, FiTrendingUp, FiAward, FiArrowRight } from "react-icons/fi";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#010103",
  card:    "#07070d",
  orange:  "#E8622A",
  orangeD: "#C94E1A",
  orangeG: "#F0845A",
  gold:    "#D4923A",
  okanA:   "#B8672A",
  text:    "#F2EEF8",
  muted:   "rgba(242,238,248,0.40)",
  faint:   "rgba(242,238,248,0.10)",
  border:  "rgba(232,98,42,0.16)",
  borderB: "rgba(255,255,255,0.055)",
  borderH: "rgba(232,98,42,0.38)",
  green:   "#22c55e",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SKILL_CATEGORIES = [
  {
    title: "Frontend",
    icon: FiLayers,
    skills: ["React.js", "JavaScript ES6+", "TypeScript", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "Backend & APIs",
    icon: FiCpu,
    skills: ["Node.js", "REST APIs", "Express.js", "Database Design", "Authentication", "WordPress (Learning)"],
  },
  {
    title: "Tools & Workflow",
    icon: FiTerminal,
    skills: ["Git", "GitHub", "Postman", "Docker", "VS Code", "API Integration", "CI/CD"],
  },
];

const ACHIEVEMENTS = [
  { count: "15+",  label: "Projects",   detail: "Concept to production",      icon: FiZap        },
  { count: "100%", label: "Responsive", detail: "Optimized for all devices",  icon: FiTrendingUp },
  { count: "∞",    label: "Learning",   detail: "Always expanding the stack", icon: FiAward      },
];

// ─── NOISE OVERLAY ────────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <div style={{
      position:"absolute", inset:0, pointerEvents:"none", zIndex:2, opacity:0.022,
      backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat:"repeat", backgroundSize:"128px",
    }}/>
  );
}

// ─── CINEMATIC PARAGRAPH ─────────────────────────────────────────────────────
function CinematicParagraph({ children, style, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.4, margin: "-60px" });
  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0.08, y: 12 }}
      animate={{ opacity: isInView ? 1 : 0.18, y: isInView ? 0 : 8, scale: isInView ? 1 : 0.988 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.p>
  );
}

// ─── CINEMATIC SECTION ────────────────────────────────────────────────────────
function CinematicSection({ children, style, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.15, margin: "-30px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0.1, y: 20 }}
      animate={{ opacity: isInView ? 1 : 0.1, y: isInView ? 0 : 20 }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── ACHIEVEMENT CARD ─────────────────────────────────────────────────────────
function AchievementCard({ item, index, isMobile }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.3 });

  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const mxS = useSpring(mx, { stiffness: 160, damping: 18 });
  const myS = useSpring(my, { stiffness: 160, damping: 18 });
  const rotX = useTransform(myS, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotY = useTransform(mxS, [-0.5, 0.5], ["-12deg", "12deg"]);
  const glareBg = useTransform([mxS, myS], (l) => {
    const gx = (l[0] + 0.5) * 100;
    const gy = (l[1] + 0.5) * 100;
    return `radial-gradient(circle 120px at ${gx}% ${gy}%, rgba(232,98,42,0.13) 0%, transparent 65%)`;
  });

  const [hov, setHov] = useState(false);
  const Icon = item.icon;

  function handleMove(e) {
    if (isMobile) return;
    const r = cardRef.current?.getBoundingClientRect();
    if (r) { mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }
  }

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateX: isMobile ? 0 : rotX,
        rotateY: isMobile ? 0 : rotY,
        transformStyle: "preserve-3d",
        perspective: "900px",
      }}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.94 }}
      transition={{ duration: 0.65, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMove}
      onMouseEnter={() => { if (!isMobile) setHov(true); }}
      onMouseLeave={() => { mx.set(0); my.set(0); setHov(false); }}
    >
      {/* Glow */}
      <motion.div animate={{ opacity: hov ? 0.85 : 0.25 }} transition={{ duration: 0.7 }}
        style={{ position:"absolute", inset:-14, borderRadius:24,
          background:"radial-gradient(ellipse,rgba(232,98,42,0.15) 0%,transparent 70%)",
          filter:"blur(16px)", pointerEvents:"none", zIndex:-1 }}/>

      <div style={{
        position:"relative", overflow:"hidden",
        padding: isMobile ? "1.2rem 1rem" : "1.6rem 1.4rem",
        borderRadius:18,
        background: hov
          ? "linear-gradient(145deg,rgba(14,11,8,0.98) 0%,rgba(10,8,6,0.98) 100%)"
          : "linear-gradient(145deg,rgba(9,8,6,0.9) 0%,rgba(7,6,5,0.85) 100%)",
        border:`1px solid ${hov ? T.borderH : T.borderB}`,
        boxShadow: hov
          ? `0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)`
          : `0 8px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)`,
        transition:"border-color 0.3s, box-shadow 0.4s, background 0.35s",
        backdropFilter:"blur(14px)",
        height:"100%",
      }}>
        {/* Top accent */}
        <motion.div animate={{ opacity: hov ? 1 : 0, scaleX: hov ? 1 : 0.3 }} transition={{ duration: 0.3 }}
          style={{ position:"absolute", top:0, left:0, right:0, height:2, borderRadius:"18px 18px 0 0",
            background:`linear-gradient(90deg,transparent,${T.orange},transparent)`, transformOrigin:"center" }}/>

        {/* Glare */}
        {!isMobile && (
          <motion.div style={{ position:"absolute", inset:0, borderRadius:18, pointerEvents:"none",
            background:glareBg, opacity: hov?1:0, transition:"opacity 0.3s" }}/>
        )}

        {/* Corner deco */}
        <div style={{ position:"absolute", top:8, right:8, width:14, height:14,
          borderTop:`1px solid rgba(232,98,42,${hov?0.4:0.1})`,
          borderRight:`1px solid rgba(232,98,42,${hov?0.4:0.1})`,
          borderRadius:"0 3px 0 0", transition:"border-color 0.3s" }}/>

        <div style={{ position:"relative" }}>
          <div style={{
            marginBottom:"0.8rem", width:32, height:32, borderRadius:9,
            background: hov ? "rgba(232,98,42,0.15)" : "rgba(255,255,255,0.04)",
            border:`1px solid ${hov ? "rgba(232,98,42,0.3)" : T.borderB}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.3s",
          }}>
            <Icon size={13} color={hov ? T.orange : "rgba(255,255,255,0.28)"} style={{ transition:"color 0.3s" }}/>
          </div>
          <h4 style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize: isMobile ? "clamp(1.6rem,7vw,2.2rem)" : "clamp(1.8rem,3vw,2.7rem)",
            fontWeight:400, letterSpacing:"0.04em",
            color:T.text, margin:"0 0 0.15rem 0", lineHeight:1,
          }}>
            {item.count}
          </h4>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.42rem", textTransform:"uppercase",
            letterSpacing:"0.24em", color:T.orange, fontWeight:700, margin:"0 0 0.28rem 0" }}>
            {item.label}
          </p>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize: isMobile?"0.55rem":"0.6rem",
            color:T.muted, lineHeight:1.55, margin:0 }}>
            {item.detail}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SKILL TAG ────────────────────────────────────────────────────────────────
function SkillTag({ skill, index }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.82 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.08, y: -1 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:"inline-block",
        fontFamily:"'Space Mono',monospace",
        fontSize:"0.48rem", fontWeight:700,
        letterSpacing:"0.1em", textTransform:"uppercase",
        padding:"0.3rem 0.68rem", borderRadius:100,
        background: hov ? "rgba(232,98,42,0.12)" : "rgba(255,255,255,0.03)",
        border:`1px solid ${hov ? "rgba(232,98,42,0.36)" : T.borderB}`,
        color: hov ? "rgba(240,132,90,0.95)" : T.muted,
        transition:"all 0.22s ease", cursor:"default",
        whiteSpace:"nowrap",
      }}
    >
      {skill}
    </motion.span>
  );
}

// ─── SKILLS PANEL ─────────────────────────────────────────────────────────────
function SkillsPanel({ isMobile }) {
  const ref  = useRef(null);
  const mx   = useMotionValue(0);
  const my   = useMotionValue(0);
  const mxS  = useSpring(mx, { stiffness: 75, damping: 22 });
  const myS  = useSpring(my, { stiffness: 75, damping: 22 });
  const rotX = useTransform(myS, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotY = useTransform(mxS, [-0.5, 0.5], ["-5deg", "5deg"]);
  const shadowX = useTransform(mxS, [-0.5, 0.5], [-22, 22]);
  const shadowY = useTransform(myS, [-0.5, 0.5], [-14, 14]);
  const dynShadow = useTransform([shadowX, shadowY], (l) =>
    `${l[0]}px ${l[1]}px 70px rgba(0,0,0,0.88), 0 0 0 1px rgba(232,98,42,0.07)`);
  const glareBg = useTransform([mxS, myS], (l) => {
    const gx = (l[0] + 0.5) * 100;
    const gy = (l[1] + 0.5) * 100;
    return `radial-gradient(circle 340px at ${gx}% ${gy}%, rgba(232,98,42,0.07) 0%, transparent 65%)`;
  });
  const [hov, setHov] = useState(false);

  function handleMove(e) {
    if (isMobile) return;
    const r = ref.current?.getBoundingClientRect();
    if (r) { mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }
  }

  const pad = isMobile ? "1.5rem" : "2.4rem";

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => { if (!isMobile) setHov(true); }}
      onMouseLeave={() => { mx.set(0); my.set(0); setHov(false); }}
      style={{
        rotateX: isMobile ? 0 : rotX,
        rotateY: isMobile ? 0 : rotY,
        transformStyle:"preserve-3d",
        perspective:"1100px",
        boxShadow: isMobile ? undefined : dynShadow,
        width:"100%",
      }}
    >
      {/* Glow halo */}
      <motion.div animate={{ opacity: hov ? 0.65 : 0.25 }} transition={{ duration: 0.9 }}
        style={{ position:"absolute", inset:-28, borderRadius:36,
          background:"radial-gradient(ellipse,rgba(232,98,42,0.13) 0%,transparent 65%)",
          filter:"blur(26px)", pointerEvents:"none", zIndex:-1 }}/>

      {/* Stacked frames — hidden on mobile to avoid overflow */}
      {!isMobile && <>
        <div style={{ position:"absolute", inset:-8, borderRadius:32, border:"1px solid rgba(232,98,42,0.07)", transform:"rotate(1.4deg) scale(1.01)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:-15, borderRadius:36, border:"1px solid rgba(232,98,42,0.035)", transform:"rotate(-1deg) scale(1.01)", pointerEvents:"none" }}/>
      </>}

      <CinematicSection style={{
        position:"relative", overflow:"hidden",
        background:"linear-gradient(148deg,rgba(9,8,12,0.97) 0%,rgba(7,6,11,0.97) 100%)",
        border:`1px solid ${hov ? T.borderH : T.borderB}`,
        padding: pad, borderRadius: isMobile ? 20 : 26,
        backdropFilter:"blur(22px)",
        boxShadow: hov
          ? `0 45px 90px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.07)`
          : `0 18px 55px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.04)`,
        transition:"border-color 0.35s, box-shadow 0.45s",
      }}>
        {/* Top accent */}
        <motion.div animate={{ opacity: hov?1:0.4, scaleX: hov?1:0.5 }} transition={{ duration:0.45 }}
          style={{ position:"absolute", top:0, left:0, right:0, height:2,
            borderRadius: isMobile ? "20px 20px 0 0" : "26px 26px 0 0",
            background:`linear-gradient(90deg,transparent,${T.orange} 40%,${T.gold} 65%,transparent)`,
            transformOrigin:"center" }}/>

        {/* Glare — desktop only */}
        {!isMobile && (
          <motion.div style={{ position:"absolute", inset:0, borderRadius:26, pointerEvents:"none",
            background:glareBg, opacity: hov?1:0, transition:"opacity 0.4s" }}/>
        )}

        {/* Corner accents — desktop only */}
        {!isMobile && <>
          <div style={{ position:"absolute", top:14, right:14, width:20, height:20,
            borderTop:`1px solid rgba(232,98,42,${hov?0.5:0.14})`,
            borderRight:`1px solid rgba(232,98,42,${hov?0.5:0.14})`,
            borderRadius:"0 5px 0 0", transition:"border-color 0.3s" }}/>
          <div style={{ position:"absolute", bottom:14, left:14, width:20, height:20,
            borderBottom:`1px solid rgba(232,98,42,${hov?0.5:0.14})`,
            borderLeft:`1px solid rgba(232,98,42,${hov?0.5:0.14})`,
            borderRadius:"0 0 0 5px", transition:"border-color 0.3s" }}/>
        </>}

        <div style={{ position:"relative" }}>
          {/* Panel header */}
          <div style={{ marginBottom: isMobile ? "1.4rem" : "2rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.5rem" }}>
              <div style={{ width:20, height:2, background:`linear-gradient(to right,${T.orange},transparent)`, borderRadius:2 }}/>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.45rem", fontWeight:700,
                textTransform:"uppercase", letterSpacing:"0.28em", color:T.orange }}>
                Tech Stack & Tools
              </span>
            </div>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color:T.muted, lineHeight:1.7, margin:0 }}>
              Technologies I use to build modern web experiences.
            </p>
          </div>

          {/* Skill categories */}
          <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? "1.4rem" : "1.85rem" }}>
            {SKILL_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.div key={idx}
                  initial={{ opacity:0, y:14 }}
                  whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:false, amount:0.3 }}
                  transition={{ delay: idx * 0.1, duration:0.6, ease:[0.16,1,0.3,1] }}
                  style={{ display:"flex", flexDirection:"column", gap:"0.65rem" }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                    <div style={{ width:20, height:20, borderRadius:5,
                      background:"rgba(232,98,42,0.08)", border:"1px solid rgba(232,98,42,0.15)",
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon size={10} color="rgba(232,98,42,0.75)"/>
                    </div>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.44rem", fontWeight:700,
                      textTransform:"uppercase", letterSpacing:"0.2em", color:"rgba(255,255,255,0.48)" }}>
                      {cat.title}
                    </span>
                  </div>
                  {/* Tags wrap naturally */}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem" }}>
                    {cat.skills.map((skill, si) => (
                      <SkillTag key={skill} skill={skill} index={si}/>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Availability */}
          <motion.div
            initial={{ opacity:0, y:10 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:false, amount:0.4 }}
            transition={{ duration:0.65 }}
            style={{
              marginTop: isMobile ? "1.4rem" : "2rem",
              padding: isMobile ? "0.85rem 1rem" : "1rem 1.15rem",
              background:"rgba(34,197,94,0.048)",
              border:"1px solid rgba(34,197,94,0.2)", borderRadius:12,
              display:"flex", alignItems:"center", gap:"0.85rem",
            }}
          >
            <span style={{ position:"relative", display:"flex", width:10, height:10, flexShrink:0 }}>
              <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:T.green,
                opacity:0.65, animation:"ping 1.6s cubic-bezier(0,0,0.2,1) infinite" }}/>
              <span style={{ position:"relative", width:10, height:10, borderRadius:"50%",
                background:T.green, boxShadow:"0 0 10px rgba(34,197,94,0.8)", display:"inline-flex" }}/>
            </span>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.4rem", textTransform:"uppercase",
                letterSpacing:"0.22em", color:"rgba(34,197,94,0.72)", fontWeight:700, marginBottom:2, marginTop:0 }}>
                Available Now
              </p>
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize: isMobile?"0.62rem":"0.68rem",
                color:"rgba(255,255,255,0.82)", fontWeight:500, margin:0, lineHeight:1.4 }}>
                Open to Full-time, Contract & Remote
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <Link to="/contact" style={{ textDecoration:"none" }}>
            <motion.div
              whileHover={{ scale:1.03, boxShadow:`0 18px 45px rgba(232,98,42,0.38)` }}
              whileTap={{ scale:0.97 }}
              style={{
                marginTop:"1rem",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"0.55rem",
                padding: isMobile ? "0.82rem 1.4rem" : "0.9rem 1.6rem",
                borderRadius:6,
                background:`linear-gradient(135deg,${T.orange} 0%,${T.orangeD} 65%,#b03a0e 100%)`,
                color:"#fff", fontFamily:"'Space Mono',monospace",
                fontSize: isMobile ? "0.55rem" : "0.58rem",
                fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase",
                boxShadow:`0 8px 28px rgba(232,98,42,0.28), inset 0 1px 0 rgba(255,255,255,0.18)`,
                cursor:"pointer", position:"relative", overflow:"hidden",
                width:"100%",
              }}
            >
              <span style={{ position:"absolute", inset:0,
                background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.1) 50%,transparent)",
                animation:"shimA 3.5s infinite" }}/>
              Let's Connect <FiArrowRight size={12}/>
            </motion.div>
          </Link>
        </div>
      </CinematicSection>
    </motion.div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ isMobile }) {
  const headerRef = useRef(null);
  const isInView  = useInView(headerRef, { once: true, amount: 0.25 });
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ["start end", "end start"] });
  const y       = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.header ref={headerRef} style={{ opacity, marginBottom: isMobile ? "3rem" : "4.5rem", position:"relative" }}>

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity:0, x:-20 }}
        animate={isInView ? { opacity:1, x:0 } : { opacity:0, x:-20 }}
        transition={{ duration:0.75, ease:[0.16,1,0.3,1] }}
        style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom: isMobile ? "1.5rem" : "2rem",
          flexWrap: isMobile ? "wrap" : "nowrap" }}
      >
        {!isMobile && (
          <div style={{ height:1, width:26, background:`linear-gradient(to right,transparent,${T.orange})`, flexShrink:0 }}/>
        )}
        <div style={{ display:"inline-flex", alignItems:"center", gap:"0.46rem",
          padding:"0.32rem 0.9rem", borderRadius:100,
          background:"linear-gradient(135deg,rgba(232,98,42,0.1) 0%,rgba(232,98,42,0.04) 100%)",
          border:"1px solid rgba(232,98,42,0.28)", backdropFilter:"blur(12px)",
          boxShadow:"0 4px 14px rgba(232,98,42,0.08), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:T.orange,
            boxShadow:`0 0 10px ${T.orange},0 0 18px ${T.orange}44`,
            display:"inline-block", animation:"ldp 2.2s infinite", flexShrink:0 }}/>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.46rem", fontWeight:700,
            letterSpacing:"0.26em", textTransform:"uppercase", color:"rgba(240,132,90,0.95)",
            whiteSpace:"nowrap" }}>About Me</span>
        </div>
        {!isMobile && (
          <div style={{ height:1, flex:1, background:`linear-gradient(to right,${T.border},transparent)` }}/>
        )}
      </motion.div>

      {/* Headline */}
      <div style={{ position:"relative" }}>
        <motion.div style={{ y: isMobile ? 0 : y }}>
          <motion.h2
            initial={{ opacity:0, y:28 }}
            animate={isInView ? { opacity:1, y:0 } : { opacity:0, y:28 }}
            transition={{ duration:1.0, delay:0.16, ease:[0.16,1,0.3,1] }}
            style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize: isMobile ? "clamp(2.4rem,11vw,4rem)" : "clamp(2.8rem,6.5vw,6.8rem)",
              fontWeight:400, lineHeight:0.88,
              letterSpacing:"0.02em", color:T.text, margin:0,
            }}
          >
            Building Better
            <br/>
            <span style={{
              background:`linear-gradient(135deg,${T.okanA} 0%,${T.gold} 45%,${T.okanA} 100%)`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              filter:`drop-shadow(0 0 18px rgba(184,103,42,0.28))`,
            }}>
              Web Solutions.
            </span>
          </motion.h2>
        </motion.div>

        {/* Ghost watermark */}
        {!isMobile && (
          <div style={{
            position:"absolute", top:"-1rem", left:"-0.4rem",
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:"clamp(5rem,14vw,13rem)",
            fontWeight:400, color:"rgba(232,98,42,0.03)",
            lineHeight:1, pointerEvents:"none", userSelect:"none",
            letterSpacing:"0.04em", whiteSpace:"nowrap",
          }}>
            DEV
          </div>
        )}
      </div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX:0 }}
        animate={isInView ? { scaleX:1 } : { scaleX:0 }}
        transition={{ duration:1.2, delay:0.42, ease:[0.16,1,0.3,1] }}
        style={{ position:"absolute", bottom: isMobile ? "-1.6rem" : "-2.2rem",
          left:0, right:0, height:1,
          background:`linear-gradient(90deg,${T.orange}55,${T.borderB} 60%,transparent)`,
          transformOrigin:"left" }}
      />
    </motion.header>
  );
}

// ─── FLOATING LINE ────────────────────────────────────────────────────────────
function FloatLine({ style }) {
  return (
    <motion.div
      animate={{ opacity:[0.35,0.7,0.35], scaleX:[0.96,1.04,0.96] }}
      transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
      style={{ height:1, background:`linear-gradient(90deg,transparent,${T.orange}44,transparent)`, ...style }}
    />
  );
}

// ─── MAIN ABOUT ───────────────────────────────────────────────────────────────
export default function About() {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmall,  setIsSmall]  = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1100);
      setIsSmall(window.innerWidth < 480);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const monoSm = isSmall ? "0.6rem" : "0.68rem";

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        position:"relative", background:T.bg, color:T.text, overflow:"hidden",
        borderTop:"1px solid rgba(232,98,42,0.08)",
        paddingTop:    isMobile ? "calc(var(--navbar-height,70px) + 4rem)"   : "calc(var(--navbar-height,70px) + 5.5rem)",
        paddingBottom: isMobile ? "4.5rem" : "6.5rem",
        paddingLeft:   isSmall  ? "4.5%"  : isMobile ? "5%"  : "6%",
        paddingRight:  isSmall  ? "4.5%"  : isMobile ? "5%"  : "6%",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* Two-col desktop */
        .ag { display:grid; grid-template-columns:1fr 1fr; gap:4.5rem; align-items:start; }

        /* Achievement row */
        .ag-ach { display:grid; grid-template-columns:repeat(3,1fr); gap:0.8rem; }

        /* Tablet: single column */
        @media (max-width:1099px) {
          .ag { grid-template-columns:1fr; gap:2.5rem; }
          .ag-sticky { position:static !important; top:auto !important; }
        }

        /* Mobile: 2-col achievements */
        @media (max-width:640px) {
          .ag-ach { grid-template-columns:1fr 1fr; gap:0.6rem; }
          .ag-ach > *:last-child:nth-child(odd) { grid-column:1/-1; }
        }

        /* Small: 1-col achievements */
        @media (max-width:380px) {
          .ag-ach { grid-template-columns:1fr; }
        }

        @keyframes ping  { 75%,100% { transform:scale(2.2); opacity:0; } }
        @keyframes ldp   { 0%,100%  { opacity:1; transform:scale(1); } 50% { opacity:.22; transform:scale(.6); } }
        @keyframes shimA { 0% { transform:translateX(-120%); } 100% { transform:translateX(320%); } }
      `}</style>

      {/* ── Atmosphere ── */}
      <NoiseOverlay />

      <motion.div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", opacity:bgOpacity, zIndex:0 }}>
        <div style={{ position:"absolute", top:"-10%", left:"20%", width:"55vw", height:"55vw", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(232,98,42,0.06) 0%,transparent 65%)", filter:"blur(90px)" }}/>
        <div style={{ position:"absolute", bottom:"-5%", right:"5%", width:"38vw", height:"38vw", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(100,60,200,0.04) 0%,transparent 65%)", filter:"blur(70px)" }}/>
        <div style={{ position:"absolute", top:"42%", left:"-5%", width:"28vw", height:"28vw", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(212,146,58,0.04) 0%,transparent 65%)", filter:"blur(55px)" }}/>
      </motion.div>

      {/* Fine grid */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"linear-gradient(rgba(255,255,255,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.014) 1px,transparent 1px)",
        backgroundSize:"68px 68px",
        maskImage:"radial-gradient(ellipse 85% 65% at 50% 20%,black 35%,transparent 100%)" }}/>

      {/* Diagonal */}
      {!isMobile && (
        <div style={{ position:"absolute", top:0, left:"38%", width:1, height:"100%",
          background:"linear-gradient(to bottom,transparent,rgba(232,98,42,0.09) 45%,transparent)",
          transform:"rotate(-8deg)", pointerEvents:"none", zIndex:0 }}/>
      )}

      <FloatLine style={{ position:"absolute", top:"32%", left:0, right:0, zIndex:0 }}/>
      <FloatLine style={{ position:"absolute", top:"70%", left:0, right:0, zIndex:0, opacity:0.5 }}/>

      {/* ── Content ── */}
      <div style={{ maxWidth:1400, margin:"0 auto", position:"relative", zIndex:10 }}>
        <SectionHeader isMobile={isMobile} />

        <div style={{ marginTop: isMobile ? "3.5rem" : "5rem" }} className="ag">

          {/* LEFT: bio + achievements */}
          <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? "2rem" : "3rem" }}>

            {/* Bio */}
            <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
              <CinematicParagraph style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize: isSmall ? "clamp(1.1rem,5.5vw,1.4rem)" : "clamp(1.2rem,2.2vw,1.6rem)",
                fontWeight:400, letterSpacing:"0.04em",
                color:"rgba(242,238,248,0.9)", lineHeight:1.4, margin:0,
              }}>
                I'm a{" "}
                <span style={{ color:T.text }}>Full-Stack Developer</span>
                {" "}building with{" "}
                <span style={{
                  background:`linear-gradient(135deg,${T.orange},${T.gold})`,
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  React.js, JavaScript, Node.js
                </span>
                {" "}and always growing.
              </CinematicParagraph>

              <div style={{ display:"flex", flexDirection:"column", gap:"0.9rem" }}>
                <CinematicParagraph delay={0.07}
                  style={{ fontFamily:"'Space Mono',monospace", fontSize:monoSm, color:T.muted, lineHeight:1.9, margin:0 }}>
                  I specialize in creating{" "}
                  <span style={{ color:"rgba(240,132,90,0.85)" }}>clean, responsive, and user-friendly interfaces</span>
                  , while developing backend logic that supports scalable applications. My core strength is bridging frontend and backend to ship complete, working products.
                </CinematicParagraph>

                <CinematicParagraph delay={0.13}
                  style={{ fontFamily:"'Space Mono',monospace", fontSize:monoSm, color:T.muted, lineHeight:1.9, margin:0 }}>
                  On the backend, I build and consume{" "}
                  <span style={{ color:"rgba(240,132,90,0.85)" }}>RESTful APIs</span>
                  , handle data flow between frontend and server, and integrate third-party services. I focus on{" "}
                  <span style={{ color:"rgba(240,132,90,0.85)" }}>performance, accessibility, and maintainability.</span>
                </CinematicParagraph>

                <CinematicParagraph delay={0.19}
                  style={{ fontFamily:"'Space Mono',monospace", fontSize:monoSm, color:T.muted, lineHeight:1.9, margin:0 }}>
                  I collaborate with designers and stakeholders to turn ideas into{" "}
                  <span style={{ color:"rgba(240,132,90,0.85)" }}>functional digital solutions</span>
                  , and I'm currently deepening my knowledge of{" "}
                  <span style={{ color:"rgba(240,132,90,0.85)" }}>WordPress and CMS-driven development.</span>
                </CinematicParagraph>

                {/* Pull quote */}
                <CinematicParagraph delay={0.25}
                  style={{
                    fontFamily:"'Bebas Neue',sans-serif",
                    fontSize: isSmall ? "0.85rem" : "0.95rem",
                    fontWeight:400, letterSpacing:"0.07em",
                    color:T.faint, lineHeight:1.65,
                    borderLeft:`2px solid rgba(232,98,42,0.2)`,
                    paddingLeft:"1.1rem", margin:0,
                  }}>
                  Continuously growing across the full stack — curious, driven, and committed to learning the right way.
                </CinematicParagraph>
              </div>
            </div>

            {/* Achievements */}
            <CinematicSection style={{ display:"flex", flexDirection:"column", gap:"0.8rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.1rem" }}>
                <div style={{ width:18, height:2, background:`linear-gradient(to right,${T.orange},transparent)`, borderRadius:2 }}/>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.42rem", fontWeight:700,
                  textTransform:"uppercase", letterSpacing:"0.3em", color:T.faint }}>Key Metrics</span>
              </div>
              <div className="ag-ach">
                {ACHIEVEMENTS.map((item, i) => (
                  <AchievementCard key={i} item={item} index={i} isMobile={isMobile}/>
                ))}
              </div>
            </CinematicSection>
          </div>

          {/* RIGHT: sticky skills panel */}
          <div className="ag-sticky" style={{ position:"sticky", top:"7rem" }}>
            <SkillsPanel isMobile={isMobile}/>
          </div>

        </div>
      </div>
    </section>
  );
}
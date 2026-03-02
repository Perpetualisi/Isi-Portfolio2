import React, { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { FiCode, FiLayers, FiTerminal, FiCpu, FiZap, FiTrendingUp, FiAward } from "react-icons/fi";

// ─── THEME (matches Hero + Portfolio) ────────────────────────────────────────
var T = {
  bg:      "#040406",
  card:    "#0c0c10",
  orange:  "#F97316",
  orangeD: "#EA580C",
  text:    "#ffffff",
  muted:   "rgba(255,255,255,0.45)",
  faint:   "rgba(255,255,255,0.14)",
  border:  "rgba(249,115,22,0.15)",
  borderB: "rgba(255,255,255,0.07)",
  borderH: "rgba(249,115,22,0.35)",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
var SKILL_CATEGORIES = [
  {
    title: "Frontend Development",
    icon: FiLayers,
    skills: ["React.js", "JavaScript (ES6+)", "TypeScript", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "Backend & CMS",
    icon: FiCpu,
    skills: ["Node.js", "REST APIs", "Express.js", "WordPress", "CMS Management", "Database Design"],
  },
  {
    title: "Tools & Workflow",
    icon: FiTerminal,
    skills: ["Git", "GitHub", "Postman", "Docker", "VS Code", "Debugging", "API Integration", "CI/CD"],
  },
];

var ACHIEVEMENTS = [
  { count: "15+",  label: "Projects Delivered", detail: "Concept to production-grade apps",   icon: FiZap       },
  { count: "100%", label: "Responsive Ratio",    detail: "Optimized for all devices",          icon: FiTrendingUp },
  { count: "CMS",  label: "Expertise",           detail: "WordPress theme customization",      icon: FiAward     },
];

// ─── CINEMATIC PARAGRAPH (retained from original) ────────────────────────────
function CinematicParagraph({ children, style, delay }) {
  var ref = useRef(null);
  var isInView = useInView(ref, { once: false, amount: 0.5, margin: "-100px" });
  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0.1, y: 10 }}
      animate={{ opacity: isInView ? 1 : 0.3, y: isInView ? 0 : 10, scale: isInView ? 1 : 0.98 }}
      transition={{ duration: 0.8, delay: delay || 0, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.p>
  );
}

// ─── CINEMATIC SECTION (retained from original) ──────────────────────────────
function CinematicSection({ children, style, delay }) {
  var ref = useRef(null);
  var isInView = useInView(ref, { once: false, amount: 0.2, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0.2, y: 20 }}
      animate={{ opacity: isInView ? 1 : 0.2, y: isInView ? 0 : 20 }}
      transition={{ duration: 0.8, delay: delay || 0, ease: "easeOut" }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── 3D ACHIEVEMENT CARD ─────────────────────────────────────────────────────
function AchievementCard({ item, index }) {
  var cardRef = useRef(null);
  var isInView = useInView(cardRef, { once: false, amount: 0.5 });
  var scrollData = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  var scale = useTransform(scrollData.scrollYProgress, [0, 0.5, 1], [0.97, 1, 0.97]);

  var mx = useMotionValue(0);
  var my = useMotionValue(0);
  var mxS = useSpring(mx, { stiffness: 150, damping: 18 });
  var myS = useSpring(my, { stiffness: 150, damping: 18 });
  var rotX = useTransform(myS, [-0.5, 0.5], ["12deg", "-12deg"]);
  var rotY = useTransform(mxS, [-0.5, 0.5], ["-12deg", "12deg"]);
  var glareBg = useTransform([mxS, myS], function(latest) {
    var gx = (latest[0] + 0.5) * 100;
    var gy = (latest[1] + 0.5) * 100;
    return "radial-gradient(circle 120px at " + gx + "% " + gy + "%, rgba(249,115,22,0.12) 0%, transparent 65%)";
  });
  var [hov, setHov] = useState(false);

  function handleMove(e) {
    var r = cardRef.current && cardRef.current.getBoundingClientRect();
    if (r) { mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }
  }
  function handleLeave() { mx.set(0); my.set(0); setHov(false); }

  var Icon = item.icon;

  return (
    <motion.div
      ref={cardRef}
      style={{ scale, rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: "900px" }}
      initial={{ opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: 0.65, delay: index * 0.1 }}
      onMouseMove={handleMove}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={handleLeave}
    >
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "1.5rem", borderRadius: 18,
        background: hov ? "rgba(14,12,10,0.97)" : "rgba(10,9,8,0.8)",
        border: "1px solid " + (hov ? T.borderH : T.borderB),
        boxShadow: hov ? "0 30px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.08)" : "0 10px 30px rgba(0,0,0,0.5)",
        transition: "border-color 0.3s, box-shadow 0.4s, background 0.3s",
        backdropFilter: "blur(12px)",
        transform: "translateZ(30px)",
      }}>
        {/* Top accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, " + T.orange + ", transparent)", opacity: hov ? 1 : 0, transition: "opacity 0.35s", borderRadius: "18px 18px 0 0" }} />
        {/* Glare */}
        <motion.div style={{ position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none", background: glareBg, opacity: hov ? 1 : 0, transition: "opacity 0.3s" }} />

        <div style={{ transform: "translateZ(20px)" }}>
          <div style={{ marginBottom: "1rem", width: 36, height: 36, borderRadius: 10, background: hov ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.04)", border: "1px solid " + (hov ? "rgba(249,115,22,0.25)" : T.borderB), display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
            <Icon size={16} color={hov ? T.orange : "rgba(255,255,255,0.35)"} style={{ transition: "color 0.3s" }} />
          </div>
          <h4 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 300, color: T.text, margin: "0 0 0.25rem 0", letterSpacing: "-0.03em", lineHeight: 1 }}>
            {item.count}
          </h4>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.46rem", textTransform: "uppercase", letterSpacing: "0.28em", color: T.orange, fontWeight: 700, margin: "0 0 0.35rem 0" }}>{item.label}</p>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", color: T.muted, lineHeight: 1.55, margin: 0 }}>{item.detail}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── 3D SKILL TAG ─────────────────────────────────────────────────────────────
function SkillTag({ skill, index }) {
  var [hov, setHov] = useState(false);
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.88 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      whileHover={{ scale: 1.08, y: -2 }}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { setHov(false); }}
      style={{
        display: "inline-block",
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.52rem", fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase",
        padding: "0.35rem 0.8rem", borderRadius: 100,
        background: hov ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.03)",
        border: "1px solid " + (hov ? "rgba(249,115,22,0.3)" : T.borderB),
        color: hov ? "rgba(251,146,60,0.9)" : T.muted,
        transition: "all 0.22s ease",
        cursor: "default",
      }}
    >
      {skill}
    </motion.span>
  );
}

// ─── 3D SKILLS PANEL ─────────────────────────────────────────────────────────
function SkillsPanel() {
  var ref = useRef(null);
  var mx = useMotionValue(0);
  var my = useMotionValue(0);
  var mxS = useSpring(mx, { stiffness: 80, damping: 20 });
  var myS = useSpring(my, { stiffness: 80, damping: 20 });
  var rotX = useTransform(myS, [-0.5, 0.5], ["5deg", "-5deg"]);
  var rotY = useTransform(mxS, [-0.5, 0.5], ["-5deg", "5deg"]);
  var glareBg = useTransform([mxS, myS], function(latest) {
    var gx = (latest[0] + 0.5) * 100;
    var gy = (latest[1] + 0.5) * 100;
    return "radial-gradient(circle 350px at " + gx + "% " + gy + "%, rgba(249,115,22,0.07) 0%, transparent 65%)";
  });
  var [hov, setHov] = useState(false);

  function handleMove(e) {
    var r = ref.current && ref.current.getBoundingClientRect();
    if (r) { mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { mx.set(0); my.set(0); setHov(false); }}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      <CinematicSection style={{
        position: "relative", overflow: "hidden",
        background: "rgba(10,9,8,0.85)",
        border: "1px solid " + (hov ? T.borderH : T.borderB),
        padding: "2.25rem", borderRadius: 24,
        backdropFilter: "blur(20px)",
        boxShadow: hov
          ? "0 50px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.07)"
          : "0 20px 60px rgba(0,0,0,0.5)",
        transition: "border-color 0.35s, box-shadow 0.45s",
      }}>
        {/* Top accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, " + T.orange + " 40%, transparent)", opacity: hov ? 1 : 0, transition: "opacity 0.4s", borderRadius: "24px 24px 0 0" }} />

        {/* Glare */}
        <motion.div style={{ position: "absolute", inset: 0, borderRadius: 24, pointerEvents: "none", background: glareBg, opacity: hov ? 1 : 0, transition: "opacity 0.35s" }} />

        <div style={{ position: "relative", transform: "translateZ(30px)" }}>
          {/* Panel header */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
              <div style={{ width: 20, height: 2, background: "linear-gradient(to right, " + T.orange + ", transparent)", borderRadius: 2 }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: T.orange }}>Tech Stack & Tools</span>
            </div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", color: T.muted, lineHeight: 1.7, margin: 0 }}>Technologies I use to build modern web experiences.</p>
          </div>

          {/* Skill categories */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {SKILL_CATEGORIES.map(function(cat, idx) {
              var Icon = cat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.4 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                    <Icon size={13} color="rgba(249,115,22,0.65)" />
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(255,255,255,0.55)" }}>{cat.title}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {cat.skills.map(function(skill, si) {
                      return <SkillTag key={skill} skill={skill} index={si} />;
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Availability */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.5 }}
            style={{ marginTop: "2rem", padding: "1rem 1.1rem", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 14, display: "flex", alignItems: "center", gap: "0.85rem" }}
          >
            <span style={{ position: "relative", display: "flex", width: 10, height: 10, flexShrink: 0 }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#22c55e", opacity: 0.75, animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }} />
              <span style={{ position: "relative", width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.8)", display: "inline-flex" }} />
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.44rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(34,197,94,0.7)", fontWeight: 700, marginBottom: 3, marginTop: 0 }}>Availability</p>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.8)", fontWeight: 500, margin: 0 }}>Open to Full-time, Contract & Remote</p>
            </div>
          </motion.div>

          {/* CTA */}
          <Link
            to="/contact"
            style={{ marginTop: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", padding: "0.88rem 1.5rem", borderRadius: 4, background: "linear-gradient(135deg, " + T.orange + ", " + T.orangeD + ")", color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none", boxShadow: "0 8px 28px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.15)", cursor: "pointer" }}
          >
            Let's Connect <FiCode size={13} />
          </Link>
        </div>
      </CinematicSection>
    </motion.div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader() {
  var headerRef = useRef(null);
  var isInView = useInView(headerRef, { once: true });
  var scrollData = useScroll({ target: headerRef, offset: ["start end", "end start"] });
  var y = useTransform(scrollData.scrollYProgress, [0, 1], [40, -40]);
  var opacity = useTransform(scrollData.scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <motion.header ref={headerRef} style={{ opacity: opacity, marginBottom: "4rem", position: "relative" }}>
      {/* Eyebrow — matches Hero */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.7 }}
        style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}
      >
        <div style={{ height: 1, width: 28, background: "linear-gradient(to right, transparent, " + T.orange + ")", flexShrink: 0 }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.32rem 0.9rem", borderRadius: 100, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.22)", backdropFilter: "blur(10px)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.orange, boxShadow: "0 0 8px " + T.orange, display: "inline-block" }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(251,146,60,0.9)" }}>About Me</span>
        </div>
        <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, " + T.border + ", transparent)" }} />
      </motion.div>

      {/* Headline with parallax (retained) */}
      <div style={{ position: "relative" }}>
        <motion.div style={{ y: y }}>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(2.5rem, 6vw, 6rem)", fontWeight: 700, lineHeight: 0.9, letterSpacing: "-0.03em", color: T.text, margin: 0 }}
          >
            Building Better
            <br />
            <span style={{ fontStyle: "italic", fontWeight: 400, WebkitTextStroke: "1px rgba(255,255,255,0.2)", WebkitTextFillColor: "transparent", background: "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.18) 100%)", WebkitBackgroundClip: "text" }}>
              Web Solutions.
            </span>
          </motion.h2>
        </motion.div>

        {/* Ghost text */}
        <div style={{ position: "absolute", top: "-1rem", left: "-0.5rem", fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(5rem, 14vw, 12rem)", fontWeight: 700, color: "rgba(249,115,22,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.04em", whiteSpace: "nowrap" }}>
          DEV
        </div>
      </div>

      {/* Divider (retained) */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        style={{ position: "absolute", bottom: "-2rem", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, " + T.orange + "44, " + T.borderB + " 60%, transparent)", transformOrigin: "left" }}
      />
    </motion.header>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
function About() {
  var sectionRef = useRef(null);
  var scrollData = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  var bgOpacity = useTransform(scrollData.scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{ position: "relative", background: T.bg, color: T.text, padding: "calc(var(--navbar-height) + 6rem) 6% 6rem", borderTop: "1px solid rgba(249,115,22,0.08)", overflow: "hidden" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap');
        * { box-sizing: border-box; }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }
        .about-achievements {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.85rem;
        }

        @media (max-width: 1100px) {
          .about-grid { grid-template-columns: 1fr; gap: 3rem; }
          .about-achievements { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .about-achievements { grid-template-columns: 1fr; }
          section#about { padding: calc(var(--navbar-height) + 4rem) 5% 5rem !important; }
        }

        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>

      {/* Ambient bg blob (retained scroll-driven opacity) */}
      <motion.div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: bgOpacity }}>
        <div style={{ position: "absolute", top: 0, left: "25%", width: 500, height: 500, background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)", filter: "blur(100px)", borderRadius: "50%" }} />
      </motion.div>

      {/* Grid lines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 90% 60% at 50% 20%, black 40%, transparent 100%)" }} />

      <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader />

        <div style={{ marginTop: "5rem" }} className="about-grid">

          {/* LEFT — bio + achievements */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <CinematicParagraph
                style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(1.1rem, 2vw, 1.35rem)", fontWeight: 400, color: "rgba(255,255,255,0.9)", lineHeight: 1.55, letterSpacing: "-0.01em", margin: 0 }}
              >
                I'm a{" "}
                <span style={{ color: T.text, fontWeight: 700 }}>Full-Stack Developer</span>
                {" "}with experience building web applications using{" "}
                <span style={{ color: T.text, fontWeight: 700 }}>React.js, JavaScript, HTML, CSS</span>
                , alongside backend technologies such as{" "}
                <span style={{ color: T.text, fontWeight: 700 }}>Node.js, REST APIs, and WordPress.</span>
              </CinematicParagraph>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <CinematicParagraph delay={0.1} style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: T.muted, lineHeight: 1.85, margin: 0 }}>
                  I specialize in creating{" "}
                  <span style={{ color: "rgba(251,146,60,0.8)" }}>clean, responsive, and user-friendly interfaces</span>
                  , while also developing backend logic that supports scalable applications. I work with WordPress CMS, customizing themes, managing content, and extending functionality through plugins and API integrations.
                </CinematicParagraph>

                <CinematicParagraph delay={0.15} style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: T.muted, lineHeight: 1.85, margin: 0 }}>
                  On the backend, I build and consume{" "}
                  <span style={{ color: "rgba(251,146,60,0.8)" }}>RESTful APIs</span>
                  , handle data flow between frontend and server, and integrate third-party services such as analytics, forms, and authentication tools. I focus on{" "}
                  <span style={{ color: "rgba(251,146,60,0.8)" }}>performance, accessibility, and maintainability.</span>
                </CinematicParagraph>

                <CinematicParagraph delay={0.2} style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: T.muted, lineHeight: 1.85, margin: 0 }}>
                  I collaborate closely with designers, marketers, and non-technical stakeholders to translate ideas into{" "}
                  <span style={{ color: "rgba(251,146,60,0.8)" }}>functional digital solutions.</span>
                </CinematicParagraph>

                <CinematicParagraph delay={0.25} style={{ fontFamily: "'Clash Display', sans-serif", fontStyle: "italic", fontSize: "0.95rem", fontWeight: 400, color: T.faint, lineHeight: 1.65, borderLeft: "2px solid rgba(249,115,22,0.2)", paddingLeft: "1.1rem", margin: 0 }}>
                  I continuously improve my skills across the full stack and am interested in opportunities involving WordPress development, API-driven applications, and Node.js-based systems.
                </CinematicParagraph>
              </div>
            </div>

            {/* Achievements */}
            <CinematicSection style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
                <div style={{ width: 18, height: 2, background: "linear-gradient(to right, " + T.orange + ", transparent)", borderRadius: 2 }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.46rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: T.faint }}>Key Metrics</span>
              </div>
              <div className="about-achievements">
                {ACHIEVEMENTS.map(function(item, i) {
                  return <AchievementCard key={i} item={item} index={i} />;
                })}
              </div>
            </CinematicSection>
          </div>

          {/* RIGHT — sticky 3D skills panel */}
          <div style={{ position: "sticky", top: "8rem" }}>
            <SkillsPanel />
          </div>

        </div>
      </div>
    </section>
  );
}

export default About;
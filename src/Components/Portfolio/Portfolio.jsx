import React, { useRef, useState, useMemo } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiGithub, FiArrowUpRight, FiExternalLink } from "react-icons/fi";
import Portfolio_Data from "../../assets/portfolio_data";

// ─── THEME (matches Hero) ─────────────────────────────────────────────────────
var T = {
  bg:      "#040406",
  card:    "#0c0c10",
  cardHov: "#0f0f14",
  orange:  "#F97316",
  orangeD: "#EA580C",
  text:    "#ffffff",
  muted:   "rgba(255,255,255,0.45)",
  faint:   "rgba(255,255,255,0.14)",
  border:  "rgba(249,115,22,0.15)",
  borderB: "rgba(255,255,255,0.07)",
  borderH: "rgba(249,115,22,0.35)",
};

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
var ProjectCard = React.memo(function ProjectCard({ project, index }) {
  var cardRef = useRef(null);
  var isInView = useInView(cardRef, { once: true, margin: "-80px" });
  var [hov, setHov] = useState(false);

  var mx = useMotionValue(0);
  var my = useMotionValue(0);
  var mxS = useSpring(mx, { stiffness: 140, damping: 18 });
  var myS = useSpring(my, { stiffness: 140, damping: 18 });
  var rotX = useTransform(myS, [-0.5, 0.5], ["15deg", "-15deg"]);
  var rotY = useTransform(mxS, [-0.5, 0.5], ["-15deg", "15deg"]);
  var shineX = useTransform(mxS, [-0.5, 0.5], ["10%", "90%"]);
  var shineY = useTransform(myS, [-0.5, 0.5], ["10%", "90%"]);
  var shineBg = useTransform([shineX, shineY], function(latest) {
    return "radial-gradient(circle 280px at " + latest[0] + " " + latest[1] + ", rgba(249,115,22,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)";
  });
  var imgScale = useTransform(myS, [-0.5, 0.5], [1.06, 1.0]);

  function handleMove(e) {
    if (!cardRef.current) return;
    var r = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function handleLeave() { mx.set(0); my.set(0); setHov(false); }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.94 }}
      transition={{ duration: 0.85, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMove}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={handleLeave}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: "preserve-3d",
        perspective: "1100px",
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Outer glow */}
      <div style={{
        position: "absolute", inset: -1, borderRadius: 24,
        background: "radial-gradient(ellipse, rgba(249,115,22,0.18) 0%, transparent 70%)",
        filter: "blur(18px)",
        opacity: hov ? 1 : 0,
        transition: "opacity 0.5s ease",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <a
        href={project.link || "#"}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "block", height: "100%", textDecoration: "none", position: "relative", zIndex: 1 }}
      >
        <div style={{
          position: "relative", height: "100%", minHeight: 420,
          borderRadius: 22, overflow: "hidden",
          background: "linear-gradient(160deg, rgba(20,17,14,0.97) 0%, rgba(10,9,8,0.99) 100%)",
          border: "1px solid " + (hov ? T.borderH : T.borderB),
          boxShadow: hov
            ? "0 50px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(249,115,22,0.12)"
            : "0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          transition: "border-color 0.35s ease, box-shadow 0.45s ease",
        }}>

          {/* Image layer — 3D depth push */}
          <motion.div
            style={{
              position: "absolute", inset: 0,
              transform: "translateZ(-30px) scale(1.12)",
              transformStyle: "preserve-3d",
            }}
          >
            <img
              src={project.image}
              alt={project.title}
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                opacity: hov ? 0.52 : 0.35,
                filter: hov ? "saturate(1.2) brightness(1.05)" : "saturate(0.7) brightness(0.85)",
                transform: hov ? "scale(1.07)" : "scale(1)",
                transition: "opacity 0.6s ease, filter 0.6s ease, transform 0.9s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
            {/* Multi-layer gradient overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(4,4,6,0.98) 0%, rgba(4,4,6,0.75) 45%, rgba(4,4,6,0.2) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(249,115,22,0.06) 0%, transparent 50%)" }} />
          </motion.div>

          {/* Specular shine (orange-tinted to match hero) */}
          <motion.div
            style={{
              position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
              background: shineBg,
              opacity: hov ? 1 : 0,
              transition: "opacity 0.35s ease",
            }}
          />

          {/* Top accent line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 10,
            background: "linear-gradient(90deg, transparent, " + T.orange + ", transparent)",
            opacity: hov ? 1 : 0,
            transition: "opacity 0.4s ease",
          }} />

          {/* Content */}
          <div style={{
            position: "relative", zIndex: 20, height: "100%",
            padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between",
            transform: "translateZ(50px)", transformStyle: "preserve-3d",
          }}>
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.3em",
                color: "rgba(249,115,22,0.55)", textTransform: "uppercase",
              }}>
                {"#" + String(index + 1).padStart(2, "0")}
              </span>
              <motion.div
                animate={{ opacity: hov ? 1 : 0, rotate: hov ? 0 : -45, scale: hov ? 1 : 0.7 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, " + T.orange + ", " + T.orangeD + ")",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(249,115,22,0.5)",
                  transform: "translateZ(20px)",
                  flexShrink: 0,
                }}
              >
                <FiExternalLink size={15} color="#fff" strokeWidth={2.5} />
              </motion.div>
            </div>

            {/* Bottom content */}
            <div>
              {/* Tags */}
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {project.tags && project.tags.slice(0, 3).map(function(tag) {
                  return (
                    <span key={tag} style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "0.42rem", fontWeight: 700, letterSpacing: "0.15em",
                      textTransform: "uppercase", padding: "0.28rem 0.65rem",
                      background: "rgba(249,115,22,0.08)",
                      border: "1px solid rgba(249,115,22,0.18)",
                      borderRadius: 100, color: "rgba(251,146,60,0.85)",
                    }}>
                      {tag}
                    </span>
                  );
                })}
              </div>

              {/* Title */}
              <motion.h3
                style={{
                  fontFamily: "'Clash Display', sans-serif",
                  fontSize: "clamp(1.35rem, 2.5vw, 1.65rem)",
                  fontWeight: 700, color: T.text, lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  margin: "0 0 0.6rem 0",
                  transform: "translateZ(28px)",
                  textShadow: hov ? "0 4px 20px rgba(0,0,0,0.8)" : "none",
                  transition: "text-shadow 0.3s",
                }}
              >
                {project.title}
              </motion.h3>

              {/* Description */}
              <p style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.68rem", color: T.muted, lineHeight: 1.75,
                margin: "0 0 1.25rem 0",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                transform: "translateZ(18px)",
              }}>
                {project.description}
              </p>

              {/* Bottom bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <motion.div style={{
                  height: 2, background: "linear-gradient(90deg, " + T.orange + ", transparent)",
                  borderRadius: 2,
                  width: hov ? 80 : 0,
                  transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                }} />
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.42rem", fontWeight: 700, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: T.faint,
                  opacity: hov ? 1 : 0, transition: "opacity 0.4s",
                }}>
                  View Project
                </span>
              </div>
            </div>
          </div>
        </div>
      </a>

      {/* Drop shadow layer */}
      <div style={{
        position: "absolute", inset: "6% 8% -6%",
        background: "rgba(249,115,22,0.08)", filter: "blur(28px)",
        borderRadius: 24, zIndex: -1,
        opacity: hov ? 1 : 0, transition: "opacity 0.5s ease",
      }} />
    </motion.div>
  );
});

ProjectCard.displayName = "ProjectCard";

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader() {
  var ref = useRef(null);
  var inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <header ref={ref} style={{ marginBottom: "5rem", position: "relative", paddingBottom: "3rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Eyebrow — matches hero */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.7 }}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <div style={{ height: 1, width: 28, background: "linear-gradient(to right, transparent, " + T.orange + ")", flexShrink: 0 }} />
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.32rem 0.9rem", borderRadius: 100, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.22)", backdropFilter: "blur(10px)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.orange, boxShadow: "0 0 8px " + T.orange, display: "inline-block" }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(251,146,60,0.9)" }}>Portfolio</span>
          </div>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, " + T.border + ", transparent)" }} />
        </motion.div>

        {/* Main heading + descriptor */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            {/* Ghost number */}
            <div style={{ position: "absolute", top: "-1.5rem", left: "-0.5rem", fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(6rem, 14vw, 12rem)", fontWeight: 700, color: "rgba(249,115,22,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.04em", whiteSpace: "nowrap" }}>
              WORK
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(3rem, 7vw, 7rem)", fontWeight: 700, lineHeight: 0.88, letterSpacing: "-0.03em", color: T.text, margin: 0, position: "relative", zIndex: 1 }}
            >
              Selected
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 400, WebkitTextStroke: "1px rgba(255,255,255,0.2)", WebkitTextFillColor: "transparent", background: "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.18) 100%)", WebkitBackgroundClip: "text" }}>
                Projects.
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ maxWidth: 320 }}
          >
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: T.muted, lineHeight: 1.85, borderLeft: "2px solid rgba(249,115,22,0.22)", paddingLeft: "1.1rem", margin: "0 0 0.75rem 0" }}>
              A curated collection of high-performance interactive experiences — modern interfaces and immersive digital architecture.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.orange, boxShadow: "0 0 8px " + T.orange }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: T.faint }}>2024 — Present</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Divider line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.1, delay: 0.5 }}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, " + T.orange + "44, " + T.borderB + " 60%, transparent)", transformOrigin: "left" }}
      />
    </header>
  );
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────
function Portfolio() {
  var validProjects = useMemo(function() { return Portfolio_Data.slice(0, 6); }, []);
  var footerRef = useRef(null);
  var isFooterInView = useInView(footerRef, { once: true });

  return (
    <section
      id="portfolio"
      style={{ position: "relative", background: T.bg, color: T.text, padding: "calc(var(--navbar-height) + 5rem) 6% 7rem", overflow: "hidden" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap');
        * { box-sizing: border-box; }

        .port-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          perspective: 2200px;
        }

        @media (max-width: 1100px) {
          .port-grid { grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
          .port-header-row { flex-direction: column !important; align-items: flex-start !important; }
        }

        @media (max-width: 640px) {
          .port-grid { grid-template-columns: 1fr; gap: 1rem; }
          section#portfolio { padding: calc(var(--navbar-height) + 3rem) 5% 5rem !important; }
        }

        @keyframes dot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>

      {/* Background grid lines — same as hero */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 90% 60% at 50% 20%, black 40%, transparent 100%)" }} />

      {/* Ambient orange glow top-right */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 65%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "5%", left: "-8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(234,88,12,0.05) 0%, transparent 65%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader />

        <div className="port-grid">
          {validProjects.map(function(project, i) {
            return (
              <ProjectCard key={project.id || i} project={project} index={i} />
            );
          })}
        </div>

        {/* Footer CTA */}
        <footer ref={footerRef} style={{ marginTop: "6rem", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isFooterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7 }}
          >
            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "3rem" }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, " + T.borderB + ")" }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.3em", textTransform: "uppercase", color: T.faint, whiteSpace: "nowrap" }}>More on GitHub</span>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, " + T.borderB + ")" }} />
            </div>

            <motion.a
              href="https://github.com/Perpetualisi/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(249,115,22,0.25)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.75rem",
                padding: "0.9rem 2.2rem", borderRadius: 4,
                background: "transparent",
                border: "1px solid " + T.borderB,
                color: T.muted,
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.6rem", fontWeight: 700,
                letterSpacing: "0.22em", textTransform: "uppercase",
                textDecoration: "none",
                backdropFilter: "blur(12px)",
                transition: "border-color 0.3s, color 0.3s",
              }}
              onMouseEnter={function(e) { e.currentTarget.style.borderColor = T.borderH; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={function(e) { e.currentTarget.style.borderColor = T.borderB; e.currentTarget.style.color = T.muted; }}
            >
              <FiGithub size={15} />
              View Full Archive
              <FiArrowUpRight size={14} />
            </motion.a>
          </motion.div>
        </footer>
      </div>
    </section>
  );
}

export default Portfolio;
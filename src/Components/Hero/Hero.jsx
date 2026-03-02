import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import {
  FiArrowRight,
  FiDownload,
  FiClock,
  FiCode,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";

const T = {
  bg:      "#040406",
  card:    "#0c0c10",
  orange:  "#F97316",
  orangeD: "#EA580C",
  text:    "#ffffff",
  muted:   "rgba(255,255,255,0.45)",
  faint:   "rgba(255,255,255,0.14)",
  border:  "rgba(249,115,22,0.15)",
  borderB: "rgba(255,255,255,0.06)",
};

function makeParticles() {
  var arr = [];
  for (var i = 0; i < 40; i++) {
    arr.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      dur: Math.random() * 6 + 4,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.4 + 0.1,
    });
  }
  return arr;
}
var PARTICLES = makeParticles();

function ParticleField() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {PARTICLES.map(function(p) {
        return (
          <motion.div
            key={p.id}
            animate={{ opacity: [p.opacity, p.opacity * 0.2, p.opacity], y: [0, -20, 0] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: p.x + "%",
              top: p.y + "%",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.x > 50 ? T.orange : "rgba(255,255,255,0.8)",
              boxShadow: p.x > 50 ? "0 0 " + (p.size * 4) + "px " + T.orange : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function OrbitalRings() {
  var sizes = [320, 440, 560];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden" }}>
      {sizes.map(function(size, i) {
        return (
          <motion.div
            key={size}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 30 + i * 12, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: "1px solid rgba(249,115,22," + (0.08 - i * 0.02) + ")",
            }}
          >
            <div style={{
              position: "absolute", top: -3, left: "50%",
              width: 5, height: 5, borderRadius: "50%",
              background: T.orange,
              boxShadow: "0 0 8px " + T.orange,
              transform: "translateX(-50%)",
              opacity: 0.8,
            }} />
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── 3D PROFILE CARD ─────────────────────────────────────────────────────────
function ProfileCard3D({ time, isMobile }) {
  var ref = useRef(null);
  var mx = useMotionValue(0);
  var my = useMotionValue(0);
  var rotX = useSpring(useTransform(my, [-0.5, 0.5], ["14deg", "-14deg"]), { stiffness: 80, damping: 16 });
  var rotY = useSpring(useTransform(mx, [-0.5, 0.5], ["-14deg", "14deg"]), { stiffness: 80, damping: 16 });
  var glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  var glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);
  var glareBg = useTransform([glareX, glareY], function(latest) {
    return "radial-gradient(circle at " + latest[0] + " " + latest[1] + ", rgba(255,255,255,0.07) 0%, transparent 55%)";
  });
  var [hov, setHov] = useState(false);

  function handleMove(e) {
    if (isMobile) return;
    var r = ref.current && ref.current.getBoundingClientRect();
    if (r) {
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    }
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={function() { if (!isMobile) setHov(true); }}
      onMouseLeave={function() { mx.set(0); my.set(0); setHov(false); }}
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        rotateX: isMobile ? 0 : rotX,
        rotateY: isMobile ? 0 : rotY,
        transformStyle: "preserve-3d",
        perspective: "1200px",
        position: "relative",
        width: "100%",
        maxWidth: isMobile ? 300 : 420,
        margin: "0 auto",
        cursor: "default",
      }}
    >
      {/* Glow */}
      <motion.div
        animate={{ opacity: hov ? 1 : 0.6 }}
        transition={{ duration: 0.6 }}
        style={{
          position: "absolute", inset: -20, borderRadius: 36,
          background: "radial-gradient(ellipse, rgba(249,115,22,0.2) 0%, transparent 65%)",
          filter: "blur(28px)", pointerEvents: "none",
        }}
      />

      {/* Rotated frames */}
      <div style={{ position: "absolute", inset: -7, borderRadius: 34, border: "1px solid rgba(249,115,22,0.14)", transform: "rotate(2.5deg)", background: "rgba(249,115,22,0.02)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: -13, borderRadius: 38, border: "1px solid rgba(249,115,22,0.07)", transform: "rotate(-1.5deg)", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{
        position: "relative", padding: 5, borderRadius: 28,
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 50px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(249,115,22,0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}>
        {/* Glare */}
        <motion.div style={{
          position: "absolute", inset: 0, borderRadius: 28, pointerEvents: "none", zIndex: 10,
          background: glareBg,
          opacity: hov ? 1 : 0,
          transition: "opacity 0.3s",
        }} />

        {/* Photo */}
        <div style={{ position: "relative", borderRadius: 24, overflow: "hidden" }}>
          <img
            src="/profile41.jpeg"
            alt="Perpetual Okan"
            style={{
              width: "100%",
              aspectRatio: isMobile ? "3/4" : "4/5",
              objectFit: "cover", display: "block",
              filter: hov ? "saturate(1.2) brightness(1.1) contrast(1.05)" : "saturate(1.05) brightness(1.02)",
              transform: hov ? "scale(1.04)" : "scale(1)",
              transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(249,115,22,0.08) 0%, transparent 45%, rgba(0,0,0,0.4) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", background: "linear-gradient(to top, rgba(4,4,6,0.85) 0%, transparent 100%)", pointerEvents: "none" }} />
        </div>

        {/* Role pill */}
        <div style={{
          position: "absolute", top: "0.9rem", left: "0.9rem",
          background: "rgba(4,4,6,0.75)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(249,115,22,0.28)", borderRadius: 100,
          padding: "0.28rem 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem",
        }}>
          <span className="live-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: T.orange, boxShadow: "0 0 6px " + T.orange, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.46rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>Full-Stack Engineer</span>
        </div>
      </div>

      {/* System Live badge */}
      <motion.div
        initial={{ opacity: 0, x: 16, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          bottom: isMobile ? -22 : -26,
          right: isMobile ? -10 : -18,
          zIndex: 20,
          background: T.card, backdropFilter: "blur(24px)",
          border: "1px solid rgba(249,115,22,0.22)", borderRadius: 16,
          padding: isMobile ? "0.55rem 0.85rem" : "0.75rem 1.1rem",
          display: "flex", alignItems: "center", gap: "0.6rem",
          boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
        }}
      >
        <div style={{ width: isMobile ? 30 : 36, height: isMobile ? 30 : 36, borderRadius: 9, background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FiClock style={{ color: T.orange, fontSize: isMobile ? 13 : 15 }} />
        </div>
        <div>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", color: "rgba(249,115,22,0.75)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: 2, marginTop: 0 }}>System Live</p>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: isMobile ? "0.7rem" : "0.8rem", color: T.text, fontWeight: 700, margin: 0 }}>{time}</p>
        </div>
      </motion.div>

      {/* Stack badge — hidden on very small screens */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute", top: "28%",
          left: isMobile ? -12 : -34,
          zIndex: 20,
          background: T.card, backdropFilter: "blur(24px)",
          border: "1px solid rgba(249,115,22,0.18)", borderRadius: 12,
          padding: isMobile ? "0.45rem 0.7rem" : "0.6rem 0.85rem",
          display: "flex", flexDirection: "column", gap: "0.15rem",
          boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
        }}
      >
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.4rem", color: "rgba(249,115,22,0.65)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Stack</span>
        <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: isMobile ? "0.75rem" : "0.85rem", fontWeight: 700, color: T.text }}>React</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.4rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Node · Next</span>
      </motion.div>
    </motion.div>
  );
}

// ─── STAT ─────────────────────────────────────────────────────────────────────
function Stat({ icon: Icon, value, label, delay }) {
  var [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { setHov(false); }}
      style={{
        display: "flex", alignItems: "center", gap: "0.6rem",
        padding: "0.65rem 0.9rem", borderRadius: 12,
        background: hov ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.03)",
        border: "1px solid " + (hov ? "rgba(249,115,22,0.3)" : T.borderB),
        transition: "all 0.3s ease", cursor: "default", flex: 1,
        minWidth: 0,
      }}
    >
      <Icon style={{ color: T.orange, fontSize: 13, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "1rem", fontWeight: 700, color: T.text, lineHeight: 1, margin: 0, whiteSpace: "nowrap" }}>{value}</p>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", textTransform: "uppercase", letterSpacing: "0.18em", color: T.muted, marginTop: 2, marginBottom: 0, whiteSpace: "nowrap" }}>{label}</p>
      </div>
    </motion.div>
  );
}

// ─── SCROLL INDICATOR ─────────────────────────────────────────────────────────
function ScrollIndicator({ opacity }) {
  return (
    <motion.div
      style={{ opacity: opacity, position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "none" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2 }}
    >
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", textTransform: "uppercase", letterSpacing: "0.4em", color: T.faint }}>Scroll</span>
      <div style={{ width: 18, height: 32, border: "2px solid rgba(255,255,255,0.1)", borderRadius: 100, display: "flex", justifyContent: "center", padding: "3px 0" }}>
        <motion.div
          animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 3, height: 7, background: T.orange, borderRadius: 100 }}
        />
      </div>
    </motion.div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  var containerRef = useRef(null);
  var scrollData = useScroll();
  var scrollY = scrollData.scrollY;
  var [time, setTime] = useState(new Date());
  var [isMobile, setIsMobile] = useState(false);
  var mouseX = useMotionValue(0.5);
  var mouseY = useMotionValue(0.5);
  var mxS = useSpring(mouseX, { stiffness: 60, damping: 20 });
  var myS = useSpring(mouseY, { stiffness: 60, damping: 20 });
  var opacity = useTransform(scrollY, [0, 400], [1, 0]);
  var yRaw = useTransform(scrollY, [0, 500], [0, -60]);
  var yParallax = useSpring(yRaw, { stiffness: 80, damping: 28 });
  var spotlightBg = useTransform([mxS, myS], function(latest) {
    return "radial-gradient(800px circle at " + (latest[0] * 100) + "% " + (latest[1] * 100) + "%, rgba(249,115,22,0.08), transparent 70%)";
  });

  useEffect(function() {
    var t = setInterval(function() { setTime(new Date()); }, 1000);
    return function() { clearInterval(t); };
  }, []);

  useEffect(function() {
    function check() { setIsMobile(window.innerWidth < 1024); }
    check();
    window.addEventListener("resize", check);
    return function() { window.removeEventListener("resize", check); };
  }, []);

  var handleMouseMove = useCallback(function(e) {
    if (isMobile) return;
    var el = containerRef.current;
    if (!el) return;
    var r = el.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top) / r.height);
  }, [mouseX, mouseY, isMobile]);

  var formattedTime = time.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", background: T.bg, overflow: "hidden", padding: isMobile ? "calc(var(--navbar-height) + 5rem) 5% 6rem" : "calc(var(--navbar-height) + 6rem) 6% 5rem" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap');
        * { box-sizing: border-box; }

        /* Desktop: text left, image right */
        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          grid-template-areas: "text img";
          gap: 5rem;
          align-items: center;
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
        }
        .hero-text { grid-area: text; }
        .hero-img  { grid-area: img; display: flex; justify-content: center; }

        /* Mobile: image FIRST, then text */
        @media (max-width: 1023px) {
          .hero-grid {
            grid-template-columns: 1fr;
            grid-template-areas: "img" "text";
            gap: 2.5rem;
            text-align: center;
          }
          .hero-stats    { justify-content: center !important; }
          .hero-btns     { justify-content: center !important; }
          .hero-eyebrow  { justify-content: center !important; }
          .hero-desc     { margin-left: auto !important; margin-right: auto !important; border-left: none !important; padding-left: 0 !important; border-top: 2px solid rgba(249,115,22,0.2) !important; padding-top: 1rem !important; }
          .hero-divider-line { display: none !important; }
        }

        @media (max-width: 640px) {
          .hero-btns  { flex-direction: column !important; align-items: stretch !important; }
          .hero-stats { flex-wrap: wrap !important; }
        }

        @keyframes dot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .live-dot { animation: dot-pulse 2s infinite; }
      `}</style>

      <ParticleField />

      {/* Orbital rings — centered on image side */}
      {!isMobile && (
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: "45vw", height: "100vh", pointerEvents: "none", overflow: "hidden" }}>
          <OrbitalRings />
        </div>
      )}
      {isMobile && (
        <div style={{ position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)", width: "100vw", height: "55vh", pointerEvents: "none", overflow: "hidden" }}>
          <OrbitalRings />
        </div>
      )}

      {/* Spotlight */}
      <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, background: spotlightBg }} />

      {/* Grid lines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 50%, transparent 100%)" }} />

      {/* Diagonal accent */}
      <div style={{ position: "absolute", top: 0, right: "35%", width: 1, height: "100%", background: "linear-gradient(to bottom, transparent, rgba(249,115,22,0.1) 40%, transparent)", transform: "rotate(8deg)", pointerEvents: "none", zIndex: 0 }} />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <motion.div style={{ y: yParallax }} className="hero-grid">

          {/* IMAGE — grid-area "img" renders FIRST on mobile via grid-template-areas */}
          <div className="hero-img">
            <ProfileCard3D time={formattedTime} isMobile={isMobile} />
          </div>

          {/* TEXT — grid-area "text" */}
          <div className="hero-text" style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1.5rem" : "1.85rem" }}>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: isMobile ? 10 : 0, x: isMobile ? 0 : -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="hero-eyebrow"
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div className="hero-divider-line" style={{ height: 1, width: 28, background: "linear-gradient(to right, transparent, " + T.orange + ")", flexShrink: 0 }} />
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.32rem 0.9rem", borderRadius: 100, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.22)", backdropFilter: "blur(10px)" }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: T.orange, boxShadow: "0 0 8px " + T.orange, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(251,146,60,0.9)", whiteSpace: "nowrap" }}>Full-Stack Engineer</span>
              </div>
              <div className="hero-divider-line" style={{ height: 1, flex: 1, background: "linear-gradient(to right, " + T.border + ", transparent)" }} />
            </motion.div>

            {/* Headline */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: T.muted, margin: 0 }}
              >
                Hi, I'm
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(2.8rem, 7vw, 6.5rem)", fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.02em", color: T.text, margin: 0 }}
              >
                Perpetual
                <br />
                <span style={{ fontStyle: "italic", fontWeight: 400, WebkitTextStroke: "1px rgba(255,255,255,0.22)", WebkitTextFillColor: "transparent", background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)", WebkitBackgroundClip: "text" }}>
                  Okan
                </span>
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.78, duration: 0.7 }}
                style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(1rem, 2.5vw, 1.9rem)", fontWeight: 400, color: T.muted, margin: 0, letterSpacing: "-0.01em" }}
              >
                Full-Stack Developer
              </motion.h2>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.88, duration: 0.7 }}
              className="hero-desc"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(0.68rem, 1.2vw, 0.82rem)", lineHeight: 1.95, color: T.muted, maxWidth: 460, borderLeft: "2px solid rgba(249,115,22,0.25)", paddingLeft: "1.2rem", margin: 0 }}
            >
              I build websites and web apps that are responsive, easy to use, and work well on any device.
              I work on both the frontend and backend to turn ideas into real digital products.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.98, duration: 0.7 }}
              className="hero-btns"
              style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
            >
              <Link to="/portfolio" style={{ textDecoration: "none", flex: isMobile ? 1 : "none" }}>
                <motion.div
                  whileHover={{ scale: 1.04, boxShadow: "0 18px 45px rgba(249,115,22,0.42)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.55rem", padding: "0.88rem 1.85rem", borderRadius: 4, background: "linear-gradient(135deg, " + T.orange + ", " + T.orangeD + ")", color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", boxShadow: "0 8px 28px rgba(249,115,22,0.32), inset 0 1px 0 rgba(255,255,255,0.15)", cursor: "pointer", width: "100%" }}
                >
                  Explore Work <FiArrowRight />
                </motion.div>
              </Link>

              <motion.button
                whileHover={{ borderColor: "rgba(249,115,22,0.5)", color: "#fff" }}
                whileTap={{ scale: 0.97 }}
                onClick={function() {
                  var a = document.createElement("a");
                  a.href = "/Perpetuual-cv.pdf";
                  a.download = "Perpetual_Okan_Resume.pdf";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.55rem", padding: "0.88rem 1.85rem", borderRadius: 4, background: "transparent", border: "1px solid " + T.borderB, color: T.muted, fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.25s ease", backdropFilter: "blur(8px)", flex: isMobile ? 1 : "none" }}
              >
                <FiDownload /> Get Resume
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.7 }}
              className="hero-stats"
              style={{ display: "flex", gap: "0.5rem", paddingTop: "1.1rem", borderTop: "1px solid " + T.borderB }}
            >
              <Stat icon={FiLayers}      value="15+"        label="Projects"   delay={1.15} />
              <Stat icon={FiCode}        value="React"      label="Expert"     delay={1.25} />
              <Stat icon={FiCheckCircle} value="Full-Stack" label="Specialist" delay={1.35} />
            </motion.div>
          </div>

        </motion.div>
      </div>

      <ScrollIndicator opacity={opacity} />
    </section>
  );
}

export default Hero;
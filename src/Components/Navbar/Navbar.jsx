import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform,
} from "framer-motion";
import { FiGithub, FiLinkedin, FiMenu, FiX } from "react-icons/fi";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg:      "#020204",
  orange:  "#F97316",
  orangeD: "#C2410C",
  orangeL: "#fb923c",
  text:    "#ffffff",
  muted:   "rgba(255,255,255,0.42)",
  faint:   "rgba(255,255,255,0.08)",
  borderB: "rgba(255,255,255,0.065)",
  borderO: "rgba(249,115,22,0.28)",
};

const NAV_LINKS = [
  { name: "Home",      href: "/" },
  { name: "About",     href: "/about" },
  { name: "Portfolio", href: "/portfolio" },
];

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&display=swap');

.nb-root * { box-sizing: border-box; }
.nb-root { font-family: 'Space Mono', monospace; }

/* ── 3D OKAN Logo ── */
.okan-logo {
  display: flex; align-items: center; justify-content: center;
  width: 52px; height: 52px;
  transform-style: preserve-3d;
  perspective: 600px;
  cursor: pointer;
  position: relative;
}
.okan-box {
  width: 52px; height: 52px; border-radius: 14px;
  background: linear-gradient(160deg, #1c1c1c 0%, #000000 55%, #0e0e0e 100%);
  border: 1px solid rgba(255,255,255,0.13);
  display: flex; align-items: center; justify-content: center;
  box-shadow:
    inset 0 2px 0 rgba(255,255,255,0.10),
    inset 0 -2px 0 rgba(0,0,0,0.9),
    inset 2px 0 0 rgba(255,255,255,0.04),
    0 14px 44px rgba(0,0,0,0.75),
    0 4px 12px rgba(0,0,0,0.6);
  position: relative; overflow: hidden;
  transform: translateZ(10px);
}
.okan-box::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(108deg, transparent 30%, rgba(249,115,22,0.08) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.7s ease;
}
.okan-logo:hover .okan-box::before { transform: translateX(100%); }

.okan-dot {
  position: absolute; bottom: -2px; right: -2px;
  width: 9px; height: 9px; border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 10px #22c55e, 0 0 22px rgba(34,197,94,0.4);
  border: 1.5px solid #020204;
  animation: dotPulse 2.2s ease-in-out infinite;
}
@keyframes dotPulse {
  0%,100% { box-shadow: 0 0 8px #22c55e, 0 0 18px rgba(34,197,94,0.35); }
  50%     { box-shadow: 0 0 16px #22c55e, 0 0 36px rgba(34,197,94,0.55); }
}

/* ── Desktop nav pill ── */
.nb-pill {
  position: absolute; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 2.2rem;
  padding: 0.62rem 1.8rem; border-radius: 100px;
  background: rgba(255,255,255,0.022);
  border: 1px solid rgba(255,255,255,0.065);
  backdrop-filter: blur(24px) saturate(160%);
  box-shadow: 0 4px 28px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.04);
}

/* ── Nav item ── */
.nb-link {
  font-family: 'Space Mono', monospace;
  font-size: 0.48rem; font-weight: 700;
  letter-spacing: 0.34em; text-transform: uppercase;
  text-decoration: none;
  padding: 0.28rem 0;
  position: relative;
  transition: color 0.22s;
}

/* ── Contact button ── */
.nb-cta {
  display: inline-flex; align-items: center; gap: 0.42rem;
  padding: 0.58rem 1.4rem; border-radius: 5px;
  font-family: 'Space Mono', monospace;
  font-size: 0.48rem; font-weight: 700;
  letter-spacing: 0.26em; text-transform: uppercase;
  text-decoration: none; transition: all 0.28s ease;
  cursor: pointer; border: none; outline: none;
  backdrop-filter: blur(12px);
}

/* ── Social icon ── */
.nb-social {
  width: 33px; height: 33px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none; transition: all 0.22s;
  cursor: pointer;
}

/* ── Mobile overlay ── */
.nb-mobile-overlay {
  position: fixed; inset: 0; z-index: 60;
  background: rgba(2,2,4,0.97);
  backdrop-filter: blur(44px);
  display: flex; flex-direction: column; justify-content: center;
  padding: 0 8%; overflow: hidden;
}

/* ── Responsive ── */
.nb-desktop   { display: flex !important; }
.nb-desktop-r { display: flex !important; }
.nb-mobile-btn{ display: none !important; }

@media (max-width: 900px) {
  .nb-desktop   { display: none !important; }
  .nb-desktop-r { display: none !important; }
  .nb-mobile-btn{ display: flex !important; }
}

/* Progress bar */
.nb-progress {
  position: fixed; top: 0; left: 0; height: 2px; z-index: 100;
  background: linear-gradient(90deg, #F97316, #fb923c, #F97316);
  background-size: 200% 100%;
  animation: progressShimmer 2s linear infinite;
  transform-origin: left;
  pointer-events: none;
}
@keyframes progressShimmer {
  0%   { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

/* Tooltip */
.nb-tooltip {
  position: absolute; bottom: -28px; left: 50%; transform: translateX(-50%);
  background: rgba(9,9,13,0.95); border: 1px solid rgba(249,115,22,0.25);
  border-radius: 5px; padding: 3px 8px; white-space: nowrap;
  font-family: 'Space Mono', monospace; font-size: 0.38rem;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(249,115,22,0.85); pointer-events: none;
  backdrop-filter: blur(10px);
}

/* Mobile nav link hover */
.nb-mlink:hover span:last-child { color: #ffffff !important; -webkit-text-stroke: none !important; }

@keyframes glowPulse {
  0%,100% { box-shadow: 0 0 10px #F97316, 0 0 24px #F9731655; }
  50%     { box-shadow: 0 0 18px #F97316, 0 0 42px #F9731688; }
}
`;

// ─── SCROLL PROGRESS ─────────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const h = () => {
      const el = document.documentElement;
      setPct(el.scrollTop / (el.scrollHeight - el.clientHeight) || 0);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <motion.div
      className="nb-progress"
      style={{ scaleX: pct }}
    />
  );
}

// ─── 3D OKAN LOGO (pure SVG, no image) ──────────────────────────────────────
function OkanLogo() {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const mxS = useSpring(mx, { stiffness: 180, damping: 20 });
  const myS = useSpring(my, { stiffness: 180, damping: 20 });
  const rotX = useTransform(myS, [-0.5, 0.5], ["14deg", "-14deg"]);
  const rotY = useTransform(mxS, [-0.5, 0.5], ["-14deg", "14deg"]);
  const [hov, setHov] = useState(false);

  const onMove = useCallback(e => {
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    }
  }, [mx, my]);

  return (
    <Link to="/" style={{ textDecoration: "none", display: "block", position: "relative", zIndex: 70 }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => { mx.set(0); my.set(0); setHov(false); }}
        whileTap={{ scale: 0.88 }}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: "600px" }}
        className="okan-logo"
      >
        <div className="okan-box">
          {/* 3D layered OKAN text */}
          <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
            {/* Shadow layer */}
            <div style={{
              position: "absolute", top: 2, left: 2,
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.04em",
              color: "rgba(0,0,0,0.8)",
              userSelect: "none",
              transform: "translateZ(-6px)",
            }}>OKAN</div>
            {/* Main text */}
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.04em",
              background: hov
                ? "linear-gradient(160deg, #ffffff 0%, #d4d4d4 40%, #888888 100%)"
                : "linear-gradient(160deg, #e8e8e8 0%, #c0c0c0 45%, #707070 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              transform: "translateZ(8px)",
              transition: "all 0.3s",
              userSelect: "none",
              position: "relative",
              display: "block",
              filter: hov ? "drop-shadow(0 0 6px rgba(255,255,255,0.5))" : "drop-shadow(0 1px 2px rgba(0,0,0,0.9))",
            }}>OKAN</div>
          </div>

          {/* Inner glow ring on hover */}
          <motion.div
            animate={{ opacity: hov ? 1 : 0, scale: hov ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute", inset: -1,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.35)",
              boxShadow: "inset 0 0 20px rgba(255,255,255,0.07), 0 0 20px rgba(255,255,255,0.08)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Availability dot */}
        <div className="okan-dot" />

        {/* Tooltip on hover */}
        <AnimatePresence>
          {hov && (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className="nb-tooltip"
            >
              Perpetual Okan
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

// ─── NAV ITEM ────────────────────────────────────────────────────────────────
function NavItem({ link, active }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ position: "relative" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Link
        to={link.href}
        className="nb-link"
        style={{ color: active ? "#fff" : hov ? "rgba(255,255,255,0.88)" : T.muted }}
      >
        {link.name}

        {/* Active pip */}
        <AnimatePresence>
          {active && (
            <motion.span
              layoutId="nav-pip"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              style={{
                position: "absolute", bottom: -9, left: "50%",
                transform: "translateX(-50%)",
                width: 5, height: 5, borderRadius: "50%",
                display: "block",
                background: T.orange,
                boxShadow: `0 0 10px ${T.orange}, 0 0 24px ${T.orange}55`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Hover underline */}
        {!active && (
          <motion.span
            initial={{ scaleX: 0 }} animate={{ scaleX: hov ? 1 : 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute", bottom: -3, left: 0, right: 0,
              height: 1, display: "block",
              background: `linear-gradient(90deg, transparent, ${T.orange}, transparent)`,
              transformOrigin: "left",
            }}
          />
        )}
      </Link>
    </div>
  );
}

// ─── CONTACT BUTTON ──────────────────────────────────────────────────────────
function ContactBtn({ active }) {
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  const [mpos, setMpos] = useState({ x: 50, y: 50 });

  const onMove = e => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setMpos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <Link to="/contact" style={{ textDecoration: "none" }}>
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onMouseMove={onMove}
        className="nb-cta"
        style={{
          background: active
            ? "rgba(249,115,22,0.14)"
            : hov
              ? `linear-gradient(135deg, ${T.orange}, ${T.orangeD})`
              : "rgba(255,255,255,0.045)",
          border: `1px solid ${active || hov ? "rgba(249,115,22,0.55)" : T.borderB}`,
          color: active || hov ? "#fff" : T.muted,
          boxShadow: hov
            ? `0 10px 32px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.14), radial-gradient(circle at ${mpos.x}% ${mpos.y}%, rgba(255,255,255,0.12), transparent 60%)`
            : "none",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Ripple on hover */}
        <motion.div
          animate={{ opacity: hov ? 1 : 0 }}
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(circle at ${mpos.x}% ${mpos.y}%, rgba(255,255,255,0.14) 0%, transparent 60%)`,
          }}
        />
        <span style={{ position: "relative", zIndex: 1 }}>Contact</span>
      </motion.div>
    </Link>
  );
}

// ─── SOCIAL BUTTON ───────────────────────────────────────────────────────────
function Social({ href, Icon, label }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.a
      href={href} target="_blank" rel="noreferrer"
      whileHover={{ scale: 1.14, y: -2 }} whileTap={{ scale: 0.9 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={label}
      className="nb-social"
      style={{
        background: hov ? "rgba(249,115,22,0.10)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hov ? "rgba(249,115,22,0.35)" : T.borderB}`,
        color: hov ? T.orange : T.muted,
        boxShadow: hov ? `0 4px 14px rgba(249,115,22,0.22)` : "none",
      }}
    >
      <Icon size={13} />
    </motion.a>
  );
}

// ─── STATUS CHIP ─────────────────────────────────────────────────────────────
function StatusChip() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "0.42rem",
      padding: "0.3rem 0.75rem", borderRadius: 100,
      background: "rgba(34,197,94,0.07)",
      border: "1px solid rgba(34,197,94,0.22)",
      backdropFilter: "blur(10px)",
    }}>
      <span style={{ position: "relative", display: "flex", width: 6, height: 6 }}>
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "#22c55e", opacity: 0.55,
          animation: "nbPing 1.5s infinite",
        }} />
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#22c55e",
          boxShadow: "0 0 8px #22c55e",
          display: "inline-flex",
        }} />
      </span>
      <span style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.38rem", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.2em",
        color: "rgba(34,197,94,0.75)",
        whiteSpace: "nowrap",
      }}>
        Open to work
      </span>
    </div>
  );
}

// ─── MAIN NAVBAR ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  const onScroll = useCallback(() => setScrolled(window.scrollY > 40), []);
  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="nb-root">
      <style>{CSS + `
        @keyframes nbPing { 75%,100% { transform:scale(2.2); opacity:0; } }
      `}</style>

      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* ── HEADER ── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, width: "100%", zIndex: 50,
          padding: scrolled ? "0.7rem 0" : "1.25rem 0",
          background: scrolled ? "rgba(2,2,4,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(32px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(249,115,22,0.09)" : "1px solid transparent",
          boxShadow: scrolled ? "0 8px 44px rgba(0,0,0,0.6)" : "none",
          transition: "all 0.42s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Top shimmer line */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
              transition={{ duration: 0.55 }}
              style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: "linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.5) 50%, transparent 100%)",
                transformOrigin: "left", pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        <nav style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 5%",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "relative",
        }}>
          {/* Logo */}
          <OkanLogo />

          {/* Desktop centered nav */}
          <div className="nb-pill nb-desktop">
            {NAV_LINKS.map(link => (
              <NavItem key={link.href} link={link} active={pathname === link.href} />
            ))}
          </div>

          {/* Right cluster — desktop */}
          <div className="nb-desktop-r" style={{ alignItems: "center", gap: "0.6rem" }}>
            <StatusChip />
            <div style={{ width: 1, height: 20, background: T.borderB, margin: "0 0.15rem" }} />
            <Social href="https://github.com/Perpetualisi/" Icon={FiGithub} label="GitHub" />
            <Social href="https://linkedin.com" Icon={FiLinkedin} label="LinkedIn" />
            <div style={{ width: 1, height: 20, background: T.borderB, margin: "0 0.15rem" }} />
            <ContactBtn active={pathname === "/contact"} />
          </div>

          {/* Mobile hamburger */}
          <motion.button
            onClick={() => setOpen(v => !v)}
            whileTap={{ scale: 0.85 }}
            className="nb-mobile-btn"
            style={{
              position: "relative", zIndex: 70,
              width: 46, height: 46, borderRadius: 13,
              background: open ? "rgba(249,115,22,0.14)" : "rgba(255,255,255,0.055)",
              border: `1px solid ${open ? "rgba(249,115,22,0.5)" : T.borderB}`,
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: open ? T.orange : T.muted,
              transition: "all 0.26s ease",
              boxShadow: open ? "0 0 22px rgba(249,115,22,0.22)" : "none",
              outline: "none",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span key="x"
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}
                  style={{ display: "flex" }}
                >
                  <FiX size={20} />
                </motion.span>
              ) : (
                <motion.span key="m"
                  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}
                  style={{ display: "flex" }}
                >
                  <FiMenu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </nav>
      </motion.header>

      {/* ── MOBILE OVERLAY ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, clipPath: "circle(0% at calc(100% - 7%) 3.8%)" }}
            animate={{ opacity: 1, clipPath: "circle(170% at calc(100% - 7%) 3.8%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at calc(100% - 7%) 3.8%)" }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            className="nb-mobile-overlay"
          >
            {/* Grid texture */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)",
              backgroundSize: "58px 58px",
            }} />

            {/* Glow blobs */}
            <div style={{ position: "absolute", top: "8%", right: "-8%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 65%)", filter: "blur(55px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "6%", left: "-10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(234,88,12,0.07) 0%, transparent 65%)", filter: "blur(55px)", pointerEvents: "none" }} />

            {/* Film grain */}
            <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.025, mixBlendMode: "overlay" }}>
              <filter id="mobGrain"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
              <rect width="100%" height="100%" filter="url(#mobGrain)"/>
            </svg>

            <div style={{ position: "relative", zIndex: 10 }}>
              {/* Section label */}
              <motion.div
                initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "2.5rem" }}
              >
                <div style={{ width: 3, height: 22, borderRadius: 2, background: T.orange, boxShadow: `0 0 14px ${T.orange}` }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.44rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.55em", color: T.orange }}>
                  Navigation
                </span>
              </motion.div>

              {/* Big nav items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[...NAV_LINKS, { name: "Contact", href: "/contact" }].map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.14 + idx * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setOpen(false)}
                        className="nb-mlink"
                        style={{
                          display: "flex", alignItems: "center", gap: "1.2rem",
                          textDecoration: "none",
                          padding: "0.65rem 0",
                          borderBottom: "1px solid rgba(255,255,255,0.038)",
                        }}
                      >
                        <span style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: "0.42rem", fontWeight: 700, letterSpacing: "0.2em",
                          color: isActive ? T.orange : "rgba(255,255,255,0.16)",
                          minWidth: 28, transition: "color 0.2s",
                        }}>
                          {"0" + (idx + 1)}
                        </span>

                        <span style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "clamp(2.2rem, 8.5vw, 4.2rem)",
                          fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1,
                          color: isActive ? "#ffffff" : "rgba(255,255,255,0.12)",
                          WebkitTextStroke: isActive ? "none" : "1px rgba(255,255,255,0.11)",
                          transition: "color 0.22s, -webkit-text-stroke 0.22s",
                          fontStyle: isActive ? "italic" : "normal",
                        }}>
                          {item.name}
                        </span>

                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            style={{
                              marginLeft: "auto", width: 9, height: 9, borderRadius: "50%",
                              background: T.orange,
                              boxShadow: `0 0 14px ${T.orange}, 0 0 32px ${T.orange}55`,
                              animation: "glowPulse 2s infinite",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom row — status + socials */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52, duration: 0.5 }}
                style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginTop: "2.5rem" }}
              >
                <StatusChip />
                <div style={{ display: "flex", gap: "0.65rem" }}>
                  {[
                    { href: "https://github.com/Perpetualisi/", Icon: FiGithub, label: "GitHub" },
                    { href: "https://linkedin.com", Icon: FiLinkedin, label: "LinkedIn" },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: "0.45rem",
                        textDecoration: "none", padding: "0.55rem 1rem", borderRadius: 100,
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${T.borderB}`,
                        color: T.muted,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "0.46rem", fontWeight: 700,
                        letterSpacing: "0.15em", textTransform: "uppercase",
                        transition: "all 0.22s",
                      }}
                    >
                      <s.Icon size={12} /> {s.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
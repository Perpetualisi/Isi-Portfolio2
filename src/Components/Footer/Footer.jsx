import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiGithub, FiLinkedin, FiTwitter, FiArrowUp, FiMail, FiArrowRight, FiCheck } from "react-icons/fi";

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
  borderH: "rgba(249,115,22,0.32)",
};

var NAV_LINKS = [
  { label: "About",     href: "/about"     },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact",   href: "/contact"   },
];

var SOCIALS = [
  { Icon: FiGithub,   href: "https://github.com/Perpetualisi/",       label: "GitHub"   },
  { Icon: FiLinkedin, href: "https://linkedin.com/in/yourusername",    label: "LinkedIn" },
  { Icon: FiTwitter,  href: "https://twitter.com/yourusername",        label: "Twitter"  },
];

// ─── 3D SOCIAL ICON ──────────────────────────────────────────────────────────
function SocialBtn({ Icon, href, label }) {
  var ref = useRef(null);
  var mx = useMotionValue(0);
  var my = useMotionValue(0);
  var mxS = useSpring(mx, { stiffness: 200, damping: 18 });
  var myS = useSpring(my, { stiffness: 200, damping: 18 });
  var rotX = useTransform(myS, [-0.5, 0.5], ["14deg", "-14deg"]);
  var rotY = useTransform(mxS, [-0.5, 0.5], ["-14deg", "14deg"]);
  var [hov, setHov] = useState(false);

  function move(e) {
    var r = ref.current && ref.current.getBoundingClientRect();
    if (r) { mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }
  }

  return (
    <motion.a
      href={href} target="_blank" rel="noreferrer" aria-label={label}
      ref={ref}
      onMouseMove={move}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { mx.set(0); my.set(0); setHov(false); }}
      whileTap={{ scale: 0.88 }}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: "500px", display: "inline-flex", textDecoration: "none" }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: hov ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.04)",
        border: "1px solid " + (hov ? "rgba(249,115,22,0.32)" : T.borderB),
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hov ? T.orange : T.muted,
        boxShadow: hov ? "0 8px 24px rgba(249,115,22,0.22)" : "none",
        transition: "all 0.25s ease",
        transform: "translateZ(16px)",
      }}>
        <Icon size={15} />
      </div>
    </motion.a>
  );
}

// ─── NAV LINK ────────────────────────────────────────────────────────────────
function FooterLink({ label, href }) {
  var [hov, setHov] = useState(false);
  return (
    <li>
      <Link
        to={href}
        onMouseEnter={function() { setHov(true); }}
        onMouseLeave={function() { setHov(false); }}
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.54rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.22em",
          color: hov ? T.text : T.muted,
          textDecoration: "none", transition: "color 0.22s",
        }}
      >
        <motion.span
          animate={{ x: hov ? 4 : 0, opacity: hov ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: "inline-flex", color: T.orange }}
        >
          <FiArrowRight size={11} />
        </motion.span>
        {label}
      </Link>
    </li>
  );
}

// ─── NEWSLETTER ──────────────────────────────────────────────────────────────
function Newsletter() {
  var [email, setEmail] = useState("");
  var [status, setStatus] = useState(null);
  var [focused, setFocused] = useState(false);

  function submit(e) {
    e.preventDefault();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) { setStatus("error"); return; }
    setStatus("success");
    setEmail("");
    setTimeout(function() { setStatus(null); }, 4000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
        <div style={{ width: 16, height: 2, background: "linear-gradient(to right, " + T.orange + ", transparent)", borderRadius: 2 }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32em", color: T.orange }}>Newsletter</span>
      </div>
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: T.muted, lineHeight: 1.7, margin: 0 }}>
        Get updates on my projects and tips.
      </p>
      <form onSubmit={submit} style={{ position: "relative", marginTop: "0.25rem" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.6rem",
          padding: "0.75rem 1rem", borderRadius: 10,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid " + (focused ? T.borderH : T.borderB),
          boxShadow: focused ? "0 0 0 3px rgba(249,115,22,0.06)" : "none",
          transition: "border-color 0.25s, box-shadow 0.25s",
        }}>
          <FiMail size={13} color={focused ? T.orange : T.muted} style={{ flexShrink: 0, transition: "color 0.25s" }} />
          <input
            type="email" value={email}
            onChange={function(e) { setEmail(e.target.value); }}
            onFocus={function() { setFocused(true); }}
            onBlur={function() { setFocused(false); }}
            placeholder="your@email.com"
            style={{
              flex: 1, background: "transparent",
              border: "none", outline: "none",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.6rem", color: T.text,
            }}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: status === "success" ? "rgba(34,197,94,0.15)" : "linear-gradient(135deg, " + T.orange + ", " + T.orangeD + ")",
              border: "none", cursor: "pointer",
              boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
            }}
          >
            {status === "success" ? <FiCheck size={13} color="#4ade80" /> : <FiArrowRight size={13} color="#fff" />}
          </motion.button>
        </div>
        <AnimatePresence>
          {status && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.46rem", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.2em",
                color: status === "error" ? "#f87171" : "#4ade80",
                marginTop: "0.5rem", marginBottom: 0,
              }}
            >
              {status === "error" ? "// Invalid email address" : "// Transmission registered"}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

// ─── BACK TO TOP ─────────────────────────────────────────────────────────────
function BackToTop() {
  var [hov, setHov] = useState(false);
  return (
    <motion.button
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { setHov(false); }}
      onClick={function() { window.scrollTo({ top: 0, behavior: "smooth" }); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.65rem",
        padding: "0.65rem 1.25rem", borderRadius: 100,
        background: hov ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.04)",
        border: "1px solid " + (hov ? T.borderH : T.borderB),
        color: hov ? T.text : T.muted,
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.5rem", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.25em",
        cursor: "pointer", transition: "all 0.25s ease",
        boxShadow: hov ? "0 8px 24px rgba(249,115,22,0.18)" : "none",
      }}
    >
      Back to Top
      <motion.span animate={{ y: hov ? -3 : 0 }} transition={{ duration: 0.3, ease: "easeOut" }} style={{ display: "inline-flex" }}>
        <FiArrowUp size={13} color={hov ? T.orange : T.muted} style={{ transition: "color 0.25s" }} />
      </motion.span>
    </motion.button>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ position: "relative", background: T.bg, color: T.muted, padding: "6rem 6% 3rem", borderTop: "1px solid rgba(249,115,22,0.1)", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.2); font-family: 'Space Mono', monospace; font-size: 0.6rem; }
        input:focus { outline: none; }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1.4fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 3rem; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          footer { padding: 4rem 5% 2.5rem !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 1.5rem !important; }
        }
        @keyframes dot-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>

      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 80%)" }} />

      {/* Top orange shimmer */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.4) 50%, transparent)", pointerEvents: "none" }} />

      {/* Ambient glow */}
      <div style={{ position: "absolute", bottom: 0, left: "20%", width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 65%)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>

        <div className="footer-grid">

          {/* ── BRAND ───────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(255,255,255,0.04) 100%)",
                  border: "1px solid rgba(249,115,22,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.18)",
                  position: "relative",
                }}>
                  <img src="/logo-okan.png" alt="PO" style={{ width: 22, height: 22, objectFit: "contain" }} />
                  <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: T.orange, boxShadow: "0 0 6px " + T.orange, border: "1.5px solid " + T.bg, animation: "dot-pulse 2s infinite" }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em", color: T.text, margin: 0, lineHeight: 1 }}>Perpetual Okan</p>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.44rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: T.orange, margin: "2px 0 0 0" }}>Full-Stack Developer</p>
                </div>
              </div>
            </Link>

            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: T.muted, lineHeight: 1.85, maxWidth: 300, margin: 0, borderLeft: "2px solid rgba(249,115,22,0.18)", paddingLeft: "0.9rem" }}>
              Building fast, user-friendly websites and web apps. Based in Lagos, Nigeria.
            </p>

            <div style={{ display: "flex", gap: "0.6rem" }}>
              {SOCIALS.map(function(s) { return <SocialBtn key={s.label} Icon={s.Icon} href={s.href} label={s.label} />; })}
            </div>
          </div>

          {/* ── NAV ──────────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: 16, height: 2, background: "linear-gradient(to right, " + T.orange + ", transparent)", borderRadius: 2 }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32em", color: T.orange }}>Navigation</span>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {NAV_LINKS.map(function(l) { return <FooterLink key={l.href} label={l.label} href={l.href} />; })}
            </ul>
          </div>

          {/* ── NEWSLETTER ───────────────────────────────────────────────── */}
          <Newsletter />
        </div>

        {/* ── BOTTOM BAR ────────────────────────────────────────────────── */}
        <div style={{ paddingTop: "2rem", borderTop: "1px solid " + T.borderB, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.25rem" }} className="footer-bottom">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)", margin: 0 }}>
              © {new Date().getFullYear()} Okan Perpetual. All rights reserved.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ height: 1, width: 20, background: T.borderB }} />
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", fontWeight: 700, letterSpacing: "0.22em", color: "rgba(255,255,255,0.1)", textTransform: "uppercase", margin: 0 }}>
                LOC_NG [6.5244° N, 3.3792° E]
              </p>
            </div>
          </div>

          <BackToTop />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
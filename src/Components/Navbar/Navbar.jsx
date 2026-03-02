import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiMenu, FiX, FiGithub, FiLinkedin } from "react-icons/fi";

var T = {
  bg:      "#040406",
  orange:  "#F97316",
  orangeD: "#EA580C",
  text:    "#ffffff",
  muted:   "rgba(255,255,255,0.45)",
  faint:   "rgba(255,255,255,0.1)",
  borderB: "rgba(255,255,255,0.07)",
  borderO: "rgba(249,115,22,0.22)",
};

var NAV_LINKS = [
  { name: "Home",      href: "/" },
  { name: "About",     href: "/about" },
  { name: "Portfolio", href: "/portfolio" },
];

// ─── 3D LOGO ──────────────────────────────────────────────────────────────────
function Logo() {
  var ref = useRef(null);
  var mx = useMotionValue(0);
  var my = useMotionValue(0);
  var mxS = useSpring(mx, { stiffness: 160, damping: 18 });
  var myS = useSpring(my, { stiffness: 160, damping: 18 });
  var rotX = useTransform(myS, [-0.5, 0.5], ["12deg", "-12deg"]);
  var rotY = useTransform(mxS, [-0.5, 0.5], ["-12deg", "12deg"]);

  function move(e) {
    var r = ref.current && ref.current.getBoundingClientRect();
    if (r) { mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }
  }

  return (
    <Link to="/" style={{ textDecoration: "none", display: "block", position: "relative", zIndex: 70 }}>
      <motion.div
        ref={ref}
        onMouseMove={move}
        onMouseLeave={function() { mx.set(0); my.set(0); }}
        whileTap={{ scale: 0.9 }}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: "500px" }}
      >
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: "linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(255,255,255,0.04) 100%)",
          border: "1px solid " + T.borderO,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 28px rgba(249,115,22,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
          transform: "translateZ(16px)",
          position: "relative",
        }}>
          <img src="/logo-okan.png" alt="PO" style={{ width: 26, height: 26, objectFit: "contain" }} />
          <div style={{
            position: "absolute", bottom: -2, right: -2,
            width: 8, height: 8, borderRadius: "50%",
            background: T.orange, boxShadow: "0 0 8px " + T.orange,
            border: "1.5px solid " + T.bg,
          }} />
        </div>
      </motion.div>
    </Link>
  );
}

// ─── DESKTOP NAV PILL ─────────────────────────────────────────────────────────
function DesktopNav({ pathname }) {
  return (
    <div style={{
      position: "absolute", left: "50%", transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: "2rem",
      padding: "0.6rem 1.75rem", borderRadius: 100,
      background: "rgba(255,255,255,0.025)",
      border: "1px solid " + T.borderB,
      backdropFilter: "blur(20px)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
    }} className="desktop-nav">
      {NAV_LINKS.map(function(link) {
        var active = pathname === link.href;
        return (
          <NavItem key={link.href} link={link} active={active} />
        );
      })}
    </div>
  );
}

function NavItem({ link, active }) {
  var ref = useRef(null);
  var mx = useMotionValue(0);
  var mxS = useSpring(mx, { stiffness: 220, damping: 22 });
  var [hov, setHov] = useState(false);

  function move(e) {
    var r = ref.current && ref.current.getBoundingClientRect();
    if (r) mx.set((e.clientX - r.left) / r.width - 0.5);
  }

  return (
    <div ref={ref} onMouseMove={move} onMouseEnter={function() { setHov(true); }} onMouseLeave={function() { mx.set(0); setHov(false); }} style={{ position: "relative" }}>
      <Link to={link.href} style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.52rem", fontWeight: 700,
        letterSpacing: "0.32em", textTransform: "uppercase",
        color: active ? "#fff" : (hov ? "#fff" : T.muted),
        textDecoration: "none",
        display: "block", padding: "0.3rem 0",
        transition: "color 0.22s",
      }}>
        {link.name}
      </Link>
      <AnimatePresence>
        {active && (
          <motion.span
            layoutId="pip"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
              width: 5, height: 5, borderRadius: "50%", display: "block",
              background: T.orange, boxShadow: "0 0 10px " + T.orange + ", 0 0 22px " + T.orange + "55",
            }}
          />
        )}
      </AnimatePresence>
      {!active && hov && (
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
          style={{ position: "absolute", bottom: -3, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, " + T.orange + ", transparent)", transformOrigin: "left" }}
        />
      )}
    </div>
  );
}

// ─── CONTACT BUTTON ──────────────────────────────────────────────────────────
function ContactBtn({ active }) {
  var [hov, setHov] = useState(false);
  return (
    <Link to="/contact" style={{ textDecoration: "none" }}>
      <motion.div
        whileHover={{ scale: 1.06, boxShadow: "0 14px 38px rgba(249,115,22,0.44)" }}
        whileTap={{ scale: 0.94 }}
        onMouseEnter={function() { setHov(true); }}
        onMouseLeave={function() { setHov(false); }}
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.45rem",
          padding: "0.56rem 1.35rem", borderRadius: 4,
          background: active
            ? "rgba(249,115,22,0.15)"
            : (hov ? "linear-gradient(135deg, " + T.orange + ", " + T.orangeD + ")" : "rgba(255,255,255,0.05)"),
          border: "1px solid " + (active || hov ? "rgba(249,115,22,0.55)" : T.borderB),
          color: active || hov ? "#fff" : T.muted,
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase",
          transition: "all 0.28s ease",
          boxShadow: hov ? "0 8px 28px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.12)" : "none",
          backdropFilter: "blur(10px)",
        }}
      >
        Contact
      </motion.div>
    </Link>
  );
}

// ─── SOCIAL ICON ─────────────────────────────────────────────────────────────
function Social({ href, Icon }) {
  var [hov, setHov] = useState(false);
  return (
    <motion.a
      href={href} target="_blank" rel="noreferrer"
      whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
      onMouseEnter={function() { setHov(true); }} onMouseLeave={function() { setHov(false); }}
      style={{
        width: 32, height: 32, borderRadius: 9,
        background: hov ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.04)",
        border: "1px solid " + (hov ? "rgba(249,115,22,0.32)" : T.borderB),
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hov ? T.orange : T.muted, transition: "all 0.22s", cursor: "pointer",
      }}
    >
      <Icon size={14} />
    </motion.a>
  );
}

// ─── MAIN NAVBAR ─────────────────────────────────────────────────────────────
function Navbar() {
  var [open, setOpen] = useState(false);
  var [scrolled, setScrolled] = useState(false);
  var { pathname } = useLocation();

  var onScroll = useCallback(function() { setScrolled(window.scrollY > 40); }, []);
  useEffect(function() {
    window.addEventListener("scroll", onScroll, { passive: true });
    return function() { window.removeEventListener("scroll", onScroll); };
  }, [onScroll]);

  useEffect(function() {
    document.body.style.overflow = open ? "hidden" : "";
    return function() { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(function() { setOpen(false); }, [pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap');
        .desktop-nav { display: flex !important; }
        .desktop-right { display: flex !important; }
        .mobile-btn { display: none !important; }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .desktop-right { display: none !important; }
          .mobile-btn { display: flex !important; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 8px #F97316, 0 0 20px #F9731655; }
          50% { box-shadow: 0 0 14px #F97316, 0 0 35px #F9731688; }
        }
      `}</style>

      <header style={{
        position: "fixed", top: 0, left: 0, width: "100%", zIndex: 50,
        padding: scrolled ? "0.8rem 0" : "1.35rem 0",
        background: scrolled ? "rgba(4,4,6,0.93)" : "transparent",
        backdropFilter: scrolled ? "blur(28px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(249,115,22,0.1)" : "1px solid transparent",
        boxShadow: scrolled ? "0 8px 40px rgba(0,0,0,0.55)" : "none",
        transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Top shimmer when scrolled */}
        {scrolled && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.45) 50%, transparent 100%)", pointerEvents: "none" }} />
        )}

        <nav style={{ maxWidth: 1400, margin: "0 auto", padding: "0 6%", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <Logo />
          <DesktopNav pathname={pathname} />

          {/* Right cluster */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }} className="desktop-right">
            <Social href="https://github.com/Perpetualisi/" Icon={FiGithub} />
            <Social href="https://linkedin.com" Icon={FiLinkedin} />
            <div style={{ width: 1, height: 22, background: T.borderB, margin: "0 0.2rem" }} />
            <ContactBtn active={pathname === "/contact"} />
          </div>

          {/* Mobile toggle */}
          <motion.button
            onClick={function() { setOpen(function(v) { return !v; }); }}
            whileTap={{ scale: 0.86 }}
            className="mobile-btn"
            style={{
              position: "relative", zIndex: 70,
              width: 44, height: 44, borderRadius: 12,
              background: open ? "rgba(249,115,22,0.14)" : "rgba(255,255,255,0.06)",
              border: "1px solid " + (open ? "rgba(249,115,22,0.45)" : T.borderB),
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: open ? T.orange : T.muted,
              transition: "all 0.25s ease",
              boxShadow: open ? "0 0 20px rgba(249,115,22,0.2)" : "none",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} style={{ display: "flex" }}>
                  <FiX size={19} />
                </motion.span>
              ) : (
                <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }} style={{ display: "flex" }}>
                  <FiMenu size={19} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </nav>
      </header>

      {/* ── MOBILE OVERLAY ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, clipPath: "circle(0% at calc(100% - 8%) 3.5%)" }}
            animate={{ opacity: 1, clipPath: "circle(160% at calc(100% - 8%) 3.5%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at calc(100% - 8%) 3.5%)" }}
            transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(4,4,6,0.98)", backdropFilter: "blur(40px)",
              display: "flex", flexDirection: "column", justifyContent: "center",
              padding: "0 8%", overflow: "hidden",
            }}
          >
            {/* Grid bg */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

            {/* Glow blobs */}
            <div style={{ position: "absolute", top: "5%", right: "-10%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "5%", left: "-12%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(234,88,12,0.07) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 10 }}>
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12, duration: 0.5 }}
                style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "2.75rem" }}
              >
                <div style={{ width: 3, height: 20, borderRadius: 2, background: T.orange, boxShadow: "0 0 12px " + T.orange }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.46rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.55em", color: T.orange }}>Navigation</span>
              </motion.div>

              {/* Big nav links */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[...NAV_LINKS, { name: "Contact", href: "/contact" }].map(function(item, idx) {
                  var isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -45 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + idx * 0.085, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        to={item.href}
                        onClick={function() { setOpen(false); }}
                        style={{
                          display: "flex", alignItems: "center", gap: "1.25rem",
                          textDecoration: "none",
                          padding: "0.7rem 0",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <span style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: "0.44rem", fontWeight: 700, letterSpacing: "0.2em",
                          color: isActive ? T.orange : "rgba(255,255,255,0.18)",
                          minWidth: 26, transition: "color 0.2s",
                        }}>{"0" + (idx + 1)}</span>

                        <span style={{
                          fontFamily: "'Clash Display', sans-serif",
                          fontSize: "clamp(2.4rem, 9vw, 4.5rem)",
                          fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1,
                          color: isActive ? "#ffffff" : "rgba(255,255,255,0.14)",
                          WebkitTextStroke: isActive ? "none" : "1px rgba(255,255,255,0.12)",
                          transition: "color 0.2s",
                        }}>
                          {item.name}
                        </span>

                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            style={{
                              marginLeft: "auto", width: 9, height: 9, borderRadius: "50%",
                              background: T.orange,
                              boxShadow: "0 0 12px " + T.orange + ", 0 0 28px " + T.orange + "55",
                              animation: "glow-pulse 2s infinite",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Socials */}
              <motion.div
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginTop: "2.75rem" }}
              >
                {[
                  { href: "https://github.com/Perpetualisi/", Icon: FiGithub, label: "GitHub" },
                  { href: "https://linkedin.com", Icon: FiLinkedin, label: "LinkedIn" },
                ].map(function(s) {
                  return (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      textDecoration: "none", padding: "0.6rem 1rem", borderRadius: 100,
                      background: "rgba(255,255,255,0.04)", border: "1px solid " + T.borderB,
                      color: T.muted, fontFamily: "'Space Mono', monospace",
                      fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                    }}>
                      <s.Icon size={13} /> {s.label}
                    </a>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
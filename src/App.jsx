import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar     from "./Components/Navbar/Navbar";
import Footer     from "./Components/Footer/Footer";
import ScrollToTop from "./Components/ScrollToTop";

const Hero      = lazy(() => import("./Components/Hero/Hero"));
const About     = lazy(() => import("./Components/About/About"));
const Portfolio = lazy(() => import("./Components/Portfolio/Portfolio"));
const Contact   = lazy(() => import("./Components/Contact/Contact"));

// ─── THEME (synced across all pages) ─────────────────────────────────────────
const BG     = "#010103";
const ORANGE = "#E8622A";

// ─── PAGE LOADER ──────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    height: "100vh", width: "100%",
    background: BG,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexDirection: "column", gap: "1.25rem",
    padding: "1rem",
  }}>
    {/* Spinning ring */}
    <div style={{
      width: 42, height: 42, borderRadius: "50%",
      border: `3px solid rgba(232,98,42,0.14)`,
      borderTop: `3px solid ${ORANGE}`,
      animation: "spin 0.85s linear infinite",
      boxShadow: `0 0 20px rgba(232,98,42,0.15)`,
    }} />

    {/* Inner dot */}
    <div style={{
      position: "absolute",
      width: 6, height: 6, borderRadius: "50%",
      background: ORANGE,
      boxShadow: `0 0 12px ${ORANGE}`,
      animation: "pulse 0.85s ease-in-out infinite",
    }} />

    <span style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: "0.46rem", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.38em",
      color: "rgba(242,238,248,0.28)",
      marginTop: "0.25rem",
    }}>
      Loading...
    </span>

    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
      @keyframes spin  { to { transform: rotate(360deg); } }
      @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.3; transform:scale(0.6); } }
    `}</style>
  </div>
);

// ─── 404 PAGE ─────────────────────────────────────────────────────────────────
const NotFound = () => (
  <div style={{
    minHeight: "100vh", background: BG,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: "1rem", padding: "2rem",
    position: "relative", overflow: "hidden",
  }}>
    {/* Fine grid */}
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      backgroundImage: "linear-gradient(rgba(255,255,255,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.014) 1px,transparent 1px)",
      backgroundSize: "68px 68px",
      maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%,black 40%,transparent 100%)",
    }} />

    {/* Ambient glow */}
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%,-50%)",
      width: "60vw", height: "60vw", borderRadius: "50%",
      background: `radial-gradient(circle,rgba(232,98,42,0.06) 0%,transparent 65%)`,
      filter: "blur(80px)", pointerEvents: "none",
    }} />

    {/* Ghost 404 */}
    <div style={{
      position: "absolute",
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(8rem,28vw,22rem)",
      fontWeight: 400, color: "rgba(232,98,42,0.04)",
      lineHeight: 1, pointerEvents: "none", userSelect: "none",
      letterSpacing: "0.04em",
    }}>
      404
    </div>

    {/* Content */}
    <div style={{
      position: "relative", textAlign: "center",
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "1.1rem",
      maxWidth: 420, width: "100%",
    }}>
      {/* Eyebrow pill — matches Hero/About */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "0.46rem",
        padding: "0.32rem 0.92rem", borderRadius: 100,
        background: "linear-gradient(135deg,rgba(232,98,42,0.1) 0%,rgba(232,98,42,0.04) 100%)",
        border: "1px solid rgba(232,98,42,0.28)", backdropFilter: "blur(12px)",
        boxShadow: "0 4px 14px rgba(232,98,42,0.08)",
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: ORANGE, boxShadow: `0 0 10px ${ORANGE},0 0 18px rgba(232,98,42,0.4)`,
          display: "inline-block",
        }} />
        <span style={{
          fontFamily: "'Space Mono',monospace", fontSize: "0.47rem",
          fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase",
          color: "rgba(240,132,90,0.95)", whiteSpace: "nowrap",
        }}>Page Not Found</span>
      </div>

      {/* Heading */}
      <h1 style={{
        fontFamily: "'Bebas Neue',sans-serif",
        fontSize: "clamp(3rem,9vw,6rem)",
        fontWeight: 400, letterSpacing: "0.04em",
        color: "#F2EEF8", lineHeight: 0.9, margin: 0,
      }}>
        Lost in Space.
      </h1>

      {/* Body */}
      <p style={{
        fontFamily: "'Space Mono',monospace",
        fontSize: "clamp(0.62rem,2.5vw,0.72rem)",
        color: "rgba(242,238,248,0.4)", lineHeight: 1.9,
        maxWidth: 360, margin: 0,
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* CTA */}
      <a
        href="/"
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.55rem",
          marginTop: "0.4rem",
          padding: "0.9rem 2rem", borderRadius: 6,
          background: `linear-gradient(135deg,${ORANGE} 0%,#C94E1A 65%,#b03a0e 100%)`,
          color: "#fff", fontFamily: "'Space Mono',monospace",
          fontSize: "0.58rem", fontWeight: 700,
          letterSpacing: "0.22em", textTransform: "uppercase",
          textDecoration: "none",
          boxShadow: `0 8px 28px rgba(232,98,42,0.32), inset 0 1px 0 rgba(255,255,255,0.18)`,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.04)";
          e.currentTarget.style.boxShadow = `0 18px 44px rgba(232,98,42,0.4)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = `0 8px 28px rgba(232,98,42,0.32), inset 0 1px 0 rgba(255,255,255,0.18)`;
        }}
      >
        ← Back Home
      </a>
    </div>

    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
      @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap');
      *, *::before, *::after { box-sizing: border-box; }
    `}</style>
  </div>
);

// ─── APP ──────────────────────────────────────────────────────────────────────
const App = () => (
  <Router>
    <div style={{
      display: "flex", flexDirection: "column",
      minHeight: "100vh", background: BG,
      /* Prevent horizontal scroll on mobile */
      overflowX: "hidden",
    }}>
      <ScrollToTop />
      <Navbar />

      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"          element={<Hero />}      />
            <Route path="/about"     element={<About />}     />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact"   element={<Contact />}   />
            <Route path="*"          element={<NotFound />}  />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  </Router>
);

export default App;
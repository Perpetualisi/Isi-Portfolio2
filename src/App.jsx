import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import ScrollToTop from "./Components/ScrollToTop";

const Hero      = lazy(() => import("./Components/Hero/Hero"));
const About     = lazy(() => import("./Components/About/About"));
const Portfolio = lazy(() => import("./Components/Portfolio/Portfolio"));
const Contact   = lazy(() => import("./Components/Contact/Contact"));

const PageLoader = () => (
  <div style={{
    height: "100vh", width: "100%",
    background: "#040406",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexDirection: "column", gap: "1.25rem",
  }}>
    {/* Spinning orange ring */}
    <div style={{
      width: 44, height: 44, borderRadius: "50%",
      border: "3px solid rgba(249,115,22,0.15)",
      borderTop: "3px solid #F97316",
      animation: "spin 0.8s linear infinite",
    }} />
    <span style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: "0.48rem", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.35em",
      color: "rgba(255,255,255,0.3)",
    }}>
      Loading...
    </span>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

const NotFound = () => (
  <div style={{
    minHeight: "100vh", background: "#040406",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: "1rem", padding: "2rem",
    position: "relative", overflow: "hidden",
  }}>
    {/* Grid bg */}
    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
    {/* Ghost 404 */}
    <div style={{ position: "absolute", fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(8rem, 30vw, 22rem)", fontWeight: 700, color: "rgba(249,115,22,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.04em" }}>404</div>

    <div style={{ position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.32rem 0.9rem", borderRadius: 100, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.22)" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F97316", boxShadow: "0 0 8px #F97316", display: "inline-block" }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(251,146,60,0.9)" }}>Page Not Found</span>
      </div>
      <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 0.9, margin: 0 }}>
        Lost in Space.
      </h1>
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.85, maxWidth: 380, margin: 0 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a href="/" style={{
        display: "inline-flex", alignItems: "center", gap: "0.55rem",
        marginTop: "0.5rem", padding: "0.88rem 2rem", borderRadius: 4,
        background: "linear-gradient(135deg, #F97316, #EA580C)",
        color: "#fff", fontFamily: "'Space Mono', monospace",
        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.22em",
        textTransform: "uppercase", textDecoration: "none",
        boxShadow: "0 8px 28px rgba(249,115,22,0.35)",
      }}>
        ← Back Home
      </a>
    </div>

    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
      @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap');
    `}</style>
  </div>
);

const App = () => {
  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#040406" }}>
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
};

export default App;
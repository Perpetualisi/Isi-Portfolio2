import React, { Suspense, lazy, useRef, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as THREE from "three";

import Navbar      from "./Components/Navbar/Navbar";
import Footer      from "./Components/Footer/Footer";
import ScrollToTop from "./Components/ScrollToTop";
import SkillGraph   from "./Components/SkillGraph";
// import HireMeWidget from "./Components/HireMeWidget";
// import ChatWidget from "./Components/ChatWidget"
import AIWidget from "./Components/AIWidget"

const Hero      = lazy(() => import("./Components/Hero/Hero"));
const About     = lazy(() => import("./Components/About/About"));
const Portfolio = lazy(() => import("./Components/Portfolio/Portfolio"));
const Contact   = lazy(() => import("./Components/Contact/Contact"));

const BG     = "#010103";
const ORANGE = "#E8622A";

// ─── PAGE LOADER ──────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    height: "100vh", width: "100%", background: BG,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexDirection: "column", gap: "1.25rem", padding: "1rem",
    position: "relative",
  }}>
    <div style={{
      width: 42, height: 42, borderRadius: "50%",
      border: `3px solid rgba(232,98,42,0.14)`,
      borderTop: `3px solid ${ORANGE}`,
      animation: "spin 0.85s linear infinite",
      boxShadow: `0 0 20px rgba(232,98,42,0.15)`,
    }} />
    <div style={{
      position: "absolute",
      width: 6, height: 6, borderRadius: "50%",
      background: ORANGE, boxShadow: `0 0 12px ${ORANGE}`,
      animation: "pulse 0.85s ease-in-out infinite",
    }} />
    <span style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: "0.46rem", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.38em",
      color: "rgba(242,238,248,0.28)", marginTop: "0.25rem",
    }}>Loading...</span>
    <style>{`
      @keyframes spin  { to { transform: rotate(360deg); } }
      @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)} }
    `}</style>
  </div>
);

// ─── 404 ──────────────────────────────────────────────────────────────────────
const NotFound = () => (
  <div style={{
    minHeight: "100vh", background: "transparent",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: "1rem", padding: "2rem",
    position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      backgroundImage: "linear-gradient(rgba(255,255,255,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.014) 1px,transparent 1px)",
      backgroundSize: "68px 68px",
      maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%,black 40%,transparent 100%)",
    }} />
    <div style={{
      position: "absolute",
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(8rem,28vw,22rem)",
      fontWeight: 400, color: "rgba(232,98,42,0.04)",
      lineHeight: 1, pointerEvents: "none", userSelect: "none",
      letterSpacing: "0.04em",
    }}>404</div>
    <div style={{
      position: "relative", textAlign: "center",
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "1.1rem",
      maxWidth: 420, width: "100%",
    }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "0.46rem",
        padding: "0.32rem 0.92rem", borderRadius: 100,
        background: "linear-gradient(135deg,rgba(232,98,42,0.1),rgba(232,98,42,0.04))",
        border: "1px solid rgba(232,98,42,0.28)", backdropFilter: "blur(12px)",
      }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:ORANGE, display:"inline-block",
          boxShadow:`0 0 10px ${ORANGE}` }}/>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.47rem",
          fontWeight:700, letterSpacing:"0.26em", textTransform:"uppercase",
          color:"rgba(240,132,90,0.95)" }}>Page Not Found</span>
      </div>
      <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(3rem,9vw,6rem)",
        fontWeight:400, letterSpacing:"0.04em", color:"#F2EEF8", lineHeight:0.9, margin:0 }}>
        Lost in Space.
      </h1>
      <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"clamp(0.62rem,2.5vw,0.72rem)",
        color:"rgba(242,238,248,0.4)", lineHeight:1.9, maxWidth:360, margin:0 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a href="/" style={{
        display:"inline-flex", alignItems:"center", gap:"0.55rem", marginTop:"0.4rem",
        padding:"0.9rem 2rem", borderRadius:6,
        background:`linear-gradient(135deg,${ORANGE},#C94E1A 65%,#b03a0e)`,
        color:"#fff", fontFamily:"'Space Mono',monospace",
        fontSize:"0.58rem", fontWeight:700, letterSpacing:"0.22em",
        textTransform:"uppercase", textDecoration:"none",
        boxShadow:`0 8px 28px rgba(232,98,42,0.32),inset 0 1px 0 rgba(255,255,255,0.18)`,
      }}>← Back Home</a>
    </div>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
      *,*::before,*::after{box-sizing:border-box;}
    `}</style>
  </div>
);

// ─── GLOBAL THREE.JS BACKGROUND ───────────────────────────────────────────────
function GlobalThreeBackground() {
  const mountRef = useRef(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const mob = isMobile;

    const renderer = new THREE.WebGLRenderer({ antialias: !mob, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mob ? 1.4 : 1.8));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, el.clientWidth / el.clientHeight, 0.1, 300);
    camera.position.set(0, 0, 9);

    scene.fog = new THREE.FogExp2(0x010103, 0.026);

    scene.add(new THREE.AmbientLight(0xffffff, 0.04));
    const keyL  = new THREE.PointLight(0xe8622a, 7,  24); keyL.position.set(5, 4, 6);   scene.add(keyL);
    const fillL = new THREE.PointLight(0xd4923a, 4,  18); fillL.position.set(-6,-2, 3); scene.add(fillL);
    const rimL  = new THREE.PointLight(0xff4400, 2.5,14); rimL.position.set(0, 6,-4);   scene.add(rimL);
    const coolL = new THREE.PointLight(0x1a0aff, 1.2,12); coolL.position.set(-4, 3, 2); scene.add(coolL);

    const knotGeo = new THREE.TorusKnotGeometry(1.5, 0.44, mob ? 100 : 200, 22, 3, 5);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0xe8622a, metalness: 1.0, roughness: 0.04,
      clearcoat: 1.0, clearcoatRoughness: 0.05,
      transparent: true, opacity: 0,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.position.set(mob ? 0 : 3.2, 0.2, -2.5);
    knot.scale.setScalar(mob ? 0.55 : 0.82);
    scene.add(knot);

    const wireMat = new THREE.MeshBasicMaterial({ color: 0xf0845a, wireframe: true, transparent: true, opacity: 0 });
    const wire = new THREE.Mesh(knotGeo, wireMat);
    wire.position.copy(knot.position);
    wire.scale.copy(knot.scale);
    scene.add(wire);

    const innerGeo = new THREE.TorusKnotGeometry(1.0, 0.18, mob ? 70 : 130, 14, 2, 3);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xd4923a, wireframe: true, transparent: true, opacity: 0 });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.copy(knot.position);
    inner.scale.copy(knot.scale);
    scene.add(inner);

    const haloMat = new THREE.MeshBasicMaterial({ color: 0xe8622a, transparent: true, opacity: 0 });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.010, 8, 150), haloMat);
    halo.position.copy(knot.position);
    halo.rotation.x = Math.PI / 2.4;
    scene.add(halo);

    const halo2Mat = new THREE.MeshBasicMaterial({ color: 0xd4923a, transparent: true, opacity: 0 });
    const halo2 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.007, 8, 150), halo2Mat);
    halo2.position.copy(knot.position);
    halo2.rotation.x = Math.PI / 2;
    halo2.rotation.z = 0.4;
    scene.add(halo2);

    const floaters = [];
    const addFloater = (geo, color, x, y, z, scale, rotSpeed, targetOp) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color, metalness: 0.9, roughness: 0.1,
        clearcoat: 0.6, transparent: true, opacity: 0,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.scale.setScalar(scale);
      scene.add(m);
      floaters.push({
        mesh: m, rotSpeed, targetOp,
        phase:      Math.random() * Math.PI * 2,
        floatSpeed: 0.20 + Math.random() * 0.38,
        floatAmp:   0.05 + Math.random() * 0.08,
        axis:       new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        originY:    y,
      });
    };

    if (!mob) {
      addFloater(new THREE.IcosahedronGeometry(0.52, 1), 0xd4923a, -5.8,  2.2, -4,   1,    0.007, 0.42);
      addFloater(new THREE.OctahedronGeometry(0.42),     0xe8622a,  6.4, -1.5, -5,   1,    0.011, 0.38);
      addFloater(new THREE.TetrahedronGeometry(0.38),    0xf0845a, -3.8, -3.0, -3.5, 1,    0.014, 0.35);
      addFloater(new THREE.IcosahedronGeometry(0.28, 0), 0xb8672a, -1.8,  4.2, -3.5, 1,    0.018, 0.28);
      addFloater(new THREE.DodecahedronGeometry(0.34),   0xc8763a,  5.8,  2.4, -5.5, 0.9,  0.009, 0.32);
      addFloater(new THREE.OctahedronGeometry(0.22),     0xf0845a,  1.0, -3.8, -2,   1,    0.020, 0.30);
      addFloater(new THREE.TorusKnotGeometry(0.50, 0.15, 90, 12, 2, 3), 0xd4923a, -6.4, 3.4, -6, 0.8, 0.007, 0.30);
    } else {
      addFloater(new THREE.IcosahedronGeometry(0.40, 1), 0xd4923a, -3.2,  1.8, -4,   1, 0.007, 0.32);
      addFloater(new THREE.OctahedronGeometry(0.32),     0xe8622a,  3.6, -1.4, -4,   1, 0.011, 0.28);
      addFloater(new THREE.TetrahedronGeometry(0.28),    0xf0845a, -0.6, -2.8, -2.5, 1, 0.014, 0.26);
    }

    const ptCount = mob ? 500 : 1600;
    const ptPos   = new Float32Array(ptCount * 3);
    const ptCol   = new Float32Array(ptCount * 3);
    for (let i = 0; i < ptCount; i++) {
      const r  = 9 + Math.random() * 14;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      ptPos[i*3]   = r * Math.sin(ph) * Math.cos(th);
      ptPos[i*3+1] = r * Math.sin(ph) * Math.sin(th);
      ptPos[i*3+2] = r * Math.cos(ph);
      const b = Math.random();
      ptCol[i*3]   = 0.91 + b * 0.09;
      ptCol[i*3+1] = 0.38 + b * 0.19;
      ptCol[i*3+2] = 0.16 + b * 0.05;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol, 3));
    const ptMat = new THREE.PointsMaterial({
      size: mob ? 0.018 : 0.026, vertexColors: true,
      transparent: true, opacity: 0, sizeAttenuation: true,
    });
    const points = new THREE.Points(ptGeo, ptMat);
    scene.add(points);

    const grid = new THREE.GridHelper(60, 52, 0xe8622a, 0xe8622a);
    grid.material.transparent = true;
    grid.material.opacity = 0;
    grid.position.set(0, -6, -3);
    scene.add(grid);

    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    let raf;
    const startTime = performance.now();
    const camTarget = new THREE.Vector3();
    let introT = 0;

    const fadeTo = (mat, target, spd = 0.020) => {
      if (mat) mat.opacity += (target - mat.opacity) * spd;
    };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) / 1000;

      introT = Math.min(introT + 0.0035, 1);
      const eased = 1 - Math.pow(1 - introT, 3);

      const scrollY    = window.scrollY;
      const scrollFrac = Math.min(scrollY / 2400, 1);

      knot.rotation.x = t * 0.09;
      knot.rotation.y = t * 0.065;
      knot.rotation.z = t * 0.032;
      const breathe = 1 + Math.sin(t * 0.8) * 0.012;
      knot.scale.setScalar((mob ? 0.55 : 0.82) * breathe * eased);
      fadeTo(knotMat,  0.48 * eased);

      wire.rotation.copy(knot.rotation);
      wire.scale.copy(knot.scale);
      fadeTo(wireMat,  0.038 * eased);

      inner.rotation.x = -t * 0.06;
      inner.rotation.y =  t * 0.10;
      inner.scale.copy(knot.scale);
      fadeTo(innerMat, 0.028 * eased);

      halo.rotation.z  =  t * 0.034;
      halo.rotation.y  =  t * 0.012;
      halo2.rotation.z = -t * 0.026;
      halo2.rotation.x = Math.PI / 2 + Math.sin(t * 0.20) * 0.13;
      fadeTo(haloMat,  0.14 * eased);
      fadeTo(halo2Mat, 0.08 * eased);

      floaters.forEach(({ mesh, rotSpeed, phase, floatSpeed, floatAmp, axis, originY, targetOp }) => {
        mesh.rotateOnAxis(axis, rotSpeed);
        mesh.position.y = originY + Math.sin(t * floatSpeed + phase) * floatAmp;
        fadeTo(mesh.material, targetOp * eased);
      });

      fadeTo(ptMat, 0.45 * eased);
      points.rotation.y = t * 0.007;
      points.rotation.x = t * 0.003;

      fadeTo(grid.material, 0.022 * eased);
      grid.rotation.y = t * 0.005;

      keyL.position.x  = Math.sin(t * 0.30) * 6;
      keyL.position.y  = Math.cos(t * 0.19) * 4 + 2;
      fillL.position.x = Math.cos(t * 0.24) * 7;
      fillL.position.z = Math.sin(t * 0.16) * 5;
      rimL.position.x  = Math.sin(t * 0.14 + 1.4) * 6;
      coolL.position.x = Math.cos(t * 0.26 + 0.5) * 5;
      coolL.position.y = Math.sin(t * 0.11) * 4 + 2;

      if (!mob) {
        camTarget.x = mouse.x * 0.38;
        camTarget.y = -mouse.y * 0.24 - scrollFrac * 3.2;
        camTarget.z = 9 + scrollFrac * 1.8;
      } else {
        camTarget.x = 0;
        camTarget.y = -scrollFrac * 2.5;
        camTarget.z = 9;
      }
      camera.position.x += (camTarget.x - camera.position.x) * 0.038;
      camera.position.y += (camTarget.y - camera.position.y) * 0.038;
      camera.position.z += (camTarget.z - camera.position.z) * 0.038;
      camera.lookAt(mob ? 0 : 0.8, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [isMobile]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const App = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <div style={{
      display: "flex", flexDirection: "column",
      minHeight: "100vh", background: BG,
      overflowX: "hidden",
      position: "relative",
    }}>
      <ScrollToTop />
      <GlobalThreeBackground />
      <Navbar />
      <main style={{ flex: 1, position: "relative", zIndex: 2 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <SkillGraph />  {/* ← ADD THIS LINE — appears right below Hero */}
              </>
            } />
            <Route path="/about"     element={<About />}     />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact"   element={<Contact />}   />
            <Route path="*"          element={<NotFound />}  />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      {/* <HireMeWidget /> */}
      <AIWidget />
      {/* <ChatWidget /> */}
    </div>
  </Router>
);

export default App;
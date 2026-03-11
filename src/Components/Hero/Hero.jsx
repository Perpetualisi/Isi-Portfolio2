import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import * as THREE from "three";
import {
  FiArrowRight,
  FiDownload,
  FiClock,
  FiLayers,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#010103",
  orange:  "#E8622A",
  orangeD: "#C94E1A",
  orangeG: "#F0845A",
  okanA:   "#B8672A",
  okanB:   "#A0522D",
  okanC:   "#C8763A",
  gold:    "#D4923A",
  text:    "#F2EEF8",
  muted:   "rgba(242,238,248,0.40)",
  borderB: "rgba(255,255,255,0.055)",
  border:  "rgba(232,98,42,0.16)",
};

// ─── CUSTOM CURSOR (desktop only) ────────────────────────────────────────────
function CustomCursor() {
  const dot  = useRef(null);
  const ring = useRef(null);
  const pos  = useRef({ x: 0, y: 0 });
  const ring_pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dot.current) {
        dot.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      }
    };
    window.addEventListener("mousemove", move);

    let raf;
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      ring_pos.current.x = lerp(ring_pos.current.x, pos.current.x, 0.12);
      ring_pos.current.y = lerp(ring_pos.current.y, pos.current.y, 0.12);
      if (ring.current) {
        ring.current.style.transform = `translate(${ring_pos.current.x}px,${ring_pos.current.y}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      {/* Dot */}
      <div ref={dot} style={{
        position: "fixed", top: -4, left: -4, width: 8, height: 8,
        borderRadius: "50%", background: T.orange,
        pointerEvents: "none", zIndex: 9999,
        boxShadow: `0 0 12px ${T.orange}, 0 0 24px ${T.orange}55`,
        willChange: "transform",
      }} />
      {/* Ring */}
      <div ref={ring} style={{
        position: "fixed", top: -20, left: -20, width: 40, height: 40,
        borderRadius: "50%", border: `1px solid rgba(232,98,42,0.55)`,
        pointerEvents: "none", zIndex: 9998,
        willChange: "transform",
      }} />
    </>
  );
}

// ─── THREE.JS SCENE ──────────────────────────────────────────────────────────
function ThreeScene({ isMobile, scrollY }) {
  const mountRef  = useRef(null);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    return scrollY.on("change", (v) => { scrollRef.current = v; });
  }, [scrollY]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 300);
    camera.position.set(0, 0, 8);

    scene.fog = new THREE.FogExp2(0x010103, 0.028);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.06));

    const keyL = new THREE.PointLight(0xe8622a, 12, 28);
    keyL.position.set(5, 4, 6);
    keyL.castShadow = !isMobile;
    scene.add(keyL);

    const fillL = new THREE.PointLight(0xd4923a, 6, 22);
    fillL.position.set(-6, -2, 3);
    scene.add(fillL);

    const rimL = new THREE.PointLight(0xff4400, 4, 18);
    rimL.position.set(0, 6, -4);
    scene.add(rimL);

    const coolL = new THREE.PointLight(0x1a0aff, 2, 16);
    coolL.position.set(-4, 3, 2);
    scene.add(coolL);

    const backL = new THREE.DirectionalLight(0xf0845a, 0.8);
    backL.position.set(-4, 3, 5);
    scene.add(backL);

    // ── SHOWPIECE: Large central torus knot — RIGHT SIDE ──
    // On desktop this sits where the "img" column is — overlapping the profile card behind it in z-space
    const heroKnotGeo = new THREE.TorusKnotGeometry(1.55, 0.48, 256, 28, 3, 5);
    const heroKnotMat = new THREE.MeshPhysicalMaterial({
      color: 0xe8622a,
      metalness: 1.0,
      roughness: 0.04,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      transparent: true,
      opacity: 0.88,
      envMapIntensity: 1.2,
    });
    const heroKnot = new THREE.Mesh(heroKnotGeo, heroKnotMat);
    heroKnot.castShadow = !isMobile;
    // Desktop: push RIGHT toward the img column. Mobile: center, above
    heroKnot.position.set(isMobile ? 0 : 3.2, isMobile ? 1.2 : 0.2, -2);
    heroKnot.scale.setScalar(isMobile ? 0.58 : 0.92);
    scene.add(heroKnot);

    // Wireframe ghost — slightly larger, pulsing
    const heroWireMat = new THREE.MeshBasicMaterial({
      color: 0xf0845a, wireframe: true, transparent: true, opacity: 0.055,
    });
    const heroWire = new THREE.Mesh(heroKnotGeo, heroWireMat);
    heroWire.position.copy(heroKnot.position);
    heroWire.scale.copy(heroKnot.scale);
    scene.add(heroWire);

    // Inner ghost — different knot params (p=2,q=3) for nested feel
    const innerKnotGeo = new THREE.TorusKnotGeometry(1.1, 0.2, 160, 18, 2, 3);
    const innerKnotMat = new THREE.MeshBasicMaterial({
      color: 0xd4923a, wireframe: true, transparent: true, opacity: 0.035,
    });
    const innerKnot = new THREE.Mesh(innerKnotGeo, innerKnotMat);
    innerKnot.position.copy(heroKnot.position);
    innerKnot.scale.copy(heroKnot.scale);
    scene.add(innerKnot);

    // ── HALO RING around the knot ──
    const ringGeo = new THREE.TorusGeometry(2.8, 0.012, 8, 180);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xe8622a, transparent: true, opacity: 0.22 });
    const haloRing = new THREE.Mesh(ringGeo, ringMat);
    haloRing.position.copy(heroKnot.position);
    haloRing.rotation.x = Math.PI / 2.4;
    scene.add(haloRing);

    const ring2Geo = new THREE.TorusGeometry(3.4, 0.008, 8, 180);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xd4923a, transparent: true, opacity: 0.1 });
    const haloRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    haloRing2.position.copy(heroKnot.position);
    haloRing2.rotation.x = Math.PI / 2;
    haloRing2.rotation.z = 0.4;
    scene.add(haloRing2);

    // ── ACCENT SHAPES — scattered satellites ──
    const floaters = [];
    const addFloater = (geo, color, x, y, z, scale, opacity, rotSpeed, metal = 0.88, rough = 0.12) => {
      const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
        color, metalness: metal, roughness: rough,
        transparent: true, opacity, clearcoat: 0.6, clearcoatRoughness: 0.1,
      }));
      m.scale.setScalar(scale);
      m.position.set(x, y, z);
      m.castShadow = !isMobile;
      scene.add(m);
      floaters.push({
        mesh: m, rotSpeed,
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.22 + Math.random() * 0.45,
        floatAmp:   0.05 + Math.random() * 0.09,
        axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        originY: y,
      });
    };

    // Large accent icosahedron — left side
    addFloater(new THREE.IcosahedronGeometry(0.7, 1),  0xd4923a, -4.5,  1.6, -3,   1,   0.75, 0.007);
    // Small crisp octahedron — upper right
    addFloater(new THREE.OctahedronGeometry(0.5),       0xe8622a,  5.8, -1.2, -4,   1,   0.65, 0.011);
    // Tetrahedron — lower left
    addFloater(new THREE.TetrahedronGeometry(0.48),     0xf0845a, -3.2, -2.8, -2,   1,   0.6,  0.014);
    // Tiny icosahedron — upper left
    addFloater(new THREE.IcosahedronGeometry(0.32, 0),  0xb8672a, -1.5,  3.8, -2.5, 1,   0.5,  0.018);
    // Dodecahedron — far right
    addFloater(new THREE.DodecahedronGeometry(0.42),    0xc8763a,  6.2,  2.0, -4,   0.9, 0.55, 0.009);
    // Tiny octahedron — center lower
    addFloater(new THREE.OctahedronGeometry(0.26),      0xf0845a,  0.8, -3.5, -1.5, 1,   0.5,  0.02);
    // Background torus knot accent
    const accentKnotGeo = new THREE.TorusKnotGeometry(0.6, 0.19, 120, 14, 2, 3);
    addFloater(accentKnotGeo, 0xd4923a, -5.5,  3.0, -5,   0.85, 0.42, 0.008, 0.95, 0.08);

    // ── POINT CLOUD — cosmic dust ──
    const ptCount  = isMobile ? 600 : 1800;
    const ptPos    = new Float32Array(ptCount * 3);
    const ptColors = new Float32Array(ptCount * 3);
    for (let i = 0; i < ptCount; i++) {
      const r = 8 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      ptPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      ptPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      ptPos[i*3+2] = r * Math.cos(phi);
      // vary between orange/gold
      const blend = Math.random();
      ptColors[i*3]   = 0.91 + blend * 0.09;
      ptColors[i*3+1] = 0.38 + blend * 0.19;
      ptColors[i*3+2] = 0.16 + blend * 0.05;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptColors, 3));
    const ptMat = new THREE.PointsMaterial({
      size: isMobile ? 0.022 : 0.032,
      vertexColors: true,
      transparent: true, opacity: 0.6,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(ptGeo, ptMat);
    scene.add(points);

    // ── ENERGY TENDRILS (line segments radiating from knot) ──
    const tendrilCount = isMobile ? 0 : 14;
    const tendrils = [];
    for (let i = 0; i < tendrilCount; i++) {
      const angle  = (i / tendrilCount) * Math.PI * 2;
      const spread = 1.8 + Math.random() * 1.4;
      const end    = new THREE.Vector3(
        Math.cos(angle) * spread,
        Math.sin(angle) * spread,
        (Math.random() - 0.5) * 1.2,
      );
      const tGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), end]);
      const tMat = new THREE.LineBasicMaterial({ color: 0xe8622a, transparent: true, opacity: 0.08 + Math.random() * 0.1 });
      const line = new THREE.Line(tGeo, tMat);
      line.position.copy(heroKnot.position);
      scene.add(line);
      tendrils.push({ line, tMat, baseOpacity: tMat.opacity });
    }

    // ── HOLOGRAPHIC GRID FLOOR ──
    const grid = new THREE.GridHelper(50, 48, 0xe8622a, 0xe8622a);
    grid.material.transparent = true;
    grid.material.opacity = 0.028;
    grid.position.set(0, -5.5, -4);
    scene.add(grid);

    // ── Resize ──
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Mouse ──
    const onMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    // ── Animate ──
    let raf;
    const clock    = new THREE.Clock();
    const camTarget = new THREE.Vector3();
    let introT = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth intro — camera drifts in from far
      introT = Math.min(introT + 0.008, 1);
      const eased = 1 - Math.pow(1 - introT, 4);

      // ── Hero knot ──
      heroKnot.rotation.x = t * 0.11;
      heroKnot.rotation.y = t * 0.08;
      heroKnot.rotation.z = t * 0.04;
      // Subtle breathe on scale
      const breathe = 1 + Math.sin(t * 0.9) * 0.015;
      const baseScale = isMobile ? 0.58 : 0.92;
      heroKnot.scale.setScalar(baseScale * breathe * eased);

      heroWire.rotation.copy(heroKnot.rotation);
      heroWire.scale.copy(heroKnot.scale);
      heroWire.material.opacity = 0.035 + Math.sin(t * 1.4) * 0.02;

      innerKnot.rotation.x = -t * 0.07;
      innerKnot.rotation.y =  t * 0.13;
      innerKnot.scale.copy(heroKnot.scale);

      // ── Halo rings ──
      haloRing.rotation.z  = t * 0.04;
      haloRing.rotation.y  = t * 0.015;
      haloRing2.rotation.z = -t * 0.03;
      haloRing2.rotation.x = Math.PI / 2 + Math.sin(t * 0.25) * 0.15;
      haloRing.material.opacity  = (0.15 + Math.sin(t * 0.6) * 0.07) * eased;
      haloRing2.material.opacity = (0.08 + Math.sin(t * 0.4 + 1) * 0.04) * eased;

      // ── Floaters ──
      floaters.forEach(({ mesh, rotSpeed, phase, floatSpeed, floatAmp, axis, originY }) => {
        mesh.rotateOnAxis(axis, rotSpeed);
        mesh.position.y = originY + Math.sin(t * floatSpeed + phase) * floatAmp;
      });

      // ── Tendrils pulse ──
      tendrils.forEach(({ tMat, baseOpacity }, i) => {
        tMat.opacity = baseOpacity * (0.6 + Math.sin(t * 1.8 + i * 0.7) * 0.4);
      });

      // ── Points ──
      points.rotation.y = t * 0.012;
      points.rotation.x = t * 0.005;

      // ── Lights orbit ──
      keyL.position.x = Math.sin(t * 0.35) * 6;
      keyL.position.y = Math.cos(t * 0.22) * 4 + 2;
      keyL.intensity  = 10 + Math.sin(t * 1.1) * 2;

      fillL.position.x = Math.cos(t * 0.28) * 7;
      fillL.position.z = Math.sin(t * 0.19) * 5;

      rimL.position.x  = Math.sin(t * 0.17 + 1.5) * 6;
      rimL.position.z  = Math.cos(t * 0.23 + 0.8) * 4;

      coolL.position.x = Math.cos(t * 0.31 + 0.5) * 5;
      coolL.position.y = Math.sin(t * 0.14) * 4 + 2;

      // ── Camera parallax ──
      const scrollProgress = Math.min(scrollRef.current / 700, 1);
      const introCamZ = 14 - eased * 6; // camera drifts in from z=14 to z=8
      if (!isMobile) {
        camTarget.x = mouseRef.current.x * 0.55;
        camTarget.y = -mouseRef.current.y * 0.38 + scrollProgress * -2;
        camTarget.z = introCamZ + scrollProgress * 3;
      } else {
        camTarget.x = 0;
        camTarget.y = scrollProgress * -1.4;
        camTarget.z = introCamZ;
      }
      camera.position.x += (camTarget.x - camera.position.x) * 0.05;
      camera.position.y += (camTarget.y - camera.position.y) * 0.05;
      camera.position.z += (camTarget.z - camera.position.z) * 0.04;
      camera.lookAt(isMobile ? 0 : 1.2, 0, 0);

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
    <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }} />
  );
}

// ─── NOISE OVERLAY ────────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, opacity: 0.028,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat", backgroundSize: "128px",
    }} />
  );
}

// ─── TYPEWRITER ───────────────────────────────────────────────────────────────
const ROLES = ["3D Web Developer", "WebGL Engineer", "Three.js Specialist", "Full-Stack Craftsman"];

function Typewriter() {
  const [roleIdx,   setRoleIdx]   = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase,     setPhase]     = useState("typing");

  useEffect(() => {
    const target = ROLES[roleIdx];
    let timer;
    if (phase === "typing") {
      if (displayed.length < target.length) timer = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 68);
      else timer = setTimeout(() => setPhase("pausing"), 1900);
    } else if (phase === "pausing") {
      timer = setTimeout(() => setPhase("deleting"), 400);
    } else {
      if (displayed.length > 0) timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 36);
      else { setRoleIdx((i) => (i + 1) % ROLES.length); setPhase("typing"); }
    }
    return () => clearTimeout(timer);
  }, [displayed, phase, roleIdx]);

  return (
    <span style={{ color: T.text }}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
        style={{ display: "inline-block", width: 2, height: "0.85em", background: T.orange, marginLeft: 3, verticalAlign: "middle", borderRadius: 1 }}
      />
    </span>
  );
}

// ─── AVAILABILITY BADGE ───────────────────────────────────────────────────────
function AvailBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.65 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.45rem",
        padding: "0.3rem 0.85rem", borderRadius: 100, alignSelf: "flex-start",
        background: "linear-gradient(135deg,rgba(34,197,94,0.09) 0%,rgba(34,197,94,0.03) 100%)",
        border: "1px solid rgba(34,197,94,0.24)", backdropFilter: "blur(12px)",
      }}
    >
      <motion.span
        animate={{ opacity: [1, 0.2, 1], scale: [1, 0.65, 1] }}
        transition={{ duration: 2.1, repeat: Infinity }}
        style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", display: "inline-block", flexShrink: 0 }}
      />
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.34rem,0.9vw,0.42rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(134,239,172,0.9)", fontWeight: 700 }}>
        Available for hire
      </span>
    </motion.div>
  );
}

// ─── SKILL BARS ───────────────────────────────────────────────────────────────
const SKILL_BARS = [
  { label: "Three.js / WebGL", pct: 92, color: T.orange  },
  { label: "React / Next.js",  pct: 95, color: T.gold    },
  { label: "Node / Backend",   pct: 82, color: T.orangeG },
];

function SkillBars() {
  const [started, setStarted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setStarted(true), 1400); return () => clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.65 }}
      style={{ padding: "0.85rem 1rem", borderRadius: 14, background: "linear-gradient(135deg,rgba(255,255,255,0.025) 0%,rgba(255,255,255,0.008) 100%)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "0.6rem" }}
    >
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.36rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(232,98,42,0.55)" }}>Expertise</span>
      {SKILL_BARS.map(({ label, pct, color }) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.22rem" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.38rem", textTransform: "uppercase", letterSpacing: "0.16em", color: T.muted }}>{label}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.38rem", color, fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ height: 3, borderRadius: 100, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: started ? `${pct}%` : 0 }}
              transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              style={{ height: "100%", borderRadius: 100, background: `linear-gradient(90deg,${color},${T.orangeG})`, boxShadow: `0 0 10px ${color}55` }}
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ─── PROFILE CARD 3D ─────────────────────────────────────────────────────────
function ProfileCard3D({ time, isMobile }) {
  const ref  = useRef(null);
  const mx   = useMotionValue(0);
  const my   = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], ["14deg", "-14deg"]), { stiffness: 60, damping: 13 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], ["-14deg", "14deg"]), { stiffness: 60, damping: 13 });
  const glareX  = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY  = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);
  const glareBg = useTransform([glareX, glareY], (l) => `radial-gradient(circle at ${l[0]} ${l[1]}, rgba(255,255,255,0.1) 0%, transparent 55%)`);
  const shadowX   = useTransform(mx, [-0.5, 0.5], [-28, 28]);
  const shadowY   = useTransform(my, [-0.5, 0.5], [-18, 18]);
  const dynShadow = useTransform([shadowX, shadowY], (l) => `${l[0]}px ${l[1]}px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(232,98,42,0.14), 0 0 55px rgba(232,98,42,0.12)`);

  const [hov,     setHov]     = useState(false);
  const [scanned, setScanned] = useState(false);
  useEffect(() => { const t = setTimeout(() => setScanned(true), 1700); return () => clearTimeout(t); }, []);

  function handleMove(e) {
    if (isMobile) return;
    const r = ref.current?.getBoundingClientRect();
    if (r) { mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }
  }

  const cardW = isMobile ? 248 : 300;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => { if (!isMobile) setHov(true); }}
      onMouseLeave={() => { mx.set(0); my.set(0); setHov(false); }}
      initial={{ opacity: 0, scale: 0.78, y: 50, rotateX: 12 }}
      animate={{ opacity: 1, scale: 1,    y: 0,  rotateX: 0  }}
      transition={{ duration: 1.15, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        rotateX: isMobile ? 0 : rotX,
        rotateY: isMobile ? 0 : rotY,
        transformStyle: "preserve-3d",
        perspective: "1200px",
        position: "relative",
        width: cardW,
        cursor: "default",
        boxShadow: isMobile ? undefined : dynShadow,
      }}
    >
      {/* Halo */}
      <motion.div animate={{ opacity: hov ? 1 : 0.6, scale: hov ? 1.1 : 1 }} transition={{ duration: 0.9 }}
        style={{ position: "absolute", inset: -36, borderRadius: 44, background: "radial-gradient(ellipse, rgba(232,98,42,0.24) 0%, rgba(232,98,42,0.05) 55%, transparent 70%)", filter: "blur(28px)", pointerEvents: "none", zIndex: -1 }} />

      {/* Ghost frames */}
      <div style={{ position: "absolute", inset: -8,  borderRadius: 34, border: "1px solid rgba(232,98,42,0.1)",  transform: "rotate(3.5deg) scale(1.01)", background: "rgba(232,98,42,0.012)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: -16, borderRadius: 38, border: "1px solid rgba(232,98,42,0.05)", transform: "rotate(-2deg) scale(1.01)", pointerEvents: "none" }} />

      {/* Shell */}
      <div style={{ position: "relative", padding: 5, borderRadius: 26, background: "linear-gradient(148deg,rgba(255,255,255,0.09) 0%,rgba(255,255,255,0.015) 100%)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)", backdropFilter: "blur(24px)" }}>

        {/* Glare */}
        <motion.div style={{ position: "absolute", inset: 0, borderRadius: 26, pointerEvents: "none", zIndex: 12, background: glareBg, opacity: hov ? 1 : 0, transition: "opacity 0.4s" }} />

        {/* Scanline */}
        <AnimatePresence>
          {scanned && (
            <motion.div key="scan"
              initial={{ top: "-6%" }} animate={{ top: "108%" }} exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeIn" }}
              style={{ position: "absolute", left: 0, right: 0, height: "9%", background: "linear-gradient(to bottom,transparent,rgba(232,98,42,0.07) 40%,rgba(232,98,42,0.1) 50%,rgba(232,98,42,0.07) 60%,transparent)", pointerEvents: "none", zIndex: 14, borderRadius: 26 }} />
          )}
        </AnimatePresence>

        {/* Photo */}
        <div style={{ position: "relative", borderRadius: 22, overflow: "hidden" }}>
          <img src="/profile41.jpeg" alt="Perpetual Okan"
            style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block", filter: hov ? "saturate(1.3) brightness(1.06)" : "saturate(1.05)", transform: hov ? "scale(1.05)" : "scale(1)", transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(232,98,42,0.04) 0%,transparent 30%,rgba(1,1,3,0.65) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 0 1px rgba(232,98,42,0.1)", borderRadius: 22, pointerEvents: "none" }} />
        </div>

        {/* Role pill */}
        <div style={{ position: "absolute", top: "0.7rem", left: "0.7rem", background: "rgba(1,1,3,0.82)", backdropFilter: "blur(20px)", border: "1px solid rgba(232,98,42,0.34)", borderRadius: 100, padding: "0.25rem 0.65rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <motion.span animate={{ opacity: [1, 0.2, 1], scale: [1, 0.65, 1] }} transition={{ duration: 2.1, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: isMobile ? "#22c55e" : T.orange, boxShadow: isMobile ? "0 0 8px #22c55e" : `0 0 8px ${T.orange}`, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.38rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.88)" }}>Full-Stack</span>
        </div>

        {/* Year */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          style={{ position: "absolute", bottom: "0.9rem", left: "0.9rem" }}>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.34rem", color: "rgba(255,255,255,0.28)", margin: 0, letterSpacing: "0.18em", textTransform: "uppercase" }}>PORTFOLIO 2025</p>
        </motion.div>
      </div>

      {/* Desktop badges */}
      {!isMobile && (
        <>
          {/* Clock */}
          <motion.div
            initial={{ opacity: 0, x: 20, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1.25, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", bottom: -30, right: -22, zIndex: 20, background: "linear-gradient(135deg,rgba(7,7,13,0.97) 0%,rgba(12,10,20,0.97) 100%)", backdropFilter: "blur(28px)", border: "1px solid rgba(232,98,42,0.26)", borderRadius: 16, padding: "0.78rem 1.1rem", display: "flex", alignItems: "center", gap: "0.6rem", boxShadow: "0 18px 50px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)" }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: "linear-gradient(135deg,rgba(232,98,42,0.2) 0%,rgba(232,98,42,0.06) 100%)", border: "1px solid rgba(232,98,42,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiClock style={{ color: T.orange, fontSize: 13 }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.36rem", color: "rgba(232,98,42,0.72)", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 2, marginTop: 0 }}>System Live</p>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.78rem", color: T.text, fontWeight: 700, margin: 0 }}>{time}</p>
            </div>
          </motion.div>

          {/* Stack badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.45, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", top: "20%", left: -36, zIndex: 20, background: "linear-gradient(135deg,rgba(7,7,13,0.97) 0%,rgba(12,10,20,0.97) 100%)", backdropFilter: "blur(28px)", border: "1px solid rgba(232,98,42,0.2)", borderRadius: 13, padding: "0.6rem 0.9rem", display: "flex", flexDirection: "column", gap: "0.1rem", boxShadow: "0 14px 40px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)" }}
          >
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.36rem", color: "rgba(232,98,42,0.6)", textTransform: "uppercase", letterSpacing: "0.16em" }}>Stack</span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1rem", color: T.text, letterSpacing: "0.06em", lineHeight: 1 }}>Three.js</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.36rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>React · Node · TS</span>
          </motion.div>
        </>
      )}

      {/* Mobile clock */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", bottom: -22, right: -10, zIndex: 20, background: "linear-gradient(135deg,rgba(7,7,13,0.97) 0%,rgba(12,10,20,0.97) 100%)", backdropFilter: "blur(20px)", border: "1px solid rgba(232,98,42,0.26)", borderRadius: 13, padding: "0.52rem 0.78rem", display: "flex", alignItems: "center", gap: "0.45rem", boxShadow: "0 10px 28px rgba(0,0,0,0.8)" }}
        >
          <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: "linear-gradient(135deg,rgba(232,98,42,0.2) 0%,rgba(232,98,42,0.06) 100%)", border: "1px solid rgba(232,98,42,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiClock style={{ color: T.orange, fontSize: 10 }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.32rem", color: "rgba(232,98,42,0.72)", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, marginBottom: 1, marginTop: 0 }}>Live</p>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.58rem", color: T.text, fontWeight: 700, margin: 0 }}>{time}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── STAT CHIP ────────────────────────────────────────────────────────────────
function Stat({ icon: Icon, value, label, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "0.55rem",
        padding: "0.62rem 0.8rem", borderRadius: 12, flex: 1,
        background: hov ? "linear-gradient(135deg,rgba(232,98,42,0.12) 0%,rgba(232,98,42,0.04) 100%)" : "linear-gradient(135deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${hov ? "rgba(232,98,42,0.38)" : T.borderB}`,
        transition: "all 0.3s ease", cursor: "default",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: hov ? "rgba(232,98,42,0.2)" : "rgba(232,98,42,0.08)", border: `1px solid ${hov ? "rgba(232,98,42,0.44)" : "rgba(232,98,42,0.14)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
        <Icon style={{ color: T.orange, fontSize: 10 }} />
      </div>
      <div>
        <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(0.85rem,2.8vw,1.05rem)", color: T.text, lineHeight: 1, margin: 0, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{value}</p>
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.3rem,1vw,0.36rem)", textTransform: "uppercase", letterSpacing: "0.16em", color: T.muted, marginTop: 2, marginBottom: 0, whiteSpace: "nowrap" }}>{label}</p>
      </div>
    </motion.div>
  );
}

// ─── SCROLL INDICATOR ─────────────────────────────────────────────────────────
function ScrollIndicator({ opacity }) {
  return (
    <motion.div style={{ opacity, position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, pointerEvents: "none" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }}>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.32rem", textTransform: "uppercase", letterSpacing: "0.45em", color: "rgba(255,255,255,0.14)" }}>Scroll</span>
      <div style={{ width: 18, height: 30, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, display: "flex", justifyContent: "center", padding: "4px 0" }}>
        <motion.div animate={{ y: [0, 11, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 3, height: 7, background: `linear-gradient(to bottom,${T.orange},${T.orangeG})`, borderRadius: 100 }} />
      </div>
    </motion.div>
  );
}

// ─── FLIP CHAR ────────────────────────────────────────────────────────────────
function FlipChar({ char, delay }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 36, rotateX: -70 }}
      animate={{ opacity: 1, y: 0,  rotateX: 0   }}
      transition={{ delay, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "inline-block", transformStyle: "preserve-3d" }}
    >
      {char}
    </motion.span>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const containerRef = useRef(null);
  const { scrollY }  = useScroll();
  const [time,     setTime]     = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const mxS = useSpring(mouseX, { stiffness: 50, damping: 22 });
  const myS = useSpring(mouseY, { stiffness: 50, damping: 22 });

  const opacity    = useTransform(scrollY, [0, 420], [1, 0]);
  const yParallaxR = useTransform(scrollY, [0, 600], [0, -60]);
  const yParallax  = useSpring(yParallaxR, { stiffness: 65, damping: 28 });

  // Depth parallax layers
  const yLayer1 = useTransform(scrollY, [0, 600], [0, -30]);
  const yLayer2 = useTransform(scrollY, [0, 600], [0, -55]);

  const spotlightBg = useTransform([mxS, myS], (l) =>
    `radial-gradient(800px circle at ${l[0]*100}% ${l[1]*100}%, rgba(232,98,42,0.05), transparent 65%)`);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isMobile) return;
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top)  / r.height);
  }, [mouseX, mouseY, isMobile]);

  const formattedTime = time.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const firstName = "Perpetual".split("");
  const lastName  = "Okan".split("");

  return (
    <>
      {/* Custom cursor — desktop only */}
      {!isMobile && <CustomCursor />}

      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{
          position: "relative", minHeight: "100vh",
          display: "flex", flexDirection: "column", justifyContent: "center",
          background: T.bg, overflow: "hidden",
          paddingTop:    isMobile ? "calc(var(--navbar-height, 70px) + 5rem)" : "calc(var(--navbar-height, 70px) + 8rem)",
          paddingBottom: isMobile ? "6rem" : "7rem",
          paddingLeft: "6%", paddingRight: "6%",
          cursor: isMobile ? "auto" : "none",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
          *, *::before, *::after { box-sizing: border-box; }

          .hg {
            display: grid;
            grid-template-columns: 1.15fr 1fr;
            grid-template-areas: "text img";
            gap: clamp(2.5rem, 4vw, 5rem);
            align-items: center;
            width: 100%; max-width: 1380px; margin: 0 auto;
          }
          .hg-text { grid-area: text; display: flex; flex-direction: column; }
          .hg-img  { grid-area: img;  display: flex; justify-content: center; align-items: center; }

          @media (max-width: 1023px) {
            .hg {
              grid-template-columns: 1fr;
              grid-template-areas: "img" "text";
              gap: 2.6rem; text-align: center;
            }
            .hg-eyebrow { justify-content: center !important; }
            .hg-divider { display: none !important; }
            .hg-btns    { justify-content: center !important; }
            .hg-stats   { justify-content: center !important; }
            .hg-desc {
              border-left: none !important; padding-left: 0 !important;
              border-top: 1px solid rgba(232,98,42,0.16) !important;
              padding-top: 1rem !important;
              margin-left: auto !important; margin-right: auto !important;
            }
          }
          @media (max-width: 480px) {
            .hg-btns { flex-direction: column !important; }
          }

          @keyframes ldp { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.25;transform:scale(.65)} }

          @keyframes shim { 0%{transform:translateX(-120%)} 100%{transform:translateX(320%)} }
          .shim { position: relative; overflow: hidden; }
          .shim::after {
            content: ''; position: absolute; inset: 0;
            background: linear-gradient(90deg,transparent,rgba(255,255,255,0.13) 50%,transparent);
            animation: shim 3.8s infinite; border-radius: inherit;
          }

          a, button { cursor: none; }
        `}</style>

        {/* ── THREE.JS SCENE — full bleed ── */}
        <ThreeScene isMobile={isMobile} scrollY={scrollY} />
        <NoiseOverlay />

        {/* Radial vignette */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
          background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, rgba(1,1,3,0.38) 62%, rgba(1,1,3,0.82) 100%)" }} />

        {/* Side readability gradient */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
          background: isMobile
            ? "linear-gradient(to bottom, rgba(1,1,3,0.38) 0%, transparent 30%, rgba(1,1,3,0.5) 100%)"
            : "linear-gradient(to right, rgba(1,1,3,0.78) 0%, rgba(1,1,3,0.22) 38%, transparent 55%)" }} />

        {/* Mouse spotlight */}
        <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, background: spotlightBg }} />

        {/* ── CONTENT ── */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <motion.div style={{ y: yParallax }} className="hg">

            {/* IMAGE — with extra scroll parallax */}
            <motion.div className="hg-img" style={{ y: yLayer2 }}>
              <ProfileCard3D time={formattedTime} isMobile={isMobile} />
            </motion.div>

            {/* TEXT — slightly less parallax than card */}
            <motion.div className="hg-text" style={{ gap: isMobile ? "1.2rem" : "1.6rem", y: yLayer1 }}>

              {/* Desktop: availability */}
              {!isMobile && <AvailBadge />}

              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, x: isMobile ? 0 : -26, y: isMobile ? 10 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.52 }}
                className="hg-eyebrow"
                style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
              >
                <div className="hg-divider" style={{ height: 1, width: 28, background: `linear-gradient(to right,transparent,${T.orange})`, flexShrink: 0 }} />
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.45rem",
                  padding: "0.3rem 0.88rem", borderRadius: 100, backdropFilter: "blur(14px)",
                  background: "linear-gradient(135deg,rgba(232,98,42,0.1) 0%,rgba(232,98,42,0.04) 100%)",
                  border: "1px solid rgba(232,98,42,0.28)",
                }}>
                  <motion.span
                    animate={{ opacity: [1, 0.2, 1], scale: [1, 0.65, 1] }}
                    transition={{ duration: 2.1, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: "50%", display: "inline-block", flexShrink: 0, background: isMobile ? "#22c55e" : T.orange, boxShadow: isMobile ? "0 0 10px #22c55e, 0 0 20px #22c55e44" : `0 0 10px ${T.orange}` }}
                  />
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.36rem,1.2vw,0.44rem)", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(240,132,90,0.95)", whiteSpace: "nowrap" }}>Full-Stack Engineer</span>
                </div>
                <div className="hg-divider" style={{ height: 1, flex: 1, background: `linear-gradient(to right,${T.border},transparent)` }} />
              </motion.div>

              {/* Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.63, duration: 0.6 }}
                  style={{ fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.4rem,1.4vw,0.58rem)", fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: T.muted, margin: 0 }}>
                  Hi, I'm
                </motion.p>
                <h1 style={{ margin: 0, lineHeight: 0.9, fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? "clamp(3rem,12vw,5rem)" : "clamp(3.8rem,7.5vw,7.8rem)", fontWeight: 400, letterSpacing: "-0.01em" }}>
                  <div style={{ color: T.text }}>
                    {firstName.map((ch, i) => <FlipChar key={i} char={ch} delay={0.66 + i * 0.05} />)}
                  </div>
                  <div>
                    {lastName.map((ch, i) => (
                      <motion.span key={i}
                        initial={{ opacity: 0, y: 36, rotateX: -70 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ delay: 0.92 + i * 0.07, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
                        style={{ display: "inline-block", transformStyle: "preserve-3d", background: `linear-gradient(140deg,${T.okanA} 0%,${T.okanC} 40%,${T.okanB} 70%,${T.okanA} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 18px rgba(184,103,42,0.28)) drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}
                      >{ch}</motion.span>
                    ))}
                  </div>
                </h1>

                {/* Typewriter */}
                <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.88, duration: 0.7 }}
                  style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? "clamp(0.55rem,2.5vw,0.72rem)" : "clamp(0.62rem,1.3vw,0.86rem)", fontWeight: 400, color: T.muted, margin: "0.5rem 0 0", letterSpacing: "0.06em" }}>
                  <Typewriter />
                </motion.h2>
              </div>

              {/* Bio */}
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.94, duration: 0.75 }}
                className="hg-desc"
                style={{ fontFamily: "'Space Mono',monospace", fontSize: isMobile ? "clamp(0.55rem,2vw,0.68rem)" : "clamp(0.6rem,1.1vw,0.76rem)", lineHeight: 1.9, color: T.muted, maxWidth: 460, margin: 0, borderLeft: "2px solid rgba(232,98,42,0.24)", paddingLeft: "1.15rem" }}>
                I craft immersive 3D web experiences and full-stack applications.
                Specialising in Three.js, WebGL and React — turning complex ideas into things people can feel.
              </motion.p>

              {/* Desktop: skill bars */}
              {!isMobile && <SkillBars />}

              {/* CTAs */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.04, duration: 0.75 }}
                className="hg-btns"
                style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>

                <Link to="/portfolio" style={{ textDecoration: "none", flex: isMobile ? 1 : "none" }}>
                  <motion.div
                    whileHover={{ scale: 1.04, boxShadow: `0 20px 50px rgba(232,98,42,0.42)` }}
                    whileTap={{ scale: 0.97 }}
                    className="shim"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.9rem 1.8rem", borderRadius: 6, background: `linear-gradient(135deg,${T.orange} 0%,${T.orangeD} 60%,#b03a0e 100%)`, color: "#fff", fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.48rem,1.8vw,0.56rem)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", boxShadow: `0 8px 30px rgba(232,98,42,0.28), inset 0 1px 0 rgba(255,255,255,0.2)`, cursor: "none", width: "100%", whiteSpace: "nowrap" }}>
                    Explore Work <FiArrowRight style={{ fontSize: 13 }} />
                  </motion.div>
                </Link>

                <motion.button
                  whileHover={{ borderColor: "rgba(232,98,42,0.5)", color: T.text, background: "rgba(232,98,42,0.07)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { const a = document.createElement("a"); a.href = "/Perpetuual-cv.pdf"; a.download = "Perpetual_Okan_Resume.pdf"; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.9rem 1.8rem", borderRadius: 6, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.09)", color: T.muted, fontFamily: "'Space Mono',monospace", fontSize: "clamp(0.48rem,1.8vw,0.56rem)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "none", transition: "all 0.28s ease", backdropFilter: "blur(10px)", flex: isMobile ? 1 : "none", whiteSpace: "nowrap" }}>
                  <FiDownload style={{ fontSize: 13 }} /> Get Resume
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.18, duration: 0.75 }}
                className="hg-stats"
                style={{ display: "flex", gap: "0.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.055)" }}>
                <Stat icon={FiLayers}      value="15+"       label="Projects"  delay={1.22} />
                <Stat icon={FiZap}         value="Three.js"  label="WebGL"     delay={1.32} />
                <Stat icon={FiCheckCircle} value="Full-Stack" label="Specialist" delay={1.42} />
              </motion.div>

            </motion.div>
          </motion.div>
        </div>

        <ScrollIndicator opacity={opacity} />
      </section>
    </>
  );
}
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════ */
const T = {
  bg:      "#010103",
  card:    "#07070d",
  orange:  "#E8622A",
  orangeD: "#C94E1A",
  orangeG: "#F0845A",
  gold:    "#D4923A",
  okanA:   "#B8672A",
  okanC:   "#C8763A",
  text:    "#F2EEF8",
  muted:   "rgba(242,238,248,0.40)",
  faint:   "rgba(242,238,248,0.10)",
  border:  "rgba(232,98,42,0.16)",
  borderB: "rgba(255,255,255,0.055)",
  borderH: "rgba(232,98,42,0.38)",
  green:   "#22c55e",
};

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const SKILL_CATEGORIES = [
  {
    title: "3D & Creative",
    icon:  "cube",
    skills: ["Three.js", "WebGL", "GLSL Shaders", "Framer Motion", "Canvas API", "SVG Animation"],
  },
  {
    title: "Frontend",
    icon:  "layers",
    skills: ["React.js", "Next.js", "TypeScript", "JavaScript ES6+", "Tailwind CSS", "HTML5 / CSS3"],
  },
  {
    title: "Backend & Tools",
    icon:  "terminal",
    skills: ["Node.js", "Express.js", "REST APIs", "PostgreSQL", "MongoDB", "Git / GitHub", "Docker"],
  },
];

const ACHIEVEMENTS = [
  { count: "15+",  label: "Projects Shipped",  detail: "From concept to live production",   icon: "zap"    },
  { count: "3D",   label: "WebGL Specialist",   detail: "Three.js, shaders & immersive UX", icon: "cube"   },
  { count: "FSE",  label: "Full-Stack",         detail: "React · Node · TypeScript",         icon: "layers" },
];

// Timeline milestones
const TIMELINE = [
  { year: "2020", title: "Started coding",        detail: "Fell into React and never looked back",       icon: "⚡" },
  { year: "2021", title: "First freelance client", detail: "Built a full e-commerce site from scratch",  icon: "🚀" },
  { year: "2022", title: "Discovered Three.js",   detail: "3D on the web became an obsession",           icon: "◈"  },
  { year: "2023", title: "15+ projects shipped",  detail: "Fashion, tech, luxury & eCommerce brands",   icon: "✦"  },
  { year: "2024", title: "Going global",          detail: "Open to remote opportunities worldwide",       icon: "🌍" },
];

// Fun facts for the rotating ticker
const FUN_FACTS = [
  "Based in Lagos · Available worldwide",
  "Obsessed with render budgets",
  "GLSL shaders are my love language",
  "Dark themes only · Always",
  "React + Three.js = home",
];

/* ═══════════════════════════════════════════════════════════════
   SVG ICONS
═══════════════════════════════════════════════════════════════ */
const ICONS = {
  cube: (size = 11, color = T.orange) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  layers: (size = 11, color = T.orange) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  terminal: (size = 11, color = T.orange) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  ),
  zap: (size = 11, color = T.orange) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  arrow: (size = 12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  clock: (size = 11, color = T.orange) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  globe: (size = 11, color = T.orange) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   THREE.JS BACKGROUND SCENE
═══════════════════════════════════════════════════════════════ */
function AboutThreeScene({ isMobile }) {
  const mountRef  = useRef(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.4));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 10);

    scene.add(new THREE.AmbientLight(0xffffff, 0.04));
    const l1 = new THREE.PointLight(0xe8622a, 5, 22); l1.position.set(6, 4, 5);  scene.add(l1);
    const l2 = new THREE.PointLight(0xd4923a, 3, 18); l2.position.set(-5,-3, 3); scene.add(l2);
    const l3 = new THREE.PointLight(0x1a0aff, 1.5,14); l3.position.set(-3, 5,-2); scene.add(l3);

    const shapes = [];
    const addShape = (geo, x, y, z, scale, opacity, rotSpeed) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xe8622a, metalness: 0.95, roughness: 0.06,
        transparent: true, opacity, clearcoat: 0.8, clearcoatRoughness: 0.1,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.scale.setScalar(scale);
      scene.add(m);
      shapes.push({ mesh: m, rotSpeed, phase: Math.random()*Math.PI*2, floatAmp: 0.06+Math.random()*0.1, floatSpeed: 0.3+Math.random()*0.4, axis: new THREE.Vector3(Math.random(),Math.random(),Math.random()).normalize(), originY: y });
    };

    addShape(new THREE.IcosahedronGeometry(0.55, 1), -6.5,  2.5, -3, 1, 0.52, 0.008);
    addShape(new THREE.OctahedronGeometry(0.42),       6.0, -1.8, -3, 1, 0.45, 0.012);
    addShape(new THREE.TetrahedronGeometry(0.38),     -4.2, -3.0, -2, 1, 0.40, 0.016);
    addShape(new THREE.IcosahedronGeometry(0.28, 0),   4.5,  3.2, -4, 1, 0.32, 0.020);
    addShape(new THREE.DodecahedronGeometry(0.32),    -2.0,  4.0, -5, 1, 0.28, 0.010);
    addShape(new THREE.OctahedronGeometry(0.22),       2.8, -4.0, -2, 1, 0.35, 0.022);

    // Torus knot
    const knotGeo = new THREE.TorusKnotGeometry(0.9, 0.28, isMobile?80:140, 16, 3, 5);
    const knotMat = new THREE.MeshPhysicalMaterial({ color: 0xe8622a, metalness: 1.0, roughness: 0.05, transparent: true, opacity: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.06 });
    const knot    = new THREE.Mesh(knotGeo, knotMat);
    knot.position.set(isMobile ? 3.5 : 5.5, -0.5, -4);
    knot.scale.setScalar(0.01);
    scene.add(knot);

    const knotWireMat = new THREE.MeshBasicMaterial({ color: 0xf0845a, wireframe: true, transparent: true, opacity: 0.0 });
    const knotWire    = new THREE.Mesh(knotGeo, knotWireMat);
    knotWire.position.copy(knot.position);
    knotWire.scale.copy(knot.scale);
    scene.add(knotWire);

    const haloMat = new THREE.MeshBasicMaterial({ color: 0xe8622a, transparent: true, opacity: 0.0 });
    const halo    = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.01, 6, 120), haloMat);
    halo.position.copy(knot.position);
    halo.rotation.x = Math.PI / 2.2;
    scene.add(halo);

    const ptCount = isMobile ? 280 : 900;
    const ptPos   = new Float32Array(ptCount * 3);
    const ptCol   = new Float32Array(ptCount * 3);
    for (let i = 0; i < ptCount; i++) {
      const r = 7 + Math.random()*10, th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
      ptPos[i*3]=r*Math.sin(ph)*Math.cos(th); ptPos[i*3+1]=r*Math.sin(ph)*Math.sin(th); ptPos[i*3+2]=r*Math.cos(ph);
      const b=Math.random(); ptCol[i*3]=0.91+b*0.09; ptCol[i*3+1]=0.38+b*0.19; ptCol[i*3+2]=0.16+b*0.05;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol, 3));
    const ptMat  = new THREE.PointsMaterial({ size: isMobile?0.018:0.026, vertexColors: true, transparent: true, opacity: 0.0, sizeAttenuation: true });
    const points = new THREE.Points(ptGeo, ptMat);
    scene.add(points);

    const scanMat1 = new THREE.MeshBasicMaterial({ color: 0xe8622a, transparent: true, opacity: 0.0, side: THREE.DoubleSide });
    const scan1    = new THREE.Mesh(new THREE.TorusGeometry(14, 0.008, 4, 80), scanMat1);
    scan1.rotation.x = Math.PI/2; scene.add(scan1);
    const scanMat2 = new THREE.MeshBasicMaterial({ color: 0xd4923a, transparent: true, opacity: 0.0, side: THREE.DoubleSide });
    const scan2    = new THREE.Mesh(new THREE.TorusGeometry(10, 0.006, 4, 80), scanMat2);
    scan2.rotation.x = Math.PI/2; scene.add(scan2);

    const onResize = () => { if (!el) return; camera.aspect=el.clientWidth/el.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth,el.clientHeight); };
    window.addEventListener("resize", onResize);

    let raf; const clock=new THREE.Clock(); let introT=0;
    const fadeTo = (mat, target, spd=0.025) => { mat.opacity += (target-mat.opacity)*spd; };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      introT = Math.min(introT+0.005, 1);
      const eased = 1 - Math.pow(1-introT, 3);

      const scrollFrac = Math.min(scrollRef.current/2000, 1);
      camera.position.y = -scrollFrac*3.5;
      camera.position.x = Math.sin(t*0.04)*0.3;

      knot.rotation.x=t*0.09; knot.rotation.y=t*0.06;
      const ks=(isMobile?0.65:0.88)*eased;
      knot.scale.setScalar(ks*(1+Math.sin(t*0.7)*0.012));
      fadeTo(knotMat, 0.72*eased, 0.03);
      knotWire.rotation.copy(knot.rotation); knotWire.scale.copy(knot.scale);
      fadeTo(knotWireMat, 0.04*eased, 0.03);
      halo.rotation.z=t*0.03; halo.rotation.y=t*0.01;
      fadeTo(haloMat, 0.18*eased, 0.025);

      shapes.forEach(({ mesh, rotSpeed, phase, floatSpeed, floatAmp, axis, originY }) => {
        mesh.rotateOnAxis(axis, rotSpeed);
        mesh.position.y = originY + Math.sin(t*floatSpeed+phase)*floatAmp;
        if (!mesh.material._target) mesh.material._target = mesh.material.opacity;
      });

      fadeTo(ptMat, 0.55*eased, 0.025); points.rotation.y=t*0.008;
      scan1.position.y=((t*0.4)%8)-4; scan2.position.y=((-t*0.28+3)%8)-4;
      fadeTo(scanMat1, 0.08*eased, 0.02); fadeTo(scanMat2, 0.06*eased, 0.02);
      l1.position.x=Math.sin(t*0.22)*7; l1.position.y=Math.cos(t*0.16)*4+2;
      l2.position.x=Math.cos(t*0.19)*6; l2.position.z=Math.sin(t*0.14)*4;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [isMobile]);

  return <div ref={mountRef} style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none" }}/>;
}

/* ═══════════════════════════════════════════════════════════════
   NOISE OVERLAY
═══════════════════════════════════════════════════════════════ */
function NoiseOverlay() {
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:2, opacity:0.022,
      backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat:"repeat", backgroundSize:"128px" }}/>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER — count up from 0
═══════════════════════════════════════════════════════════════ */
function AnimCounter({ to, duration = 1.4 }) {
  const [val, setVal] = useState(0);
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  const raf    = useRef(null);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setVal(Math.round(to * ease));
      if (prog < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [inView, to, duration]);

  return <span ref={ref}>{val}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   SCROLLING TICKER
═══════════════════════════════════════════════════════════════ */
function Ticker() {
  const items = [...FUN_FACTS, ...FUN_FACTS];
  return (
    <div style={{ overflow:"hidden", borderTop:"1px solid rgba(232,98,42,0.1)", borderBottom:"1px solid rgba(232,98,42,0.1)", padding:"8px 0", position:"relative", zIndex:5 }}>
      {/* Left/right fade masks */}
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:80, background:`linear-gradient(to right,${T.bg},transparent)`, zIndex:2, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:80, background:`linear-gradient(to left,${T.bg},transparent)`, zIndex:2, pointerEvents:"none" }}/>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ display:"flex", gap:0, whiteSpace:"nowrap" }}
      >
        {items.map((fact, i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:16, padding:"0 28px", fontFamily:"'Space Mono',monospace", fontSize:"0.48rem", color:T.muted, letterSpacing:"0.18em", textTransform:"uppercase" }}>
            <span style={{ color:T.orange, fontSize:10 }}>◆</span>
            {fact}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CINEMATIC PARAGRAPH
═══════════════════════════════════════════════════════════════ */
function CinematicParagraph({ children, style, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.4, margin: "-60px" });
  return (
    <motion.p ref={ref}
      initial={{ opacity: 0.08, y: 12 }}
      animate={{ opacity: isInView ? 1 : 0.18, y: isInView ? 0 : 8, scale: isInView ? 1 : 0.988 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}>
      {children}
    </motion.p>
  );
}

function CinematicSection({ children, style, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.15, margin: "-30px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0.1, y: 20 }}
      animate={{ opacity: isInView ? 1 : 0.1, y: isInView ? 0 : 20 }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACHIEVEMENT CARD — 3D tilt + glare
═══════════════════════════════════════════════════════════════ */
function AchievementCard({ item, index, isMobile }) {
  const cardRef  = useRef(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.3 });
  const mx  = useMotionValue(0); const my  = useMotionValue(0);
  const mxS = useSpring(mx, { stiffness: 160, damping: 18 });
  const myS = useSpring(my, { stiffness: 160, damping: 18 });
  const rotX    = useTransform(myS, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotY    = useTransform(mxS, [-0.5, 0.5], ["-12deg", "12deg"]);
  const glareBg = useTransform([mxS, myS], l => {
    const gx=(l[0]+0.5)*100, gy=(l[1]+0.5)*100;
    return `radial-gradient(circle 120px at ${gx}% ${gy}%, rgba(232,98,42,0.13) 0%, transparent 65%)`;
  });
  const [hov, setHov] = useState(false);

  function handleMove(e) {
    if (isMobile) return;
    const r = cardRef.current?.getBoundingClientRect();
    if (r) { mx.set((e.clientX-r.left)/r.width-0.5); my.set((e.clientY-r.top)/r.height-0.5); }
  }

  return (
    <motion.div ref={cardRef}
      style={{ rotateX:isMobile?0:rotX, rotateY:isMobile?0:rotY, transformStyle:"preserve-3d", perspective:"900px" }}
      initial={{ opacity:0, y:24, scale:0.94 }}
      animate={isInView ? { opacity:1, y:0, scale:1 } : { opacity:0, y:24, scale:0.94 }}
      transition={{ duration:0.65, delay:index*0.1, ease:[0.16,1,0.3,1] }}
      onMouseMove={handleMove}
      onMouseEnter={()=>{ if(!isMobile) setHov(true); }}
      onMouseLeave={()=>{ mx.set(0); my.set(0); setHov(false); }}>

      <motion.div animate={{ opacity:hov?0.85:0.25 }} transition={{ duration:0.7 }}
        style={{ position:"absolute", inset:-14, borderRadius:24, background:"radial-gradient(ellipse,rgba(232,98,42,0.15) 0%,transparent 70%)", filter:"blur(16px)", pointerEvents:"none", zIndex:-1 }}/>

      <div style={{
        position:"relative", overflow:"hidden",
        padding: isMobile ? "1.2rem 1rem" : "1.6rem 1.4rem",
        borderRadius:18,
        background: hov ? "linear-gradient(145deg,rgba(14,11,8,0.98),rgba(10,8,6,0.98))" : "linear-gradient(145deg,rgba(9,8,6,0.9),rgba(7,6,5,0.85))",
        border:`1px solid ${hov ? T.borderH : T.borderB}`,
        boxShadow: hov ? "0 24px 60px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.06)" : "0 8px 28px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.03)",
        transition:"border-color 0.3s,box-shadow 0.4s,background 0.35s",
        backdropFilter:"blur(14px)", height:"100%",
      }}>
        <motion.div animate={{ opacity:hov?1:0, scaleX:hov?1:0.3 }} transition={{ duration:0.3 }}
          style={{ position:"absolute", top:0, left:0, right:0, height:2, borderRadius:"18px 18px 0 0", background:`linear-gradient(90deg,transparent,${T.orange},transparent)`, transformOrigin:"center" }}/>
        {!isMobile && (
          <motion.div style={{ position:"absolute", inset:0, borderRadius:18, pointerEvents:"none", background:glareBg, opacity:hov?1:0, transition:"opacity 0.3s" }}/>
        )}
        <div style={{ position:"absolute", top:8, right:8, width:14, height:14,
          borderTop:`1px solid rgba(232,98,42,${hov?0.4:0.1})`,
          borderRight:`1px solid rgba(232,98,42,${hov?0.4:0.1})`,
          borderRadius:"0 3px 0 0", transition:"border-color 0.3s" }}/>

        <div style={{ position:"relative" }}>
          <div style={{ marginBottom:"0.8rem", width:32, height:32, borderRadius:9,
            background: hov ? "rgba(232,98,42,0.15)" : "rgba(255,255,255,0.04)",
            border:`1px solid ${hov?"rgba(232,98,42,0.3)":T.borderB}`,
            display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.3s" }}>
            {ICONS[item.icon]?.(13, hov ? T.orange : "rgba(255,255,255,0.28)")}
          </div>
          <h4 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:isMobile?"clamp(1.5rem,7vw,2rem)":"clamp(1.8rem,3vw,2.6rem)", fontWeight:400, letterSpacing:"0.04em", color:T.text, margin:"0 0 0.15rem 0", lineHeight:1 }}>
            {item.count}
          </h4>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.42rem", textTransform:"uppercase", letterSpacing:"0.22em", color:T.orange, fontWeight:700, margin:"0 0 0.28rem 0" }}>
            {item.label}
          </p>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:isMobile?"0.55rem":"0.6rem", color:T.muted, lineHeight:1.55, margin:0 }}>
            {item.detail}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TIMELINE — vertical dot-line journey
═══════════════════════════════════════════════════════════════ */
function Timeline({ isMobile }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <CinematicSection style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"1.4rem" }}>
        <div style={{ width:18, height:2, background:`linear-gradient(to right,${T.orange},transparent)`, borderRadius:2 }}/>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.42rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.3em", color:T.faint }}>Journey</span>
      </div>

      <div ref={ref} style={{ position:"relative", paddingLeft:"1.8rem" }}>
        {/* Vertical track */}
        <div style={{ position:"absolute", left:8, top:0, bottom:0, width:1, background:"rgba(232,98,42,0.12)" }}/>
        {/* Animated fill */}
        <motion.div
          initial={{ height:0 }}
          animate={inView ? { height:"100%" } : { height:0 }}
          transition={{ duration:2.2, ease:[0.16, 1, 0.3, 1], delay:0.2 }}
          style={{ position:"absolute", left:8, top:0, width:1, background:`linear-gradient(to bottom,${T.orange},rgba(232,98,42,0.2))`, transformOrigin:"top" }}
        />

        {TIMELINE.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity:0, x:-12 }}
            animate={inView ? { opacity:1, x:0 } : { opacity:0, x:-12 }}
            transition={{ duration:0.55, delay:0.3 + i*0.15, ease:[0.16, 1, 0.3, 1] }}
            style={{ position:"relative", marginBottom: i < TIMELINE.length-1 ? "1.4rem" : 0, paddingLeft:"0.8rem" }}
          >
            {/* Dot */}
            <div style={{ position:"absolute", left:"-1.3rem", top:2, width:10, height:10, borderRadius:"50%", background: i===TIMELINE.length-1 ? T.orange : "rgba(232,98,42,0.35)", border:`1px solid ${T.orange}`, display:"flex", alignItems:"center", justifyContent:"center", zIndex:1 }}>
              {i === TIMELINE.length-1 && (
                <motion.div animate={{ scale:[1, 1.6, 1], opacity:[1, 0, 1] }} transition={{ duration:2, repeat:Infinity }}
                  style={{ width:4, height:4, borderRadius:"50%", background:T.orange }}/>
              )}
            </div>

            <div style={{ display:"flex", alignItems:"baseline", gap:"0.5rem", marginBottom:2 }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.95rem", color:T.orange, letterSpacing:"0.06em" }}>{item.year}</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.5rem", fontWeight:700, color:T.text, letterSpacing:"0.1em", textTransform:"uppercase" }}>{item.title}</span>
              <span style={{ fontSize:10, marginLeft:"auto" }}>{item.icon}</span>
            </div>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.56rem", color:T.muted, margin:0, lineHeight:1.65 }}>{item.detail}</p>
          </motion.div>
        ))}
      </div>
    </CinematicSection>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LIVE STAT STRIP — small animated counters
═══════════════════════════════════════════════════════════════ */
function StatStrip({ isMobile }) {
  const stats = [
    { label: "Projects",    value: 15,  suffix: "+" },
    { label: "Years",       value: 4,   suffix: "" },
    { label: "Countries",   value: 5,   suffix: "+" },
    { label: "Commits",     value: 2000, suffix: "+" },
  ];

  return (
    <div style={{
      display:"grid", gridTemplateColumns:`repeat(${isMobile?2:4},1fr)`,
      gap:"0.6rem", marginBottom:"1.8rem",
    }}>
      {stats.map(({ label, value, suffix }, i) => (
        <motion.div
          key={label}
          initial={{ opacity:0, y:10 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ delay:i*0.08 }}
          style={{
            padding:"0.8rem 1rem", borderRadius:10,
            background:"rgba(255,255,255,0.02)",
            border:`1px solid ${T.borderB}`,
            display:"flex", flexDirection:"column", gap:2,
          }}
        >
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.55rem", color:T.orange, letterSpacing:"0.04em", lineHeight:1 }}>
            <AnimCounter to={value} duration={1.4} />{suffix}
          </span>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.42rem", color:T.muted, letterSpacing:"0.2em", textTransform:"uppercase" }}>
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKILL TAG
═══════════════════════════════════════════════════════════════ */
function SkillTag({ skill, index, is3D }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.span
      initial={{ opacity:0, scale:0.82 }}
      whileInView={{ opacity:1, scale:1 }}
      viewport={{ once:false, amount:0.5 }}
      transition={{ delay:index*0.04, duration:0.4, ease:[0.16,1,0.3,1] }}
      whileHover={{ scale:1.08, y:-1 }}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        display:"inline-block",
        fontFamily:"'Space Mono',monospace", fontSize:"0.48rem", fontWeight:700,
        letterSpacing:"0.1em", textTransform:"uppercase",
        padding:"0.3rem 0.68rem", borderRadius:100,
        background: hov ? "rgba(232,98,42,0.12)" : is3D ? "rgba(232,98,42,0.06)" : "rgba(255,255,255,0.03)",
        border:`1px solid ${hov ? "rgba(232,98,42,0.36)" : is3D ? "rgba(232,98,42,0.22)" : T.borderB}`,
        color: hov ? "rgba(240,132,90,0.95)" : is3D ? "rgba(240,132,90,0.7)" : T.muted,
        transition:"all 0.22s ease", cursor:"default", whiteSpace:"nowrap",
      }}>
      {skill}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKILLS PANEL — with copy-email micro-interaction
═══════════════════════════════════════════════════════════════ */
function SkillsPanel({ isMobile }) {
  const ref   = useRef(null);
  const mx    = useMotionValue(0); const my    = useMotionValue(0);
  const mxS   = useSpring(mx, { stiffness:75, damping:22 });
  const myS   = useSpring(my, { stiffness:75, damping:22 });
  const rotX  = useTransform(myS, [-0.5,0.5], ["5deg","-5deg"]);
  const rotY  = useTransform(mxS, [-0.5,0.5], ["-5deg","5deg"]);
  const shadowX   = useTransform(mxS, [-0.5,0.5], [-22,22]);
  const shadowY   = useTransform(myS, [-0.5,0.5], [-14,14]);
  const dynShadow = useTransform([shadowX,shadowY], l => `${l[0]}px ${l[1]}px 70px rgba(0,0,0,0.88),0 0 0 1px rgba(232,98,42,0.07)`);
  const glareBg   = useTransform([mxS,myS], l => {
    const gx=(l[0]+0.5)*100, gy=(l[1]+0.5)*100;
    return `radial-gradient(circle 340px at ${gx}% ${gy}%, rgba(232,98,42,0.07) 0%, transparent 65%)`;
  });
  const [hov,     setHov]     = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [activeTab, setTab]   = useState(0);

  function handleMove(e) {
    if (isMobile) return;
    const r = ref.current?.getBoundingClientRect();
    if (r) { mx.set((e.clientX-r.left)/r.width-0.5); my.set((e.clientY-r.top)/r.height-0.5); }
  }

  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText("Perpetualokan0@gmail.com").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }, []);

  return (
    <motion.div ref={ref} onMouseMove={handleMove}
      onMouseEnter={()=>{ if(!isMobile) setHov(true); }}
      onMouseLeave={()=>{ mx.set(0); my.set(0); setHov(false); }}
      style={{ rotateX:isMobile?0:rotX, rotateY:isMobile?0:rotY, transformStyle:"preserve-3d", perspective:"1100px", boxShadow:isMobile?undefined:dynShadow, width:"100%" }}>

      <motion.div animate={{ opacity:hov?0.65:0.25 }} transition={{ duration:0.9 }}
        style={{ position:"absolute", inset:-28, borderRadius:36, background:"radial-gradient(ellipse,rgba(232,98,42,0.13) 0%,transparent 65%)", filter:"blur(26px)", pointerEvents:"none", zIndex:-1 }}/>

      {!isMobile && <>
        <div style={{ position:"absolute", inset:-8,  borderRadius:32, border:"1px solid rgba(232,98,42,0.07)", transform:"rotate(1.4deg) scale(1.01)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:-15, borderRadius:36, border:"1px solid rgba(232,98,42,0.035)", transform:"rotate(-1deg) scale(1.01)", pointerEvents:"none" }}/>
      </>}

      <CinematicSection style={{
        position:"relative", overflow:"hidden",
        background:"linear-gradient(148deg,rgba(9,8,12,0.97),rgba(7,6,11,0.97))",
        border:`1px solid ${hov?T.borderH:T.borderB}`,
        padding: isMobile ? "1.5rem" : "2.4rem",
        borderRadius: isMobile ? 20 : 26,
        backdropFilter:"blur(22px)",
        boxShadow: hov
          ? "0 45px 90px rgba(0,0,0,0.72),inset 0 1px 0 rgba(255,255,255,0.07)"
          : "0 18px 55px rgba(0,0,0,0.58),inset 0 1px 0 rgba(255,255,255,0.04)",
        transition:"border-color 0.35s,box-shadow 0.45s",
      }}>
        <motion.div animate={{ opacity:hov?1:0.4, scaleX:hov?1:0.5 }} transition={{ duration:0.45 }}
          style={{ position:"absolute", top:0, left:0, right:0, height:2, borderRadius:isMobile?"20px 20px 0 0":"26px 26px 0 0", background:`linear-gradient(90deg,transparent,${T.orange} 40%,${T.gold} 65%,transparent)`, transformOrigin:"center" }}/>
        {!isMobile && (
          <motion.div style={{ position:"absolute", inset:0, borderRadius:26, pointerEvents:"none", background:glareBg, opacity:hov?1:0, transition:"opacity 0.4s" }}/>
        )}
        {!isMobile && <>
          <div style={{ position:"absolute", top:14, right:14, width:20, height:20, borderTop:`1px solid rgba(232,98,42,${hov?0.5:0.14})`, borderRight:`1px solid rgba(232,98,42,${hov?0.5:0.14})`, borderRadius:"0 5px 0 0", transition:"border-color 0.3s" }}/>
          <div style={{ position:"absolute", bottom:14, left:14, width:20, height:20, borderBottom:`1px solid rgba(232,98,42,${hov?0.5:0.14})`, borderLeft:`1px solid rgba(232,98,42,${hov?0.5:0.14})`, borderRadius:"0 0 0 5px", transition:"border-color 0.3s" }}/>
        </>}

        <div style={{ position:"relative" }}>
          {/* Panel header */}
          <div style={{ marginBottom: isMobile ? "1.2rem" : "1.6rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.5rem" }}>
              <div style={{ width:20, height:2, background:`linear-gradient(to right,${T.orange},transparent)`, borderRadius:2 }}/>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.45rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.28em", color:T.orange }}>
                Tech Stack & Tools
              </span>
            </div>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color:T.muted, lineHeight:1.7, margin:0 }}>
              The tools I use to build immersive 3D and full-stack experiences.
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display:"flex", gap:4, marginBottom:"1.4rem", background:"rgba(255,255,255,0.025)", borderRadius:8, padding:4, border:"1px solid rgba(255,255,255,0.05)" }}>
            {SKILL_CATEGORIES.map((cat, i) => (
              <button key={i} onClick={() => setTab(i)} style={{
                flex:1, padding:"5px 0", border:"none", borderRadius:6, cursor:"pointer",
                fontFamily:"'Space Mono',monospace", fontSize:"0.38rem", fontWeight:700,
                letterSpacing:"0.14em", textTransform:"uppercase",
                background: activeTab===i ? "rgba(232,98,42,0.14)" : "transparent",
                color: activeTab===i ? T.orangeG : "rgba(242,238,248,0.28)",
                borderBottom: activeTab===i ? `1px solid rgba(232,98,42,0.4)` : "1px solid transparent",
                transition:"all 0.18s",
              }}>
                {cat.title.split(" & ")[0]}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity:0, y:6 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-6 }}
              transition={{ duration:0.22 }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.8rem" }}>
                <div style={{ width:20, height:20, borderRadius:5,
                  background: activeTab===0 ? "rgba(232,98,42,0.12)" : "rgba(232,98,42,0.08)",
                  border:`1px solid ${activeTab===0?"rgba(232,98,42,0.25)":"rgba(232,98,42,0.15)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {ICONS[SKILL_CATEGORIES[activeTab].icon]?.(10, activeTab===0 ? T.orange : "rgba(232,98,42,0.75)")}
                </div>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.44rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em", color: activeTab===0 ? "rgba(240,132,90,0.7)" : "rgba(255,255,255,0.48)" }}>
                  {SKILL_CATEGORIES[activeTab].title}
                </span>
                {activeTab === 0 && (
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.32rem", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", padding:"0.12rem 0.45rem", borderRadius:100, background:"rgba(232,98,42,0.1)", border:"1px solid rgba(232,98,42,0.28)", color:"rgba(240,132,90,0.85)" }}>
                    Primary
                  </span>
                )}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem" }}>
                {SKILL_CATEGORIES[activeTab].skills.map((skill, si) => (
                  <SkillTag key={skill} skill={skill} index={si} is3D={activeTab===0}/>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Availability */}
          <motion.div
            initial={{ opacity:0, y:10 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:false, amount:0.4 }}
            transition={{ duration:0.65 }}
            style={{ marginTop:"1.4rem", padding: isMobile?"0.85rem 1rem":"1rem 1.15rem", background:"rgba(34,197,94,0.048)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:12, display:"flex", alignItems:"center", gap:"0.85rem" }}>
            <span style={{ position:"relative", display:"flex", width:10, height:10, flexShrink:0 }}>
              <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:T.green, opacity:0.65, animation:"ping 1.6s cubic-bezier(0,0,0.2,1) infinite" }}/>
              <span style={{ position:"relative", width:10, height:10, borderRadius:"50%", background:T.green, boxShadow:"0 0 10px rgba(34,197,94,0.8)", display:"inline-flex" }}/>
            </span>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.4rem", textTransform:"uppercase", letterSpacing:"0.22em", color:"rgba(34,197,94,0.72)", fontWeight:700, marginBottom:2, marginTop:0 }}>Available Now</p>
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize: isMobile?"0.62rem":"0.68rem", color:"rgba(255,255,255,0.82)", fontWeight:500, margin:0, lineHeight:1.4 }}>
                Open to Full-time, Contract & Remote
              </p>
            </div>
          </motion.div>

          {/* Copy email */}
          <motion.button
            onClick={copyEmail}
            whileHover={{ scale:1.02 }}
            whileTap={{ scale:0.97 }}
            style={{
              marginTop:"0.8rem", width:"100%", padding:"0.75rem 1.2rem",
              borderRadius:8, border:`1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(232,98,42,0.2)"}`,
              background: copied ? "rgba(34,197,94,0.06)" : "rgba(232,98,42,0.04)",
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem",
              fontFamily:"'Space Mono',monospace", fontSize:"0.48rem", fontWeight:700,
              letterSpacing:"0.18em", textTransform:"uppercase",
              color: copied ? T.green : T.muted,
              transition:"all 0.25s",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span key={copied?"copied":"email"}
                initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-3 }}
                transition={{ duration:0.15 }}
              >
                {copied ? "✓ Copied!" : "✉ Copy Email"}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* CTA */}
          <Link to="/contact" style={{ textDecoration:"none" }}>
            <motion.div
              whileHover={{ scale:1.03, boxShadow:`0 18px 45px rgba(232,98,42,0.38)` }}
              whileTap={{ scale:0.97 }}
              style={{ marginTop:"0.75rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.55rem", padding: isMobile?"0.82rem 1.4rem":"0.9rem 1.6rem", borderRadius:6, background:`linear-gradient(135deg,${T.orange},${T.orangeD} 65%,#b03a0e)`, color:"#fff", fontFamily:"'Space Mono',monospace", fontSize: isMobile?"0.55rem":"0.58rem", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", boxShadow:`0 8px 28px rgba(232,98,42,0.28),inset 0 1px 0 rgba(255,255,255,0.18)`, cursor:"pointer", position:"relative", overflow:"hidden", width:"100%" }}>
              <span style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.1) 50%,transparent)", animation:"shimA 3.5s infinite" }}/>
              Let's Connect {ICONS.arrow(12)}
            </motion.div>
          </Link>
        </div>
      </CinematicSection>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════════════════════════ */
function SectionHeader({ isMobile }) {
  const headerRef = useRef(null);
  const isInView  = useInView(headerRef, { once:true, amount:0.25 });
  const { scrollYProgress } = useScroll({ target:headerRef, offset:["start end","end start"] });
  const y       = useTransform(scrollYProgress, [0,1], [40,-40]);
  const opacity = useTransform(scrollYProgress, [0,0.2,0.8,1], [0,1,1,0]);

  return (
    <motion.header ref={headerRef} style={{ opacity, marginBottom: isMobile?"3rem":"4.5rem", position:"relative" }}>
      <motion.div
        initial={{ opacity:0, x:-20 }}
        animate={isInView ? { opacity:1, x:0 } : { opacity:0, x:-20 }}
        transition={{ duration:0.75, ease:[0.16,1,0.3,1] }}
        style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom: isMobile?"1.5rem":"2rem", flexWrap:isMobile?"wrap":"nowrap" }}>
        {!isMobile && <div style={{ height:1, width:26, background:`linear-gradient(to right,transparent,${T.orange})`, flexShrink:0 }}/>}
        <div style={{ display:"inline-flex", alignItems:"center", gap:"0.46rem", padding:"0.32rem 0.9rem", borderRadius:100, background:"linear-gradient(135deg,rgba(232,98,42,0.1),rgba(232,98,42,0.04))", border:"1px solid rgba(232,98,42,0.28)", backdropFilter:"blur(12px)", boxShadow:"0 4px 14px rgba(232,98,42,0.08),inset 0 1px 0 rgba(255,255,255,0.04)" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:T.orange, boxShadow:`0 0 10px ${T.orange},0 0 18px ${T.orange}44`, display:"inline-block", animation:"ldp 2.2s infinite", flexShrink:0 }}/>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.46rem", fontWeight:700, letterSpacing:"0.26em", textTransform:"uppercase", color:"rgba(240,132,90,0.95)", whiteSpace:"nowrap" }}>About Me</span>
        </div>
        {!isMobile && <div style={{ height:1, flex:1, background:`linear-gradient(to right,${T.border},transparent)` }}/>}
      </motion.div>

      <div style={{ position:"relative" }}>
        <motion.div style={{ y: isMobile?0:y }}>
          <motion.h2
            initial={{ opacity:0, y:28 }}
            animate={isInView ? { opacity:1, y:0 } : { opacity:0, y:28 }}
            transition={{ duration:1.0, delay:0.16, ease:[0.16,1,0.3,1] }}
            style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: isMobile?"clamp(2.4rem,11vw,4rem)":"clamp(2.8rem,6.5vw,6.8rem)", fontWeight:400, lineHeight:0.88, letterSpacing:"0.02em", color:T.text, margin:0 }}>
            Crafting Worlds
            <br/>
            <span style={{ background:`linear-gradient(135deg,${T.okanA} 0%,${T.gold} 45%,${T.okanA} 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:`drop-shadow(0 0 18px rgba(184,103,42,0.28))` }}>
              In 3D & Code.
            </span>
          </motion.h2>
        </motion.div>
        {!isMobile && (
          <div style={{ position:"absolute", top:"-1rem", left:"-0.4rem", fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(5rem,14vw,13rem)", fontWeight:400, color:"rgba(232,98,42,0.03)", lineHeight:1, pointerEvents:"none", userSelect:"none", letterSpacing:"0.04em", whiteSpace:"nowrap" }}>
            3D
          </div>
        )}
      </div>

      <motion.div
        initial={{ scaleX:0 }}
        animate={isInView ? { scaleX:1 } : { scaleX:0 }}
        transition={{ duration:1.2, delay:0.42, ease:[0.16,1,0.3,1] }}
        style={{ position:"absolute", bottom: isMobile?"-1.6rem":"-2.2rem", left:0, right:0, height:1, background:`linear-gradient(90deg,${T.orange}55,${T.borderB} 60%,transparent)`, transformOrigin:"left" }}/>
    </motion.header>
  );
}

function FloatLine({ style }) {
  return (
    <motion.div
      animate={{ opacity:[0.35,0.7,0.35], scaleX:[0.96,1.04,0.96] }}
      transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
      style={{ height:1, background:`linear-gradient(90deg,transparent,${T.orange}44,transparent)`, ...style }}/>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN ABOUT
═══════════════════════════════════════════════════════════════ */
export default function About() {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmall,  setIsSmall]  = useState(false);

  const { scrollYProgress } = useScroll({ target:sectionRef, offset:["start end","end start"] });
  const bgOpacity = useTransform(scrollYProgress, [0,0.35,0.7,1], [0,1,1,0]);

  useEffect(() => {
    const check = () => { setIsMobile(window.innerWidth < 1100); setIsSmall(window.innerWidth < 480); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const monoSm = isSmall ? "0.6rem" : "0.68rem";

  return (
    <section id="about" ref={sectionRef}
      style={{
        position:"relative", background:T.bg, color:T.text, overflow:"hidden",
        borderTop:"1px solid rgba(232,98,42,0.08)",
        paddingTop:    isMobile ? "calc(var(--navbar-height,70px) + 4rem)"  : "calc(var(--navbar-height,70px) + 5.5rem)",
        paddingBottom: isMobile ? "4.5rem" : "6.5rem",
        paddingLeft:   isSmall  ? "4.5%"   : isMobile ? "5%"  : "6%",
        paddingRight:  isSmall  ? "4.5%"   : isMobile ? "5%"  : "6%",
      }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        .ag{display:grid;grid-template-columns:1fr 1fr;gap:4.5rem;align-items:start;}
        .ag-ach{display:grid;grid-template-columns:repeat(3,1fr);gap:0.8rem;}
        @media(max-width:1099px){
          .ag{grid-template-columns:1fr;gap:2.5rem;}
          .ag-sticky{position:static!important;top:auto!important;}
        }
        @media(max-width:640px){
          .ag-ach{grid-template-columns:1fr 1fr;gap:0.6rem;}
          .ag-ach>*:last-child:nth-child(odd){grid-column:1/-1;}
        }
        @media(max-width:380px){.ag-ach{grid-template-columns:1fr;}}
        @keyframes ping  {75%,100%{transform:scale(2.2);opacity:0;}}
        @keyframes ldp   {0%,100%{opacity:1;transform:scale(1);}50%{opacity:.22;transform:scale(.6);}}
        @keyframes shimA {0%{transform:translateX(-120%);}100%{transform:translateX(320%);}}
      `}</style>

      <AboutThreeScene isMobile={isMobile}/>
      <NoiseOverlay/>

      <motion.div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", opacity:bgOpacity, zIndex:0 }}>
        <div style={{ position:"absolute", top:"-10%", left:"20%", width:"55vw", height:"55vw", borderRadius:"50%", background:"radial-gradient(circle,rgba(232,98,42,0.055) 0%,transparent 65%)", filter:"blur(90px)" }}/>
        <div style={{ position:"absolute", bottom:"-5%", right:"5%", width:"38vw", height:"38vw", borderRadius:"50%", background:"radial-gradient(circle,rgba(100,60,200,0.035) 0%,transparent 65%)", filter:"blur(70px)" }}/>
        <div style={{ position:"absolute", top:"42%", left:"-5%", width:"28vw", height:"28vw", borderRadius:"50%", background:"radial-gradient(circle,rgba(212,146,58,0.04) 0%,transparent 65%)", filter:"blur(55px)" }}/>
      </motion.div>

      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.014) 1px,transparent 1px)", backgroundSize:"68px 68px", maskImage:"radial-gradient(ellipse 85% 65% at 50% 20%,black 35%,transparent 100%)" }}/>
      {!isMobile && <div style={{ position:"absolute", top:0, left:"38%", width:1, height:"100%", background:"linear-gradient(to bottom,transparent,rgba(232,98,42,0.09) 45%,transparent)", transform:"rotate(-8deg)", pointerEvents:"none", zIndex:0 }}/>}

      <FloatLine style={{ position:"absolute", top:"32%", left:0, right:0, zIndex:0 }}/>
      <FloatLine style={{ position:"absolute", top:"70%", left:0, right:0, zIndex:0, opacity:0.5 }}/>

      {/* ── Ticker ── */}
      <div style={{ position:"absolute", top:"calc(var(--navbar-height,70px) + 0.5rem)", left:0, right:0, zIndex:4 }}>
        <Ticker />
      </div>

      <div style={{ maxWidth:1400, margin:"0 auto", position:"relative", zIndex:10 }}>
        <SectionHeader isMobile={isMobile}/>

        <div style={{ marginTop: isMobile?"3.5rem":"5rem" }} className="ag">

          {/* LEFT: bio + stats + timeline + achievements */}
          <div style={{ display:"flex", flexDirection:"column", gap: isMobile?"2rem":"2.8rem" }}>

            {/* Bio */}
            <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
              <CinematicParagraph style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize: isSmall?"clamp(1.1rem,5.5vw,1.4rem)":"clamp(1.2rem,2.2vw,1.6rem)",
                fontWeight:400, letterSpacing:"0.04em",
                color:"rgba(242,238,248,0.9)", lineHeight:1.4, margin:0,
              }}>
                I'm a{" "}
                <span style={{ color:T.text }}>3D Web Developer & Full-Stack Engineer</span>
                {" "}specialising in{" "}
                <span style={{ background:`linear-gradient(135deg,${T.orange},${T.gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  Three.js, WebGL & React
                </span>
                .
              </CinematicParagraph>

              <div style={{ display:"flex", flexDirection:"column", gap:"0.9rem" }}>
                <CinematicParagraph delay={0.07}
                  style={{ fontFamily:"'Space Mono',monospace", fontSize:monoSm, color:T.muted, lineHeight:1.9, margin:0 }}>
                  I build{" "}
                  <span style={{ color:"rgba(240,132,90,0.85)" }}>immersive 3D experiences for the web</span>
                  {" "}— interactive product visualisers, WebGL environments, shader-driven effects — and back them with full-stack architecture that actually ships.
                </CinematicParagraph>
                <CinematicParagraph delay={0.13}
                  style={{ fontFamily:"'Space Mono',monospace", fontSize:monoSm, color:T.muted, lineHeight:1.9, margin:0 }}>
                  On the backend I design and consume{" "}
                  <span style={{ color:"rgba(240,132,90,0.85)" }}>RESTful APIs</span>
                  , manage data flow and auth, and integrate third-party services. I care deeply about{" "}
                  <span style={{ color:"rgba(240,132,90,0.85)" }}>performance, render budgets and maintainability</span>.
                </CinematicParagraph>
                <CinematicParagraph delay={0.19}
                  style={{ fontFamily:"'Space Mono',monospace", fontSize:monoSm, color:T.muted, lineHeight:1.9, margin:0 }}>
                  I turn concepts into{" "}
                  <span style={{ color:"rgba(240,132,90,0.85)" }}>things people can feel</span>
                  {" "}— experiences that blur the line between a website and a world.
                </CinematicParagraph>
                <CinematicParagraph delay={0.25}
                  style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: isSmall?"0.85rem":"0.95rem", fontWeight:400, letterSpacing:"0.07em", color:T.faint, lineHeight:1.65, borderLeft:`2px solid rgba(232,98,42,0.2)`, paddingLeft:"1.1rem", margin:0 }}>
                  The web is a 3D canvas. Most developers only use two dimensions — I use all three.
                </CinematicParagraph>
              </div>
            </div>

            {/* Stat strip */}
            <StatStrip isMobile={isMobile} />

            {/* Timeline */}
            <Timeline isMobile={isMobile} />

            {/* Achievements */}
            <CinematicSection style={{ display:"flex", flexDirection:"column", gap:"0.8rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.1rem" }}>
                <div style={{ width:18, height:2, background:`linear-gradient(to right,${T.orange},transparent)`, borderRadius:2 }}/>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.42rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.3em", color:T.faint }}>Key Metrics</span>
              </div>
              <div className="ag-ach">
                {ACHIEVEMENTS.map((item, i) => (
                  <AchievementCard key={i} item={item} index={i} isMobile={isMobile}/>
                ))}
              </div>
            </CinematicSection>
          </div>

          {/* RIGHT: sticky skills panel */}
          <div className="ag-sticky" style={{ position:"sticky", top:"7rem" }}>
            <SkillsPanel isMobile={isMobile}/>
          </div>

        </div>
      </div>
    </section>
  );
}
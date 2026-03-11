import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  motion, AnimatePresence,
  useScroll, useTransform, useSpring, useMotionValue,
} from "framer-motion";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════ */
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
  faint:   "rgba(242,238,248,0.08)",
  border:  "rgba(232,98,42,0.16)",
  borderB: "rgba(255,255,255,0.055)",
};

/* ═══════════════════════════════════════════════════════════════
   CUSTOM CURSOR (desktop only)
═══════════════════════════════════════════════════════════════ */
function CustomCursor() {
  const dot  = useRef(null);
  const ring = useRef(null);
  const pos  = useRef({ x:0, y:0 });
  const rpos = useRef({ x:0, y:0 });

  useEffect(() => {
    const onMove = e => {
      pos.current = { x:e.clientX, y:e.clientY };
      if (dot.current) dot.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    };
    window.addEventListener("mousemove", onMove);
    let raf;
    const lerp = (a,b,t) => a+(b-a)*t;
    const tick = () => {
      rpos.current.x = lerp(rpos.current.x, pos.current.x, 0.12);
      rpos.current.y = lerp(rpos.current.y, pos.current.y, 0.12);
      if (ring.current) ring.current.style.transform = `translate(${rpos.current.x}px,${rpos.current.y}px)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dot}  style={{ position:"fixed", top:-4,  left:-4,  width:8,  height:8,  borderRadius:"50%", background:T.orange, pointerEvents:"none", zIndex:9999, boxShadow:`0 0 12px ${T.orange},0 0 24px ${T.orange}55`, willChange:"transform" }}/>
      <div ref={ring} style={{ position:"fixed", top:-20, left:-20, width:40, height:40, borderRadius:"50%", border:`1px solid rgba(232,98,42,0.55)`, pointerEvents:"none", zIndex:9998, willChange:"transform" }}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE INTRO VEIL
   Dark overlay with animating wireframe knot + progress bar.
   Fades out once the Three.js scene signals onReady().
═══════════════════════════════════════════════════════════════ */
function SceneIntro({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="scene-intro"
          initial={{ opacity:1 }}
          exit={{ opacity:0, transition:{ duration:0.9, ease:"easeInOut" } }}
          style={{ position:"absolute", inset:0, zIndex:50, background:"#010103", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1.4rem", pointerEvents:"none" }}>

          {/* Spinning wireframe SVG knot */}
          <motion.svg width="80" height="80" viewBox="0 0 80 80" fill="none"
            animate={{ rotate:360 }}
            transition={{ duration:3, repeat:Infinity, ease:"linear" }}>
            <motion.circle cx="40" cy="40" r="28" stroke={T.orange} strokeWidth="1" strokeDasharray="8 6" fill="none" opacity="0.5"
              animate={{ strokeDashoffset:[0,-56] }} transition={{ duration:2, repeat:Infinity, ease:"linear" }}/>
            <motion.circle cx="40" cy="40" r="18" stroke={T.gold} strokeWidth="0.8" strokeDasharray="5 4" fill="none" opacity="0.4"
              animate={{ strokeDashoffset:[0,36] }} transition={{ duration:1.4, repeat:Infinity, ease:"linear" }}/>
            <motion.path d="M40 12 C52 20 68 28 60 40 C52 52 28 52 20 40 C12 28 28 20 40 12Z"
              stroke={T.orangeG} strokeWidth="0.8" fill="none" opacity="0.35"
              animate={{ pathLength:[0,1,0] }} transition={{ duration:2.4, repeat:Infinity, ease:"easeInOut" }}/>
            <motion.circle cx="40" cy="40" r="4" fill={T.orange} opacity="0.9"
              animate={{ scale:[1,1.6,1], opacity:[0.9,0.3,0.9] }} transition={{ duration:1.1, repeat:Infinity, ease:"easeInOut" }}/>
          </motion.svg>

          {/* Progress bar */}
          <div style={{ width:140, height:1.5, background:"rgba(255,255,255,0.06)", borderRadius:100, overflow:"hidden" }}>
            <motion.div
              initial={{ width:"0%" }} animate={{ width:"100%" }}
              transition={{ duration:1.6, ease:[0.16,1,0.3,1] }}
              style={{ height:"100%", background:`linear-gradient(90deg,${T.orange},${T.gold})`, borderRadius:100, boxShadow:`0 0 10px ${T.orange}55` }}/>
          </div>

          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.4rem", letterSpacing:"0.38em", textTransform:"uppercase", color:"rgba(255,255,255,0.22)" }}>
            Initialising Scene
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THREE.JS SCENE
═══════════════════════════════════════════════════════════════ */
function ThreeScene({ isMobile, scrollY, onReady }) {
  const mountRef  = useRef(null);
  const mouseRef  = useRef({ x:0, y:0 });
  const scrollRef = useRef(0);

  useEffect(() => scrollY.on("change", v => { scrollRef.current = v; }), [scrollY]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias:!isMobile, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.2 : 1.8));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth/el.clientHeight, 0.1, 300);
    camera.position.set(0, 0, 14); // starts far, drifts to z=8

    scene.fog = new THREE.FogExp2(0x010103, 0.028);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.06));
    const keyL  = new THREE.PointLight(0xe8622a, 12, 28); keyL.position.set(5,4,6);    keyL.castShadow = !isMobile; scene.add(keyL);
    const fillL = new THREE.PointLight(0xd4923a, 6,  22); fillL.position.set(-6,-2,3); scene.add(fillL);
    const rimL  = new THREE.PointLight(0xff4400, 4,  18); rimL.position.set(0,6,-4);   scene.add(rimL);
    const coolL = new THREE.PointLight(0x1a0aff, 2,  16); coolL.position.set(-4,3,2);  scene.add(coolL);
    const backL = new THREE.DirectionalLight(0xf0845a, 0.8); backL.position.set(-4,3,5); scene.add(backL);

    // ── Hero torus knot — starts invisible & tiny ──
    const heroKnotGeo = new THREE.TorusKnotGeometry(1.55, 0.48, isMobile?160:256, isMobile?20:28, 3, 5);
    const heroKnotMat = new THREE.MeshPhysicalMaterial({
      color:0xe8622a, metalness:1.0, roughness:0.04, reflectivity:1.0,
      clearcoat:1.0, clearcoatRoughness:0.06, transparent:true, opacity:0.0, envMapIntensity:1.2,
    });
    const heroKnot = new THREE.Mesh(heroKnotGeo, heroKnotMat);
    heroKnot.castShadow = !isMobile;
    heroKnot.position.set(isMobile?0:3.2, isMobile?1.2:0.2, -2);
    heroKnot.scale.setScalar(0.01);
    scene.add(heroKnot);

    const heroWireMat = new THREE.MeshBasicMaterial({ color:0xf0845a, wireframe:true, transparent:true, opacity:0.0 });
    const heroWire = new THREE.Mesh(heroKnotGeo, heroWireMat);
    heroWire.position.copy(heroKnot.position); heroWire.scale.copy(heroKnot.scale); scene.add(heroWire);

    const innerKnotGeo = new THREE.TorusKnotGeometry(1.1, 0.2, isMobile?100:160, 18, 2, 3);
    const innerKnotMat = new THREE.MeshBasicMaterial({ color:0xd4923a, wireframe:true, transparent:true, opacity:0.0 });
    const innerKnot = new THREE.Mesh(innerKnotGeo, innerKnotMat);
    innerKnot.position.copy(heroKnot.position); innerKnot.scale.copy(heroKnot.scale); scene.add(innerKnot);

    // ── Halo rings ──
    const ringMat  = new THREE.MeshBasicMaterial({ color:0xe8622a, transparent:true, opacity:0.0 });
    const haloRing = new THREE.Mesh(new THREE.TorusGeometry(2.8,0.012,8,180), ringMat);
    haloRing.position.copy(heroKnot.position); haloRing.rotation.x = Math.PI/2.4; scene.add(haloRing);

    const ring2Mat  = new THREE.MeshBasicMaterial({ color:0xd4923a, transparent:true, opacity:0.0 });
    const haloRing2 = new THREE.Mesh(new THREE.TorusGeometry(3.4,0.008,8,180), ring2Mat);
    haloRing2.position.copy(heroKnot.position); haloRing2.rotation.x = Math.PI/2; haloRing2.rotation.z = 0.4; scene.add(haloRing2);

    // ── Floating accent shapes ──
    const floaters = [];
    const addF = (geo, color, x, y, z, scale, tOp, rs, metal=0.88, rough=0.12) => {
      const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color, metalness:metal, roughness:rough, transparent:true, opacity:0.0, clearcoat:0.6, clearcoatRoughness:0.1 }));
      m.scale.setScalar(scale); m.position.set(x,y,z); m.castShadow = !isMobile; scene.add(m);
      floaters.push({ mesh:m, rotSpeed:rs, phase:Math.random()*Math.PI*2, floatSpeed:0.22+Math.random()*0.45, floatAmp:0.05+Math.random()*0.09, axis:new THREE.Vector3(Math.random(),Math.random(),Math.random()).normalize(), originY:y, tOp });
    };
    addF(new THREE.IcosahedronGeometry(0.7,1),   0xd4923a, -4.5, 1.6,-3,   1,   0.75, 0.007);
    addF(new THREE.OctahedronGeometry(0.5),       0xe8622a,  5.8,-1.2,-4,   1,   0.65, 0.011);
    addF(new THREE.TetrahedronGeometry(0.48),     0xf0845a, -3.2,-2.8,-2,   1,   0.6,  0.014);
    addF(new THREE.IcosahedronGeometry(0.32,0),   0xb8672a, -1.5, 3.8,-2.5, 1,   0.5,  0.018);
    addF(new THREE.DodecahedronGeometry(0.42),    0xc8763a,  6.2, 2.0,-4,   0.9, 0.55, 0.009);
    addF(new THREE.OctahedronGeometry(0.26),      0xf0845a,  0.8,-3.5,-1.5, 1,   0.5,  0.02);
    addF(new THREE.TorusKnotGeometry(0.6,0.19,isMobile?80:120,14,2,3), 0xd4923a, -5.5,3.0,-5, 0.85, 0.42, 0.008, 0.95, 0.08);

    // ── Point cloud ──
    const ptCount = isMobile ? 400 : 1400;
    const ptPos   = new Float32Array(ptCount*3);
    const ptCol   = new Float32Array(ptCount*3);
    for (let i=0; i<ptCount; i++) {
      const r=8+Math.random()*14, th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
      ptPos[i*3]=r*Math.sin(ph)*Math.cos(th); ptPos[i*3+1]=r*Math.sin(ph)*Math.sin(th); ptPos[i*3+2]=r*Math.cos(ph);
      const b=Math.random(); ptCol[i*3]=0.91+b*0.09; ptCol[i*3+1]=0.38+b*0.19; ptCol[i*3+2]=0.16+b*0.05;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos,3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol,3));
    const ptMat = new THREE.PointsMaterial({ size:isMobile?0.02:0.03, vertexColors:true, transparent:true, opacity:0.0, sizeAttenuation:true });
    const points = new THREE.Points(ptGeo, ptMat);
    scene.add(points);

    // ── Tendrils (desktop only) ──
    const tendrils = [];
    if (!isMobile) {
      for (let i=0; i<12; i++) {
        const a=(i/12)*Math.PI*2, sp=1.8+Math.random()*1.4;
        const end=new THREE.Vector3(Math.cos(a)*sp, Math.sin(a)*sp, (Math.random()-0.5)*1.2);
        const tMat=new THREE.LineBasicMaterial({ color:0xe8622a, transparent:true, opacity:0.0 });
        const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),end]), tMat);
        line.position.copy(heroKnot.position); scene.add(line);
        tendrils.push({ tMat, baseOp:0.08+Math.random()*0.1 });
      }
    }

    // ── Grid floor ──
    const grid = new THREE.GridHelper(50,48,0xe8622a,0xe8622a);
    grid.material.transparent=true; grid.material.opacity=0.0; grid.position.set(0,-5.5,-4); scene.add(grid);

    // ── Resize ──
    const onResize = () => { if(!el)return; camera.aspect=el.clientWidth/el.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth,el.clientHeight); };
    window.addEventListener("resize", onResize);

    // ── Desktop mouse ──
    const onMouse = e => { mouseRef.current.x=(e.clientX/window.innerWidth-0.5)*2; mouseRef.current.y=(e.clientY/window.innerHeight-0.5)*2; };
    window.addEventListener("mousemove", onMouse);

    // ── Mobile gyroscope — deviceorientation gives beta/gamma tilt ──
    // gamma = left-right tilt (-90→90), beta = front-back tilt (0→180)
    // We clamp to ±30° and normalise to -1→1 for consistent parallax feel
    const gyroRef = { x:0, y:0 };
    const onGyro = e => {
      if (!isMobile) return;
      const gx = Math.max(-30, Math.min(30, e.gamma ?? 0)) / 30; // side tilt → x
      const gy = Math.max(-30, Math.min(30, (e.beta ?? 0) - 45)) / 30; // forward tilt → y (offset 45° for natural hold angle)
      // Smooth gyro input to avoid jitter
      gyroRef.x += (gx - gyroRef.x) * 0.08;
      gyroRef.y += (gy - gyroRef.y) * 0.08;
      mouseRef.current.x = gyroRef.x;
      mouseRef.current.y = gyroRef.y;
    };
    // iOS 13+ requires permission — request it if the API needs it
    if (isMobile) {
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission().then(s => { if (s==="granted") window.addEventListener("deviceorientation", onGyro); }).catch(()=>{});
      } else {
        window.addEventListener("deviceorientation", onGyro);
      }
    }

    // ── Animation loop ──
    let raf, introT=0, readyFired=false;
    const clock=new THREE.Clock();
    const camT=new THREE.Vector3();
    const fadeTo=(mat,target,spd=0.035)=>{ mat.opacity+=(target-mat.opacity)*spd; };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      introT = Math.min(introT+0.007, 1);
      const eased = 1-Math.pow(1-introT,4);

      // Signal React once scene is sufficiently visible
      if (!readyFired && introT > 0.4) { readyFired=true; onReady?.(); }

      // Hero knot — mobile spins faster and breathes more dramatically
      const bs = (isMobile?0.72:0.92)*eased;
      const br = 1+Math.sin(t*0.9)*(isMobile?0.032:0.015);
      heroKnot.rotation.x=t*(isMobile?0.18:0.11); heroKnot.rotation.y=t*(isMobile?0.14:0.08); heroKnot.rotation.z=t*(isMobile?0.07:0.04);
      heroKnot.scale.setScalar(bs*br);
      fadeTo(heroKnotMat, 0.88*eased, 0.04);
      heroWire.rotation.copy(heroKnot.rotation); heroWire.scale.copy(heroKnot.scale);
      fadeTo(heroWireMat, (0.035+Math.sin(t*1.4)*0.02)*eased, 0.04);
      innerKnot.rotation.x=-t*0.07; innerKnot.rotation.y=t*0.13; innerKnot.scale.copy(heroKnot.scale);
      fadeTo(innerKnotMat, 0.035*eased, 0.04);

      // Halos
      haloRing.rotation.z=t*0.04; haloRing.rotation.y=t*0.015;
      haloRing2.rotation.z=-t*0.03; haloRing2.rotation.x=Math.PI/2+Math.sin(t*0.25)*0.15;
      fadeTo(ringMat,  (0.15+Math.sin(t*0.6)*0.07)*eased,  0.03);
      fadeTo(ring2Mat, (0.08+Math.sin(t*0.4+1)*0.04)*eased, 0.03);

      // Floaters
      floaters.forEach(({mesh,rotSpeed,phase,floatSpeed,floatAmp,axis,originY,tOp})=>{
        mesh.rotateOnAxis(axis,rotSpeed);
        mesh.position.y = originY+Math.sin(t*floatSpeed+phase)*floatAmp;
        fadeTo(mesh.material, tOp*eased, 0.025);
      });

      // Tendrils
      tendrils.forEach(({tMat,baseOp},i)=>{ fadeTo(tMat, baseOp*(0.6+Math.sin(t*1.8+i*0.7)*0.4)*eased, 0.03); });

      // Points
      fadeTo(ptMat, 0.6*eased, 0.03);
      points.rotation.y=t*0.012; points.rotation.x=t*0.005;

      // Grid
      fadeTo(grid.material, 0.028*eased, 0.03);

      // Lights
      keyL.position.x=Math.sin(t*0.35)*6;  keyL.position.y=Math.cos(t*0.22)*4+2; keyL.intensity=10+Math.sin(t*1.1)*2;
      fillL.position.x=Math.cos(t*0.28)*7; fillL.position.z=Math.sin(t*0.19)*5;
      rimL.position.x=Math.sin(t*0.17+1.5)*6; rimL.position.z=Math.cos(t*0.23+0.8)*4;
      coolL.position.x=Math.cos(t*0.31+0.5)*5; coolL.position.y=Math.sin(t*0.14)*4+2;

      // Camera — mobile now uses gyro via mouseRef (same values, populated by onGyro)
      const sp = Math.min(scrollRef.current/700,1);
      const camZ = 14-eased*6;
      if (!isMobile) {
        camT.x=mouseRef.current.x*0.55; camT.y=-mouseRef.current.y*0.38+sp*-2; camT.z=camZ+sp*3;
      } else {
        // gyro feeds mouseRef.current — use same strength as desktop for strong feel
        camT.x=mouseRef.current.x*0.55; camT.y=-mouseRef.current.y*0.38+sp*-2.8; camT.z=camZ+sp*2;
      }
      camera.position.x+=(camT.x-camera.position.x)*(isMobile?0.08:0.05);
      camera.position.y+=(camT.y-camera.position.y)*(isMobile?0.08:0.05);
      camera.position.z+=(camT.z-camera.position.z)*(isMobile?0.06:0.04);
      camera.lookAt(isMobile?0:1.2, 0, 0);

      renderer.render(scene,camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("deviceorientation", onGyro);
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
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:3, opacity:0.028, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat:"repeat", backgroundSize:"128px" }}/>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER — 3D-focused roles
═══════════════════════════════════════════════════════════════ */
const ROLES = [
  "3D Web Developer",
  "WebGL Engineer",
  "Three.js Specialist",
  "Full-Stack Craftsman",
  "Creative Technologist",
];

function Typewriter() {
  const [roleIdx,   setRoleIdx]   = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase,     setPhase]     = useState("typing");

  useEffect(() => {
    const target = ROLES[roleIdx];
    let timer;
    if (phase==="typing") {
      if (displayed.length < target.length) timer = setTimeout(()=>setDisplayed(target.slice(0,displayed.length+1)),68);
      else timer = setTimeout(()=>setPhase("pausing"),1900);
    } else if (phase==="pausing") {
      timer = setTimeout(()=>setPhase("deleting"),400);
    } else {
      if (displayed.length>0) timer = setTimeout(()=>setDisplayed(displayed.slice(0,-1)),36);
      else { setRoleIdx(i=>(i+1)%ROLES.length); setPhase("typing"); }
    }
    return ()=>clearTimeout(timer);
  },[displayed,phase,roleIdx]);

  return (
    <span style={{ color:T.text }}>
      {displayed}
      <motion.span animate={{ opacity:[1,0] }} transition={{ duration:0.55, repeat:Infinity, repeatType:"reverse" }}
        style={{ display:"inline-block", width:2, height:"0.85em", background:T.orange, marginLeft:3, verticalAlign:"middle", borderRadius:1 }}/>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AVAILABILITY BADGE
═══════════════════════════════════════════════════════════════ */
function AvailBadge() {
  return (
    <motion.div initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3,duration:0.65 }}
      style={{ display:"inline-flex", alignItems:"center", gap:"0.45rem", padding:"0.3rem 0.85rem", borderRadius:100, alignSelf:"flex-start", background:"linear-gradient(135deg,rgba(34,197,94,0.09),rgba(34,197,94,0.03))", border:"1px solid rgba(34,197,94,0.24)", backdropFilter:"blur(12px)" }}>
      <motion.span animate={{ opacity:[1,0.2,1],scale:[1,0.65,1] }} transition={{ duration:2.1,repeat:Infinity }}
        style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e",display:"inline-block",flexShrink:0 }}/>
      <span style={{ fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.34rem,0.9vw,0.42rem)",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(134,239,172,0.9)",fontWeight:700 }}>
        Available for hire
      </span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKILL BARS  — rendered on ALL screen sizes
   Three.js listed FIRST and HIGHEST — consistent with specialty
═══════════════════════════════════════════════════════════════ */
const SKILL_BARS = [
  { label:"Three.js / WebGL", pct:92, color:T.orange  },
  { label:"React / Next.js",  pct:88, color:T.gold    },
  { label:"Node / Backend",   pct:80, color:T.orangeG },
];

function SkillBars({ isMobile }) {
  const [started, setStarted] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setStarted(true),1400); return()=>clearTimeout(t); },[]);

  return (
    <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.3,duration:0.65 }}
      style={{ padding:isMobile?"0.7rem 0.88rem":"0.85rem 1rem", borderRadius:14, background:"linear-gradient(135deg,rgba(255,255,255,0.025),rgba(255,255,255,0.008))", border:"1px solid rgba(255,255,255,0.05)", display:"flex", flexDirection:"column", gap:"0.55rem" }}>
      <span style={{ fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.3rem,0.8vw,0.36rem)",textTransform:"uppercase",letterSpacing:"0.22em",color:"rgba(232,98,42,0.55)" }}>Core Expertise</span>
      {SKILL_BARS.map(({label,pct,color})=>(
        <div key={label}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"0.2rem" }}>
            <span style={{ fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.32rem,0.85vw,0.38rem)",textTransform:"uppercase",letterSpacing:"0.16em",color:T.muted }}>{label}</span>
            <span style={{ fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.32rem,0.85vw,0.38rem)",color,fontWeight:700 }}>{pct}%</span>
          </div>
          <div style={{ height:2.5,borderRadius:100,background:"rgba(255,255,255,0.05)",overflow:"hidden" }}>
            <motion.div initial={{ width:0 }} animate={{ width:started?`${pct}%`:0 }} transition={{ duration:1.3,ease:[0.16,1,0.3,1],delay:0.15 }}
              style={{ height:"100%",borderRadius:100,background:`linear-gradient(90deg,${color},${T.orangeG})`,boxShadow:`0 0 10px ${color}55` }}/>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE CARD 3D
═══════════════════════════════════════════════════════════════ */
function ProfileCard3D({ time, isMobile }) {
  const ref     = useRef(null);
  const mx      = useMotionValue(0);
  const my      = useMotionValue(0);
  const rotX    = useSpring(useTransform(my,[-0.5,0.5],["14deg","-14deg"]),{stiffness:60,damping:13});
  const rotY    = useSpring(useTransform(mx,[-0.5,0.5],["-14deg","14deg"]),{stiffness:60,damping:13});
  const glareX  = useTransform(mx,[-0.5,0.5],["0%","100%"]);
  const glareY  = useTransform(my,[-0.5,0.5],["0%","100%"]);
  const glareBg = useTransform([glareX,glareY],l=>`radial-gradient(circle at ${l[0]} ${l[1]},rgba(255,255,255,0.1) 0%,transparent 55%)`);
  const shadowX   = useTransform(mx,[-0.5,0.5],[-28,28]);
  const shadowY   = useTransform(my,[-0.5,0.5],[-18,18]);
  const dynShadow = useTransform([shadowX,shadowY],l=>`${l[0]}px ${l[1]}px 80px rgba(0,0,0,0.9),0 0 0 1px rgba(232,98,42,0.14),0 0 55px rgba(232,98,42,0.12)`);
  const [hov,setHov]=useState(false);
  const [scanned,setScanned]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setScanned(true),1700);return()=>clearTimeout(t);},[]);

  function handleMove(e) {
    if(isMobile)return;
    const r=ref.current?.getBoundingClientRect();
    if(r){mx.set((e.clientX-r.left)/r.width-0.5);my.set((e.clientY-r.top)/r.height-0.5);}
  }

  return (
    <motion.div ref={ref} onMouseMove={handleMove}
      onMouseEnter={()=>{if(!isMobile)setHov(true);}} onMouseLeave={()=>{mx.set(0);my.set(0);setHov(false);}}
      initial={{ opacity:0,scale:0.78,y:50,rotateX:12 }} animate={{ opacity:1,scale:1,y:0,rotateX:0 }}
      transition={{ duration:1.15,delay:0.4,ease:[0.16,1,0.3,1] }}
      style={{ rotateX:isMobile?0:rotX, rotateY:isMobile?0:rotY, transformStyle:"preserve-3d", perspective:"1200px", position:"relative", width:isMobile?"clamp(190px,58vw,255px)":"clamp(235px,21vw,300px)", cursor:"default", boxShadow:isMobile?undefined:dynShadow, margin:"0 auto" }}>

      <motion.div animate={{opacity:hov?1:0.6,scale:hov?1.1:1}} transition={{duration:0.9}}
        style={{position:"absolute",inset:-36,borderRadius:44,background:"radial-gradient(ellipse,rgba(232,98,42,0.24) 0%,rgba(232,98,42,0.05) 55%,transparent 70%)",filter:"blur(28px)",pointerEvents:"none",zIndex:-1}}/>
      <div style={{position:"absolute",inset:-8, borderRadius:34,border:"1px solid rgba(232,98,42,0.1)", transform:"rotate(3.5deg) scale(1.01)",background:"rgba(232,98,42,0.012)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:-16,borderRadius:38,border:"1px solid rgba(232,98,42,0.05)",transform:"rotate(-2deg) scale(1.01)",pointerEvents:"none"}}/>

      <div style={{position:"relative",padding:5,borderRadius:26,background:"linear-gradient(148deg,rgba(255,255,255,0.09),rgba(255,255,255,0.015))",border:"1px solid rgba(255,255,255,0.09)",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.1)",backdropFilter:"blur(24px)"}}>
        <motion.div style={{position:"absolute",inset:0,borderRadius:26,pointerEvents:"none",zIndex:12,background:glareBg,opacity:hov?1:0,transition:"opacity 0.4s"}}/>

        {/* Corner brackets */}
        {["tl","tr","bl","br"].map(c=>(
          <div key={c} style={{position:"absolute",width:17,height:17,zIndex:14,top:c[0]==="t"?15:undefined,bottom:c[0]==="b"?15:undefined,left:c[1]==="l"?15:undefined,right:c[1]==="r"?15:undefined,borderTop:c[0]==="t"?`1.5px solid ${T.orange}`:undefined,borderBottom:c[0]==="b"?`1.5px solid ${T.orange}`:undefined,borderLeft:c[1]==="l"?`1.5px solid ${T.orange}`:undefined,borderRight:c[1]==="r"?`1.5px solid ${T.orange}`:undefined,opacity:hov?0.85:0.28,transition:"opacity 0.3s"}}/>
        ))}

        <AnimatePresence>
          {scanned&&(<motion.div key="scan" initial={{top:"-6%"}} animate={{top:"108%"}} exit={{opacity:0}} transition={{duration:1.8,ease:"easeIn"}}
            style={{position:"absolute",left:0,right:0,height:"9%",background:"linear-gradient(to bottom,transparent,rgba(232,98,42,0.07) 40%,rgba(232,98,42,0.1) 50%,rgba(232,98,42,0.07) 60%,transparent)",pointerEvents:"none",zIndex:14,borderRadius:26}}/>)}
        </AnimatePresence>

        <div style={{position:"relative",borderRadius:22,overflow:"hidden"}}>
          <img src="/profile41.jpeg" alt="Perpetual Okan" style={{width:"100%",aspectRatio:"4/5",objectFit:"cover",display:"block",filter:hov?"saturate(1.3) brightness(1.06)":"saturate(1.05)",transform:hov?"scale(1.05)":"scale(1)",transition:"all 0.9s cubic-bezier(0.16,1,0.3,1)"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(232,98,42,0.04) 0%,transparent 30%,rgba(1,1,3,0.65) 100%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",inset:0,boxShadow:"inset 0 0 0 1px rgba(232,98,42,0.1)",borderRadius:22,pointerEvents:"none"}}/>
        </div>

        {/* Pill — now shows "3D / Full-Stack" to reinforce specialty */}
        <div style={{position:"absolute",top:"0.7rem",left:"0.7rem",background:"rgba(1,1,3,0.82)",backdropFilter:"blur(20px)",border:"1px solid rgba(232,98,42,0.34)",borderRadius:100,padding:"0.25rem 0.65rem",display:"flex",alignItems:"center",gap:"0.35rem"}}>
          <motion.span animate={{opacity:[1,0.2,1],scale:[1,0.65,1]}} transition={{duration:2.1,repeat:Infinity}}
            style={{width:5,height:5,borderRadius:"50%",background:T.orange,boxShadow:`0 0 8px ${T.orange}`,display:"inline-block",flexShrink:0}}/>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.3rem,0.75vw,0.38rem)",fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:"rgba(255,255,255,0.88)"}}>3D / Full-Stack</span>
        </div>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8}}
          style={{position:"absolute",bottom:"0.9rem",left:"0.9rem"}}>
          <p style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.28rem,0.65vw,0.34rem)",color:"rgba(255,255,255,0.28)",margin:0,letterSpacing:"0.18em",textTransform:"uppercase"}}>PORTFOLIO 2025</p>
        </motion.div>
      </div>

      {/* Clock badge */}
      <motion.div initial={{opacity:0,x:isMobile?0:20,y:10}} animate={{opacity:1,x:0,y:0}} transition={{delay:1.25,duration:0.85,ease:[0.16,1,0.3,1]}}
        style={{position:"absolute",bottom:isMobile?-22:-30,right:isMobile?-8:-22,zIndex:20,background:"linear-gradient(135deg,rgba(7,7,13,0.97),rgba(12,10,20,0.97))",backdropFilter:"blur(28px)",border:"1px solid rgba(232,98,42,0.26)",borderRadius:isMobile?13:16,padding:isMobile?"0.52rem 0.78rem":"0.78rem 1.1rem",display:"flex",alignItems:"center",gap:"0.6rem",boxShadow:"0 18px 50px rgba(0,0,0,0.85),inset 0 1px 0 rgba(255,255,255,0.06)"}}>
        <div style={{width:isMobile?26:34,height:isMobile?26:34,borderRadius:9,flexShrink:0,background:"linear-gradient(135deg,rgba(232,98,42,0.2),rgba(232,98,42,0.06))",border:"1px solid rgba(232,98,42,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={isMobile?10:13} height={isMobile?10:13} viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div>
          <p style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.28rem,0.7vw,0.36rem)",color:"rgba(232,98,42,0.72)",textTransform:"uppercase",letterSpacing:"0.18em",fontWeight:700,margin:"0 0 2px 0"}}>System Live</p>
          <p style={{fontFamily:"'Space Mono',monospace",fontSize:isMobile?"clamp(0.5rem,2vw,0.58rem)":"clamp(0.62rem,1.4vw,0.78rem)",color:T.text,fontWeight:700,margin:0}}>{time}</p>
        </div>
      </motion.div>

      {/* Stack badge — desktop only */}
      {!isMobile&&(
        <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:1.45,duration:0.85,ease:[0.16,1,0.3,1]}}
          style={{position:"absolute",top:"20%",left:-36,zIndex:20,background:"linear-gradient(135deg,rgba(7,7,13,0.97),rgba(12,10,20,0.97))",backdropFilter:"blur(28px)",border:"1px solid rgba(232,98,42,0.2)",borderRadius:13,padding:"0.6rem 0.9rem",display:"flex",flexDirection:"column",gap:"0.1rem",boxShadow:"0 14px 40px rgba(0,0,0,0.75),inset 0 1px 0 rgba(255,255,255,0.06)"}}>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.36rem",color:"rgba(232,98,42,0.6)",textTransform:"uppercase",letterSpacing:"0.16em"}}>Stack</span>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",color:T.text,letterSpacing:"0.06em",lineHeight:1}}>Three.js</span>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.36rem",color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>React · Node · TS</span>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT CHIP
═══════════════════════════════════════════════════════════════ */
function Stat({ icon, value, label, delay }) {
  const [hov,setHov]=useState(false);
  return (
    <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay,duration:0.65,ease:[0.16,1,0.3,1]}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"center",gap:"0.55rem",padding:"0.62rem 0.8rem",borderRadius:12,flex:1,background:hov?"linear-gradient(135deg,rgba(232,98,42,0.12),rgba(232,98,42,0.04))":"linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))",border:`1px solid ${hov?"rgba(232,98,42,0.38)":T.borderB}`,transition:"all 0.3s ease",cursor:"default",backdropFilter:"blur(12px)"}}>
      <div style={{width:26,height:26,borderRadius:7,flexShrink:0,background:hov?"rgba(232,98,42,0.2)":"rgba(232,98,42,0.08)",border:`1px solid ${hov?"rgba(232,98,42,0.44)":"rgba(232,98,42,0.14)"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s ease"}}>
        {icon}
      </div>
      <div>
        <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(0.82rem,2.5vw,1.05rem)",color:T.text,lineHeight:1,margin:0,letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{value}</p>
        <p style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.28rem,0.8vw,0.36rem)",textTransform:"uppercase",letterSpacing:"0.16em",color:T.muted,marginTop:2,marginBottom:0,whiteSpace:"nowrap"}}>{label}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL INDICATOR
═══════════════════════════════════════════════════════════════ */
function ScrollIndicator({ opacity }) {
  return (
    <motion.div style={{opacity,position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:8,pointerEvents:"none"}}
      initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.8}}>
      <span style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.28rem,0.8vw,0.32rem)",textTransform:"uppercase",letterSpacing:"0.45em",color:"rgba(255,255,255,0.14)"}}>Scroll</span>
      <div style={{width:18,height:30,border:"1px solid rgba(255,255,255,0.1)",borderRadius:100,display:"flex",justifyContent:"center",padding:"4px 0"}}>
        <motion.div animate={{y:[0,11,0],opacity:[1,0,1]}} transition={{duration:1.9,repeat:Infinity,ease:"easeInOut"}}
          style={{width:3,height:7,background:`linear-gradient(to bottom,${T.orange},${T.orangeG})`,borderRadius:100}}/>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLIP CHAR
═══════════════════════════════════════════════════════════════ */
function FlipChar({ char, delay }) {
  return (
    <motion.span initial={{opacity:0,y:36,rotateX:-70}} animate={{opacity:1,y:0,rotateX:0}} transition={{delay,duration:0.72,ease:[0.16,1,0.3,1]}}
      style={{display:"inline-block",transformStyle:"preserve-3d"}}>{char}</motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SVG ICONS (no react-icons dependency)
═══════════════════════════════════════════════════════════════ */
const IconCube = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconZap = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconLayers = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   HERO  (main export)
═══════════════════════════════════════════════════════════════ */
export default function Hero() {
  const containerRef = useRef(null);
  const { scrollY }  = useScroll();
  const [time,       setTime]       = useState(new Date());
  const [isMobile,   setIsMobile]   = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const mxS = useSpring(mouseX,{stiffness:50,damping:22});
  const myS = useSpring(mouseY,{stiffness:50,damping:22});

  const opacity    = useTransform(scrollY,[0,420],[1,0]);
  const yParallaxR = useTransform(scrollY,[0,600],[0,-60]);
  const yParallax  = useSpring(yParallaxR,{stiffness:65,damping:28});
  const yLayer1    = useTransform(scrollY,[0,600],[0,-30]);
  const yLayer2    = useTransform(scrollY,[0,600],[0,-55]);

  const spotlightBg = useTransform([mxS,myS],l=>
    `radial-gradient(800px circle at ${l[0]*100}% ${l[1]*100}%, rgba(232,98,42,0.05), transparent 65%)`);

  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);

  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<1024);
    check();
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  const handleMouseMove = useCallback(e=>{
    if(isMobile)return;
    const el=containerRef.current; if(!el)return;
    const r=el.getBoundingClientRect();
    mouseX.set((e.clientX-r.left)/r.width);
    mouseY.set((e.clientY-r.top)/r.height);
  },[mouseX,mouseY,isMobile]);

  const formattedTime = time.toLocaleTimeString("en-US",{hour12:true,hour:"2-digit",minute:"2-digit",second:"2-digit"});
  const firstName = "Perpetual".split("");
  const lastName  = "Okan".split("");

  return (
    <>
      {!isMobile && <CustomCursor/>}

      <section ref={containerRef} onMouseMove={handleMouseMove}
        style={{
          position:"relative", minHeight:"100vh",
          display:"flex", flexDirection:"column", justifyContent:"center",
          background:T.bg, overflow:"hidden",
          paddingTop:    isMobile?"calc(var(--navbar-height,70px) + 5.5rem)":"calc(var(--navbar-height,70px) + 8rem)",
          paddingBottom: isMobile?"6rem":"7rem",
          paddingLeft:   isMobile?"5%":"6%",
          paddingRight:  isMobile?"5%":"6%",
          cursor:        isMobile?"auto":"none",
        }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
          *,*::before,*::after{box-sizing:border-box;}

          .hg{display:grid;grid-template-columns:1.15fr 1fr;grid-template-areas:"text img";gap:clamp(2rem,4vw,5rem);align-items:center;width:100%;max-width:1380px;margin:0 auto;}
          .hg-text{grid-area:text;display:flex;flex-direction:column;}
          .hg-img {grid-area:img; display:flex;justify-content:center;align-items:center;}

          @media(max-width:1023px){
            .hg{grid-template-columns:1fr;grid-template-areas:"img""text";gap:clamp(2rem,5vw,2.8rem);text-align:center;}
            .hg-eyebrow{justify-content:center!important;}
            .hg-divider{display:none!important;}
            .hg-btns   {justify-content:center!important;}
            .hg-stats  {justify-content:center!important;}
            .hg-avail  {align-self:center!important;}
            .hg-desc{border-left:none!important;padding-left:0!important;border-top:1px solid rgba(232,98,42,0.16)!important;padding-top:1rem!important;margin-left:auto!important;margin-right:auto!important;text-align:center!important;}
          }
          @media(max-width:480px){ .hg-btns{flex-direction:column!important;} }

          @keyframes hr-shim{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}
          .hr-shim{position:relative;overflow:hidden;}
          .hr-shim::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.13) 50%,transparent);animation:hr-shim 3.8s infinite;border-radius:inherit;}

          a,button{cursor:none;}
        `}</style>

        {/* Three.js scene */}
        <ThreeScene isMobile={isMobile} scrollY={scrollY} onReady={()=>setSceneReady(true)}/>

        {/* Intro veil — fades away once scene signals ready */}
        <SceneIntro visible={!sceneReady}/>

        <NoiseOverlay/>

        {/* Radial vignette */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:2,background:"radial-gradient(ellipse 90% 80% at 50% 50%,transparent 30%,rgba(1,1,3,0.38) 62%,rgba(1,1,3,0.82) 100%)"}}/>

        {/* Side readability gradient */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:2,background:isMobile
          ?"linear-gradient(to bottom,rgba(1,1,3,0.38) 0%,transparent 30%,rgba(1,1,3,0.5) 100%)"
          :"linear-gradient(to right,rgba(1,1,3,0.78) 0%,rgba(1,1,3,0.22) 38%,transparent 55%)"}}/>

        {/* Mouse spotlight */}
        <motion.div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:2,background:spotlightBg}}/>

        {/* ── CONTENT ── */}
        <div style={{position:"relative",zIndex:10}}>
          <motion.div style={{y:yParallax}} className="hg">

            {/* IMAGE col */}
            <motion.div className="hg-img" style={{y:yLayer2}}>
              <ProfileCard3D time={formattedTime} isMobile={isMobile}/>
            </motion.div>

            {/* TEXT col */}
            <motion.div className="hg-text" style={{gap:isMobile?"clamp(1rem,3vw,1.4rem)":"clamp(1.2rem,2vw,1.6rem)",y:yLayer1}}>

              {/* Availability — desktop only (mobile card pill already shows status) */}
              {!isMobile && (
                <div className="hg-avail" style={{alignSelf:"flex-start"}}>
                  <AvailBadge/>
                </div>
              )}

              {/* Eyebrow */}
              <motion.div initial={{opacity:0,x:isMobile?0:-26,y:isMobile?10:0}} animate={{opacity:1,x:0,y:0}} transition={{duration:0.8,delay:0.52}}
                className="hg-eyebrow" style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                <div className="hg-divider" style={{height:1,width:28,background:`linear-gradient(to right,transparent,${T.orange})`,flexShrink:0}}/>
                <div style={{display:"inline-flex",alignItems:"center",gap:"0.45rem",padding:"0.3rem 0.88rem",borderRadius:100,backdropFilter:"blur(14px)",background:"linear-gradient(135deg,rgba(232,98,42,0.1),rgba(232,98,42,0.04))",border:"1px solid rgba(232,98,42,0.28)"}}>
                  <motion.span animate={{opacity:[1,0.2,1],scale:[1,0.65,1]}} transition={{duration:2.1,repeat:Infinity}}
                    style={{width:6,height:6,borderRadius:"50%",display:"inline-block",flexShrink:0,background:T.orange,boxShadow:`0 0 10px ${T.orange}`}}/>
                  <span style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.34rem,1vw,0.44rem)",fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(240,132,90,0.95)",whiteSpace:"nowrap"}}>3D & Full-Stack Dev</span>
                </div>
                <div className="hg-divider" style={{height:1,flex:1,background:`linear-gradient(to right,${T.border},transparent)`}}/>
              </motion.div>

              {/* Name */}
              <div style={{display:"flex",flexDirection:"column",gap:"0.15rem"}}>
                <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.63,duration:0.6}}
                  style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.38rem,1.2vw,0.58rem)",fontWeight:700,letterSpacing:"0.32em",textTransform:"uppercase",color:T.muted,margin:0}}>
                  Hi, I'm
                </motion.p>
                <h1 style={{margin:0,lineHeight:0.9,fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(3rem,11vw,7.8rem)",fontWeight:400,letterSpacing:"-0.01em"}}>
                  <div style={{color:T.text}}>
                    {firstName.map((ch,i)=><FlipChar key={i} char={ch} delay={0.66+i*0.05}/>)}
                  </div>
                  <div>
                    {lastName.map((ch,i)=>(
                      <motion.span key={i} initial={{opacity:0,y:36,rotateX:-70}} animate={{opacity:1,y:0,rotateX:0}} transition={{delay:0.92+i*0.07,duration:0.72,ease:[0.16,1,0.3,1]}}
                        style={{display:"inline-block",transformStyle:"preserve-3d",background:`linear-gradient(140deg,${T.okanA} 0%,${T.okanC} 40%,${T.okanB} 70%,${T.okanA} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:"drop-shadow(0 0 18px rgba(184,103,42,0.28)) drop-shadow(0 2px 6px rgba(0,0,0,0.5))"}}>
                        {ch}
                      </motion.span>
                    ))}
                  </div>
                </h1>
                <motion.h2 initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.88,duration:0.7}}
                  style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.55rem,1.8vw,0.86rem)",fontWeight:400,color:T.muted,margin:"0.5rem 0 0",letterSpacing:"0.06em"}}>
                  <Typewriter/>
                </motion.h2>
              </div>

              {/* ── FIXED BIO — 3D specialty first, no generic fluff ── */}
              <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.94,duration:0.75}}
                className="hg-desc"
                style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.54rem,1.1vw,0.76rem)",lineHeight:1.95,color:T.muted,maxWidth:460,margin:0,borderLeft:"2px solid rgba(232,98,42,0.24)",paddingLeft:"1.15rem"}}>
                I craft <span style={{color:T.orangeG,fontWeight:700}}>immersive 3D web experiences</span> and full-stack applications.
                Specialising in Three.js, WebGL and React — turning complex ideas into things people can{" "}
                <em style={{color:T.text,fontStyle:"italic"}}>feel</em>.
              </motion.p>

              {/* Skill bars — desktop only; mobile uses stat chips instead */}
              {!isMobile && <SkillBars isMobile={false}/>}

              {/* Stats — desktop only (below skill bars) */}
              {!isMobile && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.18,duration:0.75}}
                className="hg-stats" style={{display:"flex",gap:"0.5rem",paddingTop:"0.6rem",borderTop:"1px solid rgba(255,255,255,0.055)"}}>
                <Stat icon={<IconCube/>}   value="Three.js"   label="WebGL"      delay={1.22}/>
                <Stat icon={<IconZap/>}    value="15+"        label="Projects"   delay={1.32}/>
                <Stat icon={<IconLayers/>} value="Full-Stack" label="Specialist" delay={1.42}/>
              </motion.div>
              )}

              {/* CTAs */}
              <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:1.04,duration:0.75}}
                className="hg-btns" style={{display:"flex",gap:"0.7rem",flexWrap:"wrap"}}>
                <Link to="/portfolio" style={{textDecoration:"none",flex:isMobile?1:"none"}}>
                  <motion.div whileHover={{scale:1.04,boxShadow:`0 20px 50px rgba(232,98,42,0.42)`}} whileTap={{scale:0.97}}
                    className="hr-shim"
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",padding:"0.9rem 1.8rem",borderRadius:6,background:`linear-gradient(135deg,${T.orange},${T.orangeD} 60%,#b03a0e)`,color:"#fff",fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.46rem,1.4vw,0.56rem)",fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",boxShadow:`0 8px 30px rgba(232,98,42,0.28),inset 0 1px 0 rgba(255,255,255,0.2)`,cursor:"none",width:"100%",whiteSpace:"nowrap"}}>
                    Explore Work <IconArrow/>
                  </motion.div>
                </Link>
                <motion.button
                  whileHover={{borderColor:"rgba(232,98,42,0.5)",color:T.text,background:"rgba(232,98,42,0.07)"}} whileTap={{scale:0.97}}
                  onClick={()=>{const a=document.createElement("a");a.href="/Perpetuual-cv.pdf";a.download="Perpetual_Okan_Resume.pdf";document.body.appendChild(a);a.click();document.body.removeChild(a);}}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",padding:"0.9rem 1.8rem",borderRadius:6,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.09)",color:T.muted,fontFamily:"'Space Mono',monospace",fontSize:"clamp(0.46rem,1.4vw,0.56rem)",fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",cursor:"none",transition:"all 0.28s ease",backdropFilter:"blur(10px)",flex:isMobile?1:"none",whiteSpace:"nowrap"}}>
                  <IconDownload/> Get Resume
                </motion.button>
              </motion.div>

              {/* Stats — mobile only (desktop has skill bars instead) */}
              {isMobile && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.18,duration:0.75}}
                className="hg-stats" style={{display:"flex",gap:"0.5rem",paddingTop:"1rem",borderTop:"1px solid rgba(255,255,255,0.055)"}}>
                <Stat icon={<IconCube/>}   value="Three.js"   label="WebGL"      delay={1.22}/>
                <Stat icon={<IconZap/>}    value="15+"        label="Projects"   delay={1.32}/>
                <Stat icon={<IconLayers/>} value="Full-Stack" label="Specialist" delay={1.42}/>
              </motion.div>
              )}

            </motion.div>
          </motion.div>
        </div>

        <ScrollIndicator opacity={opacity}/>
      </section>
    </>
  );
}
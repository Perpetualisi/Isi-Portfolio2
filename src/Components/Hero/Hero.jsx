import React, {
  useRef, useState, useEffect, useCallback, useMemo,
} from "react";
import {
  motion, useScroll, useTransform, useSpring, useMotionValue,
} from "framer-motion";
import * as THREE from "three";

/* ─── TOKENS ─────────────────────────────────────────────────── */
const T = {
  bg:      "#050608",
  surface: "#0A0C10",
  ember:   "#C8541A",
  emberLt: "#E8693A",
  emberDm: "rgba(200,84,26,0.10)",
  slate:   "#7A8A9E",
  stone:   "#4C5460",
  text:    "#EDF0F6",
  muted:   "rgba(237,240,246,0.44)",
  faint:   "rgba(237,240,246,0.05)",
  bO:      "rgba(200,84,26,0.15)",
  bN:      "rgba(255,255,255,0.05)",
  bS:      "rgba(120,140,160,0.09)",
  green:   "#3DD68C",
};
const E    = [0.16, 1, 0.3, 1];
const lerp = (a, b, t) => a + (b - a) * t;
const fd   = (m, tgt, s = 0.03) => { m.opacity += (tgt - m.opacity) * s; };

const ROLES = [
  "I build for the web",
  "I make 3D experiences",
  "I write clean code",
  "I design and develop",
  "I ship fast and well",
];

/* ═══════════════════════════════════════════════════════════════
   3D SCENE — morphing orb, spiral particles, orbital rings,
               volumetric light shafts, nebula clouds, lens flares
═══════════════════════════════════════════════════════════════ */
function Scene({ isMobile, scrollY }) {
  const ref    = useRef(null);
  const mouse  = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => scrollY.on("change", v => { scroll.current = v; }), [scrollY]);

  useEffect(() => {
    const el = ref.current; if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.2 : 1.8));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, el.clientWidth / el.clientHeight, 0.1, 300);
    camera.position.set(0, 0, 18);
    scene.fog = new THREE.FogExp2(0x050608, 0.018);

    /* lights */
    scene.add(new THREE.AmbientLight(0x080509, 0.5));
    const L = (c, i, x, y, z) => { const l = new THREE.PointLight(c, i, 42); l.position.set(x,y,z); scene.add(l); return l; };
    const lA = L(0xc8541a, 18,  5,  4,  8);
    const lB = L(0xe06830,  8, -3,  6, -4);
    const lC = L(0x8b3a10,  6,  6, -4,  2);
    const lD = L(0xff7040,  5, -8,  2,  6); // new rim light

    /* ─ Orb ─ */
    const orbPos = new THREE.Vector3(isMobile ? 0 : 4.2, isMobile ? 0.8 : 0.3, -1);
    const orbGeo = new THREE.SphereGeometry(2.2, isMobile ? 64 : 128, isMobile ? 64 : 128);
    const orbMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a0c05, metalness: 0.97, roughness: 0.04,
      clearcoat: 1, clearcoatRoughness: 0.005,
      emissive: new THREE.Color(0x200800), emissiveIntensity: 0.18,
      transparent: true, opacity: 0,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.copy(orbPos); scene.add(orb);

    /* inner glow sphere */
    const glowGeo = new THREE.SphereGeometry(2.0, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xc8541a, transparent: true, opacity: 0, side: THREE.BackSide });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.copy(orbPos); scene.add(glowMesh);

    /* morph wire */
    const wGeo  = new THREE.IcosahedronGeometry(2.32, isMobile ? 3 : 5);
    const wMat  = new THREE.MeshBasicMaterial({ color: 0xc8541a, wireframe: true, transparent: true, opacity: 0 });
    const wire  = new THREE.Mesh(wGeo, wMat);
    wire.position.copy(orbPos); scene.add(wire);
    const wPos  = wGeo.getAttribute("position");
    const wOrig = new Float32Array(wPos.array);
    const morphWire = t => {
      const a = wPos.array;
      for (let i = 0; i < a.length; i += 3) {
        const ox = wOrig[i], oy = wOrig[i+1], oz = wOrig[i+2];
        const l  = Math.sqrt(ox*ox+oy*oy+oz*oz);
        const nx = ox/l, ny = oy/l, nz = oz/l;
        const n  = Math.sin(nx*4+t*0.42)*0.07 + Math.cos(ny*3.8+t*0.31)*0.06 + Math.sin(nz*5+t*0.55)*0.05;
        const r  = l+n; a[i]=nx*r; a[i+1]=ny*r; a[i+2]=nz*r;
      }
      wPos.needsUpdate = true;
    };

    /* ─ Outer energy shell ─ */
    const shellGeo = new THREE.IcosahedronGeometry(2.8, isMobile ? 2 : 4);
    const shellMat = new THREE.MeshBasicMaterial({ color: 0xff6622, wireframe: true, transparent: true, opacity: 0 });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.copy(orbPos); scene.add(shell);

    /* ─ Rings ─ */
    const mkRing = (r, tube, col, rx, ry, op) => {
      const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, 220), m);
      mesh.position.copy(orbPos); mesh.rotation.x = rx; mesh.rotation.y = ry;
      scene.add(mesh); return { mesh, m, op };
    };
    const rings = [
      mkRing(3.0, 0.008, 0xc8541a, Math.PI/2,    0,    0.35),
      mkRing(3.9, 0.005, 0x8b3a10, Math.PI/3,    0.48, 0.18),
      mkRing(4.8, 0.003, 0x5c2208, Math.PI/1.65,-0.28, 0.10),
      mkRing(5.8, 0.002, 0x3a1405, Math.PI/2.4,  0.90, 0.06), // new outer ring
    ];

    /* ─ Particle spiral ─ */
    const N = isMobile ? 2500 : 8000;
    const pp = new Float32Array(N*3), pc = new Float32Array(N*3);
    for (let i = 0; i < N; i++) {
      const t = (i/N)*Math.PI*14;
      const r = 1.6 + (i/N)*10 + Math.random()*1.2;
      pp[i*3]   = Math.cos(t)*r + (Math.random()-.5)*.6 + orbPos.x;
      pp[i*3+1] = (Math.random()-.5)*8 + orbPos.y;
      pp[i*3+2] = Math.sin(t)*r + (Math.random()-.5)*.6 - 2;
      const f = i/N;
      pc[i*3] = .52+f*.28; pc[i*3+1] = .20+f*.16; pc[i*3+2] = .05+f*.12;
    }
    const spGeo = new THREE.BufferGeometry();
    spGeo.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    spGeo.setAttribute("color",    new THREE.BufferAttribute(pc, 3));
    const spMat = new THREE.PointsMaterial({ size: .042, vertexColors: true, transparent: true, opacity: 0, sizeAttenuation: true });
    const spiral = new THREE.Points(spGeo, spMat); scene.add(spiral);

    /* ─ Nebula cloud layer (large soft particles) ─ */
    const nbN = isMobile ? 300 : 900;
    const nbP = new Float32Array(nbN*3), nbC = new Float32Array(nbN*3);
    for (let i = 0; i < nbN; i++) {
      const angle = Math.random()*Math.PI*2;
      const r = 5 + Math.random()*12;
      nbP[i*3]   = Math.cos(angle)*r + orbPos.x + (Math.random()-.5)*6;
      nbP[i*3+1] = (Math.random()-.5)*10;
      nbP[i*3+2] = Math.sin(angle)*r - 4 + (Math.random()-.5)*6;
      const b = Math.random();
      nbC[i*3] = .38+b*.22; nbC[i*3+1] = .15+b*.12; nbC[i*3+2] = .06+b*.08;
    }
    const nbGeo = new THREE.BufferGeometry();
    nbGeo.setAttribute("position", new THREE.BufferAttribute(nbP, 3));
    nbGeo.setAttribute("color",    new THREE.BufferAttribute(nbC, 3));
    const nbMat = new THREE.PointsMaterial({ size: .18, vertexColors: true, transparent: true, opacity: 0, sizeAttenuation: true });
    const nebula = new THREE.Points(nbGeo, nbMat); scene.add(nebula);

    /* ─ Ambient dust ─ */
    const dn = isMobile ? 500 : 1800;
    const dp = new Float32Array(dn*3), dc = new Float32Array(dn*3);
    for (let i = 0; i < dn; i++) {
      const r  = 7 + Math.random()*18;
      const th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
      dp[i*3] = r*Math.sin(ph)*Math.cos(th); dp[i*3+1] = r*Math.sin(ph)*Math.sin(th); dp[i*3+2] = r*Math.cos(ph);
      const b = Math.random(); dc[i*3] = .48+b*.28; dc[i*3+1] = .28+b*.18; dc[i*3+2] = .12+b*.10;
    }
    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    dGeo.setAttribute("color",    new THREE.BufferAttribute(dc, 3));
    const dMat = new THREE.PointsMaterial({ size: .014, vertexColors: true, transparent: true, opacity: 0, sizeAttenuation: true });
    const dust = new THREE.Points(dGeo, dMat); scene.add(dust);

    /* ─ Volumetric light cone ─ */
    const coneGeo = new THREE.ConeGeometry(5, 14, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xc84010, transparent: true, opacity: 0, side: THREE.DoubleSide,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(orbPos.x, orbPos.y + 7, orbPos.z - 1);
    cone.rotation.x = Math.PI; scene.add(cone);

    /* ─ Lens flare billboards ─ */
    const mkFlare = (size, col, ox, oy, oz) => {
      const geo = new THREE.PlaneGeometry(size, size);
      const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(orbPos.x+ox, orbPos.y+oy, orbPos.z+oz);
      scene.add(mesh);
      return { mesh, mat };
    };
    const flares = [
      mkFlare(1.8, 0xff8844, 0, 0, 1.5),
      mkFlare(0.6, 0xffaa66, 1.2, 0.4, 2.0),
      mkFlare(0.4, 0xffcc88, -0.8, -0.3, 2.5),
    ];

    /* ─ Floating polyhedra ─ */
    const polys = [
      [new THREE.OctahedronGeometry(.22),    0xc8541a, -5.0,  2.6, -5.0],
      [new THREE.TetrahedronGeometry(.26),   0x8b3a10,  6.8, -1.5, -4.0],
      [new THREE.IcosahedronGeometry(.24,0), 0xc8541a, -2.8, -3.8, -3.0],
      [new THREE.OctahedronGeometry(.18),    0xd96028,  7.5,  2.8, -5.5],
      [new THREE.TetrahedronGeometry(.20),   0x8b3a10, -6.5, -0.8, -4.5],
      [new THREE.DodecahedronGeometry(.18),  0xff6030,  3.2,  4.8, -6.0], // new
      [new THREE.OctahedronGeometry(.14),    0xc86030, -4.2,  1.2, -7.0], // new
    ].map(([g, c, x, y, z]) => {
      const mat  = new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(g, mat); mesh.position.set(x, y, z); scene.add(mesh);
      return { mesh, mat, op: .38+Math.random()*.22, oy: y,
        ax: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        rs: .004+Math.random()*.009, fs: .12+Math.random()*.3, fa: .05+Math.random()*.12, ph: Math.random()*Math.PI*2 };
    });

    /* ─ Cinematic sweep rings (expand outward) ─ */
    const sweepRings = Array.from({ length: 3 }, (_, i) => {
      const geo = new THREE.TorusGeometry(0.5, 0.006, 4, 160);
      const mat = new THREE.MeshBasicMaterial({ color: 0xc86030, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(orbPos); mesh.rotation.x = Math.PI/2;
      scene.add(mesh);
      return { mesh, mat, offset: i * 2.2 };
    });

    const onResize = () => { camera.aspect = el.clientWidth/el.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
    const onMouse  = ({ clientX, clientY }) => { mouse.current.x = (clientX/innerWidth-.5)*2; mouse.current.y = (clientY/innerHeight-.5)*2; };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);

    let raf, intro = 0;
    const t0 = performance.now();
    const cT  = new THREE.Vector3();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = (performance.now()-t0)/1000;
      intro = Math.min(intro+.004, 1);
      const e = 1-Math.pow(1-intro, 4);

      morphWire(t);
      orb.rotation.x  = t*.038; orb.rotation.y = t*.065;
      wire.rotation.copy(orb.rotation);

      // outer shell counter-rotates for dynamic energy
      shell.rotation.x = -t*.025; shell.rotation.y = t*.040;
      fd(shellMat, (.012+Math.sin(t*1.2)*.006)*e, .018);

      fd(orbMat, .93*e, .026); fd(wMat, (.022+Math.sin(t*.9)*.012)*e, .022);

      // inner glow pulse
      fd(glowMat, (.06+Math.sin(t*1.8)*.04)*e, .030);

      rings.forEach(({ mesh, m, op }, i) => {
        mesh.rotation.z = t*(.022-i*.005); mesh.rotation.x += Math.sin(t*.11+i)*.0009;
        fd(m, op*e, .020);
      });

      // sweep rings expand like shockwaves
      sweepRings.forEach(({ mesh, mat, offset }, i) => {
        const phase = ((t * 0.4 + offset) % 6.6);
        const prog = phase / 6.6;
        const r = 2.5 + prog * 8;
        mesh.scale.setScalar(r / 0.5);
        const op = Math.sin(prog * Math.PI) * 0.18 * e;
        fd(mat, op, .06);
      });

      spiral.rotation.y = t*.07; spiral.rotation.z = t*.012; fd(spMat, .70*e, .024);
      dust.rotation.y   = t*.006; dust.rotation.x = t*.003; fd(dMat, .52*e, .016);

      // nebula slowly drifts
      nebula.rotation.y = t*.008; nebula.rotation.x = Math.sin(t*.04)*.02;
      fd(nbMat, .28*e, .014);

      // volumetric cone pulse
      cone.rotation.y = t*.12;
      fd(coneMat, (.018+Math.sin(t*2.2)*.012)*e, .025);

      // lens flares — billboard toward camera + pulse
      flares.forEach(({ mesh, mat }, i) => {
        mesh.lookAt(camera.position);
        const pulse = Math.sin(t*1.6+i*1.1)*.5+.5;
        fd(mat, (.14+pulse*.10)*e, .040);
      });

      polys.forEach(p => {
        p.mesh.rotateOnAxis(p.ax, p.rs);
        p.mesh.position.y = p.oy + Math.sin(t*p.fs+p.ph)*p.fa;
        fd(p.mat, p.op*e, .016);
      });

      // dramatic key light animation — wide sweeping orbit
      lA.position.set(Math.sin(t*.18)*8+4, Math.cos(t*.13)*5+3, 8); lA.intensity = 16+Math.sin(t*.7)*4;
      lB.position.set(Math.sin(t*.10+1)*6, Math.cos(t*.18)*4+4, -4); lB.intensity = 6+Math.sin(t*1.0)*2;
      lC.position.x = Math.cos(t*.28+.8)*6; lC.position.y = Math.sin(t*.22)*3;
      lD.position.set(Math.cos(t*.15)*9-6, Math.sin(t*.19)*4+2, 5); lD.intensity = 4+Math.sin(t*.55)*2;

      const sp = Math.min(scroll.current/600, 1);
      // camera now also has a subtle slow cinematic drift
      const drift = new THREE.Vector3(
        Math.sin(t*.06)*0.4,
        Math.cos(t*.08)*0.25,
        0
      );
      cT.set(
        mouse.current.x*.45 + drift.x,
        -mouse.current.y*.30+sp*-1.8 + drift.y,
        18-e*4.2+sp*2.8
      );
      camera.position.x += (cT.x-camera.position.x)*.032;
      camera.position.y += (cT.y-camera.position.y)*.032;
      camera.position.z += (cT.z-camera.position.z)*.025;
      camera.lookAt(isMobile ? 0 : 1.8, 0.2, 0);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [isMobile]);

  return <div ref={ref} style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none" }} />;
}

/* ═══════════════════════════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════════════════════════ */
function Cursor() {
  const dot  = useRef(null);
  const ring = useRef(null);
  const pos  = useRef({ x:0, y:0 });
  const rp   = useRef({ x:0, y:0 });

  useEffect(() => {
    const mv = ({ clientX:x, clientY:y }) => { pos.current={x,y}; if(dot.current) dot.current.style.transform=`translate(${x}px,${y}px)`; };
    window.addEventListener("mousemove", mv);
    let raf;
    const tick = () => {
      rp.current.x = lerp(rp.current.x, pos.current.x, .08);
      rp.current.y = lerp(rp.current.y, pos.current.y, .08);
      if (ring.current) ring.current.style.transform = `translate(${rp.current.x}px,${rp.current.y}px)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("mousemove", mv); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dot}  style={{ position:"fixed", top:-4,  left:-4,  width:8,  height:8,  background:T.ember, borderRadius:"50%", boxShadow:`0 0 10px ${T.ember}`, pointerEvents:"none", zIndex:9999, willChange:"transform" }}/>
      <div ref={ring} style={{ position:"fixed", top:-16, left:-16, width:32, height:32, borderRadius:"50%", border:`1px solid rgba(200,84,26,0.45)`, pointerEvents:"none", zIndex:9998, willChange:"transform" }}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER
═══════════════════════════════════════════════════════════════ */
function Typewriter() {
  const [idx,   setIdx]  = useState(0);
  const [text,  setText] = useState("");
  const [phase, setP]    = useState("in");

  useEffect(() => {
    const target = ROLES[idx]; let t;
    if (phase==="in") {
      if (text.length < target.length) t = setTimeout(() => setText(target.slice(0,text.length+1)), 58);
      else t = setTimeout(() => setP("hold"), 2200);
    } else if (phase==="hold") {
      t = setTimeout(() => setP("out"), 300);
    } else {
      if (text.length > 0) t = setTimeout(() => setText(text.slice(0,-1)), 30);
      else { setIdx(i => (i+1)%ROLES.length); setP("in"); }
    }
    return () => clearTimeout(t);
  }, [text, phase, idx]);

  return (
    <span style={{ color: T.text }}>
      {text}
      <motion.span
        animate={{ opacity:[1,0] }}
        transition={{ duration:.5, repeat:Infinity, repeatType:"reverse" }}
        style={{ display:"inline-block", width:2, height:".75em", background:T.ember, marginLeft:2, verticalAlign:"middle", borderRadius:1 }}
      />
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE CARD — sharp image, 3D tilt, two clean badges
═══════════════════════════════════════════════════════════════ */
function ProfileCard({ time, isMobile }) {
  const cardRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-.5,.5], ["12deg","-12deg"]), { stiffness:90, damping:16 });
  const rotY = useSpring(useTransform(mx, [-.5,.5], ["-12deg","12deg"]), { stiffness:90, damping:16 });
  const glareX = useTransform(mx, [-.5,.5], ["0%","100%"]);
  const glareY = useTransform(my, [-.5,.5], ["0%","100%"]);
  const glareBg = useTransform([glareX, glareY], ([gx,gy]) =>
    `radial-gradient(ellipse 55% 45% at ${gx} ${gy}, rgba(255,255,255,0.065) 0%, transparent 65%)`);
  const [hov, setHov] = useState(false);

  const onMove = useCallback(e => {
    if (isMobile) return;
    const r = cardRef.current?.getBoundingClientRect();
    if (r) { mx.set((e.clientX-r.left)/r.width-.5); my.set((e.clientY-r.top)/r.height-.5); }
  }, [isMobile, mx, my]);

  const floatY = useMotionValue(0);
  useEffect(() => {
    let raf, t0 = performance.now();
    const tick = () => { floatY.set(Math.sin((performance.now()-t0)/1000*.65)*5); raf = requestAnimationFrame(tick); };
    tick(); return () => cancelAnimationFrame(raf);
  }, [floatY]);

  const W = isMobile ? "clamp(210px,62vw,270px)" : "clamp(400px,34vw,520px)";

  return (
    <div style={{ position:"relative", width:"100%", display:"flex", justifyContent:"center", alignItems:"center", paddingBottom:"2rem" }}>
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:2.5 }}
        style={{ position:"absolute", width:"80%", height:"85%",
          background:`radial-gradient(ellipse at 50% 55%, rgba(200,84,26,0.18) 0%, transparent 68%)`,
          filter:"blur(55px)", pointerEvents:"none" }}
      />

      <motion.div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseEnter={() => !isMobile && setHov(true)}
        onMouseLeave={() => { mx.set(0); my.set(0); setHov(false); }}
        initial={{ opacity:0, y:55, scale:.91 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:1.1, delay:.4, ease:E }}
        style={{
          rotateX: isMobile ? 0 : rotX, rotateY: isMobile ? 0 : rotY,
          y: isMobile ? 0 : floatY,
          transformStyle:"preserve-3d", perspective:"900px",
          width:W, position:"relative", cursor:"default",
        }}
      >
        {/* corner accents */}
        {[
          { top:-10, left:-10,  d:"M22 0H7C3.1 0 0 3.1 0 7V22" },
          { top:-10, right:-10, d:"M0 0H15C18.9 0 22 3.1 22 7V22" },
          { bottom:-10, left:-10,  d:"M22 22H7C3.1 22 0 18.9 0 15V0" },
          { bottom:-10, right:-10, d:"M0 22H15C18.9 22 22 18.9 22 15V0" },
        ].map((c, i) => (
          <div key={i} style={{ position:"absolute", width:22, height:22, zIndex:25, pointerEvents:"none", top:c.top, left:c.left, right:c.right, bottom:c.bottom }}>
            <svg width="22" height="22" fill="none">
              <motion.path d={c.d} stroke={T.ember} strokeWidth="1.5"
                initial={{ pathLength:0, opacity:0 }}
                animate={{ pathLength:1, opacity: hov?.85:.35 }}
                transition={{ duration:.9, delay:.8+i*.08, ease:E }}
              />
            </svg>
          </div>
        ))}

        {/* shell */}
        <div style={{
          position:"relative", borderRadius:20, padding:4,
          background:`linear-gradient(148deg, rgba(200,84,26,0.12) 0%, rgba(200,84,26,0.03) 55%, transparent 100%)`,
          border:`1px solid rgba(200,84,26,${hov?.28:.12})`,
          boxShadow: hov
            ? `0 40px 90px rgba(0,0,0,.78), 0 0 70px rgba(200,84,26,0.16), inset 0 1px 0 rgba(255,255,255,.07)`
            : `0 24px 64px rgba(0,0,0,.68), inset 0 1px 0 rgba(255,255,255,.04)`,
          transition:"box-shadow .5s, border-color .4s",
        }}>
          <motion.div style={{ position:"absolute", inset:0, borderRadius:20, background:glareBg, opacity:hov?1:0, transition:"opacity .35s", pointerEvents:"none", zIndex:16 }}/>

          {/* photo */}
          <div style={{ borderRadius:17, overflow:"hidden", position:"relative" }}>
            <img src="/profile41.jpeg" alt="Perpetual Okan"
              style={{
                width:"100%", aspectRatio:"4/5", objectFit:"cover", objectPosition:"center top", display:"block",
                filter: hov
                  ? "saturate(1.18) brightness(1.14) contrast(1.06)"
                  : "saturate(1.10) brightness(1.10) contrast(1.04)",
                transform: hov ? "scale(1.05)" : "scale(1.0)",
                transition:"all 1.0s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
            {/* lighter, shorter gradient so face stays clean */}
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 65%, rgba(5,6,8,0.38) 100%)", pointerEvents:"none" }}/>
          </div>

          {/* availability */}
          <div style={{
            position:"absolute", top:".65rem", left:".65rem",
            background:"rgba(5,6,8,0.92)", backdropFilter:"blur(18px)",
            border:"1px solid rgba(61,214,140,0.28)", borderRadius:8,
            padding:".22rem .60rem", display:"flex", alignItems:"center", gap:".32rem", zIndex:20,
          }}>
            <motion.span animate={{ opacity:[1,.1,1] }} transition={{ duration:2.2, repeat:Infinity }}
              style={{ width:5, height:5, borderRadius:"50%", background:T.green, display:"inline-block" }}/>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.26rem,.62vw,.30rem)", fontWeight:500, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(61,214,140,.85)" }}>Open to work</span>
          </div>
        </div>

        {/* clock badge */}
        <motion.div
          initial={{ opacity:0, x:16, y:8 }} animate={{ opacity:1, x:0, y:0 }}
          transition={{ delay:1.2, duration:.9, ease:E }}
          style={{
            position:"absolute", bottom: isMobile?-26:-30, right: isMobile?-4:-22, zIndex:30,
            background:`linear-gradient(135deg, ${T.surface}, rgba(12,15,20,.98))`,
            backdropFilter:"blur(22px)", border:`1px solid ${T.bS}`, borderRadius:13,
            padding: isMobile?".46rem .72rem":".70rem 1.0rem",
            display:"flex", alignItems:"center", gap:".50rem",
            boxShadow:"0 18px 50px rgba(0,0,0,.70)",
          }}
        >
          <div style={{ width: isMobile?22:28, height: isMobile?22:28, borderRadius:8, flexShrink:0, background:T.emberDm, border:`1px solid ${T.bO}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={isMobile?10:12} height={isMobile?10:12} viewBox="0 0 24 24" fill="none" stroke={T.ember} strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.22rem,.55vw,.27rem)", color:T.stone, textTransform:"uppercase", letterSpacing:".17em", margin:"0 0 2px" }}>Live</p>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize: isMobile?"clamp(.46rem,1.9vw,.54rem)":"clamp(.56rem,1.1vw,.68rem)", color:T.text, fontWeight:700, margin:0, letterSpacing:".04em" }}>{time}</p>
          </div>
        </motion.div>

        {/* XP badge — desktop only */}
        {!isMobile && (
          <motion.div
            initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:1.4, duration:.85, ease:E }}
            style={{
              position:"absolute", top:"10%", left:-36, zIndex:30,
              background:`linear-gradient(135deg, ${T.surface}, rgba(12,15,20,.98))`,
              backdropFilter:"blur(22px)", border:`1px solid ${T.bS}`, borderRadius:13,
              padding:".58rem .88rem", boxShadow:"0 12px 36px rgba(0,0,0,.62)",
            }}
          >
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:".26rem", color:T.stone, textTransform:"uppercase", letterSpacing:".13em", margin:"0 0 4px" }}>Experience</p>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.0rem", color:T.ember, lineHeight:1.1, margin:"0 0 3px" }}>4+ Yrs</p>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:".25rem", color:T.stone, textTransform:"uppercase", letterSpacing:".08em", margin:0 }}>Senior Dev</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKILL BARS
═══════════════════════════════════════════════════════════════ */
const SKILLS = [
  { label:"3D & WebGL",     pct:94, color:T.ember },
  { label:"React & Next",   pct:90, color:T.slate },
  { label:"Node & Backend", pct:84, color:T.stone },
];
function SkillBars() {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 1500); return () => clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:1.3, duration:.6 }}
      style={{ padding:".80rem .95rem", borderRadius:11, background:"rgba(10,12,16,0.55)", border:`1px solid ${T.bN}`, backdropFilter:"blur(12px)" }}
    >
      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.25rem,.68vw,.30rem)", textTransform:"uppercase", letterSpacing:".22em", color:T.stone, margin:"0 0 .55rem", display:"flex", alignItems:"center", gap:".4rem" }}>
        <span style={{ width:3, height:3, borderRadius:"50%", background:T.ember, display:"inline-block" }}/>
        Skills
      </p>
      {SKILLS.map(({ label, pct, color }, i) => (
        <div key={label} style={{ marginBottom: i < SKILLS.length-1 ? ".42rem" : 0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".16rem" }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.27rem,.74vw,.33rem)", textTransform:"uppercase", letterSpacing:".10em", color:T.muted }}>{label}</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.27rem,.74vw,.33rem)", color, fontWeight:700 }}>{pct}%</span>
          </div>
          <div style={{ height:2, borderRadius:100, background:T.faint, overflow:"hidden" }}>
            <motion.div
              initial={{ width:0 }} animate={{ width: go?`${pct}%`:0 }}
              transition={{ duration:1.1, ease:E, delay:i*.08 }}
              style={{ height:"100%", borderRadius:100, background:`linear-gradient(90deg, ${color}66, ${color})` }}
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT CHIP
═══════════════════════════════════════════════════════════════ */
function Stat({ icon, value, label, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      transition={{ delay, duration:.5, ease:E }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:"flex", alignItems:"center", gap:".44rem",
        padding:".52rem .68rem", borderRadius:10, flex:1,
        background: hov ? T.surface : "transparent",
        border:`1px solid ${hov ? T.bO : T.bN}`,
        transition:"all .22s ease", cursor:"default",
      }}
    >
      <div style={{ width:24, height:24, borderRadius:7, flexShrink:0, background: hov ? T.emberDm : T.faint, border:`1px solid ${hov ? T.bO : T.bN}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .22s ease" }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(.72rem,2.0vw,.90rem)", color:T.text, lineHeight:1, margin:0, whiteSpace:"nowrap" }}>{value}</p>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.23rem,.65vw,.28rem)", textTransform:"uppercase", letterSpacing:".13em", color:T.stone, margin:"2px 0 0", whiteSpace:"nowrap" }}>{label}</p>
      </div>
    </motion.div>
  );
}

const Ic = {
  Code:  () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.ember} strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Zap:   () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.ember} strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Globe: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.ember} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Arr:   () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Dl:    () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

/* ═══════════════════════════════════════════════════════════════
   CTA BUTTONS
═══════════════════════════════════════════════════════════════ */
function CTAButtons({ isMobile }) {
  const dlResume = () => {
    const a = document.createElement("a"); a.href = "/Perpetuual-cv.pdf"; a.download = "Perpetual_Okan_Resume.pdf";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  return (
    <motion.div
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:1.06, duration:.7 }}
      className="cta-row"
      style={{ display:"flex", gap:".60rem", flexWrap:"wrap" }}
    >
      <a href="/portfolio" style={{ flex: isMobile?1:"none", textDecoration:"none" }}>
        <motion.div
          whileHover={{ scale:1.04, boxShadow:`0 0 30px ${T.ember}50, 0 0 60px ${T.ember}20` }}
          whileTap={{ scale:.97 }}
          className="btn-primary"
          style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:".44rem",
            padding:".84rem 1.75rem", borderRadius:9,
            background:`linear-gradient(135deg, ${T.emberLt}, ${T.ember})`,
            color:"#f4ede4", fontFamily:"'DM Mono',monospace",
            fontSize:"clamp(.40rem,1.2vw,.50rem)", fontWeight:700,
            letterSpacing:".18em", textTransform:"uppercase",
            boxShadow:`0 0 18px ${T.ember}25, inset 0 1px 0 rgba(255,255,255,.16)`,
            cursor:"none", width:"100%", whiteSpace:"nowrap",
            position:"relative", overflow:"hidden",
          }}
        >
          View Work <Ic.Arr/>
        </motion.div>
      </a>
      <motion.button
        whileHover={{ borderColor:T.bO, color:T.text }}
        whileTap={{ scale:.97 }}
        onClick={dlResume}
        style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:".44rem",
          padding:".84rem 1.75rem", borderRadius:9,
          background:"transparent", border:`1px solid ${T.bN}`,
          color:T.muted, fontFamily:"'DM Mono',monospace",
          fontSize:"clamp(.40rem,1.2vw,.50rem)", fontWeight:700,
          letterSpacing:".18em", textTransform:"uppercase",
          cursor:"none", transition:"all .22s ease",
          flex: isMobile?1:"none", whiteSpace:"nowrap",
        }}
      >
        <Ic.Dl/> Resume
      </motion.button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL INDICATOR
═══════════════════════════════════════════════════════════════ */
function ScrollHint({ opacity }) {
  return (
    <motion.div
      style={{ opacity, position:"absolute", bottom:36, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:8, pointerEvents:"none" }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:3.0 }}
    >
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.22rem,.64vw,.27rem)", textTransform:"uppercase", letterSpacing:".44em", color:T.stone }}>scroll</span>
      <div style={{ width:15, height:24, border:`1px solid ${T.bN}`, borderRadius:100, display:"flex", justifyContent:"center", padding:"3px 0" }}>
        <motion.div
          animate={{ y:[0,9,0], opacity:[.8,0,.8] }}
          transition={{ duration:1.9, repeat:Infinity, ease:"easeInOut" }}
          style={{ width:2, height:5, borderRadius:100, background:T.ember }}
        />
      </div>
    </motion.div>
  );
}

/* name flip char */
function FC({ ch, delay, accent }) {
  return (
    <motion.span
      initial={{ opacity:0, y:26, rotateX:-52 }}
      animate={{ opacity:1, y:0, rotateX:0 }}
      transition={{ delay, duration:.62, ease:E }}
      style={{ display:"inline-block", transformStyle:"preserve-3d", color: accent ? T.ember : T.text }}
    >{ch}</motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TECH TICKER
═══════════════════════════════════════════════════════════════ */
function Ticker() {
  const items = ["WebGL","Three.js","React","Node.js","TypeScript","GLSL","Next.js","Framer","PostgreSQL","Docker","GSAP","Prisma"];
  const rep   = [...items,...items,...items];
  return (
    <div style={{ overflow:"hidden", position:"absolute", bottom:0, left:0, right:0, height:30, background:`rgba(5,6,8,.96)`, borderTop:`1px solid ${T.bN}`, zIndex:20, display:"flex", alignItems:"center" }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:80, background:`linear-gradient(to right, ${T.bg}, transparent)`, zIndex:2, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:80, background:`linear-gradient(to left, ${T.bg}, transparent)`, zIndex:2, pointerEvents:"none" }}/>
      <motion.div
        animate={{ x:[0,"-33.33%"] }}
        transition={{ duration:30, repeat:Infinity, ease:"linear" }}
        style={{ display:"flex", alignItems:"center", whiteSpace:"nowrap", willChange:"transform" }}
      >
        {rep.map((item, i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:".6rem", paddingRight:"2rem" }}>
            <span style={{ width:3, height:3, borderRadius:"50%", background:`rgba(200,84,26,${i%3===0?.7:.3})`, flexShrink:0 }}/>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.27rem,.68vw,.32rem)", letterSpacing:".20em", textTransform:"uppercase", color: i%3===0 ? T.slate : T.stone }}>
              {item}
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CINEMATIC BG LAYER — CSS animated rays + parallax nebula
═══════════════════════════════════════════════════════════════ */
function CinematicBg({ isMobile }) {
  return (
    <>
      {/* Slow rotating conic light rays */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        style={{
          position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          background:`conic-gradient(from 0deg at 68% 45%,
            transparent 0deg,
            rgba(200,84,26,0.018) 12deg,
            transparent 22deg,
            transparent 60deg,
            rgba(200,84,26,0.012) 72deg,
            transparent 84deg,
            transparent 130deg,
            rgba(200,84,26,0.010) 142deg,
            transparent 155deg,
            transparent 220deg,
            rgba(200,84,26,0.014) 232deg,
            transparent 246deg,
            transparent 310deg,
            rgba(200,84,26,0.016) 322deg,
            transparent 336deg,
            transparent 360deg
          )`,
        }}
      />
      {/* Slowly drifting ember vignette */}
      <motion.div
        animate={{ scale:[1, 1.08, 1], opacity:[0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position:"absolute", pointerEvents:"none", zIndex:0,
          right:"-10%", top:"10%",
          width:"55%", height:"65%",
          background:`radial-gradient(ellipse at center, rgba(200,84,26,0.055) 0%, transparent 68%)`,
          filter:"blur(40px)",
        }}
      />
      {/* secondary cool-toned glow for depth contrast */}
      <motion.div
        animate={{ x:[0,-30,0], y:[0,20,0] }}
        transition={{ duration:14, repeat:Infinity, ease:"easeInOut" }}
        style={{
          position:"absolute", pointerEvents:"none", zIndex:0,
          left:"5%", bottom:"15%",
          width:"30%", height:"40%",
          background:`radial-gradient(ellipse at center, rgba(80,50,200,0.022) 0%, transparent 70%)`,
          filter:"blur(50px)",
        }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════ */
export default function Hero() {
  const sectionRef = useRef(null);
  const { scrollY } = useScroll();

  const [time,   setTime]  = useState(new Date());
  const [mobile, setMobile]= useState(false);

  const mouseX = useMotionValue(.5);
  const mouseY = useMotionValue(.5);
  const mxS = useSpring(mouseX, { stiffness:38, damping:20 });
  const myS = useSpring(mouseY, { stiffness:38, damping:20 });
  const spotBg = useTransform([mxS,myS], ([x,y]) =>
    `radial-gradient(680px circle at ${x*100}% ${y*100}%, rgba(200,84,26,0.032), transparent 56%)`);

  const scrollOp = useTransform(scrollY, [0,350], [1,0]);
  const yP  = useSpring(useTransform(scrollY, [0,600], [0,-50]), { stiffness:38, damping:20 });
  const yL1 = useTransform(scrollY, [0,600], [0,-20]);
  const yL2 = useTransform(scrollY, [0,600], [0,-42]);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const check = () => setMobile(innerWidth < 1024);
    check(); window.addEventListener("resize", check); return () => window.removeEventListener("resize", check);
  }, []);

  const onMouseMove = useCallback(e => {
    if (mobile) return;
    const r = sectionRef.current?.getBoundingClientRect();
    if (r) { mouseX.set((e.clientX-r.left)/r.width); mouseY.set((e.clientY-r.top)/r.height); }
  }, [mobile, mouseX, mouseY]);

  const clock = useMemo(() =>
    time.toLocaleTimeString("en-US", { hour12:true, hour:"2-digit", minute:"2-digit", second:"2-digit" }), [time]);

  // ── CHANGED: split name to fit shorter ──
  const fname = "Perp".split("");        // shortened display
  const fnameFullAttr = "Perpetual";     // kept for semantics / aria
  const lname = "Okan".split("");

  return (
    <>
      {!mobile && <Cursor />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        a, button { cursor:none; }

        .hg {
          display:grid;
          grid-template-columns: 1fr minmax(0,1.1fr);
          grid-template-areas: "txt vis";
          align-items:center;
          gap: clamp(2rem,4.5vw,5.5rem);
          width:100%; max-width:1440px; margin:0 auto;
        }
        .hg-t { grid-area:txt; display:flex; flex-direction:column; }
        .hg-v { grid-area:vis; display:flex; justify-content:center; align-items:center; }

        @media (max-width:1023px) {
          .hg { grid-template-columns:1fr; grid-template-areas:"vis" "txt"; gap:clamp(1.5rem,5vw,2.2rem); text-align:center; }
          .eb  { justify-content:center !important; }
          .div { display:none !important; }
          .cta-row  { justify-content:center !important; }
          .stats    { justify-content:center !important; }
          .bio      { border-left:none !important; padding-left:0 !important; border-top:1px solid rgba(200,84,26,.13) !important; padding-top:.85rem !important; text-align:center !important; }
        }
        @media (max-width:480px) { .cta-row { flex-direction:column !important; } }

        @keyframes shimmer { from{transform:translateX(-140%) skewX(-14deg)} to{transform:translateX(340%) skewX(-14deg)} }
        .btn-primary::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent); animation:shimmer 3.4s infinite; }

        /* name — two stacked lines, compact */
        .hero-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(1.7rem, 4.6vw, 3.4rem);
          line-height: 0.90;
          letter-spacing: -0.030em;
          display: flex;
          flex-direction: column;
          gap: 0.06em;
        }
      `}</style>

      <section
        ref={sectionRef}
        onMouseMove={onMouseMove}
        style={{
          position:"relative", minHeight:"100vh",
          display:"flex", flexDirection:"column", justifyContent:"center",
          background:T.bg, overflow:"hidden",
          paddingTop:    mobile ? "calc(var(--navbar-height,70px) + 5rem)" : "calc(var(--navbar-height,70px) + 6rem)",
          paddingBottom: mobile ? "5.5rem" : "5rem",
          paddingLeft:   mobile ? "5%" : "6%",
          paddingRight:  mobile ? "5%" : "6%",
          cursor:        mobile ? "auto" : "none",
        }}
      >
        {/* cinematic CSS bg layer */}
        <CinematicBg isMobile={mobile} />

        {/* dot grid */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          backgroundImage:`radial-gradient(rgba(200,84,26,0.18) 1px, transparent 1px)`,
          backgroundSize:"48px 48px",
          maskImage:"radial-gradient(ellipse 75% 75% at 50% 50%, black 20%, transparent 72%)" }}/>

        {/* perspective floor lines */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <svg width="100%" height="100%" style={{ position:"absolute", inset:0 }}>
            {[...Array(9)].map((_,i) => (
              <motion.line key={i} x1={`${(i/8)*100}%`} y1="100%" x2="50%" y2="70%"
                stroke="rgba(200,84,26,0.035)" strokeWidth="0.5"
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.5+i*.05 }}/>
            ))}
            {[0,1,2,3].map(i => (
              <motion.ellipse key={i} cx="50%" cy="70%" rx={`${16+i*13}%`} ry={`${2.5+i*2.2}%`}
                fill="none" stroke="rgba(200,84,26,0.025)" strokeWidth="0.5"
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.8+i*.12 }}/>
            ))}
          </svg>
        </div>

        {/* WebGL */}
        <Scene isMobile={mobile} scrollY={scrollY} />

        {/* film grain */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:4, opacity:.022,
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize:"120px" }}/>

        {/* vignette */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:5,
          background:"radial-gradient(ellipse 88% 78% at 50% 50%, transparent 20%, rgba(5,6,8,.26) 52%, rgba(5,6,8,.80) 100%)" }}/>

        {/* readability scrim */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:5,
          background: mobile
            ? "linear-gradient(to bottom, rgba(5,6,8,.46) 0%, transparent 24%, rgba(5,6,8,.52) 100%)"
            : "linear-gradient(to right, rgba(5,6,8,.80) 0%, rgba(5,6,8,.12) 38%, transparent 52%)" }}/>

        {/* mouse light */}
        <motion.div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:5, background:spotBg }}/>

        {/* top line */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg, transparent, ${T.ember}38, transparent)`, zIndex:6, pointerEvents:"none" }}/>

        {/* content */}
        <div style={{ position:"relative", zIndex:10 }}>
          <motion.div style={{ y:yP }} className="hg">

            <motion.div className="hg-v" style={{ y:yL2 }}>
              <ProfileCard time={clock} isMobile={mobile} />
            </motion.div>

            <motion.div className="hg-t" style={{ gap: mobile?"clamp(.88rem,2.8vw,1.2rem)":"clamp(1.0rem,1.8vw,1.35rem)", y:yL1 }}>

              {!mobile && (
                <motion.div
                  initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:.28, duration:.55 }}
                  style={{ display:"inline-flex", alignItems:"center", gap:".40rem", padding:".24rem .72rem", borderRadius:7, alignSelf:"flex-start", background:"rgba(61,214,140,0.055)", border:"1px solid rgba(61,214,140,0.18)", backdropFilter:"blur(10px)" }}
                >
                  <motion.span animate={{ opacity:[1,.12,1] }} transition={{ duration:2.5, repeat:Infinity }}
                    style={{ width:5, height:5, borderRadius:"50%", background:T.green, display:"inline-block" }}/>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.28rem,.76vw,.36rem)", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(61,214,140,.80)", fontWeight:500 }}>Available for hire</span>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                transition={{ duration:.70, delay:.46 }}
                className="eb"
                style={{ display:"flex", alignItems:"center", gap:".65rem" }}
              >
                <div className="div" style={{ height:1, width:22, background:`linear-gradient(to right, transparent, ${T.ember})`, flexShrink:0 }}/>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.28rem,.84vw,.38rem)", fontWeight:500, letterSpacing:".22em", textTransform:"uppercase", color:T.stone, whiteSpace:"nowrap" }}>Web · 3D · Code</span>
                <div className="div" style={{ height:1, flex:1, background:`linear-gradient(to right, ${T.bO}, transparent)` }}/>
              </motion.div>

              <div style={{ display:"flex", flexDirection:"column", gap:".05rem" }}>
                <motion.p
                  initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.54, duration:.5 }}
                  style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.32rem,.94vw,.46rem)", fontWeight:500, letterSpacing:".26em", textTransform:"uppercase", color:T.stone, marginBottom:".08rem" }}
                >Hi, I&apos;m</motion.p>

                {/* ── NAME — two stacked lines ── */}
                <h1 aria-label="Perpetual Okan" className="hero-name">
                  <div>{"Perpetual".split("").map((ch, i) => <FC key={i} ch={ch} delay={.60+i*.030} />)}</div>
                  <div>{"Okan".split("").map((ch, i) => <FC key={i} ch={ch} delay={.86+i*.044} accent />)}</div>
                </h1>

                <motion.h2
                  initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.80, duration:.60 }}
                  style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.46rem,1.55vw,.76rem)", fontWeight:400, color:T.muted, marginTop:".38rem", letterSpacing:".03em" }}
                ><Typewriter /></motion.h2>
              </div>

              <motion.p
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.88, duration:.68 }}
                className="bio"
                style={{ fontFamily:"'DM Mono',monospace", fontSize:"clamp(.46rem,1.0vw,.66rem)", lineHeight:2.0, color:T.muted, maxWidth:430, borderLeft:`2px solid ${T.bO}`, paddingLeft:"1rem" }}
              >
                I build{" "}<span style={{ color:T.text }}>fast, beautiful websites</span>{" "}and apps — 3D visuals to solid back-end code. I make things that{" "}<span style={{ color:T.emberLt }}>work well</span>.
              </motion.p>

              {!mobile && <SkillBars />}

              <motion.div
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.18, duration:.65 }}
                className="stats"
                style={{ display:"flex", gap:".42rem", paddingTop:".50rem", borderTop:`1px solid ${T.bN}` }}
              >
                <Stat icon={<Ic.Code/>}  value="3D Web"   label="Expert"   delay={1.22} />
                <Stat icon={<Ic.Zap/>}   value="15+"      label="Projects" delay={1.30} />
                <Stat icon={<Ic.Globe/>} value="4+ Years" label="Building" delay={1.38} />
              </motion.div>

              <CTAButtons isMobile={mobile} />
            </motion.div>
          </motion.div>
        </div>

        <ScrollHint opacity={scrollOp} />
        <Ticker />
      </section>
    </>
  );
}
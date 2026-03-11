import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  motion, AnimatePresence, useInView,
  useMotionValue, useSpring, useTransform,
} from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════ */
const T = {
  bg:       "#040406",
  surface:  "#09090d",
  orange:   "#F97316",
  orangeD:  "#EA580C",
  orangeL:  "#fb923c",
  text:     "#ffffff",
  muted:    "rgba(255,255,255,0.42)",
  faint:    "rgba(255,255,255,0.12)",
  border:   "rgba(249,115,22,0.15)",
  borderB:  "rgba(255,255,255,0.07)",
  borderH:  "rgba(249,115,22,0.38)",
  green:    "#22c55e",
};

/* ═══════════════════════════════════════════════════════════════
   CONTACT INFO
═══════════════════════════════════════════════════════════════ */
const CONTACT_INFO = [
  {
    label:"Email", value:"Perpetualokan0@gmail.com",
    href:"mailto:Perpetualokan0@gmail.com", desc:"Drop me a line",
    icon:(
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
  {
    label:"Phone", value:"+234-810-355-8837",
    href:"tel:+2348103558837", desc:"Let's talk",
    icon:(
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    label:"Location", value:"Lagos, Nigeria",
    href:"#", desc:"Where I'm based",
    icon:(
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
];

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

#ct-root {
  --orange:   #F97316;
  --orangeD:  #EA580C;
  --bg:       #040406;
  --surface:  #09090d;
  --text:     #ffffff;
  --muted:    rgba(255,255,255,0.42);
  --faint:    rgba(255,255,255,0.12);
  --border:   rgba(249,115,22,0.15);
  --borderB:  rgba(255,255,255,0.07);
  --green:    #22c55e;
  font-family: 'Space Mono', monospace;
  background: var(--bg);
  color: var(--text);
}

/* ── scroll-bar ── */
#ct-root ::-webkit-scrollbar { width: 3px; }
#ct-root ::-webkit-scrollbar-track { background: transparent; }
#ct-root ::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.3); border-radius: 2px; }

/* ── grid ── */
.ct-outer {
  max-width: 1440px; margin: 0 auto;
  padding: 11rem 5% 5rem;
  position: relative; z-index: 10;
}
.ct-two-col {
  display: grid;
  grid-template-columns: 5fr 6fr;
  gap: 5rem;
  align-items: start;
}
.ct-three-col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
}

/* ── photo frame ── */
.ct-photo-wrap {
  position: relative;
  width: 100%; aspect-ratio: 3/4;
  max-height: 460px;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}

/* ── form ── */
.ct-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.6rem;
}
.ct-form-full { grid-column: 1 / -1; }

/* ── inputs ── */
.ct-input, .ct-textarea {
  width: 100%; background: transparent;
  border: none;
  border-bottom: 1.5px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 0.78rem 0;
  font-family: 'Space Mono', monospace;
  font-size: 0.74rem;
  outline: none; resize: none;
  transition: border-color 0.25s;
  display: block;
}
.ct-input::placeholder, .ct-textarea::placeholder {
  color: rgba(255,255,255,0.16);
}
.ct-input:focus, .ct-textarea:focus { outline: none; }
.ct-input:disabled, .ct-textarea:disabled { opacity: 0.5; }

/* ── label ── */
.ct-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.45rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.3em;
  display: block; margin-bottom: 0.5rem;
  transition: color 0.25s;
}

/* ── submit btn ── */
.ct-submit {
  display: inline-flex; align-items: center; gap: 0.6rem;
  padding: 0.9rem 2.2rem;
  font-family: 'Space Mono', monospace; font-size: 0.58rem;
  font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase;
  border: none; border-radius: 3px; cursor: pointer;
  transition: opacity 0.25s, box-shadow 0.25s;
}
.ct-submit:disabled { cursor: not-allowed; opacity: 0.7; }

/* ── section divider ── */
.ct-divider {
  height: 1px;
  background: linear-gradient(90deg, var(--orange) 0%, rgba(249,115,22,0.14) 40%, transparent 80%);
}

/* ── keyframes ── */
@keyframes ct-ping {
  75%, 100% { transform: scale(2.4); opacity: 0; }
}
@keyframes ct-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
@keyframes ct-scroll {
  0%   { top: 8px; opacity: 1; }
  75%  { top: 26px; opacity: 0; }
  100% { top: 8px; opacity: 0; }
}
@keyframes ct-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes ct-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
@keyframes ct-spin {
  to { transform: rotate(360deg); }
}
@keyframes ct-shimmer {
  0%   { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(250%) skewX(-12deg); }
}
@keyframes ct-orbit {
  to { transform: rotate(360deg); }
}

/* ── responsive ── */
@media (max-width: 1100px) {
  .ct-two-col { grid-template-columns: 1fr; gap: 4rem; }
  .ct-outer { padding: 9rem 5% 4rem; }
}
@media (max-width: 768px) {
  .ct-form-grid { grid-template-columns: 1fr; }
  .ct-form-full { grid-column: 1; }
  .ct-three-col { grid-template-columns: 1fr; }
  .ct-outer { padding: 8rem 5% 3rem; }
  .ct-photo-wrap { max-height: 320px; }
}
@media (max-width: 480px) {
  .ct-outer { padding: 7rem 4% 2.5rem; }
  .ct-photo-wrap { max-height: 240px; }
}
`;

/* ═══════════════════════════════════════════════════════════════
   TILT HOOK
═══════════════════════════════════════════════════════════════ */
function useTilt(strength = 10) {
  const ref = useRef(null);
  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const mxS = useSpring(mx, {stiffness:160,damping:20});
  const myS = useSpring(my, {stiffness:160,damping:20});
  const rotX = useTransform(myS, [-0.5, 0.5], [`${strength}deg`, `-${strength}deg`]);
  const rotY = useTransform(mxS, [-0.5, 0.5], [`-${strength}deg`, `${strength}deg`]);
  const glareBg = useTransform([mxS, myS], ([lx, ly]) =>
    `radial-gradient(circle 180px at ${(lx+0.5)*100}% ${(ly+0.5)*100}%, rgba(249,115,22,0.10) 0%, transparent 65%)`
  );
  const onMove = useCallback(e => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width  - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  }, [mx, my]);
  const onLeave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);
  return { ref, rotX, rotY, glareBg, onMove, onLeave };
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT CARD
═══════════════════════════════════════════════════════════════ */
function ContactCard({ info, index, inView }) {
  const tilt = useTilt(8);
  const [hov, setHov] = useState(false);

  return (
    <motion.a
      href={info.href}
      ref={tilt.ref}
      onMouseMove={tilt.onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { tilt.onLeave(); setHov(false); }}
      initial={{ opacity:0, x:-28 }}
      animate={inView ? {opacity:1, x:0} : {}}
      transition={{ duration:0.6, delay:0.7 + index*0.11, ease:[0.16,1,0.3,1] }}
      style={{
        rotateX: tilt.rotX, rotateY: tilt.rotY,
        transformStyle:"preserve-3d", perspective:"800px",
        display:"block", textDecoration:"none",
      }}>
      <div style={{
        position:"relative", overflow:"hidden",
        padding:"1.2rem 1.35rem", borderRadius:12,
        background: hov ? "rgba(18,14,10,0.98)" : "rgba(10,9,8,0.72)",
        border:`1px solid ${hov ? T.borderH : T.borderB}`,
        boxShadow: hov
          ? `0 28px 64px rgba(0,0,0,0.72), 0 0 0 1px rgba(249,115,22,0.06)`
          : `0 6px 28px rgba(0,0,0,0.38)`,
        transition:"border-color 0.28s, box-shadow 0.38s, background 0.28s",
        backdropFilter:"blur(16px)",
      }}>
        {/* Accent top line */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg, transparent, ${T.orange}, transparent)`,
          opacity: hov ? 1 : 0, transition:"opacity 0.32s",
          borderRadius:"12px 12px 0 0",
        }}/>
        {/* Glare */}
        <motion.div style={{
          position:"absolute", inset:0, borderRadius:12,
          pointerEvents:"none", background:tilt.glareBg,
          opacity: hov ? 1 : 0, transition:"opacity 0.28s",
        }}/>
        {/* Bottom sweep */}
        <div style={{
          position:"absolute", bottom:0, left:0, height:1,
          background:`linear-gradient(90deg, ${T.orange}, transparent)`,
          width: hov ? "100%" : "0%",
          transition:"width 0.55s cubic-bezier(0.16,1,0.3,1)",
          borderRadius:"0 0 12px 12px",
        }}/>

        <div style={{
          position:"relative", display:"flex", alignItems:"center",
          justifyContent:"space-between", transform:"translateZ(22px)",
        }}>
          <div style={{display:"flex", alignItems:"center", gap:"0.9rem"}}>
            {/* Icon box */}
            <div style={{
              width:38, height:38, borderRadius:9, flexShrink:0,
              background: hov ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.04)",
              border:`1px solid ${hov ? "rgba(249,115,22,0.28)" : T.borderB}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              color: hov ? T.orange : "rgba(255,255,255,0.38)",
              transition:"all 0.28s",
              transform: hov ? "scale(1.1) rotate(4deg)" : "scale(1) rotate(0deg)",
            }}>
              {info.icon}
            </div>
            <div>
              <p style={{
                fontFamily:"'Space Mono', monospace", fontSize:"0.42rem",
                fontWeight:700, textTransform:"uppercase", letterSpacing:"0.28em",
                color:T.orange, marginBottom:3,
              }}>{info.label}</p>
              <p style={{
                fontFamily:"'Space Mono', monospace", fontSize:"0.68rem",
                color: hov ? T.text : "rgba(255,255,255,0.72)",
                transition:"color 0.22s", marginBottom:2, fontWeight:500,
              }}>{info.value}</p>
              <p style={{
                fontFamily:"'Space Mono', monospace", fontSize:"0.5rem",
                color:T.muted,
              }}>{info.desc}</p>
            </div>
          </div>
          <motion.div
            animate={{opacity: hov ? 1 : 0, x: hov ? 0 : 10, y: hov ? 0 : 10}}
            transition={{duration:0.22}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.a>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT BOX  (metrics grid)
═══════════════════════════════════════════════════════════════ */
function StatBox({ num, label, delay, inView }) {
  return (
    <motion.div
      initial={{opacity:0, y:18}}
      animate={inView ? {opacity:1, y:0} : {}}
      transition={{duration:0.6, delay, ease:[0.16,1,0.3,1]}}
      style={{
        padding:"1.4rem 1.2rem", borderRight:`1px solid ${T.borderB}`,
        borderBottom:`1px solid ${T.borderB}`,
      }}>
      <div style={{
        fontFamily:"'Cormorant Garamond', serif",
        fontSize:"clamp(2rem,3.5vw,2.8rem)", fontWeight:300,
        color:T.text, lineHeight:1, marginBottom:6,
        letterSpacing:"-0.02em",
      }}>{num}</div>
      <div style={{
        fontFamily:"'Space Mono', monospace", fontSize:"0.4rem",
        fontWeight:700, textTransform:"uppercase", letterSpacing:"0.3em",
        color:T.muted,
      }}>{label}</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHOTO SECTION
═══════════════════════════════════════════════════════════════ */
function PhotoSection({ inView }) {
  const tilt = useTilt(6);
  const [hov, setHov] = useState(false);
  // ── Replace the src below with your own photo URL ──
  const PHOTO_SRC = "/contact_image.jpeg"; // your photo path

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { tilt.onLeave(); setHov(false); }}
      initial={{opacity:0, y:32}}
      animate={inView ? {opacity:1, y:0} : {}}
      transition={{duration:0.9, delay:0.3, ease:[0.16,1,0.3,1]}}
      style={{
        rotateX: tilt.rotX, rotateY: tilt.rotY,
        transformStyle:"preserve-3d", perspective:"1000px",
      }}>

      {/* Orbit ring behind */}
      <motion.div
        animate={{rotate:360}}
        transition={{duration:22, repeat:Infinity, ease:"linear"}}
        style={{
          position:"absolute", inset:"-12%", borderRadius:"50%",
          border:"1px dashed rgba(249,115,22,0.12)",
          pointerEvents:"none", zIndex:0,
        }}/>
      <motion.div
        animate={{rotate:-360}}
        transition={{duration:34, repeat:Infinity, ease:"linear"}}
        style={{
          position:"absolute", inset:"-24%", borderRadius:"50%",
          border:"1px dashed rgba(249,115,22,0.06)",
          pointerEvents:"none", zIndex:0,
        }}/>

      {/* Main photo card */}
      <div className="ct-photo-wrap" style={{
        border:`1px solid ${hov ? T.borderH : T.borderB}`,
        boxShadow: hov
          ? `0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(249,115,22,0.08), 0 0 60px rgba(249,115,22,0.1)`
          : `0 20px 60px rgba(0,0,0,0.6)`,
        transition:"border-color 0.3s, box-shadow 0.4s",
        position:"relative", overflow:"hidden",
      }}>
        {/* Glare overlay */}
        <motion.div style={{
          position:"absolute", inset:0, zIndex:4, pointerEvents:"none",
          background: tilt.glareBg, opacity: hov ? 1 : 0,
          transition:"opacity 0.3s",
        }}/>

        {/* Top accent */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:3,
          background:`linear-gradient(90deg, transparent, ${T.orange}, transparent)`,
          zIndex:5, opacity: hov ? 1 : 0.4, transition:"opacity 0.3s",
        }}/>

        {/* Corner brackets */}
        {["top-left","top-right","bottom-left","bottom-right"].map(pos => {
          const isTop    = pos.includes("top");
          const isLeft   = pos.includes("left");
          return (
            <div key={pos} style={{
              position:"absolute", width:20, height:20, zIndex:5,
              top:  isTop    ? 10 : undefined,
              bottom: !isTop ? 10 : undefined,
              left: isLeft   ? 10 : undefined,
              right: !isLeft ? 10 : undefined,
              borderTop:    isTop    ? `1.5px solid ${T.orange}` : undefined,
              borderBottom: !isTop   ? `1.5px solid ${T.orange}` : undefined,
              borderLeft:   isLeft   ? `1.5px solid ${T.orange}` : undefined,
              borderRight:  !isLeft  ? `1.5px solid ${T.orange}` : undefined,
              opacity: hov ? 1 : 0.4, transition:"opacity 0.3s",
            }}/>
          );
        })}

        {PHOTO_SRC ? (
          /* ── REAL PHOTO ── */
          <img
            src={PHOTO_SRC}
            alt="Profile"
            style={{
              width:"100%", height:"100%", objectFit:"cover",
              display:"block", filter: hov ? "brightness(1.05) contrast(1.02)" : "brightness(0.92)",
              transition:"filter 0.4s",
            }}/>
        ) : (
          /* ── PLACEHOLDER ── */
          <div style={{
            width:"100%", height:"100%",
            background:"linear-gradient(160deg, rgba(20,16,12,0.98), rgba(8,6,4,0.99))",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:"1.2rem",
          }}>
            {/* Cinematic silhouette */}
            <motion.div
              animate={{y:[0,-8,0], filter:["brightness(0.8)","brightness(1.1)","brightness(0.8)"]}}
              transition={{duration:5, repeat:Infinity, ease:"easeInOut"}}
              style={{position:"relative"}}>
              {/* Glow aura */}
              <motion.div
                animate={{scale:[1,1.18,1], opacity:[0.3,0.6,0.3]}}
                transition={{duration:3, repeat:Infinity, ease:"easeInOut"}}
                style={{
                  position:"absolute", inset:"-40%", borderRadius:"50%",
                  background:`radial-gradient(circle, ${T.orange}28 0%, transparent 70%)`,
                  filter:"blur(20px)",
                }}/>

              {/* Person SVG silhouette */}
              <svg width="90" height="120" viewBox="0 0 90 120" fill="none">
                <defs>
                  <radialGradient id="phGrad" cx="50%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="rgba(249,115,22,0.55)"/>
                    <stop offset="100%" stopColor="rgba(249,115,22,0.08)"/>
                  </radialGradient>
                  <filter id="phGlow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <g filter="url(#phGlow)">
                  {/* Head */}
                  <ellipse cx="45" cy="28" rx="18" ry="21" fill="url(#phGrad)"/>
                  {/* Neck */}
                  <rect x="38" y="47" width="14" height="10" rx="3" fill="url(#phGrad)" opacity="0.7"/>
                  {/* Shoulders + torso */}
                  <path d="M12 118 C8 90 16 70 30 62 Q38 58 45 58 Q52 58 60 62 C74 70 82 90 78 118Z"
                    fill="url(#phGrad)" opacity="0.82"/>
                </g>
              </svg>
            </motion.div>

            {/* Upload label */}
            <div style={{textAlign:"center"}}>
              <div style={{
                fontFamily:"'Space Mono', monospace", fontSize:"0.42rem",
                fontWeight:700, textTransform:"uppercase", letterSpacing:"0.32em",
                color:T.orange, marginBottom:6, opacity:0.85,
              }}>Your Photo Here</div>
              <div style={{
                fontFamily:"'Space Mono', monospace", fontSize:"0.46rem",
                color:T.muted, lineHeight:1.7, maxWidth:160, textAlign:"center",
              }}>
                Replace{" "}
                <code style={{color:"rgba(249,115,22,0.8)", fontSize:"0.48rem"}}>PHOTO_SRC</code>
                {" "}with<br/>your image URL
              </div>
            </div>

            {/* Scan lines */}
            <div style={{
              position:"absolute", inset:0, pointerEvents:"none",
              backgroundImage:"repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.013) 3px, rgba(255,255,255,0.013) 4px)",
              zIndex:2,
            }}/>
          </div>
        )}
      </div>

      {/* Floating availability badge */}
      <motion.div
        animate={{y:[0,-5,0]}}
        transition={{duration:3.5, repeat:Infinity, ease:"easeInOut", delay:1}}
        style={{
          position:"absolute", bottom:-16, right:-12,
          background:"rgba(8,6,4,0.96)",
          border:`1px solid rgba(34,197,94,0.35)`,
          borderRadius:8, padding:"0.6rem 0.9rem",
          display:"flex", alignItems:"center", gap:"0.55rem",
          boxShadow:"0 14px 38px rgba(0,0,0,0.6), 0 0 20px rgba(34,197,94,0.1)",
          backdropFilter:"blur(14px)",
          zIndex:10, transform:"translateZ(30px)",
        }}>
        <span style={{position:"relative", display:"flex", width:8, height:8, flexShrink:0}}>
          <span style={{
            position:"absolute", inset:0, borderRadius:"50%",
            background:T.green, opacity:0.65,
            animation:"ct-ping 1.5s infinite",
          }}/>
          <span style={{
            position:"relative", width:8, height:8, borderRadius:"50%",
            background:T.green,
            boxShadow:"0 0 8px rgba(34,197,94,0.8)",
            display:"inline-flex",
          }}/>
        </span>
        <span style={{
          fontFamily:"'Space Mono', monospace", fontSize:"0.42rem",
          fontWeight:700, textTransform:"uppercase", letterSpacing:"0.22em",
          color:"rgba(255,255,255,0.55)",
          whiteSpace:"nowrap",
        }}>Available Now</span>
      </motion.div>


    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FIELD
═══════════════════════════════════════════════════════════════ */
function Field({ label, name, type, required, placeholder, rows, focused, onFocus, onBlur, disabled }) {
  const isActive = focused === name;
  const Tag = rows ? "textarea" : "input";
  return (
    <div style={{display:"flex", flexDirection:"column"}}>
      <label className="ct-label" style={{color: isActive ? T.orange : T.muted}}>
        {label}{required && " *"}
      </label>
      <div style={{position:"relative"}}>
        <Tag
          name={name} type={type} required={required} rows={rows}
          placeholder={placeholder} disabled={disabled}
          onFocus={onFocus} onBlur={onBlur}
          className={rows ? "ct-textarea" : "ct-input"}
          style={{borderBottomColor: isActive ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.1)"}}
        />
        <motion.div
          initial={{scaleX:0}}
          animate={{scaleX: isActive ? 1 : 0}}
          transition={{duration:0.34, ease:[0.16,1,0.3,1]}}
          style={{
            position:"absolute", bottom:0, left:0, right:0, height:2,
            background:`linear-gradient(90deg, ${T.orange}, ${T.orangeD})`,
            transformOrigin:"left", borderRadius:1,
          }}/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CINEMATIC BACKGROUND
═══════════════════════════════════════════════════════════════ */
function CinematicBg() {
  return (
    <>
      {/* Grid */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:`linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)`,
        backgroundSize:"64px 64px",
        maskImage:"radial-gradient(ellipse 100% 70% at 50% 0%, black 30%, transparent 100%)",
        WebkitMaskImage:"radial-gradient(ellipse 100% 70% at 50% 0%, black 30%, transparent 100%)",
      }}/>

      {/* Ambient glows */}
      <div style={{
        position:"absolute", top:"-8%", left:"8%", width:700, height:700,
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(249,115,22,0.065) 0%, transparent 65%)",
        filter:"blur(120px)", pointerEvents:"none", zIndex:0,
      }}/>
      <div style={{
        position:"absolute", bottom:"5%", right:"3%", width:500, height:500,
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(234,88,12,0.045) 0%, transparent 65%)",
        filter:"blur(90px)", pointerEvents:"none", zIndex:0,
      }}/>
      <div style={{
        position:"absolute", top:"40%", left:"50%", width:400, height:400,
        transform:"translateX(-50%)",
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(249,115,22,0.03) 0%, transparent 65%)",
        filter:"blur(80px)", pointerEvents:"none", zIndex:0,
      }}/>

      {/* Noise texture */}
      <svg aria-hidden="true" style={{
        position:"absolute", inset:0, width:"100%", height:"100%",
        pointerEvents:"none", zIndex:1, opacity:0.03, mixBlendMode:"overlay",
      }}>
        <filter id="ctNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#ctNoise)"/>
      </svg>

      {/* Scan lines */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:1,
        backgroundImage:"repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)",
      }}/>

      {/* Floating particles */}
      {Array.from({length:14}).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position:"absolute",
            left:`${8 + (i * 6.5) % 88}%`,
            top:`${10 + (i * 7.3) % 80}%`,
            width: 1 + (i%3)*0.6,
            height: 1 + (i%3)*0.6,
            borderRadius:"50%",
            background: i%5===0 ? T.orange : "rgba(255,255,255,0.35)",
            boxShadow: i%5===0 ? `0 0 ${4+i%3*2}px ${T.orange}66` : "none",
            zIndex:2, pointerEvents:"none",
          }}
          animate={{
            y:[0, -(12+i*3), 0],
            x:[0, (i%2===0?6:-6), 0],
            opacity:[0, 0.5+i%3*0.12, 0],
          }}
          transition={{
            duration:6+i*1.1, repeat:Infinity, ease:"easeInOut",
            delay: i*0.7,
          }}/>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CONTACT COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [status,     setStatus]     = useState(null); // "success" | "error" | null
  const [focused,    setFocused]    = useState(null);

  const headerRef = useRef(null);
  const formRef   = useRef(null);
  const formEl    = useRef(null);
  const headerInView = useInView(headerRef, {once:true});
  const formInView   = useInView(formRef,   {once:true, margin:"-80px"});

  /* Form 3D tilt */
  const formMx  = useMotionValue(0);
  const formMy  = useMotionValue(0);
  const formMxS = useSpring(formMx, {stiffness:60, damping:22});
  const formMyS = useSpring(formMy, {stiffness:60, damping:22});
  const formRotX  = useTransform(formMyS, [-0.5,0.5], ["4deg","-4deg"]);
  const formRotY  = useTransform(formMxS, [-0.5,0.5], ["-4deg","4deg"]);
  const formGlare = useTransform([formMxS, formMyS], ([lx,ly]) =>
    `radial-gradient(circle 400px at ${(lx+0.5)*100}% ${(ly+0.5)*100}%, rgba(249,115,22,0.06) 0%, transparent 65%)`
  );
  const [formHov, setFormHov] = useState(false);

  const onFormMouseMove = useCallback(e => {
    const r = formEl.current?.getBoundingClientRect();
    if (!r) return;
    formMx.set((e.clientX - r.left) / r.width  - 0.5);
    formMy.set((e.clientY - r.top)  / r.height - 0.5);
  }, [formMx, formMy]);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.target);
    data.append("access_key", "f03b99d4-599d-460a-998d-62046420b9ba");
    try {
      const res  = await fetch("https://api.web3forms.com/submit", {method:"POST", body:data});
      const json = await res.json();
      setStatus(json.success ? "success" : "error");
      if (json.success) e.target.reset();
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus(null), 5000);
    }
  }

  return (
    <section id="contact" style={{
      position:"relative", background:T.bg, color:T.text,
      overflow:"hidden", paddingTop:1,
    }}>
      <style>{CSS}</style>
      <div id="ct-root">

        <CinematicBg/>

        <div className="ct-outer">

          {/* ══ HEADER ══════════════════════════════════════════════ */}
          <header ref={headerRef} style={{
            marginBottom:"4.5rem", position:"relative", paddingBottom:"3rem",
          }}>
            {/* Eyebrow pill */}
            <motion.div
              initial={{opacity:0, x:-22}} animate={headerInView ? {opacity:1, x:0} : {}}
              transition={{duration:0.7}}
              style={{display:"flex", alignItems:"center", gap:"0.7rem", marginBottom:"1.8rem"}}>
              <div style={{height:1, width:26, background:`linear-gradient(to right, transparent, ${T.orange})`, flexShrink:0}}/>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:"0.42rem",
                padding:"0.3rem 0.85rem", borderRadius:100,
                background:"rgba(249,115,22,0.07)", border:"1px solid rgba(249,115,22,0.22)",
                backdropFilter:"blur(10px)",
              }}>
                <span style={{
                  width:6, height:6, borderRadius:"50%", background:T.orange,
                  boxShadow:`0 0 9px ${T.orange}`, display:"inline-block",
                  animation:"ct-pulse 2s infinite",
                }}/>
                <span style={{
                  fontFamily:"'Space Mono', monospace", fontSize:"0.48rem",
                  fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase",
                  color:"rgba(251,146,60,0.9)",
                }}>Get In Touch</span>
              </div>
              <div style={{height:1, flex:1, background:`linear-gradient(to right, ${T.border}, transparent)`}}/>
            </motion.div>

            {/* Ghost watermark */}
            <div style={{
              position:"absolute", top:"-0.5rem", left:"-0.3rem",
              fontFamily:"'Cormorant Garamond', serif",
              fontSize:"clamp(5rem,14vw,13rem)", fontWeight:300,
              color:"rgba(249,115,22,0.03)", lineHeight:1,
              pointerEvents:"none", userSelect:"none", letterSpacing:"-0.04em",
              zIndex:0,
            }}>CONTACT</div>

            {/* Headline */}
            <motion.h2
              initial={{opacity:0, y:28}} animate={headerInView ? {opacity:1, y:0} : {}}
              transition={{duration:0.9, delay:0.15, ease:[0.16,1,0.3,1]}}
              style={{
                fontFamily:"'Cormorant Garamond', serif",
                fontSize:"clamp(2.8rem,7vw,7.2rem)",
                fontWeight:300, lineHeight:0.88, letterSpacing:"-0.02em",
                color:T.text, margin:"0 0 1.4rem 0", position:"relative", zIndex:1,
              }}>
              Let's Start A
              <br/>
              <span style={{
                fontStyle:"italic",
                background:`linear-gradient(135deg, ${T.orange} 0%, ${T.orangeL} 50%, rgba(255,255,255,0.5) 100%)`,
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                backgroundClip:"text",
              }}>Conversation.</span>
            </motion.h2>

            <motion.p
              initial={{opacity:0}} animate={headerInView ? {opacity:1} : {}}
              transition={{duration:0.8, delay:0.5}}
              style={{
                fontFamily:"'Space Mono', monospace",
                fontSize:"clamp(0.64rem,1.1vw,0.78rem)",
                color:T.muted, maxWidth:500, lineHeight:1.95,
                borderLeft:`2px solid rgba(249,115,22,0.22)`, paddingLeft:"1rem",
                margin:0,
              }}>
              Have a project in mind or just want to discuss ideas? My inbox is always open for collaboration and interesting conversations.
            </motion.p>

            {/* Header divider */}
            <motion.div
              initial={{scaleX:0}} animate={headerInView ? {scaleX:1} : {}}
              transition={{duration:1.1, delay:0.55}}
              className="ct-divider"
              style={{
                position:"absolute", bottom:0, left:0, right:0,
                transformOrigin:"left",
              }}/>
          </header>

          {/* ══ TWO-COLUMN ══════════════════════════════════════════ */}
          <div className="ct-two-col">

            {/* ── LEFT COLUMN ────────────────────────────────────── */}
            <div style={{display:"flex", flexDirection:"column", gap:"2.8rem"}}>

              {/* Photo + badges */}
              <PhotoSection inView={headerInView}/>

              {/* Intro text */}
              <motion.div
                initial={{opacity:0, x:-22}} animate={headerInView ? {opacity:1, x:0} : {}}
                transition={{duration:0.7, delay:0.6}}>
                <h3 style={{
                  fontFamily:"'Cormorant Garamond', serif",
                  fontSize:"clamp(1.2rem,2.2vw,1.55rem)", fontWeight:400,
                  color:"rgba(255,255,255,0.88)", letterSpacing:"-0.01em",
                  margin:"0 0 0.7rem 0",
                }}>Ready to bring your ideas to life?</h3>
                <p style={{
                  fontFamily:"'Space Mono', monospace", fontSize:"0.66rem",
                  color:T.muted, lineHeight:1.9, margin:0,
                }}>Whether it's a complex web application, an interactive experience, or a creative digital project — let's make it happen together.</p>
              </motion.div>

              {/* Stats grid */}
              <motion.div
                initial={{opacity:0}} animate={headerInView ? {opacity:1} : {}}
                transition={{duration:0.6, delay:0.65}}
                style={{
                  border:`1px solid ${T.borderB}`,
                  borderRadius:4, overflow:"hidden",
                }}>
                <div className="ct-three-col">
                  <StatBox num="50+" label="Projects Done"     delay={0.7}  inView={headerInView}/>
                  <StatBox num="32"  label="Happy Clients"     delay={0.8}  inView={headerInView}/>
                </div>
              </motion.div>

              {/* Contact cards */}
              <div style={{display:"flex", flexDirection:"column", gap:"0.7rem"}}>
                {CONTACT_INFO.map((info, i) => (
                  <ContactCard key={i} info={info} index={i} inView={headerInView}/>
                ))}
              </div>

              {/* Availability */}
              <motion.div
                initial={{opacity:0}} animate={headerInView ? {opacity:1} : {}}
                transition={{duration:0.7, delay:1.2}}
                style={{
                  display:"flex", alignItems:"center", gap:"0.7rem",
                  paddingTop:"1.2rem", borderTop:`1px solid ${T.borderB}`,
                }}>
                <span style={{position:"relative", display:"flex", width:10, height:10, flexShrink:0}}>
                  <span style={{
                    position:"absolute", inset:0, borderRadius:"50%",
                    background:T.green, opacity:0.65,
                    animation:"ct-ping 1.5s infinite",
                  }}/>
                  <span style={{
                    position:"relative", width:10, height:10, borderRadius:"50%",
                    background:T.green, boxShadow:"0 0 8px rgba(34,197,94,0.8)",
                    display:"inline-flex",
                  }}/>
                </span>
                <span style={{
                  fontFamily:"'Space Mono', monospace", fontSize:"0.48rem",
                  fontWeight:700, textTransform:"uppercase", letterSpacing:"0.24em",
                  color:T.faint,
                }}>Available for projects</span>
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN: 3D FORM ───────────────────────────── */}
            <motion.div
              ref={formRef}
              initial={{opacity:0, y:44}} animate={formInView ? {opacity:1, y:0} : {}}
              transition={{duration:1.0, delay:0.3, ease:[0.16,1,0.3,1]}}>

              <motion.div
                ref={formEl}
                onMouseMove={onFormMouseMove}
                onMouseEnter={() => setFormHov(true)}
                onMouseLeave={() => {
                  formMx.set(0); formMy.set(0); setFormHov(false);
                }}
                style={{
                  rotateX:formRotX, rotateY:formRotY,
                  transformStyle:"preserve-3d", perspective:"1200px",
                }}>
                <div style={{
                  position:"relative", overflow:"hidden",
                  padding:"2.5rem clamp(1.5rem,3vw,2.5rem)",
                  borderRadius:20,
                  background:"linear-gradient(160deg, rgba(14,11,9,0.98) 0%, rgba(7,6,5,0.99) 100%)",
                  border:`1px solid ${formHov ? T.borderH : T.borderB}`,
                  boxShadow: formHov
                    ? `0 64px 130px rgba(0,0,0,0.88), 0 0 0 1px rgba(249,115,22,0.07), 0 0 80px rgba(249,115,22,0.06)`
                    : `0 22px 64px rgba(0,0,0,0.65)`,
                  transition:"border-color 0.35s, box-shadow 0.45s",
                  backdropFilter:"blur(22px)",
                }}>
                  {/* Top accent */}
                  <div style={{
                    position:"absolute", top:0, left:0, right:0, height:2,
                    background:`linear-gradient(90deg, transparent, ${T.orange} 40%, transparent)`,
                    opacity: formHov ? 1 : 0, transition:"opacity 0.4s",
                  }}/>
                  {/* Glare */}
                  <motion.div style={{
                    position:"absolute", inset:0, borderRadius:20,
                    pointerEvents:"none", background:formGlare,
                    opacity: formHov ? 1 : 0, transition:"opacity 0.35s",
                  }}/>
                  {/* Corner brackets */}
                  {["tl","tr","bl","br"].map(c => (
                    <div key={c} style={{
                      position:"absolute",
                      width:18, height:18,
                      top:    c[0]==="t" ? 12 : undefined,
                      bottom: c[0]==="b" ? 12 : undefined,
                      left:   c[1]==="l" ? 12 : undefined,
                      right:  c[1]==="r" ? 12 : undefined,
                      borderTop:    c[0]==="t" ? `1.5px solid rgba(249,115,22,0.4)` : undefined,
                      borderBottom: c[0]==="b" ? `1.5px solid rgba(249,115,22,0.4)` : undefined,
                      borderLeft:   c[1]==="l" ? `1.5px solid rgba(249,115,22,0.4)` : undefined,
                      borderRight:  c[1]==="r" ? `1.5px solid rgba(249,115,22,0.4)` : undefined,
                      opacity: formHov ? 0.8 : 0.3, transition:"opacity 0.3s",
                      zIndex:5,
                    }}/>
                  ))}

                  <div style={{position:"relative", transform:"translateZ(28px)"}}>
                    {/* Form header */}
                    <div style={{marginBottom:"2rem"}}>
                      <div style={{
                        display:"flex", alignItems:"center", gap:"0.55rem", marginBottom:"0.55rem",
                      }}>
                        <div style={{
                          width:16, height:2,
                          background:`linear-gradient(to right, ${T.orange}, transparent)`,
                          borderRadius:2,
                        }}/>
                        <span style={{
                          fontFamily:"'Space Mono', monospace", fontSize:"0.46rem",
                          fontWeight:700, textTransform:"uppercase", letterSpacing:"0.3em",
                          color:T.orange,
                        }}>Send a Message</span>
                      </div>
                      <p style={{
                        fontFamily:"'Space Mono', monospace", fontSize:"0.62rem",
                        color:T.muted, margin:0, lineHeight:1.75,
                      }}>Fill out the form and I'll get back within 24 hours.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} style={{display:"flex", flexDirection:"column", gap:"1.7rem"}}>
                      <div className="ct-form-grid">
                        <Field label="Full Name"    name="name"    type="text"  required
                          placeholder="John Doe"
                          focused={focused} onFocus={()=>setFocused("name")}    onBlur={()=>setFocused(null)} disabled={submitting}/>
                        <Field label="Email Address" name="email"  type="email" required
                          placeholder="john@example.com"
                          focused={focused} onFocus={()=>setFocused("email")}   onBlur={()=>setFocused(null)} disabled={submitting}/>
                        <div className="ct-form-full">
                          <Field label="Subject" name="subject" type="text"
                            placeholder="Project inquiry..."
                            focused={focused} onFocus={()=>setFocused("subject")} onBlur={()=>setFocused(null)} disabled={submitting}/>
                        </div>
                        <div className="ct-form-full">
                          <Field label="Your Message" name="message" required rows={5}
                            placeholder="Tell me about your project or idea..."
                            focused={focused} onFocus={()=>setFocused("message")} onBlur={()=>setFocused(null)} disabled={submitting}/>
                        </div>
                      </div>

                      {/* Submit row */}
                      <div style={{
                        display:"flex", alignItems:"center",
                        justifyContent:"space-between", paddingTop:"0.4rem",
                        flexWrap:"wrap", gap:"1rem",
                      }}>
                        <motion.button
                          type="submit"
                          disabled={submitting || status==="success"}
                          className="ct-submit"
                          whileHover={{scale:1.04, boxShadow:`0 18px 48px rgba(249,115,22,0.44)`}}
                          whileTap={{scale:0.96}}
                          style={{
                            background: status==="success"
                              ? "rgba(34,197,94,0.14)"
                              : `linear-gradient(135deg, ${T.orange}, ${T.orangeD})`,
                            border: status==="success"
                              ? "1px solid rgba(34,197,94,0.4)"
                              : "1px solid transparent",
                            color:"#fff",
                            boxShadow: status==="success"
                              ? "none"
                              : `0 8px 28px rgba(249,115,22,0.32), inset 0 1px 0 rgba(255,255,255,0.16)`,
                          }}>
                          {submitting ? (
                            <>
                              <motion.span
                                animate={{rotate:360}}
                                transition={{duration:0.85, repeat:Infinity, ease:"linear"}}
                                style={{display:"inline-flex"}}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                </svg>
                              </motion.span>
                              Sending…
                            </>
                          ) : status==="success" ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Sent!
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                              </svg>
                              Send Message
                            </>
                          )}
                        </motion.button>

                        <span style={{
                          fontFamily:"'Space Mono', monospace", fontSize:"0.46rem",
                          fontWeight:700, textTransform:"uppercase", letterSpacing:"0.22em",
                          color:T.faint,
                        }}>Response within 24h</span>
                      </div>

                      {/* Status */}
                      <AnimatePresence mode="wait">
                        {status && (
                          <motion.div
                            initial={{opacity:0, y:-10, scale:0.96}}
                            animate={{opacity:1, y:0, scale:1}}
                            exit={{opacity:0, y:-10}}
                            transition={{duration:0.32}}
                            style={{
                              display:"flex", alignItems:"center", gap:"0.7rem",
                              padding:"1rem 1.2rem", borderRadius:12,
                              background: status==="success"
                                ? "rgba(34,197,94,0.07)"
                                : "rgba(239,68,68,0.07)",
                              border:`1px solid ${status==="success"
                                ? "rgba(34,197,94,0.26)"
                                : "rgba(239,68,68,0.26)"}`,
                              color: status==="success" ? "#4ade80" : "#f87171",
                            }}>
                            {status==="success" ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                              </svg>
                            )}
                            <div>
                              <p style={{
                                fontFamily:"'Space Mono', monospace", fontSize:"0.52rem",
                                fontWeight:700, textTransform:"uppercase", letterSpacing:"0.18em",
                                margin:"0 0 3px 0",
                              }}>
                                {status==="success" ? "Message Delivered!" : "Sending Failed"}
                              </p>
                              <p style={{
                                fontFamily:"'Space Mono', monospace", fontSize:"0.5rem",
                                color:T.muted, margin:0,
                              }}>
                                {status==="success"
                                  ? "I'll get back to you soon!"
                                  : "Please try again or email directly."}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </div>
                </div>
              </motion.div>

              {/* WhatsApp quick link */}
              <motion.a
                href="https://wa.me/2348103558837"
                target="_blank" rel="noopener noreferrer"
                initial={{opacity:0, y:14}} animate={formInView ? {opacity:1, y:0} : {}}
                transition={{duration:0.7, delay:0.8}}
                whileHover={{x:5, boxShadow:`0 10px 36px rgba(37,211,102,0.18)`}}
                whileTap={{scale:0.97}}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  marginTop:"1rem", padding:"1rem 1.4rem",
                  borderRadius:12,
                  background:"rgba(37,211,102,0.05)",
                  border:"1px solid rgba(37,211,102,0.18)",
                  textDecoration:"none", color:T.text,
                  backdropFilter:"blur(10px)",
                  transition:"box-shadow 0.3s",
                }}>
                <div style={{display:"flex", alignItems:"center", gap:"0.8rem"}}>
                  {/* WhatsApp icon */}
                  <div style={{
                    width:34, height:34, borderRadius:9, flexShrink:0,
                    background:"rgba(37,211,102,0.1)",
                    border:"1px solid rgba(37,211,102,0.22)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{
                      fontFamily:"'Space Mono', monospace", fontSize:"0.44rem",
                      fontWeight:700, textTransform:"uppercase", letterSpacing:"0.26em",
                      color:"#25D366", marginBottom:3,
                    }}>WhatsApp</p>
                    <p style={{
                      fontFamily:"'Space Mono', monospace", fontSize:"0.66rem",
                      color:"rgba(255,255,255,0.65)",
                    }}>+234-810-355-8837</p>
                  </div>
                </div>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </motion.a>
            </motion.div>
          </div>

          {/* ══ FOOTER ROW ══════════════════════════════════════════ */}
          <motion.footer
            initial={{opacity:0}} animate={formInView ? {opacity:1} : {}}
            transition={{duration:0.8, delay:1.0}}
            style={{
              marginTop:"5rem", paddingTop:"2rem",
              borderTop:`1px solid ${T.borderB}`,
              display:"flex", alignItems:"center", justifyContent:"space-between",
              flexWrap:"wrap", gap:"1rem",
            }}>
            <p style={{
              fontFamily:"'Space Mono', monospace", fontSize:"0.48rem",
              fontWeight:700, textTransform:"uppercase", letterSpacing:"0.28em",
              color:T.faint, margin:0,
            }}>© 2024 — Built with passion & precision</p>
            <div style={{display:"flex", alignItems:"center", gap:"1rem"}}>
              {/* Social icons */}
              {[
                {
                  href:"#", label:"GitHub",
                  icon:(
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  ),
                },
                {
                  href:"#", label:"LinkedIn",
                  icon:(
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  ),
                },
                {
                  href:"#", label:"Twitter",
                  icon:(
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  ),
                },
              ].map(s => (
                <motion.a key={s.label} href={s.href} aria-label={s.label}
                  whileHover={{scale:1.15, color:T.orange}}
                  style={{
                    color:"rgba(255,255,255,0.25)", transition:"color 0.22s",
                    display:"flex", textDecoration:"none",
                  }}>
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.footer>

        </div>{/* ct-outer */}
      </div>{/* ct-root */}
    </section>
  );
}
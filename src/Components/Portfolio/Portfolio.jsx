import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence,
} from "framer-motion";
import { FiGithub, FiArrowUpRight, FiExternalLink } from "react-icons/fi";
import Portfolio_Data from "../../assets/portfolio_data";

// ─── THEME (synced with Hero + About + Contact) ───────────────────────────────
const T = {
  bg:      "#010103",
  card:    "#07070d",
  orange:  "#E8622A",
  orangeD: "#C94E1A",
  orangeG: "#F0845A",
  gold:    "#D4923A",
  text:    "#F2EEF8",
  muted:   "rgba(242,238,248,0.40)",
  faint:   "rgba(242,238,248,0.10)",
  border:  "rgba(232,98,42,0.16)",
  borderB: "rgba(255,255,255,0.055)",
  borderH: "rgba(232,98,42,0.38)",
};

// Tags that signal 3D/WebGL work — cards with these get special treatment
const IS_3D_TAGS = new Set([
  "three.js","threejs","webgl","glsl","shader","shaders","3d","canvas","webgpu",
  "r3f","react-three-fiber","three","babylon","babylonjs",
]);
const is3DProject = (project) =>
  project.tags?.some((t) => IS_3D_TAGS.has(t.toLowerCase().replace(/\s/g, "")));

// ─── ANIMATED 3D BORDER (marching-dash effect) ───────────────────────────────
function ThreeDGlowBorder({ active }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "absolute", inset: -1, borderRadius: 23,
        pointerEvents: "none", zIndex: 30, overflow: "hidden",
      }}
    >
      {/* Rotating gradient border */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: -60,
          background: `conic-gradient(from 0deg, transparent 0deg, ${T.orange} 60deg, ${T.gold} 120deg, transparent 180deg, transparent 360deg)`,
          zIndex: 0,
        }}
      />
      {/* Inner mask — cuts out center, leaves only border */}
      <div style={{
        position: "absolute", inset: 2, borderRadius: 21,
        background: "transparent",
        boxShadow: "0 0 0 100vw rgba(1,1,3,0.9)",
        zIndex: 1,
      }} />
      {/* Glow */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 22,
        boxShadow: `inset 0 0 22px rgba(232,98,42,0.18), 0 0 22px rgba(232,98,42,0.12)`,
        zIndex: 2,
      }} />
    </motion.div>
  );
}

// ─── 3D BADGE ─────────────────────────────────────────────────────────────────
function Badge3D({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 40,
            display: "flex", alignItems: "center", gap: "0.3rem",
            padding: "0.24rem 0.6rem", borderRadius: 100,
            background: "rgba(232,98,42,0.15)",
            border: "1px solid rgba(232,98,42,0.45)",
            backdropFilter: "blur(12px)",
            boxShadow: `0 0 14px rgba(232,98,42,0.28)`,
          }}
        >
          {/* Mini cube icon */}
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={T.orange}
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <span style={{
            fontFamily: "'Space Mono',monospace", fontSize: "0.38rem",
            fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(240,132,90,0.95)",
          }}>WebGL</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── FEATURED CARD (index 0 — full-width hero card) ──────────────────────────
function FeaturedCard({ project, isMobile }) {
  const cardRef  = useRef(null);
  const isInView = useInView(cardRef, { once: false, margin: "-60px" });
  const [hov, setHov] = useState(false);
  const is3D = is3DProject(project);

  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const mxS = useSpring(mx, { stiffness: 80, damping: 20 });
  const myS = useSpring(my, { stiffness: 80, damping: 20 });
  const rotX    = useTransform(myS, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotY    = useTransform(mxS, [-0.5, 0.5], ["-5deg", "5deg"]);
  const shineBg = useTransform(
    [useTransform(mxS, [-0.5,0.5],["10%","90%"]), useTransform(myS, [-0.5,0.5],["10%","90%"])],
    (l) => `radial-gradient(circle 380px at ${l[0]} ${l[1]}, rgba(232,98,42,0.09) 0%, transparent 65%)`
  );

  function handleMove(e) {
    if (isMobile || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width  - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  }
  function handleLeave() { mx.set(0); my.set(0); setHov(false); }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMove}
      onMouseEnter={() => { if (!isMobile) setHov(true); }}
      onMouseLeave={handleLeave}
      style={{
        rotateX: isMobile ? 0 : rotX,
        rotateY: isMobile ? 0 : rotY,
        transformStyle: "preserve-3d",
        perspective: "1400px",
        position: "relative",
        marginBottom: isMobile ? "1rem" : "1.5rem",
      }}
    >
      {/* 3D rotating border */}
      {is3D && <ThreeDGlowBorder active={true} />}

      {/* Ghost frames */}
      {!isMobile && <>
        <div style={{ position:"absolute", inset:-9, borderRadius:30,
          border:`1px solid rgba(232,98,42,${is3D ? 0.1 : 0.05})`,
          transform:"rotate(0.8deg) scale(1.005)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:-17, borderRadius:34,
          border:"1px solid rgba(232,98,42,0.025)",
          transform:"rotate(-0.5deg)", pointerEvents:"none" }}/>
      </>}

      <a
        href={project.link || "#"} target="_blank" rel="noopener noreferrer"
        style={{ display: "block", textDecoration: "none", position: "relative", zIndex: 1 }}
      >
        <div style={{
          position: "relative",
          borderRadius: isMobile ? 18 : 24,
          overflow: "hidden",
          background: "linear-gradient(160deg,rgba(18,15,12,0.99) 0%,rgba(8,7,6,0.99) 100%)",
          border: `1px solid ${hov ? T.borderH : is3D ? "rgba(232,98,42,0.22)" : T.borderB}`,
          boxShadow: hov
            ? `0 60px 120px rgba(0,0,0,0.88), 0 0 0 1px rgba(232,98,42,0.12), inset 0 1px 0 rgba(255,255,255,0.07)`
            : is3D
              ? `0 28px 60px rgba(0,0,0,0.72), 0 0 40px rgba(232,98,42,0.08), inset 0 1px 0 rgba(255,255,255,0.04)`
              : `0 20px 55px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.03)`,
          transition: "border-color 0.35s, box-shadow 0.45s",
          height: isMobile ? 280 : 480,
        }}>
          {/* IMAGE — visible by default */}
          <div style={{ position: "absolute", inset: 0 }}>
            <img
              src={project.image} alt={project.title}
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                opacity: hov ? 0.72 : 0.55,
                filter: hov
                  ? "saturate(1.3) brightness(1.08)"
                  : is3D ? "saturate(1.1) brightness(0.92)" : "saturate(0.85) brightness(0.88)",
                transform: hov ? "scale(1.05)" : "scale(1)",
                transition: "opacity 0.65s, filter 0.65s, transform 1.1s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
            {/* Gradient — lighter on top for featured */}
            <div style={{ position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(1,1,3,0.97) 0%, rgba(1,1,3,0.55) 38%, rgba(1,1,3,0.08) 100%)" }}/>
            {/* Colour tint */}
            <div style={{ position: "absolute", inset: 0,
              background: is3D
                ? "linear-gradient(135deg, rgba(232,98,42,0.08) 0%, transparent 45%)"
                : "linear-gradient(135deg, rgba(232,98,42,0.04) 0%, transparent 45%)" }}/>
          </div>

          {/* Shine */}
          {!isMobile && (
            <motion.div style={{
              position:"absolute", inset:0, zIndex:5, pointerEvents:"none",
              background:shineBg, opacity: hov?1:0, transition:"opacity 0.35s",
            }}/>
          )}

          {/* Top accent */}
          <motion.div
            animate={{ opacity: hov?1:is3D?0.6:0, scaleX: hov?1:is3D?0.8:0.4 }}
            transition={{ duration: 0.35 }}
            style={{ position:"absolute", top:0, left:0, right:0, height:3, zIndex:10,
              background:`linear-gradient(90deg,transparent,${T.orange},${T.gold},transparent)`,
              transformOrigin:"center" }}
          />

          {/* 3D badge */}
          <Badge3D visible={is3D} />

          {/* FEATURED label — top left */}
          <div style={{
            position:"absolute", top: 16, left: 16, zIndex: 40,
            display:"flex", alignItems:"center", gap:"0.38rem",
            padding:"0.24rem 0.65rem", borderRadius:100,
            background:"rgba(1,1,3,0.85)", border:"1px solid rgba(255,255,255,0.1)",
            backdropFilter:"blur(10px)",
          }}>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.38rem",
              fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase",
              color:"rgba(255,255,255,0.35)" }}>Featured</span>
          </div>

          {/* Content — bottom */}
          <div style={{
            position:"relative", zIndex:20,
            padding: isMobile ? "1.4rem" : "2.2rem",
            display:"flex", flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "flex-end",
            justifyContent:"space-between", gap:"1.5rem",
            height:"100%",
          }}>
            <div style={{ marginTop:"auto" }}>
              {/* Tags */}
              <div style={{ display:"flex", gap:"0.38rem", flexWrap:"wrap", marginBottom:"0.75rem" }}>
                {project.tags?.slice(0, 4).map((tag) => (
                  <span key={tag} style={{
                    fontFamily:"'Space Mono',monospace",
                    fontSize:"0.4rem", fontWeight:700, letterSpacing:"0.14em",
                    textTransform:"uppercase", padding:"0.26rem 0.65rem",
                    background: IS_3D_TAGS.has(tag.toLowerCase().replace(/\s/g,""))
                      ? "rgba(232,98,42,0.14)" : "rgba(255,255,255,0.05)",
                    border: IS_3D_TAGS.has(tag.toLowerCase().replace(/\s/g,""))
                      ? "1px solid rgba(232,98,42,0.32)" : "1px solid rgba(255,255,255,0.08)",
                    borderRadius:100,
                    color: IS_3D_TAGS.has(tag.toLowerCase().replace(/\s/g,""))
                      ? "rgba(240,132,90,0.95)" : T.muted,
                    whiteSpace:"nowrap",
                  }}>{tag}</span>
                ))}
              </div>
              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize: isMobile ? "clamp(1.8rem,8vw,2.6rem)" : "clamp(2.2rem,4vw,3.4rem)",
                fontWeight:400, letterSpacing:"0.04em",
                color:T.text, lineHeight:1.0, margin:"0 0 0.65rem 0",
              }}>
                {project.title}
              </h3>
              <p style={{
                fontFamily:"'Space Mono',monospace",
                fontSize: isMobile ? "0.62rem" : "0.7rem",
                color:T.muted, lineHeight:1.8, margin:0, maxWidth:560,
                display:"-webkit-box", WebkitLineClamp:2,
                WebkitBoxOrient:"vertical", overflow:"hidden",
              }}>
                {project.description}
              </p>
            </div>

            {/* CTA arrow */}
            <motion.div
              animate={{ opacity: hov?1:0.4, x: hov?0:-8, scale: hov?1:0.9 }}
              transition={{ duration: 0.35 }}
              style={{ flexShrink:0, marginTop:"auto",
                width:52, height:52, borderRadius:"50%",
                background: hov
                  ? `linear-gradient(135deg,${T.orange},${T.orangeD})`
                  : "rgba(255,255,255,0.06)",
                border:`1px solid ${hov ? "transparent" : T.borderB}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: hov ? `0 12px 30px rgba(232,98,42,0.5)` : "none",
                transition:"background 0.35s, box-shadow 0.35s, border-color 0.35s",
              }}
            >
              <FiExternalLink size={18} color={hov ? "#fff" : T.muted} strokeWidth={2}/>
            </motion.div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

// ─── PROJECT CARD (regular grid cards) ───────────────────────────────────────
const ProjectCard = React.memo(function ProjectCard({ project, index, isMobile }) {
  const cardRef  = useRef(null);
  const isInView = useInView(cardRef, { once: false, margin: "-60px" });
  const [hov, setHov] = useState(false);
  const is3D = is3DProject(project);

  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const mxS = useSpring(mx, { stiffness: 130, damping: 18 });
  const myS = useSpring(my, { stiffness: 130, damping: 18 });
  const rotX    = useTransform(myS, [-0.5, 0.5], ["14deg", "-14deg"]);
  const rotY    = useTransform(mxS, [-0.5, 0.5], ["-14deg", "14deg"]);
  const shineBg = useTransform(
    [useTransform(mxS, [-0.5,0.5],["10%","90%"]), useTransform(myS, [-0.5,0.5],["10%","90%"])],
    (l) => `radial-gradient(circle 240px at ${l[0]} ${l[1]}, rgba(232,98,42,0.11) 0%, rgba(255,255,255,0.025) 40%, transparent 70%)`
  );
  const shadowX = useTransform(mxS, [-0.5, 0.5], [-24, 24]);
  const shadowY = useTransform(myS, [-0.5, 0.5], [-16, 16]);
  const dynShadow = useTransform([shadowX, shadowY], (l) =>
    `${l[0]}px ${l[1]}px 70px rgba(0,0,0,0.88), 0 0 0 1px rgba(232,98,42,0.07)`
  );

  function handleMove(e) {
    if (isMobile || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width  - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  }
  function handleLeave() { mx.set(0); my.set(0); setHov(false); }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.94 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.94 }}
      transition={{
        duration: 0.85, delay: isMobile ? index * 0.05 : (index % 5) * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMove}
      onMouseEnter={() => { if (!isMobile) setHov(true); }}
      onMouseLeave={handleLeave}
      style={{
        rotateX: isMobile ? 0 : rotX,
        rotateY: isMobile ? 0 : rotY,
        transformStyle: "preserve-3d",
        perspective: "1100px",
        position: "relative",
        width: "100%", height: "100%",
        boxShadow: isMobile ? undefined : dynShadow,
      }}
    >
      {/* 3D rotating border — only on 3D projects */}
      {is3D && <ThreeDGlowBorder active={true} />}

      {/* Outer glow */}
      <motion.div
        animate={{ opacity: hov ? (is3D ? 1.0 : 0.8) : is3D ? 0.35 : 0, scale: hov ? 1.05 : 1 }}
        transition={{ duration: 0.6 }}
        style={{
          position:"absolute", inset:-2, borderRadius:26,
          background: is3D
            ? "radial-gradient(ellipse,rgba(232,98,42,0.22) 0%,transparent 68%)"
            : "radial-gradient(ellipse,rgba(232,98,42,0.15) 0%,transparent 68%)",
          filter:"blur(18px)", pointerEvents:"none", zIndex:0,
        }}
      />

      {/* Ghost frames */}
      {!isMobile && <>
        <div style={{ position:"absolute", inset:-7, borderRadius:28,
          border:`1px solid rgba(232,98,42,${is3D ? 0.09 : 0.05})`,
          transform:"rotate(1.8deg) scale(1.01)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:-13, borderRadius:32,
          border:"1px solid rgba(232,98,42,0.025)",
          transform:"rotate(-1.2deg)", pointerEvents:"none" }}/>
      </>}

      <a
        href={project.link || "#"}
        target="_blank" rel="noopener noreferrer"
        style={{ display:"block", height:"100%", textDecoration:"none", position:"relative", zIndex:1 }}
      >
        <div style={{
          position:"relative",
          height:"100%",
          minHeight: isMobile ? 320 : 400,
          borderRadius: isMobile ? 18 : 22,
          overflow:"hidden",
          background:"linear-gradient(160deg,rgba(18,15,12,0.98) 0%,rgba(8,7,6,0.99) 100%)",
          border:`1px solid ${hov ? T.borderH : is3D ? "rgba(232,98,42,0.2)" : T.borderB}`,
          boxShadow: hov
            ? `0 44px 90px rgba(0,0,0,0.82), 0 0 0 1px rgba(232,98,42,0.1), inset 0 1px 0 rgba(255,255,255,0.07)`
            : is3D
              ? `0 18px 50px rgba(0,0,0,0.68), 0 0 28px rgba(232,98,42,0.07), inset 0 1px 0 rgba(255,255,255,0.04)`
              : `0 16px 44px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)`,
          transition:"border-color 0.35s, box-shadow 0.45s",
        }}>

          {/* IMAGE — visible by default */}
          <div style={{ position:"absolute", inset:0 }}>
            <img
              src={project.image} alt={project.title}
              style={{
                width:"100%", height:"100%", objectFit:"cover", display:"block",
                opacity: hov ? 0.65 : 0.48,
                filter: hov
                  ? "saturate(1.3) brightness(1.06)"
                  : is3D ? "saturate(1.05) brightness(0.88)" : "saturate(0.75) brightness(0.84)",
                transform: hov ? "scale(1.07)" : "scale(1)",
                transition: "opacity 0.65s, filter 0.65s, transform 1s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
            <div style={{ position:"absolute", inset:0,
              background:"linear-gradient(to top,rgba(1,1,3,0.98) 0%,rgba(1,1,3,0.68) 45%,rgba(1,1,3,0.12) 100%)" }}/>
            <div style={{ position:"absolute", inset:0,
              background: is3D
                ? "linear-gradient(135deg,rgba(232,98,42,0.07) 0%,transparent 50%)"
                : "linear-gradient(135deg,rgba(232,98,42,0.035) 0%,transparent 50%)" }}/>
          </div>

          {/* Specular shine */}
          {!isMobile && (
            <motion.div style={{
              position:"absolute", inset:0, zIndex:5, pointerEvents:"none",
              background:shineBg, opacity: hov?1:0, transition:"opacity 0.35s",
            }}/>
          )}

          {/* Top accent */}
          <motion.div
            animate={{ opacity: hov?1:is3D?0.5:0, scaleX: hov?1:is3D?0.7:0.4 }}
            transition={{ duration: 0.35 }}
            style={{ position:"absolute", top:0, left:0, right:0, height:2, zIndex:10,
              background:`linear-gradient(90deg,transparent,${T.orange},${T.gold},transparent)`,
              transformOrigin:"center" }}
          />

          {/* 3D badge */}
          <Badge3D visible={is3D} />

          {/* Content */}
          <div style={{
            position:"relative", zIndex:20, height:"100%",
            padding: isMobile ? "1.2rem" : "1.6rem",
            display:"flex", flexDirection:"column", justifyContent:"space-between",
          }}>
            {/* Top row */}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <span style={{
                fontFamily:"'Space Mono',monospace",
                fontSize:"0.44rem", fontWeight:700, letterSpacing:"0.3em",
                color: is3D ? "rgba(232,98,42,0.65)" : "rgba(232,98,42,0.42)",
                textTransform:"uppercase",
              }}>
                {"#" + String(index + 2).padStart(2, "0")}
              </span>
              <motion.div
                animate={{ opacity: hov?1:0, rotate: hov?0:-40, scale: hov?1:0.65 }}
                transition={{ duration: 0.28 }}
                style={{
                  width:32, height:32, borderRadius:"50%",
                  background:`linear-gradient(135deg,${T.orange},${T.orangeD})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:`0 6px 18px rgba(232,98,42,0.48)`,
                  flexShrink:0,
                }}
              >
                <FiExternalLink size={13} color="#fff" strokeWidth={2.5}/>
              </motion.div>
            </div>

            {/* Bottom content */}
            <div>
              {/* Tags */}
              <div style={{ display:"flex", gap:"0.35rem", flexWrap:"wrap", marginBottom:"0.75rem" }}>
                {project.tags?.slice(0, 3).map((tag) => {
                  const isHot = IS_3D_TAGS.has(tag.toLowerCase().replace(/\s/g,""));
                  return (
                    <span key={tag} style={{
                      fontFamily:"'Space Mono',monospace",
                      fontSize:"0.38rem", fontWeight:700, letterSpacing:"0.14em",
                      textTransform:"uppercase", padding:"0.24rem 0.58rem",
                      background: isHot ? "rgba(232,98,42,0.12)" : "rgba(255,255,255,0.04)",
                      border: isHot ? "1px solid rgba(232,98,42,0.28)" : "1px solid rgba(255,255,255,0.07)",
                      borderRadius:100,
                      color: isHot ? "rgba(240,132,90,0.9)" : T.muted,
                      whiteSpace:"nowrap",
                    }}>{tag}</span>
                  );
                })}
              </div>

              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize: isMobile ? "clamp(1.35rem,5.5vw,1.65rem)" : "clamp(1.3rem,2.2vw,1.65rem)",
                fontWeight:400, letterSpacing:"0.04em",
                color:T.text, lineHeight:1.05,
                margin:"0 0 0.5rem 0",
                textShadow: hov ? "0 4px 18px rgba(0,0,0,0.8)" : "none",
                transition:"text-shadow 0.3s",
              }}>
                {project.title}
              </h3>

              <p style={{
                fontFamily:"'Space Mono',monospace",
                fontSize: isMobile ? "0.58rem" : "0.62rem",
                color:T.muted, lineHeight:1.8,
                margin:"0 0 1rem 0",
                display:"-webkit-box", WebkitLineClamp:2,
                WebkitBoxOrient:"vertical", overflow:"hidden",
              }}>
                {project.description}
              </p>

              {/* Bottom bar */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{
                  height:2,
                  background:`linear-gradient(90deg,${is3D?T.orange:T.borderH},transparent)`,
                  borderRadius:2,
                  width: hov ? (is3D ? 80 : 60) : is3D ? 20 : 0,
                  transition:"width 0.55s cubic-bezier(0.16,1,0.3,1)",
                }}/>
                <span style={{
                  fontFamily:"'Space Mono',monospace",
                  fontSize:"0.38rem", fontWeight:700, letterSpacing:"0.2em",
                  textTransform:"uppercase", color:T.faint,
                  opacity: hov?1:0, transition:"opacity 0.4s",
                }}>
                  View Project
                </span>
              </div>
            </div>
          </div>

          {/* Corner bracket */}
          <div style={{
            position:"absolute", bottom:12, right:12, width:14, height:14,
            borderBottom:`1px solid rgba(232,98,42,${hov?0.5:is3D?0.25:0.1})`,
            borderRight:`1px solid rgba(232,98,42,${hov?0.5:is3D?0.25:0.1})`,
            borderRadius:"0 0 4px 0",
            transition:"border-color 0.3s", zIndex:10,
          }}/>
        </div>
      </a>

      {/* Drop shadow bloom */}
      <div style={{
        position:"absolute", inset:"6% 8% -6%",
        background: is3D ? "rgba(232,98,42,0.1)" : "rgba(232,98,42,0.06)",
        filter:"blur(24px)", borderRadius:24, zIndex:-1,
        opacity: hov?1:is3D?0.5:0, transition:"opacity 0.55s",
      }}/>
    </motion.div>
  );
});
ProjectCard.displayName = "ProjectCard";

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ isMobile, count3D, total }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-50px" });

  return (
    <header ref={ref} style={{
      marginBottom: isMobile ? "3rem" : "5rem",
      position:"relative",
      paddingBottom: isMobile ? "2rem" : "3rem",
    }}>
      <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? "1rem" : "1.5rem" }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity:0, x:-20 }}
          animate={inView ? { opacity:1, x:0 } : { opacity:0, x:-20 }}
          transition={{ duration:0.72, ease:[0.16,1,0.3,1] }}
          style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}
        >
          {!isMobile && (
            <div style={{ height:1, width:26, background:`linear-gradient(to right,transparent,${T.orange})`, flexShrink:0 }}/>
          )}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"0.45rem",
            padding:"0.32rem 0.9rem", borderRadius:100,
            background:"linear-gradient(135deg,rgba(232,98,42,0.1) 0%,rgba(232,98,42,0.04) 100%)",
            border:"1px solid rgba(232,98,42,0.28)", backdropFilter:"blur(12px)",
            boxShadow:"0 4px 14px rgba(232,98,42,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}>
            <motion.span
              animate={{ opacity:[1,0.2,1], scale:[1,0.6,1] }}
              transition={{ duration:2.2, repeat:Infinity }}
              style={{ width:6, height:6, borderRadius:"50%", background:T.orange,
                boxShadow:`0 0 10px ${T.orange},0 0 18px ${T.orange}44`,
                display:"inline-block", flexShrink:0 }}
            />
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.48rem", fontWeight:700,
              letterSpacing:"0.28em", textTransform:"uppercase", color:"rgba(240,132,90,0.95)",
              whiteSpace:"nowrap" }}>Portfolio</span>
          </div>
          {!isMobile && (
            <div style={{ height:1, flex:1, background:`linear-gradient(to right,${T.border},transparent)` }}/>
          )}
        </motion.div>

        {/* Headline row */}
        <div style={{
          display:"flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "flex-end",
          justifyContent:"space-between",
          gap: isMobile ? "1.2rem" : "2rem",
        }}>
          {/* Left: big heading */}
          <div style={{ position:"relative" }}>
            {!isMobile && (
              <div style={{
                position:"absolute", top:"-1.4rem", left:"-0.5rem",
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"clamp(6rem,13vw,11rem)",
                fontWeight:400, color:"rgba(232,98,42,0.035)",
                lineHeight:1, pointerEvents:"none", userSelect:"none",
                letterSpacing:"0.04em", whiteSpace:"nowrap",
              }}>WORK</div>
            )}
            <motion.h2
              initial={{ opacity:0, y:22 }}
              animate={inView ? { opacity:1, y:0 } : { opacity:0, y:22 }}
              transition={{ duration:0.9, delay:0.1, ease:[0.16,1,0.3,1] }}
              style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize: isMobile ? "clamp(2.6rem,12vw,4.5rem)" : "clamp(3rem,7vw,7rem)",
                fontWeight:400, lineHeight:0.88, letterSpacing:"0.02em",
                color:T.text, margin:0, position:"relative", zIndex:1,
              }}
            >
              Selected
              <br/>
              <span style={{
                background:`linear-gradient(135deg,rgba(242,238,248,0.78) 0%,rgba(242,238,248,0.18) 100%)`,
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                fontStyle:"italic",
              }}>
                Projects.
              </span>
            </motion.h2>
          </div>

          {/* Right: updated description + 3D count badge */}
          <motion.div
            initial={{ opacity:0, x: isMobile ? 0 : 20, y: isMobile ? 10 : 0 }}
            animate={inView ? { opacity:1, x:0, y:0 } : { opacity:0 }}
            transition={{ duration:0.72, delay:0.2 }}
            style={{ maxWidth: isMobile ? "100%" : 320 }}
          >
            <p style={{
              fontFamily:"'Space Mono',monospace",
              fontSize: isMobile ? "0.65rem" : "0.7rem",
              color:T.muted, lineHeight:1.85,
              borderLeft:`2px solid rgba(232,98,42,0.22)`,
              paddingLeft:"1.1rem", margin:"0 0 0.9rem 0",
            }}>
              Interactive 3D experiences, WebGL experiments and full-stack
              applications — built to solve real problems and push what the web can feel like.
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:"0.7rem", flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:T.orange,
                  boxShadow:`0 0 8px ${T.orange}` }}/>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.46rem", fontWeight:700,
                  letterSpacing:"0.22em", textTransform:"uppercase", color:T.faint }}>
                  2024 — Present
                </span>
              </div>
              {/* 3D count pill */}
              {count3D > 0 && (
                <div style={{
                  display:"flex", alignItems:"center", gap:"0.35rem",
                  padding:"0.2rem 0.6rem", borderRadius:100,
                  background:"rgba(232,98,42,0.1)",
                  border:"1px solid rgba(232,98,42,0.28)",
                }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={T.orange}
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.4rem", fontWeight:700,
                    letterSpacing:"0.16em", textTransform:"uppercase",
                    color:"rgba(240,132,90,0.85)" }}>
                    {count3D} 3D / WebGL
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX:0 }}
        animate={inView ? { scaleX:1 } : { scaleX:0 }}
        transition={{ duration:1.1, delay:0.48, ease:[0.16,1,0.3,1] }}
        style={{
          position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,${T.orange}44,${T.borderB} 60%,transparent)`,
          transformOrigin:"left",
        }}
      />
    </header>
  );
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const allProjects  = useMemo(() => Portfolio_Data.slice(0, 7), []);
  const featuredProject = allProjects[0];
  const gridProjects    = allProjects.slice(1);
  const count3D = useMemo(() => allProjects.filter(is3DProject).length, [allProjects]);

  const footerRef      = useRef(null);
  const isFooterInView = useInView(footerRef, { once: true });

  const [isMobile, setIsMobile] = useState(false);
  const [isSmall,  setIsSmall]  = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1100);
      setIsSmall(window.innerWidth < 540);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      id="portfolio"
      style={{
        position:"relative", background:T.bg, color:T.text, overflow:"hidden",
        paddingTop:    isMobile ? "calc(var(--navbar-height,70px) + 4rem)"   : "calc(var(--navbar-height,70px) + 5rem)",
        paddingBottom: isMobile ? "4.5rem" : "7rem",
        paddingLeft:   isSmall  ? "4.5%"  : isMobile ? "5%"  : "6%",
        paddingRight:  isSmall  ? "4.5%"  : isMobile ? "5%"  : "6%",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .port-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          perspective: 2200px;
        }
        @media (max-width: 1099px) {
          .port-grid { grid-template-columns: repeat(2, 1fr); gap: 1.15rem; }
        }
        @media (max-width: 600px) {
          .port-grid { grid-template-columns: 1fr; gap: 1rem; }
        }
      `}</style>

      {/* ── Background ── */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"linear-gradient(rgba(255,255,255,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.014) 1px,transparent 1px)",
        backgroundSize:"68px 68px",
        maskImage:"radial-gradient(ellipse 88% 60% at 50% 15%,black 38%,transparent 100%)",
      }}/>
      <div style={{ position:"absolute", top:"-10%", right:"-4%", width:"50vw", height:"50vw",
        borderRadius:"50%", background:"radial-gradient(circle,rgba(232,98,42,0.06) 0%,transparent 65%)",
        filter:"blur(80px)", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"absolute", bottom:"5%", left:"-6%", width:"38vw", height:"38vw",
        borderRadius:"50%", background:"radial-gradient(circle,rgba(212,146,58,0.04) 0%,transparent 65%)",
        filter:"blur(70px)", pointerEvents:"none", zIndex:0 }}/>
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:1, opacity:0.02,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat:"repeat", backgroundSize:"128px",
      }}/>

      <div style={{ maxWidth:1400, margin:"0 auto", position:"relative", zIndex:10 }}>

        <SectionHeader isMobile={isMobile} count3D={count3D} total={allProjects.length} />

        {/* ── FEATURED CARD ── */}
        {featuredProject && (
          <FeaturedCard project={featuredProject} isMobile={isMobile} />
        )}

        {/* ── GRID ── */}
        <div className="port-grid">
          {gridProjects.map((project, i) => (
            <ProjectCard
              key={project.id || i}
              project={project}
              index={i}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* ── FOOTER CTA ── */}
        <footer ref={footerRef} style={{ marginTop: isMobile ? "3.5rem" : "6rem", textAlign:"center" }}>
          <motion.div
            initial={{ opacity:0, y:18 }}
            animate={isFooterInView ? { opacity:1, y:0 } : { opacity:0, y:18 }}
            transition={{ duration:0.72, ease:[0.16,1,0.3,1] }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:"1.2rem", marginBottom:"2.5rem" }}>
              <div style={{ flex:1, height:1, background:`linear-gradient(to right,transparent,${T.borderB})` }}/>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.46rem",
                letterSpacing:"0.28em", textTransform:"uppercase", color:T.faint, whiteSpace:"nowrap" }}>
                More on GitHub
              </span>
              <div style={{ flex:1, height:1, background:`linear-gradient(to left,transparent,${T.borderB})` }}/>
            </div>

            <motion.a
              href="https://github.com/Perpetualisi/"
              target="_blank" rel="noopener noreferrer"
              whileHover={{ scale:1.04, boxShadow:`0 18px 45px rgba(232,98,42,0.22)`, borderColor: T.borderH, color: T.text }}
              whileTap={{ scale:0.97 }}
              style={{
                display:"inline-flex", alignItems:"center", gap:"0.7rem",
                padding: isSmall ? "0.8rem 1.6rem" : "0.92rem 2.2rem",
                borderRadius:6,
                background:"rgba(255,255,255,0.02)",
                border:`1px solid ${T.borderB}`,
                color:T.muted,
                fontFamily:"'Space Mono',monospace",
                fontSize: isSmall ? "0.55rem" : "0.6rem",
                fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase",
                textDecoration:"none",
                backdropFilter:"blur(12px)",
                transition:"border-color 0.3s, color 0.3s, box-shadow 0.3s",
                boxShadow:"inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <FiGithub size={14}/>
              View Full Archive
              <FiArrowUpRight size={13}/>
            </motion.a>
          </motion.div>
        </footer>
      </div>
    </section>
  );
}
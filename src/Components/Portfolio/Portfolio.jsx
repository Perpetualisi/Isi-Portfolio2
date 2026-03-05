import React, { useRef, useState, useMemo, useEffect } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiGithub, FiArrowUpRight, FiExternalLink } from "react-icons/fi";
import Portfolio_Data from "../../assets/portfolio_data";

// ─── THEME (synced with Hero + About) ─────────────────────────────────────────
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

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
const ProjectCard = React.memo(function ProjectCard({ project, index, isMobile }) {
  const cardRef  = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-60px" });
  const [hov, setHov] = useState(false);

  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const mxS = useSpring(mx, { stiffness: 130, damping: 18 });
  const myS = useSpring(my, { stiffness: 130, damping: 18 });
  const rotX    = useTransform(myS, [-0.5, 0.5], ["14deg", "-14deg"]);
  const rotY    = useTransform(mxS, [-0.5, 0.5], ["-14deg", "14deg"]);
  const shineX  = useTransform(mxS, [-0.5, 0.5], ["10%", "90%"]);
  const shineY  = useTransform(myS, [-0.5, 0.5], ["10%", "90%"]);
  const shineBg = useTransform([shineX, shineY], (l) =>
    `radial-gradient(circle 260px at ${l[0]} ${l[1]}, rgba(232,98,42,0.12) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)`
  );
  // Dynamic shadow follows tilt
  const shadowX = useTransform(mxS, [-0.5, 0.5], [-28, 28]);
  const shadowY = useTransform(myS, [-0.5, 0.5], [-18, 18]);
  const dynShadow = useTransform([shadowX, shadowY], (l) =>
    `${l[0]}px ${l[1]}px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(232,98,42,0.08)`
  );

  function handleMove(e) {
    if (isMobile || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  }
  function handleLeave() { mx.set(0); my.set(0); setHov(false); }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 55, scale: 0.93 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 55, scale: 0.93 }}
      transition={{ duration: 0.88, delay: isMobile ? index * 0.06 : index * 0.11, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMove}
      onMouseEnter={() => { if (!isMobile) setHov(true); }}
      onMouseLeave={handleLeave}
      style={{
        rotateX: isMobile ? 0 : rotX,
        rotateY: isMobile ? 0 : rotY,
        transformStyle: "preserve-3d",
        perspective: "1100px",
        position: "relative",
        width: "100%",
        height: "100%",
        boxShadow: isMobile ? undefined : dynShadow,
      }}
    >
      {/* Outer glow */}
      <motion.div
        animate={{ opacity: hov ? 1 : 0, scale: hov ? 1.05 : 1 }}
        transition={{ duration: 0.6 }}
        style={{
          position:"absolute", inset:-2, borderRadius:24,
          background:"radial-gradient(ellipse,rgba(232,98,42,0.2) 0%,transparent 68%)",
          filter:"blur(20px)", pointerEvents:"none", zIndex:0,
        }}
      />

      {/* Ghost frames */}
      {!isMobile && <>
        <div style={{ position:"absolute", inset:-7, borderRadius:28,
          border:"1px solid rgba(232,98,42,0.07)", transform:"rotate(1.8deg) scale(1.01)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:-13, borderRadius:32,
          border:"1px solid rgba(232,98,42,0.03)", transform:"rotate(-1.2deg)", pointerEvents:"none" }}/>
      </>}

      <a
        href={project.link || "#"}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display:"block", height:"100%", textDecoration:"none", position:"relative", zIndex:1 }}
      >
        <div style={{
          position:"relative",
          height:"100%",
          minHeight: isMobile ? 340 : 420,
          borderRadius: isMobile ? 18 : 22,
          overflow:"hidden",
          background:"linear-gradient(160deg,rgba(18,15,12,0.98) 0%,rgba(8,7,6,0.99) 100%)",
          border:`1px solid ${hov ? T.borderH : T.borderB}`,
          boxShadow: hov
            ? `0 44px 90px rgba(0,0,0,0.82), 0 0 0 1px rgba(232,98,42,0.1), inset 0 1px 0 rgba(255,255,255,0.06)`
            : `0 16px 44px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.03)`,
          transition:"border-color 0.35s, box-shadow 0.45s",
        }}>

          {/* Image */}
          <div style={{ position:"absolute", inset:0 }}>
            <img
              src={project.image}
              alt={project.title}
              style={{
                width:"100%", height:"100%", objectFit:"cover", display:"block",
                opacity: hov ? 0.5 : 0.32,
                filter: hov ? "saturate(1.25) brightness(1.06)" : "saturate(0.65) brightness(0.82)",
                transform: hov ? "scale(1.07)" : "scale(1)",
                transition:"opacity 0.65s, filter 0.65s, transform 1s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
            <div style={{ position:"absolute", inset:0,
              background:"linear-gradient(to top,rgba(1,1,3,0.98) 0%,rgba(1,1,3,0.72) 42%,rgba(1,1,3,0.18) 100%)" }}/>
            <div style={{ position:"absolute", inset:0,
              background:"linear-gradient(135deg,rgba(232,98,42,0.055) 0%,transparent 50%)" }}/>
          </div>

          {/* Specular shine — desktop only */}
          {!isMobile && (
            <motion.div style={{
              position:"absolute", inset:0, zIndex:5, pointerEvents:"none",
              background:shineBg, opacity: hov?1:0, transition:"opacity 0.35s",
            }}/>
          )}

          {/* Top accent line */}
          <motion.div
            animate={{ opacity: hov?1:0, scaleX: hov?1:0.4 }}
            transition={{ duration: 0.35 }}
            style={{ position:"absolute", top:0, left:0, right:0, height:2, zIndex:10,
              background:`linear-gradient(90deg,transparent,${T.orange},${T.gold},transparent)`,
              transformOrigin:"center" }}
          />

          {/* Content */}
          <div style={{
            position:"relative", zIndex:20, height:"100%",
            padding: isMobile ? "1.25rem" : "1.75rem",
            display:"flex", flexDirection:"column", justifyContent:"space-between",
          }}>
            {/* Top row */}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <span style={{
                fontFamily:"'Space Mono',monospace",
                fontSize:"0.48rem", fontWeight:700, letterSpacing:"0.3em",
                color:"rgba(232,98,42,0.5)", textTransform:"uppercase",
              }}>
                {"#" + String(index + 1).padStart(2, "0")}
              </span>
              <motion.div
                animate={{ opacity: hov?1:0, rotate: hov?0:-40, scale: hov?1:0.65 }}
                transition={{ duration: 0.3 }}
                style={{
                  width:34, height:34, borderRadius:"50%",
                  background:`linear-gradient(135deg,${T.orange},${T.orangeD})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:`0 8px 22px rgba(232,98,42,0.48)`,
                  flexShrink:0,
                }}
              >
                <FiExternalLink size={14} color="#fff" strokeWidth={2.5}/>
              </motion.div>
            </div>

            {/* Bottom content */}
            <div>
              {/* Tags */}
              <div style={{ display:"flex", gap:"0.38rem", flexWrap:"wrap", marginBottom:"0.85rem" }}>
                {project.tags && project.tags.slice(0, 3).map((tag) => (
                  <span key={tag} style={{
                    fontFamily:"'Space Mono',monospace",
                    fontSize:"0.4rem", fontWeight:700, letterSpacing:"0.14em",
                    textTransform:"uppercase", padding:"0.26rem 0.6rem",
                    background:"rgba(232,98,42,0.08)",
                    border:"1px solid rgba(232,98,42,0.18)",
                    borderRadius:100, color:"rgba(240,132,90,0.82)",
                    whiteSpace:"nowrap",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize: isMobile ? "clamp(1.4rem,6vw,1.75rem)" : "clamp(1.4rem,2.4vw,1.8rem)",
                fontWeight:400, letterSpacing:"0.04em",
                color:T.text, lineHeight:1.05,
                margin:"0 0 0.55rem 0",
                textShadow: hov ? "0 4px 18px rgba(0,0,0,0.8)" : "none",
                transition:"text-shadow 0.3s",
              }}>
                {project.title}
              </h3>

              {/* Description */}
              <p style={{
                fontFamily:"'Space Mono',monospace",
                fontSize: isMobile ? "0.6rem" : "0.65rem",
                color:T.muted, lineHeight:1.8,
                margin:"0 0 1.1rem 0",
                display:"-webkit-box", WebkitLineClamp:2,
                WebkitBoxOrient:"vertical", overflow:"hidden",
              }}>
                {project.description}
              </p>

              {/* Bottom bar */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{
                  height:2,
                  background:`linear-gradient(90deg,${T.orange},transparent)`,
                  borderRadius:2,
                  width: hov ? 70 : 0,
                  transition:"width 0.55s cubic-bezier(0.16,1,0.3,1)",
                }}/>
                <span style={{
                  fontFamily:"'Space Mono',monospace",
                  fontSize:"0.4rem", fontWeight:700, letterSpacing:"0.2em",
                  textTransform:"uppercase", color:T.faint,
                  opacity: hov?1:0, transition:"opacity 0.4s",
                }}>
                  View Project
                </span>
              </div>
            </div>
          </div>

          {/* Corner bracket */}
          <div style={{ position:"absolute", bottom:14, right:14, width:16, height:16,
            borderBottom:`1px solid rgba(232,98,42,${hov?0.45:0.1})`,
            borderRight:`1px solid rgba(232,98,42,${hov?0.45:0.1})`,
            borderRadius:"0 0 4px 0", transition:"border-color 0.3s", zIndex:10 }}/>
        </div>
      </a>

      {/* Drop shadow bloom */}
      <div style={{
        position:"absolute", inset:"6% 8% -6%",
        background:"rgba(232,98,42,0.07)", filter:"blur(26px)",
        borderRadius:24, zIndex:-1,
        opacity: hov?1:0, transition:"opacity 0.55s",
      }}/>
    </motion.div>
  );
});
ProjectCard.displayName = "ProjectCard";

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ isMobile }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <header ref={ref} style={{
      marginBottom: isMobile ? "3rem" : "5rem",
      position:"relative",
      paddingBottom: isMobile ? "2rem" : "3rem",
    }}>
      <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? "1rem" : "1.5rem" }}>

        {/* Eyebrow — matches Hero + About */}
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
            <span style={{ width:6, height:6, borderRadius:"50%", background:T.orange,
              boxShadow:`0 0 10px ${T.orange},0 0 18px ${T.orange}44`,
              display:"inline-block", animation:"ldp 2.2s infinite", flexShrink:0 }}/>
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
            {/* Ghost watermark */}
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

          {/* Right: plain description */}
          <motion.div
            initial={{ opacity:0, x: isMobile ? 0 : 20, y: isMobile ? 10 : 0 }}
            animate={inView ? { opacity:1, x:0, y:0 } : { opacity:0 }}
            transition={{ duration:0.72, delay:0.2 }}
            style={{ maxWidth: isMobile ? "100%" : 300 }}
          >
            <p style={{
              fontFamily:"'Space Mono',monospace",
              fontSize: isMobile ? "0.65rem" : "0.7rem",
              color:T.muted, lineHeight:1.85,
              borderLeft:`2px solid rgba(232,98,42,0.22)`,
              paddingLeft:"1.1rem", margin:"0 0 0.75rem 0",
            }}>
              Real projects I've built — websites, web apps, and tools
              that solve actual problems and work on any device.
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:T.orange,
                boxShadow:`0 0 8px ${T.orange}` }}/>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.46rem", fontWeight:700,
                letterSpacing:"0.22em", textTransform:"uppercase", color:T.faint }}>
                2024 — Present
              </span>
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
  const validProjects = useMemo(() => Portfolio_Data.slice(0, 6), []);
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
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* Desktop: 3 columns */
        .port-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          perspective: 2200px;
        }

        /* Tablet: 2 columns */
        @media (max-width: 1099px) {
          .port-grid { grid-template-columns: repeat(2, 1fr); gap: 1.15rem; }
        }

        /* Mobile: single column */
        @media (max-width: 600px) {
          .port-grid { grid-template-columns: 1fr; gap: 1rem; }
        }

        @keyframes ldp {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.22; transform:scale(.62); }
        }
      `}</style>

      {/* ── Background ── */}
      {/* Fine grid */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"linear-gradient(rgba(255,255,255,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.014) 1px,transparent 1px)",
        backgroundSize:"68px 68px",
        maskImage:"radial-gradient(ellipse 88% 60% at 50% 15%,black 38%,transparent 100%)",
      }}/>

      {/* Ambient glows */}
      <div style={{ position:"absolute", top:"-10%", right:"-4%", width:"50vw", height:"50vw",
        borderRadius:"50%", background:"radial-gradient(circle,rgba(232,98,42,0.06) 0%,transparent 65%)",
        filter:"blur(80px)", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"absolute", bottom:"5%", left:"-6%", width:"38vw", height:"38vw",
        borderRadius:"50%", background:"radial-gradient(circle,rgba(212,146,58,0.04) 0%,transparent 65%)",
        filter:"blur(70px)", pointerEvents:"none", zIndex:0 }}/>

      {/* Noise overlay */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:1, opacity:0.02,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat:"repeat", backgroundSize:"128px",
      }}/>

      <div style={{ maxWidth:1400, margin:"0 auto", position:"relative", zIndex:10 }}>
        <SectionHeader isMobile={isMobile} />

        <div className="port-grid">
          {validProjects.map((project, i) => (
            <ProjectCard
              key={project.id || i}
              project={project}
              index={i}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Footer CTA */}
        <footer ref={footerRef} style={{ marginTop: isMobile ? "3.5rem" : "6rem", textAlign:"center" }}>
          <motion.div
            initial={{ opacity:0, y:18 }}
            animate={isFooterInView ? { opacity:1, y:0 } : { opacity:0, y:18 }}
            transition={{ duration:0.72, ease:[0.16,1,0.3,1] }}
          >
            {/* Divider */}
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
              target="_blank"
              rel="noopener noreferrer"
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
                fontWeight:700,
                letterSpacing:"0.22em", textTransform:"uppercase",
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
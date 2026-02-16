import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { FiArrowRight, FiDownload, FiClock, FiCode, FiLayers, FiCheckCircle } from "react-icons/fi";

// ============================================================================
// ANIMATION VARIANTS (The "Secret Sauce")
// ============================================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Time between each element appearing
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9, rotate: 2 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 },
  },
};

// ============================================================================
// COMPONENTS
// ============================================================================

const CustomCursor = ({ isHovered }) => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const cursorX = useSpring(mouseX, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(mouseY, { stiffness: 500, damping: 28 });

  useEffect(() => {
    const moveMouse = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveMouse);
    return () => window.removeEventListener("mousemove", moveMouse);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 bg-orange-500 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%", scale: isHovered ? 4 : 1 }}
    />
  );
};

const MagneticButton = ({ children, className, onHoverStart, onHoverEnd }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const quickX = useSpring(x, { stiffness: 150, damping: 15 });
  const quickY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    x.set((clientX - (left + width / 2)) * 0.35);
    y.set((clientY - (top + height / 2)) * 0.35);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={onHoverStart}
      onMouseLeave={() => { x.set(0); y.set(0); onHoverEnd(); }}
      style={{ x: quickX, y: quickY }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// MAIN HERO COMPONENT
// ============================================================================
const Hero = () => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const [time, setTime] = useState(new Date());

  const bgMouseX = useMotionValue(0);
  const bgMouseY = useMotionValue(0);

  const handleMouseMove = useCallback(({ clientX, clientY, currentTarget }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    bgMouseX.set(clientX - left);
    bgMouseY.set(clientY - top);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const yImageValue = useTransform(scrollY, [0, 500], [0, -100]);
  const yImage = useSpring(yImageValue, { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const spotlightBg = useTransform([bgMouseX, bgMouseY], ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(255,165,0,0.1), transparent 80%)`);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col justify-center px-4 md:px-12 lg:px-24 pt-44 pb-20 bg-black overflow-hidden select-none cursor-none"
    >
      <CustomCursor isHovered={isHovered} />

      {/* BACKGROUND GRID */}
      <motion.div style={{ opacity }} className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute inset-0 z-0" style={{ background: spotlightBg }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl mx-auto"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* TEXT CONTENT */}
          <div className="w-full lg:flex-[1.3] text-center lg:text-left space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-orange-200/70">Full-Stack Engineer</span>
              </motion.div>

              <div className="space-y-4">
                <motion.h1 variants={itemVariants} className="text-[1.7rem] xs:text-[2.2rem] sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
                  Hi, I’m <br className="hidden sm:block" />{" "}
                  <span className="text-zinc-400 italic font-light outline-text">Perpetual Okan</span>
                </motion.h1>
                <motion.h2 variants={itemVariants} className="text-lg md:text-3xl font-light text-zinc-300 tracking-tight">Full-Stack Developer</motion.h2>
                <motion.p variants={itemVariants} className="text-sm md:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                  I build websites and web apps that are responsive, easy to use, and work well on any device.
                </motion.p>
              </div>
            </div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <MagneticButton onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)} className="w-full sm:w-auto">
                <Link to="/portfolio" className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg active:scale-95">
                  Explore Work <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </MagneticButton>
              <MagneticButton onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)} className="w-full sm:w-auto">
                <button className="group flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-zinc-800 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] transition-all rounded-sm backdrop-blur-sm hover:border-zinc-600 hover:text-white">
                  <FiDownload /> Get Resume
                </button>
              </MagneticButton>
            </motion.div>
          </div>

          {/* IMAGE AREA */}
          <motion.div 
            style={{ y: yImage }} 
            variants={imageVariants}
            className="w-full flex-1 flex justify-center lg:justify-end order-1 lg:order-2"
          >
            <div className="relative w-full max-w-[480px]">
              <div className="absolute -inset-10 bg-orange-600/10 blur-[80px] rounded-full animate-pulse" />
              <div className="relative z-10 p-4 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-3xl border border-white/20 rounded-[3rem] shadow-2xl">
                <img src="/profile41.jpeg" alt="Perpetual" className="w-full aspect-[4/5] rounded-[2.5rem] object-cover" />
                <motion.div 
                   initial={{ x: 20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: 1.2 }}
                   className="absolute -bottom-6 right-0 p-5 bg-zinc-900/95 backdrop-blur-3xl border border-zinc-700 rounded-3xl flex items-center gap-5"
                >
                  <FiClock className="text-orange-500 animate-pulse" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-orange-500/70 uppercase font-black tracking-widest leading-none mb-1">System Live</span>
                    <span className="text-base text-zinc-100 font-mono font-bold">{formattedTime}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style jsx>{`
        .outline-text { -webkit-text-stroke: 1px rgba(255,255,255,0.2); -webkit-text-fill-color: transparent; }
      `}</style>
    </section>
  );
};

export default Hero;
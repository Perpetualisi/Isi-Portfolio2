import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { FiArrowRight, FiDownload, FiClock, FiCode, FiLayers, FiCheckCircle } from "react-icons/fi";

// ============================================================================
// SCROLL INDICATOR COMPONENT
// ============================================================================
const ScrollIndicator = ({ opacity }) => (
  <motion.div 
    style={{ opacity }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.5, duration: 1 }}
    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none"
  >
    <span className="text-[8px] uppercase tracking-[0.4em] text-zinc-500 font-bold">
      Scroll
    </span>
    <div className="w-[20px] h-[35px] border-2 border-zinc-800 rounded-full flex justify-center p-1">
      <motion.div 
        animate={{ 
          y: [0, 12, 0],
          opacity: [1, 0, 1] 
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="w-1 h-2 bg-orange-500 rounded-full"
      />
    </div>
  </motion.div>
);

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const [time, setTime] = useState(new Date());

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(({ clientX, clientY, currentTarget }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  // Animation values
  const yImageValue = useTransform(scrollY, [0, 500], [0, -100]);
  const yImage = useSpring(yImageValue, { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(255,165,0,0.1), transparent 80%)`
  );

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/Perpetuual-cv.pdf";
    link.download = "Perpetual_Okan_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col justify-center px-4 md:px-12 lg:px-24 pt-44 pb-20 bg-[#000000] overflow-hidden select-none"
    >
      {/* BACKGROUND LAYER */}
      <motion.div style={{ opacity }} className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute inset-0 z-0" style={{ background: spotlightBg }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* CONTENT AREA */}
          <div className="w-full lg:flex-[1.3] text-center lg:text-left space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-orange-200/70">Full-Stack Engineer</span>
              </motion.div>

              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[1.7rem] xs:text-[2.2rem] sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tighter text-white leading-[1.1]"
                >
                  <span className="inline">Hi, I’m</span>
                  <br className="hidden sm:block" />{" "}
                  <span className="text-zinc-400 italic font-light outline-text inline">
                    Perpetual Okan
                  </span>
                </motion.h1>
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-3xl font-light text-zinc-300 tracking-tight"
                >
                  Full-Stack Developer
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm md:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light px-2 sm:px-0"
                >
                  I build websites and web apps that are responsive, easy to use, and work well on any device. 
                  I work on both the frontend and backend to turn ideas into real digital products.
                </motion.p>
              </div>
            </div>

            {/* BUTTONS AREA */}
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2 px-4 sm:px-0">
                <Link 
                  to="/portfolio" 
                  className="group relative w-full sm:w-auto px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-sm transition-all duration-300 active:scale-95 text-center shadow-lg"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Explore Work <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                
                <button 
                  onClick={handleDownload} 
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-zinc-800 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] transition-all rounded-sm backdrop-blur-sm"
                >
                  <FiDownload /> Get Resume
                </button>
              </div>

              {/* EXPERTISE STRIP */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-row flex-wrap justify-center lg:justify-start gap-6 sm:gap-10 py-6 border-t border-zinc-900/50"
              >
                <div className="flex items-center gap-3">
                  <FiLayers className="text-orange-500 text-sm sm:text-base" />
                  <div className="flex flex-col text-left">
                    <span className="text-lg sm:text-xl font-bold text-white leading-none">15+</span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Projects</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiCode className="text-orange-500 text-sm sm:text-base" />
                  <div className="flex flex-col text-left">
                    <span className="text-xl sm:text-xl font-bold text-white leading-none">React</span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Expert</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="text-orange-500 text-sm sm:text-base" />
                  <div className="flex flex-col text-left">
                    <span className="text-lg sm:text-xl font-bold text-white leading-none">Full-Stack</span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Specialist</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* IMAGE AREA */}
          <motion.div 
            style={{ y: yImage }}
            className="w-full flex-1 flex justify-center lg:justify-end order-1 lg:order-2 px-4 sm:px-0"
          >
            <div className="relative w-full max-w-[300px] xs:max-w-[380px] sm:max-w-[480px] lg:max-w-[580px]">
              <div className="absolute -inset-10 bg-orange-600/10 blur-[80px] rounded-full animate-pulse" />
              
              <div className="relative z-10 p-2 sm:p-4 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-3xl border border-white/20 rounded-[2rem] sm:rounded-[3rem] shadow-2xl">
                <img
                  src="/profile41.jpeg"
                  alt="Perpetual Okan"
                  className="w-full aspect-[4/5] rounded-[1.8rem] sm:rounded-[2.5rem] object-cover saturate-[1.1] brightness-105"
                />
                
                {/* SYSTEM LIVE BADGE */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-6 right-0 sm:-right-8 p-3 sm:p-5 bg-zinc-900/95 backdrop-blur-3xl border border-zinc-700 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center gap-3 sm:gap-5 min-w-[150px] sm:min-w-[200px]"
                >
                  <div className="relative h-8 w-8 sm:h-12 sm:w-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                    <FiClock className="text-orange-500 text-xs sm:text-lg animate-pulse" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[8px] sm:text-[10px] text-orange-500/70 uppercase font-black tracking-widest leading-none mb-1">System Live</span>
                    <span className="text-xs sm:text-base text-zinc-100 font-mono font-bold">{formattedTime}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <ScrollIndicator opacity={opacity} />

      <style jsx>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </section>
  );
};

export default Hero;
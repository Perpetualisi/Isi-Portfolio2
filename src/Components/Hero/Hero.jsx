import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { FiArrowRight, FiDownload, FiClock, FiDatabase, FiLayout } from "react-icons/fi";

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const [time, setTime] = useState(new Date());

  // Mouse tracking for the spotlight effect
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

  // Cinematic Parallax & Fade
  const yImageValue = useTransform(scrollY, [0, 500], [0, -80]);
  const yImage = useSpring(yImageValue, { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  // Dynamic Spotlight background - Switched to a warm orange/gold for color
  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,165,0,0.08), transparent 80%)`
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
      className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-40 pb-20 bg-[#000000] overflow-hidden select-none"
    >
      {/* CINEMATIC BACKGROUND LAYER */}
      <motion.div style={{ opacity }} className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute inset-0 z-0" style={{ background: spotlightBg }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
        
        {/* Colorful Scanning Line */}
        <motion.div 
          animate={{ y: ["0vh", "100vh"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"
        />
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">
          
          {/* CONTENT AREA */}
          <div className="flex-[1.5] text-center lg:text-left space-y-10 order-2 lg:order-1">
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
                  className="text-[2.2rem] xs:text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tighter text-white leading-[1.1] whitespace-nowrap"
                >
                  Hi, I’m <span className="text-zinc-400 italic font-light outline-text">Perpetual Okan</span>
                </motion.h1>
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-light text-zinc-300 tracking-tight"
                >
                  Full-Stack Developer
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light"
                >
                  I build websites and web apps that are responsive, easy to use, and work well on any device. 
                  I work on both the frontend and backend to turn ideas into real digital products.
                </motion.p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
              <Link 
                to="/portfolio" 
                className="group relative w-full sm:w-auto px-10 py-4 bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-sm transition-all duration-300 hover:scale-105 active:scale-95 text-center shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Explore Work <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <button 
                onClick={handleDownload} 
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:border-orange-500/50 font-bold text-[11px] uppercase tracking-[0.2em] transition-all rounded-sm backdrop-blur-sm"
              >
                <FiDownload className="group-hover:-translate-y-1 transition-transform" /> Get Resume
              </button>
            </div>
          </div>

          {/* IMAGE AREA - BRIGHT & COLORFUL */}
          <motion.div 
            style={{ y: yImage }}
            className="flex-1 flex justify-center lg:justify-end order-1 lg:order-2 w-full"
          >
            <div className="relative w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[500px]">
              {/* Colorful vibrant glow behind image */}
              <div className="absolute -inset-10 bg-orange-600/20 blur-[100px] rounded-full animate-pulse" />
              <div className="absolute -inset-20 bg-blue-600/10 blur-[130px] rounded-full" />
              
              <div className="relative z-10 p-2 sm:p-3 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-visible">
                
                {/* Image: Removed Grayscale, increased saturation and vibrancy */}
                <img
                  src="/profile41.jpeg"
                  alt="Perpetual Okan"
                  className="w-full aspect-[4/5] rounded-[2rem] object-cover saturate-[1.2] brightness-105 contrast-[1.05] shadow-inner transition-all duration-700"
                />
                
                {/* Repositioned Status Badge */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-6 -right-4 sm:-right-8 p-4 bg-zinc-900/95 backdrop-blur-3xl border border-zinc-700 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[180px]"
                >
                  <div className="relative h-10 w-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                    <FiClock className="text-orange-500 text-sm animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-orange-500/70 uppercase font-black tracking-widest leading-none mb-1">System Live</span>
                    <span className="text-sm text-zinc-100 font-mono font-bold tracking-tighter">{formattedTime}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
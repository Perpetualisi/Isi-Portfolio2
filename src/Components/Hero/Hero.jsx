import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { FiArrowRight, FiDownload, FiClock, FiDatabase, FiLayout } from "react-icons/fi";

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const [time, setTime] = useState(new Date());

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

  const yImageValue = useTransform(scrollY, [0, 500], [0, -50]);
  const yImage = useSpring(yImageValue, { stiffness: 60, damping: 20 });
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

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
      /* - Changed pt-40 to pt-52 for a more generous gap from the navbar.
         - Changed md:pt-48 to md:pt-60 for consistent scaling on tablets.
      */
      className="relative min-h-screen flex flex-col justify-start lg:justify-center px-6 md:px-12 lg:px-24 pt-52 md:pt-60 lg:pt-0 pb-16 bg-[#000000] overflow-hidden"
    >
      {/* Background Grid */}
      <motion.div style={{ opacity }} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* IMAGE AREA */}
          <motion.div 
            style={{ y: yImage }}
            className="flex-1 flex justify-center lg:justify-end order-1 lg:order-2 w-full"
          >
            <div className="relative w-full max-w-[280px] sm:max-w-[360px] lg:max-w-[440px]">
              <div className="absolute -inset-10 bg-zinc-800/10 blur-[120px] rounded-full" />
              
              <div className="relative z-10 p-2 bg-zinc-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl">
                <img
                  src="/profile41.jpeg"
                  alt="Perpetual Okan"
                  className="w-full aspect-[4/5] rounded-2xl object-cover object-top brightness-[1.25] contrast-[1.1] saturate-[1.1]"
                  loading="eager"
                />
                
                {/* Status Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 sm:left-[-24px] sm:translate-x-0 p-2 sm:p-4 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl flex items-center gap-3 min-w-[150px] sm:min-w-[200px]"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="p-1.5 bg-zinc-900 rounded-md">
                      <FiClock className="text-zinc-400 text-xs sm:text-sm" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute h-full w-full rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[10px] text-zinc-500 uppercase font-bold tracking-widest">System Live</span>
                    <span className="text-xs sm:text-sm text-zinc-200 font-mono tracking-tighter">{formattedTime}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* CONTENT AREA */}
          <div className="flex-[1.5] text-center lg:text-left space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800">
                <span className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-500">Full-Stack Engineer</span>
              </motion.div>

              <div className="space-y-4">
                <motion.h1 className="text-4xl sm:text-6xl xl:text-7xl font-medium tracking-tight text-white leading-[1.1]">
                  Hi, I’m <span className="text-zinc-500 italic">Perpetual Okan</span>
                </motion.h1>
                <h2 className="text-2xl md:text-3xl font-light text-zinc-400">Full-Stack Developer</h2>
                <p className="text-base md:text-lg text-zinc-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  I build websites and web apps that are responsive, easy to use, and work well on any device. 
                  I work on both the frontend and backend to turn ideas into real digital products.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 justify-center lg:justify-start pt-4">
              <Link to="/portfolio" className="group w-full sm:w-auto px-10 py-4 bg-zinc-100 text-black font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-white transition-all text-center">
                <span className="flex items-center justify-center gap-2">
                  Explore Work <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <button onClick={handleDownload} className="group flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-200 font-bold text-xs uppercase tracking-[0.2em] transition-all">
                <FiDownload className="group-hover:-translate-y-1 transition-transform" /> Get Resume
              </button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-10 border-t border-zinc-900/50">
              <div className="flex items-center gap-2 text-zinc-800">
                <FiLayout className="text-sm" />
                <span className="text-[10px] uppercase tracking-widest">Frontend Mastery</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-800">
                <FiDatabase className="text-sm" />
                <span className="text-[10px] uppercase tracking-widest">Backend Logic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
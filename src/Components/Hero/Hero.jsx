import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { FiArrowRight, FiDownload, FiTerminal, FiDatabase, FiLayout } from "react-icons/fi";

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  
  // Refined parallax for a premium feel
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
      /* Pure black background applied here */
      className="relative min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 pt-32 pb-16 bg-[#000000] overflow-hidden"
    >
      {/* Background: Subtle Technical Grid with lower opacity for pure black depth */}
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
            <div className="relative w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[440px]">
              {/* Subtle ambient light to "brighten" the area against pure black */}
              <div className="absolute -inset-10 bg-zinc-800/10 blur-[120px] rounded-full" />
              
              <div className="relative z-10 p-2 bg-zinc-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl">
                <img
                  src="/profile41.jpeg"
                  alt="Perpetual Okan"
                  /* Brightness and Contrast boosters */
                  className="w-full aspect-[4/5] rounded-2xl object-cover object-top brightness-[1.25] contrast-[1.1] saturate-[1.1] transition-all duration-500"
                  loading="eager"
                />
                
                {/* Technical Floating Badge */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -bottom-6 -left-6 p-4 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl hidden sm:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 rounded-lg">
                      <FiTerminal className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Status</p>
                      <p className="text-xs text-zinc-200 font-mono">Available 2026</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* CONTENT AREA */}
          <div className="flex-[1.5] text-center lg:text-left space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800"
              >
                <span className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-500">Full-Stack Engineer</span>
              </motion.div>

              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  /* whitespace-nowrap and responsive font size ensure the one-line look */
                  className="text-4xl sm:text-6xl xl:text-7xl font-medium tracking-tight text-white leading-[1.1] whitespace-nowrap"
                >
                  Hi, I’m <span className="text-zinc-500 italic">Perpetual Okan</span>
                </motion.h1>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl md:text-3xl font-light text-zinc-400"
                >
                  Full-Stack Developer
                </motion.h2>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base md:text-lg text-zinc-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
                >
                  I build websites and web apps that are responsive, easy to use, and work well on any device. 
                  I work on both the frontend and backend to turn ideas into real digital products. 
                  I enjoy creating clean interfaces, writing backend logic, and connecting APIs to make apps interactive and useful.
                </motion.p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-8 justify-center lg:justify-start pt-4"
            >
              <Link 
                to="/portfolio" 
                className="group relative w-full sm:w-auto px-10 py-4 bg-zinc-100 text-black font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-white transition-all active:scale-95"
              >
                <span className="flex items-center justify-center gap-2">
                  Explore Work <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <button 
                onClick={handleDownload}
                className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-200 font-bold text-xs uppercase tracking-[0.2em] transition-all"
              >
                <FiDownload className="group-hover:-translate-y-1 transition-transform" /> 
                Get Resume
              </button>
            </motion.div>

            {/* Micro Tech Stack Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center lg:justify-start gap-8 pt-10 border-t border-zinc-900/50"
            >
              <div className="flex items-center gap-2 text-zinc-800">
                <FiLayout className="text-sm" />
                <span className="text-[10px] uppercase tracking-widest">Frontend Mastery</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-800">
                <FiDatabase className="text-sm" />
                <span className="text-[10px] uppercase tracking-widest">Backend Logic</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
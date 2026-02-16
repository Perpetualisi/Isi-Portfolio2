import React, { useRef, useMemo } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiGithub, FiArrowUpRight, FiLayers, FiExternalLink } from "react-icons/fi";
import Portfolio_Data from "../../assets/portfolio_data";

// ============================================================================
// ENHANCED 3D TILT CARD WITH LIVE LINK
// ============================================================================
const ProjectCard = React.memo(({ project, index }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17deg", "-17deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17deg", "17deg"]);
  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        rotateX, 
        rotateY, 
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
      className="relative group h-[450px] w-full cursor-pointer"
    >
      {/* FULL CARD LINK: Connects to project.link from your data */}
      <a 
        href={project.link || "#"} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block h-full w-full"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-black/90 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-500 group-hover:border-zinc-600/60 group-hover:shadow-2xl group-hover:shadow-zinc-950/50">
          
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-[-2px] bg-gradient-to-r from-zinc-500/20 via-zinc-400/20 to-zinc-500/20 rounded-3xl blur-sm" />
          </div>

          <motion.div 
            className="absolute inset-0 z-0"
            style={{ 
              transform: "translateZ(-40px) scale(1.15)",
              transformStyle: "preserve-3d"
            }}
          >
            <motion.img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.08]" 
              style={{ opacity: 0.7 }}
              whileHover={{ opacity: 0.85 }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
            
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
                 style={{ 
                   backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")",
                   backgroundSize: "200px 200px"
                 }} 
            />
          </motion.div>

          {/* DYNAMIC SPECULAR SHINE */}
          <motion.div 
            className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle 300px at ${shineX} ${shineY}, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 30%, transparent 70%)`
            }}
          />

          {/* CONTENT LAYER */}
          <div 
            className="relative z-20 h-full p-8 flex flex-col justify-between" 
            style={{ transform: "translateZ(60px)", transformStyle: "preserve-3d" }}
          >
            <div className="flex justify-between items-start">
              <motion.div className="text-zinc-600 font-mono text-xs tracking-widest">
                #{String(index + 1).padStart(2, '0')}
              </motion.div>
              
              <motion.div 
                className="bg-white text-black p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-2xl"
                style={{ transform: "translateZ(20px)" }}
                whileHover={{ scale: 1.1, rotate: 45 }}
              >
                <FiExternalLink size={18} strokeWidth={2.5} />
              </motion.div>
            </div>

            <div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {project.tags?.slice(0, 3).map((tag, i) => (
                  <span 
                    key={tag}
                    className="text-[9px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 bg-white/5 text-zinc-300 backdrop-blur-md border border-white/10 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <motion.h3 
                className="text-3xl font-black text-white tracking-tight mb-3 drop-shadow-2xl leading-tight"
                style={{ transform: "translateZ(30px)" }}
              >
                {project.title}
              </motion.h3>

              <motion.p 
                className="text-zinc-300 text-sm leading-relaxed max-w-[90%] line-clamp-2 drop-shadow-lg"
                style={{ transform: "translateZ(20px)" }}
              >
                {project.description}
              </motion.p>

              <motion.div className="w-0 h-0.5 bg-gradient-to-r from-zinc-500 to-transparent mt-6 group-hover:w-32 transition-all duration-700" />
            </div>
          </div>
        </div>
      </a>
      <div className="absolute inset-0 -z-10 bg-black/40 blur-2xl scale-95 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl" />
    </motion.div>
  );
});

ProjectCard.displayName = "ProjectCard";

// ============================================================================
// SECTION HEADER
// ============================================================================
const SectionHeader = () => {
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true });

  return (
    <header ref={headerRef} className="mb-28 relative">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <div className="space-y-6 relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            className="flex items-center gap-3 text-zinc-500"
          >
            <div className="w-8 h-[1px] bg-zinc-700" />
            <FiLayers size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Portfolio</span>
          </motion.div>

          <div className="relative">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] relative z-10"
            >
              SELECTED
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-700">
                PROJECTS
              </span>
            </motion.h2>
            <div className="absolute -top-4 -left-4 text-[140px] font-black text-zinc-950 opacity-50 select-none hidden md:block">
              06
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          className="max-w-[340px] space-y-4"
        >
          <p className="text-zinc-500 text-sm leading-relaxed">
            A curated collection of high-performance interactive experiences, 
            focusing on modern interfaces and immersive digital architecture.
          </p>
          <div className="flex items-center gap-2 text-zinc-700 text-xs">
            <div className="w-1 h-1 rounded-full bg-zinc-700 animate-pulse" />
            <span className="font-mono uppercase tracking-wider">2024 — Present</span>
          </div>
        </motion.div>
      </div>
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-zinc-800 via-zinc-700 to-transparent origin-left"
      />
    </header>
  );
};

// ============================================================================
// MAIN PORTFOLIO COMPONENT
// ============================================================================
const Portfolio = () => {
  const validProjects = useMemo(() => Portfolio_Data.slice(0, 6), []);
  const footerRef = useRef(null);
  const isFooterInView = useInView(footerRef, { once: true });

  return (
    <section 
      id="portfolio" 
      className="relative bg-black text-white pt-48 pb-32 px-6 overflow-hidden scroll-mt-32"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10" style={{ perspective: "2000px" }}>
          {validProjects.map((project, i) => (
            <ProjectCard key={project.id || i} project={project} index={i} />
          ))}
        </div>

        <footer ref={footerRef} className="mt-48 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isFooterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <motion.a 
              href="https://github.com/Perpetualisi/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-all px-8 py-4 border border-zinc-800 rounded-full hover:bg-zinc-900/50"
            >
              <FiGithub />
              <span>View Full Archive</span>
              <FiArrowUpRight />
            </motion.a>
          </motion.div>
        </footer>
      </div>
    </section>
  );
};

export default Portfolio;
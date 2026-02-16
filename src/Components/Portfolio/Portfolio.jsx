import React, { useRef, useMemo } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiGithub, FiArrowUpRight, FiLayers, FiExternalLink } from "react-icons/fi";
import Portfolio_Data from "../../assets/portfolio_data";

// ============================================================================
// ENHANCED 3D TILT CARD WITH CINEMATIC EFFECTS
// ============================================================================
const ProjectCard = React.memo(({ project, index }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  
  // Motion values for tracking mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for buttery motion
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse position to 3D rotation and effects
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
      {/* MAIN CARD CONTAINER */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-black/90 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-500 group-hover:border-zinc-600/60 group-hover:shadow-2xl group-hover:shadow-zinc-950/50">
        
        {/* ANIMATED BORDER GLOW */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-[-2px] bg-gradient-to-r from-zinc-500/20 via-zinc-400/20 to-zinc-500/20 rounded-3xl blur-sm" />
        </div>

        {/* BACKGROUND IMAGE WITH ENHANCED PARALLAX */}
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
          
          {/* SOPHISTICATED GRADIENT OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/60" />
          
          {/* NOISE TEXTURE FOR FILM GRAIN EFFECT */}
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

        {/* CONTENT LAYER (3D ELEVATED) */}
        <div 
          className="relative z-20 h-full p-8 flex flex-col justify-between" 
          style={{ transform: "translateZ(60px)", transformStyle: "preserve-3d" }}
        >
          {/* TOP SECTION - PROJECT NUMBER */}
          <div className="flex justify-between items-start">
            <motion.div 
              className="text-zinc-600 font-mono text-xs tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              #{String(index + 1).padStart(2, '0')}
            </motion.div>
            
            {/* HOVER ACTION ICON */}
            <motion.div 
              className="bg-white text-black p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-2xl"
              style={{ transform: "translateZ(20px)" }}
              whileHover={{ scale: 1.1, rotate: 45 }}
            >
              <FiExternalLink size={18} strokeWidth={2.5} />
            </motion.div>
          </div>

          {/* BOTTOM SECTION - PROJECT INFO */}
          <div>
            {/* TECHNOLOGY TAGS */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {project.tags?.slice(0, 3).map((tag, i) => (
                <motion.span 
                  key={tag}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-[9px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 bg-white/5 text-zinc-300 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* PROJECT TITLE */}
            <motion.h3 
              className="text-3xl font-black text-white tracking-tight mb-3 drop-shadow-2xl leading-tight"
              style={{ transform: "translateZ(30px)" }}
            >
              {project.title}
            </motion.h3>

            {/* PROJECT DESCRIPTION */}
            <motion.p 
              className="text-zinc-300 text-sm leading-relaxed max-w-[90%] line-clamp-2 drop-shadow-lg"
              style={{ transform: "translateZ(20px)" }}
            >
              {project.description}
            </motion.p>

            {/* BOTTOM ACCENT LINE */}
            <motion.div 
              className="w-0 h-0.5 bg-gradient-to-r from-zinc-500 to-transparent mt-6 group-hover:w-32 transition-all duration-700"
            />
          </div>
        </div>

        {/* CORNER ACCENT */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
      </div>

      {/* FLOATING SHADOW */}
      <div className="absolute inset-0 -z-10 bg-black/40 blur-2xl scale-95 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl" />
    </motion.div>
  );
});

ProjectCard.displayName = "ProjectCard";

// ============================================================================
// SECTION HEADER WITH ANIMATIONS
// ============================================================================
const SectionHeader = () => {
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true });

  return (
    <header ref={headerRef} className="mb-28 relative">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        {/* LEFT SIDE - TITLE */}
        <div className="space-y-6 relative">
          {/* EYEBROW */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 text-zinc-500"
          >
            <div className="w-8 h-[1px] bg-zinc-700" />
            <FiLayers size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Portfolio</span>
          </motion.div>

          {/* MAIN TITLE */}
          <div className="relative">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] relative z-10"
            >
              SELECTED
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-700">
                PROJECTS
              </span>
            </motion.h2>
            
            {/* BACKGROUND NUMBER */}
            <div className="absolute -top-4 -left-4 text-[140px] font-black text-zinc-950 opacity-50 select-none leading-none pointer-events-none hidden md:block">
              06
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - DESCRIPTION */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-[340px] space-y-4"
        >
          <p className="text-zinc-500 text-sm leading-relaxed">
            A curated collection of high-performance interactive experiences, 
            focusing on 3D interfaces and immersive digital architecture.
          </p>
          <div className="flex items-center gap-2 text-zinc-700 text-xs">
            <div className="w-1 h-1 rounded-full bg-zinc-700 animate-pulse" />
            <span className="font-mono uppercase tracking-wider">2024 — Present</span>
          </div>
        </motion.div>
      </div>

      {/* DECORATIVE LINE */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
    <section className="relative bg-black text-white py-32 px-6 overflow-hidden">
      {/* AMBIENT BACKGROUND EFFECTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-zinc-900/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-zinc-800/20 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER */}
        <SectionHeader />

        {/* PROJECTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10" style={{ perspective: "2000px" }}>
          {validProjects.map((project, i) => (
            <ProjectCard key={project.id || i} project={project} index={i} />
          ))}
        </div>

        {/* FOOTER CTA */}
        <footer ref={footerRef} className="mt-48 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isFooterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-block">
              <motion.a 
                href="https://github.com/Perpetualisi/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ letterSpacing: "0.5em", scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-all duration-500 group px-8 py-4 border border-zinc-800 rounded-full hover:border-zinc-600 hover:bg-zinc-900/50"
              >
                <FiGithub className="group-hover:rotate-12 transition-transform duration-500" />
                <span>View Full Archive</span>
                <FiArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
              </motion.a>
            </div>

            {/* BOTTOM DECORATION */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={isFooterInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="w-32 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent mx-auto"
            />
          </motion.div>
        </footer>
      </div>

      {/* GLOBAL STYLES */}
      <style jsx>{`
        section { 
          perspective: 2000px;
          perspective-origin: center center;
        }
      `}</style>
    </section>
  );
};

export default Portfolio;
import React, { useRef, useMemo } from "react"; // Added useMemo here
import { motion, useInView } from "framer-motion";
import { FiCode, FiGithub, FiExternalLink, FiArrowUpRight } from "react-icons/fi";
import Portfolio_Data from "../../assets/portfolio_data";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const ANIMATION_CONFIG = {
  easings: {
    smooth: [0.16, 1, 0.3, 1],
    spring: { type: "spring", stiffness: 100, damping: 15 },
  },
  durations: {
    default: 0.6,
    slow: 0.8,
  },
};

const MAX_VISIBLE_TAGS = 3;
const INTERSECTION_THRESHOLD = 0.2;

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_CONFIG.durations.slow,
      ease: ANIMATION_CONFIG.easings.smooth,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: ANIMATION_CONFIG.durations.default },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_CONFIG.durations.default,
      ease: ANIMATION_CONFIG.easings.smooth,
    },
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ProjectImage = ({ image, title }) => (
  <div className="relative aspect-video overflow-hidden bg-zinc-900">
    <motion.img
      src={image}
      alt={`${title} preview`}
      className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
      style={{ filter: "grayscale(0.2)" }}
      whileHover={{ filter: "grayscale(0)" }}
      loading="lazy"
      decoding="async"
    />
    <div
      className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent pointer-events-none"
      aria-hidden="true"
    />
  </div>
);

const TechTags = ({ tags }) => {
  const visibleTags = useMemo(() => tags.slice(0, MAX_VISIBLE_TAGS), [tags]);
  return (
    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2" role="list">
      {visibleTags.map((tag) => (
        <span
          key={tag}
          role="listitem"
          className="px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-md shadow-lg"
        >
          {tag}
        </span>
      ))}
      {tags.length > MAX_VISIBLE_TAGS && (
        <span className="px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold bg-white/5 backdrop-blur-md border border-white/10 text-zinc-400 rounded-md">
          +{tags.length - MAX_VISIBLE_TAGS}
        </span>
      )}
    </div>
  );
};

const ProjectLinks = ({ githubUrl, demoUrl }) => (
  <div className="flex items-center justify-between gap-3 mt-auto pt-5 border-t border-zinc-800/50">
    {githubUrl && (
      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors duration-200"
      >
        <FiGithub size={14} />
        <span>Source</span>
      </a>
    )}
    {demoUrl && (
      <a
        href={demoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group/btn relative overflow-hidden px-4 py-2 rounded-lg bg-white text-black text-[10px] font-black uppercase tracking-wider transition-all duration-200 hover:bg-zinc-100 active:scale-95"
      >
        <span className="relative z-10 flex items-center gap-1.5">
          Live Demo <FiExternalLink size={12} />
        </span>
      </a>
    )}
  </div>
);

const ProjectCard = React.memo(({ project }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, amount: INTERSECTION_THRESHOLD });

  return (
    <motion.article
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      animate={{
        filter: isInView ? "brightness(1) grayscale(0%)" : "brightness(0.6) grayscale(30%)",
      }}
      className="group relative flex flex-col bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-500"
    >
      <div className="relative">
        <ProjectImage image={project.image} title={project.title} />
        <TechTags tags={project.tags} />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors duration-300">
            {project.title}
          </h3>
          <FiArrowUpRight className="text-zinc-600 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1" size={18} />
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
          {project.description}
        </p>
        <ProjectLinks githubUrl={project.link} demoUrl={project.demo} />
      </div>
    </motion.article>
  );
});

// ============================================================================
// MAIN PORTFOLIO COMPONENT
// ============================================================================

const Portfolio = () => {
  const validProjects = useMemo(
    () => Portfolio_Data.filter(p => p && p.title && p.description && p.image && Array.isArray(p.tags)),
    []
  );

  return (
    <section
      id="portfolio"
      aria-labelledby="portfolio-heading"
      className="portfolio-section relative bg-black text-white px-6 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <h1 id="portfolio-heading" className="sr-only">Portfolio - Featured Projects</h1>

        {/* HEADER SECTION - Reduced pt-24/32 to pt-12/16 to bring it upwards */}
        <header className="pt-12 md:pt-16 mb-12 md:mb-16 space-y-6">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-center gap-2 text-zinc-500"
          >
            <FiCode size={20} />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Selected Works</span>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <motion.h2
              variants={titleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]"
            >
              Featured<br />
              <span className="text-zinc-800 outline-text">Projects</span>
            </motion.h2>

            <motion.blockquote
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="max-w-xs text-zinc-500 text-sm italic border-l-2 border-zinc-800 pl-4"
            >
              <p>"Engineering isn't just about code; it's about creating intuitive digital architecture."</p>
            </motion.blockquote>
          </div>
        </header>

        {/* GRID SECTION */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10"
        >
          {validProjects.map((project, index) => (
            <ProjectCard key={project.id || index} project={project} />
          ))}
        </motion.div>

        {/* FOOTER CTA */}
        <footer className="py-20 md:py-32 text-center">
          <motion.a
            href="https://github.com/Perpetualisi/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-4 px-10 py-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-400 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
          >
            Explore Archive <FiGithub size={18} />
          </motion.a>
        </footer>
      </div>

      <style jsx>{`
        .portfolio-section {
          scroll-margin-top: 100px; 
        }

        .outline-text {
          -webkit-text-stroke: 1px #27272a;
          -webkit-text-fill-color: transparent;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </section>
  );
};

export default Portfolio;
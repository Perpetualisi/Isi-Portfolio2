import React, { useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { FiCode, FiGithub, FiExternalLink, FiArrowUpRight } from "react-icons/fi";
import Portfolio_Data from "../../assets/portfolio_data";

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
const INTERSECTION_THRESHOLD = 0.3;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const ProjectImage = ({ image, title }) => (
  <div className="relative aspect-video overflow-hidden bg-black">
    <motion.img
      src={image}
      alt={`${title} preview`}
      className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110"
      loading="lazy"
    />
    {/* Cinematic Overlay: Darkens the image until hover */}
    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700" />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
  </div>
);

const TechTags = ({ tags }) => {
  const visibleTags = useMemo(() => tags.slice(0, MAX_VISIBLE_TAGS), [tags]);
  return (
    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-20">
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 text-[8px] uppercase tracking-[0.2em] font-black bg-white text-black rounded-full shadow-2xl"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

const ProjectLinks = ({ githubUrl, demoUrl }) => (
  <div className="flex items-center justify-between gap-3 mt-auto pt-6 border-t border-zinc-900">
    {githubUrl && (
      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-zinc-600 hover:text-white transition-all duration-300"
      >
        <FiGithub size={14} />
        <span>Source_Code</span>
      </a>
    )}
    {demoUrl && (
      <a
        href={demoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all duration-300 rounded-full flex items-center gap-2"
      >
        Live <FiExternalLink size={12} />
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
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 }
      }}
      animate={{
        // Cinematic Focus: Dims and blurs cards that aren't in the "center" of the view
        opacity: isInView ? 1 : 0.3,
        filter: isInView ? "grayscale(0%) blur(0px)" : "grayscale(100%) blur(2px)",
        scale: isInView ? 1 : 0.95
      }}
      transition={{ duration: 0.8, ease: ANIMATION_CONFIG.easings.smooth }}
      className="group relative flex flex-col bg-[#050505] border border-zinc-900 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-700"
    >
      <div className="relative overflow-hidden">
        <ProjectImage image={project.image} title={project.title} />
        <TechTags tags={project.tags} />
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
            {project.title}
          </h3>
          <div className="p-2 rounded-full border border-zinc-800 group-hover:border-white transition-colors duration-500">
            <FiArrowUpRight className="text-zinc-600 group-hover:text-white transition-transform duration-500 group-hover:rotate-45" size={16} />
          </div>
        </div>
        
        <p className="text-zinc-500 text-sm leading-relaxed font-light mb-8 line-clamp-3 group-hover:text-zinc-300 transition-colors duration-500">
          {project.description}
        </p>
        
        <ProjectLinks githubUrl={project.link} demoUrl={project.demo} />
      </div>
    </motion.article>
  );
});

const Portfolio = () => {
  const validProjects = useMemo(
    () => Portfolio_Data.filter(p => p && p.title && p.description && p.image && Array.isArray(p.tags)),
    []
  );

  return (
    <section id="portfolio" className="relative bg-black text-white px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="sr-only">Portfolio - Featured Projects</h1>

        {/* HEADER SECTION */}
        <header className="pt-12 md:pt-16 mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 text-zinc-500"
            >
              <div className="h-[1px] w-8 bg-zinc-800" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Selected_Works_Archive</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.8] uppercase"
            >
              Featured<br />
              <span className="text-zinc-900 outline-text">Projects</span>
            </motion.h2>
          </div>

          <motion.blockquote
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-[280px] text-zinc-600 text-[11px] uppercase tracking-widest leading-loose border-l border-zinc-900 pl-6 italic"
          >
            "Engineering isn't just about code; it's about creating intuitive digital architecture."
          </motion.blockquote>
        </header>

        {/* GRID SECTION */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
        >
          {validProjects.map((project, index) => (
            <ProjectCard key={project.id || index} project={project} />
          ))}
        </motion.div>

        {/* FOOTER CTA */}
        <footer className="mt-32 pb-20 text-center">
          <motion.a
            href="https://github.com/Perpetualisi/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-6 px-12 py-6 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-zinc-200"
          >
            Terminal Archive <FiGithub size={18} />
          </motion.a>
        </footer>
      </div>

      <style jsx>{`
        .outline-text {
          -webkit-text-stroke: 1.5px #18181b;
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
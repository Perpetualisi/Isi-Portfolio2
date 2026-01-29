import React from "react";
import { motion } from "framer-motion";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import Portfolio_Data from "../../assets/portfolio_data";

const ProjectCard = ({ project, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className="group relative bg-[#0a0a0a] border border-zinc-800 rounded-lg overflow-hidden transition-all duration-500 hover:border-zinc-400 hover:shadow-[0_0_40px_rgba(255,255,255,0.07)]"
  >
    {/* Image Container - High Clarity */}
    <div className="relative h-64 overflow-hidden border-b border-zinc-800">
      <img
        src={project.image}
        alt={project.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
      />
      
      {/* High-contrast Tech Badges */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
        {project.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-3 py-1 bg-white text-black text-[9px] uppercase tracking-widest font-bold rounded-sm shadow-xl">
            {tag}
          </span>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-30" />
    </div>

    {/* Content Section */}
    <div className="p-8">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          {project.title}
        </h3>
        <span className="text-[10px] font-mono text-zinc-500">0{index + 1}</span>
      </div>
      
      <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-light line-clamp-2 group-hover:text-zinc-200 transition-colors">
        {project.description}
      </p>

      {/* Buttons - High Visibility */}
      <div className="flex items-center gap-6 pt-4 border-t border-zinc-800">
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-zinc-400 hover:text-white transition-all underline underline-offset-4 decoration-zinc-800 hover:decoration-white"
        >
          <FiGithub /> Source
        </a>
        
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-white bg-zinc-800 px-4 py-2 rounded-sm hover:bg-white hover:text-black transition-all"
          >
            Live Demo <FiExternalLink />
          </a>
        )}
      </div>
    </div>
  </motion.div>
);

const Portfolio = () => {
  return (
    <section id="portfolio" className="bg-[#000000] text-white py-32 px-6 md:px-12 lg:px-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section: Bold & Bright */}
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-xs uppercase tracking-[0.5em] mb-6 flex items-center gap-4 text-zinc-500">
              <span className="w-8 h-[1px] bg-zinc-700" />
              Portfolio
            </h2>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
              Featured <span className="text-zinc-600">Projects.</span>
            </h1>
          </div>
          <p className="text-zinc-400 text-sm max-w-[300px] font-medium leading-relaxed border-l border-zinc-800 pl-6">
            Converting complex logic into seamless digital experiences through modern engineering.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Portfolio_Data.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>

        {/* High-Impact CTA */}
        <div className="mt-32 text-center">
          <motion.a 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="https://github.com/Perpetualisi/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-12 py-6 bg-white text-black font-black text-xs uppercase tracking-[0.4em] hover:bg-zinc-200 transition-all rounded-sm shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
          >
            View Full Repository <FiGithub size={18} />
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
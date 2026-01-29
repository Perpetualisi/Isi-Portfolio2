import React from "react";
import { motion } from "framer-motion";
import { FiCode, FiLayers, FiTerminal, FiCpu } from "react-icons/fi";

const SKILL_CATEGORIES = [
  {
    title: "Frontend Mastery",
    icon: <FiLayers className="text-zinc-500" />,
    skills: ["React.js", "TypeScript", "Tailwind CSS", "HTML & CSS", "JavaScript"],
  },
  {
    title: "Backend & Core",
    icon: <FiCpu className="text-zinc-500" />,
    skills: ["Node.js", "REST APIs", "PostgreSQL", "System Logic"],
  },
  {
    title: "Workflow & Tools",
    icon: <FiTerminal className="text-zinc-500" />,
    skills: ["Git & GitHub", "Docker", "CI/CD", "WordPress"],
  },
];

const achievements = [
  { count: "15+", label: "Products Delivered", detail: "Concept to deployment" },
  { count: "100%", label: "Responsive Ratio", detail: "All device optimization" },
  { count: "05+", label: "Global Partners", detail: "Technical execution" },
];

const About = () => {
  return (
    <section id="about" className="bg-[#000000] text-white py-32 px-6 sm:px-12 lg:px-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Simple Straight Heading */}
        <div className="mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-light tracking-tighter"
          >
            A little about me
          </motion.h2>
          <div className="mt-6 w-16 h-[1px] bg-zinc-800" />
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          
          {/* Bio Section */}
          <div className="space-y-12">
            <div className="space-y-8">
              <p className="text-zinc-200 leading-relaxed text-xl md:text-2xl font-light">
                I’m <span className="text-white font-normal underline decoration-zinc-800 underline-offset-8">Okan Perpetual Isi</span>, a Full-Stack Developer.
              </p>
              
              <div className="space-y-6 text-zinc-500 text-base leading-relaxed font-light max-w-xl">
                <p>
                  I build responsive websites and web applications that work smoothly across all devices. I handle both frontend and backend development to turn ideas into real digital products.
                </p>
                <p>
                  I create clean and user-friendly interfaces using <span className="text-zinc-300">React.js, Tailwind CSS, HTML, CSS, and TypeScript</span> and develop backend services with <span className="text-zinc-300">Node.js</span>. I also integrate REST APIs to make applications dynamic and interactive.
                </p>
                <p>
                  I enjoy learning new technologies and following best practices to keep my code clean, efficient, and easy to maintain.
                </p>
              </div>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
              {achievements.map((item, i) => (
                <div key={i} className="p-8 bg-black hover:bg-zinc-950 transition-all">
                  <h4 className="text-4xl font-light text-white mb-2 tracking-tighter">{item.count}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold mb-3">{item.label}</p>
                  <p className="text-zinc-600 text-[11px] leading-tight font-light">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Arsenal */}
          <div className="bg-[#050505] border border-zinc-900 p-10 md:p-14 rounded-sm">
            <h3 className="text-[10px] font-bold mb-12 uppercase tracking-[0.6em] text-zinc-600 flex items-center gap-4">
              <span className="w-12 h-[1px] bg-zinc-800" />
              Technical Arsenal
            </h3>
            
            <div className="space-y-12">
              {SKILL_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="space-y-5">
                  <div className="flex items-center gap-3">
                    {cat.icon}
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">
                      {cat.title}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <span 
                        key={skill}
                        className="px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-sm text-[11px] font-mono text-zinc-500 hover:text-white hover:border-zinc-400 transition-all duration-500"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 pt-8 border-t border-zinc-900">
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-800 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600"></span>
                </span>
                Currently learning: <span className="text-zinc-300">WordPress</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
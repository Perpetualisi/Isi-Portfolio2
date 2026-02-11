import React from "react";
import { motion, useInView } from "framer-motion";
import { FiCode, FiLayers, FiTerminal, FiCpu } from "react-icons/fi";
import { useRef } from "react";

const SKILL_CATEGORIES = [
  {
    title: "Frontend Development",
    icon: <FiLayers className="text-zinc-500" />,
    skills: ["React.js", "TypeScript", "JavaScript (ES6+)", "Tailwind CSS", "Bootstrap", "HTML", "CSS"],
  },
  {
    title: "Backend & APIs",
    icon: <FiCpu className="text-zinc-500" />,
    skills: ["Node.js", "REST APIs", "WordPress", "CMS Management"],
  },
  {
    title: "Tools & Workflow",
    icon: <FiTerminal className="text-zinc-500" />,
    skills: ["Git", "API Integration", "Third-party Services"],
  },
];

const achievements = [
  { count: "15+", label: "Projects Delivered", detail: "Concept to production-grade apps" },
  { count: "100%", label: "Responsive Ratio", detail: "Optimized for all devices" },
  { count: "05+", label: "Global Partners", detail: "Collaborations with international teams" },
];

// Cinematic paragraph component that brightens on scroll
const CinematicParagraph = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: false, 
    amount: 0.5,
    margin: "-100px"
  });

  return (
    <motion.p
      ref={ref}
      className={className}
      initial={{ opacity: 0.1, y: 10 }}
      animate={{ 
        opacity: isInView ? 1 : 0.3,
        y: isInView ? 0 : 10,
        scale: isInView ? 1 : 0.98,
      }}
      transition={{ 
        duration: 0.8,
        delay: delay,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.p>
  );
};

// Cinematic section component
const CinematicSection = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: false, 
    amount: 0.2,
    margin: "-50px"
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0.2, y: 20 }}
      animate={{ 
        opacity: isInView ? 1 : 0.2,
        y: isInView ? 0 : 20,
      }}
      transition={{ 
        duration: 0.8,
        delay: delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

const About = () => {
  return (
    <section
      id="about"
      /* Added pt-48 for clearance and scroll-mt-20 for navbar offset */
      className="bg-[#000000] text-white pt-48 pb-32 px-6 sm:px-12 lg:px-24 border-t border-zinc-900 relative scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Heading */}
        <motion.div
          className="mb-16 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
            <FiCode className="text-zinc-500 text-sm" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">
              About Me
            </span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          
          {/* Bio Section */}
          <div className="space-y-12">
            <div className="space-y-8">
              <CinematicParagraph className="text-zinc-200 leading-relaxed text-xl md:text-3xl font-light tracking-tight">
                I'm a Full-Stack Developer with hands-on experience building web applications using <span className="text-white font-medium">React.js</span>, <span className="text-white font-medium">TypeScript</span>, and <span className="text-white font-medium">Node.js</span>.
              </CinematicParagraph>
              
              <div className="space-y-6 text-zinc-500 text-base md:text-lg leading-relaxed font-light max-w-xl">
                <CinematicParagraph delay={0.1}>
                  I specialize in creating clean, responsive, and user-friendly interfaces, while also developing and integrating backend logic that supports scalable, real-world applications.
                </CinematicParagraph>
                
                <CinematicParagraph delay={0.15}>
                  On the backend, I build and consume RESTful APIs, handle data flow between frontend and server, and integrate third-party services such as analytics and authentication tools.
                </CinematicParagraph>
                
                <CinematicParagraph delay={0.2}>
                  I collaborate closely with stakeholders to translate ideas into functional digital solutions, utilizing AI-assisted tools to improve efficiency while maintaining full ownership of the code.
                </CinematicParagraph>
              </div>
            </div>

            {/* Achievement Grid */}
            <CinematicSection className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900 overflow-hidden rounded-sm">
              {achievements.map((item, i) => (
                <motion.div
                  key={i}
                  className="p-8 bg-black hover:bg-zinc-950 transition-all cursor-default"
                  whileHover={{ backgroundColor: "#050505" }}
                >
                  <h4 className="text-4xl font-light text-white mb-2 tracking-tighter">{item.count}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold mb-3">{item.label}</p>
                  <p className="text-zinc-600 text-[11px] leading-tight font-light">{item.detail}</p>
                </motion.div>
              ))}
            </CinematicSection>
          </div>

          {/* Technical Arsenal */}
          <CinematicSection className="bg-[#050505] border border-zinc-900 p-10 md:p-14 rounded-sm sticky top-32">
            <h3 className="text-[10px] font-bold mb-12 uppercase tracking-[0.6em] text-zinc-600 flex items-center gap-4">
              <span className="w-12 h-[1px] bg-zinc-800" />
              Tech Stack & Tools
            </h3>
            
            <div className="space-y-12">
              {SKILL_CATEGORIES.map((category, idx) => (
                <motion.div
                  key={idx}
                  className="space-y-5"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    {category.icon}
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">
                      {category.title}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <motion.span
                        key={skill}
                        className="px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-sm text-[11px] font-mono text-zinc-500 hover:text-white hover:border-zinc-400 transition-all duration-500 cursor-default"
                        whileHover={{ scale: 1.05, y: -2 }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-16 pt-8 border-t border-zinc-900"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-800 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600"></span>
                </span>
                Open to: <span className="text-zinc-300">Full-time & Remote</span>
              </p>
            </motion.div>
          </CinematicSection>
        </div>
      </div>
    </section>
  );
};

export default About;
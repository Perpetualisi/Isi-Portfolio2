import React from "react";
import { motion } from "framer-motion";
import { FiCode, FiLayers, FiTerminal, FiCpu } from "react-icons/fi";

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
    skills: ["Git", "AI-Assisted Development", "API Integration", "Third-party Services"],
  },
];

const achievements = [
  { count: "15+", label: "Projects Delivered", detail: "Concept to production-grade apps" },
  { count: "100%", label: "Responsive Ratio", detail: "Optimized for all devices" },
  { count: "05+", label: "Global Partners", detail: "Collaborations with international teams" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const About = () => {
  return (
    <section
      id="about"
      className="bg-[#000000] text-white py-32 px-6 sm:px-12 lg:px-24 border-t border-zinc-900"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Heading */}
        <motion.div
          className="mb-12 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
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
          <motion.div
            className="space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div className="space-y-8" variants={itemVariants}>
              <p className="text-zinc-200 leading-relaxed text-xl md:text-2xl font-light">
                I'm a Full-Stack Developer with hands-on experience building and maintaining web applications using React.js, TypeScript, JavaScript, Tailwind CSS, Bootstrap, HTML, and CSS, alongside backend technologies such as Node.js, REST APIs, and WordPress.
              </p>
              
              <div className="space-y-6 text-zinc-500 text-base leading-relaxed font-light max-w-xl">
                <p>
                  I specialize in creating clean, responsive, and user-friendly interfaces, while also developing and integrating backend logic that supports scalable, real-world applications. I work comfortably with WordPress CMS, customizing themes, managing content, and extending functionality through plugins and API integrations to meet business and storytelling goals.
                </p>
                <p>
                  On the backend, I build and consume RESTful APIs, handle data flow between frontend and server, and integrate third-party services such as analytics, forms, and authentication tools. I focus on performance, accessibility, and maintainability, ensuring websites and applications are reliable and easy to manage.
                </p>
                <p>
                  I collaborate closely with designers, marketers, and non-technical stakeholders to translate ideas into functional digital solutions. I also use AI-assisted development tools to speed up development, debug issues efficiently, and improve code quality—while maintaining full understanding and ownership of every project.
                </p>
                <p>
                  I'm continuously improving my skills across the full stack and I'm interested in opportunities involving WordPress development, API-driven applications, and Node.js-based systems, especially within teams building impactful, purpose-driven products.
                </p>
              </div>
            </motion.div>

            {/* Achievement Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900"
              variants={itemVariants}
            >
              {achievements.map((item, i) => (
                <motion.div
                  key={i}
                  className="p-8 bg-black hover:bg-zinc-950 transition-all cursor-default"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <h4 className="text-4xl font-light text-white mb-2 tracking-tighter">{item.count}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold mb-3">{item.label}</p>
                  <p className="text-zinc-600 text-[11px] leading-tight font-light">{item.detail}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Technical Arsenal */}
          <motion.div
            className="bg-[#050505] border border-zinc-900 p-10 md:p-14 rounded-sm"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
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
                  viewport={{ once: true }}
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
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
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
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-800 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600"></span>
                </span>
                Open to: <span className="text-zinc-300">Full-time, Contract & Remote Opportunities</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
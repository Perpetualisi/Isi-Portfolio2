import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FiCode, FiLayers, FiTerminal, FiCpu } from "react-icons/fi";

const SKILL_CATEGORIES = [
  {
    title: "Frontend Development",
    icon: <FiLayers className="text-zinc-500" />,
    skills: ["React.js", "JavaScript (ES6+)", "HTML", "CSS", "Tailwind CSS"],
  },
  {
    title: "Backend & CMS",
    icon: <FiCpu className="text-zinc-500" />,
    skills: ["Node.js", "REST APIs", "Express.js", "WordPress", "CMS Management"],
  },
  {
    title: "Tools & Workflow",
    icon: <FiTerminal className="text-zinc-500" />,
    skills: ["Git", "GitHub", "Postman", "Docker", "VS Code", "Debugging", "API Integration"],
  },
];

const achievements = [
  { count: "15+", label: "Projects Delivered", detail: "Concept to production-grade apps" },
  { count: "100%", label: "Responsive Ratio", detail: "Optimized for all devices" },
  { count: "CMS", label: "Expertise", detail: "WordPress theme customization" },
];

const CinematicParagraph = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });

  return (
    <motion.p
      ref={ref}
      className={className}
      initial={{ opacity: 0.15 }}
      animate={{ opacity: isInView ? 1 : 0.15 }}
      transition={{ duration: 0.8, delay: delay }}
    >
      {children}
    </motion.p>
  );
};

const About = () => {
  return (
    <section
      id="about"
      className="bg-[#000000] text-white pt-48 pb-32 px-6 sm:px-12 lg:px-24 border-t border-zinc-900 relative"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* HEADING */}
        <motion.div
          className="mb-16 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
            <FiCode className="text-white text-sm" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white">
              About Me
            </span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          
          {/* BIO SECTION */}
          <div className="space-y-12">
            <div className="space-y-8">
              <CinematicParagraph className="text-zinc-200 leading-relaxed text-xl md:text-2xl font-light tracking-tight">
                I’m a <span className="text-white font-medium">Full-Stack Developer</span> with experience building web applications using <span className="text-white font-medium">React.js, JavaScript, HTML, CSS</span>, alongside backend technologies such as <span className="text-white font-medium">Node.js, REST APIs, and WordPress.</span>
              </CinematicParagraph>

              <div className="space-y-6 text-zinc-500 text-base md:text-lg leading-relaxed font-light max-w-xl">
                <CinematicParagraph delay={0.1}>
                  I specialize in creating clean, responsive, and user-friendly interfaces, while also developing and integrating backend logic that supports scalable, real-world applications. I work with WordPress CMS, customizing themes, managing content, and extending functionality through plugins and API integrations.
                </CinematicParagraph>

                <CinematicParagraph delay={0.15}>
                  On the backend, I build and consume RESTful APIs, handle data flow between frontend and server, and integrate third-party services such as analytics, forms, and authentication tools. I focus on performance, accessibility, and maintainability, ensuring websites and applications are reliable and easy to manage.
                </CinematicParagraph>

                <CinematicParagraph delay={0.2}>
                  I collaborate closely with designers, marketers, and non-technical stakeholders to translate ideas into functional digital solutions. I use industry-standard development tools to streamline workflow, debug efficiently, and maintain high code quality.
                </CinematicParagraph>

                <CinematicParagraph delay={0.25} className="text-zinc-400 italic">
                  I continuously improve my skills across the full stack and am interested in opportunities involving WordPress development, API-driven applications, and Node.js-based systems.
                </CinematicParagraph>
              </div>
            </div>

            {/* ACHIEVEMENT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900 rounded-sm overflow-hidden">
              {achievements.map((item, i) => (
                <div key={i} className="p-8 bg-black">
                  <h4 className="text-4xl font-black text-white mb-2 tracking-tighter">{item.count}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black mb-3">{item.label}</p>
                  <p className="text-zinc-600 text-[11px] leading-tight font-medium">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* TECHNICAL ARSENAL */}
          <div className="bg-[#050505] border border-zinc-900 p-10 md:p-14 rounded-sm sticky top-32">
            <h3 className="text-[10px] font-black mb-12 uppercase tracking-[0.6em] text-white flex items-center gap-4">
              <span className="w-12 h-[1px] bg-zinc-800" />
              Tech Stack & Tools
            </h3>

            <div className="space-y-12">
              {SKILL_CATEGORIES.map((category, idx) => (
                <div key={idx} className="space-y-5">
                  <div className="flex items-center gap-3">
                    {category.icon}
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">
                      {category.title}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-full text-[11px] font-bold text-zinc-500 hover:text-white hover:border-white transition-all duration-300"
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-20"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
                </span>
                Open to: <span className="text-zinc-300">Full-time, Contract, and Remote</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
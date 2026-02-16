import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { FiCode, FiLayers, FiTerminal, FiCpu, FiZap, FiTrendingUp, FiAward } from "react-icons/fi";

// ============================================================================
// DATA STRUCTURES
// ============================================================================
const SKILL_CATEGORIES = [
  {
    title: "Frontend Development",
    icon: <FiLayers className="text-zinc-500" />,
    skills: ["React.js", "JavaScript (ES6+)", "HTML5", "CSS3", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "Backend & CMS",
    icon: <FiCpu className="text-zinc-500" />,
    skills: ["Node.js", "REST APIs", "Express.js", "WordPress", "CMS Management", "Database Design"],
  },
  {
    title: "Tools & Workflow",
    icon: <FiTerminal className="text-zinc-500" />,
    skills: ["Git", "GitHub", "Postman", "Docker", "VS Code", "Debugging", "API Integration", "CI/CD"],
  },
];

const achievements = [
  { 
    count: "15+", 
    label: "Projects Delivered", 
    detail: "Concept to production-grade apps",
    icon: <FiZap />
  },
  { 
    count: "100%", 
    label: "Responsive Ratio", 
    detail: "Optimized for all devices",
    icon: <FiTrendingUp />
  },
  { 
    count: "CMS", 
    label: "Expertise", 
    detail: "WordPress theme customization",
    icon: <FiAward />
  },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
const CinematicParagraph = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5, margin: "-100px" });

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
      transition={{ duration: 0.8, delay: delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.p>
  );
};

const CinematicSection = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0.2, y: 20 }}
      animate={{ opacity: isInView ? 1 : 0.2, y: isInView ? 0 : 20 }}
      transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

const SectionHeader = () => {
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true });
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <motion.header ref={headerRef} className="mb-16 relative" style={{ opacity }}>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
        transition={{ duration: 0.8 }}
        className="mb-8 flex items-center gap-4"
      >
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-xl">
          <FiCode className="text-zinc-500 text-sm" />
          <span className="text-[9px] uppercase tracking-[0.4em] font-black text-zinc-500">
            About Me
          </span>
        </div>
      </motion.div>

      <div className="relative">
        <motion.div style={{ y }}>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05]"
          >
            BUILDING BETTER
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-600">
              WEB SOLUTIONS
            </span>
          </motion.h2>
        </motion.div>

        <div className="absolute -top-10 -left-6 text-[120px] font-black text-zinc-950/30 opacity-50 select-none leading-none pointer-events-none hidden lg:block">
          DEV
        </div>
      </div>
      
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="absolute -bottom-8 left-0 right-0 h-[1px] bg-gradient-to-r from-zinc-800 via-zinc-700 to-transparent origin-left"
      />
    </motion.header>
  );
};

const AchievementCard = ({ item, index }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.5 });
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);

  return (
    <motion.div
      ref={cardRef}
      style={{ scale }}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative p-6 bg-zinc-950/50 border border-zinc-900 rounded-2xl hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-all duration-500 backdrop-blur-sm overflow-hidden"
    >
      <div className="text-zinc-800 group-hover:text-zinc-600 transition-all duration-500 mb-4">
        {React.cloneElement(item.icon, { size: 20 })}
      </div>
      <h4 className="text-4xl md:text-5xl font-light text-white mb-2 tracking-tighter">
        {item.count}
      </h4>
      <p className="text-[8px] text-zinc-500 uppercase tracking-[0.3em] font-black mb-2">{item.label}</p>
      <p className="text-zinc-600 text-[11px] leading-tight font-light">{item.detail}</p>
    </motion.div>
  );
};

const SkillCard = ({ skill, index }) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="inline-block px-3 py-2 bg-zinc-950/80 border border-zinc-900 rounded-lg text-[10px] font-mono text-zinc-500 hover:text-white hover:border-zinc-700 transition-all cursor-default"
    >
      {skill}
    </motion.span>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const About = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-black text-white pt-40 pb-24 px-6 sm:px-12 lg:px-24 border-t border-zinc-900/50 scroll-mt-32 overflow-hidden"
    >
      <motion.div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: backgroundOpacity }}>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-zinc-900/30 rounded-full blur-[120px]" />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="space-y-12">
            <div className="space-y-6">
              <CinematicParagraph className="text-zinc-200 leading-snug text-xl md:text-2xl font-light tracking-tight">
                I'm a <span className="text-white font-semibold">Full-Stack Developer</span> with experience building web applications using <span className="text-white font-semibold">React.js, JavaScript, HTML, CSS</span>, alongside backend technologies such as <span className="text-white font-semibold">Node.js, REST APIs, and WordPress.</span>
              </CinematicParagraph>

              <div className="space-y-5 text-zinc-500 text-base leading-relaxed font-light">
                <CinematicParagraph delay={0.1}>
                  I specialize in creating <span className="text-zinc-400">clean, responsive, and user-friendly interfaces</span>, while also developing and integrating backend logic that supports scalable, real-world applications. I work with WordPress CMS, customizing themes, managing content, and extending functionality through plugins and API integrations.
                </CinematicParagraph>

                <CinematicParagraph delay={0.15}>
                  On the backend, I build and consume <span className="text-zinc-400">RESTful APIs</span>, handle data flow between frontend and server, and integrate third-party services such as analytics, forms, and authentication tools. I focus on <span className="text-zinc-400">performance, accessibility, and maintainability</span>, ensuring websites and applications are reliable and easy to manage.
                </CinematicParagraph>

                <CinematicParagraph delay={0.2}>
                  I collaborate closely with designers, marketers, and non-technical stakeholders to translate ideas into <span className="text-zinc-400">functional digital solutions</span>. I use industry-standard development tools to streamline workflow, debug efficiently, and maintain high code quality.
                </CinematicParagraph>

                <CinematicParagraph delay={0.25} className="text-zinc-600 italic border-l border-zinc-900 pl-4">
                  I continuously improve my skills across the full stack and am interested in opportunities involving WordPress development, API-driven applications, and Node.js-based systems.
                </CinematicParagraph>
              </div>
            </div>

            <CinematicSection className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-[1px] bg-zinc-800" />
                <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600">Key Metrics</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {achievements.map((item, i) => (
                  <AchievementCard key={i} item={item} index={i} />
                ))}
              </div>
            </CinematicSection>
          </div>

          <CinematicSection 
            className="relative bg-zinc-950/50 border border-zinc-900 p-8 md:p-10 rounded-3xl backdrop-blur-xl lg:sticky lg:top-32 overflow-hidden"
          >
            <div className="relative">
              <div className="mb-10">
                <h3 className="text-[8px] font-black mb-4 uppercase tracking-[0.5em] text-zinc-600 flex items-center gap-4">
                  <span className="w-12 h-[1px] bg-zinc-800" /> Tech Stack & Tools
                </h3>
                <p className="text-xs text-zinc-600">Technologies and frameworks I work with to build modern web experiences.</p>
              </div>

              <div className="space-y-8">
                {SKILL_CATEGORIES.map((category, idx) => (
                  <motion.div key={idx} className="space-y-4" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, duration: 0.6 }}>
                    <div className="flex items-center gap-3">
                      {React.cloneElement(category.icon, { size: 16 })}
                      <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.25em]">{category.title}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, skillIdx) => (
                        <SkillCard key={skill} skill={skill} index={skillIdx} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div className="mt-12 pt-6 border-t border-zinc-900" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <div className="flex-1">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-600 font-black mb-0.5">Availability</p>
                    <p className="text-xs text-zinc-300 font-medium">Open to Full-time, Contract & Remote</p>
                  </div>
                </div>
              </motion.div>

              <motion.a href="#contact" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-5 w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-zinc-200 transition-all">
                <span>Let's Connect</span>
                <FiCode size={14} />
              </motion.a>
            </div>
          </CinematicSection>
        </div>
      </div>
    </section>
  );
};

export default About;
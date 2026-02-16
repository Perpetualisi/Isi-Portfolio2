import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiArrowUpRight, FiSend, FiLoader, FiCheck, FiAlertCircle } from "react-icons/fi";

// ============================================================================
// ENHANCED CONTACT COMPONENT WITH CINEMATIC EFFECTS
// ============================================================================

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const formRef = useRef(null);
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  const isFormInView = useInView(formRef, { once: true });

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    formData.append("access_key", "f03b99d4-599d-460a-998d-62046420b9ba");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const res = await response.json();
      if (res.success) {
        setSubmitStatus("success");
        e.target.reset();
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const contactInfo = [
    { 
      icon: <FiMail />, 
      label: "Email", 
      value: "Perpetualokan0@gmail.com", 
      href: "mailto:Perpetualokan0@gmail.com",
      description: "Drop me a line"
    },
    { 
      icon: <FiPhone />, 
      label: "Phone", 
      value: "+234-810-355-837", 
      href: "tel:+234810355837",
      description: "Let's talk"
    },
    { 
      icon: <FiMapPin />, 
      label: "Location", 
      value: "Lagos, Nigeria", 
      href: "#",
      description: "Where I'm based"
    },
  ];

  return (
    <section 
      id="contact" 
      className="relative bg-black text-white pt-48 pb-40 px-6 md:px-12 lg:px-24 border-t border-zinc-900/50 scroll-mt-20 overflow-hidden"
    >
      {/* ENHANCED AMBIENT BACKGROUND EFFECTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orb */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-zinc-900/40 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "8s" }} />
        {/* Secondary gradient orb */}
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-zinc-800/30 rounded-full blur-[120px]" />
        {/* Accent orb */}
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-zinc-700/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        
        {/* Grid overlay for depth */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "50px 50px"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ENHANCED HEADER */}
        <header ref={headerRef} className="mb-32 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Eyebrow with animated line */}
            <div className="mb-8 flex items-center gap-4">
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={isHeaderInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-[1px] w-16 bg-zinc-800 origin-left"
              />
              <span className="text-[9px] uppercase tracking-[0.5em] font-black text-zinc-600">
                Get In Touch
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-pulse" />
            </div>

            {/* Main title with gradient */}
            <div className="relative">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
                LET'S START A
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 via-zinc-400 to-zinc-600 italic font-light">
                  conversation
                </span>
              </h2>

              {/* Decorative background text */}
              <div className="absolute -top-8 -left-6 text-[180px] font-black text-zinc-950/50 opacity-30 select-none leading-none pointer-events-none hidden lg:block">
                TALK
              </div>
            </div>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={isHeaderInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-zinc-500 text-base md:text-lg max-w-2xl leading-relaxed"
            >
              Have a project in mind or just want to discuss technology? 
              My inbox is always open for collaboration and interesting conversations.
            </motion.p>

            {/* Bottom accent line */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={isHeaderInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, delay: 0.7 }}
              className="absolute -bottom-16 left-0 right-0 h-[1px] bg-gradient-to-r from-zinc-800 via-zinc-700 to-transparent origin-left"
            />
          </motion.div>
        </header>

        {/* MAIN CONTENT GRID */}
        <div className="grid lg:grid-cols-5 gap-20 lg:gap-24 items-start">
          
          {/* LEFT SIDE - CONTACT INFO (2 columns) */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* Quick intro */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isHeaderInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold tracking-tight text-zinc-300">
                Ready to bring your ideas to life?
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Whether it's a complex web application, an interactive experience, 
                or a creative digital project — let's make it happen together.
              </p>
            </motion.div>

            {/* Contact cards */}
            <div className="space-y-4">
              {contactInfo.map((info, idx) => (
                <motion.a
                  key={idx}
                  href={info.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isHeaderInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                  transition={{ duration: 0.6, delay: 0.9 + idx * 0.1 }}
                  className="group relative block p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all duration-500 backdrop-blur-sm overflow-hidden"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 blur-2xl rounded-full" />
                  </div>

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      {/* Icon */}
                      <div className="text-zinc-700 group-hover:text-zinc-400 transition-all duration-500 p-3 bg-zinc-800/50 rounded-xl group-hover:scale-110 group-hover:rotate-3">
                        {React.cloneElement(info.icon, { size: 20, strokeWidth: 2 })}
                      </div>
                      
                      {/* Text content */}
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1.5">
                          {info.label}
                        </p>
                        <p className="text-sm text-zinc-300 group-hover:text-white transition-colors duration-300 font-medium mb-1">
                          {info.value}
                        </p>
                        <p className="text-[10px] text-zinc-700 group-hover:text-zinc-600 transition-colors duration-300">
                          {info.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Arrow icon */}
                    <FiArrowUpRight 
                      className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500 text-zinc-500" 
                      size={20}
                    />
                  </div>

                  {/* Bottom accent line */}
                  <motion.div 
                    className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-zinc-600 to-transparent transition-all duration-700"
                  />
                </motion.a>
              ))}
            </div>

            {/* Additional info badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isHeaderInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="flex items-center gap-3 text-zinc-700 text-xs pt-8 border-t border-zinc-900"
            >
              <div className="flex -space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-green-600/40" />
              </div>
              <span className="font-mono uppercase tracking-wider">Available for projects</span>
            </motion.div>
          </div>

          {/* RIGHT SIDE - CONTACT FORM (3 columns) */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: 40 }}
            animate={isFormInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3 relative"
          >
            {/* Form container with glass effect */}
            <div className="relative p-10 md:p-12 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl backdrop-blur-xl overflow-hidden">
              
              {/* Top corner accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl" />

              {/* Form header */}
              <div className="mb-12 relative z-10">
                <h3 className="text-2xl font-bold tracking-tight mb-3">
                  Send a Message
                </h3>
                <p className="text-sm text-zinc-600">
                  Fill out the form below and I'll get back to you within 24 hours.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-8 relative z-10">
                
                {/* Name & Email row */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Name field */}
                  <div className="group space-y-3">
                    <label 
                      className={`text-[9px] font-black uppercase tracking-[0.3em] transition-colors duration-300 ${
                        focusedField === 'name' ? 'text-white' : 'text-zinc-600'
                      }`}
                    >
                      Full Name *
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        disabled={isSubmitting}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-transparent border-b-2 border-zinc-800 text-white py-3 focus:outline-none focus:border-zinc-500 disabled:opacity-50 transition-all duration-300 placeholder:text-zinc-800" 
                        placeholder="John Doe" 
                      />
                      <motion.div 
                        className="absolute bottom-0 left-0 h-[2px] bg-white"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: focusedField === 'name' ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ originX: 0 }}
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="group space-y-3">
                    <label 
                      className={`text-[9px] font-black uppercase tracking-[0.3em] transition-colors duration-300 ${
                        focusedField === 'email' ? 'text-white' : 'text-zinc-600'
                      }`}
                    >
                      Email Address *
                    </label>
                    <div className="relative">
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        disabled={isSubmitting}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-transparent border-b-2 border-zinc-800 text-white py-3 focus:outline-none focus:border-zinc-500 disabled:opacity-50 transition-all duration-300 placeholder:text-zinc-800" 
                        placeholder="john@example.com" 
                      />
                      <motion.div 
                        className="absolute bottom-0 left-0 h-[2px] bg-white"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: focusedField === 'email' ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ originX: 0 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Message field */}
                <div className="group space-y-3">
                  <label 
                    className={`text-[9px] font-black uppercase tracking-[0.3em] transition-colors duration-300 ${
                      focusedField === 'message' ? 'text-white' : 'text-zinc-600'
                    }`}
                  >
                    Your Message *
                  </label>
                  <div className="relative">
                    <textarea 
                      name="message" 
                      rows="5" 
                      required 
                      disabled={isSubmitting}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-transparent border-b-2 border-zinc-800 text-white py-3 focus:outline-none focus:border-zinc-500 resize-none disabled:opacity-50 transition-all duration-300 placeholder:text-zinc-800" 
                      placeholder="Tell me about your project or idea..." 
                    />
                    <motion.div 
                      className="absolute bottom-0 left-0 h-[2px] bg-white"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: focusedField === 'message' ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ originX: 0 }}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-between pt-6">
                  <motion.button 
                    type="submit" 
                    disabled={isSubmitting || submitStatus === 'success'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative inline-flex items-center gap-4 px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.3em] rounded-full hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    {/* Button background animation */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-zinc-300 to-white"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    
                    <span className="relative z-10 flex items-center gap-3">
                      {isSubmitting ? (
                        <>
                          <FiLoader className="animate-spin" size={16} />
                          Sending
                        </>
                      ) : submitStatus === 'success' ? (
                        <>
                          <FiCheck size={16} />
                          Sent
                        </>
                      ) : (
                        <>
                          <FiSend size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                          Send Message
                        </>
                      )}
                    </span>
                  </motion.button>

                  {/* Character count or helper text */}
                  <span className="text-[10px] text-zinc-700 font-mono uppercase tracking-wider">
                    Response within 24h
                  </span>
                </div>

                {/* Status messages */}
                <AnimatePresence mode="wait">
                  {submitStatus && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center gap-3 p-4 rounded-xl border ${
                        submitStatus === "success" 
                          ? "bg-green-950/30 border-green-800/50 text-green-400" 
                          : "bg-red-950/30 border-red-800/50 text-red-400"
                      }`}
                    >
                      {submitStatus === "success" ? (
                        <>
                          <FiCheck size={18} />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider">Message Delivered</p>
                            <p className="text-[10px] text-zinc-500 mt-1">I'll get back to you soon!</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <FiAlertCircle size={18} />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider">Sending Failed</p>
                            <p className="text-[10px] text-zinc-500 mt-1">Please try again or email directly.</p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Form shadow effect */}
            <div className="absolute inset-0 -z-10 bg-zinc-900/50 blur-3xl scale-95 opacity-50 rounded-3xl" />
          </motion.div>
        </div>

        {/* BOTTOM FOOTER */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={isFormInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-32 pt-12 border-t border-zinc-900/50 text-center"
        >
          <p className="text-xs text-zinc-700 font-mono uppercase tracking-wider">
            © 2024 — Built with passion & precision
          </p>
        </motion.footer>
      </div>
    </section>
  );
};

export default Contact;
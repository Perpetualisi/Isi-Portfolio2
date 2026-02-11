import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiArrowUpRight, FiCode, FiLoader } from "react-icons/fi";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

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
    { icon: <FiMail />, label: "Email", value: "Perpetualokan0@gmail.com", href: "mailto:Perpetualokan0@gmail.com" },
    { icon: <FiPhone />, label: "Phone", value: "+234-810-355-837", href: "tel:+234810355837" },
    { icon: <FiMapPin />, label: "Location", value: "Lagos, Nigeria", href: "#" },
  ];

  return (
    <section 
      id="contact" 
      /* Added scroll-mt-20 and increased pt-48 for layout consistency */
      className="bg-black text-white pt-48 pb-32 px-6 md:px-12 lg:px-24 border-t border-zinc-900 relative scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <header className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge-style heading */}
            <div className="mb-8 flex items-center gap-3">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
                <FiCode className="text-zinc-500 text-sm" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">
                  Contact
                </span>
              </div>
            </div>

            {/* Subtitle */}
            <h1 className="text-4xl md:text-6xl font-light tracking-tight max-w-2xl leading-[1.1]">
              Let's start a <span className="text-zinc-500 italic">conversation.</span>
            </h1>
          </motion.div>
        </header>

        <div className="grid lg:grid-cols-2 gap-20 items-start">

          {/* Info Side */}
          <div className="space-y-12">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-xl text-zinc-400 font-light max-w-md leading-relaxed"
            >
              Have a project in mind or just want to chat about tech? My inbox is open.
            </motion.p>

            <div className="space-y-px bg-zinc-900 border border-zinc-900 overflow-hidden rounded-sm">
              {contactInfo.map((info, idx) => (
                <motion.a
                  key={idx}
                  href={info.href}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group flex items-center justify-between p-8 bg-black hover:bg-zinc-950 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-zinc-600 group-hover:text-white transition-colors duration-300">
                      {React.cloneElement(info.icon, { size: 20 })}
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600 mb-1">{info.label}</p>
                      <p className="text-lg text-zinc-300 group-hover:text-white font-light transition-colors duration-300">{info.value}</p>
                    </div>
                  </div>
                  <FiArrowUpRight className="text-zinc-800 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#050505] border border-zinc-900 p-8 md:p-14 rounded-sm shadow-2xl"
          >
            <form onSubmit={onSubmit} className="space-y-10">

              <div className="grid md:grid-cols-2 gap-10">
                <div className="group space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 group-focus-within:text-zinc-400 transition-colors">Name</label>
                  <input type="text" name="name" required disabled={isSubmitting} 
                    className="w-full bg-transparent border-b border-zinc-800 text-white py-3 focus:outline-none focus:border-white disabled:opacity-50 font-light transition-all" />
                </div>

                <div className="group space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 group-focus-within:text-zinc-400 transition-colors">Email</label>
                  <input type="email" name="email" required disabled={isSubmitting} 
                    className="w-full bg-transparent border-b border-zinc-800 text-white py-3 focus:outline-none focus:border-white disabled:opacity-50 font-light transition-all" />
                </div>
              </div>

              <div className="group space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 group-focus-within:text-zinc-400 transition-colors">Message</label>
                <textarea name="message" rows="4" required disabled={isSubmitting} 
                  className="w-full bg-transparent border-b border-zinc-800 text-white py-3 focus:outline-none focus:border-white resize-none disabled:opacity-50 font-light transition-all" />
              </div>

              <button type="submit" disabled={isSubmitting} 
                className="w-full py-5 bg-white text-black font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                {isSubmitting ? <FiLoader className="animate-spin text-lg" /> : <>Send Message <FiArrowUpRight className="text-lg transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></>}
              </button>

              <AnimatePresence>
                {submitStatus && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`text-[10px] uppercase tracking-[0.2em] font-bold text-center mt-4 ${submitStatus === "success" ? "text-green-500" : "text-red-500"}`}>
                    {submitStatus === "success" ? "/// Transmission Received" : "/// Connection Error"}
                  </motion.div>
                )}
              </AnimatePresence>

            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
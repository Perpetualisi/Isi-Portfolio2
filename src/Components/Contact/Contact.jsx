import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiArrowUpRight, FiCode, FiLoader } from "react-icons/fi";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

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
    { icon: <FiMail />, label: "Email", value: "Perpetualokan0@gmail.com", href: "mailto:Perpetualokan0@gmail.com" },
    { icon: <FiPhone />, label: "Phone", value: "+234-810-355-837", href: "tel:+234810355837" },
    { icon: <FiMapPin />, label: "Location", value: "Lagos, Nigeria", href: "#" },
  ];

  return (
    <section 
      id="contact" 
      className="bg-black text-white pt-40 pb-32 px-6 md:px-12 lg:px-24 border-t border-zinc-900 relative scroll-mt-20 overflow-hidden"
    >
      {/* Cinematic: Fine ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-800/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-[0.6em] font-black text-zinc-500">Connect</span>
              <div className="h-[1px] w-12 bg-zinc-800" />
            </div>

            {/* Reduced size: 4xl to 5xl instead of 8xl */}
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight">
              Let's start a <br />
              <span className="text-zinc-700 italic">conversation.</span>
            </h2>
          </motion.div>
        </header>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Info Side */}
          <div className="space-y-12">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-lg text-zinc-500 font-light max-w-sm leading-relaxed"
            >
              Have a project in mind or just want to chat about tech? My inbox is open.
            </motion.p>

            <div className="divide-y divide-zinc-900 border-t border-b border-zinc-900">
              {contactInfo.map((info, idx) => (
                <motion.a
                  key={idx}
                  href={info.href}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group flex items-center justify-between py-8 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-zinc-800 group-hover:text-white transition-colors duration-500">
                      {React.cloneElement(info.icon, { size: 18 })}
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">{info.label}</p>
                      <p className="text-base text-zinc-400 group-hover:text-white transition-colors duration-300 font-medium">{info.value}</p>
                    </div>
                  </div>
                  <FiArrowUpRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500 text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Form Side: Minimal & Precise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <form onSubmit={onSubmit} className="space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="group space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-focus-within:text-white transition-colors">Name</label>
                  <input type="text" name="name" required disabled={isSubmitting} 
                    className="w-full bg-transparent border-b border-zinc-800 text-white py-2 focus:outline-none focus:border-white disabled:opacity-50 transition-all placeholder:text-zinc-900" placeholder="Required" />
                </div>

                <div className="group space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-focus-within:text-white transition-colors">Email</label>
                  <input type="email" name="email" required disabled={isSubmitting} 
                    className="w-full bg-transparent border-b border-zinc-800 text-white py-2 focus:outline-none focus:border-white disabled:opacity-50 transition-all placeholder:text-zinc-900" placeholder="Required" />
                </div>
              </div>

              <div className="group space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-focus-within:text-white transition-colors">Message</label>
                <textarea name="message" rows="3" required disabled={isSubmitting} 
                  className="w-full bg-transparent border-b border-zinc-800 text-white py-2 focus:outline-none focus:border-white resize-none disabled:opacity-50 transition-all placeholder:text-zinc-900" placeholder="Describe the project..." />
              </div>

              <button type="submit" disabled={isSubmitting} 
                className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white hover:text-zinc-400 transition-all disabled:opacity-50">
                {isSubmitting ? <FiLoader className="animate-spin" /> : "Initiate Transmission"} 
                <FiArrowUpRight className="text-sm" />
              </button>

              <AnimatePresence>
                {submitStatus && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className={`text-[9px] uppercase tracking-[0.3em] font-black mt-4 ${submitStatus === "success" ? "text-white" : "text-red-800"}`}>
                    {submitStatus === "success" ? "// Data Received Successfully" : "// System Link Failure"}
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
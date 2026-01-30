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
    <section id="contact" className="bg-black text-white py-24 px-6 md:px-12 lg:px-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">

        {/* Heading */}
        <header className="mb-16">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            
            {/* Badge-style heading */}
            <div className="mb-6 flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm"
              >
                <FiCode className="text-zinc-500 text-sm" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">
                  Contact
                </span>
              </motion.div>
            </div>

            {/* Subtitle */}
            <h1 className="text-3xl md:text-5xl font-light tracking-tight">
              Let's start a <span className="text-zinc-500 italic">conversation.</span>
            </h1>
          </motion.div>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Info */}
          <div className="space-y-12">
            <p className="text-lg text-zinc-400 font-light max-w-md">
              Have a project in mind or just want to chat about tech? My inbox is open.
            </p>

            <div className="space-y-2 bg-zinc-900 border border-zinc-900">
              {contactInfo.map((info, idx) => (
                <a
                  key={idx}
                  href={info.href}
                  className="group flex items-center justify-between p-6 bg-black hover:bg-zinc-950 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-zinc-600 group-hover:text-white transition">{info.icon}</div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wide text-zinc-600">{info.label}</p>
                      <p className="text-base text-zinc-300 group-hover:text-white font-light">{info.value}</p>
                    </div>
                  </div>
                  <FiArrowUpRight className="text-zinc-800 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900 border border-zinc-900 p-8 md:p-12 rounded-sm shadow-[0_0_50px_rgba(255,255,255,0.02)]"
          >
            <form onSubmit={onSubmit} className="space-y-6">

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600">Name</label>
                  <input type="text" name="name" required disabled={isSubmitting} 
                    className="w-full bg-transparent border-b border-zinc-800 text-white py-2 focus:outline-none focus:border-white disabled:opacity-50 font-light" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600">Email</label>
                  <input type="email" name="email" required disabled={isSubmitting} 
                    className="w-full bg-transparent border-b border-zinc-800 text-white py-2 focus:outline-none focus:border-white disabled:opacity-50 font-light" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600">Message</label>
                <textarea name="message" rows="4" required disabled={isSubmitting} 
                  className="w-full bg-transparent border-b border-zinc-800 text-white py-2 focus:outline-none focus:border-white resize-none disabled:opacity-50 font-light" />
              </div>

              <button type="submit" disabled={isSubmitting} 
                className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition flex items-center justify-center gap-2 group">
                {isSubmitting ? <FiLoader className="animate-spin text-lg" /> : <>Send Message <FiArrowUpRight className="text-lg transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></>}
              </button>

              <AnimatePresence>
                {submitStatus && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className={`text-[10px] uppercase tracking-wide text-center mt-2 ${submitStatus === "success" ? "text-green-500" : "text-red-500"}`}>
                    {submitStatus === "success" ? "// Message Sent" : "// Something went wrong"}
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

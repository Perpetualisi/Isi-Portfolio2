import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiGithub, FiLinkedin, FiTwitter, FiArrowUp, FiMail, FiArrowRight } from "react-icons/fi";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setStatus("error");
      return;
    }

    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus(null), 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    { icon: <FiGithub size={16} />, href: "https://github.com/Perpetualisi/", label: "GitHub" },
    { icon: <FiLinkedin size={16} />, href: "https://linkedin.com/in/yourusername", label: "LinkedIn" },
    { icon: <FiTwitter size={16} />, href: "https://twitter.com/yourusername", label: "Twitter" },
  ];

  return (
    <footer className="bg-black text-zinc-500 px-6 py-24 md:px-12 lg:px-24 border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-24">

          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-8">
            <Link to="/" className="text-xl font-black tracking-tighter text-white uppercase italic">
              Okan_P.
            </Link>
            <p className="text-[11px] leading-relaxed uppercase tracking-[0.2em] text-zinc-600 max-w-sm">
              Full-stack developer building fast, user-friendly websites. <br /> Based in Lagos, Nigeria.
            </p>
            <div className="flex gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-700 hover:text-white transition-all duration-500 transform hover:-translate-y-1"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-8">
            <h3 className="text-white font-black uppercase text-[10px] tracking-[0.5em]">Navigation</h3>
            <ul className="space-y-4 text-[10px] uppercase font-black tracking-widest">
              <li><Link to="/about" className="hover:text-white transition-colors duration-300">About_Me</Link></li>
              <li><Link to="/portfolio" className="hover:text-white transition-colors duration-300">Selected_Works</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors duration-300">Get_In_Touch</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-white font-black uppercase text-[10px] tracking-[0.5em]">Newsletter</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Get updates on my projects and tips.</p>

            <form onSubmit={handleSubscribe} className="group relative">
              <div className="flex items-center border-b border-zinc-900 group-focus-within:border-white pb-3 transition-all duration-700">
                <FiMail className="text-zinc-800 mr-4 transition-colors group-focus-within:text-white" />
                <input
                  type="email"
                  placeholder="IDENTITY@DOMAIN.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent flex-1 text-white focus:outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-zinc-900"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 text-zinc-800 hover:text-white font-black text-[10px] uppercase tracking-tighter transition-all duration-300"
                >
                  Send <FiArrowRight />
                </button>
              </div>

              <AnimatePresence>
                {status && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute -bottom-8 left-0 text-[9px] font-black uppercase tracking-widest ${status === 'error' ? 'text-red-900' : 'text-white italic'}`}
                  >
                    {status === "error" ? "// Invalid Entry" : "// Transmission Registered"}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Final Bottom Bar */}
        <div className="pt-12 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[9px] text-zinc-800 font-black uppercase tracking-[0.6em]">
              © {new Date().getFullYear()} OKAN PERPETUAL. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-4">
               <span className="h-[1px] w-8 bg-zinc-900" />
               <p className="text-[8px] text-zinc-900 font-black tracking-widest">LOC_NG [6.5244° N, 3.3792° E]</p>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 hover:text-white transition-all duration-500"
          >
            Back_To_Top <FiArrowUp className="transform group-hover:-translate-y-2 transition-transform duration-500" />
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
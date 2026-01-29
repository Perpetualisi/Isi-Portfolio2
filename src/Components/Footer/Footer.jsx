import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiGithub, FiLinkedin, FiTwitter, FiArrowUp, FiMail, FiArrowRight } from "react-icons/fi";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  // Handles newsletter subscription
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

  // Scroll page to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Social media links
  const socialLinks = [
    { icon: <FiGithub />, href: "https://github.com/Perpetualisi/", label: "GitHub" },
    { icon: <FiLinkedin />, href: "https://linkedin.com/in/yourusername", label: "LinkedIn" },
    { icon: <FiTwitter />, href: "https://twitter.com/yourusername", label: "Twitter" },
  ];

  return (
    <footer className="bg-black text-zinc-400 px-6 py-16 md:px-12 lg:px-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="text-2xl font-bold text-white">
              <span className="text-zinc-600"></span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400 max-w-sm">
              Full-stack developer building fast, user-friendly websites. Based in Lagos, Nigeria.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-white font-bold uppercase text-xs tracking-wider">Links</h3>
            <ul className="space-y-2 text-xs uppercase font-medium">
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/portfolio" className="hover:text-white"> Portfolio</Link></li>
              <li><Link to="/contact" className="hover:text-white"> Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-white font-bold uppercase text-xs tracking-wider">Newsletter</h3>
            <p className="text-xs uppercase tracking-wide">Get updates on my projects and tips.</p>

            <form onSubmit={handleSubscribe} className="relative">
              <div className="flex items-center border-b border-zinc-800 focus-within:border-white pb-2">
                <FiMail className="text-zinc-600 mr-3" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent flex-1 text-white focus:outline-none text-xs placeholder:text-zinc-700"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 text-white hover:text-zinc-400 font-bold text-xs uppercase"
                >
                  Submit <FiArrowRight />
                </button>
              </div>

              <AnimatePresence>
                {status && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`absolute -bottom-6 left-0 text-[9px] ${status === 'error' ? 'text-red-500' : 'text-zinc-400'}`}
                  >
                    {status === "error" ? "Invalid email" : "Subscription active!"}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1 text-[9px] text-zinc-600 uppercase tracking-wider">
            <p>© {new Date().getFullYear()} OKAN PERPETUAL. ALL RIGHTS RESERVED.</p>
            <p className="text-[8px] text-zinc-800"> NG</p>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition"
          >
            Top <FiArrowUp className="transition-transform group-hover:-translate-y-1" />
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

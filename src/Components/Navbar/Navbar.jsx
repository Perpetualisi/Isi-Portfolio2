import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FiMenu, FiX, FiGithub, FiLinkedin } from "react-icons/fi";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Portfolio", href: "/portfolio" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    // Prevent scrolling when mobile menu is open
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-black/90 backdrop-blur-xl py-4 border-b border-white/5" 
          : "bg-transparent py-8 border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="relative z-[70] transition-transform active:scale-95">
          <img 
            src="/logo-okan.png" 
            alt="Perpetual Okan"
            className="w-9 h-9 md:w-11 md:h-11 object-contain"
          />
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-12">
          <LayoutGroup>
            <ul className="flex items-center gap-10">
              {NAV_LINKS.map(({ name, href }) => {
                const isActive = pathname === href;
                return (
                  <li key={href} className="relative">
                    <Link
                      to={href}
                      className={`text-[11px] uppercase tracking-[0.35em] font-black transition-colors duration-300 ${
                        isActive ? "text-white" : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      {name}
                    </Link>
                    {isActive && (
                      <motion.span 
                        layoutId="nav-dot"
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_10px_#f97316]" 
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>

          <div className="flex items-center gap-6 border-l border-zinc-800 pl-12">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
              <FiGithub size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
              <FiLinkedin size={18} />
            </a>
            <Link
              to="/contact"
              className="px-8 py-3 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all duration-300 rounded-full active:scale-95 shadow-lg"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative z-[70] flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-xl active:scale-90 transition-transform"
        >
          {isOpen ? (
            <FiX size={24} className="text-black stroke-[3px]" />
          ) : (
            <FiMenu size={24} className="text-black stroke-[3px]" />
          )}
        </button>
      </nav>

      {/* MOBILE OVERLAY */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 h-screen w-full bg-black z-[60] flex flex-col justify-center px-10"
          >
            {/* Background Grid for Mobile Menu */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
            
            <div className="relative z-10 space-y-12">
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-orange-500 font-black text-[10px] uppercase tracking-[0.6em] border-l-2 border-orange-500 pl-4"
              >
                Menu Selection
              </motion.p>
              
              <div className="space-y-6">
                {[...NAV_LINKS, { name: "Contact", href: "/contact" }].map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-5xl xs:text-6xl font-black tracking-tighter block uppercase transition-all ${
                        pathname === item.href ? "text-white" : "text-zinc-900 stroke-text"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .stroke-text {
          -webkit-text-stroke: 1px #222;
          -webkit-text-fill-color: transparent;
        }
        :global(.stroke-[3px] path) {
          stroke-width: 3px;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
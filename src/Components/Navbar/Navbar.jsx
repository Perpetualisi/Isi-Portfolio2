import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FiMenu, FiX, FiArrowRight } from "react-icons/fi";

// Data moved outside to prevent re-renders and keep component clean
const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Portfolio", href: "/portfolio" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();

  // Optimized scroll handler with useCallback
  const handleScroll = useCallback(() => {
    const offset = window.scrollY;
    setIsScrolled(offset > 50);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  return (
    <header 
      role="banner"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-black/80 backdrop-blur-xl py-4 border-b border-white/5" 
          : "bg-transparent py-8"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center" aria-label="Main Navigation">
        
        {/* LOGO: Clean, semantic, and performant */}
        <Link to="/" className="relative z-[70] transition-transform hover:scale-105 active:scale-95">
          <img 
            src="/logo-okan.png" 
            alt="Perpetual Okan Logo"
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
            loading="eager"
          />
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-12">
          <LayoutGroup>
            <ul className="flex items-center gap-10">
              {NAV_LINKS.map(({ name, href }) => {
                const isActive = pathname === href;
                return (
                  <li key={href} className="relative group">
                    <Link
                      to={href}
                      className={`text-[11px] uppercase tracking-[0.3em] font-semibold transition-colors ${
                        isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      {name}
                    </Link>
                    {isActive && (
                      <motion.span 
                        layoutId="nav-underline"
                        className="absolute -bottom-2 left-0 w-full h-[1px] bg-indigo-500" // Use your accent color here
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>

          <Link
            to="/contact"
            className="group overflow-hidden relative px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
          >
            <span className="relative z-10 flex items-center gap-2">
              Let's Talk <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle Menu"
          className="md:hidden relative z-[70] p-3 bg-white text-black transition-transform active:scale-90"
        >
          {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </nav>

      {/* MOBILE OVERLAY */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 h-screen w-full bg-zinc-950 z-[60] flex flex-col justify-center px-10"
          >
            <div className="space-y-8">
              <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[1em] border-b border-zinc-900 pb-4">Navigation</p>
              {[...NAV_LINKS, { name: "Contact", href: "/contact" }].map((item, idx) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-6xl font-light tracking-tighter block ${
                      pathname === item.href ? "text-indigo-500" : "text-zinc-200"
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
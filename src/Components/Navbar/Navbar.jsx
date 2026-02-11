import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FiMenu, FiX, FiArrowRight } from "react-icons/fi";

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
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  return (
    <header 
      role="banner"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? "bg-black/90 backdrop-blur-md py-3 border-white/10 shadow-xl" 
          : "bg-transparent py-6 border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="relative z-[70] transition-transform hover:scale-105">
          <img 
            src="/logo-okan.png" 
            alt="Perpetual Okan Logo"
            className="w-9 h-9 md:w-10 md:h-10 object-contain"
          />
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-10">
          <LayoutGroup>
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map(({ name, href }) => {
                const isActive = pathname === href;
                return (
                  <li key={href} className="relative">
                    <Link
                      to={href}
                      className={`text-[10px] uppercase tracking-[0.25em] font-bold transition-colors ${
                        isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      {name}
                    </Link>
                    {isActive && (
                      <motion.span 
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 w-full h-[1px] bg-white" 
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>

          <Link
            to="/contact"
            className="px-6 py-2.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
          >
            Let's Talk
          </Link>
        </div>

        {/* MOBILE TOGGLE: Restored Black Icon on White Background */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative z-[70] p-3 bg-white text-black rounded-sm shadow-xl transition-transform active:scale-90"
        >
          {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </nav>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
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
                    className={`text-5xl font-light tracking-tighter block ${
                      pathname === item.href ? "text-white" : "text-zinc-500"
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
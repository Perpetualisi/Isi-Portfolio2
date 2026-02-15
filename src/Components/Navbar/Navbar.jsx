import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

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
        <Link to="/" className="relative z-[70] transition-opacity hover:opacity-70">
          <img 
            src="/logo-okan.png" 
            alt="Perpetual Okan"
            className="w-9 h-9 md:w-11 md:h-11 object-contain"
          />
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-16">
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
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" 
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>

          <Link
            to="/contact"
            className="px-10 py-3.5 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all duration-300 rounded-full"
          >
            Contact
          </Link>
        </div>

        {/* MOBILE TOGGLE: Enhanced Heavy Black Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative z-[70] flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.4)] active:scale-90 transition-transform"
        >
          {isOpen ? (
            <FiX size={26} className="text-black stroke-[3px]" />
          ) : (
            <FiMenu size={26} className="text-black stroke-[3px]" />
          )}
        </button>
      </nav>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 h-screen w-full bg-black z-[60] flex flex-col justify-center px-12"
          >
            <div className="space-y-12">
              <p className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.6em] border-l-2 border-white pl-4">Menu Selection</p>
              
              <div className="space-y-8">
                {[...NAV_LINKS, { name: "Contact", href: "/contact" }].map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-6xl font-black tracking-tightest block uppercase transition-all ${
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
        /* This makes the icon lines thicker */
        :global(.stroke-[3px] path) {
          stroke-width: 3px;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
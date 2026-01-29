import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiArrowRight, FiTerminal } from "react-icons/fi";

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Portfolio", href: "/portfolio" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
        scrolled 
          ? "bg-black/90 backdrop-blur-md py-4 border-b border-zinc-900" 
          : "bg-transparent py-8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-12 flex justify-between items-center">
        
        {/* PURE IMAGE LOGO */}
        <Link to="/" className="relative z-[70] block">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 md:w-12 md:h-12 overflow-hidden"
          >
            <img 
              src="/logo-okan.png" 
              alt="Perpetual Okan"
              className="w-full h-full object-contain brightness-[1.1] contrast-[1.1]"
              loading="eager"
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-16">
          <ul className="flex items-center gap-12">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name} className="relative">
                  <Link
                    to={item.href}
                    className={`text-[10px] uppercase tracking-[0.4em] font-medium transition-all duration-500 ${
                      isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {item.name}
                  </Link>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-line"
                      className="absolute -bottom-1 left-0 w-full h-[1px] bg-white"
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          <Link
            to="/contact"
            className="group flex items-center gap-3 px-6 py-2.5 border border-zinc-800 bg-zinc-900/40 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-500"
          >
            Contact
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </nav>

        {/* MOBILE TOGGLE: High Visibility White/Black contrast */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative z-[70] flex items-center justify-center w-12 h-12 bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-90 transition-all"
        >
          {isOpen ? <FiX size={24} strokeWidth={3} /> : <FiMenu size={24} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 h-screen w-full bg-black z-[60] flex flex-col p-12 justify-center"
          >
            <div className="flex flex-col gap-8">
              <p className="text-zinc-800 font-mono text-[10px] uppercase tracking-[0.8em] mb-4">Indices</p>
              {[...NAV_ITEMS, { name: "Contact", href: "/contact" }].map((item, idx) => {
                const isActive = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-5xl font-extralight tracking-tighter block transition-all duration-500 ${
                        isActive ? "text-white italic translate-x-4" : "text-zinc-800 hover:text-zinc-500"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end border-t border-zinc-900 pt-8">
               <FiTerminal className="text-zinc-800 text-xl" />
               <p className="text-[9px] text-zinc-800 uppercase tracking-widest italic">P. Okan • 2026</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
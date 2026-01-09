import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const navItems = [
  { name: "home", href: "/" },
  { name: "about", href: "/about" },
  { name: "portfolio", href: "/portfolio" },
  { name: "contact", href: "/contact" },
];

const Navbar = () => {
  const [active, setActive] = useState("home");
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = (name) => {
    setActive(name);
    setIsOpen(false); // Close mobile menu
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" onClick={() => handleLinkClick("home")}>
          <img src="/logo-okan.png" alt="Logo" className="h-10 md:h-14" />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => handleLinkClick(item.name)}
              className={`relative font-medium text-gray-100 hover:text-gray-300 transition-colors duration-300 ${
                active === item.name ? "text-indigo-400" : ""
              }`}
            >
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              <span
                className={`absolute left-0 -bottom-1 h-[2px] bg-indigo-400 transition-all duration-300 ${
                  active === item.name ? "w-full" : "w-0"
                }`}
              />
            </Link>
          ))}

          <Link
            to="/contact"
            className="ml-4 px-4 py-2 rounded-full bg-gray-800 text-gray-100 font-semibold shadow hover:bg-gray-700 hover:scale-105 transform transition"
          >
            Let’s Connect
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded bg-black text-gray-100 focus:outline-none z-50"
            aria-label="Toggle Menu"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-70"
          onClick={() => setIsOpen(false)}
        />
        <div className="relative bg-black w-full h-full flex flex-col items-center justify-center space-y-8 p-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => handleLinkClick(item.name)}
              className={`text-2xl font-medium text-gray-100 capitalize hover:text-gray-300 transition-colors duration-300 ${
                active === item.name ? "text-indigo-400" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}

          <Link
            to="/contact"
            onClick={() => handleLinkClick("contact")}
            className="mt-4 px-5 py-2 rounded-full bg-gray-800 text-gray-100 font-semibold shadow hover:bg-gray-700 hover:scale-105 transform transition"
          >
            Let’s Connect
          </Link>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 bg-black rounded text-gray-100 focus:outline-none"
            aria-label="Close Menu"
          >
            <FiX size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

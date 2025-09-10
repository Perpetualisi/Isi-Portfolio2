import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = (section) => {
    setMenu(section);
    setIsOpen(false); 
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["home", "about", "portfolio",  "contact"];

  return (
    <nav className={`navbar ${isScrolled ? "navbar-scroll" : ""}`}>
      {/* Logo */}
      <div className="logo-text">
        <Link to="/" onClick={() => handleLinkClick("home")}>
          <span>OKAN</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <ul className={`nav-menu ${isOpen ? "open" : ""}`}>
        {navItems.map((item) => (
          <li key={item}>
            <Link
              className={`anchor-link ${menu === item ? "active" : ""}`}
              to={item === "home" ? "/" : `/${item}`}
              onClick={() => handleLinkClick(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Link>
          </li>
        ))}
        {/* Mobile Connect Button */}
        <div className="nav-connect-mobile">
          <Link
            to="/contact"
            className="connect-btn"
            onClick={() => handleLinkClick("contact")}
          >
            Connect With Me
          </Link>
        </div>
      </ul>

      <div className="nav-connect">
        <Link
          className="connect-btn"
          to="/contact"
          onClick={() => handleLinkClick("contact")}
        >
          Connect With Me
        </Link>
      </div>

      <div className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
      </div>
    </nav>
  );
};

export default Navbar;

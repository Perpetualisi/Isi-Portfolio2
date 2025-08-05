import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import underline from '../../assets/nav_underline.svg';
import menu_open from '../../assets/menu_open.svg';
import menu_close from '../../assets/menu_close.svg';

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef();

  const openMenu = () => {
    menuRef.current.style.right = "0";
  };

  const closeMenu = () => {
    menuRef.current.style.right = "-450px";
  };

  const handleLinkClick = (section) => {
    setMenu(section);
    closeMenu();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`navbar ${isScrolled ? 'navbar-scroll' : ''}`}>
      <div className="logo-text">
        <Link to="/" onClick={() => handleLinkClick("home")}>
          OKAN
        </Link>
      </div>

      <img src={menu_open} onClick={openMenu} alt="Open Menu" className='nav-mob-open' />

      <ul ref={menuRef} className='nav-menu'>
        <img src={menu_close} onClick={closeMenu} alt="Close Menu" className="nav-mob-close" />
        <li>
          <Link className='anchor-link' to="/" onClick={() => handleLinkClick("home")}>
            Home
          </Link>
          {menu === "home" && <img src={underline} alt='' />}
        </li>
        <li>
          <Link className='anchor-link' to="/about" onClick={() => handleLinkClick("about")}>
            About me
          </Link>
          {menu === "about" && <img src={underline} alt='' />}
        </li>
        <li>
          <Link className='anchor-link' to="/portfolio" onClick={() => handleLinkClick("portfolio")}>
            Portfolio
          </Link>
          {menu === "portfolio" && <img src={underline} alt='' />}
        </li>
        <li>
          <Link className='anchor-link' to="/services" onClick={() => handleLinkClick("services")}>
            Services
          </Link>
          {menu === "services" && <img src={underline} alt='' />}
        </li>
        <li>
          <Link className='anchor-link' to="/work" onClick={() => handleLinkClick("work")}>
            Work
          </Link>
          {menu === "work" && <img src={underline} alt='' />}
        </li>
        <li>
          <Link className='anchor-link' to="/contact" onClick={() => handleLinkClick("contact")}>
            Contact
          </Link>
          {menu === "contact" && <img src={underline} alt='' />}
        </li>
      </ul>

      <div className='nav-connect'>
        <Link className='anchor-link' to="/contact" onClick={() => handleLinkClick("contact")}>
          Connect With Me
        </Link>
      </div>
    </div>
  );
};

export default Navbar;

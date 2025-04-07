import React, { useState, useRef } from 'react';
import './Navbar.css';
import okan from '../../assets/okan.png';
import underline from '../../assets/nav_underline.svg';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import menu_open from '../../assets/menu_open.svg';
import menu_close from '../../assets/menu_close.svg';

const Navbar = () => {
  const [menu, setMenu] = useState("home");
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

  return (
    <div className='navbar'>
      <img src={okan} alt="Logo" />
      <img src={menu_open} onClick={openMenu} alt="Open Menu" className='nav-mob-open' />
      <ul ref={menuRef} className='nav-menu'>
        <img src={menu_close} onClick={closeMenu} alt="Close Menu" className="nav-mob-close" />
        <li>
          <AnchorLink className='anchor-link' href='#hero' onClick={() => handleLinkClick("home")}>
            Home
          </AnchorLink>
          {menu === "home" ? <img src={underline} alt='' /> : <></>}
        </li>
        <li>
          <AnchorLink className='anchor-link' offset={50} href='#about' onClick={() => handleLinkClick("about")}>
            About me
          </AnchorLink>
          {menu === "about" ? <img src={underline} alt='' /> : <></>}
        </li>
        <li>
          <AnchorLink className='anchor-link' offset={50} href='#portfolio' onClick={() => handleLinkClick("portfolio")}>
            Portfolio
          </AnchorLink>
          {menu === "porfolio" ? <img src={underline} alt='' /> : <></>}
        </li>
        <li>
          <AnchorLink className='anchor-link' offset={50} href='#services' onClick={() => handleLinkClick("services")}>
            Services
          </AnchorLink>
          {menu === "services" ? <img src={underline} alt='' /> : <></>}
        </li>
        <li>
          <AnchorLink className='anchor-link' offset={50} href='#work' onClick={() => handleLinkClick("work")}>
            Work
          </AnchorLink>
          {menu === "work" ? <img src={underline} alt='' /> : <></>}
        </li>
        <li>
          <AnchorLink className='anchor-link' offset={50} href='#contact' onClick={() => handleLinkClick("contact")}>
            Contact
          </AnchorLink>
          {menu === "contact" ? <img src={underline} alt='' /> : <></>}
        </li>
      </ul>
      <div className='nav-connect'>
        <AnchorLink className='anchor-link' offset={50} href='#contact' onClick={() => handleLinkClick("contact")}>
          Connect With Me
        </AnchorLink>
      </div>
    </div>
  );
};

export default Navbar;

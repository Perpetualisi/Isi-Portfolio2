import React, { useState } from 'react';
import './Footer.css';
import user_icon from '../../assets/user_icon.svg';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email) return alert('Please enter an email address');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return alert('Please enter a valid email address');

    alert('Subscribed successfully!');
    setEmail('');
  };

  return (
    <footer className='footer'>
      <div className="footer-top">
        <div className="footer-top-left">
          <p>
            Hi! I’m <strong>Okan Perpetual</strong>, a <strong>Full-Stack Developer</strong> from Nigeria. 
            I build responsive web applications and end-to-end solutions using <strong>React.js, Node.js, APIs, and WordPress</strong>. 
            My focus is on creating seamless user experiences with reliable backend systems and scalable architectures.
          </p>
        </div>

        <div className="footer-top-right">
          <div className="footer-email-input">
            <img src={user_icon} alt="User Icon" />
            <input 
              type="email"
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email input for newsletter subscription"
            />
          </div>
          <button 
            className="footer-subscribe"
            onClick={handleSubscribe}
            aria-label="Subscribe to newsletter"
          >
            Subscribe
          </button>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">
        <p className='footer-bottom-left'>© 2025 Okan Perpetual. All rights reserved</p>
        <div className="footer-bottom-right">
          <p>Terms of Service</p>  
          <p>Privacy Policy</p>  
          <p>Connect with Me</p>  
        </div>
      </div>
    </footer>
  );
};

export default Footer;

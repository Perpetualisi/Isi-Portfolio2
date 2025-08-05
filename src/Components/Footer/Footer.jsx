import React, { useState } from 'react'
import './Footer.css'
import okan from '../../assets/okan.png'
import user_icon from '../../assets/user_icon.svg'

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email) {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        alert('Subscribed successfully!');
        setEmail('');
      } else {
        alert('Please enter a valid email address');
      }
    } else {
      alert('Please enter an email address');
    }
  };

  return (
    <div className='footer'>
      <div className="footer-top">
        <div className="footer-top-left">
          <img src={okan} alt="Okan Perpetual" className="footer-logo" />
          <p>I am a frontend developer from Nigeria with 2 years of experience in companies like Onfleet, Rune and Patch.</p>
        </div>
        
        <div className="footer-top-right">
          <div className="footer-email-input">
            <img src={user_icon} alt="User Icon" />
            <input 
              type="email" 
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div 
            className="footer-subscribe"
            onClick={handleSubscribe}
          >
            Subscribe
          </div>
        </div>
      </div>
      
      <hr className="footer-divider" />
      
      <div className="footer-bottom">
        <p className='footer-bottom-left'>© 2025 Okan Perpetual. All rights reserved</p>
        <div className="footer-bottom-right">
          <p>Terms of Services</p>  
          <p>Privacy Policy</p>  
          <p>Connect with Me</p>  
        </div>
      </div>
    </div>
  )
}

export default Footer



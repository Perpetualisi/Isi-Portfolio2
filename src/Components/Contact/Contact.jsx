import React, { useState } from 'react'
import './Contact.css'
import theme_pattern from '../../assets/theme_pattern.svg'
import mail_icon from '../../assets/mail_icon.svg'
import location_icon from '../../assets/location_icon.svg'
import call_icon from '../../assets/call_icon.svg'

const Contact = () => {
  const [submitStatus, setSubmitStatus] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("access_key", "f03b99d4-599d-460a-998d-62046420b9ba");
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      
      const res = await response.json();
      
      if (res.success) {
        setSubmitStatus('success');
        event.target.reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <div id='contact' className='contact'>
      <div className="contact-title">
        <h1>Get in touch</h1>
        <img src={theme_pattern} alt="Theme Pattern" />
      </div>
      
      <div className="contact-section">
        <div className="contact-left">
          <h1>Let's talk</h1>
          <p>I am currently available to take on new projects, so feel free to send me a message on anything that you want me to work on. You can contact anytime</p>
          
          <div className="contact-details">
            <div className="contact-detail">
              <img src={mail_icon} alt="Email" />
              <p>Perpetualokan0@gmail.com</p>
            </div>
            <div className="contact-detail">
              <img src={call_icon} alt="Phone" />
              <p>+234-810-355-837</p>
            </div>
            <div className="contact-detail">
              <img src={location_icon} alt="Location"/>
              <p>Nigeria</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className='contact-right'>
          <label htmlFor="name">Your Name</label>
          <input 
            type="text" 
            id="name"
            placeholder='Enter your name' 
            name='name' 
            required 
          />
          
          <label htmlFor="email">Your Email</label>
          <input 
            type="email" 
            id="email"
            placeholder='Enter your email' 
            name='email' 
            required 
          />
          
          <label htmlFor="message">Write your message here</label>
          <textarea 
            id="message"
            name="message" 
            rows="8" 
            placeholder='Enter your message'
            required
          ></textarea>
          
          {submitStatus === 'success' && (
            <div className="submit-message success">
              Message sent successfully!
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="submit-message error">
              Failed to send message. Please try again.
            </div>
          )}
          
          <button type='submit' className='contact-submit'>
            Submit now
          </button>
        </form>
      </div>
    </div>
  )
}

export default Contact
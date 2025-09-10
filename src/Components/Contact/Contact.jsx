import React, { useState } from 'react';
import './Contact.css';
import mailIcon from '../../assets/mail_icon.svg';
import locationIcon from '../../assets/location_icon.svg';
import callIcon from '../../assets/call_icon.svg';

const Contact = () => {
  const [submitStatus, setSubmitStatus] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("access_key", "f03b99d4-599d-460a-998d-62046420b9ba");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <section id='contact' className='contact'>
      <h1 className='contact-title'>Get in Touch</h1>

      <div className="contact-container">
        <div className="contact-info">
          <h2>Let's Connect</h2>
          <p>
            I’m open to new projects and collaborations. Reach out if you have a project in mind or just want to say hi!
          </p>
          <div className="contact-cards">
            <div className="contact-card">
              <img src={mailIcon} alt="Email" />
              <p>Perpetualokan0@gmail.com</p>
            </div>
            <div className="contact-card">
              <img src={callIcon} alt="Phone" />
              <p>+234-810-355-837</p>
            </div>
            <div className="contact-card">
              <img src={locationIcon} alt="Location" />
              <p>Nigeria</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={onSubmit}>
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" rows="6" placeholder="Your Message" required></textarea>

          {submitStatus === 'success' && <p className="submit-success">Message sent successfully!</p>}
          {submitStatus === 'error' && <p className="submit-error">Failed to send message. Please try again.</p>}

          <button type="submit">Send Message</button>
        </form>
      </div>
    </section>
  );
};

export default Contact;

import React, { useState } from "react";
import user_icon from "../../assets/user_icon.svg";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email) return alert("Please enter an email address");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return alert("Please enter a valid email address");

    alert("Subscribed successfully!");
    setEmail("");
  };

  return (
    <footer className="bg-black text-gray-100 px-6 py-16 md:px-12 lg:px-24">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 mb-8">
        {/* Left */}
        <div className="flex-1 text-gray-300">
          <p>
            Hi! I’m <strong>Okan Perpetual</strong>, a <strong>Full-Stack Developer</strong> from Nigeria. 
            I build responsive web applications and end-to-end solutions using <strong>React.js, Node.js, APIs, and WordPress</strong>. 
            My focus is on creating seamless user experiences with reliable backend systems and scalable architectures.
          </p>
        </div>

        {/* Right - Email Subscription */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center bg-gray-900 rounded-full px-4 py-2">
            <img src={user_icon} alt="User Icon" className="w-6 h-6 mr-3" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent flex-1 text-gray-200 placeholder-gray-400 focus:outline-none"
              aria-label="Email input for newsletter subscription"
            />
          </div>
          <button
            onClick={handleSubscribe}
            className="self-start px-6 py-2 bg-gray-800 text-gray-200 rounded-lg font-medium shadow hover:bg-gray-700 hover:scale-105 transform transition"
            aria-label="Subscribe to newsletter"
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-700 mb-6" />

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm gap-4">
        <p>© 2025 Okan Perpetual. All rights reserved</p>
        <div className="flex gap-6 flex-wrap justify-center md:justify-end">
          <p className="hover:text-gray-200 cursor-pointer transition">Terms of Service</p>
          <p className="hover:text-gray-200 cursor-pointer transition">Privacy Policy</p>
          <p className="hover:text-gray-200 cursor-pointer transition">Connect with Me</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

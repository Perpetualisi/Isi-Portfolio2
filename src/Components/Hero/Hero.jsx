import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/Perpetual_Resume1.pdf"; // Make sure PDF is in public/
    link.download = "Perpetual_Resume1.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="hero" className="hero">
      {/* Left Section */}
      <div className="hero-left">
        <img
          src="/profile.jpeg" // Place profile.jpeg in public/
          alt="Perpetual Okan"
          className="hero-avatar"
        />
      </div>

      {/* Right Section */}
      <div className="hero-right">
        <h1>
          Hi, I’m <span>Perpetual Okan</span>
          <br />
          Frontend Developer
        </h1>

        <p>
          I craft clean, responsive, and user-friendly web applications that
          deliver seamless experiences. I enjoy transforming ideas into digital
          products that are intuitive, visually appealing, and engaging for
          users. My focus is on building solutions that make an impact and help
          businesses and individuals achieve their goals.
        </p>

        <div className="hero-actions">
          {/* Primary CTA → Portfolio */}
          <Link to="/portfolio" className="hero-btn hero-projects">
            View Projects
          </Link>

          {/* Secondary CTA → Resume */}
          <button onClick={handleDownload} className="hero-btn hero-resume">
            Download Resume
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

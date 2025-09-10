import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";
import profile from "../../assets/profile.jpeg";

const Hero = () => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/Perpetual_Resume1.pdf";
    link.download = "Perpetual_Resume1.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="hero" className="hero">
      <div className="hero-left">
        <img src={profile} alt="Perpetual Okan" className="hero-avatar" />
      </div>

      <div className="hero-right">
        <h1>
          Hi, I’m <span>Perpetual Okan</span>
          <br />
          Frontend Developer
        </h1>
        <p>
          I craft clean, responsive, and user-friendly web applications using 
          <strong> HTML</strong>, <strong>CSS</strong>, <strong>JavaScript</strong>, and <strong>React</strong>. 
          I enjoy turning ideas into digital experiences that are both functional and visually appealing.
        </p>

        <div className="hero-actions">
          <Link to="/contact" className="hero-btn hero-connect">
            Connect with Me
          </Link>
          <button onClick={handleDownload} className="hero-btn hero-resume">
            Download Resume
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

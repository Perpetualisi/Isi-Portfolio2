import React from "react";
import "./Hero.css";
import profile from "../../assets/profile.jpeg";

const Hero = () => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/Frontend Dev cv.pdf"; 
    link.download = "Isi_Resume.pdf"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="hero">
      <img src={profile} alt="Perpetual Okan" />
      <h1>
         <span>I'm Perpetual Okan</span>,<br />
        frontend developer based in Nigeria
      </h1>
      <p>
        I am a frontend developer from  Nigeria, with two years of 
        experience in building responsive and interactive web applications 
        using HTML, CSS, JavaScript, and React.
      </p>
      <div className="hero-action" >
        <div className="hero-connect">
          <a href="#contact">          Connect with Me
          </a>
        </div>
        <div className="hero-resume">
          <button onClick={handleDownload} className="resume-button">
             My Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;

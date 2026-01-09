import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/Isi-Fullstack-CV.pdf"; // Make sure PDF is in public/
    link.download = "Perpetual_Resume1.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id="hero"
      className="flex flex-col md:flex-row items-center justify-center gap-12 px-5 sm:px-10 py-16 md:py-24 bg-black text-white"
    >
      {/* Left Section */}
      <div className="flex justify-center items-start md:items-center flex-1 mt-8 md:mt-0">
        <img
          src="/profile.jpeg"
          alt="Perpetual Okan"
          className="w-48 h-60 sm:w-52 sm:h-64 md:w-72 md:h-80 rounded-xl object-cover object-center shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-[0_10px_30px_rgba(180,21,255,0.4)]"
        />
      </div>

      {/* Right Section */}
      <div className="flex-1 max-w-xl text-center md:text-left mt-8 md:mt-0">
        <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-5 leading-tight">
          Hi, I’m{" "}
          <span className="bg-gradient-to-r from-yellow-600 to-purple-600 bg-clip-text text-transparent">
            Perpetual Okan
          </span>
          <br />
          Full-Stack Developer
        </h1>

        <p className="text-gray-300 mb-8 text-base sm:text-lg md:text-lg leading-relaxed">
          I build clean, responsive, and scalable web applications across the
          full stack. From intuitive user interfaces to reliable backend logic
          and API integrations, I enjoy transforming ideas into complete digital
          products that deliver great user experiences and real-world impact.
        </p>

        <div className="flex flex-col sm:flex-col md:flex-row gap-4 justify-center md:justify-start">
          {/* Primary CTA → View Projects */}
          <Link
            to="/portfolio"
            className="px-7 py-3 rounded-full text-white font-semibold bg-gray-800 hover:bg-gray-700 transition-transform duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 hover:shadow-lg"
          >
            View Projects
          </Link>

          {/* Secondary CTA → Resume (Black Background) */}
          <button
            onClick={handleDownload}
            className="px-7 py-3 rounded-full font-semibold bg-black border-2 border-gray-300 text-gray-300 transition-all duration-300 ease-in-out hover:text-purple-600 hover:border-purple-600 hover:scale-105 hover:-translate-y-1"
          >
            Download Resume
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

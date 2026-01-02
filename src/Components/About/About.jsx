import React from "react";
import "./About.css";

const About = () => {
  return (
    <section id="about" className="about">
      {/* Title */}
      <div className="about-title">
        <h1>About Me</h1>
      </div>

      {/* Content */}
      <div className="about-content">
        {/* Intro */}
        <div className="about-text">
          <p>
            I’m <span>Okan Perpetual Isi</span>, a <strong>Full-Stack Developer</strong> specializing in building end-to-end web applications that are responsive, scalable, and user-friendly. I work across both frontend and backend, turning ideas into complete digital solutions that deliver real impact.
          </p>
          <p>
            My work spans from crafting intuitive user interfaces with <strong>React.js, HTML, CSS</strong> to implementing reliable backend logic using <strong>Node.js</strong> and integrating APIs for dynamic, data-driven experiences. I also have experience working with <strong>WordPress</strong>, customizing themes, managing content, and extending functionality to meet client goals.
          </p>
          <p>
            I am passionate about continuous learning and applying best practices in web development, accessibility, and performance optimization. By combining creativity, structured development, and attention to detail, I deliver applications that are maintainable, efficient, and impactful.
          </p>
        </div>

        {/* Skills */}
        <div className="about-skills">
          <h2>Skills</h2>
          <ul>
            <li>
              <span>HTML & CSS</span>
              <div className="bar"><div style={{ width: "100%" }} /></div>
            </li>
            <li>
              <span>JavaScript (ES6+)</span>
              <div className="bar"><div style={{ width: "90%" }} /></div>
            </li>
            <li>
              <span>React.js</span>
              <div className="bar"><div style={{ width: "95%" }} /></div>
            </li>
            <li>
              <span>Node.js</span>
              <div className="bar"><div style={{ width: "85%" }} /></div>
            </li>
            <li>
              <span>Next.js</span>
              <div className="bar"><div style={{ width: "75%" }} /></div>
            </li>
            <li>
              <span>WordPress & CMS</span>
              <div className="bar"><div style={{ width: "80%" }} /></div>
            </li>
            <li>
              <span>REST APIs & Integration</span>
              <div className="bar"><div style={{ width: "85%" }} /></div>
            </li>
            <li>
              <span>Git & GitHub</span>
              <div className="bar"><div style={{ width: "90%" }} /></div>
            </li>
          </ul>
        </div>
      </div>

      {/* Achievements */}
      <div className="about-achievements">
        <div className="achievement">
          <h1>15+</h1>
          <p>Projects Completed</p>
        </div>
        <div className="achievement">
          <h1>10+</h1>
          <p>Client & Personal Projects</p>
        </div>
        <div className="achievement">
          <h1>Ongoing</h1>
          <p>Learning & Growth</p>
        </div>
      </div>
    </section>
  );
};

export default About;

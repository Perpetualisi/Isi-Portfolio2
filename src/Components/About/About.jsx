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
            I’m <span>Okan Perpetual Isi</span>, a <strong>Frontend Developer</strong> 
            dedicated to building <strong>responsive, user-friendly, and modern web applications</strong>.
          </p>
          <p>
            I work primarily with <strong>HTML</strong>, <strong>CSS</strong>, <strong>JavaScript</strong>, 
            and <strong>React</strong>. I also explore modern frameworks and tools to deliver fast, scalable, 
            and efficient solutions.
          </p>
          <p>
            My focus is on writing clean code, designing smooth user experiences, 
            and continuously improving my skills to create high-quality digital products.
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
              <span>React.js</span>
              <div className="bar"><div style={{ width: "90%" }} /></div>
            </li>
            <li>
              <span>JavaScript</span>
              <div className="bar"><div style={{ width: "85%" }} /></div>
            </li>
            <li>
              <span>Next.js</span>
              <div className="bar"><div style={{ width: "70%" }} /></div>
            </li>
            <li>
              <span>Tailwind CSS</span>
              <div className="bar"><div style={{ width: "75%" }} /></div>
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
          <p>Personal & Client Projects</p>
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

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
            I’m <span>Okan Perpetual Isi</span>, a Frontend Developer focused on creating web applications that are intuitive, reliable, and visually appealing. I specialize in delivering solutions that make digital interactions smooth and efficient for users.
          </p>
          <p>
            My work revolves around transforming ideas into practical and scalable digital solutions. I take a structured approach to design and development, ensuring that every project is both functional and user-friendly. I aim to provide experiences that meet business objectives while delighting users.
          </p>
          <p>
            I am committed to continuous learning and staying updated with the latest trends and best practices in web development. By combining attention to detail, thoughtful design, and efficient implementation, I strive to deliver high-quality applications that are maintainable, accessible, and effective.
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
              <span>JavaScript</span>
              <div className="bar"><div style={{ width: "85%" }} /></div>
            </li>
            <li>
              <span>React.js</span>
              <div className="bar"><div style={{ width: "90%" }} /></div>
            </li>
            <li>
              <span>Node.js</span>
              <div className="bar"><div style={{ width: "75%" }} /></div>
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

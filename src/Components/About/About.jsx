import React from "react";

const skills = [
  { name: "HTML & CSS", level: "100%" },
  { name: "JavaScript (ES6+)", level: "90%" },
  { name: "React.js", level: "95%" },
  { name: "Node.js", level: "85%" },
  { name: "Next.js", level: "75%" },
  { name: "WordPress & CMS", level: "80%" },
  { name: "REST APIs & Integration", level: "85%" },
  { name: "Git & GitHub", level: "90%" },
];

const achievements = [
  { count: "15+", label: "Projects Completed" },
  { count: "10+", label: "Client & Personal Projects" },
  { count: "Ongoing", label: "Learning & Growth" },
];

const About = () => {
  return (
    <section id="about" className="bg-black text-white px-5 py-20 md:px-10 lg:px-24 text-center">
      {/* Title */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100">About Me</h1>
      </div>

      {/* About Text */}
      <div className="max-w-3xl mx-auto space-y-4 text-left text-gray-300">
        <p>
          I’m <span className="text-yellow-500 font-semibold">Okan Perpetual Isi</span>, a <strong>Full-Stack Developer</strong> specializing in building end-to-end web applications that are responsive, scalable, and user-friendly. I work across both frontend and backend, turning ideas into complete digital solutions that deliver real impact.
        </p>
        <p>
          My work spans from crafting intuitive user interfaces with <strong>React.js, HTML, CSS</strong> to implementing reliable backend logic using <strong>Node.js</strong> and integrating APIs for dynamic, data-driven experiences. I also have experience working with <strong>WordPress</strong>, customizing themes, managing content, and extending functionality to meet client goals.
        </p>
        <p>
          I am passionate about continuous learning and applying best practices in web development, accessibility, and performance optimization. By combining creativity, structured development, and attention to detail, I deliver applications that are maintainable, efficient, and impactful.
        </p>
      </div>

      {/* Skills Section */}
      <div className="mt-12 max-w-3xl mx-auto text-left">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-400 mb-6">Skills</h2>
        <ul className="space-y-4">
          {skills.map((skill) => (
            <li key={skill.name}>
              <span className="block font-medium mb-1 text-gray-300">{skill.name}</span>
              <div className="h-2 w-full bg-gray-800 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-purple-500"
                  style={{ width: skill.level }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Achievements */}
      <div className="mt-16 flex flex-wrap justify-center gap-8">
        {achievements.map((item) => (
          <div
            key={item.label}
            className="bg-gray-900 p-8 rounded-xl text-center transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 to-purple-500 bg-clip-text text-transparent mb-2">
              {item.count}
            </h1>
            <p className="text-gray-400">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;

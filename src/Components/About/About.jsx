import React from "react";

const skills = [
  { name: "HTML & CSS", level: "100%" },
  { name: "JavaScript (ES6+)", level: "90%" },
  { name: "TypeScript", level: "85%" },
  { name: "React.js", level: "95%" },
  { name: "Tailwind CSS", level: "95%" },
  { name: "Node.js", level: "85%" },
  { name: "Next.js", level: "75%" },
  { name: "REST APIs & Integration", level: "85%" },
  { name: "Git & GitHub", level: "90%" },
  { name: "WordPress (Learning)", level: "40%" },
];

const achievements = [
  { count: "15+", label: "Projects Completed" },
  { count: "10+", label: "Client & Personal Projects" },
  { count: "Ongoing", label: "Learning & Growth" },
];

const About = () => {
  return (
    <section
      id="about"
      className="bg-black text-white px-5 py-20 md:px-10 lg:px-24 text-center"
    >
      {/* Title */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
          About Me
        </h1>
      </div>

      {/* About Text */}
      <div className="max-w-3xl mx-auto space-y-4 text-left text-gray-300">
        <p>
          I’m{" "}
          <span className="text-yellow-500 font-semibold">
            Okan Perpetual Isi
          </span>
          , a <strong>Full-Stack Developer</strong>. I build responsive
          websites and web applications that work smoothly across all
          devices. I handle both frontend and backend development to turn
          ideas into real digital products.
        </p>

        <p>
          I create clean and user-friendly interfaces using{" "}
          <strong>
            React.js, Tailwind CSS, HTML, CSS, and TypeScript
          </strong>{" "}
          and develop backend services with <strong>Node.js</strong>. I
          also integrate REST APIs to make applications dynamic and
          interactive.
        </p>

        <p>
          I enjoy learning new technologies and following best practices
          to keep my code clean, efficient, and easy to maintain. I’m
          currently learning <strong>WordPress</strong> to expand my skill
          set.
        </p>
      </div>

      {/* Skills Section */}
      <div className="mt-12 max-w-3xl mx-auto text-left">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-400 mb-6">
          Skills
        </h2>

        <ul className="space-y-4">
          {skills.map((skill) => (
            <li key={skill.name}>
              <span className="block font-medium mb-1 text-gray-300">
                {skill.name}
              </span>
              <div className="h-2 w-full bg-gray-800 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-purple-500 transition-all duration-500"
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
            className="bg-gray-900 p-8 rounded-xl text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
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

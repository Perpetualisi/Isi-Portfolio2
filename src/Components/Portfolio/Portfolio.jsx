import React from "react";
import Portfolio_Data from "../../assets/portfolio_data";

const Portfolio = () => {
  return (
    <section id="portfolio" className="bg-black text-white px-5 py-20 md:px-10 lg:px-24">
      {/* Title */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100">Featured Projects</h1>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Portfolio_Data.map((project, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-xl overflow-hidden shadow-lg transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Image */}
            <div className="overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-60 object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-gray-200">{project.title}</h3>
              <p className="text-gray-400 mb-4 text-sm md:text-base leading-relaxed">
                {project.description}
                {project.backend && (
                  <span className="block mt-1">
                    <strong>Backend:</strong> {project.backend}
                  </span>
                )}
                {project.api && (
                  <span className="block mt-1">
                    <strong>API:</strong> {project.api}
                  </span>
                )}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs md:text-sm px-2 py-1 bg-gray-700 rounded-full text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                {/* Dull View Code Button */}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-700 rounded-full text-gray-300 text-sm md:text-base font-medium shadow hover:bg-gray-600 hover:text-gray-100 hover:scale-105 transform transition-all duration-300"
                >
                  View Code
                </a>

                {/* Demo Button (optional) */}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-800 rounded-full text-white text-sm md:text-base font-medium shadow hover:bg-gray-700 hover:scale-105 transform transition-all duration-300"
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Portfolio;

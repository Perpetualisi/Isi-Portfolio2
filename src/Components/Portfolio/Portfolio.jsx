import React from "react";
import "./Portfolio.css";  
import Portfolio_Data from "../../assets/portfolio_data"; 

const Portfolio = () => {
  return (
    <section id="portfolio" className="portfolio">
      {/* Title */}
      <div className="portfolio-title">
        <h1>Featured Projects</h1>
      </div>

      {/* Projects Grid */}
      <div className="portfolio-grid">
        {Portfolio_Data.map((project, index) => (
          <div key={index} className="portfolio-card">
            <div className="portfolio-image">
              <img src={project.image} alt={project.title} />
            </div>

            <div className="portfolio-content">
              <h3>{project.title}</h3>
              <p>
                {project.description}  
                {project.backend && (
                  <span> <strong>Backend:</strong> {project.backend}</span>
                )}
                {project.api && (
                  <span> <strong>API:</strong> {project.api}</span>
                )}
              </p>

              <div className="portfolio-tags">
                {project.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>

              <div className="portfolio-links">
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="view-btn">
                  View Code
                </a>
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer" className="demo-btn">
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

import React from "react";
import "./Portfolio.css";
import theme_pattern from "../../assets/theme_pattern.svg";  
import Portfolio_Data from "../../assets/portfolio_data"; 


const Portfolio = () => {
  return (
    <div id="portfolio" className="portfolio">
      <div className="portfolio-title">
        <h1> My Portfolio</h1>
        <img src={theme_pattern} alt="Theme Pattern" />
      </div>
      <div className="portfolio-container">
        {Portfolio_Data.map((project, index) => (
          <div key={index} className="portfolio-item">
            <img src={project.image} alt={project.title} />
            <div className="portfolio-info">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="portfolio-tags">
                {project.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
              <div className="portfolio-links">
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  View Project
                </a>
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer" className="demo-link">
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;

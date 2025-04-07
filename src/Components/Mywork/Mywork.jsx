import React, { useState, useEffect } from 'react';
import './Mywork.css';
import theme_pattern from '../../assets/theme_pattern.svg';
import mywork_data from '../../assets/mywork_data';
import arrow_icon from '../../assets/arrow_icon.svg';

const Mywork = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === mywork_data.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="work" className="mywork">
      <div className="mywork-title">
        <h1>My latest work</h1>
        <img src={theme_pattern} alt="Theme Pattern" />
      </div>

      <div className="mywork-container">
        {mywork_data.map((work, index) => (
          <img
            key={index}
            src={work.w_img}
            alt={`Project ${index + 1}`}
            className={`work-slide ${index === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      <div className="mywork-showmore">
        
        <a href="#services" className="anchor-link">
          <p>Show More</p>
        </a>
        <img src={arrow_icon} alt="Arrow" />
      </div>
    </div>
  );
};

export default Mywork;

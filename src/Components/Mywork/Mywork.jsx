import React, { useState, useEffect } from 'react';
import './Mywork.css';
import mywork_data from '../../assets/mywork_data';  

const Mywork = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % mywork_data.length);
    }, 3000); 

    return () => clearInterval(interval); 
  }, []);

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mywork_data.length);
  };

  const goToPreviousSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mywork_data.length) % mywork_data.length);
  };

  return (
    <section id="work" className="mywork">
      <header className="mywork-title">
        <h1>My Latest Work</h1>
      </header>

      <div className="mywork-slider">
        <div className="slider-wrapper" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {mywork_data.map((work) => (
            <img
              key={work.w_no}
              src={work.w_img}
              alt={work.w_name}
              className="slider-image"
            />
          ))}
        </div>

        <button className="prev" onClick={goToPreviousSlide}>&#10094;</button>
        <button className="next" onClick={goToNextSlide}>&#10095;</button>
      </div>

      <div className="mywork-showmore">
        <a href="#services" className="anchor-link">
          <p>Show More</p>
        </a>
      </div>
    </section>
  );
};

export default Mywork;

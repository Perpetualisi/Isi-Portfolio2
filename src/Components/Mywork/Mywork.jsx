import React, { useState, useEffect } from 'react';
import './Mywork.css';
import mywork_data from '../../assets/mywork_data';  // Ensure correct path

const Mywork = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatic slide change
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % mywork_data.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mywork_data.length);
  };

  const goToPreviousSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mywork_data.length) % mywork_data.length);
  };

  return (
    <section id="work" className="mywork">
      {/* Title Section */}
      <header className="mywork-title">
        <h1>My Latest Work</h1>
      </header>

      {/* Slider Container */}
      <div className="mywork-slider">
        {/* Image Slider */}
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

        {/* Navigation Buttons */}
        <button className="prev" onClick={goToPreviousSlide}>&#10094;</button>
        <button className="next" onClick={goToNextSlide}>&#10095;</button>
      </div>

      {/* Show More Section */}
      <div className="mywork-showmore">
        <a href="#services" className="anchor-link">
          <p>Show More</p>
        </a>
      </div>
    </section>
  );
};

export default Mywork;

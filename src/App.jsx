import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Hero from './Components/Hero/Hero';
import About from './Components/About/About';
import Services from './Components/Services/Services';
import Mywork from './Components/Mywork/Mywork';
import Contact from './Components/Contact/Contact';
import Footer from './Components/Footer/Footer';
import Portfolio from './Components/Portfolio/Portfolio';
import ScrollToTop from './Components/ScrollToTop'; // 👈 import it
import './app.css';

const App = () => {
  return (
    <Router>
      <ScrollToTop /> {/* 👈 this must be right after Router */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/about" element={<About />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/services" element={<Services />} />
        <Route path="/work" element={<Mywork />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;

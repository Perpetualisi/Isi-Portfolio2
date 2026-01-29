import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Core Components (Loaded Immediately)
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import ScrollToTop from "./Components/ScrollToTop";

// Page Components (Lazy Loaded for Performance)
const Hero = lazy(() => import("./Components/Hero/Hero"));
const About = lazy(() => import("./Components/About/About"));
const Portfolio = lazy(() => import("./Components/Portfolio/Portfolio"));
const Contact = lazy(() => import("./Components/Contact/Contact"));

// A simple loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
  </div>
);

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#0a0a0a] selection:bg-purple-500/30 selection:text-purple-200">
        <ScrollToTop />
        
        <Navbar />

        {/* The 'flex-grow' on main ensures the footer 
          stays at the bottom on short pages.
        */}
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/about" element={<About />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* 404 Catch-all Route */}
              <Route path="*" element={
                <div className="h-[60vh] flex flex-col items-center justify-center text-white">
                  <h1 className="text-6xl font-bold">404</h1>
                  <p className="text-gray-400 mt-4">Page not found.</p>
                </div>
              } />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Neural from './pages/Neural';
import SplashScreen from './components/SplashScreen';
import TechChat from './components/TechChat';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [connectionLoss, setConnectionLoss] = useState(false);

  useEffect(() => {
    // Mouse tracking for cyber grid effect
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    // Simulate random connection loss effects
    const simulateConnectionLoss = () => {
      const interval = Math.random() * 10000 + 5000; // Random interval between 5-15 seconds
      setTimeout(() => {
        setConnectionLoss(true);
        setTimeout(() => {
          setConnectionLoss(false);
          simulateConnectionLoss();
        }, 200); // Flash duration
      }, interval);
    };

    window.addEventListener('mousemove', handleMouseMove);
    simulateConnectionLoss();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <Router>
          <div className="min-h-screen bg-black text-white cyber-grid film-grain">
            {/* Vintage film effects */}
            <div className="vignette" />
            <div className="film-scratches" />
            <div className="dust-particles" />
            
            {/* Connection loss overlay */}
            {connectionLoss && <div className="connection-loss" />}
            
            {/* Navigation */}
            <Navbar />
            
            {/* Main content with floating effect and top padding for fixed navbar */}
            <div className="content-container pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/about" element={<About />} />
                <Route path="/neural" element={<Neural />} />
              </Routes>
              <Footer />
            </div>

            {/* Tech Improvement Chat */}
            <TechChat />
          </div>
        </Router>
      )}
    </>
  );
};

export default App;
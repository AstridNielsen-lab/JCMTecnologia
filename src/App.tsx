import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Neural from './pages/Neural';
import SplashScreen from './components/SplashScreen';
import ConsentBanner from './components/ConsentBanner';
import PermissionsBanner from './components/PermissionsBanner';
import MultiChatAPI from './components/MultiChatAPI';
import TerminalPanel from './components/TerminalPanel';
import { Terminal } from 'lucide-react';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showMultiChat, setShowMultiChat] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
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
            
            {/* Permission and Cookie Banners */}
            <PermissionsBanner />
            <ConsentBanner />
            
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

            {/* Multi Chat API Component - Now with toggle button */}
            {showMultiChat && <MultiChatAPI onClose={() => setShowMultiChat(false)} />}
            
            {/* Terminal Panel */}
            <TerminalPanel isOpen={showTerminal} onClose={() => setShowTerminal(false)} />

            {/* Floating Buttons */}
            <div className="fixed bottom-4 right-4 flex space-x-2 z-50">
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="bg-primary text-surface-dark p-3 rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Terminal className="h-6 w-6" />
              </button>
              <button
                onClick={() => setShowMultiChat(!showMultiChat)}
                className="bg-primary text-surface-dark p-3 rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {showMultiChat ? "Fechar Chat" : "Abrir Chat"}
              </button>
            </div>
          </div>
        </Router>
      )}
    </>
  );
};

export default App;
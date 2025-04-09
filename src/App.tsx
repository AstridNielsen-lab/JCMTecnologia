import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Neural from './pages/Neural';
import NetworkScanner from './components/NetworkScanner';
import UltrasonicMapping from './components/UltrasonicMapping';
import MultiChatAPI from './components/MultiChatAPI';
import TerminalPanel from './components/TerminalPanel';
import AIAssistant from './pages/AIAssistant';
import PlaceholderPage from './pages/placeholder';
import Products from './pages/Products';
import Forks from './pages/Forks';
import About from './pages/About';
import SplashScreen from './components/SplashScreen';
import ConsentBanner from './components/ConsentBanner';
import PermissionsBanner from './components/PermissionsBanner';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <Router>
          <div className="min-h-screen bg-black text-white cyber-grid film-grain">
            <Navbar />
            <PermissionsBanner />
            <ConsentBanner />
            
            <div className="content-container pt-16">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/neural" element={<Neural />} />
                <Route path="/network-scanner" element={<NetworkScanner />} />
                <Route path="/ultrasonic" element={<UltrasonicMapping />} />
                <Route path="/multi-chat" element={<MultiChatAPI onClose={() => {}} />} />
                <Route path="/terminal" element={<TerminalPanel isOpen={showTerminal} onClose={() => setShowTerminal(false)} />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/system-monitor" element={<PlaceholderPage />} />
                <Route path="/audio-analyzer" element={<PlaceholderPage />} />
                <Route path="/security" element={<PlaceholderPage />} />
                <Route path="/data-manager" element={<PlaceholderPage />} />
                <Route path="/products" element={<Products />} />
                <Route path="/forks" element={<Forks />} />
                <Route path="/about" element={<About />} />
              </Routes>
              <Footer />
            </div>
          </div>
        </Router>
      )}
    </>
  );
};

export default App
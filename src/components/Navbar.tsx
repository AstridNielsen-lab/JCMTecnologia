import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AudioWaveform, Menu, X, Home, Package, Info, GitFork } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Projects', path: '/products', icon: Package },
    { name: 'Forks', path: '/forks', icon: GitFork },
    { name: 'About', path: '/about', icon: Info }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-surface-dark/80 backdrop-blur-md border-b border-primary/30 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <AudioWaveform className="h-8 w-8 text-primary group-hover:text-primary-dark transition-colors" />
            <span className="text-xl font-bold cyberpunk-gradient">JCM Tecnologia</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-white hover:text-primary transition-all duration-300 hover:scale-110 relative group flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-primary hover:text-primary-dark transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed right-0 top-16 w-64 h-screen bg-surface-dark/95 border-l border-primary/30 transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col space-y-4 p-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:text-primary transition-all duration-300 hover:translate-x-2 flex items-center space-x-2"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
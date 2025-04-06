import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = ['Home', 'Neural', 'Products', 'About'];

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-cyan-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Code2 className="h-8 w-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="text-xl font-bold cyberpunk-gradient">JCM Tecnologia</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-cyan-400 hover:text-cyan-300 transition-colors"
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
        className={`md:hidden fixed right-0 top-16 w-64 h-screen bg-black/95 border-l border-cyan-500/30 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col space-y-4 p-6">
          {menuItems.map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              onClick={() => setIsMenuOpen(false)}
              className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:translate-x-2 flex items-center space-x-2"
            >
              <span>{item}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
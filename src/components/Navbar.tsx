import React from 'react';
import { Link } from 'react-router-dom';
import { Music2Icon } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Music2Icon className="h-8 w-8 text-purple-500" />
            <span className="text-xl font-bold">DISPARAT TECHNO</span>
          </Link>
          <div className="flex space-x-8">
            <Link to="/" className="hover:text-purple-400 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-purple-400 transition-colors">Products</Link>
            <Link to="/about" className="hover:text-purple-400 transition-colors">About</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBrain, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 max-w-6xl">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-primary-600 hover:text-primary-700"
          >
            <FaBrain className="text-2xl" />
            <motion.span 
              className="text-xl font-display font-bold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              MCQ Practice
            </motion.span>
          </Link>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu} 
              className="text-gray-600 hover:text-primary-600 transition-colors duration-300"
              aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center space-x-8">
            <NavLink to="/" isActive={isActive('/')}>Home</NavLink>
            <NavLink to="/practice" isActive={isActive('/practice')}>Practice</NavLink>
            <NavLink to="/upload" isActive={isActive('/upload')}>Upload</NavLink>
            <NavLink to="/god-mode" isActive={isActive('/god-mode')}>GOD Mode</NavLink>
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav 
            className="mt-4 flex flex-col space-y-4 pb-4 md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <MobileNavLink to="/" isActive={isActive('/')}>Home</MobileNavLink>
            <MobileNavLink to="/practice" isActive={isActive('/practice')}>Practice</MobileNavLink>
            <MobileNavLink to="/upload" isActive={isActive('/upload')}>Upload</MobileNavLink>
            <MobileNavLink to="/god-mode" isActive={isActive('/god-mode')}>GOD Mode</MobileNavLink>
          </motion.nav>
        )}
      </div>
    </header>
  );
};

// Desktop NavLink Component
const NavLink = ({ to, isActive, children }) => (
  <Link
    to={to}
    className={`relative font-medium px-1 py-2 transition-colors duration-300 ${
      isActive 
        ? 'text-primary-600'
        : 'text-gray-600 hover:text-primary-600'
    }`}
  >
    {children}
    {isActive && (
      <motion.div
        layoutId="navbar-indicator"
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-500 rounded-full"
        initial={false}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    )}
  </Link>
);

// Mobile NavLink Component
const MobileNavLink = ({ to, isActive, children }) => (
  <Link
    to={to}
    className={`px-4 py-3 rounded-lg font-medium transition-colors duration-300 ${
      isActive 
        ? 'bg-primary-50 text-primary-600'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    {children}
  </Link>
);

export default Navbar; 
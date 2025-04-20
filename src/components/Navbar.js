import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBrain, FaBars, FaTimes, FaDatabase, FaBolt, FaChevronDown } from 'react-icons/fa';
import { useTheme } from './ThemeProvider';
import { getCourses } from '../services/quizService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showGodModeDropdown, setShowGodModeDropdown] = useState(false);
  const [courses, setCourses] = useState([]);
  const location = useLocation();
  const { darkMode } = useTheme();
  
  // Check for admin access (simple check if query param exists)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
      // Store admin status in localStorage
      localStorage.setItem('isAdmin', 'true');
    } else {
      // Check localStorage for admin status
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    }
    
    // Load courses for GOD Mode dropdown
    const loadCourses = async () => {
      try {
        const availableCourses = await getCourses();
        setCourses(availableCourses);
      } catch (err) {
        console.error('Error loading courses for navbar:', err);
      }
    };
    
    loadCourses();
  }, []);
  
  const isActive = (path) => location.pathname === path;
  const isGodModeActive = location.pathname.startsWith('/god-mode');
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleGodModeDropdown = () => {
    setShowGodModeDropdown(!showGodModeDropdown);
  };
  
  return (
    <header className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-3 max-w-6xl">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className={`flex items-center space-x-3 ${darkMode ? 'text-primary-400' : 'text-primary-600'} hover:opacity-80 transition-opacity`}
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
              className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-primary-600'} transition-colors duration-300`}
              aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center space-x-8">
            <NavLink to="/" isActive={isActive('/')} darkMode={darkMode}>Home</NavLink>
            <NavLink to="/practice" isActive={isActive('/practice')} darkMode={darkMode}>Practice</NavLink>
            <NavLink to="/upload" isActive={isActive('/upload')} darkMode={darkMode}>Upload</NavLink>
            
            {/* GOD Mode Dropdown */}
            <div className="relative">
              <button 
                onClick={toggleGodModeDropdown}
                className={`relative font-medium px-1 py-2 transition-colors duration-300 flex items-center ${
                  isGodModeActive 
                    ? darkMode ? 'text-primary-400' : 'text-primary-600'
                    : darkMode 
                      ? 'text-gray-300 hover:text-primary-400' 
                      : 'text-gray-600 hover:text-primary-600'
                }`}
                aria-expanded={showGodModeDropdown}
                aria-haspopup="true"
              >
                <FaBolt className="mr-1" />
                <span>GOD Mode</span>
                <FaChevronDown className={`ml-1 w-4 h-4 transition-transform ${showGodModeDropdown ? 'rotate-180' : ''}`} />
                
                {isGodModeActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className={`absolute bottom-0 left-0 right-0 h-[3px] ${darkMode ? 'bg-primary-400' : 'bg-primary-500'} rounded-full`}
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
              
              {/* Dropdown Menu */}
              {showGodModeDropdown && (
                <div 
                  className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-white'
                  } ring-1 ring-black ring-opacity-5 z-10`}
                >
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link 
                      to="/god-mode" 
                      className={`block px-4 py-2 text-sm ${
                        darkMode 
                          ? 'text-gray-100 hover:bg-gray-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      role="menuitem"
                      onClick={() => setShowGodModeDropdown(false)}
                    >
                      All Courses
                    </Link>
                    
                    {courses.length > 0 && (
                      <div className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'} my-1`}></div>
                    )}
                    
                    {courses.map(course => (
                      <Link 
                        key={course.id}
                        to={`/god-mode/${course.id}`} 
                        className={`block px-4 py-2 text-sm ${
                          darkMode 
                            ? 'text-gray-100 hover:bg-gray-600' 
                            : 'text-gray-700 hover:bg-gray-100'
                        } ${isActive(`/god-mode/${course.id}`) ? (darkMode ? 'bg-gray-600' : 'bg-gray-100') : ''}`}
                        role="menuitem"
                        onClick={() => setShowGodModeDropdown(false)}
                      >
                        {course.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {isAdmin && (
              <NavLink to="/debug" isActive={isActive('/debug')} darkMode={darkMode} isAdmin={true}>
                <FaDatabase className="mr-1" />
                DebugDB
              </NavLink>
            )}
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav 
            className={`mt-4 flex flex-col space-y-4 pb-4 md:hidden ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <MobileNavLink to="/" isActive={isActive('/')} darkMode={darkMode}>Home</MobileNavLink>
            <MobileNavLink to="/practice" isActive={isActive('/practice')} darkMode={darkMode}>Practice</MobileNavLink>
            <MobileNavLink to="/upload" isActive={isActive('/upload')} darkMode={darkMode}>Upload</MobileNavLink>
            
            {/* Mobile GOD Mode link with dropdown */}
            <div>
              <button 
                onClick={() => setShowGodModeDropdown(!showGodModeDropdown)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center justify-between ${
                  isGodModeActive
                    ? darkMode
                      ? 'bg-gray-700 text-primary-400'
                      : 'bg-primary-50 text-primary-600'
                    : darkMode
                      ? 'text-gray-200 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <FaBolt className="mr-2" />
                  <span>GOD Mode</span>
                </div>
                <FaChevronDown className={`transition-transform ${showGodModeDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showGodModeDropdown && (
                <div className={`mt-1 pl-4 ${darkMode ? 'border-l border-gray-700' : 'border-l border-gray-200'}`}>
                  <Link 
                    to="/god-mode" 
                    className={`block py-2 px-4 my-1 rounded ${
                      isActive('/god-mode') 
                        ? darkMode ? 'bg-gray-700 text-primary-400' : 'bg-primary-50 text-primary-600'
                        : darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowGodModeDropdown(false);
                    }}
                  >
                    All Courses
                  </Link>
                  
                  {courses.map(course => (
                    <Link 
                      key={course.id}
                      to={`/god-mode/${course.id}`} 
                      className={`block py-2 px-4 my-1 rounded ${
                        isActive(`/god-mode/${course.id}`) 
                          ? darkMode ? 'bg-gray-700 text-primary-400' : 'bg-primary-50 text-primary-600'
                          : darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowGodModeDropdown(false);
                      }}
                    >
                      {course.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {isAdmin && (
              <MobileNavLink to="/debug" isActive={isActive('/debug')} darkMode={darkMode} className="flex items-center">
                <FaDatabase className="mr-2" />
                DebugDB
              </MobileNavLink>
            )}
          </motion.nav>
        )}
      </div>
    </header>
  );
};

// Desktop NavLink Component
const NavLink = ({ to, isActive, darkMode, isAdmin, children }) => (
  <Link
    to={to}
    className={`relative font-medium px-1 py-2 transition-colors duration-300 flex items-center ${
      isActive 
        ? darkMode ? 'text-primary-400' : 'text-primary-600'
        : darkMode 
          ? 'text-gray-300 hover:text-primary-400' 
          : 'text-gray-600 hover:text-primary-600'
    } ${isAdmin ? 'bg-gray-100 dark:bg-gray-700 px-3 rounded-full' : ''}`}
  >
    {children}
    {isActive && !isAdmin && (
      <motion.div
        layoutId="navbar-indicator"
        className={`absolute bottom-0 left-0 right-0 h-[3px] ${darkMode ? 'bg-primary-400' : 'bg-primary-500'} rounded-full`}
        initial={false}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    )}
  </Link>
);

// Mobile NavLink Component
const MobileNavLink = ({ to, isActive, darkMode, className, children }) => (
  <Link
    to={to}
    className={`px-4 py-3 rounded-lg font-medium transition-colors duration-300 ${
      isActive 
        ? darkMode
          ? 'bg-gray-700 text-primary-400'
          : 'bg-primary-50 text-primary-600'
        : darkMode
          ? 'text-gray-200 hover:bg-gray-700'
          : 'text-gray-700 hover:bg-gray-100'
    } ${className || ''}`}
  >
    {children}
  </Link>
);

export default Navbar; 
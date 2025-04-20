import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeProvider';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-yellow-300 
                shadow-md hover:shadow-lg dark:shadow-gray-900 focus:outline-none
                transition-all duration-300 ease-in-out transform hover:scale-105"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <FaSun className="w-5 h-5 text-yellow-300" />
      ) : (
        <FaMoon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
};

export default ThemeToggle; 
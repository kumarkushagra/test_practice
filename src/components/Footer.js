import React from 'react';
import { FaHeart, FaBook, FaBrain } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white mt-10 shadow-inner py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <FaBrain className="text-primary-500" />
            <span className="font-display font-semibold text-gray-800">MCQ Practice</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-600 text-sm">
              Made with <FaHeart className="inline text-red-500" /> for students learning 
              <FaBook className="inline ml-2 text-primary-500" />
            </p>
            <p className="text-gray-500 text-xs mt-1">
              &copy; {currentYear} MCQ Practice. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
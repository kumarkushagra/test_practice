import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <FaExclamationTriangle className="text-yellow-500 text-6xl mb-6" />
      
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Page Not Found</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="btn-primary flex items-center justify-center"
        >
          <FaHome className="mr-2" />
          <span>Back to Home</span>
        </Link>
        
        <Link
          to="/practice"
          className="btn-outline flex items-center justify-center"
        >
          <FaSearch className="mr-2" />
          <span>Find Courses</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFoundPage; 
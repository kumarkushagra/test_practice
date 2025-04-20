import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaBookOpen, 
  FaCloudUploadAlt, 
  FaChevronRight, 
  FaInfoCircle,
  FaBolt
} from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
          <span className="text-primary-600">MCQ</span> Practice
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Master multiple choice questions with spaced repetition. Practice, learn, and remember.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        <MainOption 
          to="/practice"
          icon={<FaBookOpen />}
          title="Practice"
          description="Choose from existing courses and test your knowledge with interactive quizzes."
          color="bg-primary-500"
          delay={0.1}
        />
        
        <MainOption 
          to="/upload"
          icon={<FaCloudUploadAlt />}
          title="Upload"
          description="Upload your own JSON file in the specified format to create custom quizzes."
          color="bg-secondary-500"
          delay={0.2}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-10"
      >
        <Link 
          to="/god-mode" 
          className="inline-flex items-center space-x-2 text-white bg-gradient-to-r from-amber-500 to-red-600 py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <FaBolt className="text-xl" />
          <span>Try GOD MODE</span>
          <FaChevronRight className="ml-1" />
        </Link>
        <p className="text-center mt-2 text-sm text-gray-500 flex items-center justify-center">
          <FaInfoCircle className="mr-1" />
          <span>
            Challenge yourself with questions from all courses
          </span>
        </p>
      </motion.div>
    </div>
  );
};

const MainOption = ({ to, icon, title, description, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Link to={to} className="block">
      <div className="card group h-full flex flex-col hover:shadow-xl">
        <div className={`${color} text-white w-16 h-16 rounded-lg flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h2 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-primary-600 transition-colors">
          {title}
        </h2>
        <p className="text-gray-600 mb-6 flex-grow">
          {description}
        </p>
        <div className="flex items-center text-primary-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
          <span>Get Started</span>
          <FaChevronRight className="ml-2" />
        </div>
      </div>
    </Link>
  </motion.div>
);

export default HomePage; 
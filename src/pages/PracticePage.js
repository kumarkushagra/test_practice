import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBook, FaSpinner, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { getCourses } from '../services/quizService';

const PracticePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await getCourses();
        setCourses(coursesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors"
          aria-label="Back to home"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Choose a Course</h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-primary-500 text-4xl mb-4" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg flex flex-col items-center">
          <FaExclamationTriangle className="text-3xl mb-3 text-red-500" />
          <p className="text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 btn-outline border-red-500 text-red-500 hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-8 rounded-lg">
          <p className="text-center">No courses available. Please add a course via the Upload page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onClick={() => handleCourseClick(course.id)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course, onClick, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.03 }}
      className="card cursor-pointer hover:shadow-lg"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
          <FaBook className="text-primary-600 text-xl" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{course.name}</h2>
      </div>
      
      <p className="text-gray-600 mb-4">{course.description}</p>
      
      <div className="mt-auto">
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
          <span>{course.weeks.length} Weeks</span>
          <span>{course.totalQuestions || 0} Questions</span>
        </div>
        
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${Math.min(100, (course.weeks.length / 12) * 100)}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
};

export default PracticePage; 
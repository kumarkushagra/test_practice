import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaCalendarAlt,
  FaListAlt,
  FaQuestionCircle
} from 'react-icons/fa';
import { getCourseDetails } from '../services/quizService';

const CoursePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const courseData = await getCourseDetails(courseId);
        setCourse(courseData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError(`Failed to load course details. ${err.message}`);
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const handleWeekClick = (weekId) => {
    navigate(`/quiz/${courseId}/${weekId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FaSpinner className="animate-spin text-primary-500 text-4xl mb-4" />
        <p className="text-gray-600">Loading course details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg flex flex-col items-center">
        <FaExclamationTriangle className="text-3xl mb-3 text-red-500" />
        <p className="text-center">{error}</p>
        <div className="mt-6 flex gap-4">
          <button 
            onClick={() => navigate('/practice')}
            className="btn-outline border-red-500 text-red-500 hover:bg-red-50"
          >
            Back to Courses
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/practice')}
          className="mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors"
          aria-label="Back to courses"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{course.name}</h1>
      </div>

      <div className="mb-8">
        <p className="text-gray-600">{course.description}</p>
        
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium flex items-center">
            <FaCalendarAlt className="mr-2" />
            <span>{course.weeks.length} Weeks</span>
          </div>
          <div className="bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-sm font-medium flex items-center">
            <FaQuestionCircle className="mr-2" />
            <span>{course.totalQuestions || 0} Questions</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        <FaListAlt className="inline-block mr-2 text-primary-500" />
        Choose a Week
      </h2>

      {course.weeks.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-8 rounded-lg">
          <p className="text-center">No weeks available for this course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {course.weeks.map((week, index) => (
            <WeekCard 
              key={week.id}
              week={week}
              onClick={() => handleWeekClick(week.id)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const WeekCard = ({ week, onClick, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.03 }}
      className="card cursor-pointer hover:shadow-lg"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{week.name}</h3>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-purple-600 font-medium">
          {week.questionCount} Questions
        </span>
        
        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
          Start Quiz
        </span>
      </div>
    </motion.div>
  );
};

export default CoursePage; 
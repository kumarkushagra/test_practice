import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaCheck, 
  FaTimes,
  FaBolt,
  FaStar,
  FaInfoCircle,
  FaChevronRight,
  FaRedo,
  FaBook,
  FaGraduationCap,
  FaFire
} from 'react-icons/fa';
import { getCourses, getQuestionsForCourse, getCourseDetails } from '../services/quizService';
import { shuffleArray, getQuestionKey } from '../utils/arrayUtils';
import Confetti from 'react-confetti';

const GodModePage = () => {
  const { courseId: specificCourseId } = useParams();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(specificCourseId || '');
  const [courseSelectionMode, setCourseSelectionMode] = useState(!specificCourseId);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [questionMistakes, setQuestionMistakes] = useState({});
  const [remainingQuestions, setRemainingQuestions] = useState([]);
  const navigate = useNavigate();

  // Number of questions to use in GOD MODE
  // TODO: Change this to 120
  const maxQuestionsInGodMode = 120;

  // Load available courses and initialize specific course if provided
  useEffect(() => {
    const loadCoursesAndInitialize = async () => {
      try {
        setLoading(true);
        const availableCourses = await getCourses();
        setCourses(availableCourses);
        
        // If a specific courseId was provided in the URL, load it immediately
        if (specificCourseId) {
          // Check if the course exists
          const courseExists = availableCourses.some(course => course.id === specificCourseId);
          
          if (courseExists) {
            await handleCourseSelect(specificCourseId);
          } else {
            setError(`Course with ID "${specificCourseId}" not found. Please select another course.`);
            setCourseSelectionMode(true);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading courses:', err);
        setError(`Failed to load courses. ${err.message}`);
        setLoading(false);
      }
    };

    loadCoursesAndInitialize();
  }, [specificCourseId]);

  // Function to handle course selection and start quiz
  const handleCourseSelect = async (courseId) => {
    try {
      setLoading(true);
      setSelectedCourseId(courseId);
      
      // Get questions for the selected course
      const courseQuestions = await getQuestionsForCourse(courseId);
      
      if (courseQuestions.length === 0) {
        setError(`No questions available for this course. Try selecting another course.`);
        setLoading(false);
        return;
      }
      
      // Shuffle all questions
      const shuffledQuestions = shuffleArray(courseQuestions);
      
      // Take a subset of questions for GOD MODE
      const godModeQuestions = shuffledQuestions.slice(0, Math.min(maxQuestionsInGodMode, shuffledQuestions.length));
      
      // For each question, shuffle its options
      const processedQuestions = godModeQuestions.map((question, index) => {
        // Create a mapping of original option indices
        const optionIndices = [...Array(question.options.length).keys()];
        const shuffledIndices = shuffleArray(optionIndices);
        
        // Reorder options
        const shuffledOptions = shuffledIndices.map(i => question.options[i]);
        
        // Find where the correct answer moved to
        const newCorrectAnswer = shuffledIndices.indexOf(question.correctAnswer);
        
        return {
          ...question,
          options: shuffledOptions,
          correctAnswer: newCorrectAnswer,
          id: index // Add unique ID for tracking
        };
      });
      
      setQuestions(processedQuestions);
      // Initialize the remaining questions queue with all questions
      setRemainingQuestions([...Array(processedQuestions.length).keys()]);
      // Initialize mistake tracking
      setQuestionMistakes({});
      setCourseSelectionMode(false);
      setLoading(false);
    } catch (err) {
      console.error('Error preparing GOD MODE questions:', err);
      setError(`Failed to load questions. ${err.message}`);
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    if (answered) return;
    
    setSelectedOption(optionIndex);
    setAnswered(true);
    
    const currentQuestionId = remainingQuestions[0];
    const question = questions[currentQuestionId];
    const correct = optionIndex === question.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      
      // Update max streak if needed
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      
      // Show confetti for streak milestones
      if (newStreak >= 5 && newStreak % 5 === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }

      // If this question had mistakes before, reduce the mistake count
      const updatedMistakes = { ...questionMistakes };
      if (updatedMistakes[currentQuestionId] && updatedMistakes[currentQuestionId] > 0) {
        updatedMistakes[currentQuestionId] -= 1;
        if (updatedMistakes[currentQuestionId] === 0) {
          delete updatedMistakes[currentQuestionId]; // Remove if no more mistakes to correct
        }
      }
      setQuestionMistakes(updatedMistakes);
    } else {
      setCurrentStreak(0);
      
      // Track the mistake for this question
      const updatedMistakes = { ...questionMistakes };
      updatedMistakes[currentQuestionId] = (updatedMistakes[currentQuestionId] || 0) + 1;
      setQuestionMistakes(updatedMistakes);
    }
  };

  const handleNextQuestion = () => {
    // Process the current question from the queue
    const newRemainingQuestions = [...remainingQuestions];
    const currentQuestionId = newRemainingQuestions.shift();
    
    // If the answer was incorrect, add this question back to the queue (but not immediately)
    // Add it after at least 2 other questions if possible
    if (!isCorrect) {
      const insertPosition = Math.min(2, newRemainingQuestions.length);
      newRemainingQuestions.splice(insertPosition, 0, currentQuestionId);
    }
    // If correct but still has remaining mistakes to correct, add it back
    else if (questionMistakes[currentQuestionId] && questionMistakes[currentQuestionId] > 0) {
      const insertPosition = Math.min(2, newRemainingQuestions.length);
      newRemainingQuestions.splice(insertPosition, 0, currentQuestionId);
    }
    
    setRemainingQuestions(newRemainingQuestions);
    setSelectedOption(null);
    setAnswered(false);
    setIsCorrect(false);
    
    // If there are no more questions to answer, the quiz is complete
    if (newRemainingQuestions.length === 0) {
      setQuizCompleted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const handleRestartQuiz = async () => {
    try {
      setLoading(true);
      setQuizCompleted(false);
      setCurrentQuestion(0);
      setSelectedOption(null);
      setAnswered(false);
      setIsCorrect(false);
      setScore(0);
      setCurrentStreak(0);
      setMaxStreak(0);
      setQuestionMistakes({});
      
      // Get questions for the selected course again and reshuffle
      const courseQuestions = await getQuestionsForCourse(selectedCourseId);
      const shuffledQuestions = shuffleArray(courseQuestions);
      const godModeQuestions = shuffledQuestions.slice(0, Math.min(maxQuestionsInGodMode, shuffledQuestions.length));
      
      // Process questions again
      const processedQuestions = godModeQuestions.map((question, index) => {
        const optionIndices = [...Array(question.options.length).keys()];
        const shuffledIndices = shuffleArray(optionIndices);
        const shuffledOptions = shuffledIndices.map(i => question.options[i]);
        const newCorrectAnswer = shuffledIndices.indexOf(question.correctAnswer);
        
        return {
          ...question,
          options: shuffledOptions,
          correctAnswer: newCorrectAnswer,
          id: index
        };
      });
      
      setQuestions(processedQuestions);
      setRemainingQuestions([...Array(processedQuestions.length).keys()]);
      setLoading(false);
    } catch (err) {
      console.error('Error restarting GOD MODE:', err);
      setError(`Failed to restart quiz. ${err.message}`);
      setLoading(false);
    }
  };

  const handleBackToCourseSelection = () => {
    setCourseSelectionMode(true);
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setQuestions([]);
    setRemainingQuestions([]);
    setQuestionMistakes({});
    
    // Update URL if using a specific course
    if (specificCourseId) {
      navigate('/god-mode');
    }
  };
  
  // Handle navigation to a specific course
  const navigateToSpecificCourse = (courseId) => {
    navigate(`/god-mode/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <FaSpinner className="animate-spin text-amber-500 text-4xl mb-4" />
          <FaBolt className="absolute text-lg text-amber-600 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-600">Loading GOD MODE...</p>
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
            onClick={() => navigate('/')}
            className="btn-outline border-red-500 text-red-500 hover:bg-red-50"
          >
            Back to Home
          </button>
          {!courseSelectionMode && (
            <button 
              onClick={handleBackToCourseSelection}
              className="btn-primary"
            >
              Choose Another Course
            </button>
          )}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-8 rounded-lg">
        <p className="text-center">No courses available for GOD MODE. Try uploading some questions first.</p>
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => navigate('/upload')}
            className="btn-primary"
          >
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  if (courseSelectionMode) {
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
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-600">
            GOD MODE
          </h1>
          <FaBolt className="ml-2 text-amber-500" />
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start text-amber-800">
            <FaInfoCircle className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h2 className="font-semibold mb-2">Choose a Course for GOD MODE</h2>
              <p className="text-sm">
                GOD MODE will challenge you with up to {maxQuestionsInGodMode} randomly selected questions from your chosen course.
                This is the ultimate test of your knowledge! You'll repeat any incorrect questions until mastery.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => (
            <motion.div
              key={course.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 cursor-pointer"
              onClick={() => navigateToSpecificCourse(course.id)}
            >
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <FaBook className="text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{course.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{course.description || 'Test your knowledge of this course'}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{course.weeks.length} weeks</span>
                  <span>{course.totalQuestions} questions</span>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="btn-primary flex items-center">
                    <span>Start GOD MODE</span>
                    <FaBolt className="ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const currentCourse = courses.find(c => c.id === selectedCourseId);
    return (
      <GodModeCompletedScreen 
        score={score} 
        totalQuestions={questions.length}
        maxStreak={maxStreak}
        onRestart={handleRestartQuiz}
        onBackToSelection={handleBackToCourseSelection}
        onBackToHome={() => navigate('/')}
        showConfetti={showConfetti}
        courseName={currentCourse?.name || 'Selected Course'}
      />
    );
  }

  // If no remaining questions, show loading
  if (remainingQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <FaSpinner className="animate-spin text-amber-500 text-4xl mb-4" />
          <FaBolt className="absolute text-lg text-amber-600 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-600">Processing results...</p>
      </div>
    );
  }

  const currentQuestionId = remainingQuestions[0];
  const question = questions[currentQuestionId];
  const progressPercentage = Math.min(100, Math.round((score / questions.length) * 100));
  const currentCourse = courses.find(c => c.id === selectedCourseId);
  
  // Count remaining items to be answered correctly
  const totalRemainingItems = remainingQuestions.length + 
    Object.values(questionMistakes).reduce((sum, count) => sum + count, 0);

  return (
    <div>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBackToCourseSelection}
            className="mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors"
            aria-label="Back to course selection"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-600">
            GOD MODE
          </h1>
          <FaBolt className="ml-2 text-amber-500" />
        </div>
        
        <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
          <FaGraduationCap className="mr-2" />
          <span>Course: {currentCourse?.name || 'Selected Course'}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-500">
          Progress: {score}/{questions.length} mastered 
          {Object.keys(questionMistakes).length > 0 && 
            ` (${Object.keys(questionMistakes).length} questions need review)`}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-amber-600">
            <FaStar className="mr-1" />
            <span className="font-medium">{score}</span>
          </div>
          
          {currentStreak >= 3 && (
            <div className="flex items-center text-red-500">
              <FaFire className="mr-1" />
              <span className="font-medium">{currentStreak}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionId}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          {questionMistakes[currentQuestionId] > 0 && (
            <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
              <FaInfoCircle className="inline-block mr-1" />
              This question needs to be answered correctly {questionMistakes[currentQuestionId]} more time(s).
            </div>
          )}
          
          <h2 className="text-xl font-medium mb-6">{question.question}</h2>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${selectedOption === index ? 'selected' : ''} 
                  ${answered && index === selectedOption ? (isCorrect ? 'correct' : 'incorrect') : ''}
                  ${answered && index === question.correctAnswer ? 'correct' : ''}`}
                onClick={() => handleOptionSelect(index)}
                disabled={answered}
              >
                <div className="flex justify-between items-center">
                  <div>{option}</div>
                  {answered && index === selectedOption && (
                    isCorrect ? 
                      <FaCheck className="text-green-600" /> : 
                      <FaTimes className="text-red-600" />
                  )}
                  {answered && index === question.correctAnswer && selectedOption !== index && (
                    <FaCheck className="text-green-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {answered && (
        <div className="flex justify-end">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="btn-primary flex items-center"
            onClick={handleNextQuestion}
          >
            {remainingQuestions.length > 1 || Object.keys(questionMistakes).length > 0 ? (
              <>
                <span>Next Question</span>
                <FaChevronRight className="ml-2" />
              </>
            ) : (
              <>
                <span>Complete Quiz</span>
                <FaBolt className="ml-2" />
              </>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
};

const GodModeCompletedScreen = ({ 
  score, 
  totalQuestions, 
  maxStreak, 
  onRestart, 
  onBackToSelection,
  onBackToHome, 
  showConfetti,
  courseName
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  let message, messageColor;
  
  if (percentage >= 90) {
    message = "GODLIKE! Your knowledge is divine!";
    messageColor = "text-amber-600";
  } else if (percentage >= 70) {
    message = "Impressive! You're approaching godhood!";
    messageColor = "text-amber-500";
  } else if (percentage >= 50) {
    message = "Good effort! Keep striving for divine knowledge!";
    messageColor = "text-blue-500";
  } else {
    message = "The path to godhood is challenging. Keep practicing!";
    messageColor = "text-purple-500";
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-10">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full mx-auto text-center"
      >
        <div className="flex justify-center mb-6">
          <FaBolt className="text-amber-500 text-4xl" />
          <h2 className="text-3xl font-bold ml-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-600">
            GOD MODE Complete!
          </h2>
        </div>
        
        <div className="mb-2 text-gray-600">
          <span className="font-medium">{courseName}</span>
        </div>
        
        <div className="mb-8">
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                className="text-gray-200" 
                strokeWidth="8" 
                stroke="currentColor" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
              />
              <circle 
                className="text-amber-500" 
                strokeWidth="8" 
                stroke="currentColor" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-800">{percentage}%</span>
              <span className="text-gray-500 text-sm">Divine Power</span>
            </div>
          </div>
          
          <p className="text-xl font-medium mt-4 mb-2">
            You scored <span className="text-amber-600 font-bold">{score}</span> out of <span className="font-bold">{totalQuestions}</span>
          </p>
          
          <p className="text-lg mb-2">
            Max Streak: <span className="text-red-500 font-bold">{maxStreak}</span>
          </p>
          
          <p className={`text-lg ${messageColor} font-medium`}>
            {message}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={onBackToHome}
            className="btn-outline"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </button>
          <button 
            onClick={onBackToSelection}
            className="btn-secondary"
          >
            <FaBook className="mr-2" />
            Change Course
          </button>
          <button 
            onClick={onRestart}
            className="btn-primary"
          >
            <FaRedo className="mr-2" />
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GodModePage; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaCheck, 
  FaTimes,
  FaListAlt,
  FaRedo,
  FaFire,
  FaChevronRight,
  FaChevronLeft
} from 'react-icons/fa';
import { loadQuiz, trackQuestionProgress, getQuestionsNeedingPractice } from '../services/quizService';
import { createShuffledQuiz, addQuestionsNeedingPractice, getQuestionKey } from '../utils/arrayUtils';
import Confetti from 'react-confetti';

const QuizPage = () => {
  const { courseId, weekId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const navigate = useNavigate();

  // Load the quiz data
  useEffect(() => {
    const fetchAndPrepareQuiz = async () => {
      try {
        setLoading(true);
        // Load the quiz data
        const quizData = await loadQuiz(courseId, weekId);
        
        // Get questions that need more practice
        const needPracticeIndices = await getQuestionsNeedingPractice(courseId, weekId);
        
        // First add questions that need practice
        const quizWithRepeats = addQuestionsNeedingPractice(quizData, needPracticeIndices);
        
        // Then shuffle the questions and options
        const shuffledQuiz = createShuffledQuiz(quizWithRepeats);
        
        setQuiz(shuffledQuiz);
        setLoading(false);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(`Failed to load quiz. ${err.message}`);
        setLoading(false);
      }
    };

    fetchAndPrepareQuiz();
  }, [courseId, weekId]);

  // Handle option selection
  const handleOptionSelect = (optionIndex) => {
    if (answered) return;
    
    setSelectedOption(optionIndex);
    setAnswered(true);
    
    const correct = optionIndex === quiz.questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
      setStreakCount(streakCount + 1);
      if (streakCount + 1 >= 3) {
        // Show confetti for 3+ streak
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    } else {
      setStreakCount(0);
    }
    
    // Track this question's progress
    const originalIndex = quiz.questions[currentQuestion].originalIndex !== undefined 
      ? quiz.questions[currentQuestion].originalIndex 
      : currentQuestion;
      
    trackQuestionProgress(courseId, weekId, originalIndex, correct);
  };

  // Move to the next question
  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setAnswered(false);
      setIsCorrect(false);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  // Reset the quiz with new shuffled questions
  const handleRestartQuiz = async () => {
    try {
      setLoading(true);
      setQuizCompleted(false);
      setCurrentQuestion(0);
      setSelectedOption(null);
      setAnswered(false);
      setIsCorrect(false);
      setScore(0);
      setStreakCount(0);
      
      // Get a new shuffled quiz
      const quizData = await loadQuiz(courseId, weekId);
      const needPracticeIndices = await getQuestionsNeedingPractice(courseId, weekId);
      const quizWithRepeats = addQuestionsNeedingPractice(quizData, needPracticeIndices);
      const shuffledQuiz = createShuffledQuiz(quizWithRepeats);
      
      setQuiz(shuffledQuiz);
      setLoading(false);
    } catch (err) {
      console.error('Error restarting quiz:', err);
      setError(`Failed to restart quiz. ${err.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FaSpinner className="animate-spin text-primary-500 text-4xl mb-4" />
        <p className="text-gray-600">Loading quiz...</p>
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
            onClick={() => navigate(`/course/${courseId}`)}
            className="btn-outline border-red-500 text-red-500 hover:bg-red-50"
          >
            Back to Course
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

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-8 rounded-lg">
        <p className="text-center">No questions available for this quiz.</p>
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => navigate(`/course/${courseId}`)}
            className="btn-primary"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <QuizCompletedScreen 
        score={score} 
        totalQuestions={quiz.questions.length}
        onRestart={handleRestartQuiz}
        onBackToCourse={() => navigate(`/course/${courseId}`)}
        showConfetti={showConfetti}
      />
    );
  }

  const question = quiz.questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(`/course/${courseId}`)}
          className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
          aria-label="Back to course"
        >
          <FaArrowLeft />
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500">
            Question {currentQuestion + 1}/{quiz.questions.length}
          </span>
          
          {streakCount >= 2 && (
            <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <FaFire className="mr-1 text-amber-500" />
              <span>Streak: {streakCount}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
        <div 
          className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {question.question}
            </h2>
            
            {question.isRepeated && (
              <div className="mb-4 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
                <FaRedo className="inline-block mr-2" />
                <span>This question needs more practice.</span>
              </div>
            )}
          </div>
          
          {/* Options */}
          <div className="space-y-4 mb-8">
            {question.options.map((option, index) => (
              <button
                key={`${getQuestionKey(question, currentQuestion)}-option-${index}`}
                className={`option-btn ${
                  selectedOption === index 
                    ? isCorrect 
                      ? 'correct' 
                      : 'incorrect'
                    : answered && index === question.correctAnswer
                      ? 'correct'
                      : ''
                }`}
                onClick={() => handleOptionSelect(index)}
                disabled={answered}
              >
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <span>{option}</span>
                </div>
                
                {answered && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {index === question.correctAnswer && (
                      <FaCheck className="text-green-500 text-xl" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-500">
          Score: {score}/{currentQuestion + (answered ? 1 : 0)}
        </div>
        
        <div className="flex space-x-4">
          <button
            className={`btn-primary flex items-center ${!answered ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleNextQuestion}
            disabled={!answered}
          >
            {currentQuestion < quiz.questions.length - 1 ? (
              <>
                <span>Next Question</span>
                <FaChevronRight className="ml-2" />
              </>
            ) : (
              <>
                <span>Finish Quiz</span>
                <FaListAlt className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuizCompletedScreen = ({ score, totalQuestions, onRestart, onBackToCourse, showConfetti }) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  let message, messageColor;
  
  if (percentage >= 90) {
    message = "Excellent! You're a master!";
    messageColor = "text-green-600";
  } else if (percentage >= 70) {
    message = "Great job! You've got this!";
    messageColor = "text-blue-600";
  } else if (percentage >= 50) {
    message = "Good effort! Keep practicing!";
    messageColor = "text-amber-600";
  } else {
    message = "Keep practicing! You'll get better!";
    messageColor = "text-orange-600";
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
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Quiz Completed!</h2>
        
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
                className="text-primary-500" 
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
              <span className="text-gray-500 text-sm">Score</span>
            </div>
          </div>
          
          <p className="text-xl font-medium mt-4 mb-2">
            You scored <span className="text-primary-600 font-bold">{score}</span> out of <span className="font-bold">{totalQuestions}</span>
          </p>
          <p className={`text-lg ${messageColor} font-medium`}>
            {message}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={onBackToCourse}
            className="btn-outline"
          >
            <FaChevronLeft className="mr-2" />
            Back to Course
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

export default QuizPage; 
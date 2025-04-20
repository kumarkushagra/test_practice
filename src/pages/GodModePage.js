import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaRedo
} from 'react-icons/fa';
import { getAllQuestions } from '../services/quizService';
import { shuffleArray, getQuestionKey } from '../utils/arrayUtils';
import Confetti from 'react-confetti';

const GodModePage = () => {
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
  const navigate = useNavigate();

  // Number of questions to use in GOD MODE
  const maxQuestionsInGodMode = 25;

  useEffect(() => {
    const fetchAndPrepareQuestions = async () => {
      try {
        setLoading(true);
        // Get all questions from all courses
        const allQuestions = await getAllQuestions();
        
        if (allQuestions.length === 0) {
          setError('No questions available. Try uploading some questions first.');
          setLoading(false);
          return;
        }
        
        // Shuffle all questions
        const shuffledQuestions = shuffleArray(allQuestions);
        
        // Take a subset of questions for GOD MODE
        const godModeQuestions = shuffledQuestions.slice(0, Math.min(maxQuestionsInGodMode, shuffledQuestions.length));
        
        // For each question, shuffle its options
        const processedQuestions = godModeQuestions.map(question => {
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
            correctAnswer: newCorrectAnswer
          };
        });
        
        setQuestions(processedQuestions);
        setLoading(false);
      } catch (err) {
        console.error('Error preparing GOD MODE questions:', err);
        setError(`Failed to load questions. ${err.message}`);
        setLoading(false);
      }
    };

    fetchAndPrepareQuestions();
  }, []);

  const handleOptionSelect = (optionIndex) => {
    if (answered) return;
    
    setSelectedOption(optionIndex);
    setAnswered(true);
    
    const correct = optionIndex === questions[currentQuestion].correctAnswer;
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
    } else {
      setCurrentStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
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
      
      // Get all questions again and reshuffle
      const allQuestions = await getAllQuestions();
      const shuffledQuestions = shuffleArray(allQuestions);
      const godModeQuestions = shuffledQuestions.slice(0, Math.min(maxQuestionsInGodMode, shuffledQuestions.length));
      
      // Process questions again
      const processedQuestions = godModeQuestions.map(question => {
        const optionIndices = [...Array(question.options.length).keys()];
        const shuffledIndices = shuffleArray(optionIndices);
        const shuffledOptions = shuffledIndices.map(i => question.options[i]);
        const newCorrectAnswer = shuffledIndices.indexOf(question.correctAnswer);
        
        return {
          ...question,
          options: shuffledOptions,
          correctAnswer: newCorrectAnswer
        };
      });
      
      setQuestions(processedQuestions);
      setLoading(false);
    } catch (err) {
      console.error('Error restarting GOD MODE:', err);
      setError(`Failed to restart quiz. ${err.message}`);
      setLoading(false);
    }
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
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-8 rounded-lg">
        <p className="text-center">No questions available for GOD MODE. Try uploading some questions first.</p>
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

  if (quizCompleted) {
    return (
      <GodModeCompletedScreen 
        score={score} 
        totalQuestions={questions.length}
        maxStreak={maxStreak}
        onRestart={handleRestartQuiz}
        onBackToHome={() => navigate('/')}
        showConfetti={showConfetti}
      />
    );
  }

  const question = questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
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
        
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <FaStar className="mr-1 text-amber-500" />
            <span>Current Streak: {currentStreak}</span>
          </div>
          
          {maxStreak > 0 && (
            <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <FaStar className="mr-1 text-purple-500" />
              <span>Max Streak: {maxStreak}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Source information for current question */}
      <div className="mb-4 bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-600 flex items-center">
        <FaInfoCircle className="mr-2 text-gray-500" />
        <span>
          From <strong>{question.source?.courseName || 'Unknown'}</strong> - <strong>{question.source?.weekName || 'Unknown'}</strong>
        </span>
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
          </div>
          
          {/* Options */}
          <div className="space-y-4 mb-8">
            {question.options.map((option, index) => (
              <button
                key={`${getQuestionKey(question, currentQuestion)}-option-${index}`}
                className={`option-btn relative ${
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
                    {index === question.correctAnswer ? (
                      <FaCheck className="text-green-500 text-xl" />
                    ) : selectedOption === index ? (
                      <FaTimes className="text-red-500 text-xl" />
                    ) : null}
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
            className={`btn-primary bg-gradient-to-r from-amber-500 to-red-600 flex items-center ${!answered ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleNextQuestion}
            disabled={!answered}
          >
            {currentQuestion < questions.length - 1 ? (
              <>
                <span>Next Question</span>
                <FaChevronRight className="ml-2" />
              </>
            ) : (
              <>
                <span>Finish GOD MODE</span>
                <FaBolt className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const GodModeCompletedScreen = ({ score, totalQuestions, maxStreak, onRestart, onBackToHome, showConfetti }) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  let message, messageColor, rank;
  
  if (percentage >= 90) {
    message = "Incredible! You've mastered GOD MODE!";
    messageColor = "text-amber-600";
    rank = "Divine Master";
  } else if (percentage >= 75) {
    message = "Amazing performance! Almost godlike!";
    messageColor = "text-purple-600";
    rank = "Demi-God";
  } else if (percentage >= 60) {
    message = "Great effort! You're getting closer to divinity!";
    messageColor = "text-blue-600";
    rank = "Ascendant";
  } else if (percentage >= 40) {
    message = "Good try! Keep practicing for godhood!";
    messageColor = "text-green-600";
    rank = "Mortal Plus";
  } else {
    message = "The path to godhood is challenging. Keep trying!";
    messageColor = "text-red-600";
    rank = "Mortal";
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-10">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} gravity={0.05} />}
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full mx-auto text-center"
      >
        <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-600">
          GOD MODE Completed!
        </h2>
        <h3 className="text-xl font-semibold mb-6 text-gray-700">Your rank: {rank}</h3>
        
        <div className="mb-8">
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
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
                stroke="url(#scoreGradient)" 
                strokeWidth="8" 
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
              <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-600">
                {percentage}%
              </span>
              <span className="text-gray-500 text-sm">Score</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-sm mb-1">Total Score</p>
              <p className="text-2xl font-bold text-gray-800">{score}/{totalQuestions}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-amber-600 text-sm mb-1">Max Streak</p>
              <p className="text-2xl font-bold text-amber-600">{maxStreak}</p>
            </div>
          </div>
          
          <p className={`text-lg ${messageColor} font-medium mt-6`}>
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
            onClick={onRestart}
            className="bg-gradient-to-r from-amber-500 to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
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
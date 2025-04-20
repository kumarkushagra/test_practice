/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} - A new shuffled array without modifying the original
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Creates a shuffled version of a quiz's questions and options
 * @param {Object} quiz - The quiz object with questions
 * @returns {Object} - A new quiz object with shuffled questions and options
 */
export const createShuffledQuiz = (quiz) => {
  if (!quiz || !quiz.questions) {
    return quiz;
  }
  
  // Create a deep copy of the quiz
  const shuffledQuiz = {
    ...quiz,
    questions: []
  };
  
  // Shuffle the questions array order
  const shuffledQuestionIndices = shuffleArray([...Array(quiz.questions.length).keys()]);
  
  // For each question, shuffle the options while tracking the correct answer
  shuffledQuestionIndices.forEach(idx => {
    const originalQuestion = quiz.questions[idx];
    
    // Create a mapping to track the original positions
    const optionsMapping = [...Array(originalQuestion.options.length).keys()];
    
    // Shuffle the mapping
    const shuffledMapping = shuffleArray(optionsMapping);
    
    // Create the new options array in shuffled order
    const shuffledOptions = shuffledMapping.map(i => originalQuestion.options[i]);
    
    // Find where the correct answer moved to
    const newCorrectAnswerIndex = shuffledMapping.indexOf(originalQuestion.correctAnswer);
    
    // Add the shuffled question to the new quiz
    shuffledQuiz.questions.push({
      ...originalQuestion,
      options: shuffledOptions,
      correctAnswer: newCorrectAnswerIndex,
      originalIndex: idx // Keep track of the original index for reference
    });
  });
  
  return shuffledQuiz;
};

/**
 * Processes a quiz to add questions that need more practice
 * @param {Object} quiz - The quiz object
 * @param {Array} questionIndices - The indices of questions that need more practice
 * @returns {Object} - A new quiz with repeated questions
 */
export const addQuestionsNeedingPractice = (quiz, questionIndices) => {
  if (!quiz || !quiz.questions || !questionIndices || questionIndices.length === 0) {
    return quiz;
  }
  
  // Create a deep copy of the quiz
  const enhancedQuiz = {
    ...quiz,
    questions: [...quiz.questions]
  };
  
  // Add questions that need practice (but not too many times)
  const maxRepetitions = 2; // Don't repeat more than twice
  const questionsToAdd = [];
  
  questionIndices.forEach(idx => {
    // Make sure the index is valid
    if (idx >= 0 && idx < quiz.questions.length) {
      // Add the question 1-2 times based on a weighted random
      const repetitions = Math.floor(Math.random() * maxRepetitions) + 1;
      
      for (let i = 0; i < repetitions; i++) {
        questionsToAdd.push({
          ...quiz.questions[idx],
          isRepeated: true,
          originalIndex: idx
        });
      }
    }
  });
  
  // Add these questions to the quiz
  enhancedQuiz.questions = [...enhancedQuiz.questions, ...questionsToAdd];
  
  return enhancedQuiz;
};

/**
 * Gets a unique key for a question based on its content
 * Useful for React key props when the same question might appear multiple times
 * @param {Object} question - The question object
 * @param {number} index - The current index in the array
 * @returns {string} - A unique key
 */
export const getQuestionKey = (question, index) => {
  if (!question) return `question-${index}`;
  
  // Use originalIndex if available (for repeated questions)
  const originalIndex = question.originalIndex !== undefined ? question.originalIndex : index;
  
  // Create a unique-ish key based on the question text and index
  const questionHash = question.question
    ? `${question.question.substring(0, 10).replace(/\s+/g, '')}`
    : '';
  
  return `question-${originalIndex}-${questionHash}-${index}`;
}; 
/**
 * Service for handling quiz data and interaction with the database (JSON files)
 */

// Constants for storage keys
const STORAGE_KEYS = {
  COURSES: 'mcq_courses',
  QUESTIONS: 'mcq_questions',
  USER_HISTORY: 'mcq_user_history'
};

/**
 * Get all available courses
 * @returns {Promise<Array>} - Array of course objects
 */
export const getCourses = async () => {
  try {
    // First check local storage
    const storedCourses = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (storedCourses) {
      return JSON.parse(storedCourses);
    }
    
    // If not in local storage, try to discover all courses from the db directory
    const coursesList = [];
    
    try {
      // We'll try to access the public/db/courses directory to discover courses
      const response = await fetch('/db/courses/');
      if (!response.ok) {
        // If we can't access the directory, use the cog_psy course as a fallback
        const cogPsyCourse = {
          id: 'cog_psy',
          name: 'Cognitive Psychology',
          description: 'Explore the principles of cognitive psychology',
          weeks: []
        };
        
        // Try to discover the weeks available for cog_psy
        const weeksResponse = await fetchWeeksForCourse('cog_psy');
        cogPsyCourse.weeks = weeksResponse.weeks;
        cogPsyCourse.totalQuestions = weeksResponse.totalQuestions;
        
        coursesList.push(cogPsyCourse);
      } else {
        // Here in a real app we would parse the directory listing
        // Since we can't easily do that in a browser, we'll just check for cog_psy
        const cogPsyCourse = {
          id: 'cog_psy',
          name: 'Cognitive Psychology',
          description: 'Explore the principles of cognitive psychology',
          weeks: []
        };
        
        // Try to discover the weeks available for cog_psy
        const weeksResponse = await fetchWeeksForCourse('cog_psy');
        cogPsyCourse.weeks = weeksResponse.weeks;
        cogPsyCourse.totalQuestions = weeksResponse.totalQuestions;
        
        coursesList.push(cogPsyCourse);
      }
    } catch (error) {
      console.error('Error discovering courses:', error);
      // Fall back to just the cog_psy course
      const cogPsyCourse = {
        id: 'cog_psy',
        name: 'Cognitive Psychology',
        description: 'Explore the principles of cognitive psychology',
        weeks: [
          { id: 'week1', name: 'Week 1', questionCount: 10 },
          { id: 'week2', name: 'Week 2', questionCount: 10 },
          { id: 'week3', name: 'Week 3', questionCount: 10 }
        ],
        totalQuestions: 30
      };
      coursesList.push(cogPsyCourse);
    }
    
    // Save to local storage for future use
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(coursesList));
    return coursesList;
  } catch (error) {
    console.error('Error getting courses:', error);
    return [];
  }
};

/**
 * Fetch weeks available for a course by checking available JSON files
 * @param {string} courseId - The course ID
 * @returns {Promise<Object>} - Object with weeks array and totalQuestions
 */
const fetchWeeksForCourse = async (courseId) => {
  const weeks = [];
  let totalQuestions = 0;
  
  try {
    // Try both potential locations for json files
    for (let i = 1; i <= 12; i++) {
      const weekId = `week${i}`;
      
      // Try the db/courses path first
      try {
        const response = await fetch(`/db/courses/${courseId}/${weekId}.json`);
        if (response.ok) {
          const data = await response.json();
          const questionCount = data.questions ? data.questions.length : 0;
          weeks.push({
            id: weekId,
            name: `Week ${i}`,
            questionCount
          });
          totalQuestions += questionCount;
          continue; // If found, move to next week
        }
      } catch {
        // Suppress error and try next location
      }
      
      // Try the json/cog_psy path next
      try {
        const response = await fetch(`/json/${courseId}/${weekId}.json`);
        if (response.ok) {
          const data = await response.json();
          const questionCount = data.questions ? data.questions.length : 0;
          weeks.push({
            id: weekId,
            name: `Week ${i}`,
            questionCount
          });
          totalQuestions += questionCount;
        }
      } catch {
        // If not found in either location, just continue to next week
      }
    }
  } catch (error) {
    console.error(`Error fetching weeks for course ${courseId}:`, error);
  }
  
  return { weeks, totalQuestions };
};

/**
 * Get details for a specific course
 * @param {string} courseId - The ID of the course
 * @returns {Promise<Object>} - Course details
 */
export const getCourseDetails = async (courseId) => {
  try {
    const courses = await getCourses();
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      throw new Error(`Course with ID "${courseId}" not found`);
    }
    
    return course;
  } catch (error) {
    console.error('Error getting course details:', error);
    throw error;
  }
};

/**
 * Loads a quiz from one of the potential JSON file locations or local storage
 * @param {string} courseId - The course ID
 * @param {string} weekId - The week ID
 * @returns {Promise<Object>} - The quiz data
 */
export const loadQuiz = async (courseId, weekId) => {
  const quizId = `${courseId}/${weekId}`;
  
  try {
    // Check if we have the data in local storage
    const storedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (storedQuestions) {
      const questionsMap = JSON.parse(storedQuestions);
      if (questionsMap[quizId]) {
        return questionsMap[quizId];
      }
    }
    
    // Try to load from one of the potential locations
    let quizData;
    
    // Try db/courses path first
    try {
      const response = await fetch(`/db/courses/${courseId}/${weekId}.json`);
      if (response.ok) {
        quizData = await response.json();
      }
    } catch (error) {
      console.log(`Could not load from /db/courses/${courseId}/${weekId}.json, trying alternate location`);
    }
    
    // If not found, try json directory
    if (!quizData) {
      try {
        const response = await fetch(`/json/${courseId}/${weekId}.json`);
        if (response.ok) {
          quizData = await response.json();
        }
      } catch (error) {
        console.log(`Could not load from /json/${courseId}/${weekId}.json either`);
      }
    }
    
    if (!quizData) {
      throw new Error(`Failed to load quiz from any location: ${quizId}`);
    }
    
    // Store it in local storage for future use
    const questionsMap = storedQuestions ? JSON.parse(storedQuestions) : {};
    questionsMap[quizId] = quizData;
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questionsMap));
    
    return quizData;
  } catch (error) {
    console.error('Error loading quiz:', error);
    throw new Error('Failed to load quiz data');
  }
};

/**
 * Get all questions from all weeks for all courses (for GOD MODE)
 * @returns {Promise<Array>} - Array of questions with course and week info
 */
export const getAllQuestions = async () => {
  try {
    const courses = await getCourses();
    const allQuestions = [];
    
    // Get all stored questions from local storage
    const storedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const questionsMap = storedQuestions ? JSON.parse(storedQuestions) : {};
    
    // For each course, load all weeks
    for (const course of courses) {
      for (const week of course.weeks) {
        const quizId = `${course.id}/${week.id}`;
        
        try {
          let weekQuizData;
          
          // Try local storage first
          if (questionsMap[quizId]) {
            weekQuizData = questionsMap[quizId];
          } else {
            // Otherwise, load the quiz
            weekQuizData = await loadQuiz(course.id, week.id);
          }
          
          // If we have questions, add them to the collection with metadata
          if (weekQuizData && weekQuizData.questions) {
            // Add source information to each question to trace it back to the course/week
            const questionsWithSource = weekQuizData.questions.map(q => ({
              ...q,
              source: {
                courseId: course.id,
                courseName: course.name,
                weekId: week.id,
                weekName: week.name
              }
            }));
            
            allQuestions.push(...questionsWithSource);
          }
        } catch (error) {
          console.warn(`Could not load questions for ${quizId}:`, error);
        }
      }
    }
    
    return allQuestions;
  } catch (error) {
    console.error('Error getting all questions:', error);
    return [];
  }
};

/**
 * Save a new JSON file to a course
 * @param {string} courseId - The course ID (existing or new)
 * @param {string} courseName - The display name for the course (if new)
 * @param {Object} jsonData - The JSON data containing questions
 * @returns {Promise<Object>} - The updated or new course
 */
export const saveJsonToCourse = async (courseId, courseName, jsonData) => {
  try {
    // Validate JSON structure first
    const validation = validateQuizFormat(jsonData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    // Get current courses
    const courses = await getCourses();
    
    // Format the course ID if it's a new course (lowercase, replace spaces with underscores)
    const formattedCourseId = courseId.toLowerCase().replace(/\s+/g, '_');
    
    let course = courses.find(c => c.id === formattedCourseId);
    let isNewCourse = false;
    
    // Get current stored questions
    const storedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const questionsMap = storedQuestions ? JSON.parse(storedQuestions) : {};
    
    if (!course) {
      // Create a new course
      isNewCourse = true;
      course = {
        id: formattedCourseId,
        name: courseName || courseId, // Use provided course name or ID as fallback
        description: jsonData.title || `Questions about ${courseName || courseId}`,
        weeks: [],
        totalQuestions: 0
      };
      courses.push(course);
    }
    
    // Determine the next week number
    const weekNumber = course.weeks.length + 1;
    const weekId = `week${weekNumber}`;
    
    // Add the new week to the course
    course.weeks.push({
      id: weekId,
      name: `Week ${weekNumber}`,
      questionCount: jsonData.questions.length
    });
    
    course.totalQuestions = (course.totalQuestions || 0) + jsonData.questions.length;
    
    // Store the quiz data in the questions map
    const quizId = `${formattedCourseId}/${weekId}`;
    questionsMap[quizId] = jsonData;
    
    // Update local storage
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questionsMap));
    
    // Also attempt to save to the server's file system
    try {
      // In a real application, this would be an API call to save to server
      console.log(`[SERVER SAVE] Would save JSON data to /db/courses/${formattedCourseId}/${weekId}.json`);
      // For demonstration, we'll just log the data
      console.log('JSON data to save:', jsonData);
      
      // We can't actually write to the file system directly from the browser
      // This would require server-side code (e.g., a Node.js API endpoint)
    } catch (saveError) {
      console.error('Error saving to server (would actually save in a real app):', saveError);
    }
    
    return { course, isNewCourse, weekId };
  } catch (error) {
    console.error('Error saving JSON to course:', error);
    throw error;
  }
};

/**
 * Validates a quiz JSON format
 * @param {Object} quiz - The quiz data to validate
 * @returns {Object} - Result with isValid flag and error message if invalid
 */
export const validateQuizFormat = (quiz) => {
  const result = { isValid: true, error: null };
  
  // Make sure it's an object
  if (!quiz || typeof quiz !== 'object') {
    result.isValid = false;
    result.error = 'Invalid quiz format: must be a JSON object';
    return result;
  }
  
  // Check if the quiz has a title and questions array
  if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
    result.isValid = false;
    result.error = 'Invalid quiz format: missing title or questions array';
    return result;
  }
  
  // Check if questions have the required properties
  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i];
    if (!q.question || !q.options || !Array.isArray(q.options) || 
        q.options.length < 2 || q.correctAnswer === undefined) {
      result.isValid = false;
      result.error = `Question #${i+1} has invalid format`;
      return result;
    }
    
    // Verify correctAnswer is a valid index
    if (typeof q.correctAnswer !== 'number' || 
        q.correctAnswer < 0 || 
        q.correctAnswer >= q.options.length) {
      result.isValid = false;
      result.error = `Question #${i+1} has an invalid correctAnswer index`;
      return result;
    }
  }
  
  return result;
};

/**
 * Track user progress on quizzes
 * @param {string} courseId - The course ID
 * @param {string} weekId - The week ID
 * @param {number} questionId - The index of the question
 * @param {boolean} isCorrect - Whether the answer was correct
 */
export const trackQuestionProgress = (courseId, weekId, questionId, isCorrect) => {
  try {
    const historyKey = `${courseId}/${weekId}`;
    const storedHistory = localStorage.getItem(STORAGE_KEYS.USER_HISTORY);
    const historyMap = storedHistory ? JSON.parse(storedHistory) : {};
    
    // Initialize if not exists
    if (!historyMap[historyKey]) {
      historyMap[historyKey] = {};
    }
    
    // Update the question's history (store number of correct/incorrect attempts)
    if (!historyMap[historyKey][questionId]) {
      historyMap[historyKey][questionId] = { correct: 0, incorrect: 0 };
    }
    
    if (isCorrect) {
      historyMap[historyKey][questionId].correct += 1;
    } else {
      historyMap[historyKey][questionId].incorrect += 1;
    }
    
    // Store back to localStorage
    localStorage.setItem(STORAGE_KEYS.USER_HISTORY, JSON.stringify(historyMap));
  } catch (error) {
    console.error('Error tracking question progress:', error);
  }
};

/**
 * Get questions that need more practice (those with incorrect answers)
 * @param {string} courseId - The course ID
 * @param {string} weekId - The week ID
 * @returns {Promise<Array>} - Array of question indices that need more practice
 */
export const getQuestionsNeedingPractice = async (courseId, weekId) => {
  try {
    const historyKey = `${courseId}/${weekId}`;
    const storedHistory = localStorage.getItem(STORAGE_KEYS.USER_HISTORY);
    
    if (!storedHistory) {
      return []; // No history yet
    }
    
    const historyMap = JSON.parse(storedHistory);
    const quizHistory = historyMap[historyKey];
    
    if (!quizHistory) {
      return []; // No history for this quiz
    }
    
    // Get the questions with incorrect answers
    const needPractice = [];
    
    for (const [questionId, stats] of Object.entries(quizHistory)) {
      // Add to practice list if:
      // 1. Has at least one incorrect answer
      // 2. Number of correct answers is not significantly greater than incorrect
      if (stats.incorrect > 0 && stats.correct < stats.incorrect * 2) {
        needPractice.push(parseInt(questionId, 10));
      }
    }
    
    return needPractice;
  } catch (error) {
    console.error('Error getting questions needing practice:', error);
    return [];
  }
}; 
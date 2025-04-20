import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft,
  FaUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaCode,
  FaBook,
  FaPlus,
  FaRobot,
  FaExclamationTriangle
} from 'react-icons/fa';
import { getCourses, validateQuizFormat, saveJsonToCourse, checkFileExists } from '../services/quizService';

const UploadPage = () => {
  const [step, setStep] = useState('input'); // 'input', 'select', 'success', 'conflict'
  const [jsonInput, setJsonInput] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [jsonError, setJsonError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [uploadChoice, setUploadChoice] = useState(''); // 'new' or 'existing'
  const [saveResult, setSaveResult] = useState(null);
  const [weekNumber, setWeekNumber] = useState(1);
  const [fileExists, setFileExists] = useState(false);
  const [conflictWeekId, setConflictWeekId] = useState('');
  const navigate = useNavigate();

  // Load existing courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const coursesData = await getCourses();
        setCourses(coursesData);
        setLoadingCourses(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // When course selection changes, update the default week number
  useEffect(() => {
    if (selectedCourseId && uploadChoice === 'existing') {
      const selectedCourse = courses.find(c => c.id === selectedCourseId);
      if (selectedCourse && selectedCourse.weeks && selectedCourse.weeks.length > 0) {
        // Set default week number to the next available week
        setWeekNumber(selectedCourse.weeks.length + 1);
      } else {
        setWeekNumber(1);
      }
    } else {
      setWeekNumber(1);
    }
  }, [selectedCourseId, uploadChoice, courses]);

  // Handle JSON input validation
  const handleJsonValidate = () => {
    try {
      setJsonError(null);
      if (!jsonInput.trim()) {
        setJsonError('Please enter JSON data');
        return;
      }
      
      const parsed = JSON.parse(jsonInput);
      
      // Validate the format
      const validation = validateQuizFormat(parsed);
      if (!validation.isValid) {
        setJsonError(validation.error);
        return;
      }
      
      // Set the validated data and move to next step
      setJsonData(parsed);
      setStep('select');
    } catch (err) {
      setJsonError(`Invalid JSON format: ${err.message}`);
    }
  };

  // Handle upload choice selection
  const handleUploadChoiceSelect = (choice) => {
    setUploadChoice(choice);
    if (choice === 'existing' && courses.length === 1) {
      // If there's only one course, select it automatically
      setSelectedCourseId(courses[0].id);
    }
  };

  // Check if a file exists for the selected course and week
  const checkForExistingFile = async () => {
    try {
      const courseId = uploadChoice === 'new' 
        ? newCourseName.toLowerCase().replace(/\s+/g, '_')
        : selectedCourseId;
      
      const weekId = `week${weekNumber}`;
      
      // Check if this week already exists
      const exists = await checkFileExists(courseId, weekId);
      
      if (exists) {
        setFileExists(true);
        setConflictWeekId(weekId);
        setStep('conflict');
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error checking file existence:', err);
      return false;
    }
  };

  // Handle course selection or creation
  const handleSaveJson = async () => {
    try {
      setJsonError(null);
      
      if (uploadChoice === 'new' && !newCourseName.trim()) {
        setJsonError('Please enter a course name');
        return;
      }
      
      if (uploadChoice === 'existing' && !selectedCourseId) {
        setJsonError('Please select a course');
        return;
      }
      
      if (weekNumber < 1 || weekNumber > 99) {
        setJsonError('Week number must be between 1 and 99');
        return;
      }
      
      // Check if file already exists
      const fileAlreadyExists = await checkForExistingFile();
      if (fileAlreadyExists) {
        return; // Handled in the conflict resolution screen
      }
      
      // Proceed with saving
      const courseId = uploadChoice === 'new' ? newCourseName : selectedCourseId;
      const courseName = uploadChoice === 'new' ? newCourseName : courses.find(c => c.id === selectedCourseId)?.name || '';
      
      const result = await saveJsonToCourse(courseId, courseName, jsonData, weekNumber);
      setSaveResult(result);
      setStep('success');
    } catch (err) {
      setJsonError(`Error saving quiz: ${err.message}`);
    }
  };

  // Handle conflict resolution
  const handleConflictResolution = async (shouldReplace) => {
    try {
      if (shouldReplace) {
        // User chose to replace the file, proceed with save
        const courseId = uploadChoice === 'new' ? newCourseName : selectedCourseId;
        const courseName = uploadChoice === 'new' ? newCourseName : courses.find(c => c.id === selectedCourseId)?.name || '';
        
        const result = await saveJsonToCourse(courseId, courseName, jsonData, weekNumber, true);
        setSaveResult(result);
        setStep('success');
      } else {
        // User chose not to replace, go back to selection
        setStep('select');
      }
    } catch (err) {
      setJsonError(`Error handling conflict: ${err.message}`);
      setStep('select');
    }
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
        <h1 className="text-3xl font-bold text-gray-800">Upload Quiz</h1>
      </div>

      {/* JSON Format Guide */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
          <FaInfoCircle className="text-primary-500 mr-2" />
          JSON Format Specification
        </h2>
        
        <p className="mb-4 text-gray-600">
          Your JSON file should follow this format:
        </p>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-4 overflow-x-auto">
          <pre className="text-gray-100 text-sm">
{`{
  "title": "Course Title or Week Topic",
  "questions": [
    {
      "question": "What is the question text?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 2  // Index of the correct option (0-based)
    },
    // More questions...
  ]
}`}
          </pre>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <FaRobot className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
            <div>
              <p className="text-blue-700 font-medium mb-2">GPT Conversion Tip</p>
              <p className="text-blue-600 text-sm">
                Upload your PDF to GPT and use this prompt: "Extract all the multiple-choice questions from this PDF. For each question, include the question text, all answer options, and indicate the correct answer. Format the output as a JSON object with this exact structure:
                {`
                  "title": "Quiz Title",
                  "questions": [
                    {
                      "question": "Question text",
                      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                      "correctAnswer": 2  // 0-based index of correct answer
                    }
                  ]
                `}
                Make sure to properly escape any special characters, use proper JSON formatting with double quotes, and ensure the correctAnswer is the 0-based index of the correct option."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Location Info */}
      <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-200">
        <div className="flex items-start">
          <FaInfoCircle className="text-primary-500 mr-2 mt-1 flex-shrink-0" />
          <div>
            <p className="text-gray-700 font-medium">Where uploads are stored:</p>
            <p className="text-gray-600 text-sm">
              Server: <code className="bg-gray-100 px-1 rounded">/public/db/courses/{"{courseId}"}/{"{weekId}"}.json</code><br />
              Browser: Also saved in your browser's localStorage for offline access
            </p>
          </div>
        </div>
      </div>

      {step === 'input' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 gap-6"
        >
          <div>
            <label htmlFor="jsonInput" className="block text-gray-700 font-medium mb-2">
              Paste your JSON here:
            </label>
            <textarea
              id="jsonInput"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"title": "My Quiz", "questions": [...]}'
              className="w-full h-60 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:border-primary-500 focus:ring-primary-500 focus:ring-1 focus:outline-none"
            />
            
            {jsonError && (
              <div className="mt-2 text-red-600 flex items-start">
                <FaTimesCircle className="mr-1 mt-1 flex-shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleJsonValidate}
              className="btn-primary flex items-center"
            >
              <FaCode className="mr-2" />
              <span>Validate & Continue</span>
            </button>
          </div>
        </motion.div>
      )}

      {step === 'select' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-green-50 p-4 rounded-lg mb-6 flex items-center border border-green-200">
            <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
            <div>
              <p className="text-green-700 font-medium">Valid JSON Format</p>
              <p className="text-green-600 text-sm">
                Found {jsonData?.questions?.length} questions in "{jsonData?.title}"
              </p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Where would you like to add these questions?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <UploadChoiceCard
              title="Create a New Course"
              description="Create a completely new course with these questions"
              icon={<FaPlus />}
              isSelected={uploadChoice === 'new'}
              onClick={() => handleUploadChoiceSelect('new')}
            />
            
            <UploadChoiceCard
              title="Add to Existing Course"
              description={`Add to one of your ${courses.length} existing courses`}
              icon={<FaBook />}
              isSelected={uploadChoice === 'existing'}
              onClick={() => handleUploadChoiceSelect('existing')}
              disabled={courses.length === 0}
            />
          </div>
          
          {uploadChoice === 'new' && (
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <label htmlFor="newCourseName" className="block text-gray-700 font-medium mb-2">
                New Course Name:
              </label>
              <input
                id="newCourseName"
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="Enter course name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 focus:ring-1 focus:outline-none mb-4"
              />
              
              <label htmlFor="weekNumber" className="block text-gray-700 font-medium mb-2">
                Week Number:
              </label>
              <input
                id="weekNumber"
                type="number"
                min="1"
                max="99"
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 focus:ring-1 focus:outline-none"
              />
            </div>
          )}
          
          {uploadChoice === 'existing' && (
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <label htmlFor="courseSelect" className="block text-gray-700 font-medium mb-2">
                Select Course:
              </label>
              <select
                id="courseSelect"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 focus:ring-1 focus:outline-none mb-4"
              >
                <option value="">-- Select a Course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.weeks.length} weeks, {course.totalQuestions} questions)
                  </option>
                ))}
              </select>
              
              <label htmlFor="weekNumber" className="block text-gray-700 font-medium mb-2">
                Week Number:
              </label>
              <input
                id="weekNumber"
                type="number"
                min="1"
                max="99"
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 focus:ring-1 focus:outline-none"
              />
            </div>
          )}
          
          {jsonError && (
            <div className="mt-2 mb-4 text-red-600 flex items-start">
              <FaTimesCircle className="mr-1 mt-1 flex-shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={() => setStep('input')}
              className="btn-outline flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              <span>Back</span>
            </button>
            
            <button
              onClick={handleSaveJson}
              disabled={!uploadChoice || (uploadChoice === 'new' && !newCourseName) || (uploadChoice === 'existing' && !selectedCourseId)}
              className={`btn-primary flex items-center ${
                !uploadChoice || (uploadChoice === 'new' && !newCourseName) || (uploadChoice === 'existing' && !selectedCourseId)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <FaUpload className="mr-2" />
              <span>Save Questions</span>
            </button>
          </div>
        </motion.div>
      )}

      {step === 'conflict' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 mb-6"
        >
          <div className="flex items-center mb-4 text-yellow-700">
            <FaExclamationTriangle className="text-2xl mr-3 text-yellow-500" />
            <h2 className="text-xl font-semibold">File Already Exists!</h2>
          </div>
          
          <p className="mb-6 text-gray-700">
            A file for Week {weekNumber} already exists for this course. Would you like to replace it with your new data or cancel?
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleConflictResolution(false)}
              className="btn-outline border-yellow-500 text-yellow-700"
            >
              <FaArrowLeft className="mr-2" />
              Cancel & Go Back
            </button>
            <button 
              onClick={() => handleConflictResolution(true)}
              className="btn-primary bg-yellow-500 hover:bg-yellow-600"
            >
              <FaUpload className="mr-2" />
              Replace Existing File
            </button>
          </div>
        </motion.div>
      )}
      
      {step === 'success' && saveResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <FaCheckCircle className="text-green-500 text-3xl" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Upload Successful!</h2>
          
          <p className="text-lg text-gray-600 mb-6">
            {saveResult.isNewCourse 
              ? `Created new course "${saveResult.course.name}" with Week ${weekNumber}`
              : `Added Week ${weekNumber} to "${saveResult.course.name}"`}
          </p>
          
          <p className="text-gray-500 mb-8">
            {jsonData?.questions?.length} questions have been added and are now available for practice.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/')}
              className="btn-outline"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </button>
            <button 
              onClick={() => navigate(`/course/${saveResult.course.id}`)}
              className="btn-primary"
            >
              <FaBook className="mr-2" />
              Go to Course
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const UploadChoiceCard = ({ title, description, icon, isSelected, onClick, disabled }) => (
  <div
    className={`relative rounded-xl p-6 transition-all duration-300 cursor-pointer border-2 ${
      disabled
        ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
        : isSelected
          ? 'bg-primary-50 border-primary-500 shadow-md'
          : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
    }`}
    onClick={disabled ? undefined : onClick}
  >
    {isSelected && (
      <div className="absolute top-3 right-3">
        <FaCheckCircle className="text-primary-500" />
      </div>
    )}
    
    <div className="flex items-center mb-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
      }`}>
        {icon}
      </div>
      <h3 className="ml-3 text-lg font-semibold">{title}</h3>
    </div>
    
    <p className="text-gray-600 text-sm">{description}</p>
    
    {disabled && (
      <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
        <span className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-medium">
          No courses available
        </span>
      </div>
    )}
  </div>
);

export default UploadPage; 
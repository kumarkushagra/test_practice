import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaDatabase, FaTrash, FaEye, FaFileAlt } from 'react-icons/fa';
import { useTheme } from '../components/ThemeProvider';
import axios from 'axios';

const DebugPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  useEffect(() => {
    // Check if user is admin
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const storedAdmin = localStorage.getItem('isAdmin');
    
    if (adminParam === 'true' || storedAdmin === 'true') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      fetchFiles();
    } else {
      setLoading(false);
      setError('Access denied. Admin privileges required.');
    }
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/list-files');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setFiles(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err.message || 'Failed to fetch files. Please try again later.');
      setLoading(false);
    }
  };

  const handleViewFile = async (path) => {
    try {
      setSelectedFile(path);
      setLoading(true);
      
      // Use the API endpoint we created in server.js
      const response = await fetch(`/api/file-content?path=${encodeURIComponent(path)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      const content = await response.text();
      // Try to parse as JSON if possible
      try {
        const jsonData = JSON.parse(content);
        setFileContent(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        // If not valid JSON, just show as text
        setFileContent(content);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching file:', err);
      setError(err.message || 'Failed to fetch file content. Please try again later.');
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/')}
            className="mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors dark:text-gray-300 dark:hover:text-primary-400"
            aria-label="Back to home"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Database Explorer</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex items-center justify-center flex-col p-8">
            <FaDatabase className="text-4xl text-gray-400 dark:text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Access Denied</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">You need admin privileges to access this page.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded dark:bg-primary-600 dark:hover:bg-primary-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !selectedFile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FaSpinner className="animate-spin text-primary-500 text-4xl mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading database files...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="mr-4 p-2 text-gray-600 hover:text-primary-600 transition-colors dark:text-gray-300 dark:hover:text-primary-400"
          aria-label="Back to home"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Database Explorer</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <FaDatabase className="text-primary-500 mr-2" />
          <h2 className="text-xl font-semibold">Stored Files</h2>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {files.length === 0 && !loading ? (
          <p className="text-gray-500 dark:text-gray-400">No files found in the database.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {files.map((course, i) => (
              <div 
                key={i} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-medium mb-2">{course.course}</h3>
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {course.weeks.map((week, j) => (
                    <li key={j} className="py-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <FaFileAlt className="text-gray-400 dark:text-gray-500 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300">{week.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewFile(week.path)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                            title="View file"
                          >
                            <FaEye className="mr-1" />
                            <span className="text-sm">View</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedFile && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">File Content</h2>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
          
          <div className="mb-2 text-gray-600 dark:text-gray-400 text-sm">
            Path: <span className="font-mono">{selectedFile}</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin text-primary-500 text-2xl" />
            </div>
          ) : (
            <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200">
              {fileContent}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPage; 
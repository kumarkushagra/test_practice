import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import pages
import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import CoursePage from './pages/CoursePage';
import QuizPage from './pages/QuizPage';
import UploadPage from './pages/UploadPage';
import NotFoundPage from './pages/NotFoundPage';
import GodModePage from './pages/GodModePage';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
          <Route path="/quiz/:courseId/:weekId" element={<QuizPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/god-mode" element={<GodModePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App; 
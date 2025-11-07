import React, { useState, useCallback } from 'react';
import type { AppState, QuizResult, Question, ConfidenceLevel, InProgressQuizState } from './types';
import * as storageService from './services/storageService';
import AuthScreen from './components/AuthScreen';
import DashboardScreen from './components/DashboardScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import LiveReviewScreen from './components/LiveReviewScreen';
import HistoricalReviewScreen from './components/HistoricalReviewScreen';
import UploadScreen from './components/UploadScreen';
import QuizSetupScreen from './components/QuizSetupScreen';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appState, setAppState] = useState<AppState>('auth');
  const [activeQuizResult, setActiveQuizResult] = useState<QuizResult | null>(null);
  const [quizInitialData, setQuizInitialData] = useState<InProgressQuizState | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
    setAppState('dashboard');
  }, []);

  const handleGenerateQuiz = useCallback(() => {
    setQuizInitialData(null); // This signifies a new quiz from a topic
    setAppState('quiz');
  }, []);
  
  const handleCreateFromFile = useCallback(() => {
    setAppState('upload');
  }, []);

  const handleViewHistory = useCallback(() => {
    setAppState('review_history');
  }, []);

  const handleQuizFinish = useCallback((data: { 
    quizName: string;
    topic: string; 
    subject: string;
    chapter: string;
    questions: Question[]; 
    userAnswers: (string | null)[];
    confidenceLevels: (ConfidenceLevel | null)[];
    timeTakenSeconds: number;
  }) => {
    const score = data.userAnswers.reduce((acc, answer, index) => {
        return answer === data.questions[index].correctAnswer ? acc + 1 : acc;
    }, 0);
      
    const savedResult = storageService.saveQuizResult({ ...data, score });
    setActiveQuizResult(savedResult);
    setQuizInitialData(null);
    setAppState('results');
  }, []);
  
  const handleFilesProcessed = useCallback((questions: Question[], fileName: string) => {
    setGeneratedQuestions(questions);
    setQuizInitialData({ // Pre-fill data for the setup screen
        topic: fileName,
        quizName: fileName,
        questions: questions,
        subject: '',
        chapter: '',
        userAnswers: [],
        confidenceLevels: [],
        flagged: [],
        currentQuestionIndex: 0,
        elapsedSeconds: 0
    });
    setAppState('quiz_setup');
  }, []);

  const handleQuizSetupComplete = useCallback((setupData: Omit<InProgressQuizState, 'questions'>) => {
    if (generatedQuestions) {
        setQuizInitialData({
            ...setupData,
            questions: generatedQuestions,
            userAnswers: new Array(generatedQuestions.length).fill(null),
            confidenceLevels: new Array(generatedQuestions.length).fill(null),
            flagged: new Array(generatedQuestions.length).fill(false),
            currentQuestionIndex: 0,
            elapsedSeconds: 0,
        });
        setGeneratedQuestions(null);
        setAppState('quiz');
    }
  }, [generatedQuestions]);

  const handleStartLiveReview = useCallback(() => {
    if (activeQuizResult) setAppState('review_live');
  }, [activeQuizResult]);
  
  const handleReviewHistoricalQuiz = useCallback((result: QuizResult) => {
    setActiveQuizResult(result);
    setAppState('results');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setActiveQuizResult(null);
    setQuizInitialData(null);
    setGeneratedQuestions(null);
    setAppState('dashboard');
  }, []);
  
  const handleRetakeQuiz = useCallback((result: QuizResult) => {
      setQuizInitialData({
        id: result.id,
        topic: result.topic,
        quizName: result.quizName,
        subject: result.subject,
        chapter: result.chapter,
        questions: result.questions,
        userAnswers: new Array(result.questions.length).fill(null),
        confidenceLevels: new Array(result.questions.length).fill(null),
        flagged: new Array(result.questions.length).fill(false),
        currentQuestionIndex: 0,
        elapsedSeconds: 0
      });
      setAppState('quiz');
  }, []);

  const renderContent = () => {
    if (!isLoggedIn) {
      return <AuthScreen onLogin={handleLogin} />;
    }

    switch (appState) {
      case 'dashboard':
        return <DashboardScreen onGenerateQuiz={handleGenerateQuiz} onCreateFromFile={handleCreateFromFile} onViewHistory={handleViewHistory} />;
      case 'upload':
        return <UploadScreen onFilesProcessed={handleFilesProcessed} onBack={handleBackToDashboard} />;
      case 'quiz_setup':
        return quizInitialData && <QuizSetupScreen initialData={quizInitialData} onSetupComplete={handleQuizSetupComplete} onBack={handleBackToDashboard}/>
      case 'quiz':
        return <QuizScreen key={quizInitialData?.id || 'new-quiz'} onQuizFinish={handleQuizFinish} initialData={quizInitialData} />;
      case 'results':
        return activeQuizResult && <ResultsScreen result={activeQuizResult} onLiveReview={handleStartLiveReview} onBackToHome={handleBackToDashboard} onRetakeQuiz={() => handleRetakeQuiz(activeQuizResult)} />;
      case 'review_live':
        return activeQuizResult && <LiveReviewScreen result={activeQuizResult} onBackToHome={handleBackToDashboard} />;
      case 'review_history':
        return <HistoricalReviewScreen onReviewQuiz={handleReviewHistoricalQuiz} onBackToHome={handleBackToDashboard} />;
      default:
        return <DashboardScreen onGenerateQuiz={handleGenerateQuiz} onCreateFromFile={handleCreateFromFile} onViewHistory={handleViewHistory} />;
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
            🎓 Gemini Dynamic Quiz Builder
          </h1>
        </header>
        <main className="bg-[#121212] rounded-2xl shadow-2xl shadow-black/50 p-6 sm:p-8 border border-gray-800">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
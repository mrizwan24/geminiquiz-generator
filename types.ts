export type AppState = 'auth' | 'dashboard' | 'quiz' | 'results' | 'review_live' | 'review_history' | 'upload' | 'quiz_setup';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  id: string;
  topic: string; 
  quizName: string;
  subject: string;
  chapter: string;
  questions: Question[];
  userAnswers: (string | null)[];
  confidenceLevels: (ConfidenceLevel | null)[];
  score: number;
  timeTakenSeconds: number;
  date: string;
}

export interface InProgressQuizState {
  id?: string;
  topic: string;
  quizName: string;
  subject: string;
  chapter: string;
  questions: Question[];
  userAnswers: (string | null)[];
  confidenceLevels: (ConfidenceLevel | null)[];
  flagged: boolean[];
  currentQuestionIndex: number;
  elapsedSeconds: number;
}

// New Types for Dashboard Analytics
export interface SubjectPerformance {
    subject: string;
    correct: number;
    total: number;
    percentage: number;
}

export interface DashboardMetrics {
    totalQuizzes: number;
    totalQuestions: number;
    totalCorrect: number;
    totalIncorrect: number;
    overallPercentage: number;
    subjectPerformance: SubjectPerformance[];
}
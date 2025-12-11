export enum AppState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  ROLE_SELECTION = 'ROLE_SELECTION',
  RESUME_ANALYSIS = 'RESUME_ANALYSIS',
  APTITUDE_TEST = 'APTITUDE_TEST',
  TECH_ASSESSMENT = 'TECH_ASSESSMENT',
  COMMUNICATION_COACH = 'COMMUNICATION_COACH',
  RESULTS = 'RESULTS'
}

export enum JobRole {
  SOFTWARE_ENGINEER = 'Software Engineer',
  DATA_SCIENTIST = 'Data Scientist',
  PRODUCT_MANAGER = 'Product Manager',
  UX_DESIGNER = 'UX Designer',
  MARKETING_MANAGER = 'Marketing Manager'
}

export interface UserProfile {
  name: string;
  email: string;
  targetRole: JobRole | null;
  resumeText: string;
}

export interface AtsResult {
  score: number;
  matchPercentage: number;
  missingKeywords: string[];
  suggestions: string[];
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index
  explanation: string;
  topic: string;
}

export interface AssessmentResult {
  score: number;
  total: number;
  feedback: string;
}

export interface OverallScores {
  resume: number;
  aptitude: number;
  technical: number;
  communication: number;
}

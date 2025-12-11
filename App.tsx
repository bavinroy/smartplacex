import React, { useState } from 'react';
import { AppState, JobRole, UserProfile, OverallScores } from './types';
import { Dashboard } from './components/Dashboard';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { Assessment } from './components/Assessment';
import { InterviewCoach } from './components/InterviewCoach';
import { Layers, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  
  const [user, setUser] = useState<UserProfile>({
    name: 'Student User',
    email: 'student@example.com',
    targetRole: null,
    resumeText: ''
  });

  const [scores, setScores] = useState<OverallScores>({
    resume: 0,
    aptitude: 0,
    technical: 0,
    communication: 0
  });

  const handleLogin = () => {
    // Simulate login
    setAppState(AppState.ROLE_SELECTION);
  };

  const handleRoleSelect = (role: JobRole) => {
    setUser({ ...user, targetRole: role });
    setAppState(AppState.DASHBOARD);
  };

  const updateScore = (type: keyof OverallScores, score: number) => {
    setScores(prev => ({ ...prev, [type]: score }));
    setAppState(AppState.DASHBOARD);
  };

  // Render Logic
  const renderContent = () => {
    switch (appState) {
      case AppState.LOGIN:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white p-6">
            <div className="mb-8 p-4 bg-white/10 rounded-full">
                <Layers className="w-16 h-16" />
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">SmartPlacex</h1>
            <p className="text-xl opacity-80 mb-12 text-center max-w-lg">AI-driven Placement Preparation Suite. Get job-ready with targeted feedback on resume, skills, and communication.</p>
            <button
              onClick={handleLogin}
              className="px-10 py-4 bg-white text-indigo-900 font-bold rounded-xl shadow-xl hover:scale-105 transition-transform flex items-center gap-3"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
              Sign in with Google
            </button>
          </div>
        );

      case AppState.ROLE_SELECTION:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Select your Target Job Role</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(JobRole).map((role) => (
                    <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all text-left group"
                    >
                    <span className="font-semibold text-lg text-gray-800 group-hover:text-indigo-600 block mb-1">{role}</span>
                    <span className="text-sm text-gray-500">View tailored assessments</span>
                    </button>
                ))}
                </div>
            </div>
          </div>
        );

      case AppState.DASHBOARD:
        return <Dashboard user={user} scores={scores} onNavigate={(view) => setAppState(view)} />;

      case AppState.RESUME_ANALYSIS:
        return (
          <ResumeAnalyzer 
            role={user.targetRole!} 
            onResumeAnalyzed={(result, text) => {
                setUser({...user, resumeText: text});
                updateScore('resume', result.score);
            }}
            onCancel={() => setAppState(AppState.DASHBOARD)}
          />
        );

      case AppState.APTITUDE_TEST:
        return (
            <Assessment 
                type="Aptitude" 
                role={user.targetRole!} 
                onComplete={(score) => updateScore('aptitude', score)}
                onCancel={() => setAppState(AppState.DASHBOARD)}
            />
        );
      
      case AppState.TECH_ASSESSMENT:
        return (
            <Assessment 
                type="Technical" 
                role={user.targetRole!} 
                onComplete={(score) => updateScore('technical', score)}
                onCancel={() => setAppState(AppState.DASHBOARD)}
            />
        );

      case AppState.COMMUNICATION_COACH:
        return (
            <InterviewCoach 
                role={user.targetRole!}
                onComplete={(score) => updateScore('communication', score)}
                onCancel={() => setAppState(AppState.DASHBOARD)}
            />
        );

      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        {/* Simple Top Bar if logged in */}
        {appState !== AppState.LOGIN && (
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2 font-bold text-xl text-indigo-700 cursor-pointer" onClick={() => setAppState(AppState.DASHBOARD)}>
                    <Layers className="w-6 h-6" /> SmartPlacex
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 hidden sm:block">{user.name}</span>
                    <button onClick={() => setAppState(AppState.LOGIN)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav>
        )}
      {renderContent()}
    </div>
  );
};

export default App;
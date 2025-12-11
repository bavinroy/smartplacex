import React from 'react';
import { UserProfile, OverallScores } from '../types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { FileText, Cpu, MessageSquare, BrainCircuit, Play, CheckCircle } from 'lucide-react';

interface Props {
  user: UserProfile;
  scores: OverallScores;
  onNavigate: (view: any) => void;
}

export const Dashboard: React.FC<Props> = ({ user, scores, onNavigate }) => {
  const data = [
    { subject: 'Resume Fit', A: scores.resume, fullMark: 100 },
    { subject: 'Technical', A: scores.technical, fullMark: 100 },
    { subject: 'Communication', A: scores.communication, fullMark: 100 },
    { subject: 'Aptitude', A: scores.aptitude, fullMark: 100 },
  ];

  const overallScore = Math.round((scores.resume + scores.technical + scores.communication + scores.aptitude) / 4);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-indigo-100 text-lg">Target Role: <span className="font-semibold bg-white/20 px-2 py-1 rounded">{user.targetRole || 'Not Selected'}</span></p>
        <div className="mt-6 flex items-center gap-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                <span className="block text-sm opacity-80">Readiness Score</span>
                <span className="text-3xl font-bold">{overallScore}%</span>
            </div>
            <p className="text-sm opacity-80 max-w-md">
                You are on track! Focus on improving your Technical score to reach the top 10% of candidates for this role.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Modules Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Resume Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <FileText className="w-6 h-6" />
                    </div>
                    {scores.resume > 0 ? <CheckCircle className="text-green-500 w-5 h-5" /> : null}
                </div>
                <h3 className="text-xl font-bold text-gray-900">Resume Analysis</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">ATS screening and keyword optimization.</p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-800">{scores.resume > 0 ? `${scores.resume}%` : '-'}</span>
                    <button onClick={() => onNavigate('RESUME_ANALYSIS')} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        {scores.resume > 0 ? 'Retake' : 'Start'}
                    </button>
                </div>
            </div>

            {/* Technical Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <Cpu className="w-6 h-6" />
                    </div>
                    {scores.technical > 0 ? <CheckCircle className="text-green-500 w-5 h-5" /> : null}
                </div>
                <h3 className="text-xl font-bold text-gray-900">Technical Assessment</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">Code and domain knowledge MCQs.</p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-800">{scores.technical > 0 ? `${scores.technical}%` : '-'}</span>
                    <button onClick={() => onNavigate('TECH_ASSESSMENT')} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        Start
                    </button>
                </div>
            </div>

            {/* Aptitude Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                    {scores.aptitude > 0 ? <CheckCircle className="text-green-500 w-5 h-5" /> : null}
                </div>
                <h3 className="text-xl font-bold text-gray-900">Aptitude Test</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">Logical reasoning and quantitative analysis.</p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-800">{scores.aptitude > 0 ? `${scores.aptitude}%` : '-'}</span>
                    <button onClick={() => onNavigate('APTITUDE_TEST')} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        Start
                    </button>
                </div>
            </div>

            {/* Communication Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    {scores.communication > 0 ? <CheckCircle className="text-green-500 w-5 h-5" /> : null}
                </div>
                <h3 className="text-xl font-bold text-gray-900">Communication</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">Voice-based AI interview coach.</p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-800">{scores.communication > 0 ? `${scores.communication}%` : '-'}</span>
                    <button onClick={() => onNavigate('COMMUNICATION_COACH')} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        Start
                    </button>
                </div>
            </div>

        </div>

        {/* Analytics Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Capability Profile</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="My Score"
                        dataKey="A"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.5}
                    />
                    <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Action Plan</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        Improve keyword density in resume.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        Practice dynamic programming for Tech round.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        Work on answer conciseness in interviews.
                    </li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};
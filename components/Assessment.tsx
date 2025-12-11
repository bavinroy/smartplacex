import React, { useState, useEffect } from 'react';
import { Question, JobRole } from '../types';
import { generateQuestions } from '../services/geminiService';
import { CheckCircle, XCircle, Clock, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  type: 'Aptitude' | 'Technical';
  role: JobRole;
  onComplete: (score: number) => void;
  onCancel: () => void;
}

export const Assessment: React.FC<Props> = ({ type, role, onComplete, onCancel }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadQuestions = async () => {
      const qs = await generateQuestions(type, role);
      setQuestions(qs);
      setLoading(false);
    };
    loadQuestions();
  }, [type, role]);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setShowResult(true);
  };

  const handleFinish = () => {
      onComplete(score);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Generating {type} Assessment...</h2>
        <p className="text-gray-500">Tailoring questions for {role}...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-indigo-600">{score}%</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
            <p className="text-gray-500 mb-8">You answered {Math.round((score / 100) * questions.length)} out of {questions.length} questions correctly.</p>
            
            <div className="space-y-4 text-left mb-8">
                {questions.map((q, i) => (
                    <div key={q.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="font-semibold text-gray-800 mb-2">{i + 1}. {q.question}</p>
                        <div className="flex items-center gap-2 text-sm">
                            <span className={answers[i] === q.correctAnswer ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                                Your Answer: {q.options[answers[i]]}
                            </span>
                            {answers[i] !== q.correctAnswer && (
                                <span className="text-green-600 font-medium ml-4">
                                    Correct: {q.options[q.correctAnswer]}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">{q.explanation}</p>
                    </div>
                ))}
            </div>

            <button onClick={handleFinish} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                Return to Dashboard
            </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen flex flex-col justify-center">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">{type} Assessment</h2>
            <p className="text-gray-500">{role}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium">Question {currentQIndex + 1} / {questions.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">{currentQ.question}</h3>
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                answers[currentQIndex] === idx
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                  : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                    answers[currentQIndex] === idx ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                }`}>
                    {answers[currentQIndex] === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                {option}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 px-4 py-2">
            Cancel
        </button>
        <button
          onClick={handleNext}
          disabled={answers[currentQIndex] === undefined}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${
            answers[currentQIndex] === undefined ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {currentQIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
import React, { useState, useRef } from 'react';
import { AtsResult, JobRole } from '../types';
import { analyzeResume, ResumeInput } from '../services/geminiService';
import { FileText, CheckCircle, AlertCircle, Upload, Loader2, ArrowRight, X, File as FileIcon } from 'lucide-react';

interface Props {
  role: JobRole;
  onResumeAnalyzed: (result: AtsResult, text: string) => void;
  onCancel: () => void;
}

export const ResumeAnalyzer: React.FC<Props> = ({ role, onResumeAnalyzed, onCancel }) => {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Basic validation
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size too large. Please upload a file smaller than 5MB.");
        return;
      }
      
      const fileType = selectedFile.type;
      if (fileType !== 'application/pdf' && fileType !== 'text/plain') {
        setError("Invalid file type. Please upload a PDF or TXT file.");
        return;
      }

      setFile(selectedFile);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Extract base64 part (remove data:application/pdf;base64, prefix)
        const base64 = result.split(',')[1];
        setFileBase64(base64);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');

    try {
      let input: ResumeInput;

      if (mode === 'text') {
        if (text.length < 50) {
            throw new Error("Please enter a valid resume text (at least 50 characters).");
        }
        input = { type: 'text', content: text };
      } else {
        if (!file || !fileBase64) {
            throw new Error("Please select a file to upload.");
        }
        input = { type: 'file', content: fileBase64, mimeType: file.type };
      }

      const result = await analyzeResume(input, role);
      
      // Pass back either the raw text or a placeholder message for the user profile
      const userContent = mode === 'text' ? text : `[File Uploaded] ${file?.name}`;
      onResumeAnalyzed(result, userContent);

    } catch (err: any) {
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                    <FileText className="w-8 h-8" /> Resume Analysis
                </h2>
                <p className="opacity-90 mt-2">Target Role: <span className="font-semibold text-yellow-300">{role}</span></p>
            </div>
            <button onClick={onCancel} className="text-white/80 hover:text-white text-sm underline">
                Back to Dashboard
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => setMode('text')}
                className={`flex-1 py-4 font-medium text-center transition-colors ${mode === 'text' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Paste Text
            </button>
            <button 
                onClick={() => setMode('file')}
                className={`flex-1 py-4 font-medium text-center transition-colors ${mode === 'file' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Upload Document (PDF/TXT)
            </button>
        </div>

        <div className="p-8">
          
          {mode === 'text' ? (
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste your Resume / CV Text
                </label>
                <textarea
                className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm resize-none"
                placeholder="Paste your resume content here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                    {text.length} characters
                </div>
            </div>
          ) : (
            <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 transition-colors relative">
                {!file ? (
                    <>
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium">Drag & drop your resume here</p>
                        <p className="text-sm text-gray-400 mt-1">or</p>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 px-6 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Browse Files
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept=".pdf,.txt"
                            onChange={handleFileChange}
                        />
                        <p className="mt-4 text-xs text-gray-400">Supported: PDF, TXT (Max 5MB)</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                            <FileIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{file.name}</h3>
                        <p className="text-sm text-gray-500 mb-6">{(file.size / 1024).toFixed(1)} KB</p>
                        <button 
                            onClick={handleRemoveFile}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <X className="w-4 h-4" /> Remove File
                        </button>
                    </div>
                )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || (mode === 'text' ? !text : !file)}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg
                ${(loading || (mode === 'text' ? !text : !file)) ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  Analyze Resume <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900">1. Upload or Paste</h3>
            <p className="text-sm text-gray-500 mt-2">Upload your PDF resume or copy text directly.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900">2. AI Analysis</h3>
            <p className="text-sm text-gray-500 mt-2">Our Gemini-powered engine checks for keywords, structure, and relevance.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900">3. Get Feedback</h3>
            <p className="text-sm text-gray-500 mt-2">Receive instant actionable feedback to improve your ATS score.</p>
        </div>
      </div>
    </div>
  );
};
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { JobRole } from '../types';
import { getLiveClient } from '../services/geminiService';
import { Modality, LiveServerMessage } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../services/audioUtils';
import { Mic, MicOff, Volume2, StopCircle, PlayCircle, Loader2 } from 'lucide-react';

interface Props {
  role: JobRole;
  onComplete: (score: number) => void;
  onCancel: () => void;
}

export const InterviewCoach: React.FC<Props> = ({ role, onComplete, onCancel }) => {
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Ready to start interview");

  // Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  
  // Stream & Processing
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Timing
  const nextStartTimeRef = useRef<number>(0);

  // Gemini Session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const startInterview = async () => {
    setIsConnecting(true);
    setStatusMessage("Connecting to AI Coach...");
    setError(null);

    try {
      const ai = getLiveClient();
      
      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Connect to Gemini Live
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: handleOnOpen,
          onmessage: handleOnMessage,
          onerror: (e: any) => {
              console.error(e);
              setError("Connection error. Please try again.");
              stopInterview();
          },
          onclose: () => {
              console.log("Session closed");
              setIsLive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are a professional tech interviewer conducting a behavioral and technical screening for a ${role} position. 
          Ask one question at a time. Keep responses concise. Start by welcoming the candidate.
          After 3-4 exchanges, politely conclude the interview and give a brief 1-sentence assessment.`
        },
      });

    } catch (err: any) {
      console.error(err);
      setError("Failed to access microphone or connect.");
      setIsConnecting(false);
    }
  };

  const handleOnOpen = () => {
    setIsConnecting(false);
    setIsLive(true);
    setStatusMessage("Interview in progress. Speak clearly.");

    // Setup input streaming
    if (!inputAudioContextRef.current || !streamRef.current || !sessionPromiseRef.current) return;

    const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
    const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
    scriptProcessorRef.current = processor;

    processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromiseRef.current?.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
        });
    };

    source.connect(processor);
    processor.connect(inputAudioContextRef.current.destination);
  };

  const handleOnMessage = async (message: LiveServerMessage) => {
    // Process audio output
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio && outputAudioContextRef.current && outputNodeRef.current) {
        const ctx = outputAudioContextRef.current;
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            ctx,
            24000,
            1
        );

        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNodeRef.current);
        
        source.addEventListener('ended', () => {
            sourcesRef.current.delete(source);
        });

        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        sourcesRef.current.add(source);
    }

    // Handle interruption
    if (message.serverContent?.interrupted) {
        sourcesRef.current.forEach(source => {
            source.stop();
            sourcesRef.current.delete(source);
        });
        nextStartTimeRef.current = 0;
    }
  };

  const stopInterview = useCallback(() => {
    // Clean up Audio
    scriptProcessorRef.current?.disconnect();
    streamRef.current?.getTracks().forEach(track => track.stop());
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();

    // Close session
    sessionPromiseRef.current?.then(session => session.close());

    // Reset state
    setIsLive(false);
    setIsConnecting(false);
    setStatusMessage("Interview ended.");
    
    // Simulate scoring for demo
    onComplete(Math.floor(Math.random() * 20) + 75); // Mock score 75-95
  }, [onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isLive) stopInterview();
    };
  }, [isLive, stopInterview]);

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full text-center relative overflow-hidden">
            {/* Visualizer Background (Simulated) */}
            {isLive && (
                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center gap-1">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-4 bg-indigo-600 animate-pulse h-32" style={{animationDelay: `${i * 0.1}s`}}></div>
                    ))}
                </div>
            )}

            <div className={`relative z-10 w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-8 transition-all duration-500 ${isLive ? 'bg-red-100 shadow-red-200' : 'bg-indigo-100 shadow-indigo-200'} shadow-xl`}>
                {isConnecting ? (
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                ) : isLive ? (
                    <Mic className="w-12 h-12 text-red-600 animate-pulse" />
                ) : (
                    <MicOff className="w-12 h-12 text-indigo-400" />
                )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Interview Coach</h2>
            <p className="text-gray-500 mb-8">{statusMessage}</p>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-4 justify-center relative z-10">
                {!isLive && !isConnecting ? (
                    <>
                        <button onClick={onCancel} className="px-6 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button onClick={startInterview} className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                            <PlayCircle className="w-5 h-5" /> Start Session
                        </button>
                    </>
                ) : (
                    <button onClick={stopInterview} className="px-8 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                        <StopCircle className="w-5 h-5" /> End Interview
                    </button>
                )}
            </div>
            
            <div className="mt-8 text-xs text-gray-400">
                <p>Ensure you are in a quiet environment.</p>
                <p>Microphone permission required.</p>
            </div>
        </div>
    </div>
  );
};
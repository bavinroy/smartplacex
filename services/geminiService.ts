import { GoogleGenAI, Type } from "@google/genai";
import { AtsResult, Question, JobRole } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to get standard model
const getTextModel = () => 'gemini-2.5-flash';

// Define input type for resume analysis
export type ResumeInput = 
  | { type: 'text'; content: string }
  | { type: 'file'; content: string; mimeType: string };

export const analyzeResume = async (input: ResumeInput, role: JobRole): Promise<AtsResult> => {
  const isFile = input.type === 'file';
  
  const systemInstruction = `
    You are an expert ATS (Applicant Tracking System) scanner. 
    Analyze the candidate's resume for the role of "${role}".
    
    Return a JSON object with:
    - score: number (0-100) representing the overall fit.
    - matchPercentage: number (0-100) representing keyword matching.
    - missingKeywords: array of strings (key skills or terms missing from the resume).
    - suggestions: array of strings (specific, actionable advice to improve the resume for this role).
  `;

  let parts: any[] = [];
  
  if (isFile) {
    parts = [
      {
        inlineData: {
          mimeType: input.mimeType,
          data: input.content
        }
      },
      {
        text: "Please analyze this resume document."
      }
    ];
  } else {
    parts = [
      {
        text: `Resume Text:\n"${input.content.substring(0, 15000)}"` 
      }
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: getTextModel(),
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            matchPercentage: { type: Type.NUMBER },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "matchPercentage", "missingKeywords", "suggestions"]
        }
      },
      contents: { parts }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AtsResult;
  } catch (error) {
    console.error("ATS Analysis Error:", error);
    return {
      score: 0,
      matchPercentage: 0,
      missingKeywords: ["Error analyzing resume"],
      suggestions: ["Please try again or ensure the file is a valid PDF/Text document."]
    };
  }
};

export const generateQuestions = async (topic: 'Aptitude' | 'Technical', role: JobRole, difficulty: string = 'Medium'): Promise<Question[]> => {
  const prompt = `
    Generate 5 ${difficulty} level multiple-choice questions for a ${role} candidate.
    Focus on ${topic} skills relevant to this role.
    
    Return a JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: getTextModel(),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
              explanation: { type: Type.STRING },
              topic: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation", "topic"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("Question Generation Error:", error);
    return [];
  }
};

export const getLiveClient = () => {
    return ai;
}
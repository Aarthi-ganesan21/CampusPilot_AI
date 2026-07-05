import { GoogleGenAI } from "@google/genai";

const getGenAIInstance = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY is not defined in environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export default getGenAIInstance;

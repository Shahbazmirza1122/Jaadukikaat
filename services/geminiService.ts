
import { GoogleGenAI } from "@google/genai";

export const getSpiritualGuidance = async (query: string): Promise<string> => {
  if (!process.env.API_KEY) {
      console.warn("API Key is missing for Spiritual Guide.");
      return "Spiritual guidance is currently unavailable. Please try again later.";
  }

  try {
    // Initialize client directly with process.env.API_KEY as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a wise, compassionate, and non-denominational spiritual guide. 
      The user is asking for guidance on this topic: "${query}". 
      Provide a short, profound, and uplifting insight or solution (max 100 words). 
      Focus on inner peace, mindfulness, and clarity.`,
    });
    return response.text || "Peace comes from within. Take a deep breath and center yourself.";
  } catch (error) {
    console.error("Error fetching guidance:", error);
    return "The path is sometimes cloudy. Please try again in a moment of stillness.";
  }
};

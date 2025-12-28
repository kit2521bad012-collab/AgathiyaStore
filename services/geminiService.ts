
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateProductDescription = async (productName: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a poetic, nature-inspired, high-end commercial description for a product named "${productName}". Keep it under 60 words and emphasize organic quality.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "A beautiful natural product crafted with care.";
  } catch (error) {
    console.error("AI generation failed:", error);
    return "Handcrafted with natural elements to bring the essence of nature into your home.";
  }
};

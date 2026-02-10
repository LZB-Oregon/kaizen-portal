
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeKaizenIdea(problem: string, idea: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this Kaizen idea. Problem: "${problem}". Idea: "${idea}". Categorize it into one of the 8 Lean Wastes (Defects, Overproduction, Waiting, Non-Utilized Talent, Transportation, Inventory, Motion, Extra-Processing) and provide a very brief (1 sentence) encouraging benefit analysis.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wasteType: { 
              type: Type.STRING, 
              description: "The most relevant Lean waste category." 
            },
            shortAnalysis: { 
              type: Type.STRING, 
              description: "A 1-sentence encouraging benefit analysis." 
            }
          },
          required: ["wasteType", "shortAnalysis"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
}

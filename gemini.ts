import { GoogleGenAI, Type } from "@google/genai";
import { Language, SymptomAnalysis, ImageAnalysis, RoutineAnalysis, Hospital } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeSymptoms(
  symptoms: string,
  language: Language
): Promise<SymptomAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following symptoms and provide a medical assessment. 
    Symptoms: ${symptoms}
    Language: ${language}
    Include possible conditions, a brief description, traditional/home remedies, and general recommendations.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING },
          description: { type: Type.STRING },
          traditionalRemedies: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          recommendations: { type: Type.STRING }
        },
        required: ["condition", "description", "traditionalRemedies", "recommendations"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeMedicalImage(
  base64Image: string,
  mimeType: string,
  language: Language
): Promise<ImageAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        {
          text: `Analyze this medical image (X-ray, report, etc.). 
          1. Determine if it is a valid medical image.
          2. If valid, provide findings and details in ${language}.
          3. If not valid, set isMedical to false.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          findings: { type: Type.STRING },
          isMedical: { type: Type.BOOLEAN },
          details: { type: Type.STRING }
        },
        required: ["findings", "isMedical", "details"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeRoutine(
  routine: string,
  language: Language
): Promise<RoutineAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following daily routine and provide feedback.
    Routine: ${routine}
    Language: ${language}
    Label it as 'healthy' or 'unhealthy' and provide custom tips for improvement.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ["healthy", "unhealthy"] },
          feedback: { type: Type.STRING },
          tips: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["status", "feedback", "tips"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function searchHospitals(
  location: string,
  language: Language
): Promise<Hospital[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `List 5 major hospitals in or near ${location}. 
    Provide details in ${language}: Name, Address, Phone, Website, and their main Specialty.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            address: { type: Type.STRING },
            phone: { type: Type.STRING },
            website: { type: Type.STRING },
            specialty: { type: Type.STRING }
          },
          required: ["name", "address", "specialty"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse hospital search results", e);
    return [];
  }
}

export async function translateText(text: string, targetLanguage: Language): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following text to ${targetLanguage}. Return only the translated text.
    Text: ${text}`,
  });
  return response.text || text;
}


import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini API client using the required environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Re-implemented AI-powered mechanical diagnostics using gemini-3-pro-preview.
export const getDiagnosticHelp = async (symptoms: string) => {
  if (!symptoms) return null;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analise estes sintomas mecânicos e forneça um diagnóstico preliminar e sugestões de reparo: ${symptoms}`,
      config: {
        systemInstruction: "Você é um mestre mecânico auxiliando técnicos. Forneça respostas técnicas e diretas.",
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Diagnostic Error:", error);
    return "Erro ao processar diagnóstico via IA.";
  }
};

// Fix: Re-implemented structured data extraction for Service Orders using gemini-3-flash-preview.
export const extractOSData = async (rawText: string) => {
  if (!rawText) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extraia informações de Ordem de Serviço deste texto: ${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clientName: { type: Type.STRING },
            vehicle: { type: Type.STRING },
            plate: { type: Type.STRING },
            description: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  quantity: { type: Type.NUMBER },
                  type: { type: Type.STRING, description: "PEÇA ou MÃO DE OBRA" }
                }
              }
            }
          },
          required: ["clientName", "vehicle", "description"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Data Extraction Error:", error);
    return null;
  }
};

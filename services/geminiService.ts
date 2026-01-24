
import { GoogleGenAI } from "@google/genai";

export const getDiagnosticHelp = async (symptoms: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um consultor técnico mecânico sênior. O cliente relatou: "${symptoms}". 
      Responda de forma curta e prática:
      1. Causas prováveis.
      2. Peças que geralmente precisam de troca.
      3. Tempo estimado de serviço.
      Seja profissional e use terminologia técnica correta do Brasil.`,
      config: {
        temperature: 0.5,
      }
    });
    
    return response.text || "Sem sugestões no momento.";
  } catch (error) {
    console.error("Erro IA:", error);
    return "Falha ao consultar assistente.";
  }
};

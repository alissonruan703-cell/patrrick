
import { GoogleGenAI } from "@google/genai";

export const getDiagnosticHelp = async (symptoms: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um mecânico especialista. Com base nos sintomas do veículo: "${symptoms}", sugira uma breve análise técnica de possíveis causas e soluções. Seja direto e profissional em português brasileiro.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Desculpe, não foi possível gerar o diagnóstico agora.";
  }
};


import { GoogleGenAI } from "@google/genai";

export const getDiagnosticHelp = async (symptoms: string) => {
  // Inicializamos dentro da função para garantir que o process.env esteja acessível no momento da execução
  // e não cause erro de 'process is not defined' no carregamento global do script.
  try {
    if (!process.env.API_KEY) {
      console.warn("API_KEY não configurada.");
      return "Assistente temporariamente indisponível (chave ausente).";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um consultor técnico mecânico sênior no Brasil. O cliente relatou: "${symptoms}". 
      Responda de forma curta e prática em 3 tópicos:
      1. Causas prováveis.
      2. Sugestão de peças.
      3. Estimativa de tempo.`,
      config: {
        temperature: 0.5,
      }
    });
    
    return response.text || "Sem sugestões no momento.";
  } catch (error) {
    console.error("Erro na IA:", error);
    return "Não foi possível consultar a IA agora. Tente salvar a O.S. e tentar novamente depois.";
  }
};

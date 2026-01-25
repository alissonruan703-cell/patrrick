
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  if (!process.env.API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getDiagnosticHelp = async (symptoms: string) => {
  const ai = getAIClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise como mecânico sênior: "${symptoms}". 
      Retorne um JSON com:
      - causas: array de strings
      - pecas: array de objetos {item: string, preco_medio: number}
      - tempo_estimado: string
      - dica_mestre: string`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro na consultoria IA:", error);
    return null;
  }
};

export const extractOSData = async (rawText: string) => {
  const ai = getAIClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extraia dados desta descrição de entrada de oficina: "${rawText}".
      Campos: clientName, vehicle, plate, description.
      Se não encontrar algum campo, deixe vazio.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clientName: { type: Type.STRING },
            vehicle: { type: Type.STRING },
            plate: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro no preenchimento automático:", error);
    return null;
  }
};

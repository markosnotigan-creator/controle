import { GoogleGenAI } from "@google/genai";
import { Officer, LeaveRecord } from "../types";

// Note: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// Assume this variable is pre-configured, valid, and accessible in the execution context.

export const GeminiService = {
  isEnabled: () => true,

  generateOfficerReport: async (officer: Officer, leaves: LeaveRecord[]): Promise<string> => {
    // Inicialização Lazy: Instancia apenas quando necessário.
    // Isso previne que o app quebre na inicialização se a chave estiver faltando ou inválida.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.warn("API Key do Google GenAI não encontrada.");
      return "Erro de configuração: Chave de API não encontrada.";
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `
      Atue como um oficial administrativo da Polícia Militar.
      Analise os dados do seguinte policial e gere um resumo executivo curto (máximo 3 parágrafos) sobre a situação de suas folgas.
      
      Dados do Policial:
      Nome: ${officer.rank} ${officer.name}
      Matrícula: ${officer.matricula}
      Unidade: ${officer.unit}

      Histórico de Folgas (JSON):
      ${JSON.stringify(leaves)}

      O resumo deve focar em:
      1. Saldo total de folgas disponíveis.
      2. Padrão de aquisição (quais serviços geram mais folgas).
      3. Alerta se houver muitas folgas acumuladas sem uso.
      4. Sugestão educada para planejamento de gozo caso haja saldo positivo.

      Use linguagem formal, militar e direta.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Não foi possível gerar o relatório.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Erro ao conectar com o serviço de inteligência artificial. Verifique sua conexão ou chave de API.";
    }
  }
};
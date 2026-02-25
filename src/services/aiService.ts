import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getFinancialAdvice(transactions: any[], userMessage: string) {
  const model = "gemini-3.1-pro-preview";
  
  const context = `
    You are a professional financial assistant for an app called Expenso.
    The user has the following transaction history:
    ${JSON.stringify(transactions, null, 2)}
    
    Current date: ${new Date().toISOString()}
    
    Provide concise, actionable financial advice or answer the user's specific question based on this data.
    If the user asks for tips, give them 3 specific ones.
    Be encouraging but realistic.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userMessage,
      config: {
        systemInstruction: context,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Service Error:", error);
    return "I'm sorry, I'm having trouble analyzing your finances right now. Please try again later.";
  }
}

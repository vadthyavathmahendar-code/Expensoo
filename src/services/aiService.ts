import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface BudgetForecast {
  predictedTotal: number;
  confidence: number;
  topPredictedCategories: { category: string; predictedAmount: number }[];
  insights: string[];
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error?.message?.includes('429')) {
      await sleep(delay);
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function getFinancialAdvice(transactions: any[], userMessage: string, weeklyBudget: number = 500) {
  const model = "gemini-3.1-pro-preview";
  
  const context = `
    You are a professional financial assistant for an app called Expenso.
    The user has a weekly budget of $${weeklyBudget}.
    The user has the following transaction history:
    ${JSON.stringify(transactions, null, 2)}
    
    Current date: ${new Date().toISOString()}
    
    Provide concise, actionable financial advice or answer the user's specific question based on this data.
    Pay special attention to "Spending Velocity" (how fast they are spending vs time left in the week).
    If they ask about daily spending limits, calculate it based on remaining budget and days left in the week.
    Identify the "biggest budget drain" by looking at categories with highest expense totals.
    Be encouraging but realistic.
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model,
      contents: userMessage,
      config: {
        systemInstruction: context,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      },
    }));
    return response.text;
  } catch (error) {
    console.error("AI Service Error:", error);
    return "I'm sorry, I'm having trouble analyzing your finances right now. Please try again later.";
  }
}

export async function getBudgetInsight(transactions: any[], weeklyBudget: number = 500) {
  const model = "gemini-3.1-pro-preview";
  
  // Local Fallback Calculation
  const calculateLocalInsight = () => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= startOfWeek)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const daysPassed = Math.max(1, new Date().getDay() + 1);
    const velocity = (weeklyExpenses / weeklyBudget) / (daysPassed / 7);
    
    if (velocity > 1.2) {
      const percentageUsed = Math.round((weeklyExpenses / weeklyBudget) * 100);
      return `Heads up! You've used ${percentageUsed}% of your weekly budget in ${daysPassed} days. You might want to slow down your spending.`;
    }
    return "";
  };

  const systemInstruction = `
    You are a financial analyst for Expenso. 
    Analyze the user's spending velocity for the current week.
    Weekly Budget: $${weeklyBudget}
    Transactions: ${JSON.stringify(transactions)}
    Current Date: ${new Date().toISOString()}

    If the user is spending too fast (Spending Velocity > 1.0, where 1.0 is perfectly on track), provide a ONE-SENTENCE warning insight.
    Example: "Hey! You've used 70% of your food budget in 3 days. Consider slowing down."
    If they are on track, return an empty string.
    Focus on being proactive and helpful.
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model,
      contents: "Analyze my spending velocity and provide a one-sentence warning if I'm over-pacing.",
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      },
    }), 2, 500); // Fewer retries for background insights
    return response.text?.trim() || "";
  } catch (error) {
    console.warn("Budget Insight AI failed, using local fallback:", error);
    return calculateLocalInsight();
  }
}

export async function getBudgetForecast(transactions: any[], weeklyBudget: number = 500): Promise<BudgetForecast | null> {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `
    You are a financial forecasting expert for Expenso.
    Analyze the user's transaction history and predict their spending for the NEXT 7 DAYS.
    
    Weekly Budget: $${weeklyBudget}
    Transactions: ${JSON.stringify(transactions)}
    Current Date: ${new Date().toISOString()}

    Provide:
    1. Predicted total spending for the next 7 days.
    2. Confidence level (0.0 to 1.0).
    3. Top 3 categories where they are likely to spend most.
    4. 2-3 actionable insights to stay within budget.
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model,
      contents: "Generate a budget forecast for the next 7 days based on my history.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedTotal: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            topPredictedCategories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  predictedAmount: { type: Type.NUMBER }
                },
                required: ["category", "predictedAmount"]
              }
            },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["predictedTotal", "confidence", "topPredictedCategories", "insights"]
        },
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      },
    }));
    
    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Budget Forecast AI failed:", error);
    return null;
  }
}

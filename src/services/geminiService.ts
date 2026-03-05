import { GoogleGenAI, Type, ThinkingLevel, GenerateContentResponse } from "@google/genai";
import { Category, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const CHAT_SYSTEM_INSTRUCTION = `Сіз - "Qazaqstan Quiz Assistant" атты кәсіби Қазақстан тарихы сарапшысы және мұғалімісіз.
Сіздің мақсатыңыз - пайдаланушыларға Қазақстан тарихын қызықты әрі танымдық түрде үйрету.

Негізгі ережелер:
1. Тек қазақ тілінде жауап беріңіз.
2. Әрқашан сыпайы, білімді және жігерлендіретін болыңыз.
3. Егер пайдаланушы нақты тарихи оқиға туралы сұраса, қысқа бірақ мазмұнды түсіндірме беріңіз.
4. Егер пайдаланушы жаңа тест категориясын жасағысы келсе, оған категория атауын жазуды ұсыныңыз.
5. Жауаптарыңызда Markdown форматын қолданыңыз (маңызды сөздерді қалың қаріппен белгілеу, тізімдер қолдану және т.б.).
6. Сөйлесу контекстін сақтаңыз.
7. Қазақстан тарихына қатысы жоқ сұрақтарға әдепті түрде жауап беруден бас тартып, тарих тақырыбына оралуды ұсыныңыз.`;

export async function* chatWithAIStream(message: string, history: any[]) {
  const model = "gemini-3.1-flash-lite-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    },
    history: history.slice(-10) // Pass history here
  });

  const response = await chat.sendMessageStream({ 
    message: message 
  });

  for await (const chunk of response) {
    const c = chunk as GenerateContentResponse;
    yield c.text || "";
  }
}

export async function chatWithAI(message: string, history: any[]): Promise<string> {
  const model = "gemini-3.1-flash-lite-preview";
  
  const response = await ai.models.generateContent({
    model,
    config: {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    },
    contents: [
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', parts: [{ text: message }] }
    ]
  });

  return response.text || "Кешіріңіз, жауап бере алмадым.";
}

export async function generateCategory(prompt: string, existingCategoryCount: number): Promise<{ category: Category, questions: Question[] }> {
  const model = "gemini-3.1-flash-lite-preview";
  
  const systemInstruction = `You are a professional quiz creator for a Kazakh History tournament. 
  Your task is to generate a new quiz category and exactly 18 questions for it (6 questions for 10 points, 6 for 20 points, and 6 for 30 points).
  The output must be in Kazakh language.
  The category ID should be ${existingCategoryCount}.
  Each question must have 4 options and 1 correct index (0-3).
  The points must be exactly 10, 20, or 30.
  Return the data in the specified JSON format.`;

  const response = await ai.models.generateContent({
    model,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              icon: { type: Type.STRING, description: "A single emoji representing the category" }
            },
            required: ["name", "icon"]
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pts: { type: Type.INTEGER, description: "Points: 10, 20, or 30" },
                q: { type: Type.STRING, description: "The question text" },
                opts: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "4 answer options"
                },
                correct: { type: Type.INTEGER, description: "Index of the correct option (0-3)" }
              },
              required: ["pts", "q", "opts", "correct"]
            }
          }
        },
        required: ["category", "questions"]
      }
    },
    contents: `Generate a quiz category based on this request: "${prompt}"`
  });

  const data = JSON.parse(response.text || "{}");
  
  const category: Category = {
    id: existingCategoryCount,
    name: data.category.name,
    icon: data.category.icon
  };

  const questions: Question[] = data.questions.map((q: any) => ({
    ...q,
    cat: category.id
  }));

  return { category, questions };
}

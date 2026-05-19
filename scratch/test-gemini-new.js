import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const models = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3-flash-preview'];
  
  for (const m of models) {
    try {
      const response = await ai.models.generateContent({
        model: m,
        contents: 'hello',
      });
      console.log(`Success ${m}:`, response.text);
    } catch (e) {
      console.error(`Error ${m}:`, e.message);
    }
  }
}
test();

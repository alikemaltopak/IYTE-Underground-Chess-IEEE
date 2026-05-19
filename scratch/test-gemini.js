import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'hello',
    });
    console.log("Success 2.5:", response.text);
  } catch (e) {
    console.error("Error 2.5:", e.message);
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'hello',
    });
    console.log("Success 2.0:", response.text);
  } catch (e) {
    console.error("Error 2.0:", e.message);
  }
}
test();

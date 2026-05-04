import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    console.log("Testing gemini-2.0-flash...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: "Hello, say 'SYSTEM_READY' if you can hear me.",
    });
    console.log("Response:", response.text);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

main();

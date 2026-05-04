import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    console.log("Fetching available models...");
    const models = await ai.models.list();
    console.log("Response structure:", JSON.stringify(models, null, 2));
    if (Array.isArray(models)) {
      models.forEach(m => console.log(`- ${m.name}`));
    } else if (models.models) {
      models.models.forEach(m => console.log(`- ${m.name}`));
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

main();

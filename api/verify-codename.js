import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // CORS setup for serverless deployment
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { codename } = req.body;
    if (!codename) {
      return res.status(400).json({ valid: false, reason: "Kod adı belirtilmedi." });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY environment variable");
      return res.status(500).json({ valid: false, reason: "Sistem yapılandırma hatası (API Key missing)." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Stronger prompt to ensure JSON output and better validation
    const prompt = `
    You are the 'NEURAL_SECURITY_GATEWAY' for a cyberpunk chess tournament.
    Analyze the user's requested codename: "${codename}"
    
    Validation Rules:
    1. MUST NOT contain real human names (first or last names), typical Turkish name abbreviations (e.g., M.Ali, A.Kemal), or their common nicknames/diminutives (e.g., Ati, Furko, Memo, Ibo).
    2. MUST NOT contain real-world locations (cities, countries, specific addresses).
    3. MUST NOT contain ANY offensive, toxic, profanity, or inappropriate content. 
       - CRITICAL: You must detect Turkish swear words, insults, slang, and their common abbreviations (e.g., amk, aq, oc, sg, ibne, pic).
       - CRITICAL: You must detect advanced obfuscated profanity (leetspeak) and phonetic wordplays where letters are replaced by numbers, symbols, or have missing vowels (e.g., 0c, b0k, a.q, s1k, şrfsz).
       - CRITICAL: You must detect complex profanity mixed with numbers or numbers used phonetically in Turkish (e.g., "s2" = siki, "100" = yüz, "skip60", "s2le100leş").
    4. MUST maintain anonymity (cyberpunk aesthetic preferred).
    5. Length should be between 3 and 20 characters.
    
    Respond STRICTLY with a valid JSON object in this format:
    {
      "valid": boolean,
      "reason": "Clear explanation in Turkish if valid is false, otherwise empty string"
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response || !response.text) {
      throw new Error("AI did not return a valid response text.");
    }

    let result;
    try {
      result = JSON.parse(response.text);
    } catch (parseError) {
      console.error("JSON Parse Error:", response.text);
      // Fallback if AI doesn't return pure JSON despite the config
      const jsonMatch = response.text.match(/\{.*\}/s);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response as JSON.");
      }
    }

    res.status(200).json(result);

  } catch (error) {
    console.error("AI Verification Error:", error);
    res.status(500).json({ 
      valid: false, 
      reason: "Merkezi işlem birimi şu an meşgul. Lütfen birazdan tekrar deneyin. (" + error.message + ")" 
    });
  }
}

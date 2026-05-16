import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Basit CORS ayarı
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Gemini API başlat
// API anahtarını .env dosyasından okur
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/verify-codename', async (req, res) => {
  try {
    let { codename } = req.body;

    if (!codename) {
      return res.status(400).json({ valid: false, reason: "Kod adı boş olamaz." });
    }

    // Karakter temizliği (Normalize özel karakterleri boşluğa çevir, birden fazla boşluğu tek yap)
    codename = codename.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').trim();

    // Sadece rakam veya 3 karakterden kısaysa API'ye yormadan reddet (Yerel Filtre)
    if (codename.length < 3) {
      return res.json({ valid: false, reason: "Takma ad en az 3 karakter olmalıdır." });
    }
    if (/^\d+$/.test(codename)) {
      return res.json({ valid: false, reason: "Takma ad sadece rakamlardan oluşamaz." });
    }

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

    const result = JSON.parse(response.text);
    res.json(result);

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ valid: false, reason: "Sistem şu an meşgul." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Neural Verification Server running on port ${PORT}`);
});

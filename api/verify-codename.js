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

    console.log(`\n[YENİ İSTEK] Takma ad doğrulaması isteniyor: "${codename}"`);
    console.log(`[YAPAY ZEKA] Gemini modeline analiz isteği gönderiliyor...`);

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
      console.log(`[RET SEBEBİ] AI boş yanıt döndü (Güvenlik filtresi olabilir).`);
      return res.status(200).json({ valid: false, reason: "Yapay zeka güvenlik protokolü bu ismi şüpheli buldu." });
    }

    let result;
    try {
      result = JSON.parse(response.text);
    } catch (parseError) {
      console.error("JSON Parse Error:", response.text);
      // Fallback if AI doesn't return pure JSON despite the config
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        return res.status(200).json({ valid: false, reason: "Yapay zeka yanıtı işlenemedi, lütfen başka bir isim deneyin." });
      }
    }

    console.log(`[SONUÇ] Onaylandı mı?: ${result.valid ? 'EVET (Geçerli)' : 'HAYIR (Reddedildi)'}`);
    if (!result.valid) {
      console.log(`[RET SEBEBİ] ${result.reason}`);
    }

    res.status(200).json(result);

  } catch (error) {
    console.error("AI Verification Error:", error);
    // 500 yerine 200 dönüyoruz ki kullanıcı tarafında uygulama çökmesin
    res.status(200).json({ 
      valid: false, 
      reason: "Yapay zeka sunucuları meşgul veya hata oluştu (" + error.message + "), lütfen birazdan tekrar deneyin." 
    });
  }
}

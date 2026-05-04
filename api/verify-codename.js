import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    let { codename } = req.body;
    if (!codename) return res.status(400).json({ valid: false, reason: "Kod adı boş olamaz." });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ valid: false, reason: "API anahtarı eksik (GEMINI_API_KEY)." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
Bir yeraltı siberpunk satranç turnuvasının güvenlik moderatörüsün.
Kullanıcının kullanmak istediği takma ad: "${codename}"

Geçerli bir takma ad için kurallar:
1. Gerçek insan isimleri İÇERMEMELİ.
2. Gerçek lokasyonlar, şehirler veya adresler İÇERMEMELİ.
3. Toksik, hakaret, küfürlü veya cinsel içerik İÇERMEMELİ.
4. Anonimliği korumalıdır.

Lütfen bu takma adı analiz et. Kurallardan herhangi birini ihlal ediyorsa reddet.
SADECE aşağıdaki JSON formatında cevap ver:
{
  "valid": true/false,
  "reason": "Eğer false ise hata mesajı, true ise boş."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text);
    res.status(200).json(result);

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ valid: false, reason: "Sistem meşgul: " + error.message });
  }
}

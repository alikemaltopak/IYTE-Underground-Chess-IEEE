import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Basit CORS ayarı (Vercel serverless functions için)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    let { codename } = req.body;

    if (!codename) {
      return res.status(400).json({ valid: false, reason: "Kod adı boş olamaz." });
    }

    codename = codename.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').trim();

    if (codename.length < 3) {
      return res.json({ valid: false, reason: "Takma ad en az 3 karakter olmalıdır." });
    }
    if (/^\d+$/.test(codename)) {
      return res.json({ valid: false, reason: "Takma ad sadece rakamlardan oluşamaz." });
    }

    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Bir yeraltı siberpunk satranç turnuvasının güvenlik moderatörüsün.
Kullanıcının kullanmak istediği takma ad: "${codename}"

Geçerli bir takma ad için kurallar:
1. Gerçek insan isimleri İÇERMEMELİ (Örn: Ali, John, Kemal, Ayşe, Topak).
2. Gerçek lokasyonlar, şehirler veya adresler İÇERMEMELİ (Örn: Izmir, Turkey, London).
3. Toksik, hakaret, küfürlü veya cinsel içerik İÇERMEMELİ.
4. Anonimliği korumalıdır.

Lütfen bu takma adı analiz et. Kurallardan herhangi birini ihlal ediyorsa reddet.
SADECE aşağıdaki JSON formatında cevap ver, hiçbir ekstra metin veya markdown formatı kullanma:
{
  "valid": true/false,
  "reason": "Eğer false ise, siberpunk temasına uygun kısa bir hata mesajı (Örn: 'Gerçek kimlik tespit edildi', 'Uygunsuz dil tespit edildi', 'Lokasyon verisi engellendi'). Eğer true ise boş bırak."
}
`;

    const resultAI = await model.generateContent(prompt);
    const responseText = resultAI.response.text();
    
    // JSON temizleme (Markdown bloklarını kaldır)
    const cleanedJson = responseText.replace(/```json|```/gi, '').trim();
    const result = JSON.parse(cleanedJson);
    
    res.status(200).json(result);

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ valid: false, reason: "Sistem şu an meşgul." });
  }
}

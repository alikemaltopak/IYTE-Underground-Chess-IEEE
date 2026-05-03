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

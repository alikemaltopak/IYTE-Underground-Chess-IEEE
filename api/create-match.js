export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, reason: 'Sadece POST desteklenir.' });
  }

  try {
    const response = await fetch('https://lichess.org/api/challenge/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'clock.limit': '600',
        'clock.increment': '5',
        'name': 'Yeraltı Çatışması'
      })
    });

    const data = await response.json();

    if (data.id) {
      console.log(`[SATRANÇ] Yeni Maç Oluşturuldu: ${data.id}`);
      res.json({
        success: true,
        matchId: data.id,
        urlWhite: data.urlWhite,
        urlBlack: data.urlBlack
      });
    } else {
      console.error("[LICHESS API ERROR]", data);
      res.status(400).json({ success: false, reason: "Lichess Maç Oluşturamadı", details: data });
    }
  } catch (error) {
    console.error("Match Creation Error:", error);
    res.status(500).json({ success: false, reason: "Sunucu Hatası: " + error.message });
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { matchId } = req.query;

  if (!matchId) {
    return res.status(400).json({ success: false, reason: 'matchId gerekli.' });
  }

  try {
    const response = await fetch(`https://lichess.org/game/export/${matchId}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Lichess returns 404 if the game hasn't had any moves yet (just created)
        return res.json({ success: true, status: 'created' });
      }
      return res.json({ success: false, status: 'Maç bulunamadı veya hata oluştu.' });
    }

    const gameData = await response.json();

    res.json({
      success: true,
      status: gameData.status,
      winner: gameData.winner || 'Beraberlik'
    });
  } catch (error) {
    console.error("Fetch Result Error:", error);
    res.status(500).json({ success: false, reason: "Sunucu Hatası: " + error.message });
  }
}

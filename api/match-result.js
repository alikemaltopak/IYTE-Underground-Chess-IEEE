import { applyCors } from './_lib/auth.js';

// Lichess oyun kimlikleri 8 (oyun) veya 12 (oyuncuya özel) karakterdir; başka bir şeyin URL'ye eklenmesine izin verme.
const LICHESS_ID = /^[A-Za-z0-9]{8}([A-Za-z0-9]{4})?$/;

export default async function handler(req, res) {
  if (applyCors(req, res, 'GET')) return;

  const { matchId, full } = req.query;

  if (!matchId) {
    return res.status(400).json({ success: false, reason: 'matchId gerekli.' });
  }
  if (!LICHESS_ID.test(String(matchId))) {
    return res.status(400).json({ success: false, reason: 'Geçersiz matchId.' });
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
      winner: gameData.winner || 'Beraberlik',
      ...(full === 'true' ? { gameData } : {})
    });
  } catch (error) {
    console.error("Fetch Result Error:", error);
    res.status(500).json({ success: false, reason: "Sunucu Hatası" });
  }
}

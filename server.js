// Yerel geliştirme sunucusu: /api isteklerini canlıdaki (Vercel) fonksiyonların aynısıyla karşılar.
// Böylece doğrulama, yetki ve Lichess/Gemini mantığı tek yerde (api/) tutulur.
import express from 'express';
import dotenv from 'dotenv';
import verifyCodename from './api/verify-codename.js';
import createMatch from './api/create-match.js';
import matchResult from './api/match-result.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10kb' }));

app.all('/api/verify-codename', verifyCodename);
app.all('/api/create-match', createMatch);
app.all('/api/match-result', matchResult);
// Geriye uyumluluk: /api/match-result/:matchId
app.get('/api/match-result/:matchId', (req, res) => {
  req.query = { ...req.query, matchId: req.params.matchId };
  return matchResult(req, res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Neural Verification Server running on port ${PORT}`);
});

// Sunucu fonksiyonları için ortak güvenlik yardımcıları.
// Firebase kimlik jetonu (ID token) doğrulaması servis hesabı gerektirmez; sadece proje kimliği yeterlidir.
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = () => process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

export const adminEmails = () =>
  (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

let verifier = null;
/** Testlerde jeton doğrulayıcıyı değiştirmek için. */
export const setTokenVerifier = (fn) => { verifier = fn; };

const defaultVerifier = async (token) => {
  if (!getApps().length) initializeApp({ projectId: projectId() });
  return getAuth().verifyIdToken(token);
};

/** Authorization: Bearer <token> başlığını doğrular; geçersizse yanıtı gönderip null döner. */
export async function requireUser(req, res) {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const match = /^Bearer (.+)$/.exec(header);
  if (!match) {
    res.status(401).json({ success: false, valid: false, reason: 'Oturum açmanız gerekiyor.' });
    return null;
  }
  try {
    return await (verifier || defaultVerifier)(match[1]);
  } catch {
    res.status(401).json({ success: false, valid: false, reason: 'Oturum doğrulanamadı.' });
    return null;
  }
}

/** Doğrulanmış e-postası admin listesinde olan kullanıcıyı ister. */
export async function requireAdmin(req, res) {
  const user = await requireUser(req, res);
  if (!user) return null;
  const email = (user.email || '').toLowerCase();
  if (!user.email_verified || !adminEmails().includes(email)) {
    res.status(403).json({ success: false, reason: 'Bu işlem sadece yöneticilere açıktır.' });
    return null;
  }
  return user;
}

/**
 * CORS: sadece ALLOWED_ORIGINS'te listelenen sitelere izin verir (aynı sitedeki istekler için gerekmez).
 * OPTIONS ön isteğini yanıtladıysa true döner.
 */
export function applyCors(req, res, methods) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
  const origin = req.headers?.origin;
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', `${methods}, OPTIONS`);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

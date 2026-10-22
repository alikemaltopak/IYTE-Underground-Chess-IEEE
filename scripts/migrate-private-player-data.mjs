// Mevcut players/{uid} kayıtlarındaki e-posta ve öğrenci numarasını gizli koleksiyonlara taşır:
//   players_private/{uid} = { email, studentId }   (sadece sahibi ve adminler okuyabilir)
//   student_ids/{studentId} = { uid }              (öğrenci no benzersizliği)
// ve bu alanları herkese açık players/{uid} belgesinden siler.
//
// Kullanım (firebase-admin, servis hesabı ile):
//   GOOGLE_APPLICATION_CREDENTIALS=servis-hesabi.json node scripts/migrate-private-player-data.mjs          # sadece rapor
//   GOOGLE_APPLICATION_CREDENTIALS=servis-hesabi.json node scripts/migrate-private-player-data.mjs --apply  # uygula
//
// Yeni firestore.rules kurallarını bu betik --apply ile çalıştıktan SONRA yayınlayın.
import admin from 'firebase-admin';

const apply = process.argv.includes('--apply');
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
const db = admin.firestore();

const players = await db.collection('players').get();
let moved = 0, skipped = 0;
const seenStudentIds = new Map();

for (const snap of players.docs) {
  const { email, studentId } = snap.data();
  if (email === undefined && studentId === undefined) { skipped++; continue; }

  if (studentId && seenStudentIds.has(studentId)) {
    console.warn(`⚠  Öğrenci no ${studentId} iki oyuncuda var: ${seenStudentIds.get(studentId)} ve ${snap.id} — elle kontrol edin`);
  }
  if (studentId) seenStudentIds.set(studentId, snap.id);

  console.log(`${apply ? '→' : '(rapor)'} ${snap.id}: e-posta ${email ? 'var' : 'yok'}, öğrenci no ${studentId ? 'var' : 'yok'}`);
  if (apply) {
    const batch = db.batch();
    batch.set(db.collection('players_private').doc(snap.id), {
      ...(email !== undefined ? { email } : {}),
      ...(studentId !== undefined ? { studentId } : {}),
    }, { merge: true });
    if (studentId) batch.set(db.collection('student_ids').doc(String(studentId)), { uid: snap.id });
    batch.update(snap.ref, {
      email: admin.firestore.FieldValue.delete(),
      studentId: admin.firestore.FieldValue.delete(),
    });
    await batch.commit();
  }
  moved++;
}

console.log(`\n${players.size} oyuncu: ${moved} taşınacak${apply ? '/taşındı' : ''}, ${skipped} zaten temiz.`);
if (!apply) console.log('Hiçbir şey yazılmadı. Uygulamak için --apply ekleyin.');
process.exit(0);

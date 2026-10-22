import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  initializeTestEnvironment, assertSucceeds, assertFails, RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, writeBatch, serverTimestamp, query, where,
} from 'firebase/firestore';

let env: RulesTestEnvironment;
let openEnv: RulesTestEnvironment; // kayıt son tarihi ileri alınmış kopya: kayıt açıkken davranışı sınamak için

const ADMIN = { email: 'alikemaltopak@gmail.com', email_verified: true };
const FAKE_ADMIN = { email: 'keremkasikci2005@gmail.com', email_verified: false }; // doğrulanmamış
const as = (uid: string, token: Record<string, unknown> = { email: `${uid}@std.iyte.edu.tr`, email_verified: true }) =>
  env.authenticatedContext(uid, token).firestore();
const anon = () => env.unauthenticatedContext().firestore();

/** Gerçek uygulamadaki gibi kayıt: herkese açık kart + gizli bilgi + öğrenci no rezervasyonu tek batch'te */
const register = (db: any, uid: string, studentId = '290201001', email = `${uid}@std.iyte.edu.tr`) => {
  const b = writeBatch(db);
  b.set(doc(db, 'players', uid), { uid, codename: 'NEON_RAVEN', archetype: 'TACTICS', joinedAt: serverTimestamp(), status: 'registered' });
  b.set(doc(db, 'players_private', uid), { email, studentId });
  b.set(doc(db, 'student_ids', studentId), { uid });
  return b.commit();
};

beforeAll(async () => {
  const rules = fs.readFileSync(process.env.RULES_FILE || path.resolve(__dirname, '../firestore.rules'), 'utf8');
  env = await initializeTestEnvironment({ projectId: 'iyte-rules-test', firestore: { rules } });
  const openRules = rules.replace('timestamp.date(2026, 6, 6)', 'timestamp.date(2099, 1, 1)');
  if (openRules === rules && !process.env.RULES_FILE) throw new Error('Kayıt son tarihi kuralda bulunamadı');
  openEnv = await initializeTestEnvironment({ projectId: 'iyte-rules-test-open', firestore: { rules: openRules } });
});
afterAll(async () => { await env?.cleanup(); await openEnv?.cleanup(); });

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'players', 'p1'), { uid: 'p1', codename: 'GHOST', archetype: 'TACTICS', status: 'active', wins: 1 });
    await setDoc(doc(db, 'players_private', 'p1'), { email: 'p1@std.iyte.edu.tr', studentId: '290201010' });
    await setDoc(doc(db, 'student_ids', '290201010'), { uid: 'p1' });
    await setDoc(doc(db, 'players', 'p2'), { uid: 'p2', codename: 'SHADOW', archetype: 'TACTICS', status: 'active', wins: 0 });
    await setDoc(doc(db, 'tournament', 'current'), { format: 'round_robin', status: 'active', rounds: [] });
    await setDoc(doc(db, 'matches', 'm1'), { whitePlayerId: 'p1', blackPlayerId: 'p2', status: 'active' });
    await setDoc(doc(db, 'player_matches', 'p1'), { upcomingMatch: 'https://lichess.org/m1?color=white', matchId: 'm1', matchColor: 'white' });
  });
});

describe('Kişisel veriler (e-posta, öğrenci no)', () => {
  it('oturum açmamış biri oyuncu kartlarını görebilir ama gizli bilgileri göremez', async () => {
    await assertSucceeds(getDocs(collection(anon(), 'players')));
    await assertFails(getDoc(doc(anon(), 'players_private', 'p1')));
    await assertFails(getDocs(collection(anon(), 'players_private')));
  });

  it('başka bir oyuncu gizli bilgileri okuyamaz ve listeleyemez; sahibi ve admin okuyabilir', async () => {
    await assertFails(getDoc(doc(as('p2'), 'players_private', 'p1')));
    await assertFails(getDocs(collection(as('p2'), 'players_private')));
    await assertSucceeds(getDoc(doc(as('p1'), 'players_private', 'p1')));
    await assertSucceeds(getDocs(collection(as('admin', ADMIN), 'players_private')));
  });

  it('öğrenci numaraları listelenemez; sadece belirli bir numaranın alınıp alınmadığı sorulabilir', async () => {
    await assertFails(getDocs(collection(as('p2'), 'student_ids')));
    await assertSucceeds(getDoc(doc(as('p2'), 'student_ids', '290201010')));
    await assertFails(getDoc(doc(anon(), 'student_ids', '290201010')));
  });
});

describe('Kayıt (karakter oluşturma)', () => {
  const asOpen = (uid: string, email = `${uid}@std.iyte.edu.tr`) =>
    openEnv.authenticatedContext(uid, { email, email_verified: true }).firestore();

  beforeEach(async () => {
    await openEnv.clearFirestore();
    await openEnv.withSecurityRulesDisabled(async ctx => {
      await setDoc(doc(ctx.firestore(), 'student_ids', '290201010'), { uid: 'p1' });
    });
  });

  it('kayıt açıkken uygulamanın yaptığı kayıt (kart + gizli bilgi + numara rezervasyonu) başarılı olur', async () => {
    await assertSucceeds(register(asOpen('p3'), 'p3', '290201003'));
  });

  it('kayıt süresi (6 Haziran 2026 23:59 TSİ) geçince yeni kayıt reddedilir, admin yine ekleyebilir', async () => {
    await assertFails(register(as('p3'), 'p3', '290201003'));
    await assertSucceeds(setDoc(doc(as('admin', ADMIN), 'players', 'p3'), { uid: 'p3', codename: 'X_RAY', archetype: 'TACTICS', status: 'registered' }));
  });

  it('başkası adına, alınmış öğrenci numarasıyla, başka e-postayla veya ek alanla kayıt yapılamaz', async () => {
    const db = asOpen('p3');
    await assertFails(setDoc(doc(db, 'players_private', 'p9'), { email: 'p3@std.iyte.edu.tr', studentId: '290201099' }));
    await assertFails(register(db, 'p3', '290201010'));                       // p1'in numarası
    await assertFails(register(db, 'p3', '290201003', 'baskasi@gmail.com'));  // e-posta jetondakinden farklı
    const b = writeBatch(db);                                                  // kendine skor/durum vermeye çalışıyor
    b.set(doc(db, 'players', 'p3'), { uid: 'p3', codename: 'NEON', archetype: 'TACTICS', joinedAt: serverTimestamp(), status: 'active', wins: 10 });
    await assertFails(b.commit());
  });
});

describe('Oyuncu kendi kartında sadece kod adı ve arketipi değiştirebilir', () => {
  it('kod adı / arketip değişikliğine izin verilir', async () => {
    await assertSucceeds(updateDoc(doc(as('p1'), 'players', 'p1'), { codename: 'NEW_GHOST', archetype: 'PLAN MAKING' }));
  });
  it('skor, durum veya geçersiz değer yazılamaz', async () => {
    await assertFails(updateDoc(doc(as('p1'), 'players', 'p1'), { wins: 99 }));
    await assertFails(updateDoc(doc(as('p1'), 'players', 'p1'), { status: 'registered' }));
    await assertFails(updateDoc(doc(as('p1'), 'players', 'p1'), { codename: 'BU_KOD_ADI_COK_UZUN_OLDU' }));
    await assertFails(updateDoc(doc(as('p1'), 'players', 'p1'), { archetype: 'GOD MODE' }));
  });
  it('başkasının kartı değiştirilemez; öğrenci numarası değiştirilemez', async () => {
    await assertFails(updateDoc(doc(as('p2'), 'players', 'p1'), { codename: 'HACKED' }));
    await assertFails(updateDoc(doc(as('p1'), 'players_private', 'p1'), { studentId: '290201099' }));
  });
});

describe('Admin yetkisi', () => {
  it('doğrulanmış admin turnuvayı ve skorları yönetebilir', async () => {
    await assertSucceeds(updateDoc(doc(as('admin', ADMIN), 'tournament', 'current'), { status: 'completed' }));
    await assertSucceeds(updateDoc(doc(as('admin', ADMIN), 'players', 'p2'), { wins: 3, status: 'eliminated' }));
  });
  it('admin e-postasıyla açılmış ama DOĞRULANMAMIŞ hesap admin sayılmaz', async () => {
    await assertFails(updateDoc(doc(as('x', FAKE_ADMIN), 'tournament', 'current'), { status: 'completed' }));
    await assertFails(deleteDoc(doc(as('x', FAKE_ADMIN), 'players', 'p1')));
  });
  it('oyuncular turnuvayı değiştiremez, oturumsuz kimse yazamaz', async () => {
    await assertFails(updateDoc(doc(as('p1'), 'tournament', 'current'), { status: 'completed' }));
    await assertFails(setDoc(doc(anon(), 'tournament', 'current'), { deleted: true }));
    await assertSucceeds(getDoc(doc(anon(), 'tournament', 'current')));
  });
});

describe('Maçlar ve kişiye özel linkler', () => {
  it('oyuncu sadece kendi renginin "maça girdi" işaretini koyabilir', async () => {
    await assertSucceeds(updateDoc(doc(as('p1'), 'matches', 'm1'), { whiteJoined: true }));
    await assertFails(updateDoc(doc(as('p1'), 'matches', 'm1'), { blackJoined: true }));
    await assertFails(updateDoc(doc(as('p1'), 'matches', 'm1'), { status: 'completed', winner: 'white' }));
    await assertFails(updateDoc(doc(as('p3'), 'matches', 'm1'), { whiteJoined: true }));
  });
  it('maç oluşturma/silme sadece admin', async () => {
    await assertFails(setDoc(doc(as('p1'), 'matches', 'm2'), { whitePlayerId: 'p1', blackPlayerId: 'p2' }));
    await assertSucceeds(setDoc(doc(as('admin', ADMIN), 'matches', 'm2'), { whitePlayerId: 'p1', blackPlayerId: 'p2' }));
  });
  it('kişiye özel Lichess linkini sadece sahibi (ve admin) görür, kimse kendine yazamaz', async () => {
    await assertSucceeds(getDoc(doc(as('p1'), 'player_matches', 'p1')));
    await assertFails(getDoc(doc(as('p2'), 'player_matches', 'p1')));
    await assertFails(setDoc(doc(as('p2'), 'player_matches', 'p2'), { upcomingMatch: 'x' }));
    await assertSucceeds(getDoc(doc(as('admin', ADMIN), 'player_matches', 'p1')));
  });
});

describe('Uygulamanın kullandığı sorgular', () => {
  it('kod adı benzersizlik sorgusu ve eski kayıtlar için öğrenci no sorgusu çalışır', async () => {
    await assertSucceeds(getDocs(query(collection(as('p2'), 'players'), where('codename', 'in', ['GHOST']))));
    await assertSucceeds(getDocs(query(collection(as('p2'), 'players'), where('studentId', '==', '290201010'))));
  });
});

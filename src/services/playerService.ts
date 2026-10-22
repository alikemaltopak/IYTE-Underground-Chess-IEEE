import { 
  doc, getDoc, collection, query, orderBy, onSnapshot, 
  serverTimestamp, Timestamp, where, getDocs, writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';

// Koleksiyonlar:
//  players/{uid}          → herkese açık oyuncu kartı (kod adı, arketip, durum, skor)
//  players_private/{uid}  → kişisel bilgiler (e-posta, öğrenci no): sadece sahibi ve adminler okuyabilir
//  student_ids/{no}       → öğrenci numarası benzersizliği için rezervasyon ({ uid })
export const PRIVATE_COLLECTION = 'players_private';
export const STUDENT_IDS_COLLECTION = 'student_ids';

export interface PlayerMatchInfo {
  upcomingMatch?: string;
  matchId?: string;
  matchColor?: 'white' | 'black';
}

export interface PlayerPrivateData {
  email: string;
  studentId: string;
}

export interface PlayerData {
  uid: string;
  codename: string;
  archetype: string;
  joinedAt: Timestamp | null;
  status: 'registered' | 'active' | 'eliminated';
  // Kişisel bilgiler: sadece sahibi/admin için getPlayer ile birleştirilir (eski kayıtlarda players içinde olabilir)
  studentId?: string;
  email?: string;
  // Lichess Hayalet Maç Alanları (Artık player_matches koleksiyonunda tutuluyor)
  upcomingMatch?: string;
  matchId?: string;
  matchColor?: 'white' | 'black';
  // Skor Takibi
  wins?: number;
  losses?: number;
  draws?: number;
}

// Check if a studentId is already used (only for NEW character creation)
export const isStudentIdTaken = async (studentId: string): Promise<boolean> => {
  const reservation = await getDoc(doc(db, STUDENT_IDS_COLLECTION, studentId));
  if (reservation.exists()) return true;
  // Taşıma betiği çalıştırılmadan önceki eski kayıtlar
  const q = query(collection(db, 'players'), where('studentId', '==', studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.length > 0;
};

// Check if a codename is already used (excluding a specific uid)
export const isCodenameTaken = async (codename: string, excludeUid?: string): Promise<boolean> => {
  const upperCodename = codename.toUpperCase();
  // Yeni kayıtlar büyük harfle saklanır; eski kayıtlar yazıldığı gibi durabilir, ikisini de ara.
  const variants = Array.from(new Set([codename, upperCodename]));
  const q = query(collection(db, 'players'), where('codename', 'in', variants));
  const snapshot = await getDocs(q);
  if (excludeUid) {
    return snapshot.docs.some(doc => doc.id !== excludeUid);
  }
  return snapshot.docs.length > 0;
};

// Check if student ID can be updated (should not be allowed after creation)
export const canUpdateStudentId = async (uid: string, newStudentId: string): Promise<boolean> => {
  const existingPlayer = await getPlayer(uid);
  if (!existingPlayer) return true; // Yeni karakter oluşturabilir
  // StudentID'si varsa değiştiremez
  return false;
};

// Save or update a player profile (with uniqueness validation)
export const savePlayer = async (
  uid: string, 
  data: { codename: string; studentId: string; archetype: string; email: string }
): Promise<{ success: boolean; error?: string }> => {
  const existingPlayer = await getPlayer(uid);
  
  // YENI KARAKTER OLUŞTURMA
  if (!existingPlayer) {
    // Check duplicate student ID
    const studentTaken = await isStudentIdTaken(data.studentId);
    if (studentTaken) {
      return { success: false, error: 'Bu öğrenci numarası zaten başka bir hesapta kayıtlı.' };
    }

    // Check duplicate codename
    const codenameTaken = await isCodenameTaken(data.codename);
    if (codenameTaken) {
      return { success: false, error: 'Bu kullanıcı adı zaten başka bir oyuncu tarafından kullanılıyor.' };
    }

    // Herkese açık kart, gizli bilgiler ve öğrenci no rezervasyonu tek seferde yazılır
    const batch = writeBatch(db);
    batch.set(doc(db, 'players', uid), {
      uid,
      codename: data.codename.toUpperCase(),
      archetype: data.archetype,
      joinedAt: serverTimestamp(),
      status: 'registered'
    });
    batch.set(doc(db, PRIVATE_COLLECTION, uid), {
      email: data.email,
      studentId: data.studentId
    });
    batch.set(doc(db, STUDENT_IDS_COLLECTION, data.studentId), { uid });
    await batch.commit();

    return { success: true };
  }
  
  // KARAKTERİ GÜNCELLEME - StudentID DEĞİŞTİRİLEMEZ
  if (existingPlayer.studentId !== data.studentId) {
    return { success: false, error: 'Öğrenci numarası sabit tutulmuştur ve değiştirilemez.' };
  }

  // Codename değiştirmişse kontrol et
  if (existingPlayer.codename.toUpperCase() !== data.codename.toUpperCase()) {
    const codenameTaken = await isCodenameTaken(data.codename, uid);
    if (codenameTaken) {
      return { success: false, error: 'Bu kullanıcı adı zaten başka bir oyuncu tarafından kullanılıyor.' };
    }
  }

  // Update işlemi (oyuncu sadece kod adı ve arketipini değiştirebilir)
  const batch = writeBatch(db);
  batch.update(doc(db, 'players', uid), {
    codename: data.codename.toUpperCase(),
    archetype: data.archetype
  });
  await batch.commit();

  return { success: true };
};

/** Oyuncunun gizli bilgileri (sadece kendisi ve adminler okuyabilir). */
export const getPlayerPrivate = async (uid: string): Promise<PlayerPrivateData | null> => {
  const snap = await getDoc(doc(db, PRIVATE_COLLECTION, uid));
  return snap.exists() ? (snap.data() as PlayerPrivateData) : null;
};

// Check if a player already exists (kendi profilini okurken gizli bilgiler de eklenir)
export const getPlayer = async (uid: string): Promise<PlayerData | null> => {
  const snap = await getDoc(doc(db, 'players', uid));
  if (!snap.exists()) return null;
  const publicData = snap.data() as PlayerData;
  const privateData = await getPlayerPrivate(uid).catch(() => null);
  return { ...publicData, ...(privateData || {}) };
};

// Subscribe to all players in real-time (for the dashboard) — sadece herkese açık alanlar
export const subscribeToPlayers = (callback: (players: PlayerData[]) => void) => {
  const q = query(collection(db, 'players'), orderBy('joinedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const players: PlayerData[] = [];
    snapshot.forEach((doc) => {
      players.push(doc.data() as PlayerData);
    });
    callback(players);
  });
};

/** Admin paneli: tüm oyuncuların gizli bilgileri (Firestore kuralları sadece adminlere izin verir). */
export const subscribeToPlayersPrivate = (callback: (byUid: Record<string, PlayerPrivateData>) => void) => {
  return onSnapshot(collection(db, PRIVATE_COLLECTION), (snapshot) => {
    const byUid: Record<string, PlayerPrivateData> = {};
    snapshot.forEach((d) => { byUid[d.id] = d.data() as PlayerPrivateData; });
    callback(byUid);
  }, (err) => console.error('Gizli oyuncu bilgileri okunamadı:', err));
};

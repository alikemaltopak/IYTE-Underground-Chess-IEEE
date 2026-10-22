import { 
  doc, setDoc, getDoc, collection, query, orderBy, onSnapshot, 
  serverTimestamp, Timestamp, where, getDocs 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface PlayerMatchInfo {
  upcomingMatch?: string;
  matchId?: string;
  matchColor?: 'white' | 'black';
}

export interface PlayerData {
  uid: string;
  codename: string;
  studentId: string;
  archetype: string;
  email: string;
  joinedAt: Timestamp | null;
  status: 'registered' | 'active' | 'eliminated';
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

    const playerRef = doc(db, 'players', uid);
    await setDoc(playerRef, {
      uid,
      codename: data.codename.toUpperCase(),
      studentId: data.studentId,
      archetype: data.archetype,
      email: data.email,
      joinedAt: serverTimestamp(),
      status: 'registered'
    }, { merge: true });

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

  // Update işlemi
  const playerRef = doc(db, 'players', uid);
  await setDoc(playerRef, {
    codename: data.codename.toUpperCase(),
    archetype: data.archetype
  }, { merge: true });

  return { success: true };
};

// Check if a player already exists
export const getPlayer = async (uid: string): Promise<PlayerData | null> => {
  const playerRef = doc(db, 'players', uid);
  const snap = await getDoc(playerRef);
  if (snap.exists()) {
    return snap.data() as PlayerData;
  }
  return null;
};

// Subscribe to all players in real-time (for the dashboard)
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

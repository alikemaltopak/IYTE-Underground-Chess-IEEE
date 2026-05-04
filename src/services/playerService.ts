import { 
  doc, setDoc, getDoc, collection, query, orderBy, onSnapshot, 
  serverTimestamp, Timestamp, where, getDocs 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface PlayerData {
  uid: string;
  codename: string;
  studentId: string;
  archetype: string;
  email: string;
  joinedAt: Timestamp | null;
  status: 'registered' | 'active' | 'eliminated';
}

// Check if a studentId is already used by another player
export const isStudentIdTaken = async (studentId: string, currentUid: string): Promise<boolean> => {
  const q = query(collection(db, 'players'), where('studentId', '==', studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.some(doc => doc.id !== currentUid);
};

// Check if a codename is already used by another player
export const isCodenameTaken = async (codename: string, currentUid: string): Promise<boolean> => {
  const upperCodename = codename.toUpperCase();
  const q = query(collection(db, 'players'), where('codename', '==', upperCodename));
  const snapshot = await getDocs(q);
  // Also check case-insensitive by querying the original
  if (snapshot.docs.some(doc => doc.id !== currentUid)) return true;
  const q2 = query(collection(db, 'players'), where('codename', '==', codename));
  const snapshot2 = await getDocs(q2);
  return snapshot2.docs.some(doc => doc.id !== currentUid);
};

// Save or update a player profile (with uniqueness validation)
export const savePlayer = async (
  uid: string, 
  data: { codename: string; studentId: string; archetype: string; email: string }
): Promise<{ success: boolean; error?: string }> => {
  // Check duplicate student ID
  const studentTaken = await isStudentIdTaken(data.studentId, uid);
  if (studentTaken) {
    return { success: false, error: 'Bu öğrenci numarası zaten başka bir hesapta kayıtlı.' };
  }

  // Check duplicate codename
  const codenameTaken = await isCodenameTaken(data.codename, uid);
  if (codenameTaken) {
    return { success: false, error: 'Bu kullanıcı adı zaten başka bir oyuncu tarafından kullanılıyor.' };
  }

  const playerRef = doc(db, 'players', uid);
  await setDoc(playerRef, {
    uid,
    codename: data.codename,
    studentId: data.studentId,
    archetype: data.archetype,
    email: data.email,
    joinedAt: serverTimestamp(),
    status: 'registered'
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

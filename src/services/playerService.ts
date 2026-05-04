import { 
  doc, setDoc, getDoc, collection, query, orderBy, onSnapshot, 
  serverTimestamp, Timestamp 
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

// Save or update a player profile
export const savePlayer = async (
  uid: string, 
  data: { codename: string; studentId: string; archetype: string; email: string }
) => {
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

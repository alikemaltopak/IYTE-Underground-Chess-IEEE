import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const tourneySnap = await getDoc(doc(db, "tournament", "current"));
  if (!tourneySnap.exists() || tourneySnap.data().deleted) {
    console.log("No active tournament found!");
    return;
  }
  
  const tourneyData = tourneySnap.data();
  console.log("=================== TOURNAMENT CURRENT STATUS ===================");
  console.log("Format:", tourneyData.format);
  console.log("Status:", tourneyData.status);
  console.log("Rounds count:", tourneyData.rounds?.length);
  console.log("Players in tournament:", tourneyData.playerIds?.length);
  
  const playersSnap = await getDocs(collection(db, "players"));
  const players = playersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  console.log("\n=================== PLAYERS LOSS COUNTS & STATUS ===================");
  players.forEach(p => {
    if (tourneyData.playerIds?.includes(p.id)) {
      console.log(`Codename: ${p.codename} | Status: ${p.status} | Wins: ${p.wins || 0} | Losses: ${p.losses || 0} | Draws: ${p.draws || 0}`);
    }
  });
}

run().catch(console.error);

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
  const playersSnap = await getDocs(collection(db, "players"));
  const playerNames = {};
  playersSnap.docs.forEach(d => {
    playerNames[d.id] = d.data().codename || d.id;
  });

  console.log("=================== TOURNAMENT DETAILS ===================");
  console.log("Format:", tourneyData.format);
  console.log("Status:", tourneyData.status);
  
  // Calculate standings from rounds
  const standings = {};
  tourneyData.playerIds.forEach(id => {
    standings[id] = { wins: 0, losses: 0, draws: 0 };
  });

  tourneyData.rounds.forEach((round, rIdx) => {
    console.log(`\n--- ROUND ${round.roundNumber} ---`);
    round.matches.forEach(m => {
      const p1 = playerNames[m.player1Id] || m.player1Id;
      const p2 = playerNames[m.player2Id] || m.player2Id;
      console.log(`Match ID: ${m.id} | ${p1} vs ${p2} | Status: ${m.status} | Winner: ${playerNames[m.winnerId] || m.winnerId || "None"}`);
      
      if (m.status === 'completed' && m.winnerId) {
        if (m.winnerId === 'draw') {
          if (m.player1Id !== 'BYE' && standings[m.player1Id]) standings[m.player1Id].draws++;
          if (m.player2Id !== 'BYE' && standings[m.player2Id]) standings[m.player2Id].draws++;
        } else {
          const loser = m.winnerId === m.player1Id ? m.player2Id : m.player1Id;
          if (standings[m.winnerId]) standings[m.winnerId].wins++;
          if (loser !== 'BYE' && standings[loser]) standings[loser].losses++;
        }
      }
    });
  });

  console.log("\n=================== TOURNAMENT STANDINGS (FROM ROUNDS ONLY) ===================");
  Object.keys(standings).forEach(id => {
    const s = standings[id];
    console.log(`Player: ${playerNames[id]} | Wins: ${s.wins} | Losses: ${s.losses} | Draws: ${s.draws}`);
  });
}

run().catch(console.error);

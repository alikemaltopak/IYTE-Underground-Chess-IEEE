import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
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
  const tourneyRef = doc(db, "tournament", "current");
  const tourneySnap = await getDoc(tourneyRef);
  if (!tourneySnap.exists() || tourneySnap.data().deleted) {
    console.log("No active tournament found!");
    return;
  }
  
  const tourneyData = tourneySnap.data();
  const rounds = JSON.parse(JSON.stringify(tourneyData.rounds));
  const round3 = rounds[2]; // Round 3 index is 2
  
  if (!round3 || round3.roundNumber !== 3) {
    console.error("Round 3 not found at index 2!");
    return;
  }

  // Find the UIDs of the players in Round 3
  let kingshadowUid = "";
  let impregnableWandererUid = "";
  let muzcevizUid = "";

  // Scan matches in Round 3 to find kingshadow and impregnable_wanderer
  round3.matches.forEach(m => {
    // We will find UIDs by checking matching names if we can or scan players collection.
  });

  // Let's query the players collection to get exact UIDs
  const { collection, getDocs } = await import("firebase/firestore");
  const playersSnap = await getDocs(collection(db, "players"));
  playersSnap.docs.forEach(d => {
    const data = d.data();
    if (data.codename === "kingshadow") kingshadowUid = d.id;
    if (data.codename === "impregnable_wanderer") impregnableWandererUid = d.id;
    if (data.codename === "muzceviz") muzcevizUid = d.id;
  });

  console.log(`kingshadow UID: ${kingshadowUid}`);
  console.log(`impregnable_wanderer UID: ${impregnableWandererUid}`);
  console.log(`muzceviz UID: ${muzcevizUid}`);

  if (!kingshadowUid || !impregnableWandererUid || !muzcevizUid) {
    console.error("Could not find all player UIDs!");
    return;
  }

  // 1. Modify the match r3_lm12: replace kingshadow with impregnable_wanderer
  let matchFound = false;
  round3.matches.forEach(m => {
    if (m.id === "r3_lm12") {
      if (m.player1Id === kingshadowUid) {
        m.player1Id = impregnableWandererUid;
        matchFound = true;
        console.log("Updated match r3_lm12 to use impregnable_wanderer as player1.");
      } else if (m.player2Id === kingshadowUid) {
        m.player2Id = impregnableWandererUid;
        matchFound = true;
        console.log("Updated match r3_lm12 to use impregnable_wanderer as player2.");
      }
    }
  });

  if (!matchFound) {
    console.error("Could not find match r3_lm12 with kingshadow!");
    return;
  }

  // 2. Remove the match r3_lbye (impregnable_wanderer vs BYE)
  const initialCount = round3.matches.length;
  round3.matches = round3.matches.filter(m => m.id !== "r3_lbye");
  console.log(`Removed r3_lbye. Matches count changed from ${initialCount} to ${round3.matches.length}`);

  // 3. Update the tournament document
  await updateDoc(tourneyRef, { rounds });
  console.log("Tournament document updated successfully!");

  // 4. Set players status
  const kingshadowRef = doc(db, "players", kingshadowUid);
  await updateDoc(kingshadowRef, { status: "eliminated" });
  console.log("kingshadow status marked as 'eliminated'.");

  const wandererRef = doc(db, "players", impregnableWandererUid);
  await updateDoc(wandererRef, { status: "active" });
  console.log("impregnable_wanderer status marked as 'active'.");
}

run().catch(console.error);

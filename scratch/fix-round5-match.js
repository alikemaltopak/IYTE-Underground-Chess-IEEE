import admin from 'firebase-admin';

// Initialize firebase admin using environment default credentials
admin.initializeApp({
  projectId: 'iyte-satranc-ieee'
});

const db = admin.firestore();

async function run() {
  const docRef = db.collection('tournament').doc('current');
  const docSnap = await docRef.get();
  
  if (!docSnap.exists) {
    console.error("Tournament document does not exist!");
    return;
  }
  
  const data = docSnap.data();
  const rounds = data.rounds || [];
  
  if (rounds.length < 5) {
    console.error("Round 5 does not exist in the database!");
    return;
  }
  
  const r5 = rounds[4];
  const matches = r5.matches || [];
  
  console.log("Current Round 5 Matches:");
  matches.forEach((m, idx) => {
    console.log(`- Match ${idx}: ID=${m.id}, P1=${m.player1Id}, P2=${m.player2Id}`);
  });
  
  // Find match where one of the players is yeraltıcanavarı (N499KUYAcSZafSqB0iKEfPwx80h2)
  const targetMatch = matches.find(m => m.player1Id === 'N499KUYAcSZafSqB0iKEfPwx80h2' || m.player2Id === 'N499KUYAcSZafSqB0iKEfPwx80h2');
  if (targetMatch) {
    console.log("\nFound target match to modify:", targetMatch);
    if (targetMatch.player1Id === 'N499KUYAcSZafSqB0iKEfPwx80h2') {
      targetMatch.player1Id = 'Jh68u4JEsuPAaPZ2WxaR2DsUpZt2'; // Replace with xenon
    } else {
      targetMatch.player2Id = 'Jh68u4JEsuPAaPZ2WxaR2DsUpZt2'; // Replace with xenon
    }
    console.log("Updated target match to:", targetMatch);
    
    await docRef.update({ rounds });
    console.log("Firestore updated successfully!");
  } else {
    console.log("Could not find a match containing yeraltıcanavarı!");
  }
}

run().catch(console.error);

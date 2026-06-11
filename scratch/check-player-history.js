async function run() {
  const res = await fetch("https://firestore.googleapis.com/v1/projects/iyte-satranc-ieee/databases/(default)/documents/tournament/current");
  const data = await res.json();
  
  const targetId = 'yHp2cGu8Y8NoRRlKURNWM1ie2Sd2'; // Styloideus
  const rounds = data.fields.rounds?.arrayValue?.values || [];
  
  console.log(`Match history for player ${targetId}:`);
  rounds.forEach((r, roundIdx) => {
    const rf = r.mapValue.fields;
    const roundNum = rf.roundNumber?.integerValue;
    const matches = rf.matches?.arrayValue?.values || [];
    
    matches.forEach(m => {
      const mf = m.mapValue.fields;
      const p1 = mf.player1Id?.stringValue;
      const p2 = mf.player2Id?.stringValue;
      if (p1 === targetId || p2 === targetId) {
        console.log(`- Round ${roundNum}: Match ID=${mf.id?.stringValue}, P1=${p1}, P2=${p2}, Winner=${mf.winnerId?.stringValue}, Status=${mf.status?.stringValue}, LichessStatus=${mf.lichessStatus?.stringValue}`);
      }
    });
  });
}
run();

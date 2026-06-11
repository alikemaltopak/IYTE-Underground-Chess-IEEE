function calculateStandings(rounds, playerIds) {
  const standings = {};
  playerIds.forEach(id => {
    standings[id] = { playerId: id, wins: 0, losses: 0, draws: 0, points: 0, played: 0 };
  });

  rounds.forEach(round => {
    round.matches.forEach(match => {
      if (match.status !== 'completed' || !match.winnerId) return;
      
      if (match.player1Id !== 'BYE' && standings[match.player1Id]) {
        standings[match.player1Id].played++;
      }
      if (match.player2Id !== 'BYE' && standings[match.player2Id]) {
        standings[match.player2Id].played++;
      }

      if (match.winnerId === 'draw') {
        if (match.player1Id !== 'BYE' && standings[match.player1Id]) {
          standings[match.player1Id].draws++;
          standings[match.player1Id].points += 0.5;
        }
        if (match.player2Id !== 'BYE' && standings[match.player2Id]) {
          standings[match.player2Id].draws++;
          standings[match.player2Id].points += 0.5;
        }
      } else {
        const loserId = match.winnerId === match.player1Id ? match.player2Id : match.player1Id;
        if (standings[match.winnerId]) {
          standings[match.winnerId].wins++;
          standings[match.winnerId].points += 1;
        }
        if (loserId !== 'BYE' && standings[loserId]) {
          standings[loserId].losses++;
        }
      }
    });
  });

  return Object.values(standings).sort((a, b) => b.points - a.points || b.wins - a.wins);
}

async function run() {
  const res = await fetch("https://firestore.googleapis.com/v1/projects/iyte-satranc-ieee/databases/(default)/documents/tournament/current");
  const data = await res.json();
  
  const playerIds = data.fields.playerIds?.arrayValue?.values?.map(v => v.stringValue) || [];
  const rounds = data.fields.rounds?.arrayValue?.values?.map(r => {
    const rf = r.mapValue.fields;
    const matches = rf.matches?.arrayValue?.values?.map(m => {
      const mf = m.mapValue.fields;
      return {
        id: mf.id?.stringValue,
        round: parseInt(mf.round?.integerValue || "0"),
        matchIndex: parseInt(mf.matchIndex?.integerValue || "0"),
        player1Id: mf.player1Id?.stringValue,
        player2Id: mf.player2Id?.stringValue,
        winnerId: mf.winnerId?.stringValue,
        status: mf.status?.stringValue
      };
    }) || [];
    return {
      roundNumber: parseInt(rf.roundNumber?.integerValue || "0"),
      matches
    };
  }) || [];

  const standings = calculateStandings(rounds, playerIds);
  
  const winners = standings.filter(s => {
    const effectiveLosses = s.losses + Math.floor(s.draws / 2);
    return effectiveLosses === 0;
  }).map(s => s.playerId);

  const losers = standings.filter(s => {
    const effectiveLosses = s.losses + Math.floor(s.draws / 2);
    return effectiveLosses === 1;
  }).map(s => s.playerId);

  const eliminated = standings.filter(s => {
    const effectiveLosses = s.losses + Math.floor(s.draws / 2);
    return effectiveLosses >= 2;
  }).map(s => s.playerId);

  console.log("Using effectiveLosses (s.losses + Math.floor(s.draws / 2)):");
  console.log("Winners Bracket count:", winners.length);
  console.log("Losers Bracket count:", losers.length);
  console.log("Eliminated count:", eliminated.length);
  
  console.log("\nWinners:", winners);
  console.log("Losers:", losers);
}
run();

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

  for (let rNum = 1; rNum <= rounds.length; rNum++) {
    const prevRounds = rounds.slice(0, rNum - 1);
    const standings = calculateStandings(prevRounds, playerIds);
    const winners = standings.filter(s => s.losses === 0).map(s => s.playerId);
    const losers = standings.filter(s => s.losses === 1).map(s => s.playerId);
    
    console.log(`\n=== BEFORE ROUND ${rNum} ===`);
    console.log(`Winners (${winners.length}):`, winners);
    console.log(`Losers (${losers.length}):`, losers);
    
    console.log(`Actual Matches in Round ${rNum}:`);
    const roundMatches = rounds[rNum - 1].matches;
    roundMatches.forEach(m => {
      console.log(`- ${m.id}: P1=${m.player1Id} (Losses: ${standings[m.player1Id]?.losses}), P2=${m.player2Id} (Losses: ${standings[m.player2Id]?.losses}), Winner=${m.winnerId}`);
    });
  }
}
run();

import fs from 'fs';

// Helper functions from TournamentBracket.tsx
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

function generateNextDoubleEliminationRound(rounds, playerIds) {
  const standings = calculateStandings(rounds, playerIds);
  
  const playedOpponents = {};
  playerIds.forEach(id => {
    playedOpponents[id] = new Set();
  });
  rounds.forEach(round => {
    round.matches.forEach(match => {
      if (match.player1Id !== 'BYE' && match.player2Id !== 'BYE') {
        playedOpponents[match.player1Id].add(match.player2Id);
        playedOpponents[match.player2Id].add(match.player1Id);
      }
    });
  });

  const nextRoundNumber = rounds.length + 1;
  const newMatches = [];
  
  const winners = standings.filter(s => s.losses === 0).map(s => s.playerId);
  const losers = standings.filter(s => s.losses === 1).map(s => s.playerId);
  
  if (winners.length === 1 && losers.length === 1) {
    newMatches.push({
      id: `r${nextRoundNumber}_gf`,
      round: nextRoundNumber,
      matchIndex: 0,
      player1Id: winners[0],
      player2Id: losers[0],
      winnerId: null,
      status: 'pending'
    });
    return newMatches;
  }
  
  if (winners.length === 0 && losers.length === 2) {
    newMatches.push({
      id: `r${nextRoundNumber}_reset`,
      round: nextRoundNumber,
      matchIndex: 0,
      player1Id: losers[0],
      player2Id: losers[1],
      winnerId: null,
      status: 'pending'
    });
    return newMatches;
  }

  const paired = new Set();
  let matchIdx = 0;
  
  if (winners.length > 1) {
    const isOdd = winners.length % 2 !== 0;
    if (isOdd) {
      const byePlayerId = winners[winners.length - 1];
      paired.add(byePlayerId);
      newMatches.push({
        id: `r${nextRoundNumber}_wbye`,
        round: nextRoundNumber,
        matchIndex: 98,
        player1Id: byePlayerId,
        player2Id: 'BYE',
        winnerId: byePlayerId,
        status: 'completed'
      });
    }
    
    for (let i = 0; i < winners.length; i++) {
      const p1 = winners[i];
      if (paired.has(p1)) continue;
      
      let p2 = '';
      for (let j = i + 1; j < winners.length; j++) {
        const candidate = winners[j];
        if (!paired.has(candidate) && !playedOpponents[p1].has(candidate)) {
          p2 = candidate;
          break;
        }
      }
      if (!p2) {
        for (let j = i + 1; j < winners.length; j++) {
          const candidate = winners[j];
          if (!paired.has(candidate)) {
            p2 = candidate;
            break;
          }
        }
      }
      
      if (p2) {
        paired.add(p1);
        paired.add(p2);
        newMatches.push({
          id: `r${nextRoundNumber}_wm${matchIdx}`,
          round: nextRoundNumber,
          matchIndex: matchIdx,
          player1Id: p1,
          player2Id: p2,
          winnerId: null,
          status: 'pending'
        });
        matchIdx++;
      }
    }
  } else if (winners.length === 1) {
    const byePlayerId = winners[0];
    paired.add(byePlayerId);
    newMatches.push({
      id: `r${nextRoundNumber}_wbye`,
      round: nextRoundNumber,
      matchIndex: 98,
      player1Id: byePlayerId,
      player2Id: 'BYE',
      winnerId: byePlayerId,
      status: 'completed'
    });
  }
  
  if (losers.length > 1) {
    const isOdd = losers.length % 2 !== 0;
    if (isOdd) {
      let byePlayerId = '';
      for (let i = losers.length - 1; i >= 0; i--) {
        const pid = losers[i];
        if (!paired.has(pid)) {
          byePlayerId = pid;
          break;
        }
      }
      if (byePlayerId) {
        paired.add(byePlayerId);
        newMatches.push({
          id: `r${nextRoundNumber}_lbye`,
          round: nextRoundNumber,
          matchIndex: 99,
          player1Id: byePlayerId,
          player2Id: 'BYE',
          winnerId: byePlayerId,
          status: 'completed'
        });
      }
    }
    
    for (let i = 0; i < losers.length; i++) {
      const p1 = losers[i];
      if (paired.has(p1)) continue;
      
      let p2 = '';
      for (let j = i + 1; j < losers.length; j++) {
        const candidate = losers[j];
        if (!paired.has(candidate) && !playedOpponents[p1].has(candidate)) {
          p2 = candidate;
          break;
        }
      }
      if (!p2) {
        for (let j = i + 1; j < losers.length; j++) {
          const candidate = losers[j];
          if (!paired.has(candidate)) {
            p2 = candidate;
            break;
          }
        }
      }
      
      if (p2) {
        paired.add(p1);
        paired.add(p2);
        newMatches.push({
          id: `r${nextRoundNumber}_lm${matchIdx}`,
          round: nextRoundNumber,
          matchIndex: matchIdx,
          player1Id: p1,
          player2Id: p2,
          winnerId: null,
          status: 'pending'
        });
        matchIdx++;
      }
    }
  } else if (losers.length === 1 && winners.length > 1) {
    const byePlayerId = losers[0];
    paired.add(byePlayerId);
    newMatches.push({
      id: `r${nextRoundNumber}_lbye`,
      round: nextRoundNumber,
      matchIndex: 99,
      player1Id: byePlayerId,
      player2Id: 'BYE',
      winnerId: byePlayerId,
      status: 'completed'
    });
  }

  return newMatches;
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
  const winners = standings.filter(s => s.losses === 0).map(s => s.playerId);
  const losers = standings.filter(s => s.losses === 1).map(s => s.playerId);
  
  console.log("Winners list:", winners);
  console.log("Losers list:", losers);
  
  const nextMatches = generateNextDoubleEliminationRound(rounds, playerIds);
  console.log("\nGenerated Round 5 Matches:");
  nextMatches.forEach((m, idx) => {
    console.log(`Match ${idx}: ID=${m.id}, P1=${m.player1Id}, P2=${m.player2Id}, Status=${m.status}, Winner=${m.winnerId}`);
  });
}
run();

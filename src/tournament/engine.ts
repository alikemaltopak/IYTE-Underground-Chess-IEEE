// Turnuva motoru: formata göre eşleştirme, puan tablosu ve eleme kuralları.
// Firebase ve React'ten bağımsızdır; TournamentBracket bileşeni ve testler bu modülü kullanır.

// ============ TYPES ============

export interface RoundRobinMatch {
  id: string;
  round: number;
  matchIndex: number;
  player1Id: string;
  player2Id: string;
  winnerId: string | null;
  status: 'pending' | 'active' | 'completed';
  lichessMatchId?: string;
  lichessStatus?: string; // 'created' | 'started' | 'mate' | 'resign' etc.
}

export interface TournamentRound {
  roundNumber: number;
  date: string;
  time: string;
  started: boolean;
  matches: RoundRobinMatch[];
}

export interface TournamentData {
  format: string;
  status: 'setup' | 'active' | 'completed';
  rounds: TournamentRound[];
  playerIds: string[];
  createdAt: any;
  mergeRound?: number;
}

export interface Standing {
  playerId: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  played: number;
}


// ============ ROUND ROBIN SCHEDULER (Circle Method) ============

export function generateRoundRobin(playerIds: string[]): TournamentRound[] {
  const ids = [...playerIds];
  const isOdd = ids.length % 2 !== 0;
  if (isOdd) ids.push('BYE'); // Tek sayıda oyuncu varsa BYE ekle

  const n = ids.length;
  const totalRounds = n - 1;
  const matchesPerRound = n / 2;
  const rounds: TournamentRound[] = [];

  // Circle method: ilk oyuncuyu sabitle, geri kalanını döndür
  const fixed = ids[0];
  const rotating = ids.slice(1);

  for (let r = 0; r < totalRounds; r++) {
    const roundMatches: RoundRobinMatch[] = [];
    const current = [fixed, ...rotating];

    for (let m = 0; m < matchesPerRound; m++) {
      const p1 = current[m];
      const p2 = current[n - 1 - m];
      
      // BYE maçlarını atla
      if (p1 === 'BYE' || p2 === 'BYE') continue;

      roundMatches.push({
        id: `r${r + 1}_m${m}`,
        round: r + 1,
        matchIndex: m,
        player1Id: p1,
        player2Id: p2,
        winnerId: null,
        status: 'pending'
      });
    }

    // Başlangıç tarihini ayarla (turnuva günü + round * 1 gün)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + r); // Her round bir sonraki gün
    
    rounds.push({
      roundNumber: r + 1,
      date: startDate.toISOString().split('T')[0],
      time: '18:00',
      started: false,
      matches: roundMatches
    });

    // Rotate: son elemanı ikinci sıraya taşı
    rotating.push(rotating.shift()!);
  }

  return rounds;
}

// ============ FORMAT DETECTOR ============

export const FORMAT_TABLE = [
  { min: 4, max: 10, format: 'round_robin', label: 'Round Robin', structure: 'Herkes herkese', matchRange: '6 – 45' },
  { min: 11, max: 24, format: 'swiss', label: 'Swiss', structure: '4-5 tur', matchRange: '20 – 60' },
  { min: 25, max: 35, format: 'double_elimination', label: 'Double Elimination', structure: 'Bracket', matchRange: '49 – 69' },
  { min: 36, max: 50, format: 'hybrid', label: 'Hybrid_Protocol', structure: 'Swiss + Eleme', matchRange: '60 – 85' },
  { min: 51, max: 9999, format: 'single_elimination', label: 'Single Elimination', structure: 'Direkt eleme', matchRange: '≤ n-1' },
];

export function detectFormat(playerCount: number) {
  const entry = FORMAT_TABLE.find(f => playerCount >= f.min && playerCount <= f.max);
  return entry || FORMAT_TABLE[0];
}

// ============ STANDINGS CALCULATOR ============

export function calculateStandings(rounds: TournamentRound[], playerIds: string[]): Standing[] {
  const standings: Record<string, Standing> = {};
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


// ============ GENERALIZED PAIRING SYSTEM ============

export function generateInitialRound(format: string, playerIds: string[]): TournamentRound[] {
  if (format === 'round_robin') {
    return generateRoundRobin(playerIds);
  }
  
  const ids = [...playerIds];
  const isOdd = ids.length % 2 !== 0;
  
  let byePlayerId = '';
  if (isOdd) {
    byePlayerId = ids.pop()!;
  }
  
  const matches: RoundRobinMatch[] = [];
  const n = ids.length;
  for (let i = 0; i < n; i += 2) {
    matches.push({
      id: `r1_m${i / 2}`,
      round: 1,
      matchIndex: i / 2,
      player1Id: ids[i],
      player2Id: ids[i + 1],
      winnerId: null,
      status: 'pending'
    });
  }
  
  if (byePlayerId) {
    matches.push({
      id: `r1_bye`,
      round: 1,
      matchIndex: 99,
      player1Id: byePlayerId,
      player2Id: 'BYE',
      winnerId: byePlayerId,
      status: 'completed'
    });
  }

  const startDate = new Date();
  
  return [{
    roundNumber: 1,
    date: startDate.toISOString().split('T')[0],
    time: '18:00',
    started: false,
    matches
  }];
}

export function checkTournamentFinished(format: string, rounds: TournamentRound[], playerIds: string[]): boolean {
  const allMatchesDone = rounds.every(r => r.matches.every(m => m.status === 'completed'));
  if (!allMatchesDone) return false;
  
  if (format === 'round_robin') {
    return true;
  }
  
  const standings = calculateStandings(rounds, playerIds);
  
  if (format === 'swiss') {
    const required = playerIds.length <= 16 ? 4 : 5;
    return rounds.length === required;
  }
  
  if (format === 'single_elimination') {
    const active = standings.filter(s => s.losses === 0);
    return active.length <= 1;
  }
  
  if (format === 'double_elimination') {
    const active = standings.filter(s => (s.losses + Math.floor(s.draws / 2)) < 2);
    return active.length <= 1;
  }
  
  if (format === 'hybrid') {
    if (rounds.length < 7) return false; // Swiss (4) + Quarters (1) + Semis (1) + Finals (1) = 7
    return true;
  }
  
  return false;
}

// ============ BAY (BYE) GEÇMİŞİ ============

/**
 * Daha önce bay almış oyuncular: 'BYE' rakipli maçı olanlar ve bir turda hiç eşleşmemiş olanlar.
 * Aynı oyuncuya ikinci kez bay verilmemesi için kullanılır.
 */
export function collectPlayersWithBye(rounds: TournamentRound[], playerIds: string[]): Set<string> {
  const playersWithBye = new Set<string>();
  rounds.forEach(round => {
    const allPlayersInMatches = new Set(round.matches.flatMap(m => [m.player1Id, m.player2Id]));
    playerIds.forEach(id => {
      if (!allPlayersInMatches.has(id)) {
        playersWithBye.add(id);
      }
    });
    round.matches.forEach(m => {
      if (m.player2Id === 'BYE') playersWithBye.add(m.player1Id);
    });
  });
  return playersWithBye;
}

/**
 * Sıralı oyuncu listesini, daha önce karşılaşmamış ikililer olacak şekilde eşleştirir (geri izlemeli arama).
 * Liste başındaki oyuncu, sıradaki en yakın uygun rakiple eşleşir; çıkmaza girilirse bir sonraki aday denenir.
 * Böyle bir eşleştirme yoksa (veya arama sınırı aşılırsa) null döner.
 */
export function pairWithoutRematches(
  order: string[],
  playedOpponents: Record<string, Set<string>>,
  maxSteps = 200000
): [string, string][] | null {
  if (order.length % 2 !== 0) return null;
  let steps = 0;
  const search = (rest: string[]): [string, string][] | null => {
    if (rest.length === 0) return [];
    if (++steps > maxSteps) return null;
    const [p1, ...others] = rest;
    for (let j = 0; j < others.length; j++) {
      const p2 = others[j];
      if (playedOpponents[p1]?.has(p2)) continue;
      const tail = search(others.filter((_, k) => k !== j));
      if (tail) return [[p1, p2], ...tail];
    }
    return null;
  };
  return search(order);
}

export function generateNextSwissRound(rounds: TournamentRound[], playerIds: string[]): RoundRobinMatch[] {
  const standings = calculateStandings(rounds, playerIds);
  
  const playedOpponents: Record<string, Set<string>> = {};
  playerIds.forEach(id => {
    playedOpponents[id] = new Set<string>();
  });
  
  rounds.forEach(round => {
    round.matches.forEach(match => {
      if (match.player1Id !== 'BYE' && match.player2Id !== 'BYE') {
        if (playedOpponents[match.player1Id] && playedOpponents[match.player2Id]) {
          playedOpponents[match.player1Id].add(match.player2Id);
          playedOpponents[match.player2Id].add(match.player1Id);
        }
      }
    });
  });

  const nextRoundNumber = rounds.length + 1;
  const paired = new Set<string>();
  const newMatches: RoundRobinMatch[] = [];
  
  const sortedPlayers = standings.map(s => s.playerId);
  
  const isOdd = sortedPlayers.length % 2 !== 0;
  if (isOdd) {
    const playersWithBye = collectPlayersWithBye(rounds, playerIds);
    
    let byePlayerId = '';
    for (let i = sortedPlayers.length - 1; i >= 0; i--) {
      const pid = sortedPlayers[i];
      if (!playersWithBye.has(pid)) {
        byePlayerId = pid;
        break;
      }
    }
    if (!byePlayerId) {
      byePlayerId = sortedPlayers[sortedPlayers.length - 1];
    }
    
    paired.add(byePlayerId);
    newMatches.push({
      id: `r${nextRoundNumber}_bye`,
      round: nextRoundNumber,
      matchIndex: 99,
      player1Id: byePlayerId,
      player2Id: 'BYE',
      winnerId: byePlayerId,
      status: 'completed'
    });
  }

  // Önce puan sırasını koruyarak hiç tekrar eşleşme olmayan bir eşleştirme ara
  const noRematchPairs = pairWithoutRematches(sortedPlayers.filter(p => !paired.has(p)), playedOpponents);
  if (noRematchPairs) {
    noRematchPairs.forEach(([p1, p2], matchIdx) => {
      newMatches.push({
        id: `r${nextRoundNumber}_m${matchIdx}`,
        round: nextRoundNumber,
        matchIndex: matchIdx,
        player1Id: p1,
        player2Id: p2,
        winnerId: null,
        status: 'pending'
      });
    });
    return newMatches;
  }

  // Mümkün değilse: açgözlü eşleştirme (gerekirse tekrar eşleşmeye izin verir)
  let matchIdx = 0;
  for (let i = 0; i < sortedPlayers.length; i++) {
    const p1 = sortedPlayers[i];
    if (paired.has(p1)) continue;
    
    let p2 = '';
    for (let j = i + 1; j < sortedPlayers.length; j++) {
      const candidate = sortedPlayers[j];
      if (!paired.has(candidate) && !playedOpponents[p1].has(candidate)) {
        p2 = candidate;
        break;
      }
    }
    
    if (!p2) {
      for (let j = i + 1; j < sortedPlayers.length; j++) {
        const candidate = sortedPlayers[j];
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
        id: `r${nextRoundNumber}_m${matchIdx}`,
        round: nextRoundNumber,
        matchIndex: matchIdx,
        player1Id: p1,
        player2Id: p2,
        winnerId: null,
        status: 'pending'
      });
      matchIdx++;
    } else {
      paired.add(p1);
      newMatches.push({
        id: `r${nextRoundNumber}_bye`,
        round: nextRoundNumber,
        matchIndex: 99,
        player1Id: p1,
        player2Id: 'BYE',
        winnerId: p1,
        status: 'completed'
      });
    }
  }
  
  return newMatches;
}

export function generateNextSingleEliminationRound(rounds: TournamentRound[], playerIds: string[]): RoundRobinMatch[] {
  const standings = calculateStandings(rounds, playerIds);
  const activePlayers = standings.filter(s => s.losses === 0).map(s => s.playerId);
  
  const nextRoundNumber = rounds.length + 1;
  const matches: RoundRobinMatch[] = [];
  const n = activePlayers.length;
  
  if (n <= 1) return [];
  
  const isOdd = n % 2 !== 0;
  let byePlayerId = '';
  if (isOdd) {
    byePlayerId = activePlayers[n - 1];
    activePlayers.pop();
  }
  
  for (let i = 0; i < activePlayers.length; i += 2) {
    matches.push({
      id: `r${nextRoundNumber}_m${i / 2}`,
      round: nextRoundNumber,
      matchIndex: i / 2,
      player1Id: activePlayers[i],
      player2Id: activePlayers[i + 1],
      winnerId: null,
      status: 'pending'
    });
  }
  
  if (byePlayerId) {
    matches.push({
      id: `r${nextRoundNumber}_bye`,
      round: nextRoundNumber,
      matchIndex: 99,
      player1Id: byePlayerId,
      player2Id: 'BYE',
      winnerId: byePlayerId,
      status: 'completed'
    });
  }
  
  return matches;
}

export function generateNextDoubleEliminationRound(rounds: TournamentRound[], playerIds: string[]): RoundRobinMatch[] {
  const standings = calculateStandings(rounds, playerIds);
  
  const playedOpponents: Record<string, Set<string>> = {};
  playerIds.forEach(id => {
    playedOpponents[id] = new Set<string>();
  });
  rounds.forEach(round => {
    round.matches.forEach(match => {
      if (match.player1Id !== 'BYE' && match.player2Id !== 'BYE') {
        if (playedOpponents[match.player1Id] && playedOpponents[match.player2Id]) {
          playedOpponents[match.player1Id].add(match.player2Id);
          playedOpponents[match.player2Id].add(match.player1Id);
        }
      }
    });
  });

  const nextRoundNumber = rounds.length + 1;
  const newMatches: RoundRobinMatch[] = [];
  
  const winners = standings.filter(s => (s.losses + Math.floor(s.draws / 2)) === 0).map(s => s.playerId);
  const losers = standings.filter(s => (s.losses + Math.floor(s.draws / 2)) === 1).map(s => s.playerId);
  
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

  const paired = new Set<string>();
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

export function generateNextHybridRound(rounds: TournamentRound[], playerIds: string[]): RoundRobinMatch[] {
  if (rounds.length < 4) {
    return generateNextSwissRound(rounds, playerIds);
  }
  
  const nextRoundNumber = rounds.length + 1;
  const newMatches: RoundRobinMatch[] = [];
  
  if (rounds.length === 4) {
    const standings = calculateStandings(rounds, playerIds);
    const top8 = standings.slice(0, 8).map(s => s.playerId);
    
    newMatches.push({ id: `r5_m0`, round: 5, matchIndex: 0, player1Id: top8[0], player2Id: top8[7], winnerId: null, status: 'pending' });
    newMatches.push({ id: `r5_m1`, round: 5, matchIndex: 1, player1Id: top8[3], player2Id: top8[4], winnerId: null, status: 'pending' });
    newMatches.push({ id: `r5_m2`, round: 5, matchIndex: 2, player1Id: top8[1], player2Id: top8[6], winnerId: null, status: 'pending' });
    newMatches.push({ id: `r5_m3`, round: 5, matchIndex: 3, player1Id: top8[2], player2Id: top8[5], winnerId: null, status: 'pending' });
    
    return newMatches;
  }
  
  const prevRound = rounds[rounds.length - 1];
  const winners = prevRound.matches.map(m => m.winnerId).filter(id => id && id !== 'draw') as string[];
  
  if (winners.length <= 1) return [];
  
  for (let i = 0; i < winners.length; i += 2) {
    newMatches.push({
      id: `r${nextRoundNumber}_m${i / 2}`,
      round: nextRoundNumber,
      matchIndex: i / 2,
      player1Id: winners[i],
      player2Id: winners[i + 1],
      winnerId: null,
      status: 'pending'
    });
  }
  
  return newMatches;
}

export function generateRandomPairing(rounds: TournamentRound[], playerIds: string[]): RoundRobinMatch[] {
  const playedOpponents: Record<string, Set<string>> = {};
  playerIds.forEach(id => {
    playedOpponents[id] = new Set<string>();
  });
  
  rounds.forEach(round => {
    round.matches.forEach(match => {
      if (match.player1Id !== 'BYE' && match.player2Id !== 'BYE') {
        if (playedOpponents[match.player1Id] && playedOpponents[match.player2Id]) {
          playedOpponents[match.player1Id].add(match.player2Id);
          playedOpponents[match.player2Id].add(match.player1Id);
        }
      }
    });
  });

  const nextRoundNumber = rounds.length + 1;
  
  // Shuffle player list
  const shuffled = [...playerIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  const newMatches: RoundRobinMatch[] = [];
  const paired = new Set<string>();

  const isOdd = shuffled.length % 2 !== 0;
  if (isOdd) {
    const playersWithBye = collectPlayersWithBye(rounds, playerIds);

    let byePlayerId = '';
    for (let i = shuffled.length - 1; i >= 0; i--) {
      const pid = shuffled[i];
      if (!playersWithBye.has(pid)) {
        byePlayerId = pid;
        break;
      }
    }
    if (!byePlayerId) {
      byePlayerId = shuffled[shuffled.length - 1];
    }

    paired.add(byePlayerId);
    newMatches.push({
      id: `r${nextRoundNumber}_bye`,
      round: nextRoundNumber,
      matchIndex: 99,
      player1Id: byePlayerId,
      player2Id: 'BYE',
      winnerId: byePlayerId,
      status: 'completed'
    });
  }

  let matchIdx = 0;
  for (let i = 0; i < shuffled.length; i++) {
    const p1 = shuffled[i];
    if (paired.has(p1)) continue;

    let p2 = '';
    for (let j = i + 1; j < shuffled.length; j++) {
      const candidate = shuffled[j];
      if (!paired.has(candidate) && !playedOpponents[p1].has(candidate)) {
        p2 = candidate;
        break;
      }
    }

    if (!p2) {
      for (let j = i + 1; j < shuffled.length; j++) {
        const candidate = shuffled[j];
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
        id: `r${nextRoundNumber}_m${matchIdx}`,
        round: nextRoundNumber,
        matchIndex: matchIdx,
        player1Id: p1,
        player2Id: p2,
        winnerId: null,
        status: 'pending'
      });
      matchIdx++;
    } else {
      paired.add(p1);
      newMatches.push({
        id: `r${nextRoundNumber}_bye`,
        round: nextRoundNumber,
        matchIndex: 99,
        player1Id: p1,
        player2Id: 'BYE',
        winnerId: p1,
        status: 'completed'
      });
    }
  }

  return newMatches;
}

export function generateNextRoundMatches(tournament: TournamentData, rounds: TournamentRound[], playerIds: string[]): RoundRobinMatch[] {
  const { format, mergeRound } = tournament;
  if (format === 'swiss') return generateNextSwissRound(rounds, playerIds);
  if (format === 'single_elimination') return generateNextSingleEliminationRound(rounds, playerIds);
  if (format === 'double_elimination') {
    // Starting from the merge round, pool all players together and match them randomly
    if (mergeRound && rounds.length >= (mergeRound - 1)) {
      const nextRoundNumber = rounds.length + 1;
      
      // Find players who would have gotten a BYE under double elimination
      const proposedDoubleElimMatches = generateNextDoubleEliminationRound(rounds, playerIds);
      const byePlayerIds = proposedDoubleElimMatches
        .filter(m => m.player2Id === 'BYE')
        .map(m => m.player1Id);
        
      let forcedMatches: RoundRobinMatch[] = [];
      let remainingPlayers = [...playerIds];
      
      if (byePlayerIds.length >= 2) {
        // We have 2 or more players who would have gotten a BYE. Pair them up!
        for (let i = 0; i < byePlayerIds.length - 1; i += 2) {
          const p1 = byePlayerIds[i];
          const p2 = byePlayerIds[i + 1];
          forcedMatches.push({
            id: `r${nextRoundNumber}_forced_${i}`,
            round: nextRoundNumber,
            matchIndex: i,
            player1Id: p1,
            player2Id: p2,
            winnerId: null,
            status: 'pending'
          });
          remainingPlayers = remainingPlayers.filter(id => id !== p1 && id !== p2);
        }
      }
      
      // Match the remaining players using random pairing
      const remainingMatches = generateRandomPairing(rounds, remainingPlayers);
      
      // Re-index matches
      const matches = [...forcedMatches];
      remainingMatches.forEach((m, idx) => {
        m.id = `r${nextRoundNumber}_m${matches.length}`;
        m.matchIndex = matches.length;
        matches.push(m);
      });
      
      return matches;
    }
    return generateNextDoubleEliminationRound(rounds, playerIds);
  }
  if (format === 'hybrid') return generateNextHybridRound(rounds, playerIds);
  return [];
}

// ============ ELEMINASYON KURALI ============

/** Bir oyuncunun formatın kurallarına göre elenip elenmediği (Firestore'a yazılmadan önceki saf karar). */
export function shouldEliminatePlayer(format: string, standing: Standing, rounds: TournamentRound[]): boolean {
  if (format === 'double_elimination') {
    const effectiveLosses = standing.losses + Math.floor(standing.draws / 2);
    return effectiveLosses >= 2;
  }
  if (format === 'single_elimination') {
    return standing.losses >= 1;
  }
  if (format === 'hybrid') {
    return rounds.slice(4).some(r =>
      r.matches.some(m => m.status === 'completed' && m.winnerId && m.winnerId !== 'draw' &&
        (m.player1Id === standing.playerId || m.player2Id === standing.playerId) && m.winnerId !== standing.playerId
      )
    );
  }
  return false;
}

// ============ LICHESS SONUÇ EŞLEME ============

export const LICHESS_FINISHED_STATUSES = ['mate', 'resign', 'stalemate', 'timeout', 'draw', 'outoftime'];

/**
 * /api/match-result yanıtını turnuva sonucuna çevirir.
 * Maç bitmediyse null; bittiyse kazanan oyuncu id'si veya 'draw'. Beyaz = player1, siyah = player2.
 */
export function resolveLichessWinner(
  data: { status?: string; winner?: string },
  match: Pick<RoundRobinMatch, 'player1Id' | 'player2Id'>
): string | null {
  if (!data.status || !LICHESS_FINISHED_STATUSES.includes(data.status)) return null;
  if (data.status === 'draw' || data.status === 'stalemate' || data.winner === 'Beraberlik') {
    return 'draw';
  }
  return data.winner === 'white' ? match.player1Id : match.player2Id;
}

/**
 * Süre dolduğunda (maça kimse hamle yapmadıysa) hükmen sonuç.
 * Sadece biri girdiyse o kazanır, ikisi de girmediyse beraberlik sayılır.
 */
export function resolveForfeit(
  whiteJoined: boolean | undefined,
  blackJoined: boolean | undefined,
  match: Pick<RoundRobinMatch, 'player1Id' | 'player2Id'>
): { winnerId: string; reason: string } | null {
  if (whiteJoined && !blackJoined) return { winnerId: match.player1Id, reason: 'Hükmen (Siyah Gelmedi)' };
  if (blackJoined && !whiteJoined) return { winnerId: match.player2Id, reason: 'Hükmen (Beyaz Gelmedi)' };
  if (!whiteJoined && !blackJoined) return { winnerId: 'draw', reason: 'İkisi de Gelmedi' };
  return null;
}

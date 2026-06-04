import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc, onSnapshot, updateDoc, serverTimestamp, Timestamp, collection, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, Swords, Calendar, Clock, Users, Shuffle, Trash2, Crown, Medal, Loader2, Play, Radio } from 'lucide-react';

// ============ TYPES ============

interface RoundRobinMatch {
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

interface TournamentRound {
  roundNumber: number;
  date: string;
  time: string;
  started: boolean;
  matches: RoundRobinMatch[];
}

interface TournamentData {
  format: string;
  status: 'setup' | 'active' | 'completed';
  rounds: TournamentRound[];
  playerIds: string[];
  createdAt: any;
}

interface Standing {
  playerId: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  played: number;
}

interface TournamentBracketProps {
  players: any[];
  getPlayerName: (uid: string) => string;
}

// ============ ROUND ROBIN SCHEDULER (Circle Method) ============

function generateRoundRobin(playerIds: string[]): TournamentRound[] {
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

const FORMAT_TABLE = [
  { min: 4, max: 10, format: 'round_robin', label: 'Round Robin', structure: 'Herkes herkese', matchRange: '6 – 45' },
  { min: 11, max: 24, format: 'swiss', label: 'Swiss', structure: '4-5 tur', matchRange: '20 – 60' },
  { min: 25, max: 35, format: 'double_elimination', label: 'Double Elimination', structure: 'Bracket', matchRange: '49 – 69' },
  { min: 36, max: 50, format: 'hybrid', label: 'Hybrid_Protocol', structure: 'Swiss + Eleme', matchRange: '60 – 85' },
  { min: 51, max: 9999, format: 'single_elimination', label: 'Single Elimination', structure: 'Direkt eleme', matchRange: '≤ n-1' },
];

function detectFormat(playerCount: number) {
  const entry = FORMAT_TABLE.find(f => playerCount >= f.min && playerCount <= f.max);
  return entry || FORMAT_TABLE[0];
}

// ============ STANDINGS CALCULATOR ============

function calculateStandings(rounds: TournamentRound[], playerIds: string[]): Standing[] {
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

function generateInitialRound(format: string, playerIds: string[]): TournamentRound[] {
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

function checkTournamentFinished(format: string, rounds: TournamentRound[], playerIds: string[]): boolean {
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
    const active = standings.filter(s => s.losses < 2);
    return active.length <= 1;
  }
  
  if (format === 'hybrid') {
    if (rounds.length < 7) return false; // Swiss (4) + Quarters (1) + Semis (1) + Finals (1) = 7
    return true;
  }
  
  return false;
}

function generateNextSwissRound(rounds: TournamentRound[], playerIds: string[]): RoundRobinMatch[] {
  const standings = calculateStandings(rounds, playerIds);
  
  const playedOpponents: Record<string, Set<string>> = {};
  playerIds.forEach(id => {
    playedOpponents[id] = new Set<string>();
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
  const paired = new Set<string>();
  const newMatches: RoundRobinMatch[] = [];
  
  const sortedPlayers = standings.map(s => s.playerId);
  
  const isOdd = sortedPlayers.length % 2 !== 0;
  if (isOdd) {
    const playersWithBye = new Set<string>();
    rounds.forEach(round => {
      const allPlayersInMatches = new Set(round.matches.flatMap(m => [m.player1Id, m.player2Id]));
      playerIds.forEach(id => {
        if (!allPlayersInMatches.has(id)) {
          playersWithBye.add(id);
        }
      });
    });
    
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

function generateNextSingleEliminationRound(rounds: TournamentRound[], playerIds: string[]): RoundRobinMatch[] {
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

function generateNextDoubleEliminationRound(rounds: TournamentRound[], playerIds: string[]): RoundRobinMatch[] {
  const standings = calculateStandings(rounds, playerIds);
  
  const playedOpponents: Record<string, Set<string>> = {};
  playerIds.forEach(id => {
    playedOpponents[id] = new Set<string>();
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
  const newMatches: RoundRobinMatch[] = [];
  
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

function generateNextHybridRound(rounds: TournamentRound[], playerIds: string[]): RoundRobinMatch[] {
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

function generateNextRoundMatches(format: string, rounds: TournamentRound[], playerIds: string[]): RoundRobinMatch[] {
  if (format === 'swiss') return generateNextSwissRound(rounds, playerIds);
  if (format === 'single_elimination') return generateNextSingleEliminationRound(rounds, playerIds);
  if (format === 'double_elimination') return generateNextDoubleEliminationRound(rounds, playerIds);
  if (format === 'hybrid') return generateNextHybridRound(rounds, playerIds);
  return [];
}

// ============ MAIN COMPONENT ============

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ players, getPlayerName }) => {
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingRound, setStartingRound] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [liveMatches, setLiveMatches] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tournament', 'current'), (snap) => {
      if (snap.exists() && !(snap.data() as any).deleted) {
        setTournament(snap.data() as TournamentData);
      } else {
        setTournament(null);
      }
      setLoading(false);
    });

    const unsubMatches = onSnapshot(collection(db, 'matches'), (snap) => {
      const live: Record<string, any> = {};
      snap.docs.forEach(doc => {
        live[doc.id] = doc.data();
      });
      setLiveMatches(live);
    });

    return () => {
      unsub();
      unsubMatches();
    };
  }, []);

  const registeredPlayers = players.filter(p => p.status === 'registered' || p.status === 'active');
  const formatInfo = detectFormat(registeredPlayers.length);

  // Turnuva oluştur
  const generateTournament = async () => {
    if (registeredPlayers.length < 2) {
      alert('En az 2 oyuncu gerekli!');
      return;
    }

    const shuffled = [...registeredPlayers].sort(() => Math.random() - 0.5);
    const playerIds = shuffled.map(p => p.id);
    
    let rounds: TournamentRound[] = [];
    if (formatInfo.format === 'round_robin') {
      rounds = generateRoundRobin(playerIds);
    } else {
      rounds = generateInitialRound(formatInfo.format, playerIds);
    }

    await setDoc(doc(db, 'tournament', 'current'), {
      format: formatInfo.format,
      status: 'active',
      rounds,
      playerIds,
      createdAt: serverTimestamp()
    });
  };

  // === TURU BAŞLAT — Lichess linkleri oluştur ve oyunculara gönder ===
  const startRound = async (roundIndex: number) => {
    if (!tournament) return;
    setStartingRound(roundIndex);
    try {
      const newRounds = JSON.parse(JSON.stringify(tournament.rounds)) as TournamentRound[];
      const round = newRounds[roundIndex];

      for (let mIdx = 0; mIdx < round.matches.length; mIdx++) {
        const match = round.matches[mIdx];
        if (match.status !== 'pending') continue;

        // Lichess maç oluştur
        const res = await fetch('/api/create-match', { method: 'POST' });
        const data = await res.json();
        if (!data.success) { alert(`Maç oluşturulamadı: ${data.reason}`); continue; }

        match.lichessMatchId = data.matchId;
        match.status = 'active';

        // Oyuncuların profillerine linkleri yaz
        const deadline = Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000));
        const { doc: fdoc, updateDoc: fupdate } = await import('firebase/firestore');

        await updateDoc(doc(db, 'players', match.player1Id), {
          upcomingMatch: data.urlWhite, matchId: data.matchId, matchColor: 'white'
        });
        await updateDoc(doc(db, 'players', match.player2Id), {
          upcomingMatch: data.urlBlack, matchId: data.matchId, matchColor: 'black'
        });

        // matches koleksiyonuna da kaydet
        await setDoc(doc(db, 'matches', data.matchId), {
          matchId: data.matchId,
          whitePlayerId: match.player1Id,
          blackPlayerId: match.player2Id,
          urlWhite: data.urlWhite,
          urlBlack: data.urlBlack,
          status: 'active',
          createdAt: serverTimestamp(),
          deadline,
          tournamentRound: roundIndex + 1
        });
      }

      round.started = true;
      await updateDoc(doc(db, 'tournament', 'current'), { rounds: newRounds });
    } catch (err: any) {
      alert('Tur başlatma hatası: ' + err.message);
    } finally {
      setStartingRound(null);
    }
  };

  // === OTOMATİK SONUÇ KONTROL (30 saniyede bir) ===
  useEffect(() => {
    if (!tournament || tournament.status === 'completed') {
      if (pollRef.current) clearInterval(pollRef.current);
      setPolling(false);
      return;
    }

    // Aktif (Lichess'te başlamış) maçlar var mı?
    const activeMatches = tournament.rounds.flatMap(r => r.matches).filter(m => m.status === 'active' && m.lichessMatchId);
    if (activeMatches.length === 0) {
      if (pollRef.current) clearInterval(pollRef.current);
      setPolling(false);
      return;
    }

    setPolling(true);

    const pollResults = async () => {
      const newRounds = JSON.parse(JSON.stringify(tournament.rounds)) as TournamentRound[];
      let updated = false;

      // Tüm aktif maçları paralel sorgula (hız optimizasyonu)
      const checks = newRounds.flatMap((round, rIdx) =>
        round.matches.map((match, mIdx) => ({ match, rIdx, mIdx }))
      ).filter(({ match }) => match.status === 'active' && match.lichessMatchId);

      const results = await Promise.allSettled(
        checks.map(({ match }) =>
          fetch(`/api/match-result?matchId=${match.lichessMatchId}`)
            .then(r => r.json())
            .catch(() => null)
        )
      );

      for (let i = 0; i < checks.length; i++) {
        const result = results[i];
        if (result.status !== 'fulfilled' || !result.value?.success) continue;
        const data = result.value;
        const { rIdx, mIdx } = checks[i];
        const match = newRounds[rIdx].matches[mIdx];

        const finishedStatuses = ['mate', 'resign', 'stalemate', 'timeout', 'draw', 'outoftime'];
        if (finishedStatuses.includes(data.status)) {
          if (data.status === 'draw' || data.status === 'stalemate' || data.winner === 'Beraberlik') {
            match.winnerId = 'draw';
          } else {
            match.winnerId = data.winner === 'white' ? match.player1Id : match.player2Id;
          }
          match.status = 'completed';
          match.lichessStatus = data.status;
          updated = true;

          const { deleteField } = await import('firebase/firestore');
          const clear = { upcomingMatch: deleteField(), matchId: deleteField(), matchColor: deleteField() };
          await updateDoc(doc(db, 'players', match.player1Id), clear).catch(() => {});
          await updateDoc(doc(db, 'players', match.player2Id), clear).catch(() => {});
        } else {
          // Maç henüz bitmedi ama durumu güncelle
          if (match.lichessStatus !== data.status) {
            match.lichessStatus = data.status;
            updated = true;
            // Matches koleksiyonunu da güncelle (UserProfile timer'ı için)
            updateDoc(doc(db, 'matches', match.lichessMatchId), {
              status: data.status
            }).catch(() => {});
          }

          // OTOMATİK HÜKMEN MAĞLUBİYET KONTROLÜ
          if (data.status === 'created' || !data.status) {
            try {
              const matchDoc = await getDoc(doc(db, 'matches', match.lichessMatchId));
              if (matchDoc.exists()) {
                const mData = matchDoc.data();
                if (mData.deadline && Date.now() > mData.deadline.toDate().getTime()) {
                  // Süre doldu! Kim girdi kim girmedi kontrol et
                  const wJoined = mData.whiteJoined;
                  const bJoined = mData.blackJoined;

                  let forfeitWinner = null;
                  let forfeitReason = '';

                  if (wJoined && !bJoined) {
                    forfeitWinner = match.player1Id; // Beyaz kazandı
                    forfeitReason = 'Hükmen (Siyah Gelmedi)';
                  } else if (bJoined && !wJoined) {
                    forfeitWinner = match.player2Id; // Siyah kazandı
                    forfeitReason = 'Hükmen (Beyaz Gelmedi)';
                  } else if (!wJoined && !bJoined) {
                    forfeitWinner = 'draw'; // İkisi de gelmedi
                    forfeitReason = 'İkisi de Gelmedi';
                  }

                  if (forfeitWinner) {
                    match.status = 'completed';
                    match.winnerId = forfeitWinner;
                    match.lichessStatus = forfeitReason;
                    updated = true;

                    const { deleteField } = await import('firebase/firestore');
                    const clear = { upcomingMatch: deleteField(), matchId: deleteField(), matchColor: deleteField() };
                    await updateDoc(doc(db, 'players', match.player1Id), clear).catch(() => {});
                    await updateDoc(doc(db, 'players', match.player2Id), clear).catch(() => {});
                    await updateDoc(doc(db, 'matches', match.lichessMatchId), {
                       status: 'completed',
                       winner: forfeitWinner === match.player1Id ? 'white' : forfeitWinner === match.player2Id ? 'black' : 'draw',
                       result: forfeitReason
                    }).catch(() => {});
                  }
                }
              }
            } catch (e) {
              console.error("Auto forfeit error:", e);
            }
          }
        }
      }

      if (updated) {
        const isTournamentFinished = checkTournamentFinished(tournament.format, newRounds, tournament.playerIds);
        await updateDoc(doc(db, 'tournament', 'current'), {
          rounds: newRounds,
          ...(isTournamentFinished ? { status: 'completed' } : {})
        });
      }
    };

    // İlk kontrol hemen
    pollResults();
    // Sonraki kontroller 30 saniyede bir
    pollRef.current = setInterval(pollResults, 30000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [tournament]);

  // Maç sonucunu kaydet
  const setMatchResult = async (roundIndex: number, matchIndex: number, winnerId: string) => {
    if (!tournament) return;
    const newRounds = JSON.parse(JSON.stringify(tournament.rounds)) as TournamentRound[];
    const match = newRounds[roundIndex].matches[matchIndex];
    match.winnerId = winnerId;
    match.status = 'completed';

    const isTournamentFinished = checkTournamentFinished(tournament.format, newRounds, tournament.playerIds);
    await updateDoc(doc(db, 'tournament', 'current'), {
      rounds: newRounds,
      ...(isTournamentFinished ? { status: 'completed' } : {})
    });
  };

  // Maç sonucunu sıfırla
  const resetMatchResult = async (roundIndex: number, matchIndex: number) => {
    if (!tournament) return;
    const newRounds = JSON.parse(JSON.stringify(tournament.rounds)) as TournamentRound[];
    const match = newRounds[roundIndex].matches[matchIndex];
    match.winnerId = null;
    match.status = 'pending';
    await updateDoc(doc(db, 'tournament', 'current'), { rounds: newRounds, status: 'active' });
  };

  // Tur tarih/saatini güncelle
  const updateRoundSchedule = async (roundIndex: number, field: 'date' | 'time', value: string) => {
    if (!tournament) return;
    const newRounds = JSON.parse(JSON.stringify(tournament.rounds)) as TournamentRound[];
    newRounds[roundIndex][field] = value;
    await updateDoc(doc(db, 'tournament', 'current'), { rounds: newRounds });
  };

  // Sonraki tur eşleşmelerini oluştur
  const generateNextRound = async () => {
    if (!tournament) return;
    try {
      const newMatches = generateNextRoundMatches(tournament.format, tournament.rounds, tournament.playerIds);
      const nextRoundNumber = tournament.rounds.length + 1;
      
      const lastRoundDate = new Date(tournament.rounds[tournament.rounds.length - 1].date);
      lastRoundDate.setDate(lastRoundDate.getDate() + 1);
      
      const newRound: TournamentRound = {
        roundNumber: nextRoundNumber,
        date: lastRoundDate.toISOString().split('T')[0],
        time: '18:00',
        started: false,
        matches: newMatches
      };

      await updateDoc(doc(db, 'tournament', 'current'), {
        rounds: [...tournament.rounds, newRound],
        status: 'active'
      });
    } catch (e: any) {
      alert("Sonraki tur oluşturulurken hata: " + e.message);
    }
  };

  // Turnuvayı sıfırla
  const resetTournament = async () => {
    if (!confirm('Turnuva şeması tamamen silinecek. Emin misin?')) return;
    await setDoc(doc(db, 'tournament', 'current'), { deleted: true });
  };

  if (loading) {
    return <div className="text-neutral-500 text-center py-10">Yükleniyor...</div>;
  }

  // ============ SETUP EKRANI ============
  if (!tournament) {
    return (
      <div className="space-y-6">
        <div className="glass-panel border border-primary/20 p-8">
          <h2 className="text-xl font-display uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
            <Trophy className="w-6 h-6" /> Turnuva Şeması Oluştur
          </h2>

          <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display uppercase tracking-widest text-primary italic flex items-center gap-3">
                <Trophy className="w-6 h-6" /> Turnuva SİSTEMİ ve YAPILARI
              </h2>
              <div className="text-right">
                <p className="text-4xl font-black text-primary leading-none">{registeredPlayers.length} <span className="text-sm font-bold text-neutral-500">KATILIMCI</span></p>
                <p className="text-[9px] text-primary/60 font-bold tracking-widest flex items-center justify-end gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse" /> LIVE_UPLINK_ACTIVE
                </p>
              </div>
            </div>

            {/* Format Tablosu */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-primary/20">
                    <th className="text-left py-3 px-4 text-neutral-500 font-bold uppercase tracking-widest italic">Katılımcı Sayısı</th>
                    <th className="text-left py-3 px-4 text-neutral-500 font-bold uppercase tracking-widest italic">SİSTEM</th>
                    <th className="text-left py-3 px-4 text-neutral-500 font-bold uppercase tracking-widest italic">YAPI</th>
                    <th className="text-left py-3 px-4 text-neutral-500 font-bold uppercase tracking-widest italic">TOPLAM MAÇ</th>
                  </tr>
                </thead>
                <tbody>
                  {FORMAT_TABLE.map((f, i) => {
                    const isActive = formatInfo.format === f.format;
                    return (
                      <tr key={i} className={`border-b border-white/5 ${isActive ? 'bg-primary/5' : ''}`}>
                        <td className="py-3 px-4 text-white font-bold">{f.min} – {f.max > 100 ? '' : f.max} kişi{f.max > 100 ? '+' : ''}</td>
                        <td className={`py-3 px-4 font-bold ${isActive ? 'text-primary' : 'text-primary/60'}`}>{f.label}</td>
                        <td className="py-3 px-4 text-neutral-400">{f.structure}</td>
                        <td className={`py-3 px-4 font-bold ${isActive ? 'text-primary' : 'text-primary/60'}`}>{f.matchRange}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10">
              <p className="text-[10px] text-primary/70 italic tracking-widest flex items-center gap-2">
                ✨ SİSTEM KATILIMCI SAYISINA GÖRE OTOMATİK OPTİMİZE EDİLİR.
              </p>
            </div>
          </div>

          {/* Oyuncu Listesi */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3">
              Kayıtlı Operatörler ({registeredPlayers.length})
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
              {registeredPlayers.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 bg-white/5 border border-white/5 p-2.5 text-xs">
                  <span className="text-[9px] text-neutral-600 font-mono w-5">#{i + 1}</span>
                  <Users className="w-3 h-3 text-primary" />
                  <span className="text-white font-bold">{p.codename}</span>
                </div>
              ))}
            </div>
            {registeredPlayers.length === 0 && (
              <p className="text-neutral-600 text-xs text-center py-4">Kayıtlı oyuncu yok.</p>
            )}
          </div>

          <button
            onClick={generateTournament}
            disabled={registeredPlayers.length < 2}
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 py-4 px-6 font-bold tracking-widest text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-5 h-5" />
            TURNUVA OLUŞTUR VE KARIŞTIR
          </button>
        </div>
      </div>
    );
  }

  // ============ TURNUVA AKTİF — ROUND ROBIN ============
  const standings = calculateStandings(tournament.rounds, tournament.playerIds);
  const totalMatches = tournament.rounds.reduce((acc, r) => acc + r.matches.length, 0);
  const completedMatches = tournament.rounds.reduce((acc, r) => acc + r.matches.filter(m => m.status === 'completed').length, 0);
  const champion = tournament.status === 'completed' ? standings[0] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display uppercase tracking-widest text-primary flex items-center gap-3">
            <Trophy className="w-6 h-6" /> Turnuva Şeması
            {tournament.status === 'completed' && <span className="text-yellow-400 text-sm ml-2">(TAMAMLANDI)</span>}
          </h2>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
            {formatInfo.label} • {tournament.playerIds.length} Oyuncu • {completedMatches}/{totalMatches} Maç
            {polling && <span className="text-primary ml-2 inline-flex items-center gap-1"><Radio className="w-3 h-3 animate-pulse" /> OTO-KONTROL AKTİF (30sn)</span>}
          </p>
        </div>
        <button onClick={resetTournament} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 px-4 text-xs font-bold tracking-widest flex items-center gap-2">
          <Trash2 className="w-3 h-3" /> SIFIRLA
        </button>
      </div>

      {/* Şampiyon Banner */}
      {champion && (
        <div className="bg-yellow-500/10 border-2 border-yellow-500/40 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 animate-pulse" />
          <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-[10px] uppercase tracking-widest text-yellow-500 font-bold">TURNUVA ŞAMPİYONU</p>
          <p className="text-2xl font-display text-white mt-1">{getPlayerName(champion.playerId)}</p>
          <p className="text-xs text-yellow-400/70 mt-1">{champion.wins}G / {champion.draws}B / {champion.losses}M • {champion.points} puan</p>
        </div>
      )}

      {/* PUAN DURUMU TABLOSU */}
      <div className="glass-panel border border-white/10 p-6">
        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
          <Medal className="w-4 h-4" /> Puan Durumu
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-neutral-500 font-bold">#</th>
                <th className="text-left py-2 px-3 text-neutral-500 font-bold">OPERATÖR</th>
                <th className="text-center py-2 px-1 text-neutral-500 font-bold">O</th>
                <th className="text-center py-2 px-1 text-green-500 font-bold">G</th>
                <th className="text-center py-2 px-1 text-yellow-500 font-bold">B</th>
                <th className="text-center py-2 px-1 text-red-500 font-bold">M</th>
                <th className="text-center py-2 px-3 text-primary font-bold">PUAN</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr key={s.playerId} className={`border-b border-white/5 ${i === 0 && tournament.status === 'completed' ? 'bg-yellow-500/5' : ''}`}>
                  <td className="py-2.5 px-3 font-mono text-neutral-600">
                    {i === 0 && tournament.status === 'completed' ? <Crown className="w-3 h-3 text-yellow-400 inline" /> : i + 1}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">{getPlayerName(s.playerId)}</td>
                  <td className="py-2.5 px-1 text-center text-neutral-400">{s.played}</td>
                  <td className="py-2.5 px-1 text-center text-green-400 font-bold">{s.wins}</td>
                  <td className="py-2.5 px-1 text-center text-yellow-400">{s.draws}</td>
                  <td className="py-2.5 px-1 text-center text-red-400">{s.losses}</td>
                  <td className="py-2.5 px-3 text-center text-primary font-black text-sm">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TUR TUR MAÇLAR */}
      <div className="space-y-6">
        {tournament.rounds.map((round, rIdx) => {
          const roundCompleted = round.matches.every(m => m.status === 'completed');
          
          return (
            <div key={rIdx} className={`glass-panel border p-6 ${roundCompleted ? 'border-primary/20' : 'border-white/10'}`}>
              {/* Round Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${roundCompleted ? 'bg-primary/20 text-primary' : 'bg-white/5 text-neutral-500'}`}>
                    {round.roundNumber}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{round.roundNumber}. TUR</p>
                    <p className="text-[9px] text-neutral-600">{round.matches.length} maç</p>
                  </div>
                  {roundCompleted && <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 font-bold tracking-wider">TAMAMLANDI</span>}
                </div>

                {/* Tarih/Saat */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5">
                    <Calendar className="w-3 h-3 text-primary" />
                    <input
                      type="date"
                      value={round.date}
                      onChange={(e) => updateRoundSchedule(rIdx, 'date', e.target.value)}
                      className="bg-transparent text-xs text-white outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5">
                    <Clock className="w-3 h-3 text-primary" />
                    <input
                      type="time"
                      value={round.time}
                      onChange={(e) => updateRoundSchedule(rIdx, 'time', e.target.value)}
                      className="bg-transparent text-xs text-white outline-none"
                    />
                  </div>
                  {/* Tur Başlat Butonu */}
                  {!round.started && !roundCompleted && (
                    <button
                      onClick={() => startRound(rIdx)}
                      disabled={startingRound !== null}
                      className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 py-1.5 px-4 text-[10px] font-bold tracking-widest flex items-center gap-2 disabled:opacity-50"
                    >
                      {startingRound === rIdx ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      TURU BAŞLAT
                    </button>
                  )}
                  {round.started && !roundCompleted && (
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-1 font-bold tracking-wider flex items-center gap-1">
                      <Radio className="w-3 h-3 animate-pulse" /> AKTİF
                    </span>
                  )}
                </div>
              </div>

              {/* Maçlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {round.matches.map((match, mIdx) => {
                  const isCompleted = match.status === 'completed';
                  const p1Won = match.winnerId === match.player1Id;
                  const p2Won = match.winnerId === match.player2Id;
                  const isDraw = match.winnerId === 'draw';
                  const isActive = match.status === 'active';

                  // Canlı durum metni
                  const getStatusLabel = () => {
                    if (match.status === 'pending') return null;
                    if (isCompleted) return null;
                    if (!match.lichessStatus || match.lichessStatus === 'created') {
                      const liveMatch = match.lichessMatchId ? liveMatches[match.lichessMatchId] : null;
                      if (liveMatch) {
                        const wJoined = liveMatch.whiteJoined;
                        const bJoined = liveMatch.blackJoined;
                        if (wJoined && !bJoined) return { text: `${getPlayerName(match.player2Id)} BEKLENİYOR`, color: 'text-yellow-400', pulse: true };
                        if (bJoined && !wJoined) return { text: `${getPlayerName(match.player1Id)} BEKLENİYOR`, color: 'text-yellow-400', pulse: true };
                      }
                      return { text: `${getPlayerName(match.player1Id)} veya ${getPlayerName(match.player2Id)} BEKLENİYOR`, color: 'text-yellow-400', pulse: true };
                    }
                    if (match.lichessStatus === 'started') return { text: 'OYNANIYOR', color: 'text-blue-400', pulse: true };
                    return { text: match.lichessStatus.toUpperCase(), color: 'text-neutral-400', pulse: false };
                  };
                  const statusLabel = getStatusLabel();

                  return (
                    <div key={match.id} className={`border rounded-lg overflow-hidden ${isCompleted ? 'border-primary/20' : isActive ? 'border-blue-500/30' : 'border-white/10'}`}>
                      {/* Canlı durum göstergesi */}
                      {statusLabel && (
                        <div className={`px-3 py-1.5 text-[9px] font-bold tracking-wider flex items-center gap-1.5 ${statusLabel.color} bg-white/3`}>
                          {statusLabel.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current inline-block animate-pulse" />}
                          {statusLabel.text}
                        </div>
                      )}
                      {/* Player 1 */}
                      <button
                        onClick={() => !isCompleted && setMatchResult(rIdx, mIdx, match.player1Id)}
                        disabled={isCompleted}
                        className={`w-full text-left px-4 py-3 text-xs font-bold tracking-wider flex items-center justify-between transition-all ${
                          p1Won ? 'bg-primary/15 text-primary' : isDraw ? 'bg-yellow-500/10 text-yellow-400' : 'bg-white/5 text-white hover:bg-white/10'
                        } disabled:cursor-default`}
                      >
                        <span className="flex items-center gap-2">
                          {p1Won && <Crown className="w-3 h-3" />}
                          {getPlayerName(match.player1Id)}
                        </span>
                        {p1Won && <span className="text-[9px] opacity-70">1</span>}
                        {isDraw && <span className="text-[9px] opacity-70">½</span>}
                        {p2Won && <span className="text-[9px] text-red-400 opacity-70">0</span>}
                      </button>

                      {/* VS Divider */}
                      <div className="h-px bg-white/5 relative">
                        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-2 text-[8px] text-neutral-600 font-bold">VS</span>
                      </div>

                      {/* Player 2 */}
                      <button
                        onClick={() => !isCompleted && setMatchResult(rIdx, mIdx, match.player2Id)}
                        disabled={isCompleted}
                        className={`w-full text-left px-4 py-3 text-xs font-bold tracking-wider flex items-center justify-between transition-all ${
                          p2Won ? 'bg-primary/15 text-primary' : isDraw ? 'bg-yellow-500/10 text-yellow-400' : 'bg-white/5 text-white hover:bg-white/10'
                        } disabled:cursor-default`}
                      >
                        <span className="flex items-center gap-2">
                          {p2Won && <Crown className="w-3 h-3" />}
                          {getPlayerName(match.player2Id)}
                        </span>
                        {p2Won && <span className="text-[9px] opacity-70">1</span>}
                        {isDraw && <span className="text-[9px] opacity-70">½</span>}
                        {p1Won && <span className="text-[9px] text-red-400 opacity-70">0</span>}
                      </button>

                      {/* Actions */}
                      <div className="bg-black/40 px-3 py-1.5 flex items-center justify-between">
                        {!isCompleted ? (
                          <button
                            onClick={() => setMatchResult(rIdx, mIdx, 'draw')}
                            className="text-[9px] text-yellow-500/60 hover:text-yellow-400 font-bold tracking-wider transition-colors"
                          >
                            BERABERE
                          </button>
                        ) : (
                          <span className="text-[9px] text-primary/40 font-bold tracking-wider">
                            {isDraw ? 'BERABERE' : `${getPlayerName(match.winnerId!)} KAZANDI`}
                          </span>
                        )}
                        {isCompleted && (
                          <button
                            onClick={() => resetMatchResult(rIdx, mIdx)}
                            className="text-[9px] text-red-500/40 hover:text-red-400 font-bold tracking-wider transition-colors"
                          >
                            GERİ AL
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Sonraki Tur Eşleştirme Butonu (Dinamik Formatlar İçin) */}
        {['swiss', 'single_elimination', 'double_elimination', 'hybrid'].includes(tournament.format) && 
         tournament.status === 'active' && 
         completedMatches === totalMatches && 
         !checkTournamentFinished(tournament.format, tournament.rounds, tournament.playerIds) && (
          <div className="glass-panel border border-primary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-primary/5 mt-4">
            <div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <Radio className="w-4 h-4 animate-pulse" /> SONRAKİ TUR EŞLEŞMELERİ HAZIR
              </h4>
              <p className="text-[10px] text-neutral-400 mt-1 uppercase">
                {tournament.rounds.length}. tur tamamlandı. {tournament.rounds.length + 1}. tur için yeni eşleşmeleri başlatabilirsiniz.
              </p>
            </div>
            <button
              onClick={generateNextRound}
              className="w-full md:w-auto bg-primary text-black font-display font-bold uppercase tracking-widest text-xs px-6 py-3 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              <Shuffle className="w-4 h-4" /> {tournament.rounds.length + 1}. TURU EŞLEŞTİR VE BAŞLAT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

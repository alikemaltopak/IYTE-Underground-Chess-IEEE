import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc, onSnapshot, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
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

function detectFormat(playerCount: number): { format: string; label: string; desc: string } {
  if (playerCount <= 8) {
    return { format: 'round_robin', label: 'ROUND ROBİN', desc: `Herkes herkesle oynar • ${playerCount * (playerCount - 1) / 2} maç` };
  }
  return { format: 'single_elimination', label: 'TEK ELİMİNASYON', desc: `Kaybeden elenir • ${playerCount - 1} maç` };
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
      
      standings[match.player1Id].played++;
      standings[match.player2Id].played++;

      if (match.winnerId === 'draw') {
        standings[match.player1Id].draws++;
        standings[match.player2Id].draws++;
        standings[match.player1Id].points += 0.5;
        standings[match.player2Id].points += 0.5;
      } else {
        const loserId = match.winnerId === match.player1Id ? match.player2Id : match.player1Id;
        standings[match.winnerId].wins++;
        standings[match.winnerId].points += 1;
        standings[loserId].losses++;
      }
    });
  });

  return Object.values(standings).sort((a, b) => b.points - a.points || b.wins - a.wins);
}

// ============ MAIN COMPONENT ============

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ players, getPlayerName }) => {
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingRound, setStartingRound] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tournament', 'current'), (snap) => {
      if (snap.exists() && !(snap.data() as any).deleted) {
        setTournament(snap.data() as TournamentData);
      } else {
        setTournament(null);
      }
      setLoading(false);
    });
    return () => unsub();
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
    const rounds = generateRoundRobin(playerIds);

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

      for (const round of newRounds) {
        for (const match of round.matches) {
          if (match.status !== 'active' || !match.lichessMatchId) continue;

          try {
            const res = await fetch(`/api/match-result?matchId=${match.lichessMatchId}`);
            const data = await res.json();

            if (!data.success) continue;

            // Maç bitmişse sonucu işle
            const finishedStatuses = ['mate', 'resign', 'stalemate', 'timeout', 'draw', 'outoftime'];
            if (finishedStatuses.includes(data.status)) {
              if (data.status === 'draw' || data.status === 'stalemate' || data.winner === 'Beraberlik') {
                match.winnerId = 'draw';
              } else {
                match.winnerId = data.winner === 'white' ? match.player1Id : match.player2Id;
              }
              match.status = 'completed';
              updated = true;

              // Oyuncu profillerinden maç bilgisini temizle
              const { deleteField } = await import('firebase/firestore');
              const clear = { upcomingMatch: deleteField(), matchId: deleteField(), matchColor: deleteField() };
              await updateDoc(doc(db, 'players', match.player1Id), clear).catch(() => {});
              await updateDoc(doc(db, 'players', match.player2Id), clear).catch(() => {});
            }
          } catch { /* sessiz hata */ }
        }
      }

      if (updated) {
        const allDone = newRounds.every(r => r.matches.every(m => m.status === 'completed'));
        await updateDoc(doc(db, 'tournament', 'current'), {
          rounds: newRounds,
          ...(allDone ? { status: 'completed' } : {})
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

    // Tüm maçlar bitti mi?
    const allDone = newRounds.every(r => r.matches.every(m => m.status === 'completed'));

    await updateDoc(doc(db, 'tournament', 'current'), {
      rounds: newRounds,
      ...(allDone ? { status: 'completed' } : {})
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

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Otomatik Format */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3">Otomatik Format Tespiti</p>
              <div className="bg-primary/5 border border-primary/20 p-5">
                <p className="text-sm font-bold text-primary">{formatInfo.label}</p>
                <p className="text-[10px] text-neutral-400 mt-1">{formatInfo.desc}</p>
                <p className="text-[10px] text-neutral-600 mt-2">
                  {registeredPlayers.length} oyuncu → {registeredPlayers.length <= 8 ? 'Herkes herkesle' : 'Eleme formatı'}
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-white/3 border border-white/5">
                <p className="text-[9px] uppercase tracking-widest text-neutral-600 font-bold mb-2">Format Kuralları</p>
                <div className="space-y-1 text-[10px] text-neutral-500">
                  <p>• 2-8 oyuncu → Round Robin (herkes herkesle)</p>
                  <p>• 9+ oyuncu → Tek Eliminasyon</p>
                  <p>• Eşleşmeler otomatik ve adaletli dağıtılır</p>
                  <p>• Her tura tarih ve saat atanır</p>
                </div>
              </div>
            </div>

            {/* Oyuncu Listesi */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3">
                Kayıtlı Operatörler ({registeredPlayers.length})
              </p>
              <div className="space-y-1 max-h-[240px] overflow-y-auto pr-2">
                {registeredPlayers.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 bg-white/5 border border-white/5 p-2.5 text-xs">
                    <span className="text-[9px] text-neutral-600 font-mono w-5">#{i + 1}</span>
                    <Users className="w-3 h-3 text-primary" />
                    <span className="text-white font-bold">{p.codename}</span>
                  </div>
                ))}
                {registeredPlayers.length === 0 && (
                  <p className="text-neutral-600 text-xs text-center py-4">Kayıtlı oyuncu yok.</p>
                )}
              </div>
            </div>
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

                  return (
                    <div key={match.id} className={`border rounded-lg overflow-hidden ${isCompleted ? 'border-primary/20' : 'border-white/10'}`}>
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
      </div>
    </div>
  );
};

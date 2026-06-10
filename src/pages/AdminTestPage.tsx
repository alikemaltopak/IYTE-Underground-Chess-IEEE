import React, { useEffect, useState } from 'react';
import { collection, doc, updateDoc, deleteField, deleteDoc, onSnapshot, setDoc, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { ShieldAlert, Swords, Loader2, Link as LinkIcon, Trash2, Trophy, XCircle, Minus, Timer, Gavel, LayoutGrid } from 'lucide-react';
import { TournamentBracket } from '../components/TournamentBracket';

export const AdminTestPage = ({ view, setView }: { view: string, setView: (v: any) => void }) => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState<string | null>(null);
  const [processLoading, setProcessLoading] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const [adminTab, setAdminTab] = useState<'matches' | 'bracket'>('matches');

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Korumalı rota
  const adminEmailsString = import.meta.env.VITE_ADMIN_EMAILS || 'alikemaltopak@gmail.com';
  const adminEmails = adminEmailsString.split(',').map((e: string) => e.trim());

  if (!user?.email || !adminEmails.includes(user.email)) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold font-display uppercase tracking-widest text-red-500">Erişim Reddedildi</h1>
        <p className="text-neutral-400 mt-2">Bu alana sadece sistem yöneticileri girebilir.</p>
      </div>
    );
  }

  // Real-time oyuncu listesi
  useEffect(() => {
    const unsubPlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      setPlayers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const unsubMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
      setMatches(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubTournament = onSnapshot(doc(db, 'tournament', 'current'), (snapshot) => {
      if (snapshot.exists()) {
        setTournament(snapshot.data());
      }
    });
    return () => { unsubPlayers(); unsubMatches(); unsubTournament(); };
  }, []);

  // === HIZLI MAÇ OLUŞTUR ===
  const handleQuickMatch = async (targetPlayer: any) => {
    if (!user) return;
    setMatchLoading(targetPlayer.id);

    try {
      const res = await fetch('/api/create-match', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        const { matchId, urlWhite, urlBlack } = data;

        // matches koleksiyonuna kayıt at (15 dk deadline ekle, urlWhite/urlBlack buraya eklenmiyor)
        const deadline = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika sonra
        await setDoc(doc(db, 'matches', matchId), {
          matchId,
          whitePlayerId: user.uid,
          blackPlayerId: targetPlayer.id,
          status: 'active',
          createdAt: serverTimestamp(),
          deadline: Timestamp.fromDate(deadline)
        });

        // Her iki oyuncunun profiline özel koleksiyonda linkleri yaz
        await setDoc(doc(db, 'player_matches', targetPlayer.id), {
          upcomingMatch: urlBlack,
          matchId: matchId,
          matchColor: 'black'
        });

        await setDoc(doc(db, 'player_matches', user.uid), {
          upcomingMatch: urlWhite,
          matchId: matchId,
          matchColor: 'white'
        });

        alert(`Maç oluşturuldu!\nMatch ID: ${matchId}`);
      } else {
        alert("Maç oluşturulamadı: " + data.reason);
      }
    } catch (error: any) {
      console.error("Hızlı Maç Hatası:", error);
      alert("Hata: " + error.message);
    } finally {
      setMatchLoading(null);
    }
  };

  // Yardımcı: Turnuva şemasındaki maçı güncelle
  const updateTournamentMatchResult = async (lichessMatchId: string, winnerId: string, statusText: string) => {
    if (!tournament) return;
    try {
      const newRounds = JSON.parse(JSON.stringify(tournament.rounds));
      let found = false;
      
      for (const round of newRounds) {
        for (const m of round.matches) {
          if (m.lichessMatchId === lichessMatchId) {
            m.winnerId = winnerId;
            m.status = 'completed';
            m.lichessStatus = statusText;
            found = true;
            break;
          }
        }
        if (found) break;
      }
      
      if (found) {
        const allCompleted = newRounds.every((r: any) => r.matches.every((m: any) => m.status === 'completed'));
        await updateDoc(doc(db, 'tournament', 'current'), {
          rounds: newRounds,
          ...(allCompleted ? { status: 'completed' } : {})
        });
        const { syncPlayerStatuses } = await import('../components/TournamentBracket');
        await syncPlayerStatuses(tournament.format, newRounds, tournament.playerIds);
      }
    } catch (e) {
      console.error("Tournament match sync error:", e);
    }
  };

  // === MAÇ SONUCUNU İŞLE ===
  const handleProcessMatch = async (match: any) => {
    setProcessLoading(match.id);
    try {
      // Lichess'ten sonucu çek
      const res = await fetch(`/api/match-result?matchId=${match.matchId}`);
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Sunucudan geçerli bir JSON yanıtı alınamadı. (Lütfen local node server.js'yi yeniden başlattığınızdan emin olun)");
      }
      
      const data = await res.json();

      const deadlineTime = match.deadline?.seconds 
        ? match.deadline.seconds * 1000 
        : (typeof match.deadline?.toDate === 'function' 
            ? match.deadline.toDate().getTime() 
            : new Date(match.deadline).getTime());
      
      const isExpired = deadlineTime > 0 && Date.now() > deadlineTime;

      // Eğer Lichess'te başlamadıysa ve süre bittiyse otomatik hükmen yap
      if ((!data.success || data.status === 'created') && isExpired) {
        const wJoined = match.whiteJoined;
        const bJoined = match.blackJoined;

        let forfeitWinner = null;
        let forfeitReason = '';
        let winnerColor: 'white' | 'black' | 'draw' = 'draw';

        if (wJoined && !bJoined) {
          forfeitWinner = match.whitePlayerId;
          forfeitReason = 'Hükmen (Siyah Gelmedi)';
          winnerColor = 'white';
        } else if (bJoined && !wJoined) {
          forfeitWinner = match.blackPlayerId;
          forfeitReason = 'Hükmen (Beyaz Gelmedi)';
          winnerColor = 'black';
        } else {
          forfeitWinner = 'draw';
          forfeitReason = 'İkisi de Gelmedi';
          winnerColor = 'draw';
        }

        const whiteRef = doc(db, 'players', match.whitePlayerId);
        const blackRef = doc(db, 'players', match.blackPlayerId);
        const matchRef = doc(db, 'matches', match.id);
        await deleteDoc(doc(db, 'player_matches', match.whitePlayerId)).catch(() => {});
        await deleteDoc(doc(db, 'player_matches', match.blackPlayerId)).catch(() => {});

        if (winnerColor === 'white') {
          await updateDoc(whiteRef, { wins: increment(1) });
          await updateDoc(blackRef, { losses: increment(1) });
        } else if (winnerColor === 'black') {
          await updateDoc(whiteRef, { losses: increment(1) });
          await updateDoc(blackRef, { wins: increment(1) });
        } else {
          await updateDoc(whiteRef, { draws: increment(1) });
          await updateDoc(blackRef, { draws: increment(1) });
        }

        await updateDoc(matchRef, { 
          status: 'completed', 
          winner: winnerColor, 
          result: forfeitReason 
        });

        await updateTournamentMatchResult(match.matchId, forfeitWinner, forfeitReason);
        alert(`Maç süresi dolduğu için otomatik hükmen sonuçlandırıldı!\nSonuç: ${forfeitReason}`);
        return;
      }

      if (!data.success || data.status === 'started' || data.status === 'created') {
        alert("Maç henüz bitmedi veya bulunamadı.\nDurum: " + (data.status || 'bilinmiyor'));
        setProcessLoading(null);
        return;
      }

      // Maç bitti! Sonucu işle
      const whiteRef = doc(db, 'players', match.whitePlayerId);
      const blackRef = doc(db, 'players', match.blackPlayerId);
      const matchRef = doc(db, 'matches', match.id);

      await deleteDoc(doc(db, 'player_matches', match.whitePlayerId)).catch(() => {});
      await deleteDoc(doc(db, 'player_matches', match.blackPlayerId)).catch(() => {});

      if (data.winner === 'white') {
        // Beyaz kazandı
        await updateDoc(whiteRef, { wins: increment(1) });
        await updateDoc(blackRef, { losses: increment(1) });
        await updateDoc(matchRef, { status: 'completed', winner: 'white', result: `${getPlayerName(match.whitePlayerId)} kazandı` });
        await updateTournamentMatchResult(match.matchId, match.whitePlayerId, data.status || 'completed');
        alert(`Maç bitti! Kazanan: ${getPlayerName(match.whitePlayerId)} (BEYAZ)`);

      } else if (data.winner === 'black') {
        // Siyah kazandı
        await updateDoc(whiteRef, { losses: increment(1) });
        await updateDoc(blackRef, { wins: increment(1) });
        await updateDoc(matchRef, { status: 'completed', winner: 'black', result: `${getPlayerName(match.blackPlayerId)} kazandı` });
        await updateTournamentMatchResult(match.matchId, match.blackPlayerId, data.status || 'completed');
        alert(`Maç bitti! Kazanan: ${getPlayerName(match.blackPlayerId)} (SİYAH)`);

      } else {
        // Beraberlik
        await updateDoc(whiteRef, { draws: increment(1) });
        await updateDoc(blackRef, { draws: increment(1) });
        await updateDoc(matchRef, { status: 'completed', winner: 'draw', result: 'Beraberlik' });
        await updateTournamentMatchResult(match.matchId, 'draw', data.status || 'completed');
        alert("Maç berabere bitti!");
      }

    } catch (error: any) {
      console.error("Process error:", error);
      alert("İşlem hatası: " + error.message);
    } finally {
      setProcessLoading(null);
    }
  };

  // === TEK MAÇ SİL ===
  const handleDeleteMatch = async (match: any) => {
    if (!confirm(`"${getPlayerName(match.whitePlayerId)} vs ${getPlayerName(match.blackPlayerId)}" maçını silmek istediğine emin misin?`)) return;
    try {
      // Oyuncuların maç bilgilerini temizle
      await deleteDoc(doc(db, 'player_matches', match.whitePlayerId)).catch(() => {});
      await deleteDoc(doc(db, 'player_matches', match.blackPlayerId)).catch(() => {});
      // Maç kaydını sil
      await deleteDoc(doc(db, 'matches', match.id));
    } catch (err: any) {
      alert('Silme hatası: ' + err.message);
    }
  };

  // === TÜM MAÇLARI TEMİZLE ===
  const handleClearAllMatches = async () => {
    if (!confirm(`Toplam ${matches.length} maç kaydı silinecek. Emin misin?`)) return;
    try {
      for (const match of matches) {
        await deleteDoc(doc(db, 'player_matches', match.whitePlayerId)).catch(() => {});
        await deleteDoc(doc(db, 'player_matches', match.blackPlayerId)).catch(() => {});
        await deleteDoc(doc(db, 'matches', match.id));
      }
    } catch (err: any) {
      alert('Toplu silme hatası: ' + err.message);
    }
  };

  // === KINGSHADOW & SKIP 06 3. TUR DÜZELTME PROTOKOLÜ ===
  const handleFixKingShadow = async () => {
    if (!window.confirm("Kingshadow'ı eleyip, r3_lm12 maçını skip 06 vs muzceviz olarak güncellemek ve skip 06'nın bay geçtiği r3_wbye maçını kaldırmak istediğinize emin misiniz?")) {
      return;
    }
    try {
      let kingshadowUid = "";
      let skip06Uid = "";
      let muzcevizUid = "";

      players.forEach(p => {
        if (p.codename === "kingshadow") kingshadowUid = p.id;
        if (p.codename === "skip 06" || p.codename === "skip06") skip06Uid = p.id;
        if (p.codename === "muzceviz") muzcevizUid = p.id;
      });

      if (!kingshadowUid || !skip06Uid || !muzcevizUid) {
        alert(`Gerekli oyuncular bulunamadı!\nkingshadow: ${kingshadowUid || 'BULUNAMADI'}\nskip 06: ${skip06Uid || 'BULUNAMADI'}\nmuzceviz: ${muzcevizUid || 'BULUNAMADI'}`);
        return;
      }

      if (!tournament) {
        alert("Turnuva bilgisi yüklenemedi!");
        return;
      }

      const tourneyRef = doc(db, "tournament", "current");
      const newRounds = JSON.parse(JSON.stringify(tournament.rounds));
      const round3 = newRounds[2]; // Round 3 index is 2

      if (!round3 || round3.roundNumber !== 3) {
        alert("3. Tur verisi bulunamadı!");
        return;
      }

      // a. Match r3_lm12'yi güncelle: kingshadow yerine skip 06 yaz
      let matchFound = false;
      round3.matches = round3.matches.map((m: any) => {
        if (m.id === "r3_lm12") {
          if (m.player1Id === kingshadowUid) {
            m.player1Id = skip06Uid;
            matchFound = true;
          } else if (m.player2Id === kingshadowUid) {
            m.player2Id = skip06Uid;
            matchFound = true;
          }
        }
        return m;
      });

      if (!matchFound) {
        alert("r3_lm12 maçı kingshadow ile bulunamadı veya zaten düzeltildi!");
        return;
      }

      // b. r3_wbye (skip 06 vs BYE) maçını kaldır
      round3.matches = round3.matches.filter((m: any) => m.id !== "r3_wbye");

      // c. Firestore'da turnuvayı güncelle
      await updateDoc(tourneyRef, { rounds: newRounds });

      // d. Oyuncu durumlarını güncelle
      await updateDoc(doc(db, "players", kingshadowUid), { status: "eliminated" });
      await updateDoc(doc(db, "players", skip06Uid), { status: "active" });

      // e. Oyuncu durumlarını eşitle (syncPlayerStatuses)
      const { syncPlayerStatuses } = await import('../components/TournamentBracket');
      await syncPlayerStatuses(tournament.format, newRounds, tournament.playerIds);

      alert("Düzeltme protokolü başarıyla uygulandı!\nkingshadow elendi.\nskip 06 aktif edildi ve r3_lm12 maçında muzceviz ile eşleştirildi.");
    } catch (err: any) {
      console.error(err);
      alert("Hata oluştu: " + err.message);
    }
  };

  // Yardımcı: ID'den oyuncu adı bul
  const getPlayerName = (uid: string) => {
    const p = players.find(p => p.id === uid);
    return p?.codename || uid;
  };

  // === HÜKMEN MAĞLUBİYET ===
  const handleForfeit = async (match: any, absentColor: 'white' | 'black') => {
    const winnerName = absentColor === 'white' ? getPlayerName(match.blackPlayerId) : getPlayerName(match.whitePlayerId);
    const loserName = absentColor === 'white' ? getPlayerName(match.whitePlayerId) : getPlayerName(match.blackPlayerId);
    if (!confirm(`${loserName} maça katılmadı. ${winnerName} hükmen galip ilan edilecek. Onaylıyor musun?`)) return;

    const whiteRef = doc(db, 'players', match.whitePlayerId);
    const blackRef = doc(db, 'players', match.blackPlayerId);
    const matchRef = doc(db, 'matches', match.id);
    await deleteDoc(doc(db, 'player_matches', match.whitePlayerId)).catch(() => {});
    await deleteDoc(doc(db, 'player_matches', match.blackPlayerId)).catch(() => {});

    const winnerId = absentColor === 'white' ? match.blackPlayerId : match.whitePlayerId;
    const forfeitReason = absentColor === 'white' ? 'Hükmen (Beyaz Gelmedi)' : 'Hükmen (Siyah Gelmedi)';

    if (absentColor === 'white') {
      await updateDoc(whiteRef, { losses: increment(1) });
      await updateDoc(blackRef, { wins: increment(1) });
      await updateDoc(matchRef, { status: 'completed', winner: 'black', result: `${winnerName} kazandı (Hükmen)` });
    } else {
      await updateDoc(whiteRef, { wins: increment(1) });
      await updateDoc(blackRef, { losses: increment(1) });
      await updateDoc(matchRef, { status: 'completed', winner: 'white', result: `${winnerName} kazandı (Hükmen)` });
    }

    // Turnuva şemasını güncelle
    await updateTournamentMatchResult(match.matchId, winnerId, forfeitReason);
  };

  // Yardımcı: deadline güvenli milisaniyeye çevir
  const getDeadlineTime = (deadline: any): number => {
    if (!deadline) return 0;
    if (typeof deadline.toDate === 'function') return deadline.toDate().getTime();
    if (typeof deadline.seconds === 'number') return deadline.seconds * 1000;
    const parsed = new Date(deadline).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  // Yardımcı: deadline geçmiş mi
  const isDeadlinePassed = (match: any) => {
    const deadlineTime = getDeadlineTime(match.deadline);
    return deadlineTime > 0 && Date.now() > deadlineTime;
  };

  // Yardımcı: kalan süre text
  const getRemainingTime = (match: any) => {
    const deadlineTime = getDeadlineTime(match.deadline);
    if (!deadlineTime) return '';
    const remaining = deadlineTime - Date.now();
    if (remaining <= 0) return 'SÜRE DOLDU';
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Aktif maçlar
  const activeMatches = matches.filter(m => m.status === 'active');
  const completedMatches = matches.filter(m => m.status === 'completed');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.03)_0,transparent_100%)] pointer-events-none" />
      <Navbar view={view} setView={setView} />
      
      <main className="pt-24 px-6 md:px-12 max-w-6xl mx-auto pb-20 relative z-10">
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center gap-4">
            <ShieldAlert className="w-10 h-10" />
            Admin Kontrol Paneli
          </h1>
          <p className="text-neutral-400 mt-2 tracking-widest text-sm">HAYALET MAÇ (GHOST MATCH) SİSTEMİ</p>
        </header>

        {/* TAB NAVİGASYON */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-3">
          <button
            onClick={() => setAdminTab('matches')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
              adminTab === 'matches' ? 'bg-primary/10 text-primary border border-primary/30' : 'text-neutral-500 hover:text-white border border-white/5'
            }`}
          >
            <Swords className="w-4 h-4" /> Maç Yönetimi
          </button>
          <button
            onClick={() => setAdminTab('bracket')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
              adminTab === 'bracket' ? 'bg-primary/10 text-primary border border-primary/30' : 'text-neutral-500 hover:text-white border border-white/5'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Turnuva Şeması
          </button>
        </div>

        {/* TURNUVA ŞEMASI TAB'I */}
        {adminTab === 'bracket' && (
          <TournamentBracket players={players} getPlayerName={getPlayerName} isAdmin={true} />
        )}

        {/* MAÇ YÖNETİMİ TAB'I */}
        {adminTab === 'matches' && (<>

        {/* AKSİYON BUTONLARI KONTEYNERI */}
        <div className="mb-6 flex flex-wrap gap-3 justify-between items-center">
          {/* PROTOKOL DÜZELTME BUTONU */}
          {tournament && tournament.rounds?.length >= 3 && (
            <button
              onClick={handleFixKingShadow}
              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 py-2 px-5 text-xs font-bold tracking-widest flex items-center gap-2 rounded-lg transition-all"
            >
              <ShieldAlert className="w-4 h-4" /> 3. TUR EŞLEŞMELERİNİ DÜZELT (Prot.)
            </button>
          )}

          {/* TOPLU TEMİZLE BUTONU */}
          {matches.length > 0 ? (
            <button
              onClick={handleClearAllMatches}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 px-5 text-xs font-bold tracking-widest flex items-center gap-2 rounded-lg transition-all"
            >
              <Trash2 className="w-3 h-3" /> TÜM MAÇLARI TEMİZLE ({matches.length})
            </button>
          ) : <div />}
        </div>

        {/* AKTİF MAÇLAR */}
        {activeMatches.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <Swords className="w-5 h-5" /> Aktif Maçlar ({activeMatches.length})
            </h2>
            <div className="space-y-3">
              {activeMatches.map((match) => {
                const expired = isDeadlinePassed(match);
                return (
                <div key={match.id} className={`bg-white/5 border p-4 rounded-lg flex flex-col gap-3 ${expired ? 'border-red-500/40' : 'border-primary/20'}`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">
                        ⬜ {getPlayerName(match.whitePlayerId)} <span className="text-neutral-500 mx-2">vs</span> ⬛ {getPlayerName(match.blackPlayerId)}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] text-neutral-500 font-mono">ID: {match.matchId}</p>
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${expired ? 'text-red-400' : 'text-yellow-400'}`}>
                          <Timer className="w-3 h-3" /> {getRemainingTime(match)}
                        </span>
                      </div>
                      <div className="mt-2 text-xs flex flex-wrap gap-x-4 gap-y-1 font-mono">
                        <span className="text-neutral-500 uppercase tracking-widest text-[9px] font-bold">Giriş Durumu:</span>
                        <span className={match.whiteJoined ? 'text-primary font-bold' : 'text-yellow-500'}>
                          ⬜ {getPlayerName(match.whitePlayerId)}: {match.whiteJoined ? 'GİRİŞ YAPTI ✓' : 'BEKLENİYOR...'}
                        </span>
                        <span className={match.blackJoined ? 'text-primary font-bold' : 'text-yellow-500'}>
                          ⬛ {getPlayerName(match.blackPlayerId)}: {match.blackJoined ? 'GİRİŞ YAPTI ✓' : 'BEKLENİYOR...'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleProcessMatch(match)}
                        disabled={processLoading === match.id}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 py-2 px-4 text-xs font-bold tracking-widest flex items-center gap-2 disabled:opacity-50"
                      >
                        {processLoading === match.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '🔍 SONUCU İŞLE'}
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(match)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 px-3 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Süre dolduysa hükmen mağlubiyet butonları */}
                  {expired && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-red-500/20">
                      <p className="text-[10px] text-red-400 font-bold flex items-center gap-1 mr-auto">
                        <Gavel className="w-3 h-3" /> SÜRE DOLDU — Hükmen karar ver:
                      </p>
                      <button
                        onClick={() => handleForfeit(match, 'white')}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 py-1.5 px-3 text-[10px] font-bold tracking-wider"
                      >
                        ⬜ {getPlayerName(match.whitePlayerId)} GELMEMEDİ
                      </button>
                      <button
                        onClick={() => handleForfeit(match, 'black')}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 py-1.5 px-3 text-[10px] font-bold tracking-wider"
                      >
                        ⬛ {getPlayerName(match.blackPlayerId)} GELMEMEDİ
                      </button>
                    </div>
                  )}
                </div>
              )})}
            </div>
          </div>
        )}

        {/* TAMAMLANAN MAÇLAR */}
        {completedMatches.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Tamamlanan Maçlar ({completedMatches.length})
            </h2>
            <div className="space-y-2">
              {completedMatches.map((match) => (
                <div key={match.id} className="bg-white/3 border border-white/5 p-3 rounded-lg flex items-center justify-between text-sm">
                  <p className="text-neutral-300">
                    ⬜ {getPlayerName(match.whitePlayerId)} vs ⬛ {getPlayerName(match.blackPlayerId)}
                  </p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    match.winner === 'draw' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-primary/10 text-primary'
                  }`}>
                    {match.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OYUNCU LİSTESİ */}
        <h2 className="text-lg font-bold text-primary uppercase tracking-widest mb-4">Oyuncular</h2>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.filter(p => p.id !== user?.uid).map((player) => (
              <div key={player.id} className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-sm relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors" />
                
                <h3 className="text-xl font-bold font-display uppercase tracking-wider mb-1">
                  {player.codename || "Bilinmeyen Hedef"}
                </h3>
                <p className="text-xs text-neutral-500 font-mono mb-2">{player.email}</p>
                
                {/* Skor */}
                <div className="flex gap-3 mb-4 text-xs">
                  <span className="flex items-center gap-1 text-green-400"><Trophy className="w-3 h-3" /> {player.wins || 0}</span>
                  <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3 h-3" /> {player.losses || 0}</span>
                  <span className="flex items-center gap-1 text-yellow-400"><Minus className="w-3 h-3" /> {player.draws || 0}</span>
                </div>

                {/* Aktif maç varsa bilgi göster + iptal butonu */}
                {(() => {
                  const playerActiveMatch = matches.find(m => m.status === 'active' && (m.whitePlayerId === player.id || m.blackPlayerId === player.id));
                  if (playerActiveMatch) {
                    return (
                      <div className="mb-4 space-y-2">
                        <div className="bg-primary/10 border border-primary/20 p-2 rounded text-xs text-primary flex items-center gap-2">
                          <LinkIcon className="w-3 h-3" /> Aktif Maç Bekliyor
                        </div>
                        <button
                          onClick={() => handleDeleteMatch(playerActiveMatch)}
                          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 px-3 text-[10px] font-bold tracking-widest flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> MAÇI İPTAL ET
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button 
                      onClick={() => handleQuickMatch(player)}
                      disabled={matchLoading === player.id}
                      className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 py-2.5 px-4 font-bold tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {matchLoading === player.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Swords className="w-4 h-4" />
                          HIZLI MAÇ
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            ))}
            
            {players.length <= 1 && (
              <div className="col-span-full text-center text-neutral-500 py-10">
                Sistemde test edilecek başka oyuncu bulunmuyor.
              </div>
            )}
          </div>
        )}
        </>)}
      </main>
    </div>
  );
};

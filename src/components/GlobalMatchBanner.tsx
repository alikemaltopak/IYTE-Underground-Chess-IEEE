import React, { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { PlayerData } from '../services/playerService';

export const GlobalMatchBanner = () => {
  const { user } = useAuth();
  const [matchLinkInfo, setMatchLinkInfo] = useState<{ upcomingMatch?: string; matchId?: string; matchColor?: 'white' | 'black' } | null>(null);
  const [matchStatus, setMatchStatus] = useState<string>('');
  const [countdown, setCountdown] = useState('');
  const forfeitTriggeredRef = useRef(false);

  // Oyuncu eşleşme verisini dinle (player_matches koleksiyonundan, güvenlik için)
  useEffect(() => {
    if (!user) return;
    const matchLinkRef = doc(db, 'player_matches', user.uid);
    const unsubscribe = onSnapshot(matchLinkRef, (docSnap) => {
      if (docSnap.exists()) {
        setMatchLinkInfo(docSnap.data() as any);
      } else {
        setMatchLinkInfo(null);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Maç verisini dinle
  useEffect(() => {
    if (!matchLinkInfo?.matchId) {
      setCountdown('');
      setMatchStatus('');
      forfeitTriggeredRef.current = false;
      return;
    }

    const matchRef = doc(db, 'matches', matchLinkInfo.matchId);
    const unsubMatch = onSnapshot(matchRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const deadline = data?.deadline;
      const status = data?.status;
      
      if (status) {
        setMatchStatus(status);
      }

      if (!deadline || status === 'started' || status === 'completed') {
        setCountdown('');
        return;
      }

      const tick = () => {
        const deadlineTime = deadline.seconds 
          ? deadline.seconds * 1000 
          : (typeof deadline.toDate === 'function' 
              ? deadline.toDate().getTime() 
              : new Date(deadline).getTime());
        const remaining = deadlineTime - Date.now();
        if (remaining <= 0) {
          setCountdown('SÜRE DOLDU — Hükmen Değerlendiriliyor...');
          if (!forfeitTriggeredRef.current && user) {
            forfeitTriggeredRef.current = true;
            triggerAutoForfeit(matchLinkInfo.matchId!, user.uid);
          }
          return;
        }
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
      };
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    });

    return () => unsubMatch();
  }, [matchLinkInfo?.matchId, user]);

  const triggerAutoForfeit = async (matchId: string, currentUid: string) => {
    try {
      // 1. Lichess durumunu kontrol et
      const res = await fetch(`/api/match-result?matchId=${matchId}`);
      const data = await res.json();
      
      // Eğer Lichess'te başladıysa (started) veya bittiyse (mate, resign vb.) kendi akışında işlenir, hükmen yapma
      if (data.success && data.status !== 'created') {
        return; 
      }
      
      // 2. Matches kaydını oku
      const matchRef = doc(db, 'matches', matchId);
      const matchSnap = await getDoc(matchRef);
      if (!matchSnap.exists()) return;
      
      const mData = matchSnap.data();
      if (mData.status === 'completed') return; // Zaten tamamlanmış
      
      // 3. Kim gelmiş kim gelmemiş tespit et
      const wJoined = mData.whiteJoined;
      const bJoined = mData.blackJoined;
      
      let forfeitWinner = null;
      let forfeitReason = '';
      let winnerColor: 'white' | 'black' | 'draw' = 'draw';
      
      if (wJoined && !bJoined) {
        forfeitWinner = mData.whitePlayerId;
        forfeitReason = 'Hükmen (Siyah Gelmedi)';
        winnerColor = 'white';
      } else if (bJoined && !wJoined) {
        forfeitWinner = mData.blackPlayerId;
        forfeitReason = 'Hükmen (Beyaz Gelmedi)';
        winnerColor = 'black';
      } else {
        forfeitWinner = 'draw';
        forfeitReason = 'İkisi de Gelmedi';
        winnerColor = 'draw';
      }
      
      // 4. İstatistikleri güncelle ve player_matches kayıtlarını temizle
      const whiteRef = doc(db, 'players', mData.whitePlayerId);
      const blackRef = doc(db, 'players', mData.blackPlayerId);
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'player_matches', mData.whitePlayerId)).catch(() => {});
      await deleteDoc(doc(db, 'player_matches', mData.blackPlayerId)).catch(() => {});
      
      if (winnerColor === 'white') {
        await updateDoc(whiteRef, { wins: increment(1) }).catch(() => {});
        await updateDoc(blackRef, { losses: increment(1) }).catch(() => {});
      } else if (winnerColor === 'black') {
        await updateDoc(whiteRef, { losses: increment(1) }).catch(() => {});
        await updateDoc(blackRef, { wins: increment(1) }).catch(() => {});
      } else {
        await updateDoc(whiteRef, { draws: increment(1) }).catch(() => {});
        await updateDoc(blackRef, { draws: increment(1) }).catch(() => {});
      }
      
      // 5. Matches kaydını kapat
      await updateDoc(matchRef, {
        status: 'completed',
        winner: winnerColor,
        result: forfeitReason
      });
      
      // 6. Tournament belgesini güncelle
      const tournamentRef = doc(db, 'tournament', 'current');
      const tournamentSnap = await getDoc(tournamentRef);
      if (tournamentSnap.exists()) {
        const tData = tournamentSnap.data();
        const newRounds = JSON.parse(JSON.stringify(tData.rounds));
        let found = false;
        
        for (const round of newRounds) {
          for (const m of round.matches) {
            if (m.lichessMatchId === matchId) {
              m.winnerId = forfeitWinner;
              m.status = 'completed';
              m.lichessStatus = forfeitReason;
              found = true;
              break;
            }
          }
          if (found) break;
        }
        
        if (found) {
          const allCompleted = newRounds.every((r: any) => r.matches.every((m: any) => m.status === 'completed'));
          await updateDoc(tournamentRef, {
            rounds: newRounds,
            ...(allCompleted ? { status: 'completed' } : {})
          });
          const { syncPlayerStatuses } = await import('./TournamentBracket');
          await syncPlayerStatuses(tData.format, newRounds, tData.playerIds);
        }
      }
      
    } catch (e) {
      console.error("Auto forfeit banner trigger error:", e);
    }
  };

  if (!matchLinkInfo?.upcomingMatch || matchStatus === 'completed') return null;

  return (
    <div className="fixed top-16 left-0 w-full z-40 bg-[#050505]/95 backdrop-blur-xl border-b border-primary/30 p-4 md:px-10 shadow-[0_10px_30px_rgba(34,197,94,0.15)] flex justify-center">
      <div className="w-full max-w-6xl rounded-xl bg-primary/10 border border-primary p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />
              SİSTEM MESAJI: ÇATIŞMA VAKTİ
            </p>
            {matchStatus === 'started' ? (
              <p className="text-white text-xs mb-1 font-bold">
                Maça giriş yaptınız. Lichess üzerinde oynamaya devam edin.
              </p>
            ) : (
              <p className="text-white text-xs mb-1">
                Sistem sizi bir eşleşmeye atadı. Aşağıdaki butona tıklayarak satranç tahtasına (Lichess) intikal edin.
              </p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <p className="text-xs text-neutral-400">
                Renginiz: <span className="text-primary font-bold">{matchLinkInfo.matchColor === 'white' ? '⬜ BEYAZ' : '⬛ SİYAH'}</span>
              </p>
              {countdown && matchStatus !== 'started' && (
                <p className={`text-xs font-bold font-mono ${countdown.includes('DOLDU') ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                  ⏱️ Kalan: {countdown}
                </p>
              )}
              {matchStatus === 'started' && (
                <p className="text-xs font-bold font-mono text-blue-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block animate-pulse" /> OYNANIYOR
                </p>
              )}
            </div>
          </div>
          <a 
            href={matchLinkInfo.upcomingMatch}
            target="_blank"
            rel="noopener noreferrer"
            onClick={async () => {
              try {
                const matchRef = doc(db, 'matches', matchLinkInfo.matchId!);
                await updateDoc(matchRef, {
                  [`${matchLinkInfo.matchColor}Joined`]: true
                });
              } catch (e) {
                console.error("Failed to mark as joined:", e);
              }
            }}
            className="shrink-0 bg-primary text-black font-black text-[10px] md:text-xs uppercase tracking-widest py-2 md:py-3 px-6 hover:bg-white transition-colors text-center cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.4)] inline-block"
          >
            MAÇ ALANINA GİRİŞ YAP
          </a>
        </div>
      </div>
    </div>
  );
};

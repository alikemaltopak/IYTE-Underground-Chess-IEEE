import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { PlayerData } from '../services/playerService';

export const GlobalMatchBanner = () => {
  const { user } = useAuth();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [matchStatus, setMatchStatus] = useState<string>('');
  const [countdown, setCountdown] = useState('');

  // Oyuncu verisini dinle
  useEffect(() => {
    if (!user) return;
    const playerRef = doc(db, 'players', user.uid);
    const unsubscribe = onSnapshot(playerRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlayer(docSnap.data() as PlayerData);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Maç verisini dinle
  useEffect(() => {
    if (!player?.matchId) {
      setCountdown('');
      setMatchStatus('');
      return;
    }

    const matchRef = doc(db, 'matches', player.matchId);
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
        const remaining = deadline.toDate().getTime() - Date.now();
        if (remaining <= 0) {
          setCountdown('SÜRE DOLDU — Acilen katılın!');
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
  }, [player?.matchId]);

  if (!player?.upcomingMatch || matchStatus === 'completed') return null;

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
                Renginiz: <span className="text-primary font-bold">{player.matchColor === 'white' ? '⬜ BEYAZ' : '⬛ SİYAH'}</span>
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
          <button 
            onClick={async () => {
              try {
                const matchRef = doc(db, 'matches', player.matchId!);
                await updateDoc(matchRef, {
                  [`${player.matchColor}Joined`]: true
                });
              } catch (e) {
                console.error("Failed to mark as joined:", e);
              }
              window.open(player.upcomingMatch, "_blank");
            }}
            className="shrink-0 bg-primary text-black font-black text-[10px] md:text-xs uppercase tracking-widest py-2 md:py-3 px-6 hover:bg-white transition-colors text-center cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            MAÇ ALANINA GİRİŞ YAP
          </button>
        </div>
      </div>
    </div>
  );
};

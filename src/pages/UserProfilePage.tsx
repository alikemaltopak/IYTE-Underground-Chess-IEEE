import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { LogOut, CalendarDays, Globe, Clock3, Sword, Target, Zap, Shield, Grid3X3, AlignVerticalSpaceAround, Network, Expand, BrainCircuit } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { PlayerData } from '../services/playerService';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { checkRegistrationClosed, parseDeadline } from '../utils/date';


const archetypes = [
  { name: 'CENTER CONTROL', desc: 'Merkezi ele geçir, oyunu sen yönlendir. Taşlarının hareket alanını artırırken rakibin seçeneklerini kısıtla. Oyunun temposunu belirleyen temel güç.', img: '/archetype_queen_1777845711451.png' },
  { name: 'DEVELOPMENT', desc: 'Taşlarını hızlı ve verimli geliştir. Erken oyunda aktif olmayan taş = kayıp tempo. Hızlı gelişim, erken baskı demektir.', img: '/archetype_knight_1777845681434.png' },
  { name: 'KING SAFETY', desc: 'Şahını koru, oyunda kal. Erken rok ile savunmanı kur, saldırıya güvenle hazırlan. Savunması zayıf şah = kaybedilmiş oyun.', img: '/archetype_rook_1777845755157.png' },
  { name: 'PAWN STRUCTURE', desc: 'Piyonlar oyunun iskeletidir. Zayıf yapı uzun vadede çöker, sağlam yapı oyunu taşır. Stratejik savaşların görünmeyen kahramanı.', img: '/archetype_pawn_1777845767210.png' },
  { name: 'OPEN FILE CONTROL', desc: 'Açık hatları ele geçir, kalelerini aktif kullan. Dikey baskı kurarak rakibin savunmasını parçala. Doğru hatta yerleşen kale = ölümcül güç.', img: '/archetype_bishop_1777845695755.png' },
  { name: 'TACTICS', desc: 'Ani hamlelerle oyunu bitir. Çatal, çivi ve fedalarla rakibi hazırlıksız yakala. Bir hamlede oyunun kaderini değiştir.', img: '/archetype_cipher_1777845778793.png' },
  { name: 'COORDINATION', desc: 'Taşlarını birlikte konuştur. Uyumlu çalışan taşlar tek tek olandan kat kat güçlüdür. Gerçek güç, takım oyunundan gelir.', img: '/archetype_overseer_1777845810324.png' },
  { name: 'SPACE ADVANTAGE', desc: 'Alanı kontrol et, rakibi sıkıştır. Daha fazla alan = daha fazla seçenek. Rakibini nefessiz bırakan stratejik üstünlük.', img: '/archetype_phantom_1777845795649.png' },
  { name: 'PLAN MAKING', desc: 'Plansız hamle yok. Her hareket bir amaca hizmet etmeli. Kazanan oyuncu, düşünen oyuncudur.', img: '/archetype_strategist_1777845727599.png' }
];

const archetypeImages: Record<string, string> = {
  'SPECTATOR': '/screen.png'
};
const archetypeDescs: Record<string, string> = {
  'SPECTATOR': 'Turnuvaya katılım yapmadınız veya kayıt süresi doldu. Turnuva maçlarını canlı takip edebilir ve skor tablosunu inceleyebilirsiniz.'
};

archetypes.forEach(a => {
  archetypeImages[a.name] = a.img;
  archetypeDescs[a.name] = a.desc;
});

const ARCHETYPE_ICONS: Record<string, any> = {
  'CENTER CONTROL': Target,
  'DEVELOPMENT': Zap,
  'KING SAFETY': Shield,
  'PAWN STRUCTURE': Grid3X3,
  'OPEN FILE CONTROL': AlignVerticalSpaceAround,
  'TACTICS': Sword,
  'COORDINATION': Network,
  'SPACE ADVANTAGE': Expand,
  'PLAN MAKING': BrainCircuit,
  'SPECTATOR': Shield,
};


export const UserProfilePage = ({ onBack, view, setView }: { onBack: () => void; view: any; setView: (v: any) => void }) => {
  const { user, logout } = useAuth();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState('');
  const [tournament, setTournament] = useState<any>(null);
  const [playersMap, setPlayersMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');

    const playerRef = doc(db, 'players', user.uid);
    const unsubscribe = onSnapshot(playerRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlayer(docSnap.data() as PlayerData);
        setError('');
      } else {
        const isClosed = checkRegistrationClosed(tournament?.status);
        if (isClosed) {
          setPlayer({
            uid: user.uid,
            codename: 'İZLEYİCİ (SPECTATOR)',
            studentId: 'N/A',
            archetype: 'SPECTATOR',
            email: user.email || '',
            joinedAt: null,
            status: 'active'
          } as any);
          setError('');
        } else {
          setError('Karakter bilgisi bulunamadı. Karakter oluşturmak için ana sayfaya dönün.');
        }
      }
      setLoading(false);
    }, (err) => {
      console.error('Profil yükleme hatası:', err);
      setError('Profil verisi alınırken bir hata oluştu.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, tournament?.status]);


  // Geri sayım zamanlayıcısı ve maç durumu
  const [matchStatus, setMatchStatus] = useState<string>('');
  const [matchData, setMatchData] = useState<any>(null);

  useEffect(() => {
    const unsubTourney = onSnapshot(doc(db, 'tournament', 'current'), (snap) => {
      if (snap.exists() && !snap.data().deleted) setTournament(snap.data());
      else setTournament(null);
    });
    
    const unsubPlayers = onSnapshot(collection(db, 'players'), (snap) => {
      const pMap: Record<string, any> = {};
      snap.docs.forEach(d => {
        pMap[d.id] = {
          codename: d.data().codename || 'Bilinmeyen',
          archetype: d.data().archetype
        };
      });
      setPlayersMap(pMap);
    });

    return () => { unsubTourney(); unsubPlayers(); };
  }, []);

  useEffect(() => {
    if (!player?.matchId) { setCountdown(''); setMatchStatus(''); setMatchData(null); return; }

    const matchRef = doc(db, 'matches', player.matchId);
    const unsubMatch = onSnapshot(matchRef, (snap) => {
      if (!snap.exists()) { setMatchData(null); return; }
      const data = snap.data();
      setMatchData(data);
      const deadline = data?.deadline;
      const status = data?.status;
      
      if (status) {
        setMatchStatus(status);
      }

      if (!deadline || status === 'started') {
        setCountdown('');
        return;
      }

      const tick = () => {
        const deadlineTime = parseDeadline(deadline);
        if (!deadlineTime) {
          setCountdown('');
          return;
        }
        const remaining = deadlineTime - Date.now();
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

  const handleLogout = async () => {
    await logout();
  };

  const cardImage = player ? archetypeImages[player.archetype] || '/screen.png' : '/screen.png';

  return (
    <div className="min-h-screen bg-[#050505] text-on-surface font-sans selection:bg-primary/30 relative overflow-x-hidden pt-20">
      <div className="fixed inset-0 pointer-events-none opacity-20 chess-grid bg-[size:64px_64px]"></div>
      <div className="scanline"></div>
      <Navbar view={view} setView={setView} />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">


        <section className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="glass-panel border border-white/10 p-8 break-words">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-bold mb-3">KULLANICI PROFİLİ</p>
                  <h1 className="text-3xl md:text-4xl font-display uppercase tracking-[0.05em] text-white leading-tight break-words">{player?.codename || 'Profil Sayfan'}</h1>
                  <p className="text-neutral-400 mt-4 max-w-xl text-sm md:text-base">Burada yarışma bilgilerin, seçtiğin karakter ve maç detaylarını görebilirsin. Turnuva başlamadan önce kullanıcı adını ve archetype'ını güncelleyebilirsin.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="whitespace-nowrap shrink-0 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-red-500 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  LOG OUT
                </button>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="glass-panel border border-white/10 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#040404] via-transparent to-transparent pointer-events-none"></div>
                <div className="flex flex-col gap-6 relative z-10">
                  {(() => {
                    const upcomingMatches: { match: any, round: any, diffHours: number }[] = [];
                    let hasFutureMatches = false;

                    if (tournament?.rounds && user) {
                      for (const round of tournament.rounds) {
                        if (round.started) continue; // Başlamış turları atla
                        const myMatch = round.matches?.find((m: any) => m.player1Id === user.uid || m.player2Id === user.uid);
                        if (myMatch && myMatch.status === 'pending') {
                          hasFutureMatches = true;
                          const dateStr = `${round.date}T${round.time}`;
                          const scheduledTime = new Date(dateStr);
                          const now = new Date();
                          const diffHours = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);

                          if (diffHours <= 48) {
                            upcomingMatches.push({ match: myMatch, round, diffHours });
                          }
                        }
                      }
                    }

                    if (upcomingMatches.length === 0) {
                      if (hasFutureMatches) {
                        return (
                          <div className="rounded-3xl bg-[#0b0d11] p-6 border border-white/5">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold mb-3">Gelecek Müsabaka</p>
                            <p className="text-neutral-400 text-sm">Gelecek müsabaka bilgileri, müsabakaya 48 saat kala açıklanacaktır.</p>
                          </div>
                        );
                      } else {
                        return (
                          <div className="rounded-3xl bg-[#0b0d11] p-6 border border-white/5">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold mb-3">Gelecek Müsabaka</p>
                            <p className="text-neutral-400 text-sm">Şu an için planlanmış bir müsabaka bulunmuyor.</p>
                          </div>
                        );
                      }
                    }

                    // Yakın tarihli olanı en üstte göstermek için süreye göre sıralıyoruz
                    upcomingMatches.sort((a, b) => a.diffHours - b.diffHours);

                    return (
                      <div className="flex flex-col gap-4">
                        {upcomingMatches.map(({ match, round }) => {
                          const dateStr = `${round.date}T${round.time}`;
                          const scheduledTime = new Date(dateStr);
                          const isWhite = match.player1Id === user.uid;
                          const opponentId = isWhite ? match.player2Id : match.player1Id;
                          const opponentData = playersMap[opponentId] || { codename: 'Bilinmiyor', archetype: '' };
                          const opponentName = opponentData.codename;
                          const OpponentIcon = ARCHETYPE_ICONS[opponentData.archetype] || Sword;

                          const formattedDate = scheduledTime.toLocaleDateString('tr-TR');
                          const formattedTime = scheduledTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

                          return (
                            <div key={`${round.roundNumber}-${match.player1Id}`} className="rounded-3xl bg-[#0b0d11] border border-primary/20 p-6 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                              <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                Yaklaşan Müsabaka ({round.roundNumber}. Tur)
                              </p>
                              <div className="space-y-4">
                                <div className="flex items-center gap-3 text-white">
                                  <CalendarDays className="w-4 h-4 text-primary" />
                                  <span className="font-bold">{formattedDate} - {formattedTime}</span>
                                </div>
                                <div className="flex items-center gap-3 text-white">
                                  <OpponentIcon className="w-4 h-4 text-primary" />
                                  <span>Rakip: <strong className="text-primary">{opponentName}</strong></span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

                <div className="glass-panel border border-white/10 p-8 flex flex-col gap-6">


                  {loading ? (
                  <div className="rounded-3xl bg-[#090b0f] p-6 text-neutral-400">Profil yükleniyor...</div>
                ) : error ? (
                  <div className="rounded-3xl bg-[#090b0f] p-6 text-red-400">{error}</div>
                ) : player ? (
                  <div className="space-y-4">
                    <div className="rounded-3xl bg-[#0b0d11] p-6 border border-white/5">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-3">Oyuncu Bilgileri</p>
                      <div className="space-y-6 text-neutral-300">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 mb-2">Kullanıcı Adı</p>
                          <p className="text-xl md:text-2xl font-black text-white tracking-tight break-words">{player.codename}</p>
                        </div>
                        <div className="grid gap-3 text-sm text-neutral-300">
                          <div className="flex justify-between gap-4">
                            <span className="text-neutral-500">Öğrenci No</span>
                            <span className="font-semibold text-white">{player.studentId}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 border-b border-white/5 pb-2">
                            <span className="text-neutral-500 text-[11px]">E-posta</span>
                            <span className="font-semibold text-white text-xs break-all text-right">{player.email}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-neutral-500">Durum</span>
                            <span className="font-semibold text-white uppercase">{player.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-start justify-center lg:h-full pt-4">
            <div className="relative w-full max-w-[450px] aspect-[3/4] rounded-[24px] overflow-hidden border border-white/10 bg-[#0b0d11] shadow-[0_0_50px_rgba(0,0,0,0.35)] group">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
              <div
                className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:scale-110 transition-transform duration-1000"
                style={{ backgroundImage: `url(${cardImage})` }}
              ></div>
              <div className="absolute inset-x-0 bottom-0 p-6 z-20">
                <div className="inline-block px-2 py-0.5 bg-primary/20 border border-primary/30 mb-3">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-primary font-bold">ARCHETYPE_CARD</p>
                </div>
                <h2 className="text-3xl md:text-4xl font-display text-white mb-3 uppercase italic tracking-tighter drop-shadow-lg leading-none">
                  {player?.archetype || 'BELİRLENMEDİ'}
                </h2>
                <div className="bg-black/40 backdrop-blur-md p-4 border border-white/5 rounded-xl mb-6">
                  <p className="text-neutral-300 text-[11px] leading-relaxed font-medium">
                    {player?.archetype ? archetypeDescs[player.archetype] : 'Turnuva başlamadan önce bu karakteri istediğin kadar güncelleyebilirsin. Öğrenci numaran sabit kalır.'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="space-y-1">
                    <p className="text-[7px] text-neutral-500 uppercase tracking-widest font-bold">OPERATOR_STATUS</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-[9px] font-mono text-primary uppercase">VERIFIED_ENTRY</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 border border-white/10 flex items-center justify-center opacity-40">
                    <span className="text-primary text-sm italic">♟</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

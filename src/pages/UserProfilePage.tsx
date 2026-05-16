import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { LogOut, CalendarDays, Globe, Clock3 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { PlayerData } from '../services/playerService';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';

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

const archetypeImages: Record<string, string> = {};
const archetypeDescs: Record<string, string> = {};

archetypes.forEach(a => {
  archetypeImages[a.name] = a.img;
  archetypeDescs[a.name] = a.desc;
});

export const UserProfilePage = ({ onBack, view, setView }: { onBack: () => void; view: any; setView: (v: any) => void }) => {
  const { user, logout } = useAuth();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');

    const playerRef = doc(db, 'players', user.uid);
    const unsubscribe = onSnapshot(playerRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlayer(docSnap.data() as PlayerData);
      } else {
        setError('Karakter bilgisi bulunamadı. Karakter oluşturmak için ana sayfaya dönün.');
      }
      setLoading(false);
    }, (err) => {
      console.error('Profil yükleme hatası:', err);
      setError('Profil verisi alınırken bir hata oluştu.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Geri sayım zamanlayıcısı
  useEffect(() => {
    if (!player?.matchId) { setCountdown(''); return; }

    const matchRef = doc(db, 'matches', player.matchId);
    const unsubMatch = onSnapshot(matchRef, (snap) => {
      if (!snap.exists()) return;
      const deadline = snap.data()?.deadline;
      if (!deadline) return;

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

        {/* HAYALET MAÇ UYARISI - Sayfanın en üstünde, kaçırılması imkansız */}
        {player?.upcomingMatch && (
          <div className="mb-8 rounded-2xl bg-primary/10 border-2 border-primary p-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />
                  SİSTEM MESAJI: ÇATIŞMA VAKTİ
                </p>
                <p className="text-white text-sm mb-1">
                  Sistem sizi bir eşleşmeye atadı. Aşağıdaki butona tıklayarak satranç tahtasına (Lichess) intikal edin.
                </p>
                <p className="text-xs text-neutral-400">
                  Renginiz: <span className="text-primary font-bold">{player.matchColor === 'white' ? '⬜ BEYAZ' : '⬛ SİYAH'}</span>
                </p>
                {countdown && (
                  <p className={`text-sm font-bold mt-2 font-mono ${countdown.includes('DOLDU') ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                    ⏱️ Katılım süresi: {countdown}
                  </p>
                )}
              </div>
              <a 
                href={player.upcomingMatch} 
                target="_blank" 
                rel="noopener noreferrer"
                className="shrink-0 inline-block bg-primary text-black font-black text-xs uppercase tracking-widest py-3 px-8 hover:bg-white transition-colors text-center"
              >
                MAÇ ALANINA GİRİŞ YAP
              </a>
            </div>
          </div>
        )}

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
<div className="flex items-start gap-4 mb-6">
                      <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <Clock3 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-bold">Turnuva Başlangıcı</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 leading-tight">21 Mayıs 2026</h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 break-words">
                      <div className="flex items-center gap-4 rounded-2xl bg-[#0f1115] p-4 border border-white/5">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/20 flex flex-col items-center justify-center shrink-0">
                          <p className="text-[8px] uppercase text-primary font-bold">MAY</p>
                          <p className="text-white text-lg font-display leading-none">21</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Tarih</p>
                          <p className="text-white text-sm font-bold">21 Mayıs 2026</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-2xl bg-[#0f1115] p-4 border border-white/5">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                          <Clock3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Format</p>
                          <p className="text-white text-sm font-bold">10+5 Rapid</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-2xl bg-[#0f1115] p-4 border border-white/5">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Platform</p>
                          <p className="text-white text-sm font-bold">Lichess.org (Çevrimiçi)</p>
                        </div>
                      </div>
                    </div>

                  <div className="rounded-3xl bg-[#111215] border border-primary/10 p-6">
                    <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-bold mb-4">Önemli Not</p>
                    <p className="text-neutral-300 leading-relaxed">Tüm müsabakalar çevrimiçi olarak Lichess.org üzerinden oynanacaktır. Eşleşme linkiniz profil sayfanıza otomatik olarak iletilir. Maç sonuçları sistem tarafından otomatik çekilir.</p>
                  </div>
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

                    <div className="rounded-3xl bg-[#0b0d11] p-6 border border-white/5">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-3">Turnuva Detayları</p>
                      <div className="grid gap-4">
                        <div className="flex items-center gap-3 text-neutral-300">
                          <CalendarDays className="w-4 h-4 text-primary" />
                          <span>21 Mayıs 2026 / 18:00</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutral-300">
                          <Clock3 className="w-4 h-4 text-primary" />
                          <span>Format: 10+5 Rapid</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutral-300">
                          <Globe className="w-4 h-4 text-primary" />
                          <span>Platform: Lichess.org</span>
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

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { LogOut, CalendarDays, MapPin, Clock3 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getPlayer, PlayerData } from '../services/playerService';

const archetypeImages: Record<string, string> = {
  'CENTER CONTROL': '/archetype_queen_1777845711451.png',
  DEVELOPMENT: '/archetype_knight_1777845681434.png',
  'KING SAFETY': '/archetype_rook_1777845755157.png',
  'PAWN STRUCTURE': '/archetype_pawn_1777845767210.png',
  'OPEN FILE CONTROL': '/archetype_bishop_1777845695755.png',
  TACTICS: '/archetype_cipher_1777845778793.png',
  COORDINATION: '/archetype_overseer_1777845810324.png',
  'SPACE ADVANTAGE': '/archetype_phantom_1777845795649.png',
  'PLAN MAKING': '/archetype_strategist_1777845727599.png'
};

export const UserProfilePage = ({ onBack, view, setView }: { onBack: () => void; view: any; setView: (v: any) => void }) => {
  const { user, logout } = useAuth();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setLoading(true);
      setError('');
      try {
        const playerData = await getPlayer(user.uid);
        if (!playerData) {
          setError('Karakter bilgisi bulunamadı. Karakter oluşturmak için ana sayfaya dönün.');
          return;
        }
        setPlayer(playerData);
      } catch (err) {
        console.error('Profil yükleme hatası:', err);
        setError('Profil verisi alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

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
        <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="glass-panel border border-white/10 p-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-bold mb-3">KULLANICI PROFİLİ</p>
                  <h1 className="text-5xl md:text-6xl font-display uppercase tracking-[0.05em] text-white leading-tight">{player?.codename || 'Profil Sayfan'}</h1>
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

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
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

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-3xl bg-[#0f1115] p-5 border border-white/5 text-center">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-2">Tarih</p>
                        <p className="text-white text-2xl">21 Mayıs</p>
                        <p className="text-neutral-400 text-xs mt-1">2026</p>
                      </div>
                      <div className="rounded-3xl bg-[#0f1115] p-5 border border-white/5 text-center">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-2">Saat</p>
                        <p className="text-white text-2xl">18:00</p>
                      </div>
                      <div className="rounded-3xl bg-[#0f1115] p-5 border border-white/5 text-center">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-2">Konum</p>
                        <p className="text-white text-2xl">İYTE</p>
                        <p className="text-neutral-400 text-xs mt-1">Yeraltı Salon A</p>
                      </div>
                    </div>

                  <div className="rounded-3xl bg-[#111215] border border-primary/10 p-6">
                    <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-bold mb-4">Önemli Not</p>
                    <p className="text-neutral-300 leading-relaxed">Turnuva başlangıcından önce lütfen kayıt kontrol noktasına gelin. Öğrenci kimliği doğrulaması sadece ilk kayıt sırasında yapılır; ardından öğrenci numaranız sabitlenir.</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel border border-white/10 p-8 flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-bold">Hızlı Link</p>
                    <button
                      onClick={onBack}
                      className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary hover:text-white"
                    >
                      Ana Sayfaya Dön
                    </button>
                  </div>
                  <div className="text-right text-[10px] uppercase tracking-[0.3em] text-neutral-500">Profil</div>
                </div>

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
                          <p className="text-4xl md:text-5xl font-black text-white tracking-tight">{player.codename}</p>
                        </div>
                        <div className="grid gap-3 text-sm text-neutral-300">
                          <div className="flex justify-between gap-4">
                            <span className="text-neutral-500">Öğrenci No</span>
                            <span className="font-semibold text-white">{player.studentId}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-neutral-500">E-posta</span>
                            <span className="font-semibold text-white">{player.email}</span>
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
                          <span>Kayıt öncesi varış: 17:30</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutral-300">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>İYTE Yeraltı Salon A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative flex-1 rounded-[28px] overflow-hidden border border-white/10 bg-[#0b0d11] shadow-[0_0_50px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
            <img
              src={cardImage}
              alt={player?.archetype || 'Karakter resmi'}
              className="h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-[#020305] via-transparent to-transparent">
              <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-bold">Seçilen Karakter</p>
              <h2 className="text-3xl md:text-4xl font-display text-white mt-3">{player?.archetype || 'Belirlenmedi'}</h2>
              <p className="text-neutral-300 mt-3 max-w-md">Turnuva başlamadan önce bu karakteri istediğin kadar güncelleyebilirsin. Öğrenci numaran sabit kalır.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

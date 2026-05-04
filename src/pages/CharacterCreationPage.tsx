import { motion } from 'motion/react';
import { 
  ShieldCheck as ShieldIcon, AlertCircle, LogIn, Loader2,
  Target, Zap, Shield, Grid3X3, AlignVerticalSpaceAround, Sword, Network, Expand, BrainCircuit
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { savePlayer, getPlayer, PlayerData } from '../services/playerService';

export const CharacterCreationPage = ({ onBack, onEnterTournament, view, setView }: { onBack: () => void, onEnterTournament: () => void, view: any, setView: (v: any) => void }) => {
  const { user } = useAuth();
  const [existingPlayer, setExistingPlayer] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentNumber, setStudentNumber] = useState('');
  const [verifyingStudent, setVerifyingStudent] = useState(false);
  const [studentVerified, setStudentVerified] = useState(false);
  const [studentError, setStudentError] = useState('');

  const [codename, setCodename] = useState('');
  const [verifyingCodename, setVerifyingCodename] = useState(false);
  const [codenameStatus, setCodenameStatus] = useState<'idle' | 'scanning' | 'approved' | 'rejected'>('idle');
  const [codenameError, setCodenameError] = useState('');

  const [selectedArchetype, setSelectedArchetype] = useState('CENTER CONTROL');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Load existing player data
  useEffect(() => {
    const loadExistingPlayer = async () => {
      if (!user) return;
      try {
        const player = await getPlayer(user.uid);
        if (player) {
          setExistingPlayer(player);
          setStudentNumber(player.studentId);
          setCodename(player.codename);
          setSelectedArchetype(player.archetype);
          setStudentVerified(true);
        }
      } catch (err) {
        console.error('Oyuncu verisi yükleme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingPlayer();
  }, [user]);

  const handleJoinTournament = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError('');
    try {
      const result = await savePlayer(user.uid, {
        codename,
        studentId: studentNumber,
        archetype: selectedArchetype,
        email: user.email || ''
      });
      if (!result.success) {
        setSaveError(result.error || 'Kayıt sırasında bir hata oluştu.');
        return;
      }
      onEnterTournament();
    } catch (err) {
      console.error('Kayıt hatası:', err);
      setSaveError('Sunucu hatası. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const archetypes = [
    { name: 'CENTER CONTROL', icon: Target, color: 'text-emerald-400', borderColor: 'border-emerald-800', desc: 'Merkezi ele geçir, oyunu sen yönlendir. Taşlarının hareket alanını artırırken rakibin seçeneklerini kısıtla. Oyunun temposunu belirleyen temel güç.', img: '/archetype_queen_1777845711451.png' },
    { name: 'DEVELOPMENT', icon: Zap, color: 'text-yellow-400', borderColor: 'border-yellow-800', desc: 'Taşlarını hızlı ve verimli geliştir. Erken oyunda aktif olmayan taş = kayıp tempo. Hızlı gelişim, erken baskı demektir.', img: '/archetype_knight_1777845681434.png' },
    { name: 'KING SAFETY', icon: Shield, color: 'text-blue-400', borderColor: 'border-blue-800', desc: 'Şahını koru, oyunda kal. Erken rok ile savunmanı kur, saldırıya güvenle hazırlan. Savunması zayıf şah = kaybedilmiş oyun.', img: '/archetype_rook_1777845755157.png' },
    { name: 'PAWN STRUCTURE', icon: Grid3X3, color: 'text-green-500', borderColor: 'border-green-900', desc: 'Piyonlar oyunun iskeletidir. Zayıf yapı uzun vadede çöker, sağlam yapı oyunu taşır. Stratejik savaşların görünmeyen kahramanı.', img: '/archetype_pawn_1777845767210.png' },
    { name: 'OPEN FILE CONTROL', icon: AlignVerticalSpaceAround, color: 'text-cyan-400', borderColor: 'border-cyan-800', desc: 'Açık hatları ele geçir, kalelerini aktif kullan. Dikey baskı kurarak rakibin savunmasını parçala. Doğru hatta yerleşen kale = ölümcül güç.', img: '/archetype_bishop_1777845695755.png' },
    { name: 'TACTICS', icon: Sword, color: 'text-red-500', borderColor: 'border-red-900', desc: 'Ani hamlelerle oyunu bitir. Çatal, çivi ve fedalarla rakibi hazırlıksız yakala. Bir hamlede oyunun kaderini değiştir.', img: '/archetype_cipher_1777845778793.png' },
    { name: 'COORDINATION', icon: Network, color: 'text-indigo-400', borderColor: 'border-indigo-800', desc: 'Taşlarını birlikte konuştur. Uyumlu çalışan taşlar tek tek olandan kat kat güçlüdür. Gerçek güç, takım oyunundan gelir.', img: '/archetype_overseer_1777845810324.png' },
    { name: 'SPACE ADVANTAGE', icon: Expand, color: 'text-purple-500', borderColor: 'border-purple-900', desc: 'Alanı kontrol et, rakibi sıkıştır. Daha fazla alan = daha fazla seçenek. Rakibini nefessiz bırakan stratejik üstünlük.', img: '/archetype_phantom_1777845795649.png' },
    { name: 'PLAN MAKING', icon: BrainCircuit, color: 'text-primary', borderColor: 'border-primary/50', desc: 'Plansız hamle yok. Her hareket bir amaca hizmet etmeli. Kazanan oyuncu, düşünen oyuncudur.', img: '/archetype_strategist_1777845727599.png' }
  ];

  const handleVerifyStudent = () => {
    setVerifyingStudent(true);
    setTimeout(() => {
      setVerifyingStudent(false);
      setStudentVerified(true);
    }, 1500);
  };

  const handleVerifyCodename = async () => {
    if (!codename) return;
    
    setVerifyingCodename(true);
    setCodenameStatus('scanning');
    
    try {
      const response = await fetch('http://localhost:3001/api/verify-codename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codename })
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setCodenameStatus('approved');
        setCodenameError('');
      } else {
        setCodenameStatus('rejected');
        setCodenameError(data.reason || 'Sistem tarafından reddedildi.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setCodenameStatus('rejected');
      setCodenameError('Sistem şu an meşgul. Bağlantı kurulamadı.');
    } finally {
      setVerifyingCodename(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-on-surface font-sans selection:bg-primary/30 relative overflow-x-hidden pt-20">
      <div className="fixed inset-0 pointer-events-none opacity-20 chess-grid bg-[size:64px_64px]"></div>
      <div className="scanline"></div>
      
      <Navbar view={view} setView={setView} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="w-full text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl text-on-surface mb-2 uppercase glow-text"
          >
            KARAKTERİNİ OLUŞTUR
          </motion.h1>
          <p className="text-[10px] text-primary tracking-widest uppercase font-bold">
            Secure Transmission Active | Agent Initialization
          </p>
        </div>

        {/* STEP 01 */}
        <section className="w-full max-w-2xl mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 relative group"
          >
            <div className="absolute -top-3 left-6 bg-surface-container-lowest px-3 text-primary text-[10px] font-bold tracking-widest border border-primary/20">
              STEP_01: KATILIMCI_DOGRULAMA
            </div>
            <div className="space-y-6">
              <label className="block text-xs md:text-sm text-on-surface-variant uppercase mb-4 font-black tracking-widest border-l-4 border-primary pl-4 py-1">
                Öğrenci Numaranı Gir
              </label>
              {existingPlayer && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded mb-4">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">⚠️ ÖĞRENCİ NUMARASI SABİT</p>
                  <p className="text-[10px] text-blue-300 font-mono mt-1">Öğrenci numarası ilk kayıt sonrası değiştirilemez. Sadece Kullanıcı Adını ve Archetype'ı güncelleyebilirsiniz.</p>
                </div>
              )}
              <div className="relative">
                <input 
                  type="text"
                  value={studentNumber}
                  disabled={existingPlayer !== null}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStudentNumber(val);
                    setStudentVerified(false);
                    if (/[^\d]/.test(val)) {
                      setStudentError('ID karakter içeremez. Sadece rakam giriniz.');
                    } else if (val.length > 0 && val.length !== 9) {
                      setStudentError('Eksik veya fazla tuşladınız. Numara tam 9 haneli olmalıdır.');
                    } else {
                      setStudentError('');
                    }
                  }}
                  className={`w-full bg-surface-container-high border ${studentError ? 'border-red-500' : 'border-outline-variant focus:border-primary'} focus:ring-0 text-primary text-lg font-mono p-4 rounded-none outline-none transition-all placeholder:text-outline-variant/30 ${existingPlayer ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="2X0201XXX"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-6 bg-primary/20 animate-pulse"></span>
              </div>
              {studentError && (
                <p className="text-red-500 text-xs font-mono mt-1">{studentError}</p>
              )}
              <button 
                onClick={handleVerifyStudent}
                disabled={verifyingStudent || studentVerified || studentNumber.length !== 9 || /[^\d]/.test(studentNumber) || existingPlayer !== null}
                className={`w-full font-display font-bold py-5 uppercase flex items-center justify-center gap-4 transition-all active:scale-[0.98] ${
                  studentVerified 
                    ? 'bg-[#4ae176] text-black shadow-[0_0_40px_rgba(74,225,118,0.9)] border-2 border-white' 
                    : 'bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(74,225,118,0.3)]'
                } ${verifyingStudent || studentNumber.length !== 9 || /[^\d]/.test(studentNumber) || existingPlayer !== null ? 'opacity-50' : ''}`}
              >
                {verifyingStudent ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldIcon className="w-5 h-5" />}
                {verifyingStudent ? 'DOĞRULANIYOR...' : (studentVerified ? 'ONAYLANDI' : 'DOĞRULA')}
              </button>
            </div>
          </motion.div>
        </section>

        {/* STEP 02 */}
        <section className="w-full max-w-2xl mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 relative"
          >
            <div className="absolute -top-3 left-6 bg-surface-container-lowest px-3 text-primary text-[10px] font-bold tracking-widest border border-primary/20">
              STEP_02: CODENAME_REGISTRATION
            </div>
            <div className="space-y-6">
              <label className="block text-xs md:text-sm text-on-surface-variant uppercase mb-4 font-black tracking-widest border-l-4 border-primary pl-4 py-1">
                Operatör Takma Adı
              </label>
              <div className="bg-primary/5 border border-primary/20 p-4 mb-4 rounded-sm">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">TAKMA AD KURALLARI</p>
                    <ul className="text-[10px] text-on-surface-variant/70 font-mono list-decimal list-inside space-y-1">
                      <li>Gerçek ad soyad kullanımı yasaktır.</li>
                      <li>Gerçek konum / adres kullanımı yasaktır.</li>
                      <li>Uygunsuz ya da küfürlü takma ad yasaktır.</li>
                      <li>Minimum 3, maksimum 15 karakter.</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="relative flex gap-4">
                <input 
                  type="text"
                  value={codename}
                  onChange={(e) => {
                    setCodename(e.target.value);
                    setCodenameStatus('idle');
                    setCodenameError('');
                  }}
                  placeholder="GHOST_PROTOCOL"
                  className="flex-grow bg-surface-container-high border border-outline-variant focus:border-primary focus:ring-0 text-primary text-lg font-mono p-4 rounded-none outline-none transition-all placeholder:text-outline-variant/30"
                />
                <button 
                  onClick={handleVerifyCodename}
                  disabled={codenameStatus !== 'idle' || !codename}
                  className="px-6 bg-primary text-on-primary font-display font-bold uppercase hover:shadow-[0_0_20px_rgba(74,225,118,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                  {verifyingCodename ? <Loader2 className="w-5 h-5 animate-spin" /> : 'TARAMA'}
                </button>
              </div>
              
              {/* Status Display */}
              {codenameStatus === 'scanning' && (
                <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <div className="flex-grow">
                    <div className="text-[10px] font-bold text-primary uppercase tracking-tighter animate-pulse">Neural Scan in Progress...</div>
                    <div className="text-[10px] text-on-surface-variant/60 font-mono">Verifying entity against global databases...</div>
                  </div>
                </div>
              )}

              {codenameStatus === 'approved' && (
                <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30">
                  <ShieldIcon className="w-6 h-6 text-green-400" />
                  <div className="flex-grow">
                    <div className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">AI Anonymity Check: PASSED</div>
                    <div className="text-[10px] text-green-400/60 font-mono">No real identities or locations detected.</div>
                  </div>
                  <div className="bg-green-500 text-black text-[10px] font-bold px-2 py-1 uppercase shadow-[0_0_10px_rgba(34,197,94,0.5)]">ONAYLANDI</div>
                </div>
              )}

              {codenameStatus === 'rejected' && (
                <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <div className="flex-grow">
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">AI Anonymity Check: FAILED</div>
                    <div className="text-[10px] text-red-400/80 font-mono">{codenameError}</div>
                  </div>
                  <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase shadow-[0_0_10px_rgba(239,68,68,0.5)]">REDDEDİLDİ</div>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* STEP 03: ARCHETYPE SELECTION */}
        <section className="w-full mb-24">
          <div className="w-full text-center mb-12 flex flex-col items-center">
            <span className="text-[10px] text-primary/60 tracking-[0.5em] uppercase font-bold mb-2">STEP_03: ARCHETYPE_SELECTION</span>
            <div className="w-64 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {archetypes.map((arch) => {
              const isSelected = selectedArchetype === arch.name;
              return (
                <motion.div 
                  key={arch.name}
                  onClick={() => setSelectedArchetype(arch.name)}
                  className={`relative flex flex-col bg-[#111] cursor-pointer overflow-hidden transition-all duration-500 ease-out group ${
                    isSelected 
                      ? `border border-[#d0f5ce] shadow-[0_0_20px_rgba(208,245,206,0.2)] transform scale-[1.02]` 
                      : 'border border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="h-40 w-full overflow-hidden relative">
                    <img 
                      src={arch.img} 
                      alt={arch.name}
                      className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${isSelected ? 'opacity-100 grayscale-0 scale-105' : 'opacity-40 grayscale'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent transition-opacity duration-500"></div>
                  </div>
                  
                  <div className="flex flex-col flex-grow px-6 pb-6 pt-2 z-10 relative">
                    <div className="flex items-center gap-3 mb-3">
                      <arch.icon className={`w-5 h-5 ${arch.color}`} />
                      <h3 className="font-sans text-[15px] font-medium text-gray-200 tracking-wide">{arch.name}</h3>
                    </div>
                    
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans flex-grow mb-8">
                      {arch.desc}
                    </p>
                    
                    <div className="mt-auto">
                      <button 
                        className={`w-full py-2.5 text-[10px] font-bold tracking-[0.1em] uppercase transition-all ${
                          isSelected 
                            ? 'bg-[#d0f5ce] text-black' 
                            : `border ${arch.borderColor} text-gray-400 hover:text-white hover:bg-white/5`
                        }`}
                      >
                        {isSelected ? 'SELECTED' : 'SELECT'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full max-w-xl mx-auto mt-12"
          >
            <button 
              onClick={handleJoinTournament}
              disabled={!studentVerified || codenameStatus !== 'approved' || saving}
              className="group relative w-full p-8 bg-black border-2 border-primary overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(74,225,118,0.4)] disabled:opacity-50 disabled:border-neutral-800 disabled:shadow-none"
            >
              <div className="absolute inset-0 bg-primary opacity-10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="relative z-10 font-display text-primary text-3xl uppercase tracking-[0.2em] flex items-center justify-center gap-6">
                {saving ? <Loader2 className="w-8 h-8 animate-spin" /> : <LogIn className="w-8 h-8" />}
                {saving ? 'KAYDEDİLİYOR...' : 'TURNUVAYA KATIL'}
              </span>
              <div className="mt-4 text-[10px] text-primary/40 uppercase tracking-widest relative z-10 font-bold">
                {saving ? '[ Writing to secure database... ]' : '[ Encryption sequence ready. Click to finalize profile ]'}
              </div>
            </button>
          </motion.div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-32">
          <div className="glass-panel p-8 bg-black/40 relative">
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
              <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-primary to-transparent"></div>
              <div className="absolute top-0 right-0 h-[1px] w-full bg-gradient-to-l from-primary to-transparent"></div>
            </div>
            <h4 className="font-display text-xl mb-4 text-primary uppercase">MİSYON KAYITLARI</h4>
            <div className="font-mono text-[10px] text-on-surface-variant/40 space-y-1">
              <p className="text-primary/60">[08:42:11] INITIALIZING SECURE SOCKETS...</p>
              <p>[08:42:12] HANDSHAKE VERIFIED: IEEE_SECURE_GATEWAY_V4</p>
              <p>[08:42:15] FETCHING STUDENT DATA CLUSTER 2X0201...</p>
              <p className="text-primary">[08:42:16] PROFILE FRAGMENT DETECTED: STATUS_READY</p>
              <p className="animate-pulse">_</p>
            </div>
          </div>
          <div className="relative overflow-hidden group glass-panel h-48 border border-white/5">
            <img 
              alt="Chessboard background" 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
              src="/screen.png" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-6">
              <div className="text-[10px] font-bold text-primary uppercase">Takvicsel Arena #01</div>
              <div className="text-[8px] text-on-surface-variant/40 uppercase font-mono tracking-widest">Sector: İYTE Mainframe</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

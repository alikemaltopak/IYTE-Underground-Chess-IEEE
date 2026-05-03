import { motion } from 'motion/react';
import { 
  Users, Activity, Bot, Rocket, Shield, 
  ShieldCheck as ShieldIcon, AlertCircle, LogIn, Loader2 
} from 'lucide-react';
import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const CharacterCreationPage = ({ onBack, onEnterTournament, view, setView }: { onBack: () => void, onEnterTournament: () => void, view: any, setView: (v: any) => void }) => {
  const [studentNumber, setStudentNumber] = useState('');
  const [verifyingStudent, setVerifyingStudent] = useState(false);
  const [studentVerified, setStudentVerified] = useState(false);
  const [studentError, setStudentError] = useState('');

  const [codename, setCodename] = useState('');
  const [verifyingCodename, setVerifyingCodename] = useState(false);
  const [codenameStatus, setCodenameStatus] = useState<'idle' | 'scanning' | 'approved' | 'rejected'>('idle');
  const [codenameError, setCodenameError] = useState('');

  const archetypes = [
    { name: '4 – 10 KİŞİ', icon: Users, desc: 'Sistem: Round Robin. Yapı: Herkes herkese. Toplam Maç: 6 – 45.', img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800' },
    { name: '11 – 24 KİŞİ', icon: Activity, desc: 'Sistem: Swiss. Yapı: 4-5 tur. Toplam Maç: 20 – 60.', img: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800' },
    { name: '25 – 35 KİŞİ', icon: Bot, desc: 'Sistem: Double Elimination. Yapı: Bracket. Toplam Maç: 49 – 69.', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800', highlighted: true },
    { name: '35 – 50 KİŞİ', icon: Rocket, desc: 'Sistem: Hybrid Protocol. Yapı: Swiss + Eleme. Toplam Maç: 60 – 85.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800' },
    { name: '50+ KİŞİ', icon: Shield, desc: 'Sistem: Single Elimination. Yapı: Direkt eleme. Toplam Maç: ≤ n-1.', img: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800' }
  ];

  const handleVerifyStudent = () => {
    const isValid = /^\d{9}$/.test(studentNumber);
    if (!isValid) {
      setStudentError("Eksik veya fazla tuşladınız. Numara tam 9 haneli olmalıdır.");
      setStudentVerified(false);
      return;
    }

    setStudentError('');
    setVerifyingStudent(true);
    setTimeout(() => {
      setVerifyingStudent(false);
      setStudentVerified(true);
    }, 1500);
  };

  const handleVerifyCodename = async () => {
    if (!codename) return;
    
    // Local filter optimization
    if (codename.length < 3) {
      setCodenameStatus('rejected');
      setCodenameError('Takma ad en az 3 karakter olmalıdır.');
      return;
    }
    if (/^\d+$/.test(codename)) {
      setCodenameStatus('rejected');
      setCodenameError('Takma ad sadece rakamlardan oluşamaz.');
      return;
    }

    setCodenameStatus('scanning');
    setVerifyingCodename(true);

    try {
      const response = await fetch('http://localhost:3001/api/verify-codename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codename })
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setCodenameStatus('approved');
      } else {
        setCodenameStatus('rejected');
        setCodenameError(data.reason || "Bilinmeyen bir hata oluştu.");
      }
    } catch (e) {
      setCodenameStatus('rejected');
      setCodenameError('Sistem şu an meşgul.');
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
            className="font-display text-4xl md:text-6xl text-on-surface mb-2 uppercase"
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
              <div className="relative">
                <input 
                  type="text"
                  value={studentNumber}
                  onChange={(e) => {
                    setStudentNumber(e.target.value);
                    setStudentError('');
                    setStudentVerified(false);
                  }}
                  className={`w-full bg-surface-container-high border ${studentError ? 'border-red-500' : 'border-outline-variant focus:border-primary'} focus:ring-0 text-primary text-lg font-mono p-4 rounded-none outline-none transition-all placeholder:text-outline-variant/30`}
                  placeholder="2X0201XXX"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-6 bg-primary/20 animate-pulse"></span>
              </div>
              {studentError && <p className="text-red-500 text-[10px] font-bold font-mono uppercase">{studentError}</p>}
              <button 
                onClick={handleVerifyStudent}
                disabled={verifyingStudent || studentVerified}
                className="w-full bg-primary text-on-primary font-display font-bold py-5 uppercase flex items-center justify-center gap-4 hover:shadow-[0_0_20px_rgba(74,225,118,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
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
                      <li>Anonimliği bozacak isimler yasaktır.</li>
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
                  }}
                  className="w-full bg-surface-container-high border border-primary/30 focus:border-primary focus:ring-0 text-primary text-lg font-mono p-4 rounded-none outline-none transition-all placeholder:text-primary/30"
                  placeholder="GHOST_PROTOCOL"
                />
                <button 
                  onClick={handleVerifyCodename}
                  disabled={verifyingCodename || !codename}
                  className="px-6 bg-primary text-on-primary font-display font-bold uppercase hover:shadow-[0_0_20px_rgba(74,225,118,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                  {verifyingCodename ? <Loader2 className="w-5 h-5 animate-spin" /> : 'TARAMA'}
                </button>
              </div>
              
              {codenameStatus !== 'idle' && (
                <div className={`flex items-center gap-4 p-4 border ${codenameStatus === 'rejected' ? 'bg-red-500/5 border-red-500/20' : 'bg-primary/5 border-primary/20'}`}>
                  <ShieldIcon className={`w-6 h-6 ${codenameStatus === 'scanning' ? 'animate-pulse' : ''} ${codenameStatus === 'rejected' ? 'text-red-500' : 'text-primary'}`} />
                  <div className="flex-grow">
                    <div className={`text-[10px] font-bold uppercase tracking-tighter ${codenameStatus === 'rejected' ? 'text-red-500' : 'text-primary'}`}>
                      AI Anonymity Check
                    </div>
                    <div className="text-[10px] text-on-surface-variant/60 font-mono mt-1">
                      {codenameStatus === 'scanning' && 'SCANNING FOR PII DATA...'}
                      {codenameStatus === 'approved' && 'NO PII DETECTED. SAFE.'}
                      {codenameStatus === 'rejected' && <span className="text-red-400">{codenameError}</span>}
                    </div>
                  </div>
                  {codenameStatus === 'approved' && <div className="bg-primary text-on-primary text-[10px] font-bold px-2 py-1 uppercase">ONAYLANDI</div>}
                  {codenameStatus === 'rejected' && <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase">REDDEDİLDİ</div>}
                </div>
              )}
            </div>
          </motion.div>
        </section>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full max-w-xl mx-auto mt-12"
          >
            <button 
              onClick={onEnterTournament}
              disabled={!studentVerified || codenameStatus !== 'approved'}
              className="group relative w-full p-8 bg-black border-2 border-primary overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(74,225,118,0.4)] disabled:opacity-50 disabled:border-neutral-800 disabled:shadow-none"
            >
              <div className="absolute inset-0 bg-primary opacity-10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="relative z-10 font-display text-primary text-3xl uppercase tracking-[0.2em] flex items-center justify-center gap-6">
                TURNUVAYI BAŞLAT
                <LogIn className="w-8 h-8" />
              </span>
              <div className="mt-4 text-[10px] text-primary/40 uppercase tracking-widest relative z-10 font-bold">
                [ Encryption sequence ready. Click to finalize profile ]
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

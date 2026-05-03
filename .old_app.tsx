import { motion } from 'motion/react';
import { 
  Fingerprint, 
  ShieldCheck, 
  Medal, 
  VenetianMask, 
  Bot, 
  Activity, 
  ChevronRight,
  Terminal as TerminalIcon,
  Crown,
  LayoutGrid,
  Lock,
  Rocket,
  Sparkles,
  Brain,
  Castle,
  Users,
  ShieldCheck as ShieldIcon,
  EyeOff,
  Share2,
  LogIn,
  Search,
  LockKeyhole,
  CheckCircle2,
  Loader2,
  Fingerprint as FingerprintIcon,
  Database,
  Star,
  FileDown,
  LayoutGrid as GridIcon,
  GitBranch,
  AlertCircle,
  Target,
  Zap,
  Layers,
  Layout,
  Sword,
  Maximize2,
  Map,
  Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = ({ view, setView }: { view: string, setView: (v: any) => void }) => (
  <header className="fixed top-0 z-50 flex justify-between items-center px-6 md:px-10 h-16 w-full bg-black/40 backdrop-blur-md border-b border-white/5">
    <div 
      className="text-lg font-black tracking-tighter text-primary drop-shadow-[0_0_8px_rgba(74,225,118,0.6)] font-display cursor-pointer uppercase italic"
      onClick={() => setView('home')}
    >
      İYTE YERALTI
    </div>
    <nav className="hidden md:flex items-center gap-6">
      {['DASHBOARD', 'CHARACTER', 'TOURNAMENT', 'PROTOCOL'].map((item) => (
        <a 
          key={item}
          className={`text-[10px] font-bold tracking-[0.2em] transition-all hover:text-primary ${(view === 'home' && item === 'DASHBOARD') || (view === 'rules' && item === 'PROTOCOL') || (view === 'tournament-dashboard' && item === 'TOURNAMENT') || (view === 'character-creation' && item === 'CHARACTER') ? 'text-primary border-b border-primary pb-1' : 'text-neutral-500'}`} 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            if (item === 'PROTOCOL') setView('rules');
            else if (item === 'TOURNAMENT') setView('tournament-dashboard');
            else if (item === 'CHARACTER') setView('character-creation');
            else setView('home');
          }}
        >
          {item}
        </a>
      ))}
    </nav>
    <div className="flex items-center gap-4">
      <div className="flex gap-1">
        {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-primary/20"></div>)}
      </div>
      <button 
        onClick={() => setView('home')}
        className="bg-primary text-black text-[9px] px-5 py-1.5 font-black tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[0_0_15px_rgba(74,225,118,0.3)]"
      >
        LOGIN_TERMINAL
      </button>
    </div>
  </header>
);

const Hero = ({ onJoinTournament, onReadRules }: { onJoinTournament: () => void, onReadRules: () => void }) => (
  <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black">
    <div className="absolute inset-0 z-0">
      <img 
        alt="Cinematic Chess Foreground" 
        className="w-full h-full object-cover grayscale brightness-[0.2] contrast-125" 
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBosOyUH8pfgsxmCCTEUKzWYRbbJXLVMmQOx34TGz7eIZfLXuzAF7o5qhzKxFzw1m09Y1f3hTv98Zp2PvckMjmDaA087C3NxKMcgFLHpdad8Grd-pipxrQHjFVtcl9SJ0no-SXkljYmztQNp-7JeCkMXcwz2wLKJMS7IYUO9gYyyw-h4pf9PuWpNuQt0XHL49J8bHnW8za3f4h_egMlDI4o5cNVSFC0Nt4YtrNFPfTEuAAdAxERDARWtB-Vvi_gkDhveup8PNc08-c"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80"></div>
    </div>

    {/* Volumetric Spotlights - Exactly like screenshot */}
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] left-[35%] w-[100px] h-[120%] bg-white/5 blur-[40px] rotate-1 px-4"></div>
      <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[120px] h-[120%] bg-white/10 blur-[50px] px-6"></div>
      <div className="absolute top-[-10%] right-[35%] w-[100px] h-[120%] bg-white/5 blur-[40px] -rotate-1 px-4"></div>
    </div>

    <div className="relative z-30 text-center px-6 max-w-5xl translate-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-block mb-6 px-4 py-1 border border-primary/40 bg-primary/10 text-[9px] text-primary tracking-[0.3em] font-black"
      >
        ENCRYPTED_SIGNAL_DETECTED // VOL 04
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="font-display leading-tight uppercase"
      >
        <span className="block text-4xl md:text-6xl text-white font-bold tracking-tighter mb-2">İYTE YERALTI</span>
        <span className="block text-5xl md:text-8xl text-primary font-black tracking-tighter drop-shadow-[0_0_30px_rgba(74,225,118,0.8)] glow-text">SATRANÇ TURNUVASI</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-neutral-400 text-sm md:text-lg mt-8 tracking-[0.2em] italic font-medium"
      >
        Kimliğin değil, hamlen konuşur.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col md:flex-row gap-6 justify-center items-center mt-12"
      >
        <button 
          onClick={onJoinTournament}
          className="px-10 py-4 bg-primary text-black font-display text-sm font-black tracking-[0.1em] transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(74,225,118,0.5)]"
        >
          TURNUVAYA KATIL
        </button>
        <button 
          onClick={onReadRules}
          className="px-10 py-4 border border-neutral-600 text-neutral-300 font-display text-sm font-black tracking-[0.1em] hover:bg-white/5 transition-all"
        >
          PROTOKOLÜ İNCELE
        </button>
      </motion.div>

      <div className="mt-24">
        <span className="text-[8px] text-neutral-600 tracking-[0.5em] font-bold uppercase animate-pulse">DECRYPT SCROLL</span>
        <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent mx-auto mt-4"></div>
      </div>
    </div>
  </section>
);

const About = () => (
  <section className="py-40 px-6 md:px-10 bg-surface-container-lowest border-y border-outline-variant/20 relative overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="h-px w-12 bg-primary/30"></div>
          <span className="text-primary text-[10px] font-bold tracking-[0.5em] uppercase">MISSION_OBJECTIVES</span>
          <div className="h-px w-12 bg-primary/30"></div>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-primary text-5xl md:text-7xl uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(74,225,118,0.5)] glow-text italic"
        >
          GÖLGELERDE HAMLE YAP
        </motion.h2>
      </div>

      <div className="grid md:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative aspect-square glass-panel p-6 shadow-2xl group"
        >
        <div className="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-primary"></div>
        <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-primary"></div>
        <img 
          alt="Underground Chess" 
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
          src="/screen.png" 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>
      </motion.div>
      
      <div className="flex flex-col gap-10">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-on-surface-variant leading-relaxed text-lg"
        >
          İYTE Yeraltı, IEEE Educational Activities Committee tarafından düzenlenen, kampüsün en prestijli ve gizemli satranç organizasyonudur. Burada unvanlar, dereceler veya gerçek isimler yoktur. Sadece hamleleriniz ve stratejiniz sizi tanımlar.
        </motion.p>
        <div className="grid grid-cols-1 gap-6">
          {[
            { icon: Fingerprint, text: "TAMAMEN ANONİM EŞLEŞMELER" },
            { icon: ShieldCheck, text: "YAPAY ZEKA MODERASYONLU KOD ADLARI" },
            { icon: Medal, text: "PROFESYONEL IEEE EA ORGANİZASYONU" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-6 text-on-surface hover:text-primary transition-colors group"
            >
              <item.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              <span className="tracking-widest text-xs font-bold">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
);

const Protocols = () => (
  <section className="py-40 px-6 md:px-10 bg-background relative">
    <div className="max-w-7xl mx-auto text-center mb-24 relative z-10">
      <h2 className="font-display text-4xl text-on-surface uppercase mb-6 tracking-[0.3em] glow-text">SİSTEM PROTOKOLLERİ</h2>
      <div className="h-1.5 w-32 bg-primary mx-auto shadow-[0_0_15px_rgba(74,225,118,0.8)]"></div>
    </div>
    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 relative z-10">
      {[
        { 
          id: "PROTO_01", 
          icon: VenetianMask, 
          title: "ANONYMOUS PARTICIPATION", 
          desc: "Gerçek kimliğiniz sistem tarafından şifrelenir. Rakipleriniz sizi sadece seçtiğiniz veya sistemin atadığı benzersiz kod adıyla tanır.",
          color: "primary" 
        },
        { 
          id: "PROTO_02", 
          icon: Bot, 
          title: "AI MODERATION", 
          desc: "Gelişmiş yapay zeka algoritmalarımız, kullanıcı adlarını ve oyun etiğini gerçek zamanlı olarak denetleyerek adil ve profesyonel bir ortam sağlar.",
          color: "tertiary" 
        },
        { 
          id: "PROTO_03", 
          icon: Activity, 
          title: "DYNAMIC TOURNAMENT", 
          desc: "Anlık güncellenen bracket yapısı ve canlı terminal çıktılarıyla turnuva akışını saniye saniye takip edin.",
          color: "primary" 
        }
      ].map((item, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className={`group glass-panel p-10 transition-all hover:bg-surface-container-high relative overflow-hidden hover:border-${item.color}/50`}
        >
          <div className="absolute top-0 right-0 p-4 text-[10px] text-on-surface-variant/40 font-bold">{item.id}</div>
          <div className="mb-10 group-hover:scale-110 transition-transform duration-500">
            <item.icon className={`w-14 h-14 text-${item.color} drop-shadow-[0_0_10px_rgba(74,225,118,0.4)]`} />
          </div>
          <h3 className="font-display text-2xl text-on-surface mb-6 tracking-wide">{item.title}</h3>
          <p className="text-on-surface-variant text-base mb-8 leading-relaxed">
            {item.desc}
          </p>
          <div className={`h-1 w-full bg-outline-variant group-hover:bg-${item.color} transition-all duration-500`}></div>
        </motion.div>
      ))}
    </div>
  </section>
);

const Terminal = () => {
  const [logs, setLogs] = useState([
    { time: "14:22:01", text: "Sistem tüneli başlatılıyor...", status: "HAZIR", type: "primary" },
    { time: "14:22:05", text: "Oyuncu 'Deep_Blue_99' Sektör 7'ye bağlandı.", type: "normal" },
    { time: "14:22:12", text: "Eşleşme bulundu: STRATEGIST_X vs NEURAL_GURU", type: "tertiary" },
    { time: "14:22:30", text: "E2-E4 oynandı. Açılış teorisi: Ruy Lopez.", type: "highlight" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        time: new Date().toLocaleTimeString([], { hour12: false }),
        text: "Taktiksel veri bekleniyor...",
        type: "blink"
      };
      // Simple rotation for demo
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 bg-surface-container-lowest relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto glass-panel overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] relative z-10"
      >
        <div className="bg-surface-container-high px-6 py-3 flex items-center gap-2 border-b border-outline-variant/30">
          <div className="flex gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-red-500/30 border border-red-500/50"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/30 border border-yellow-500/50"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-primary/30 border border-primary/50"></div>
          </div>
          <span className="text-[10px] text-on-surface-variant/40 ml-6 tracking-widest font-bold">SYSTEM_LOGS // SESSION_STATUS</span>
        </div>
        <div className="p-10 font-mono text-sm leading-relaxed bg-black/40 min-h-[300px]">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-6 mb-3">
              <span className="text-on-surface-variant/30">[{log.time}]</span>
              <span className={
                log.type === 'primary' ? 'text-primary' : 
                log.type === 'tertiary' ? 'text-tertiary' : 
                log.type === 'highlight' ? 'text-primary' : 'text-on-surface-variant'
              }>
                {log.text} {log.status && <span className="font-bold">[{log.status}]</span>}
              </span>
            </div>
          ))}
          <div className="flex gap-6 mb-3 italic">
            <span className="text-on-surface-variant/30">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
            <span className="text-primary animate-pulse flex items-center gap-2">
              Taktiksel veri bekleniyor... <TerminalIcon className="w-4 h-4" />
              <span className="bg-primary w-2 h-4"></span>
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const Footer = () => (
  <footer className="w-full py-10 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center glass-panel border-t border-outline-variant/30 gap-8">
    <div className="text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.3em]">
      © 2026 IEEE EA - SECURE TRANSMISSION
    </div>
    <div className="flex gap-10">
      <a className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-colors font-bold" href="#">ENCRYPTION_DOCS</a>
      <a className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-colors font-bold" href="#">SYSTEM_STATUS</a>
      <a className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-colors font-bold" href="#">SIGNAL_MAP</a>
    </div>
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-primary animate-ping absolute inset-0"></div>
        <div className="w-2 h-2 rounded-full bg-primary relative"></div>
      </div>
      <span className="text-[10px] text-primary tracking-widest font-bold">SYSTEM ONLINE</span>
    </div>
  </footer>
);

export default function App() {
  const [view, setView] = useState<'home' | 'rules' | 'character-creation' | 'tournament-dashboard'>('home');

  if (view === 'rules') {
    return <RulesPage onBack={() => setView('home')} onAccept={() => setView('character-creation')} view={view} setView={setView} />;
  }

  if (view === 'character-creation') {
    return <CharacterCreationPage onBack={() => setView('home')} onEnterTournament={() => setView('tournament-dashboard')} view={view} setView={setView} />;
  }

  if (view === 'tournament-dashboard') {
    return <TournamentDashboardPage onBack={() => setView('home')} view={view} setView={setView} />;
  }

  return (
    <div className="min-h-screen selection:bg-primary selection:text-on-primary">
      <Navbar view={view} setView={setView} />
      <main>
        <Hero 
          onJoinTournament={() => setView('character-creation')}
          onReadRules={() => setView('rules')} 
        />
        <About />
        <Protocols />
        <Terminal />
      </main>
      <Footer />
    </div>
  );
}

const CharacterCreationPage = ({ onBack, onEnterTournament, view, setView }: { onBack: () => void, onEnterTournament: () => void, view: any, setView: (v: any) => void }) => {
  const [studentNumber, setStudentNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState('30 – 40 KİŞİ');

  const archetypes = [
    { name: '4 – 10 KİŞİ', icon: Users, desc: 'Sistem: Round Robin. Yapı: Herkes herkese. Toplam Maç: 6 – 45.', img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800' },
    { name: '11 – 24 KİŞİ', icon: Activity, desc: 'Sistem: Swiss. Yapı: 4-5 tur. Toplam Maç: 20 – 60.', img: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800' },
    { name: '25 – 35 KİŞİ', icon: Bot, desc: 'Sistem: Double Elimination. Yapı: Bracket. Toplam Maç: 49 – 69.', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800', highlighted: true },
    { name: '35 – 50 KİŞİ', icon: Rocket, desc: 'Sistem: Hybrid Protocol. Yapı: Swiss + Eleme. Toplam Maç: 60 – 85.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800' },
    { name: '50+ KİŞİ', icon: Shield, desc: 'Sistem: Single Elimination. Yapı: Direkt eleme. Toplam Maç: ≤ n-1.', img: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800' }
  ];

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => setVerifying(false), 2000);
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
                  onChange={(e) => setStudentNumber(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant focus:border-primary focus:ring-0 text-primary text-lg font-mono p-4 rounded-none outline-none transition-all placeholder:text-outline-variant/30"
                  placeholder="2X0201XXX"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-6 bg-primary/20 animate-pulse"></span>
              </div>
              <button 
                onClick={handleVerify}
                disabled={verifying}
                className="w-full bg-primary text-on-primary font-display font-bold py-5 uppercase flex items-center justify-center gap-4 hover:shadow-[0_0_20px_rgba(74,225,118,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldIcon className="w-5 h-5" />}
                {verifying ? 'DOĞRULANIYOR...' : 'DOĞRULA'}
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
              <div className="relative">
                <input 
                  type="text"
                  defaultValue="GHOST_PROTOCOL"
                  className="w-full bg-surface-container-high border border-primary/30 focus:border-primary focus:ring-0 text-primary text-lg font-mono p-4 rounded-none outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20">
                <ShieldIcon className="w-6 h-6 text-primary animate-pulse" />
                <div className="flex-grow">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-tighter">AI Anonymity Check</div>
                  <div className="text-[10px] text-on-surface-variant/60 font-mono">SCANNING FOR PII DATA... NO MATCHES FOUND.</div>
                </div>
              <div className="bg-primary text-on-primary text-[10px] font-bold px-2 py-1 uppercase">ONAYLANDI</div>
              </div>
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
              className="group relative w-full p-8 bg-black border-2 border-primary overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(74,225,118,0.4)]"
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

const TournamentDashboardPage = ({ onBack, view, setView }: { onBack: () => void, view: any, setView: (v: any) => void }) => {
  return (
    <div id="dashboard-top" className="min-h-screen bg-[#050505] text-on-surface font-sans cyber-grid selection:bg-primary/20 relative overflow-x-hidden pt-16">
      <div className="fixed inset-0 pointer-events-none opacity-20 scanline z-50"></div>
      
      <Navbar view={view} setView={setView} />

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 bg-[#050505] border-r border-white/10 w-64 font-mono text-[10px]">
          <nav className="flex-1 py-4">
            {[
              { icon: Activity, label: "OPERATIONS", target: "dashboard-top" },
              { icon: GitBranch, label: "BRACKET", target: "tournament-system", color: "tertiary" },
              { icon: Database, label: "ARCHIVE", target: "archive-section" }
            ].map((item, i) => (
              <a 
                key={i}
                className={`px-6 py-4 flex items-center gap-3 transition-all duration-150 active:translate-x-1 text-neutral-600 hover:text-neutral-300`} 
                href={item.target ? `#${item.target}` : '#'}
                onClick={(e) => {
                  if (item.target) {
                    e.preventDefault();
                    document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    e.preventDefault();
                  }
                }}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-bold tracking-widest">{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>


        {/* Main Content */}
        <main className="lg:ml-64 w-full p-8 space-y-12 mb-20">
          {/* Status Section */}
          <section className="relative bg-neutral-900/40 backdrop-blur-md border border-white/10 p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-display text-2xl text-primary mb-2 uppercase italic tracking-tighter">PARTICIPATION_FEED</h2>
              <p className="text-[10px] text-neutral-500 font-bold tracking-widest">REAL-TIME SIGNAL CAPTURE IN PROGRESS...</p>
            </div>
            <div className="relative z-10 mt-6 md:mt-0 text-right">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-7xl text-primary drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]">42</span>
                <span className="text-2xl text-neutral-500 font-bold">/ 64</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-primary text-[10px] font-bold tracking-widest">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                LIVE_UPLINK_ACTIVE
              </div>
            </div>
            {/* Animated scanning line */}
            <motion.div 
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[2px] bg-primary/50 shadow-[0_0_15px_#22c55e] z-20 pointer-events-none"
            />
          </section>

          {/* Tournament Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: "1", title: "ROUND ROBIN", desc: "Küçük gruplar için idealdir. Herkes herkesle oynar.", sub: "4-10 KİŞİ" },
              { num: "2", title: "SWISS SYSTEM", desc: "Orta ölçekli katılımcılar için standart protocol.", sub: "11-24 KİŞİ" },
              { num: "3", title: "DOUBLE ELIMINATION", desc: "Yüksek rekabet. İki mağlubiyet alan operatör elenir.", sub: "25-35 KİŞİ" },
              { num: "4", title: "HYBRID_PROTOCOL", desc: "Swiss turlarını takiben eleme aşamasına geçiş.", sub: "35-50 KİŞİ", highlighted: true },
              { num: "5", title: "SINGLE ELIMINATION", desc: "Büyük çaplı operasyonlar için direkt eleme sistemi.", sub: "50+ KİŞİ" }
            ].map((item, i) => (
              <div key={i} className={`group relative p-4 transition-all duration-300 ${
                  item.highlighted ? 'bg-[#050505] border-2 border-primary shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-[#121212] border border-white/10 hover:border-primary/50 hover:bg-primary/5'
                }`}>
                <div className="flex justify-between items-start mb-6">
                  <span className={`text-xl font-bold ${item.highlighted ? 'text-primary' : 'text-neutral-600 group-hover:text-primary transition-colors'}`}>{item.num}</span>
                  <span className={`text-[7px] font-mono font-bold px-2 py-1 whitespace-nowrap ${item.highlighted ? 'text-black bg-primary' : 'text-neutral-700 bg-neutral-800'}`}>{item.sub}</span>
                </div>
                <h3 className={`font-display text-sm mb-2 ${item.highlighted ? 'text-primary' : 'text-primary'}`}>{item.title}</h3>
                <p className={`text-[9px] leading-relaxed font-bold tracking-widest ${item.highlighted ? 'text-neutral-300' : 'text-neutral-500'}`}>{item.desc}</p>
              </div>
            ))}
          </section>

          {/* Tournament System Table Section */}
          <motion.section 
            id="tournament-system"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-2 md:p-8 relative overflow-hidden group mb-12"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <LayoutGrid className="w-[120px] h-[120px]" />
            </div>
            
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center space-x-4">
                <Bot className="w-8 h-8 text-primary" />
                <h2 className="font-display text-2xl text-primary uppercase tracking-tight italic">TURNUVA SİSTEMİ VE YAPILARI</h2>
              </div>
              
              {/* Floating Counter Widget in Top Right */}
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display text-primary drop-shadow-[0_0_10px_rgba(74,225,118,0.4)]">42</span>
                  <span className="text-xl text-neutral-600 font-bold italic">/ 64</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_#4ae176]"></div>
                  <span className="text-[10px] font-black text-primary tracking-widest">LIVE_UPLINK_ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-primary/20 bg-primary/5">
                    <th className="p-4 text-[10px] md:text-sm font-black text-primary uppercase tracking-widest italic">Katılımcı Sayısı</th>
                    <th className="p-4 text-[10px] md:text-sm font-black text-primary uppercase tracking-widest italic">Sistem</th>
                    <th className="p-4 text-[10px] md:text-sm font-black text-primary uppercase tracking-widest italic">Yapı</th>
                    <th className="p-4 text-[10px] md:text-sm font-black text-primary uppercase tracking-widest italic">Toplam Maç</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] md:text-xs text-neutral-300">
                  {[
                    { range: "4 – 10 kişi", sys: "Round Robin", struct: "Herkes herkese", total: "6 – 45" },
                    { range: "11 – 24 kişi", sys: "Swiss", struct: "4-5 tur", total: "20 – 60" },
                    { range: "25 – 35 kişi", sys: "Double Elimination", struct: "Bracket", total: "49 – 69" },
                    { range: "35 – 50 kişi", sys: "Hybrid_Protocol", struct: "Swiss + Eleme", total: "60 – 85", alert: true },
                    { range: "50+ kişi", sys: "Single Elimination", struct: "Direkt eleme", total: "≤ n-1" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="p-4 font-black tracking-widest text-on-surface whitespace-nowrap">{row.range}</td>
                      <td className="p-4 text-on-surface-variant group-hover:text-primary transition-colors">{row.sys}</td>
                      <td className="p-4 text-on-surface-variant font-medium">{row.struct}</td>
                      <td className="p-4 flex items-center gap-2">
                        <span className="font-mono text-primary font-bold">{row.total}</span>
                        {row.alert && <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 p-4 border border-primary/10 bg-primary/5 rounded-sm">
              <p className="text-[10px] text-primary/70 italic tracking-widest flex items-center gap-2 uppercase">
                <Sparkles className="w-4 h-4" /> Sistem katılımcı sayısına göre otomatik optimize edilir.
              </p>
            </div>
          </motion.section>

          {/* Bracket Preview */}
          <section className="bg-surface-container-lowest border border-white/5 p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <h2 className="font-display text-2xl text-primary tracking-tighter uppercase italic">BRACKET_VISUALIZATION_BETA</h2>
                <p className="text-[10px] text-neutral-600 font-bold tracking-widest">SCHEMATIC RENDER OF FINAL 8 PATHWAY</p>
              </div>
              <button className="border border-neutral-700 px-4 py-2 text-[10px] text-neutral-400 hover:border-primary hover:text-primary transition-colors flex items-center gap-2 font-bold tracking-widest">
                <FileDown className="w-3 h-3" /> EXPORT_DATA
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row justify-around items-center min-h-[400px] relative gap-12">
              {/* Quarter Finals */}
              <div className="space-y-16 z-10">
                {[772, 901].map(id => (
                  <div key={id} className="w-48 h-12 bg-neutral-900 border border-neutral-800 flex items-center px-4 gap-3 relative overflow-hidden">
                    <div className="w-1 h-full bg-neutral-700 absolute left-0 top-0"></div>
                    <span className="text-[10px] font-mono text-neutral-600 font-bold">ID_{id}</span>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">PENDING...</span>
                    <div className="absolute -right-8 top-1/2 w-8 h-px bg-primary/30 hidden md:block"></div>
                  </div>
                ))}
              </div>
              {/* Connector Bridge */}
              <div className="hidden md:block absolute left-1/4 top-1/2 -translate-y-1/2 w-1 h-32 border-r border-primary/30"></div>

              {/* Semi Finals */}
              <div className="space-y-32 z-10">
                <div className="w-56 h-14 bg-neutral-950 border border-primary/20 flex items-center px-4 gap-3 relative shadow-[0_0_20px_rgba(34,197,94,0.05)]">
                  <div className="w-1 h-full bg-primary absolute left-0 top-0"></div>
                  <span className="text-[10px] font-mono text-primary/50 font-bold">MATCH_ALPHA</span>
                  <span className="text-[10px] text-neutral-300 uppercase tracking-widest font-bold">ENCRYPTED</span>
                  <div className="absolute -right-8 top-1/2 w-8 h-px bg-primary/30 hidden md:block"></div>
                </div>
              </div>

              {/* Grand Final */}
              <div className="z-10">
                <div className="w-64 h-24 bg-[#050505] border-2 border-white/10 flex flex-col items-center justify-center relative group hover:border-primary transition-all cursor-crosshair">
                  <img 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-50" 
                    src="/regenerated_image_1777643565882.png" 
                    alt="Champion Slot" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="relative z-10 text-center">
                    <div className="text-[10px] font-bold text-neutral-500 mb-1 tracking-widest">ULTIMATE_BREACH</div>
                    <div className="font-display text-xl tracking-widest text-white uppercase italic">CHAMPION_SLOT</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Fog Effect Layer */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"></div>
          </section>


          {/* Archive Section */}
          <motion.section 
            id="archive-section"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel p-8 relative overflow-hidden border-tertiary/20"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Database className="w-8 h-8 text-tertiary" />
                <h2 className="font-display text-2xl text-tertiary uppercase tracking-tight italic tracking-widest">OPERATOR_REGISTRY_ARCHIVE</h2>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display text-tertiary drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">24</span>
                  <span className="text-xl text-neutral-600 font-bold italic">/ 64</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_5px_#a855f7]"></div>
                  <span className="text-[10px] font-black text-tertiary tracking-widest uppercase">REGISTRY_ACTIVE</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                "KRAKEN_99", "SPECTRE_X", "VOID_WALKER", "NEURAL_LINK", "QUANTUM_GATE",
                "CYBER_WOLF", "GHOST_DECODED", "PHANTOM_STRATEGIST", "AXON_BYPASS", "ZERO_ONE",
                "CORE_BREACH", "SIGNAL_LOST", "ENIGMA_NODE", "VECTOR_KING", "GRID_MASTER",
                "DEEP_PURPLE", "STATIC_VOID", "BLUR_NODE", "ROOT_ACCESS", "BYTE_ME",
                "OMEGA_ONE", "ALPHA_STRETCH", "DARK_EYE", "SILENT_STEP"
              ].map((user, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-3 flex items-center justify-between group hover:border-tertiary transition-all hover:bg-tertiary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 group-hover:bg-tertiary group-hover:shadow-[0_0_8px_#a855f7] transition-all"></div>
                    <span className="font-mono text-[9px] font-bold text-neutral-500 group-hover:text-tertiary tracking-[0.15em]">{user}</span>
                  </div>
                  <CheckCircle2 className="w-3 h-3 text-neutral-800 group-hover:text-tertiary transition-colors" />
                </div>
              ))}
              <div className="bg-tertiary/10 border border-tertiary/30 p-3 flex flex-col items-center justify-center border-dashed border-2 group hover:bg-tertiary/20 transition-all cursor-pointer">
                <span className="font-mono text-[8px] text-tertiary font-bold tracking-widest mb-1 italic">MORE_RECORDS</span>
                <ChevronRight className="w-3 h-3 text-tertiary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.section>


        </main>
      </div>

      {/* Mobile Footer (Optional, reuse logic from main if needed) */}
      <footer className="w-full py-6 px-12 flex flex-col md:flex-row justify-between items-center bg-black/40 border-t border-neutral-900 relative z-50">
        <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-4 md:mb-0">
          © 2026 IEEE EA - SECURE TRANSMISSION
        </div>
        <div className="flex gap-8">
          <a className="font-mono text-[10px] uppercase tracking-widest text-neutral-700 hover:text-primary transition-colors opacity-80 hover:opacity-100 font-bold" href="#">ENCRYPTION_DOCS</a>
          <a className="font-mono text-[10px] uppercase tracking-widest text-neutral-700 hover:text-primary transition-colors opacity-80 hover:opacity-100 font-bold" href="#">SYSTEM_STATUS</a>
          <a className="font-mono text-[10px] uppercase tracking-widest text-neutral-700 hover:text-primary transition-colors opacity-80 hover:opacity-100 font-bold" href="#">SIGNAL_MAP</a>
        </div>
      </footer>
    </div>
  );
};

const RulesPage = ({ onBack, onAccept, view, setView }: { onBack: () => void, onAccept: () => void, view: any, setView: (v: any) => void }) => {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-mono selection:bg-primary selection:text-on-primary relative overflow-x-hidden">
      <div className="scanline"></div>
      
      <Navbar view={view} setView={setView} />

      {/* Main Content Area */}
      <main className="pt-24 pb-24 max-w-7xl mx-auto px-6 min-h-screen">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-block px-3 py-1 mb-4 bg-primary/10 border border-primary/30">
            <p className="text-[10px] text-primary tracking-widest uppercase font-bold">Directive 77-B // Operational Standards</p>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-primary glow-text mb-2 uppercase italic tracking-tighter">
            SİSTEM PROTOKOLLERİ
          </h1>
          <div className="h-1 w-full bg-gradient-to-r from-primary to-transparent opacity-20"></div>
        </motion.header>

        {/* Rules Bento Grid */}
        <div id="rules-section" className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Section 1: ANA PROTOKOL KURALLARI */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-8 glass-panel p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShieldCheck className="w-[120px] h-[120px]" />
            </div>
            <div className="flex items-center space-x-4 mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h2 className="font-display text-2xl text-primary uppercase tracking-tight italic">ANA PROTOKOL KURALLARI</h2>
            </div>
            <div className="space-y-6 text-on-surface-variant leading-relaxed text-sm font-bold tracking-widest uppercase">
              <p><span className="text-primary">[KURAL 01]: ANONİM KİMLİK</span> — Gerçek isimler yasaktır. Her operatöre sistem tarafından benzersiz bir kod adı atanacaktır.</p>
              <p><span className="text-primary">[KURAL 02]: 48S UPLINK</span> — Müsabaka koordinatları ve kesin zaman dilimi, başlangıçtan 48 saat önce güvenli kanal üzerinden iletilecektir.</p>
              <p><span className="text-primary">[KURAL 03]: BLITZ CONSTRAINTS</span> — Tüm hamleler 5 dakikalık kısıtlı zaman dilimi içerisinde tamamlanmalıdır.</p>
              <p><span className="text-primary">[KURAL 04]: MERIT REWARDS</span> — Operasyon sonunda ilk 3'e giren operatörler IEEE tarafından ödüllendirilecektir.</p>
              <div className="mt-6 p-4 border border-primary/10 bg-primary/5 rounded-sm">
                <p className="text-[10px] text-primary/70 italic tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> "Yeraltında her hamle bir iz bırakır, ama sadece en hızlılar hayatta kalır."
                </p>
              </div>
            </div>
          </motion.section>

          {/* Technical Diagram Sidebar */}
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-4 bg-black/40 border border-primary/20 flex flex-col p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none opacity-5 chess-grid bg-[size:32px_32px]"></div>
            <h3 className="font-display text-xl text-primary mb-12 uppercase tracking-[0.2em] italic">PIECE TOPOLOGY</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center space-y-12 relative z-10 w-full">
              {[
                { 
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSQ7Ir_nxH9ZABt0-AgCYMsEQpD6aWwZoiDFG932kuHGnXJEQlmgAZkVC3Y_Z3j94x_cEQz5uRgPG0ZfLuy9R0ilebDQmVycoyqUsVcOxqnxpblPY262hBSaOCdWEr_2V-6slEAEYZoGQqpWjQ_gNUeYmpsh-vqV75IQX-roNpm7syywcL93vykCEJGm4FK9oKv_YatYDNWeLVKCwMpVq6hlqjwdsa6EgjIuRMIzuM7W3XUATl67GCgC9F3CXfZy-n-6NJYUwdVYU", 
                  label: "CORE NODE: KING_UNIT" 
                },
                { 
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMZkKI4hj0QERw99n_qsBTjrhDTt9HvLbI5tWVHbNGZVH-67zy9qg08WSX66a220Q1uZPtF1B130JsY7nUZgJOezm7AVaGa6g5EUt67eOA2EowaFOmtmPcXM8czhO41Xl0FoODPRFZdcLDEqqkrdnc1rgwNSKedf1H85zYv-8aAb6th7OqpY20UfnRPo4xjHjpGdHSJxGzPE1IMC98gDzfovsw1RGe548uaVD5WFK0pVy3tggjpRxxd9o_BlgTlHtF-vI4U69YYd4", 
                  label: "VECTOR NODE: KNIGHT_MOD" 
                }
              ].map((item, i) => (
                <div key={i} className="text-center group w-full flex flex-col items-center">
                  <div className="relative mb-6">
                    <img 
                      className="w-48 h-48 object-contain transition-all duration-700 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(74,225,118,0.4)]" 
                      src={item.img} 
                      alt={item.label} 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-2xl"></div>
                  </div>
                  <p className="text-[10px] text-primary/80 uppercase tracking-[0.3em] font-black">{item.label}</p>
                  {i === 0 && <div className="w-full h-px bg-primary/10 mt-12 mb-4"></div>}
                </div>
              ))}
            </div>
          </motion.aside>

          {/* Section 2: ADALET VE GÜVENLİK PROTOKOLÜ */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-6 glass-panel p-8 group border-primary/30"
          >
            <div className="flex items-center space-x-4 mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h2 className="font-display text-2xl text-primary uppercase tracking-tight italic">ADALET VE GÜVENLİK</h2>
            </div>
            <div className="text-on-surface-variant space-y-6 text-sm font-bold tracking-widest uppercase">
              <div className="flex items-start space-x-4">
                <div className="mt-1.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                <p>Tam tarafsızlık ve adalet için her müsabaka sistem tarafından rastgele atanan anonim <span className="text-primary">HAKEMLER</span> tarafından denetlenecektir.</p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                <p>Yazılımsal destek ve anti-cheat protokolü aktiftir. Yapay zeka tespiti durumunda operatör terminalden kalıcı olarak <span className="text-red-500">BANLANACAKTIR</span>.</p>
              </div>
              <div className="pt-4 border-t border-primary/10">
                <div className="bg-black p-4 rounded-sm font-mono text-[9px] text-primary/60 leading-tight">
                  ANALYZING_MOVE_STREAM...<br/>
                  &gt;&gt; 99.4% CONSISTENCY CHECK...<br/>
                  &gt;&gt; STATUS: CLEAN
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 3: Conduct & Breach */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-6 glass-panel p-8 border-l-4 border-primary"
          >
            <div className="flex items-center space-x-4 mb-6">
              <TerminalIcon className="w-8 h-8 text-primary" />
              <h2 className="font-display text-2xl text-primary uppercase tracking-tight">Conduct & Breach</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "ABANDONMENT_ERROR", status: "INSTANT_DQ", color: "red-500" },
                { label: "TOXIC_BUFFER_OVERFLOW", status: "COMM_SILENCE", color: "red-500" },
                { label: "SANDBAGGING_DETECTION", status: "RATING_VOID", color: "red-500" }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-surface-container-low border border-primary/10">
                  <span className="text-[10px] font-bold text-on-surface-variant tracking-wider">{item.label}</span>
                  <span className={`text-[10px] font-bold text-${item.color} tracking-widest`}>{item.status}</span>
                </div>
              ))}
              <p className="text-[10px] text-primary/40 mt-6 italic tracking-widest text-center">Respect the protocol. The system is watching.</p>
            </div>
          </motion.section>

          {/* System Logs Row */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-12 glass-panel p-6 bg-black/40"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] text-primary uppercase tracking-widest font-bold">LIVE_SYSTEM_LOGS</h3>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_#22c55e]"></div>
                <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                <div className="w-2 h-2 rounded-full bg-primary/20"></div>
              </div>
            </div>
            <div className="font-mono text-[9px] text-primary/50 space-y-1">
              <p>[22:41:09] SYSTEM: Protocol updated to v4.2.1. Chessboard encryption active.</p>
              <p>[22:41:12] SECURITY: 4 foreign engines detected and neutralized in qualifying round.</p>
              <p>[22:41:45] OPERATOR: New user 'VOID_RUNNER' joined the foyer.</p>
              <p>[22:42:01] LOG: Terminal latency stabilized at 12ms.</p>
            </div>
          </motion.section>
        </div>

        {/* CTA Section */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
          <button 
            onClick={onAccept}
            className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary font-display font-bold uppercase tracking-widest hover:shadow-[0_0_30px_rgba(34,197,94,0.8)] transition-all transform active:scale-95"
          >
            PROTOKOLLERİ KABUL ET
          </button>
          <button 
            onClick={onBack}
            className="w-full md:w-auto px-8 py-4 border border-primary text-primary font-display font-bold uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center justify-center space-x-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>TERMİNALE DÖN</span>
          </button>
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center h-16 pb-safe md:hidden bg-black/95 backdrop-blur-2xl border-t border-primary/30">
        {[
          { icon: LayoutGrid, label: "Home", onClick: onBack },
          { icon: ShieldCheck, label: "Rules", active: true },
          { icon: TerminalIcon, label: "Chat" },
          { icon: Bot, label: "Match" }
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={item.onClick}
            className={`flex flex-col items-center justify-center p-2 transition-all ${
              item.active ? 'bg-primary text-on-primary scale-110 shadow-[0_0_15px_rgba(74,225,118,0.5)]' : 'text-primary/40'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase mt-1">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};


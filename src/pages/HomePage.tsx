import { motion } from 'motion/react';
import { 
  Fingerprint, 
  ShieldCheck, 
  Medal, 
  VenetianMask, 
  Bot, 
  Activity, 
  Terminal as TerminalIcon 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

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
      // Dummy interval to keep consistent with original
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

export const HomePage = ({ view, setView }: { view: string, setView: (v: any) => void }) => {
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
};

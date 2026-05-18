import { motion } from 'motion/react';
import { 
  Activity, GitBranch, Database, Sparkles, 
  LayoutGrid, Bot, FileDown, CheckCircle2, ChevronRight, AlertCircle,
  Target, Zap, Shield, Grid3X3, AlignVerticalSpaceAround, Sword, Network, Expand, BrainCircuit,
  Clock3, Globe, CalendarDays,
  type LucideIcon
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { subscribeToPlayers, PlayerData } from '../services/playerService';
import { useState, useEffect } from 'react';

// Archetype icon & color mapping — mirrors CharacterCreationPage
const ARCHETYPE_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  'CENTER CONTROL':    { icon: Target,                    color: 'text-emerald-400' },
  'DEVELOPMENT':       { icon: Zap,                       color: 'text-yellow-400' },
  'KING SAFETY':       { icon: Shield,                    color: 'text-blue-400' },
  'PAWN STRUCTURE':    { icon: Grid3X3,                   color: 'text-green-500' },
  'OPEN FILE CONTROL': { icon: AlignVerticalSpaceAround,  color: 'text-cyan-400' },
  'TACTICS':           { icon: Sword,                     color: 'text-red-500' },
  'COORDINATION':      { icon: Network,                   color: 'text-indigo-400' },
  'SPACE ADVANTAGE':   { icon: Expand,                    color: 'text-purple-500' },
  'PLAN MAKING':       { icon: BrainCircuit,              color: 'text-primary' },
};

const ARCHETYPE_KEYS = Object.keys(ARCHETYPE_MAP);

export const TournamentDashboardPage = ({ onBack, view, setView }: { onBack: () => void, view: any, setView: (v: any) => void }) => {
  const [players, setPlayers] = useState<PlayerData[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToPlayers((data) => {
      setPlayers(data);
    });
    return () => unsubscribe();
  }, []);

  const playerCount = players.length;

  // Determine active tournament format based on player count
  const getActiveFormat = (count: number): number => {
    if (count <= 10) return 0;
    if (count <= 24) return 1;
    if (count <= 35) return 2;
    if (count <= 50) return 3;
    return 4;
  };
  const activeFormat = getActiveFormat(playerCount);

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
                <span className="font-display text-7xl text-primary drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]">{playerCount}</span>
                <span className="text-2xl text-neutral-500 font-bold">KATILIMCI</span>
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

          {/* Tournament Info Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel border border-white/10 p-8 flex flex-col justify-center">
              <div className="flex items-start gap-4 mb-6">
                <div className="rounded-full bg-primary/10 p-4 text-primary">
                  <Clock3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-bold">Turnuva Başlangıcı</p>
                  <h2 className="text-3xl font-bold text-white mt-2 leading-tight">21 Mayıs 2026</h2>
                </div>
              </div>
            </div>
            
            <div className="glass-panel border border-white/10 p-8 lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 rounded-2xl bg-black/40 p-4 border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/20 flex flex-col items-center justify-center shrink-0">
                    <p className="text-[8px] uppercase text-primary font-bold">MAY</p>
                    <p className="text-white text-lg font-display leading-none">21</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Tarih</p>
                    <p className="text-white text-sm font-bold">21 Mayıs 2026</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-black/40 p-4 border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                    <Clock3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Format</p>
                    <p className="text-white text-sm font-bold">10+5 Rapid</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-black/40 p-4 border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Platform</p>
                    <p className="text-white text-sm font-bold">Lichess.org</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-bold mb-2">Önemli Not</p>
                <p className="text-neutral-400 text-xs leading-relaxed">Tüm müsabakalar çevrimiçi olarak Lichess.org üzerinden oynanacaktır. Eşleşme linkiniz profil sayfanıza otomatik olarak iletilir. Maç sonuçları sistem tarafından otomatik çekilir.</p>
              </div>
            </div>
          </section>

          {/* Tournament Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: "1", title: "ROUND ROBIN", desc: "Küçük gruplar için idealdir. Herkes herkesle oynar.", sub: "4-10 KİŞİ" },
              { num: "2", title: "SWISS SYSTEM", desc: "Orta ölçekli katılımcılar için standart protocol.", sub: "11-24 KİŞİ" },
              { num: "3", title: "DOUBLE ELIMINATION", desc: "Yüksek rekabet. İki mağlubiyet alan operatör elenir.", sub: "25-35 KİŞİ" },
              { num: "4", title: "HYBRID_PROTOCOL", desc: "Swiss turlarını takiben eleme aşamasına geçiş.", sub: "35-50 KİŞİ" },
              { num: "5", title: "SINGLE ELIMINATION", desc: "Büyük çaplı operasyonlar için direkt eleme sistemi.", sub: "50+ KİŞİ" }
            ].map((item, i) => {
              const isActive = activeFormat === i;
              return (
                <div key={i} className={`group relative p-4 transition-all duration-500 ${
                    isActive ? 'bg-[#050505] border-2 border-primary shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-[#121212] border border-white/10 hover:border-primary/50 hover:bg-primary/5'
                  }`}>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-xl font-bold ${isActive ? 'text-primary' : 'text-neutral-600 group-hover:text-primary transition-colors'}`}>{item.num}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[7px] font-mono font-bold px-2 py-1 whitespace-nowrap ${isActive ? 'text-black bg-primary' : 'text-neutral-700 bg-neutral-800'}`}>{item.sub}</span>
                      {isActive && <span className="text-[7px] font-mono font-bold px-2 py-1 bg-primary text-black tracking-widest animate-pulse">AKTİF</span>}
                    </div>
                  </div>
                  <h3 className={`font-display text-sm mb-2 text-primary`}>{item.title}</h3>
                  <p className={`text-[9px] leading-relaxed font-bold tracking-widest ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>{item.desc}</p>
                </div>
              );
            })}
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
                  <span className="text-4xl font-display text-primary drop-shadow-[0_0_10px_rgba(74,225,118,0.4)]">{playerCount}</span>
                  <span className="text-sm text-neutral-600 font-bold italic">KATILIMCI</span>
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
                  <span className="text-4xl font-display text-tertiary drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">{playerCount}</span>
                  <span className="text-sm text-neutral-600 font-bold italic">KAYITLI</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_5px_#a855f7]"></div>
                  <span className="text-[10px] font-black text-tertiary tracking-widest uppercase">REGISTRY_ACTIVE</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {players.map((player, i) => {
                const archData = ARCHETYPE_MAP[player.archetype];
                const ArchIcon = archData?.icon;
                const archColor = archData?.color || 'text-neutral-500';
                return (
                  <div key={player.uid || i} className="bg-white/5 border border-white/5 p-3 flex items-center justify-between group hover:border-tertiary transition-all hover:bg-tertiary/5">
                    <div className="flex items-center gap-2.5">
                       {ArchIcon && <ArchIcon className={`w-3.5 h-3.5 ${archColor} shrink-0 transition-all group-hover:drop-shadow-[0_0_6px_currentColor]`} />}
                       <span className="font-mono text-[9px] font-bold text-neutral-500 group-hover:text-tertiary tracking-[0.15em]">{player.codename}</span>
                    </div>
                    <CheckCircle2 className="w-3 h-3 text-neutral-800 group-hover:text-tertiary transition-colors" />
                  </div>
                );
              })}
              {players.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase">Henüz kayıtlı operatör yok...</p>
                  <p className="text-[8px] text-neutral-700 font-mono tracking-widest mt-1">AWAITING_FIRST_SIGNAL</p>
                </div>
              )}
            </div>
          </motion.section>
        </main>
      </div>

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

import { motion } from 'motion/react';
import { 
  ShieldCheck, Sparkles, Terminal as TerminalIcon, 
  ChevronRight, LayoutGrid, Bot 
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const RulesPage = ({ onBack, onAccept, view, setView }: { onBack: () => void, onAccept: () => void, view: any, setView: (v: any) => void }) => {
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
              <p><span className="text-primary">[KURAL 01]: ANONİM KİMLİK</span> — Gerçek isimler yasaktır. Her operatör, yapay zeka güvenlik taramasından geçen benzersiz bir kod adı belirleyecektir. Uygunsuz veya kimlik ifşa eden isimler sistem tarafından reddedilir.</p>
              <p><span className="text-primary">[KURAL 02]: 48S UPLINK</span> — Müsabaka tarihi, saati ve özel Lichess maç linki, başlangıçtan 48 saat önce profil sayfanıza güvenli kanal üzerinden iletilecektir.</p>
              <p><span className="text-primary">[KURAL 03]: RAPID PROTOCOL</span> — Tüm müsabakalar 10+5 (10 dakika + hamle başı 5 saniye artırma) formatında, Lichess altyapısı üzerinden çevrimiçi olarak oynanacaktır.</p>
              <p><span className="text-primary">[KURAL 04]: MERIT REWARDS</span> — Operasyon sonunda ilk 3'e giren operatörler IEEE tarafından ödüllendirilecektir.</p>
              <p><span className="text-primary">[KURAL 05]: DYNAMIC ARCHITECTURE</span> — Turnuva düzeni ve eşleşme sistemi, katılan operatör sayısına göre sistem tarafından otomatik olarak belirlenecektir.</p>
              <p><span className="text-primary">[KURAL 06]: GHOST MATCH</span> — Her eşleşme için sistem tarafından özel bir Lichess linki oluşturulur. Beyaz ve Siyah renk ataması sistem tarafından yapılır. Operatörler sadece kendilerine atanan linke tıklayarak müsabakaya katılır.</p>
              <p><span className="text-primary">[KURAL 07]: 15DK KATILIM SÜRESİ</span> — Maç linki oluşturulduktan sonra her iki operatörün de 15 dakika içinde bağlantıya tıklayarak müsabakaya katılması zorunludur. Süre dolduğunda katılmayan operatör <span className="text-red-500">HÜKMEN MAĞLUP</span> ilan edilir.</p>
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
                <p>Tüm müsabakalar Lichess.org altyapısında oynanır. Lichess'in <span className="text-primary">ANTİ-CHEATSİSTEMİ</span> otomatik olarak aktiftir ve hile yapan operatörler anında tespit edilir.</p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                <p>Maç sırasında harici satranç motoru, yapay zeka veya üçüncü parti yazılım kullanımı tespit edildiğinde operatör sistemden kalıcı olarak <span className="text-red-500">BANLANACAKTIR</span>.</p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                <p>Maç sonuçları Lichess API üzerinden otomatik olarak sisteme çekilir. Kazanan ve kaybeden <span className="text-primary">OTOMATİK</span> olarak belirlenir.</p>
              </div>
              <div className="pt-4 border-t border-primary/10">
                <div className="bg-black p-4 rounded-sm font-mono text-[9px] text-primary/60 leading-tight">
                  LICHESS_ANTICHEAT_SCAN...<br/>
                  &gt;&gt; ENGINE_CORRELATION: 0.02% (CLEAN)<br/>
                  &gt;&gt; TAB_SWITCH_MONITOR: ACTIVE<br/>
                  &gt;&gt; STATUS: ALL_CLEAR
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
                { label: "LINK_TIMEOUT (10DK)", status: "HÜKMEN_MAĞLUBİYET", color: "red-500" },
                { label: "ENGINE_DETECTION", status: "KALICI_BAN", color: "red-500" },
                { label: "TOXIC_BEHAVIOR", status: "DİSKALİFİYE", color: "red-500" }
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
              <p>[22:41:09] SYSTEM: Protocol updated to v5.0. Lichess Ghost Match integration active.</p>
              <p>[22:41:12] SECURITY: Lichess anti-cheat monitoring enabled for all active matches.</p>
              <p>[22:41:45] MATCH: Ghost link generated → lichess.org/xYz123 [WHITE: ███████ | BLACK: ███████]</p>
              <p>[22:42:01] RESULT: Match xYz123 completed. Winner: BLACK. Scores updated automatically.</p>
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

    </div>
  );
};

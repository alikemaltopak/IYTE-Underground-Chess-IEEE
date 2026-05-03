export const Navbar = ({ view, setView }: { view: string, setView: (v: any) => void }) => (
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

import { LayoutGrid, User, Shield, Terminal, Settings, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ view, setView }: { view: string, setView: (v: any) => void }) => {
  const { user } = useAuth();
  const navItems = [
    { id: 'home', label: 'DASHBOARD', icon: LayoutGrid },
    { id: 'profile', label: 'PROFILE', icon: User },
    { id: 'character-creation', label: 'CHARACTER', icon: Shield },
    { id: 'tournament-dashboard', label: 'TOURNAMENT', icon: Terminal },
    { id: 'rules', label: 'PROTOCOL', icon: Settings },
  ];

  // Admin yetkisi olan e-posta adresleri artık .env dosyasından çekiliyor
  const adminEmailsString = process.env.VITE_ADMIN_EMAILS || 'alikemaltopak@gmail.com';
  const adminEmails = adminEmailsString.split(',').map(e => e.trim());

  if (user?.email && adminEmails.includes(user.email)) {
    navItems.push({ id: 'admin-test', label: 'ADMIN', icon: ShieldAlert });
  }

  return (
    <>
      <header className="fixed top-0 z-50 flex justify-between items-center px-4 md:px-10 h-16 w-full bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div 
          className="text-lg font-black tracking-tighter text-primary drop-shadow-[0_0_8px_rgba(74,225,118,0.6)] font-display cursor-pointer uppercase italic shrink-0"
          onClick={() => setView('home')}
        >
          İYTE YERALTI
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a 
              key={item.id}
              className={`text-[10px] font-bold tracking-[0.2em] transition-all hover:text-primary ${
                view === item.id ? 'text-primary border-b border-primary pb-1' : 'text-neutral-500'
              }`} 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setView(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-1">
            {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-primary/20"></div>)}
          </div>
          <button 
            onClick={() => setView('home')}
            className="bg-primary text-black text-[9px] px-4 md:px-5 py-1.5 font-black tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[0_0_15px_rgba(74,225,118,0.3)] shrink-0"
          >
            LOGIN_TERMINAL
          </button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/80 backdrop-blur-2xl border-t border-white/10 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive ? 'text-primary scale-110' : 'text-neutral-500'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(74,225,118,0.6)]' : ''}`} />
                <span className="text-[7px] font-bold uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

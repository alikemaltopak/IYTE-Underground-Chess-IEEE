import { SystemStatus } from './SystemStatus';

export const Footer = () => (
  <div className="w-full">
    <SystemStatus />
    <footer className="w-full py-10 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center glass-panel border-t border-outline-variant/30 gap-8">
      <div className="text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.3em]">
        © 2026 IEEE EA - SECURE TRANSMISSION <span className="text-primary/60 font-mono ml-4 tracking-normal normal-case">| FOR SUPPORT: +90 542 710 05 30</span>
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
        <span className="text-[10px] text-primary tracking-widest font-bold uppercase">UPLINK_STABLE</span>
      </div>
    </footer>
  </div>
);

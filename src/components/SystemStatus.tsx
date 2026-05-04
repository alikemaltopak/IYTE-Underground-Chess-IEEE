import { useEffect, useState } from 'react';
import { Shield, Zap, Globe, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export const SystemStatus = () => {
  const [latency, setLatency] = useState(0);
  const [uptime, setUptime] = useState('00:00:00');

  useEffect(() => {
    // Simulate latency changes
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 40) + 10);
    }, 3000);

    // Simulate uptime
    const startTime = Date.now();
    const uptimeInterval = setInterval(() => {
      const diff = Date.now() - startTime;
      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setUptime(`${hours}:${mins}:${secs}`);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(uptimeInterval);
    };
  }, []);

  return (
    <div className="flex flex-wrap gap-4 md:gap-8 px-6 py-3 bg-black/60 border-t border-white/5 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#22c55e]"></div>
        <span className="text-[9px] font-mono text-primary font-bold tracking-widest uppercase">Network: Online</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Zap className="w-3 h-3 text-yellow-400 opacity-60" />
        <span className="text-[9px] font-mono text-neutral-500 font-bold tracking-widest uppercase">Latency: </span>
        <span className="text-[9px] font-mono text-neutral-300 font-bold">{latency}ms</span>
      </div>

      <div className="flex items-center gap-2">
        <Cpu className="w-3 h-3 text-blue-400 opacity-60" />
        <span className="text-[9px] font-mono text-neutral-500 font-bold tracking-widest uppercase">AI_CORE: </span>
        <span className="text-[9px] font-mono text-neutral-300 font-bold">READY</span>
      </div>

      <div className="flex items-center gap-2">
        <Shield className="w-3 h-3 text-emerald-400 opacity-60" />
        <span className="text-[9px] font-mono text-neutral-500 font-bold tracking-widest uppercase">Firewall: </span>
        <span className="text-[9px] font-mono text-emerald-400 font-bold">ACTIVE</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Globe className="w-3 h-3 text-primary opacity-60" />
        <span className="text-[9px] font-mono text-neutral-500 font-bold tracking-widest uppercase">Uptime: </span>
        <span className="text-[9px] font-mono text-neutral-300 font-bold">{uptime}</span>
      </div>
    </div>
  );
};

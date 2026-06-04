import React from 'react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { 
  Mail, Lock, LogIn, UserPlus, AlertCircle, Loader2, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { checkRegistrationClosed } from '../utils/date';
import { useEffect } from 'react';


export const LoginPage = ({ view, setView }: { view: any; setView: (v: any) => void }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [tournamentStatus, setTournamentStatus] = useState<string>('setup');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tournament', 'current'), (snap) => {
      if (snap.exists() && !snap.data().deleted) {
        setTournamentStatus(snap.data().status || 'active');
      } else {
        setTournamentStatus('setup');
      }
    });
    return unsub;
  }, []);

  const regClosed = checkRegistrationClosed(tournamentStatus);

  const handleToggleRegister = () => {
    if (regClosed) {
      setError('[SİSTEM UYARISI]: Kayıtlar 5 Haziran itibariyle sonlanmıştır. Yalnızca kayıtlı operatörler giriş yapabilir.');
      setIsRegister(false);
      return;
    }
    setIsRegister(!isRegister);
    setError('');
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Tüm alanları doldurunuz.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (isRegister && regClosed) {
      setError('[SİSTEM UYARISI]: Kayıtlar 5 Haziran itibariyle sonlanmıştır. Yalnızca kayıtlı operatörler giriş yapabilir.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') setError('Bu e-posta ile kayıtlı kullanıcı bulunamadı.');
      else if (code === 'auth/wrong-password') setError('Şifre hatalı. Tekrar deneyiniz.');
      else if (code === 'auth/email-already-in-use') setError('Bu e-posta zaten kayıtlı.');
      else if (code === 'auth/invalid-email') setError('Geçersiz e-posta adresi.');
      else if (code === 'auth/invalid-credential') setError('Geçersiz kimlik bilgisi. E-posta veya şifrenizi kontrol edin.');
      else setError(err?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Google ile giriş başarısız oldu.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-on-surface font-sans relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none opacity-20 chess-grid bg-[size:64px_64px]"></div>
      <div className="scanline"></div>
      
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="w-16 h-16 border-2 border-primary/30 flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 bg-primary/5"></div>
              <span className="text-3xl relative z-10">♟</span>
            </div>
          </motion.div>
          
          <h1 className="font-display text-3xl md:text-4xl text-on-surface uppercase tracking-wider mb-2">
            {isRegister ? 'KAYIT OL' : 'GİRİŞ YAP'}
          </h1>
          <p className="text-[10px] text-primary tracking-[0.4em] uppercase font-bold">
            İYTE YERALTI SATRANÇ TURNUVASI
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 relative">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/40"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/40"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/40"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/40"></div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-2">
                E-POSTA
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@iyte.edu.tr"
                  className="w-full bg-[#111] border border-white/10 focus:border-primary/50 text-primary text-sm font-mono pl-12 pr-4 py-4 rounded-none outline-none transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-2">
                ŞİFRE
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111] border border-white/10 focus:border-primary/50 text-primary text-sm font-mono pl-12 pr-12 py-4 rounded-none outline-none transition-all placeholder:text-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-[10px] text-red-400 font-mono">{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-black font-display font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(74,225,118,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRegister ? (
                <><UserPlus className="w-5 h-5" /> KAYIT OL</>
              ) : (
                <><LogIn className="w-5 h-5" /> GİRİŞ YAP</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-grow h-px bg-white/10"></div>
            <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">veya</span>
            <div className="flex-grow h-px bg-white/10"></div>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-4 bg-[#111] border border-white/10 text-gray-300 font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:border-white/30 hover:bg-white/5 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                GOOGLE İLE GİRİŞ YAP
              </>
            )}
          </button>

          {/* Toggle */}
          {!regClosed && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleToggleRegister}
                className="text-[10px] text-white/30 hover:text-primary transition-colors uppercase tracking-widest font-bold"
              >
                {isRegister ? 'Zaten hesabın var mı? GİRİŞ YAP' : 'Hesabın yok mu? KAYIT OL'}
              </button>
            </div>
          )}
          {regClosed && (
            <div className="mt-6 text-center border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-[9px] text-red-500 font-mono font-bold uppercase tracking-wider leading-relaxed">
                [KAYITLAR KAPANDI] 5 HAZİRAN İTİBARİYLE YENİ KAYIT ALINMAMAKTADIR. SADECE KAYITLI OYUNCULAR GİRİŞ YAPABİLİR.
              </p>
            </div>
          )}
        </div>

        {/* Footer tag */}
        <div className="mt-6 text-center">
          <span className="text-[8px] text-white/10 font-mono tracking-widest">
            SECURED BY FIREBASE AUTH • IEEE İYTE EA
          </span>
        </div>
      </motion.div>
    </div>
  );
};

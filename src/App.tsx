import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { RulesPage } from './pages/RulesPage';
import { CharacterCreationPage } from './pages/CharacterCreationPage';
import { TournamentDashboardPage } from './pages/TournamentDashboardPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { LoginPage } from './pages/LoginPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'home' | 'rules' | 'character-creation' | 'tournament-dashboard' | 'profile'>('home');

  // Loading state while Firebase checks auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-[10px] text-primary/60 uppercase tracking-widest font-bold animate-pulse">
            Initializing Secure Connection...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in → show login page
  if (!user) {
    return <LoginPage view={view} setView={setView} />;
  }

  // Logged in → normal app flow
  if (view === 'rules') {
    return <RulesPage onBack={() => setView('home')} onAccept={() => setView('character-creation')} view={view} setView={setView} />;
  }

  if (view === 'character-creation') {
    return <CharacterCreationPage onBack={() => setView('home')} onEnterTournament={() => setView('tournament-dashboard')} view={view} setView={setView} />;
  }

  if (view === 'tournament-dashboard') {
    return <TournamentDashboardPage onBack={() => setView('home')} view={view} setView={setView} />;
  }

  if (view === 'profile') {
    return <UserProfilePage onBack={() => setView('home')} view={view} setView={setView} />;
  }

  return <HomePage view={view} setView={setView} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

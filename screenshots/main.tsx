// Ekran görüntüsü modu: ?view=home|rules|character-creation|tournament-dashboard|profile (&user=0 → giriş ekranı)
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/index.css';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { HomePage } from '../src/pages/HomePage';
import { RulesPage } from '../src/pages/RulesPage';
import { CharacterCreationPage } from '../src/pages/CharacterCreationPage';
import { TournamentDashboardPage } from '../src/pages/TournamentDashboardPage';
import { UserProfilePage } from '../src/pages/UserProfilePage';
import { LoginPage } from '../src/pages/LoginPage';

function Screen() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<any>(new URLSearchParams(location.search).get('view') || 'home');
  if (loading) return null;
  if (!user) return <LoginPage view={view} setView={setView} />;
  const back = () => setView('home');
  if (view === 'rules') return <RulesPage onBack={back} onAccept={back} view={view} setView={setView} />;
  if (view === 'character-creation') return <CharacterCreationPage onBack={back} onEnterTournament={back} view={view} setView={setView} />;
  if (view === 'tournament-dashboard') return <TournamentDashboardPage onBack={back} view={view} setView={setView} />;
  if (view === 'profile') return <UserProfilePage onBack={back} view={view} setView={setView} />;
  return <HomePage view={view} setView={setView} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><AuthProvider><Screen /></AuthProvider></StrictMode>,
);

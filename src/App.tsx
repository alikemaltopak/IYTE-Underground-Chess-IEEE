import { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { RulesPage } from './pages/RulesPage';
import { CharacterCreationPage } from './pages/CharacterCreationPage';
import { TournamentDashboardPage } from './pages/TournamentDashboardPage';

export default function App() {
  const [view, setView] = useState<'home' | 'rules' | 'character-creation' | 'tournament-dashboard'>('home');

  if (view === 'rules') {
    return <RulesPage onBack={() => setView('home')} onAccept={() => setView('character-creation')} view={view} setView={setView} />;
  }

  if (view === 'character-creation') {
    return <CharacterCreationPage onBack={() => setView('home')} onEnterTournament={() => setView('tournament-dashboard')} view={view} setView={setView} />;
  }

  if (view === 'tournament-dashboard') {
    return <TournamentDashboardPage onBack={() => setView('home')} view={view} setView={setView} />;
  }

  return <HomePage view={view} setView={setView} />;
}

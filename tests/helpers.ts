import type { RoundRobinMatch, TournamentRound } from '../src/tournament/engine';

export const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i + 1}`);

export const round = (matches: RoundRobinMatch[], n = 1): TournamentRound => ({
  roundNumber: n, date: '2026-06-10', time: '18:00', started: true, matches,
});

/** Turdaki bekleyen maçları verilen kurala göre sonuçlandırır (varsayılan: player1 kazanır). */
export function play(r: TournamentRound, rule: (m: RoundRobinMatch) => string = m => m.player1Id) {
  r.matches.forEach(m => {
    if (m.status !== 'completed') {
      m.winnerId = rule(m);
      m.status = 'completed';
    }
  });
  return r;
}

export const realMatches = (r: TournamentRound) => r.matches.filter(m => m.player2Id !== 'BYE');
export const pairKey = (m: RoundRobinMatch) => [m.player1Id, m.player2Id].sort().join('|');

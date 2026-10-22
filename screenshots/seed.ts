import { generateRoundRobin } from '../src/tournament/engine';

const NAMES: [string, string][] = [
  ['NEON_RAVEN', 'TACTICS'], ['GHOST_PROTOCOL', 'CENTER CONTROL'], ['CIPHER_KING', 'PLAN MAKING'],
  ['VOID_RUNNER', 'DEVELOPMENT'], ['NULL_POINTER', 'KING SAFETY'], ['CHROME_BISHOP', 'OPEN FILE CONTROL'],
  ['DARK_GAMBIT', 'PAWN STRUCTURE'], ['ZERO_DAY', 'COORDINATION'],
];

export function seed() {
  const players: Record<string, any> = {};
  NAMES.forEach(([codename, archetype], i) => {
    const uid = `p${i + 1}`;
    players[uid] = {
      uid, codename, archetype, studentId: `2902010${10 + i}`, email: `${codename.toLowerCase()}@std.iyte.edu.tr`,
      status: 'active', joinedAt: { seconds: 1780000000 - i * 3600 }, wins: 0, losses: 0, draws: 0,
    };
  });
  const ids = Object.keys(players);
  const rounds = generateRoundRobin(ids);
  const base = new Date('2026-06-10T00:00:00');
  rounds.forEach((r, ri) => {
    const d = new Date(base); d.setDate(d.getDate() + ri);
    r.date = d.toISOString().split('T')[0];
    if (ri < 3) {
      r.started = true;
      r.matches.forEach((m, mi) => {
        m.status = 'completed';
        m.winnerId = (ri + mi) % 4 === 3 ? 'draw' : (ri + mi) % 2 === 0 ? m.player1Id : m.player2Id;
        m.lichessMatchId = `demo${ri}${mi}`;
        m.lichessStatus = m.winnerId === 'draw' ? 'draw' : 'mate';
      });
    } else if (ri === 3) {
      r.started = true;
      r.matches.forEach((m, mi) => { m.status = 'active'; m.lichessMatchId = `live${mi}`; m.lichessStatus = 'started'; });
    }
  });
  rounds.slice(0, 3).flatMap(r => r.matches).forEach(m => {
    if (m.winnerId === 'draw') { players[m.player1Id].draws++; players[m.player2Id].draws++; }
    else { players[m.winnerId!].wins++; players[m.winnerId === m.player1Id ? m.player2Id : m.player1Id].losses++; }
  });

  const myMatch = rounds[3].matches.find(m => m.player1Id === 'p1' || m.player2Id === 'p1')!;
  const color = myMatch.player1Id === 'p1' ? 'white' : 'black';
  const matches: Record<string, any> = {};
  rounds[3].matches.forEach(m => {
    matches[m.lichessMatchId!] = {
      matchId: m.lichessMatchId, whitePlayerId: m.player1Id, blackPlayerId: m.player2Id, status: 'active',
      deadline: { seconds: Math.floor(Date.now() / 1000) + 11 * 60 }, tournamentRound: 4, createdAt: { seconds: Math.floor(Date.now() / 1000) - 240 },
    };
  });

  return {
    players,
    tournament: { current: { format: 'round_robin', status: 'active', rounds, playerIds: ids, createdAt: { seconds: 1780000000 } } },
    matches,
    player_matches: { p1: { upcomingMatch: `https://lichess.org/${myMatch.lichessMatchId}?color=${color}`, matchId: myMatch.lichessMatchId, matchColor: color } },
  };
}

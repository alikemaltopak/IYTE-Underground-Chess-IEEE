import { describe, it, expect } from 'vitest';
import {
  FORMAT_TABLE, detectFormat, generateRoundRobin, generateInitialRound, calculateStandings,
  generateNextSwissRound, generateNextSingleEliminationRound, generateNextDoubleEliminationRound,
  generateNextHybridRound, generateNextRoundMatches, checkTournamentFinished, shouldEliminatePlayer,
  resolveLichessWinner, resolveForfeit, collectPlayersWithBye, TournamentRound, RoundRobinMatch,
} from '../src/tournament/engine';
import { ids, round, play, realMatches, pairKey } from './helpers';

const m = (p1: string, p2: string, winnerId: string | null, status: RoundRobinMatch['status'] = 'completed'): RoundRobinMatch =>
  ({ id: `${p1}-${p2}`, round: 1, matchIndex: 0, player1Id: p1, player2Id: p2, winnerId, status });

/** Turnuvayı formatın kendi kurallarıyla sonuna kadar oynatır. */
function runTournament(format: string, n: number, rule?: (m: RoundRobinMatch) => string) {
  const players = ids(n);
  const rounds: TournamentRound[] = generateInitialRound(format, players);
  if (format === 'round_robin') {
    rounds.forEach(r => play(r, rule));
    return { players, rounds };
  }
  play(rounds[0], rule);
  let guard = 0;
  while (!checkTournamentFinished(format, rounds, players) && guard++ < 30) {
    const matches = generateNextRoundMatches({ format, status: 'active', rounds, playerIds: players, createdAt: null }, rounds, players);
    if (matches.length === 0) break;
    rounds.push(play(round(matches, rounds.length + 1), rule));
  }
  return { players, rounds };
}

describe('Format seçimi (oyuncu sayısına göre)', () => {
  it.each([
    [4, 'round_robin'], [10, 'round_robin'],
    [11, 'swiss'], [24, 'swiss'],
    [25, 'double_elimination'], [35, 'double_elimination'],
    [36, 'hybrid'], [50, 'hybrid'],
    [51, 'single_elimination'], [200, 'single_elimination'],
  ])('%i oyuncu → %s', (n, format) => {
    expect(detectFormat(n).format).toBe(format);
  });

  it('aralıklar boşluksuz ve çakışmasız', () => {
    for (let i = 1; i < FORMAT_TABLE.length; i++) {
      expect(FORMAT_TABLE[i].min).toBe(FORMAT_TABLE[i - 1].max + 1);
    }
  });

  it('4\'ten az oyuncuda Round Robin\'e düşer', () => {
    expect(detectFormat(2).format).toBe('round_robin');
    expect(detectFormat(3).format).toBe('round_robin');
  });
});

describe('Round Robin (herkes herkese)', () => {
  it.each([4, 5, 8, 9, 10])('%i oyuncu: her ikili tam bir kez karşılaşır', (n) => {
    const rounds = generateRoundRobin(ids(n));
    const expectedRounds = n % 2 === 0 ? n - 1 : n;
    expect(rounds).toHaveLength(expectedRounds);

    const pairs = rounds.flatMap(r => r.matches.map(pairKey));
    expect(pairs).toHaveLength((n * (n - 1)) / 2);
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it('bir oyuncu aynı turda iki kez oynamaz', () => {
    generateRoundRobin(ids(9)).forEach(r => {
      const seen = r.matches.flatMap(x => [x.player1Id, x.player2Id]);
      expect(new Set(seen).size).toBe(seen.length);
    });
  });

  it('tek sayıda oyuncuda BYE maçı oluşturulmaz, her tur bir kişi dinlenir', () => {
    const rounds = generateRoundRobin(ids(5));
    rounds.forEach(r => {
      expect(r.matches.some(x => x.player2Id === 'BYE' || x.player1Id === 'BYE')).toBe(false);
      expect(r.matches).toHaveLength(2);
    });
  });

  it('turlar art arda günlere 18:00\'e planlanır ve beklemede başlar', () => {
    const rounds = generateRoundRobin(ids(4));
    const days = rounds.map(r => new Date(r.date).getTime());
    for (let i = 1; i < days.length; i++) expect(days[i] - days[i - 1]).toBe(24 * 3600 * 1000);
    rounds.forEach(r => {
      expect(r.time).toBe('18:00');
      expect(r.started).toBe(false);
      r.matches.forEach(x => expect(x.status).toBe('pending'));
    });
  });

  it('tüm maçlar bitince turnuva tamamlanır', () => {
    const { players, rounds } = runTournament('round_robin', 6);
    expect(checkTournamentFinished('round_robin', rounds, players)).toBe(true);
  });
});

describe('Puan tablosu', () => {
  it('galibiyet 1, beraberlik 0.5, mağlubiyet 0 puan', () => {
    const rounds = [round([m('a', 'b', 'a'), m('c', 'd', 'draw')]), round([m('a', 'c', 'c'), m('b', 'd', 'b')], 2)];
    const s = Object.fromEntries(calculateStandings(rounds, ['a', 'b', 'c', 'd']).map(x => [x.playerId, x]));
    expect(s.a).toMatchObject({ wins: 1, losses: 1, draws: 0, points: 1, played: 2 });
    expect(s.c).toMatchObject({ wins: 1, draws: 1, points: 1.5, played: 2 });
    expect(s.d).toMatchObject({ losses: 1, draws: 1, points: 0.5 });
  });

  it('bay (BYE) 1 puan ve galibiyet sayılır', () => {
    const s = calculateStandings([round([m('a', 'BYE', 'a')])], ['a']);
    expect(s[0]).toMatchObject({ wins: 1, points: 1, played: 1 });
  });

  it('bitmemiş maçlar sayılmaz', () => {
    const s = calculateStandings([round([m('a', 'b', null, 'active')])], ['a', 'b']);
    expect(s.every(x => x.played === 0 && x.points === 0)).toBe(true);
  });

  it('puana, eşitlikte galibiyet sayısına göre sıralanır', () => {
    const rounds = [round([m('a', 'b', 'draw'), m('c', 'd', 'c')]), round([m('a', 'd', 'draw'), m('b', 'c', 'draw')], 2)];
    // a: 1 puan (2 beraberlik), c: 1.5 puan, b: 1 puan, d: 0.5
    expect(calculateStandings(rounds, ['a', 'b', 'c', 'd']).map(x => x.playerId)).toEqual(['c', 'a', 'b', 'd']);
  });
});

describe('Swiss sistemi (11–24 oyuncu)', () => {
  it('ilk tur: herkes eşleşir, tek sayıdaysa bir kişi bay alır', () => {
    const [r1] = generateInitialRound('swiss', ids(11));
    expect(realMatches(r1)).toHaveLength(5);
    const bye = r1.matches.filter(x => x.player2Id === 'BYE');
    expect(bye).toHaveLength(1);
    expect(bye[0]).toMatchObject({ status: 'completed', winnerId: bye[0].player1Id });
  });

  it('sonraki tur puan sırasına göre eşleştirir (lider, en yakın rakiple)', () => {
    const players = ids(12);
    const rounds = generateInitialRound('swiss', players);
    play(rounds[0]);
    const next = generateNextSwissRound(rounds, players);
    const winners = new Set(rounds[0].matches.map(x => x.winnerId));
    // Galipler kendi aralarında eşleşir
    next.slice(0, 3).forEach(x => {
      expect(winners.has(x.player1Id)).toBe(true);
      expect(winners.has(x.player2Id)).toBe(true);
    });
  });

  it.each([11, 12, 16, 20])('%i oyuncu: tur sayısı (≤16 → 4, >16 → 5) ve tekrar eşleşme yok', (n) => {
    const { players, rounds } = runTournament('swiss', n, x => x.player2Id);
    expect(rounds).toHaveLength(n <= 16 ? 4 : 5);
    expect(checkTournamentFinished('swiss', rounds, players)).toBe(true);
    const pairs = rounds.flatMap(r => realMatches(r).map(pairKey));
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it.each([11, 13, 15, 17, 21, 23])('%i oyuncu: aynı oyuncu iki kez bay almaz', (n) => {
    const { rounds } = runTournament('swiss', n, x => x.player2Id);
    const byes = rounds.flatMap(r => r.matches.filter(x => x.player2Id === 'BYE').map(x => x.player1Id));
    expect(byes.length).toBe(rounds.length);
    expect(new Set(byes).size).toBe(byes.length);
  });

  it('bay geçmişi BYE maçlarından okunur', () => {
    const rounds = [round([m('a', 'BYE', 'a'), m('b', 'c', 'b')])];
    expect(collectPlayersWithBye(rounds, ['a', 'b', 'c'])).toEqual(new Set(['a']));
  });
});

describe('Tek eleme (51+ oyuncu)', () => {
  it('kaybeden elenir, tek şampiyon kalana kadar devam eder', () => {
    const { players, rounds } = runTournament('single_elimination', 64);
    expect(rounds).toHaveLength(6); // 64 → 32 → 16 → 8 → 4 → 2 → 1
    const alive = calculateStandings(rounds, players).filter(s => s.losses === 0);
    expect(alive).toHaveLength(1);
    expect(checkTournamentFinished('single_elimination', rounds, players)).toBe(true);
  });

  it('tek sayıda kalan oyuncuda biri bay ile tur atlar', () => {
    const players = ids(52);
    const rounds = generateInitialRound('single_elimination', players);
    play(rounds[0]);
    rounds.push(play(round(generateNextSingleEliminationRound(rounds, players), 2)));
    const r3 = generateNextSingleEliminationRound(rounds, players); // 13 kişi kaldı
    expect(r3.filter(x => x.player2Id === 'BYE')).toHaveLength(1);
    expect(realMatches(round(r3))).toHaveLength(6);
  });

  it('eleme kuralı: 1 mağlubiyet = elenme', () => {
    const st = { playerId: 'a', wins: 3, losses: 1, draws: 0, points: 3, played: 4 };
    expect(shouldEliminatePlayer('single_elimination', st, [])).toBe(true);
    expect(shouldEliminatePlayer('single_elimination', { ...st, losses: 0 }, [])).toBe(false);
  });
});

describe('Çift eleme (25–35 oyuncu)', () => {
  it.each([25, 30, 35])('%i oyuncu: 2 mağlubiyette elenir, tek şampiyonla biter', (n) => {
    const { players, rounds } = runTournament('double_elimination', n);
    expect(checkTournamentFinished('double_elimination', rounds, players)).toBe(true);
    const alive = calculateStandings(rounds, players).filter(s => s.losses + Math.floor(s.draws / 2) < 2);
    expect(alive).toHaveLength(1);
  });

  it('kazananlar ve kaybedenler grubu ayrı eşleşir', () => {
    const players = ids(8);
    const rounds = generateInitialRound('double_elimination', players);
    play(rounds[0]);
    const losers1 = new Set(rounds[0].matches.map(x => x.player2Id));
    generateNextDoubleEliminationRound(rounds, players).filter(x => x.player2Id !== 'BYE').forEach(x => {
      expect(losers1.has(x.player1Id)).toBe(losers1.has(x.player2Id));
    });
  });

  it('büyük final: kazananlar grubunun lideri kaybedenler grubunun lideriyle oynar; kaybederse rövanş', () => {
    const r = [round([m('w', 'l', 'w')]), round([m('l', 'x', 'l'), m('w', 'y', 'w')], 2)];
    // w: 0 mağlubiyet, l: 1 mağlubiyet, x ve y elendi saymak için 2 mağlubiyet ver
    r.push(round([m('x', 'y', 'draw'), m('y', 'x', 'draw')], 3));
    r.push(round([m('w', 'x', 'w'), m('l', 'y', 'l')], 4));
    const gf = generateNextDoubleEliminationRound(r, ['w', 'l', 'x', 'y']);
    expect(gf).toEqual([expect.objectContaining({ id: 'r5_gf', player1Id: 'w', player2Id: 'l' })]);

    r.push(round([{ ...gf[0], winnerId: 'l', status: 'completed' }], 5));
    const reset = generateNextDoubleEliminationRound(r, ['w', 'l', 'x', 'y']);
    expect(reset).toEqual([expect.objectContaining({ id: 'r6_reset' })]);
  });

  it('eleme kuralı: 2 mağlubiyet (2 beraberlik = 1 mağlubiyet)', () => {
    const st = { playerId: 'a', wins: 0, losses: 1, draws: 0, points: 0, played: 1 };
    expect(shouldEliminatePlayer('double_elimination', st, [])).toBe(false);
    expect(shouldEliminatePlayer('double_elimination', { ...st, losses: 2 }, [])).toBe(true);
    expect(shouldEliminatePlayer('double_elimination', { ...st, losses: 1, draws: 2 }, [])).toBe(true);
  });

  it('birleşme turundan sonra herkes tek havuzda eşleşir ve oyuncular tekrarlanmaz', () => {
    const players = ids(26);
    const { rounds } = { rounds: generateInitialRound('double_elimination', players) };
    play(rounds[0]);
    for (let i = 0; i < 3; i++) rounds.push(play(round(generateNextDoubleEliminationRound(rounds, players), rounds.length + 1)));
    const merged = generateNextRoundMatches(
      { format: 'double_elimination', status: 'active', rounds, playerIds: players, createdAt: null, mergeRound: 5 }, rounds, players);
    const everyone = merged.flatMap(x => [x.player1Id, x.player2Id]).filter(x => x !== 'BYE');
    expect(new Set(everyone).size).toBe(everyone.length);
    expect(new Set(everyone)).toEqual(new Set(players));
  });
});

describe('Hybrid (36–50 oyuncu): 4 tur Swiss + ilk 8 eleme', () => {
  function toQuarterFinals(n: number) {
    const players = ids(n);
    const rounds = generateInitialRound('hybrid', players);
    play(rounds[0]);
    while (rounds.length < 4) rounds.push(play(round(generateNextHybridRound(rounds, players), rounds.length + 1)));
    return { players, rounds };
  }

  it('5. turda ilk 8 çeyrek finale çıkar: 1–8, 4–5, 2–7, 3–6', () => {
    const { players, rounds } = toQuarterFinals(40);
    const top8 = calculateStandings(rounds, players).slice(0, 8).map(s => s.playerId);
    const qf = generateNextHybridRound(rounds, players);
    expect(qf.map(x => [x.player1Id, x.player2Id])).toEqual([
      [top8[0], top8[7]], [top8[3], top8[4]], [top8[1], top8[6]], [top8[2], top8[5]],
    ]);
  });

  it('çeyrek final → yarı final → final, 7 turda biter', () => {
    const { players, rounds } = toQuarterFinals(40);
    while (rounds.length < 7) rounds.push(play(round(generateNextHybridRound(rounds, players), rounds.length + 1)));
    expect(rounds[5].matches).toHaveLength(2);
    expect(rounds[6].matches).toHaveLength(1);
    expect(checkTournamentFinished('hybrid', rounds, players)).toBe(true);
  });

  it('eleme turunda kaybeden elenir, Swiss turlarındaki mağlubiyet elemez', () => {
    const swissLoss = [round([m('a', 'b', 'b')])];
    const st = { playerId: 'a', wins: 0, losses: 1, draws: 0, points: 0, played: 1 };
    expect(shouldEliminatePlayer('hybrid', st, swissLoss)).toBe(false);
    const elimLoss = [...Array(4)].map((_, i) => round([], i + 1)).concat(round([m('a', 'b', 'b')], 5));
    expect(shouldEliminatePlayer('hybrid', st, elimLoss)).toBe(true);
  });

  it('Round Robin ve Swiss\'te kimse elenmez', () => {
    const st = { playerId: 'a', wins: 0, losses: 5, draws: 0, points: 0, played: 5 };
    expect(shouldEliminatePlayer('round_robin', st, [])).toBe(false);
    expect(shouldEliminatePlayer('swiss', st, [])).toBe(false);
  });
});

describe('Lichess sonuçlarının turnuvaya işlenmesi', () => {
  const match = { player1Id: 'beyaz', player2Id: 'siyah' };

  it.each([
    [{ status: 'mate', winner: 'white' }, 'beyaz'],
    [{ status: 'resign', winner: 'black' }, 'siyah'],
    [{ status: 'outoftime', winner: 'white' }, 'beyaz'],
    [{ status: 'timeout', winner: 'black' }, 'siyah'],
    [{ status: 'draw', winner: 'Beraberlik' }, 'draw'],
    [{ status: 'stalemate', winner: 'Beraberlik' }, 'draw'],
  ])('%o → %s', (data, expected) => {
    expect(resolveLichessWinner(data, match)).toBe(expected);
  });

  it.each(['created', 'started', undefined])('bitmemiş maç (%s) sonuç üretmez', (status) => {
    expect(resolveLichessWinner({ status }, match)).toBeNull();
  });

  it('süre dolunca: sadece gelen oyuncu hükmen kazanır, ikisi de gelmezse beraberlik', () => {
    expect(resolveForfeit(true, false, match)).toEqual({ winnerId: 'beyaz', reason: 'Hükmen (Siyah Gelmedi)' });
    expect(resolveForfeit(false, true, match)).toEqual({ winnerId: 'siyah', reason: 'Hükmen (Beyaz Gelmedi)' });
    expect(resolveForfeit(undefined, undefined, match)).toEqual({ winnerId: 'draw', reason: 'İkisi de Gelmedi' });
    expect(resolveForfeit(true, true, match)).toBeNull();
  });
});

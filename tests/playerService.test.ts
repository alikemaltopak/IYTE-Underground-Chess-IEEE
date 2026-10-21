import { describe, it, expect, vi, beforeEach } from 'vitest';

// Bellek içi "players" koleksiyonu ile Firestore taklidi
const store = vi.hoisted(() => ({ players: new Map<string, any>() }));
vi.mock('../src/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, name: string) => ({ name }),
  doc: (_db: unknown, _name: string, id: string) => ({ id }),
  where: (field: string, op: string, value: unknown) => ({ field, op, value }),
  query: (_col: unknown, ...filters: any[]) => ({ filters }),
  orderBy: () => ({}),
  serverTimestamp: () => 'SERVER_TS',
  onSnapshot: vi.fn(),
  Timestamp: {},
  getDoc: async (ref: { id: string }) => ({ exists: () => store.players.has(ref.id), data: () => store.players.get(ref.id) }),
  setDoc: async (ref: { id: string }, data: any, opts?: { merge?: boolean }) => {
    store.players.set(ref.id, opts?.merge ? { ...(store.players.get(ref.id) || {}), ...data } : data);
  },
  getDocs: async (q: { filters: { field: string; op: string; value: any }[] }) => {
    const docs = [...store.players.entries()]
      .filter(([, d]) => q.filters.every(f => f.op === 'in' ? f.value.includes(d[f.field]) : d[f.field] === f.value))
      .map(([id, d]) => ({ id, data: () => d }));
    return { docs };
  },
}));

import { savePlayer, isCodenameTaken, isStudentIdTaken, getPlayer } from '../src/services/playerService';

const base = { codename: 'Neon_Raven', studentId: '290201001', archetype: 'TACTICS', email: 'a@std.iyte.edu.tr' };

beforeEach(() => store.players.clear());

describe('Oyuncu kaydı (karakter oluşturma)', () => {
  it('yeni oyuncu "registered" durumunda, kod adı büyük harfle kaydedilir', async () => {
    expect(await savePlayer('u1', base)).toEqual({ success: true });
    expect(await getPlayer('u1')).toMatchObject({
      uid: 'u1', codename: 'NEON_RAVEN', studentId: '290201001', archetype: 'TACTICS', status: 'registered', joinedAt: 'SERVER_TS',
    });
  });

  it('aynı öğrenci numarasıyla ikinci hesap açılamaz', async () => {
    await savePlayer('u1', base);
    expect(await isStudentIdTaken('290201001')).toBe(true);
    expect(await savePlayer('u2', { ...base, codename: 'OTHER' })).toEqual({ success: false, error: expect.stringContaining('öğrenci numarası') });
  });

  it('aynı kod adı (büyük/küçük harf farkıyla bile) ikinci kez alınamaz', async () => {
    await savePlayer('u1', base);
    for (const codename of ['Neon_Raven', 'NEON_RAVEN', 'neon_raven']) {
      const r = await savePlayer('u2', { ...base, codename, studentId: '290201002' });
      expect(r).toEqual({ success: false, error: expect.stringContaining('kullanıcı adı') });
    }
  });

  it('eski (küçük harfle kaydedilmiş) kod adları da çakışma kontrolünde bulunur', async () => {
    store.players.set('legacy', { codename: 'Ghost', studentId: '1' });
    expect(await isCodenameTaken('Ghost')).toBe(true);
  });

  it('kendi kod adını değiştirmeden güncelleyebilir; öğrenci numarası değiştirilemez', async () => {
    await savePlayer('u1', base);
    expect(await savePlayer('u1', { ...base, archetype: 'PLAN MAKING' })).toEqual({ success: true });
    expect((await getPlayer('u1'))!.archetype).toBe('PLAN MAKING');
    expect(await savePlayer('u1', { ...base, studentId: '999999999' })).toEqual({ success: false, error: expect.stringContaining('değiştirilemez') });
  });

  it('başkasının kod adını alacak şekilde güncelleme reddedilir', async () => {
    await savePlayer('u1', base);
    await savePlayer('u2', { ...base, codename: 'SHADOW', studentId: '290201002' });
    expect(await savePlayer('u2', { ...base, studentId: '290201002' })).toEqual({ success: false, error: expect.stringContaining('kullanıcı adı') });
  });
});

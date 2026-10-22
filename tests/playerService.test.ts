import { describe, it, expect, vi, beforeEach } from 'vitest';

// Bellek içi çok koleksiyonlu Firestore taklidi (players, players_private, student_ids)
const store = vi.hoisted(() => ({ cols: new Map<string, Map<string, any>>() }));
const col = (name: string) => {
  if (!store.cols.has(name)) store.cols.set(name, new Map());
  return store.cols.get(name)!;
};
vi.mock('../src/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, name: string) => ({ name }),
  doc: (_db: unknown, name: string, id: string) => ({ name, id }),
  where: (field: string, op: string, value: unknown) => ({ field, op, value }),
  query: (c: { name: string }, ...filters: any[]) => ({ name: c.name, filters }),
  orderBy: () => ({}),
  serverTimestamp: () => 'SERVER_TS',
  onSnapshot: vi.fn(),
  Timestamp: {},
  getDoc: async (ref: { name: string; id: string }) => ({
    exists: () => col(ref.name).has(ref.id), data: () => col(ref.name).get(ref.id),
  }),
  getDocs: async (q: { name: string; filters: { field: string; op: string; value: any }[] }) => {
    const docs = [...col(q.name).entries()]
      .filter(([, d]) => q.filters.every(f => f.op === 'in' ? f.value.includes(d[f.field]) : d[f.field] === f.value))
      .map(([id, d]) => ({ id, data: () => d }));
    return { docs };
  },
  writeBatch: () => {
    const ops: (() => void)[] = [];
    return {
      set: (ref: any, data: any) => ops.push(() => col(ref.name).set(ref.id, data)),
      update: (ref: any, data: any) => ops.push(() => col(ref.name).set(ref.id, { ...col(ref.name).get(ref.id), ...data })),
      commit: async () => ops.forEach(op => op()),
    };
  },
}));

import { savePlayer, isCodenameTaken, isStudentIdTaken, getPlayer } from '../src/services/playerService';

const base = { codename: 'Neon_Raven', studentId: '290201001', archetype: 'TACTICS', email: 'a@std.iyte.edu.tr' };

beforeEach(() => store.cols.clear());

describe('Oyuncu kaydı (karakter oluşturma)', () => {
  it('herkese açık kartta e-posta ve öğrenci no TUTULMAZ; gizli koleksiyona ve rezervasyona yazılır', async () => {
    expect(await savePlayer('u1', base)).toEqual({ success: true });
    const card = col('players').get('u1');
    expect(card).toEqual({ uid: 'u1', codename: 'NEON_RAVEN', archetype: 'TACTICS', joinedAt: 'SERVER_TS', status: 'registered' });
    expect(card).not.toHaveProperty('email');
    expect(card).not.toHaveProperty('studentId');
    expect(col('players_private').get('u1')).toEqual({ email: 'a@std.iyte.edu.tr', studentId: '290201001' });
    expect(col('student_ids').get('290201001')).toEqual({ uid: 'u1' });
  });

  it('oyuncu kendi profilini okurken gizli bilgileri de görür', async () => {
    await savePlayer('u1', base);
    expect(await getPlayer('u1')).toMatchObject({ codename: 'NEON_RAVEN', studentId: '290201001', email: 'a@std.iyte.edu.tr' });
  });

  it('aynı öğrenci numarasıyla ikinci hesap açılamaz (rezervasyon ve eski kayıtlar)', async () => {
    await savePlayer('u1', base);
    expect(await isStudentIdTaken('290201001')).toBe(true);
    expect(await savePlayer('u2', { ...base, codename: 'OTHER' })).toEqual({ success: false, error: expect.stringContaining('öğrenci numarası') });
    col('players').set('legacy', { codename: 'OLD', studentId: '290209999' });
    expect(await isStudentIdTaken('290209999')).toBe(true);
  });

  it('aynı kod adı (büyük/küçük harf farkıyla bile) ikinci kez alınamaz', async () => {
    await savePlayer('u1', base);
    for (const codename of ['Neon_Raven', 'NEON_RAVEN', 'neon_raven']) {
      const r = await savePlayer('u2', { ...base, codename, studentId: '290201002' });
      expect(r).toEqual({ success: false, error: expect.stringContaining('kullanıcı adı') });
    }
  });

  it('eski (küçük harfle kaydedilmiş) kod adları da çakışma kontrolünde bulunur', async () => {
    col('players').set('legacy', { codename: 'Ghost' });
    expect(await isCodenameTaken('Ghost')).toBe(true);
  });

  it('profil güncellemesi sadece kod adı ve arketipi değiştirir; öğrenci numarası değiştirilemez', async () => {
    await savePlayer('u1', base);
    expect(await savePlayer('u1', { ...base, archetype: 'PLAN MAKING' })).toEqual({ success: true });
    expect(col('players').get('u1')).toMatchObject({ archetype: 'PLAN MAKING', status: 'registered' });
    expect(await savePlayer('u1', { ...base, studentId: '999999999' })).toEqual({ success: false, error: expect.stringContaining('değiştirilemez') });
  });

  it('başkasının kod adını alacak şekilde güncelleme reddedilir', async () => {
    await savePlayer('u1', base);
    await savePlayer('u2', { ...base, codename: 'SHADOW', studentId: '290201002' });
    expect(await savePlayer('u2', { ...base, studentId: '290201002' })).toEqual({ success: false, error: expect.stringContaining('kullanıcı adı') });
  });
});

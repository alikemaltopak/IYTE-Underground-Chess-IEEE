import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Gemini SDK'sını taklit ediyoruz: modelin hangi istemle çağrıldığını ve cevabını kontrol ederiz.
const gemini = vi.hoisted(() => ({ generateContent: vi.fn() }));
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({ models: { generateContent: gemini.generateContent } })),
}));

import createMatch from '../api/create-match.js';
import matchResult from '../api/match-result.js';
import verifyCodename from '../api/verify-codename.js';

/** Vercel req/res nesnelerinin minimal taklidi */
function mockRes() {
  const res: any = { statusCode: 200, headers: {}, body: undefined, ended: false };
  res.setHeader = (k: string, v: unknown) => { res.headers[k] = v; return res; };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: unknown) => { res.body = b; return res; };
  res.end = () => { res.ended = true; return res; };
  return res;
}

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  gemini.generateContent.mockReset();
  process.env.GEMINI_API_KEY = 'test-key';
});
afterEach(() => vi.unstubAllGlobals());

describe('POST /api/create-match — Lichess hayalet maç', () => {
  it('10+5 açık meydan okuma oluşturur ve beyaz/siyah linklerini döner', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ id: 'AbC123', urlWhite: 'https://lichess.org/AbC123?color=white', urlBlack: 'https://lichess.org/AbC123?color=black' }) });
    const res = mockRes();
    await createMatch({ method: 'POST' }, res);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://lichess.org/api/challenge/open');
    const body = new URLSearchParams(init.body);
    expect(body.get('clock.limit')).toBe('600');
    expect(body.get('clock.increment')).toBe('5');
    expect(res.body).toEqual({ success: true, matchId: 'AbC123', urlWhite: expect.stringContaining('white'), urlBlack: expect.stringContaining('black') });
  });

  it('Lichess hata dönerse 400 ve başarısız yanıt', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ error: 'rate limited' }) });
    const res = mockRes();
    await createMatch({ method: 'POST' }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('ağ hatasında 500', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNRESET'));
    const res = mockRes();
    await createMatch({ method: 'POST' }, res);
    expect(res.statusCode).toBe(500);
  });

  it('sadece POST kabul eder; OPTIONS (CORS) 200 döner', async () => {
    const get = mockRes();
    await createMatch({ method: 'GET' }, get);
    expect(get.statusCode).toBe(405);
    const opt = mockRes();
    await createMatch({ method: 'OPTIONS' }, opt);
    expect(opt.statusCode).toBe(200);
    expect(opt.ended).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('GET /api/match-result — maç sonucu', () => {
  it('bitmiş maçın durumunu ve kazananını döner', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ status: 'mate', winner: 'white', moves: 'e4 e5' }) });
    const res = mockRes();
    await matchResult({ method: 'GET', query: { matchId: 'AbC123' } }, res);
    expect(fetchMock.mock.calls[0][0]).toBe('https://lichess.org/game/export/AbC123');
    expect(res.body).toEqual({ success: true, status: 'mate', winner: 'white' });
  });

  it('kazanan yoksa "Beraberlik"; full=true ise tüm oyun verisi eklenir', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ status: 'draw', moves: 'e4 e5' }) });
    const res = mockRes();
    await matchResult({ method: 'GET', query: { matchId: 'X', full: 'true' } }, res);
    expect(res.body).toMatchObject({ success: true, status: 'draw', winner: 'Beraberlik', gameData: { moves: 'e4 e5' } });
  });

  it('henüz hamle yapılmamış maç (Lichess 404) "created" sayılır', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });
    const res = mockRes();
    await matchResult({ method: 'GET', query: { matchId: 'X' } }, res);
    expect(res.body).toEqual({ success: true, status: 'created' });
  });

  it('diğer Lichess hataları başarısız döner; matchId yoksa 400', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });
    const res = mockRes();
    await matchResult({ method: 'GET', query: { matchId: 'X' } }, res);
    expect(res.body.success).toBe(false);

    const missing = mockRes();
    await matchResult({ method: 'GET', query: {} }, missing);
    expect(missing.statusCode).toBe(400);
  });
});

describe('POST /api/verify-codename — Neural Gateway (Gemini)', () => {
  const call = async (codename: unknown) => {
    const res = mockRes();
    await verifyCodename({ method: 'POST', body: { codename } }, res);
    return res;
  };

  it('uygun kod adını yapay zeka onayıyla kabul eder', async () => {
    gemini.generateContent.mockResolvedValue({ text: '{"valid": true, "reason": ""}' });
    const res = await call('GHOST_PROTOCOL');
    expect(res.body).toEqual({ valid: true, reason: '' });
    const { contents, config } = gemini.generateContent.mock.calls[0][0];
    expect(contents).toContain('GHOST_PROTOCOL');
    expect(contents).toMatch(/real human names/);
    expect(contents).toMatch(/profanity/);
    expect(config.responseMimeType).toBe('application/json');
  });

  it('yapay zekanın ret gerekçesini kullanıcıya iletir', async () => {
    gemini.generateContent.mockResolvedValue({ text: '{"valid": false, "reason": "Gerçek isim içeriyor."}' });
    expect((await call('Mehmet')).body).toEqual({ valid: false, reason: 'Gerçek isim içeriyor.' });
  });

  it('JSON dışı metin içindeki JSON\'u ayıklar', async () => {
    gemini.generateContent.mockResolvedValue({ text: 'Sonuç: {"valid": false, "reason": "Argo"} tamam' });
    expect((await call('xxxyyy')).body).toEqual({ valid: false, reason: 'Argo' });
  });

  it('boş yanıt veya hata durumunda güvenli tarafta kalır (reddeder, 200 döner)', async () => {
    gemini.generateContent.mockResolvedValue({ text: '' });
    expect((await call('NEON_RAVEN')).body.valid).toBe(false);
    gemini.generateContent.mockRejectedValue(new Error('quota'));
    const res = await call('NEON_RAVEN');
    expect(res.statusCode).toBe(200);
    expect(res.body.valid).toBe(false);
  });

  it('3 karakterden kısa veya sadece rakam olan adları yapay zekaya sormadan reddeder', async () => {
    expect((await call('ab')).body).toEqual({ valid: false, reason: 'Takma ad en az 3 karakter olmalıdır.' });
    expect((await call('12345')).body).toEqual({ valid: false, reason: 'Takma ad sadece rakamlardan oluşamaz.' });
    expect((await call('!!')).body.valid).toBe(false);
    expect(gemini.generateContent).not.toHaveBeenCalled();
  });

  it('boş istek 400; API anahtarı yoksa 500 yapılandırma hatası', async () => {
    expect((await call('')).statusCode).toBe(400);
    delete process.env.GEMINI_API_KEY;
    const res = await call('NEON_RAVEN');
    expect(res.statusCode).toBe(500);
    expect(res.body.valid).toBe(false);
  });
});

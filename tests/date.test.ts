import { describe, it, expect, vi, afterEach } from 'vitest';
import { checkRegistrationClosed, parseDeadline } from '../src/utils/date';

afterEach(() => vi.useRealTimers());

describe('Kayıt kapanışı (6 Haziran 2026 23:59:59, Türkiye saati)', () => {
  it('son günden önce açık, sonrasında kapalı', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-06T23:59:00+03:00'));
    expect(checkRegistrationClosed()).toBe(false);
    vi.setSystemTime(new Date('2026-06-07T00:00:01+03:00'));
    expect(checkRegistrationClosed()).toBe(true);
  });

  it('saat diliminden bağımsız: 20:59 UTC hâlâ açık, 21:00 UTC kapalı', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-06T20:59:58Z'));
    expect(checkRegistrationClosed()).toBe(false);
    vi.setSystemTime(new Date('2026-06-06T21:00:00Z'));
    expect(checkRegistrationClosed()).toBe(true);
  });

  it('turnuva başladıysa veya bittiyse tarih ne olursa olsun kapalı', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T12:00:00+03:00'));
    expect(checkRegistrationClosed('setup')).toBe(false);
    expect(checkRegistrationClosed('active')).toBe(true);
    expect(checkRegistrationClosed('completed')).toBe(true);
  });
});

describe('Maç son giriş zamanı ayrıştırma', () => {
  const ms = Date.UTC(2026, 5, 10, 15, 0, 0);
  it('Firestore Timestamp, {seconds} nesnesi, tarih metni ve sayı desteklenir', () => {
    expect(parseDeadline({ toDate: () => new Date(ms) })).toBe(ms);
    expect(parseDeadline({ seconds: ms / 1000 })).toBe(ms);
    expect(parseDeadline('2026-06-10T15:00:00Z')).toBe(ms);
    expect(parseDeadline(ms)).toBe(ms);
  });
  it('boş veya geçersiz değerde 0 döner (sayfa çökmez)', () => {
    expect(parseDeadline(null)).toBe(0);
    expect(parseDeadline(undefined)).toBe(0);
    expect(parseDeadline('yarın akşam')).toBe(0);
  });
});

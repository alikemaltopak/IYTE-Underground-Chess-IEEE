import { describe, it, expect } from 'vitest';
import { isAdminUser, parseAdminEmails } from '../src/utils/admin';

describe('Admin tespiti (arayüz)', () => {
  const admins = parseAdminEmails(' Ali@Example.com, ikinci@std.iyte.edu.tr ,');
  it('liste virgülle ayrılır, boşluk ve büyük/küçük harf önemsenmez', () => {
    expect(admins).toEqual(['ali@example.com', 'ikinci@std.iyte.edu.tr']);
  });
  it('listedeki DOĞRULANMIŞ e-posta admin sayılır', () => {
    expect(isAdminUser({ email: 'ali@example.com', emailVerified: true }, admins)).toBe(true);
    expect(isAdminUser({ email: 'ALI@example.com', emailVerified: true }, admins)).toBe(true);
  });
  it('doğrulanmamış e-posta, listede olmayan e-posta veya oturumsuz kullanıcı admin değildir', () => {
    expect(isAdminUser({ email: 'ali@example.com', emailVerified: false }, admins)).toBe(false);
    expect(isAdminUser({ email: 'baskasi@example.com', emailVerified: true }, admins)).toBe(false);
    expect(isAdminUser(null, admins)).toBe(false);
  });
});

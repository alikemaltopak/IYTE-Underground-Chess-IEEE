// Admin listesi .env'deki VITE_ADMIN_EMAILS'ten gelir. Arayüzdeki kontrol sadece görünürlük içindir;
// asıl yetki Firestore kuralları (firestore.rules) ve sunucu fonksiyonları (api/) tarafından uygulanır.
export const parseAdminEmails = (raw: string | undefined): string[] =>
  (raw || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

export const ADMIN_EMAILS = parseAdminEmails(import.meta.env.VITE_ADMIN_EMAILS || 'alikemaltopak@gmail.com');

/** Admin sayılmak için e-posta listede olmalı VE doğrulanmış olmalı (başkasının adresiyle açılan hesap admin olamaz). */
export const isAdminUser = (
  user: { email?: string | null; emailVerified?: boolean } | null | undefined,
  admins: string[] = ADMIN_EMAILS
): boolean => !!(user?.email && user.emailVerified && admins.includes(user.email.toLowerCase()));

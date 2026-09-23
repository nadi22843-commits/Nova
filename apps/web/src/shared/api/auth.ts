import { apiRequest, writeToken } from './client';

/**
 * Вход по телефону и одноразовому коду — так работает серверная часть.
 * Пароля нет: код приходит в SMS, при разработке печатается в журнал API.
 */

export type ApiUser = { id: string; name: string | null; phone: string; countryCode: string };

/** Телефон в вид +79991234567. null — номер не похож на телефон. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  const normalized = digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
  return `+${normalized}`;
}

export async function requestCode(phone: string): Promise<{ expiresInMinutes: number }> {
  const data = await apiRequest<{ ok: boolean; expiresInMinutes: number }>('/auth/request-code', {
    method: 'POST',
    body: { phone },
  });
  return { expiresInMinutes: data.expiresInMinutes ?? 5 };
}

export async function verifyCode(phone: string, code: string, country?: string): Promise<{ token: string; user: ApiUser }> {
  const data = await apiRequest<{ token: string; user: ApiUser }>('/auth/verify', {
    method: 'POST',
    body: { phone, code, country },
  });
  writeToken(data.token);
  return data;
}

export async function logoutOnServer(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST', auth: true });
  } catch {
    // Выход на устройстве важнее ответа сервера: токен всё равно стираем.
  }
  writeToken('');
}

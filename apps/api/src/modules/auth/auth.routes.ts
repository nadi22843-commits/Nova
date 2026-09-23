import { Router } from 'express';
import { z } from 'zod';
import { randomBytes, randomInt, createHash, timingSafeEqual } from 'node:crypto';
import { query } from '../../db/pool.js';
import { hashToken } from './auth.middleware.js';

/**
 * Вход по телефону.
 *
 * Одноразовый код вместо пароля: на досках объявлений так входят везде,
 * и это снимает целый класс проблем — забытые пароли, слабые пароли,
 * переиспользование пароля с другого сайта.
 */

export const authRouter = Router();

const CODE_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const SESSION_DAYS = 90;

/** Телефон приводится к E.164: +79991234567. */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  // Российские номера часто вводят через 8 — приводим к +7.
  const normalized = digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
  return `+${normalized}`;
}

function hashCode(code: string, phone: string): string {
  // Телефон в хеше как соль: одинаковые коды у разных людей дают разные хеши.
  return createHash('sha256').update(`${phone}:${code}`).digest('hex');
}

/** Запрос кода. */
authRouter.post('/request-code', async (req, res) => {
  const parsed = z.object({ phone: z.string().min(10).max(20) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'bad_phone' });

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return res.status(400).json({ error: 'bad_phone' });

  try {
    // Ограничение частоты: без него номер можно завалить сообщениями,
    // а счёт за SMS выставят вам.
    const recent = await query<{ count: number }>(
      `SELECT count(*)::int AS count FROM auth_codes
       WHERE phone = $1 AND created_at > now() - interval '1 hour'`,
      [phone],
    );
    if ((recent[0]?.count ?? 0) >= 5) {
      return res.status(429).json({ error: 'too_many_requests' });
    }

    // Криптостойкий генератор: Math.random предсказуем.
    const code = String(randomInt(100000, 1000000));

    await query(
      `INSERT INTO auth_codes (phone, code_hash, expires_at)
       VALUES ($1, $2, now() + interval '${CODE_TTL_MINUTES} minutes')`,
      [phone, hashCode(code, phone)],
    );

    // Отправка SMS подключается провайдером. Пока код печатается в журнал,
    // чтобы можно было войти при разработке.
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[Nova/auth] код для ${phone}: ${code}`);
    }

    res.json({ ok: true, expiresInMinutes: CODE_TTL_MINUTES });
  } catch (error) {
    console.error('[Nova/auth] код не отправлен', error);
    res.status(500).json({ error: 'internal' });
  }
});

/** Проверка кода и выдача сессии. */
authRouter.post('/verify', async (req, res) => {
  const parsed = z
    .object({
      phone: z.string().min(10).max(20),
      code: z.string().length(6),
      country: z.string().length(2).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'bad_request' });

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return res.status(400).json({ error: 'bad_phone' });

  try {
    const rows = await query<{ id: string; code_hash: string; attempts: number }>(
      `SELECT id, code_hash, attempts FROM auth_codes
       WHERE phone = $1 AND used_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC LIMIT 1`,
      [phone],
    );

    const record = rows[0];
    if (!record) return res.status(400).json({ error: 'code_expired' });

    if (record.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'too_many_attempts' });
    }

    // Сравнение постоянного времени: обычное сравнение строк по времени
    // ответа подсказывает, сколько первых символов угаданы.
    const expected = Buffer.from(record.code_hash, 'hex');
    const actual = Buffer.from(hashCode(parsed.data.code, phone), 'hex');
    const matches = expected.length === actual.length && timingSafeEqual(expected, actual);

    if (!matches) {
      await query('UPDATE auth_codes SET attempts = attempts + 1 WHERE id = $1', [record.id]);
      return res.status(400).json({ error: 'wrong_code' });
    }

    await query('UPDATE auth_codes SET used_at = now() WHERE id = $1', [record.id]);

    // Пользователь создаётся при первом входе — отдельной регистрации нет.
    const users = await query<{ id: string; name: string | null; country_code: string }>(
      `INSERT INTO users (phone, country_code)
       VALUES ($1, $2)
       ON CONFLICT (phone) DO UPDATE SET last_seen_at = now()
       RETURNING id, name, country_code`,
      [phone, /^[A-Za-z]{2}$/.test(parsed.data.country ?? '') ? parsed.data.country!.toUpperCase() : 'RU'],
    );
    const user = users[0];
    if (!user) return res.status(500).json({ error: 'internal' });

    const token = randomBytes(32).toString('base64url');
    await query(
      `INSERT INTO sessions (user_id, token_hash, device, ip, expires_at)
       VALUES ($1, $2, $3, $4, now() + interval '${SESSION_DAYS} days')`,
      [user.id, hashToken(token), req.headers['user-agent'] ?? null, req.ip ?? null],
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, phone, countryCode: user.country_code },
    });
  } catch (error) {
    console.error('[Nova/auth] вход не выполнен', error);
    res.status(500).json({ error: 'internal' });
  }
});

/** Выход. */
authRouter.post('/logout', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.json({ ok: true });

  try {
    await query('UPDATE sessions SET revoked_at = now() WHERE token_hash = $1', [
      hashToken(header.slice(7).trim()),
    ]);
  } catch (error) {
    console.error('[Nova/auth] выход не выполнен', error);
  }
  res.json({ ok: true });
});

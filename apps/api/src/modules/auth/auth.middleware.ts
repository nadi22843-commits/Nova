import type { Request, Response, NextFunction } from 'express';
import { createHash } from 'node:crypto';
import { query } from '../../db/pool.js';

/**
 * Проверка сессии.
 *
 * Токен приходит в заголовке Authorization. В базе лежит его хеш, а не сам
 * токен: утечка базы не должна давать возможность войти под чужим аккаунтом.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function resolveUser(req: Request): Promise<string | undefined> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;

  const token = header.slice(7).trim();
  if (!token) return undefined;

  const rows = await query<{ user_id: string }>(
    `SELECT user_id FROM sessions
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
    [hashToken(token)],
  );

  return rows[0]?.user_id;
}

/** Пускает только с действующей сессией. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await resolveUser(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    req.userId = userId;
    next();
  } catch (error) {
    console.error('[Nova/auth] проверка сессии не удалась', error);
    res.status(500).json({ error: 'internal' });
  }
}

/**
 * Пускает всех, но узнаёт вошедших.
 * Нужно там, где ответ зависит от того, кто смотрит: автор видит свой
 * черновик, остальные — нет.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    req.userId = await resolveUser(req);
  } catch {
    // Ошибка проверки не должна закрывать доступ к публичному списку.
  }
  next();
}

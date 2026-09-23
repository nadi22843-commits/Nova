import pg from 'pg';

/**
 * Подключение к PostgreSQL.
 *
 * Пул, а не отдельные соединения: открытие соединения к Postgres стоит
 * десятки миллисекунд, и на каждый запрос это непозволительно.
 *
 * Настройки берутся из переменных окружения — в коде не должно быть ни
 * адресов, ни паролей: репозиторий рано или поздно окажется не только у вас.
 */

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Больше 20 соединений одному процессу не нужно: Postgres сам плохо
  // переносит сотни параллельных сессий, узким местом станет он.
  max: Number(process.env.DB_POOL_MAX ?? 20),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (error) => {
  // Соединение может умереть в простое — например, база перезапустилась.
  // Пул сам заменит его, ронять процесс из-за этого не нужно.
  console.error('[Nova/db] ошибка простаивающего соединения', error);
});

/** Запрос с типизированным результатом. */
export async function query<T = unknown>(text: string, params: unknown[] = []): Promise<T[]> {
  const started = Date.now();
  try {
    const result = await pool.query(text, params);
    const ms = Date.now() - started;
    // Медленные запросы видно сразу, а не когда пользователи начнут жаловаться.
    if (ms > 200) console.warn(`[Nova/db] медленный запрос ${ms} мс: ${text.slice(0, 90)}`);
    return result.rows as T[];
  } catch (error) {
    console.error('[Nova/db] запрос не выполнен:', text.slice(0, 120), error);
    throw error;
  }
}

/** Транзакция: либо всё, либо ничего. */
export async function transaction<T>(fn: (q: typeof query) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Обычная функция, а не стрелочная: дженерик в стрелочной функции
    // неоднозначно разбирается там, где включён JSX.
    async function scoped<R>(text: string, params: unknown[] = []): Promise<R[]> {
      const result = await client.query(text, params);
      return result.rows as R[];
    }
    const value = await fn(scoped as typeof query);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    // Сбой самого ROLLBACK (оборванное соединение) не должен скрывать исходную ошибку.
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/** Проверка доступности базы — для /health и для старта. */
export async function checkDatabase(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Загрузка .env до всех остальных модулей.
 *
 * Пул соединений читает DATABASE_URL в момент импорта, поэтому этот файл
 * импортируется первым в index.ts. Раньше .env не читался вовсе, и API
 * при запуске сообщал «база недоступна», даже если файл был заполнен.
 *
 * Используется встроенный process.loadEnvFile (Node 20.12+ / 21.7+).
 * Переменные, уже заданные в окружении, не перезаписываются.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const candidates = [resolve(process.cwd(), '.env'), resolve(process.cwd(), 'apps/api/.env')];

for (const file of candidates) {
  if (!existsSync(file)) continue;
  try {
    const loader = (process as unknown as { loadEnvFile?: (path: string) => void }).loadEnvFile;
    if (loader) {
      loader(file);
    } else {
      console.warn('[Nova/env] Node без process.loadEnvFile — обновите Node до 20.12+ или задайте переменные окружения вручную');
    }
  } catch (error) {
    console.error(`[Nova/env] не удалось прочитать ${file}`, error);
  }
  break;
}

if (!process.env.DATABASE_URL) {
  console.warn('[Nova/env] DATABASE_URL не задан — скопируйте .env.example в .env');
}

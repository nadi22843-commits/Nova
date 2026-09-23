// Первым: переменные окружения нужны пулу БД уже в момент импорта.
import './env.js';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './app/routes.js';
import { checkDatabase } from './db/pool.js';
import { UPLOAD_DIR } from './modules/uploads/uploads.routes.js';

/**
 * Точка входа Nova API.
 */

const app = express();

// Без CORS_ORIGIN разрешаем только локальный Vite: «любой origin + credentials»
// открывал API для запросов с чужих сайтов от имени пользователя.
const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({ origin: corsOrigins, credentials: true }));
// Ограничение размера тела: без него можно положить процесс одним запросом.
app.use(express.json({ limit: '1mb' }));

// Фото объявлений: то, что записал multer в uploads.routes.ts, отдаём по
// тому же /media/<key>, который уже был в форме ответа listings.routes.ts.
app.use('/media', express.static(UPLOAD_DIR));

/**
 * Проверка живости. Балансировщик и мониторинг стучатся сюда, поэтому
 * ответ должен быть дешёвым и честным: если база недоступна, сервис
 * не готов принимать запросы, даже если сам процесс жив.
 */
app.get('/health', async (_req, res) => {
  const db = await checkDatabase();
  res.status(db ? 200 : 503).json({ status: db ? 'ok' : 'degraded', database: db });
});

registerRoutes(app);

// Неизвестный адрес API — JSON 404, а не HTML-страница Express.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// Ошибки, до которых не добрался ни один обработчик. Наружу уходит общее
// сообщение: подробности ошибки — подсказка для того, кто ищет уязвимости.
app.use((error: Error & { type?: string; status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Битый JSON или слишком большое тело — ошибка клиента, а не сервера.
  if (error.type === 'entity.parse.failed') return void res.status(400).json({ error: 'bad_json' });
  if (error.type === 'entity.too.large') return void res.status(413).json({ error: 'too_large' });
  console.error('[Nova/api] необработанная ошибка', error);
  res.status(500).json({ error: 'internal' });
});

const port = Number(process.env.PORT ?? 3001);

const server = app.listen(port, async () => {
  const db = await checkDatabase();
  console.log(`Nova API: http://localhost:${port}`);
  if (!db) {
    console.warn('[Nova/api] база недоступна — проверьте DATABASE_URL');
  }
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[Nova/api] порт ${port} занят — остановите другой процесс или задайте PORT в .env`);
  } else {
    console.error('[Nova/api] сервер не запустился', error);
  }
  process.exit(1);
});

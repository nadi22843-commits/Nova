import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { requireAuth } from '../auth/auth.middleware.js';

/**
 * Фото объявлений.
 *
 * Раньше `photoKeys`/`/media/<key>` были придуманы в форме ответа
 * (`listings.routes.ts`), но ничего в проекте их не заполняло и не отдавало:
 * выбранное на публикации фото уходило только в base64 для автономного
 * (localStorage) режима, а в серверном молча терялось. Здесь — недостающая
 * половина: реальная запись на диск и раздача по тому же адресу.
 */

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  // Имя файла — из содержимого запроса никогда: это позволило бы записать
  // что угодно поверх чужого файла или выйти за пределы каталога.
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${MIME_EXT[file.mimetype] ?? ''}`),
});

const upload = multer({
  storage,
  // Тот же лимит, что фронтенд показывает в подсказке «до 900 КБ» — иначе
  // ограничение на одной стороне ничего не значит.
  limits: { fileSize: 900 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!MIME_EXT[file.mimetype]) return cb(new Error('bad_type'));
    cb(null, true);
  },
});

export const uploadsRouter = Router();

uploadsRouter.post('/', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) {
      const code =
        err instanceof Error && err.message === 'bad_type' ? 'bad_type'
        : err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE' ? 'too_large'
        : 'upload_failed';
      return res.status(400).json({ error: code });
    }
    if (!req.file) return res.status(400).json({ error: 'no_file' });
    res.status(201).json({ key: req.file.filename });
  });
});

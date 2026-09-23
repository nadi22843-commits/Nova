import { Router } from 'express';
export const searchRouter = Router();
searchRouter.get('/', (_req, res) => res.json({ module: 'search', ok: true }));

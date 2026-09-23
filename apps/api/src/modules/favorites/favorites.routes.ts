import { Router } from 'express';
export const favoritesRouter = Router();
favoritesRouter.get('/', (_req, res) => res.json({ module: 'favorites', ok: true }));

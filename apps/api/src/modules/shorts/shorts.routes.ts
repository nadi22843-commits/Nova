import { Router } from 'express';
export const shortsRouter = Router();
shortsRouter.get('/', (_req, res) => res.json({ module: 'shorts', ok: true }));

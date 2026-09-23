import { Router } from 'express';
export const supportRouter = Router();
supportRouter.get('/', (_req, res) => res.json({ module: 'support', ok: true }));

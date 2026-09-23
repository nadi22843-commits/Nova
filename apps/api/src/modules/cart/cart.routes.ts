import { Router } from 'express';
export const cartRouter = Router();
cartRouter.get('/', (_req, res) => res.json({ module: 'cart', ok: true }));

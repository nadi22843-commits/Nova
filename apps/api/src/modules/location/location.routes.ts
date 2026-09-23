import { Router } from 'express';
export const locationRouter = Router();
locationRouter.get('/', (_req, res) => res.json({ module: 'location', ok: true }));

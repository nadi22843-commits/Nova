import type { Express } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { listingsRouter } from '../modules/listings/listings.routes.js';
import { searchRouter } from '../modules/search/search.routes.js';
import { favoritesRouter } from '../modules/favorites/favorites.routes.js';
import { cartRouter } from '../modules/cart/cart.routes.js';
import { shortsRouter } from '../modules/shorts/shorts.routes.js';
import { supportRouter } from '../modules/support/support.routes.js';
import { locationRouter } from '../modules/location/location.routes.js';
import { uploadsRouter } from '../modules/uploads/uploads.routes.js';
export function registerRoutes(app: Express) {
  app.get('/api/health', (_req,res)=>res.json({ok:true,service:'nova-api'}));
  app.use('/api/auth', authRouter);
  app.use('/api/listings', listingsRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/favorites', favoritesRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/shorts', shortsRouter);
  app.use('/api/support', supportRouter);
  app.use('/api/location', locationRouter);
  app.use('/api/uploads', uploadsRouter);
}

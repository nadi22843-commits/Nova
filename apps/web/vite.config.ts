import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * Общее ядро подключено псевдонимом, а не скопировано.
 * Логика существует в одном экземпляре: правка в packages/core сразу видна
 * и в вебе, и в мобильном приложении.
 */
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  resolve: {
    alias: {
      '@nova/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
    },
  },
});

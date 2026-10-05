import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wonderKeys: resolve(__dirname, 'wonder-keys.html'),
        babyGame: resolve(__dirname, 'baby-game.html'),
        piano: resolve(__dirname, 'piano.html')
      }
    }
  }
});

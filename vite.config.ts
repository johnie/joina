import path from 'node:path';
import { cloudflare } from '@cloudflare/vite-plugin';
import contentCollections from '@content-collections/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import gitShaPlugin from './vite.git-sha';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    cloudflare(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    contentCollections(),
    tailwindcss(),
    gitShaPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});

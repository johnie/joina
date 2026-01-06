import path from 'node:path';
import { cloudflare } from '@cloudflare/vite-plugin';
import contentCollections from '@content-collections/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { jsonLdData } from './json-ld.config';
import buildTimePlugin from './vite.build-time';
import gitShaPlugin from './vite.git-sha';
import jsonLdPlugin from './vite.json-ld';

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
    buildTimePlugin(),
    jsonLdPlugin({ data: jsonLdData }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
    cssMinify: 'lightningcss',
  },
});

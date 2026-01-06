import type { Plugin } from 'vite';

/**
 * Vite plugin to inject build timestamp into the application
 *
 * @example
 * ```ts
 * import buildTimePlugin from './vite.build-time';
 *
 * export default defineConfig({
 *   plugins: [buildTimePlugin()]
 * });
 * ```
 *
 * Access in your app:
 * ```ts
 * const buildTime = import.meta.env.VITE_BUILD_TIME; // "2025-01-06"
 * ```
 */
export default function buildTimePlugin(): Plugin {
  const buildTime = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  return {
    name: 'vite-plugin-build-time',
    config() {
      return {
        define: {
          'import.meta.env.VITE_BUILD_TIME': JSON.stringify(buildTime),
        },
      };
    },
  };
}

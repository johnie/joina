import type { Thing, WithContext } from 'schema-dts';
import type { Plugin } from 'vite';

export interface JsonLdPluginOptions {
  /**
   * JSON-LD structured data to inject
   * Can be a single schema or an array of schemas
   */
  data: WithContext<Thing> | WithContext<Thing>[];
  /**
   * Where to inject the script tag in the HTML
   * @default 'head-prepend'
   */
  injectTo?: 'head' | 'head-prepend' | 'body' | 'body-prepend';
  /**
   * Minify the JSON output
   * @default true in production, false in development
   */
  minify?: boolean;
}

/**
 * Vite plugin to inject JSON-LD structured data into index.html
 *
 * @example
 * ```ts
 * import jsonLdPlugin from './vite.json-ld';
 * import { jsonLdData } from './json-ld.config';
 *
 * export default defineConfig({
 *   plugins: [
 *     jsonLdPlugin({ data: jsonLdData })
 *   ]
 * });
 * ```
 */
export default function jsonLdPlugin(options: JsonLdPluginOptions): Plugin {
  const {
    data,
    injectTo = 'head-prepend',
    minify = process.env.NODE_ENV === 'production',
  } = options;

  // Normalize data to array
  const schemas = Array.isArray(data) ? data : [data];

  return {
    name: 'vite-plugin-json-ld',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        // Generate script tags for each schema
        const scriptTags = schemas
          .map((schema) => {
            const json = minify
              ? JSON.stringify(schema)
              : JSON.stringify(schema, null, 2);

            return `    <script type="application/ld+json">\n    ${minify ? json : json.split('\n').join('\n    ')}\n    </script>`;
          })
          .join('\n');

        // Inject based on the injectTo option
        switch (injectTo) {
          case 'head':
            return html.replace('</head>', `${scriptTags}\n  </head>`);
          case 'head-prepend':
            return html.replace(
              '<head>',
              `<head>\n${scriptTags
                .split('\n')
                .map((line) => (line ? `  ${line}` : line))
                .join('\n')}`,
            );
          case 'body':
            return html.replace('</body>', `${scriptTags}\n  </body>`);
          case 'body-prepend':
            return html.replace('<body', `${scriptTags}\n  <body`);
          default:
            return html;
        }
      },
    },
  };
}

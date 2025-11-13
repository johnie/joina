# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **hybrid full-stack application** combining a React 19 SPA frontend with a Hono API backend, all deployed to Cloudflare Workers. The project uses:
- **Vite (Rolldown variant)**: Custom Vite fork optimized with Rolldown bundler (`npm:rolldown-vite@7.2.2`)
- **Cloudflare Vite Plugin**: Handles building and bundling both client and worker in a single command
- **React 19 with React Compiler**: Automatic optimization of React components
- **Hono**: Ultrafast web framework for Cloudflare Workers (API backend)
- **Content Collections**: Type-safe MDX and YAML content management with `.content-collections/generated` imports
- **Tailwind CSS v4**: Using the new Vite plugin architecture
- **shadcn/ui**: Component library (New York style) with Radix UI primitives
- **TanStack Form**: Form state management and validation
- **Biome**: For linting and formatting (replacing ESLint/Prettier)
- **Cloudflare Workers**: Deployment target via Wrangler
- **pnpm**: Package manager (use pnpm, not npm or yarn)

## Development Commands

```bash
# Start React dev server with HMR
pnpm dev

# Start Cloudflare Worker dev server (includes React app + API)
pnpm dev:server

# Type-check and build for production (builds both client and server)
pnpm build

# Preview production build locally (automatically runs build first)
pnpm preview

# Deploy to Cloudflare Workers (automatically runs build first)
pnpm deploy

# Run Biome formatter and linter (auto-fix with --unsafe flag)
pnpm biome:fix
```

## Architecture

### Content Management System
The project uses `@content-collections` for type-safe content management:

1. **Configuration**: `content-collections.ts` defines two collections with Zod schemas:
   - **Pages Collection** (`pages`)
     - Content directory: `src/content/pages/`
     - Format: MDX files (`*.mdx`)
     - Schema: `title`, `summary`, `content`
     - MDX compilation with rehype plugins:
       - `rehypeUnwrapImages`: Unwraps images from paragraph tags
       - `rehypeImageToolkit`: Enhances image processing capabilities
   - **Q&A Collection** (`qna`)
     - Content directory: `src/content/qna/`
     - Format: YAML files (`*.yaml`)
     - Schema: `title`, `answer`, `order`

2. **Generated Types**: Content Collections generates TypeScript types at `.content-collections/generated`
   - Import pages: `import { allPages } from 'content-collections'`
   - Import Q&A: `import { allQna } from 'content-collections'`
   - Path alias configured in tsconfig: `"content-collections": ["./.content-collections/generated"]`

3. **Usage Pattern**: See `src/App.tsx` for reference
   - Import pages collection: `import { allPages } from 'content-collections'`
   - Find specific page: `allPages.find((page) => page._meta.fileName === 'index.mdx')`
   - Render with: `<MDXContent code={page.mdx} />`

### Path Aliases
The following path aliases are configured in both `tsconfig.json` and `components.json`:
- `@/*` maps to `src/*` for cleaner imports
- `content-collections` maps to `.content-collections/generated`
- Additional shadcn/ui aliases: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`

### TypeScript Configuration
The project uses composite TypeScript configs:
- `tsconfig.json`: Base config with references
- `tsconfig.app.json`: React app config (strict mode enabled)
- `tsconfig.node.json`: Node/config files (Vite config, etc.)
- `tsconfig.worker.json`: Cloudflare Workers (includes `src/server/**/*`)

### Code Formatting Rules (Biome)
- **JavaScript/TypeScript**: 2 spaces, single quotes, 80 char line width
- **JSON**: 4 space indentation (tabs for other files)
- **Import organization**: Automatic with Biome assist
- Run `pnpm biome:fix` before committing

### React Compiler Notes
- Enabled via `babel-plugin-react-compiler`
- Automatically optimizes component re-renders
- May impact dev/build performance
- Configured in `vite.config.ts`

### UI Components (shadcn/ui)
The project uses shadcn/ui components configured with:
- **Style**: New York variant
- **Base color**: Stone
- **Icon library**: Lucide React
- **CSS variables**: Enabled for theming
- Components are in `src/components/ui/`
- Utility functions in `src/lib/utils.ts` (includes `cn` helper using `clsx` + `tailwind-merge`)

### Form Handling
Forms use **TanStack Form** (`@tanstack/react-form`) with:
- Field-level validation using Zod schemas
- Real-time validation on `onChange` events
- Type-safe form state management
- Example: `src/components/application-modal.tsx`

### Custom Vite Plugins
- **Git SHA Plugin** (`vite.git-sha.ts`): Injects git commit information into the build
  - Exposes `import.meta.env.VITE_GIT_SHA` (short commit hash)
  - Exposes `import.meta.env.VITE_GIT_SHA_URL` (GitHub commit URL)
  - Used for deployment tracking and version display
- **JSON-LD Plugin** (`vite.json-ld.ts`): Injects structured data for SEO
  - Reads schema definitions from `json-ld.config.ts`
  - Automatically injects `<script type="application/ld+json">` tags into `index.html`
  - Configured with JobPosting schema for Google Jobs integration
  - Minified in production, formatted in development

## Adding New Content

### Adding MDX Pages
1. Create MDX file in `src/content/pages/` directory
2. Include frontmatter with required fields:
   ```mdx
   ---
   title: "Page Title"
   summary: "Brief description"
   content: "Content description"
   ---

   # Content here
   ```
3. Content Collections will auto-generate types on next dev/build
4. Access via `allPages` import from `content-collections`

### Adding Q&A Items
1. Create YAML file in `src/content/qna/` directory
2. Include required fields:
   ```yaml
   title: "Question title"
   answer: "Answer text"
   order: 1
   ```
3. Access via `allQna` import from `content-collections`

### MDX Image Syntax
Images in MDX support custom styling via the title attribute:
```mdx
![Alt text](url 'optional-title > .class1 .class2 .class3')
```
Example: `![Photo](image.jpg '> .max-w-full .md:w-100vw .rounded-lg')`

The rehype plugins (`rehypeUnwrapImages`, `rehypeImageToolkit`) process these automatically.

## API Architecture

The project uses a **hybrid architecture** with both a static React SPA and a Hono-based API running on Cloudflare Workers:

### Server Structure
- **Location**: `src/server/`
- **Framework**: Hono (lightweight web framework)
- **Entry Point**: `src/server/index.ts`
- **Routes**: `src/server/routes/`
- **Middleware**: Environment-aware CORS and logging for `/api/*` routes
- **Types**: `src/server/types/bindings.ts` - Shared Cloudflare Workers environment bindings

### Cloudflare Bindings
The worker has access to the following environment bindings (defined in `src/server/types/bindings.ts`):
- **R2 Bucket**: `c.env.BUCKET` (configured in `wrangler.jsonc`)
  - Production bucket: `joina`
  - Preview bucket: `joina-bucket-preview`
- **KV Namespace**: `c.env.RATE_LIMIT_KV` - Key-value storage for rate limiting
  - Production: `40f8365cd1e5483db2dc03f751dc572f`
  - Preview: `c33582a11d82457d91f2c8800cb8655f`
- **PRODUCTION_URL**: `c.env.PRODUCTION_URL` - Production domain for CORS validation
- **ENVIRONMENT**: `c.env.ENVIRONMENT` - Optional environment indicator

### CORS Security
The API implements **environment-aware CORS protection** (configured inline in `src/server/index.ts`):

**Local Development**:
- Allows requests from **any origin** (`*`)
- Auto-detected via `process.env.NODE_ENV === 'development'` or `process.env.WRANGLER_DEV === 'true'`

**Production**:
- Only allows requests from the production domain
- Configured via `PRODUCTION_URL` in `wrangler.jsonc` (defaults to `https://joina.pages.dev`)

Update the production URL in `wrangler.jsonc`:
```jsonc
"vars": {
  "PRODUCTION_URL": "https://your-domain.com"
}
```

### Request Handling
1. **API Routes** (`/api/*`): Handled by Hono server
   - Routes run before static assets (`run_worker_first: ["/api/*", "/sitemap.xml", "/robots.txt"]`)
   - `GET /api/health`: Health check endpoint
   - `POST /api/upload`: Job application submission with file uploads to R2 (rate limited)
2. **SEO Routes**: Server-rendered for crawlers
   - `GET /sitemap.xml`: Dynamic sitemap generation based on site config (`src/server/routes/sitemap.ts`)
   - `GET /robots.txt`: Dynamic robots.txt with sitemap reference (`src/server/routes/robots.ts`)
3. **Static Assets**: All other routes serve the React SPA via SPA routing

### Build Process
The build command (`pnpm build`) uses the **Cloudflare Vite plugin** to automatically build both client and server:
- A single `vite build` command produces two outputs:
  - **Client Build**: React SPA → `dist/client/`
  - **Worker Build**: Hono worker → `dist/joina/`
- The Cloudflare plugin handles all Worker bundling automatically
- No separate Vite config needed for the server

### Deployment Configuration
- **Wrangler Config**: `wrangler.jsonc`
  - `main`: Points to source file `./src/server/index.ts`
  - `compatibility_flags`: `["nodejs_compat"]` enabled
  - `assets.not_found_handling`: "single-page-application" (SPA routing)
  - `assets.run_worker_first`: API routes run before static assets
  - **Observability**: Full logging enabled with head sampling
- The Cloudflare Vite plugin automatically generates an output `wrangler.json` in `dist/joina/`

### Adding New API Endpoints
1. Create a new route file in `src/server/routes/`
2. Import the shared `Bindings` type from `src/server/types/bindings.ts`
3. Define your endpoints using Hono's router with typed bindings:
   ```typescript
   import type { Bindings } from '../types/bindings';

   const myRoute = new Hono<{ Bindings: Bindings }>();
   ```
3. Import and mount the route in `src/server/index.ts` using `app.route()`
4. Example:
   ```typescript
   // src/server/routes/example.ts
   import { Hono } from 'hono';

   type Bindings = {
     BUCKET: R2Bucket;
   };

   export const exampleRoutes = new Hono<{ Bindings: Bindings }>();

   exampleRoutes.get('/', (c) => {
     return c.json({ message: 'Hello from API' });
   });

   // src/server/index.ts
   import { exampleRoutes } from './routes/example';
   app.route('/api/example', exampleRoutes);
   ```

### Rate Limiting
The project implements IP-based rate limiting using Cloudflare KV:
- **Middleware**: `src/server/middleware/rate-limit.ts`
- **Storage**: Uses `RATE_LIMIT_KV` namespace for tracking request counts
- **Configuration**: Customizable per route (max requests, time window, custom messages)
- **Headers**: Returns standard rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- **Usage**: Applied to `/api/upload` endpoint (3 requests per hour per IP)
- **IP Detection**: Reads from `x-forwarded-for` header (Cloudflare Workers standard)

### File Upload Handling
The `/api/upload` endpoint demonstrates best practices:
- **Validation**: Uses `@hono/zod-validator` for form validation
- **File validation**: Type and size checks before upload
- **R2 Storage**: Files organized in timestamped folders with metadata JSON
- **JSON:API format**: Error and success responses follow JSON:API specification
- **Constants**: Upload limits and messages centralized in `src/server/constants/upload`
- **Utils**: Reusable JSON:API response helpers in `src/server/utils/jsonapi`

### Shared Configuration
The project uses a centralized configuration pattern in `src/config/`:
- **api.ts**: API endpoints and HTTP constants (exported via barrel file)
- **env.ts**: Environment detection helpers (`isDevelopment`, etc.)
- **site.ts**: Site metadata and constants
- **validation.ts**: Shared validation messages and file upload constants
- **index.ts**: Barrel file re-exporting all configs for clean imports

## Deployment

The project deploys to Cloudflare Workers with static assets:
- The Cloudflare Vite plugin builds both client and worker in a single `vite build` command
- Client build artifacts go to `dist/client/`
- Worker build artifacts go to `dist/joina/` (includes auto-generated `wrangler.json`)
- Wrangler automatically uses the output `wrangler.json` for deployment
- API routes (`/api/*`) are handled by the Cloudflare Worker
- All other routes serve the React SPA with SPA routing enabled
- Full observability with Cloudflare logs enabled

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **hybrid full-stack application** combining a React 19 SPA frontend with a Hono API backend, all deployed to Cloudflare Workers. The project uses:
- **Vite (Rolldown variant)**: Custom Vite fork optimized with Rolldown bundler (`npm:rolldown-vite@7.1.20`)
- **Cloudflare Vite Plugin**: Handles building and bundling both client and worker in a single command
- **React 19 with React Compiler**: Automatic optimization of React components
- **Hono**: Ultrafast web framework for Cloudflare Workers (API backend)
- **Content Collections**: Type-safe MDX content management with `.content-collections/generated` imports
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
The project uses `@content-collections` for type-safe MDX content:

1. **Configuration**: `content-collections.ts` defines collections with Zod schemas
   - Currently configured with `pages` collection
   - Content directory: `src/pages/`
   - Schema includes: `title`, `summary`, `content`
   - MDX compilation handled automatically via `compileMDX` with rehype plugins:
     - `rehypeUnwrapImages`: Unwraps images from paragraph tags
     - `rehypeImageToolkit`: Enhances image processing capabilities

2. **Generated Types**: Content Collections generates TypeScript types at `.content-collections/generated`
   - Import with: `import { allPages } from 'content-collections'`
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

## Adding New Content

1. Create MDX file in `src/pages/` directory
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
- **Middleware**: CORS and logging configured for `/api/*` routes only

### Cloudflare Bindings
The worker has access to:
- **R2 Bucket**: `c.env.BUCKET` (configured in `wrangler.jsonc`)
  - Production bucket: `joina`
  - Preview bucket: `joina-bucket-preview`

### Request Handling
1. **API Routes** (`/api/*`): Handled by Hono server
   - Routes run before static assets (`run_worker_first: ["/api/*"]`)
   - `GET /api/health`: Health check endpoint
   - `POST /api/upload`: Job application submission with file uploads to R2
2. **Static Assets**: All other routes serve the React SPA via SPA routing

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
2. Define your endpoints using Hono's router with typed bindings:
   ```typescript
   type Bindings = {
     BUCKET: R2Bucket;
   };
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

### File Upload Handling
The `/api/upload` endpoint demonstrates best practices:
- **Validation**: Uses `@hono/zod-validator` for form validation
- **File validation**: Type and size checks before upload
- **R2 Storage**: Files organized in timestamped folders with metadata JSON
- **JSON:API format**: Error and success responses follow JSON:API specification
- **Constants**: Upload limits and messages centralized in `src/server/constants/upload`
- **Utils**: Reusable JSON:API response helpers in `src/server/utils/jsonapi`

## Deployment

The project deploys to Cloudflare Workers with static assets:
- The Cloudflare Vite plugin builds both client and worker in a single `vite build` command
- Client build artifacts go to `dist/client/`
- Worker build artifacts go to `dist/joina/` (includes auto-generated `wrangler.json`)
- Wrangler automatically uses the output `wrangler.json` for deployment
- API routes (`/api/*`) are handled by the Cloudflare Worker
- All other routes serve the React SPA with SPA routing enabled
- Full observability with Cloudflare logs enabled

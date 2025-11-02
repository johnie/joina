# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React 19 + TypeScript + Vite application with MDX content support, deployed to Cloudflare Pages. The project uses:
- **Vite (Rolldown variant)**: Custom Vite fork optimized with Rolldown bundler
- **React 19 with React Compiler**: Automatic optimization of React components
- **Content Collections**: Type-safe MDX content management with `.content-collections/generated` imports
- **Tailwind CSS v4**: Using the new Vite plugin architecture
- **Biome**: For linting and formatting (replacing ESLint/Prettier)
- **Cloudflare Pages**: Deployment target via Wrangler

## Development Commands

```bash
# Start dev server with HMR
npm run dev

# Type-check and build for production
npm run build

# Preview production build locally (automatically runs build first)
npm run preview

# Deploy to Cloudflare Pages (automatically runs build first)
npm run deploy

# Run Biome formatter and linter (auto-fix with --unsafe flag)
npm run biome:fix
```

## Architecture

### Content Management System
The project uses `@content-collections` for type-safe MDX content:

1. **Configuration**: `content-collections.ts` defines collections with Zod schemas
   - Currently configured with `posts` collection
   - Content directory: `content/` (note: currently using `src/posts/` - may need migration)
   - Schema includes: `title`, `summary`, `content`
   - MDX compilation handled automatically via `compileMDX`

2. **Generated Types**: Content Collections generates TypeScript types at `.content-collections/generated`
   - Import with: `import { allPosts } from 'content-collections'`
   - Path alias configured in tsconfig: `"content-collections": ["./.content-collections/generated"]`

3. **Usage Pattern**: See `src/App.tsx` for reference
   - Import posts collection: `import { allPosts } from 'content-collections'`
   - Render with: `<MDXContent code={post.mdx} />`

### Path Aliases
- `@/*` maps to `src/*` for cleaner imports
- `content-collections` maps to `.content-collections/generated`

### TypeScript Configuration
The project uses composite TypeScript configs:
- `tsconfig.json`: Base config with references
- `tsconfig.app.json`: Main app config (strict mode enabled)
- `tsconfig.node.json`: Node/config files
- `tsconfig.worker.json`: Cloudflare Workers

### Code Formatting Rules (Biome)
- **JavaScript/TypeScript**: 2 spaces, single quotes, 80 char line width
- **JSON**: 4 space indentation (tabs for other files)
- **Import organization**: Automatic with Biome assist
- Run `npm run biome:fix` before committing

### React Compiler Notes
- Enabled via `babel-plugin-react-compiler`
- Automatically optimizes component re-renders
- May impact dev/build performance
- Configured in `vite.config.ts`

## Adding New Content

1. Create MDX file in `content/` directory (or `src/posts/` depending on configuration)
2. Include frontmatter with required fields:
   ```mdx
   ---
   title: "Post Title"
   summary: "Brief description"
   ---

   # Content here
   ```
3. Content Collections will auto-generate types on next dev/build
4. Access via `allPosts` import from `content-collections`

## Deployment

The project deploys to Cloudflare Pages:
- Build artifacts go to `dist/` directory
- Wrangler handles deployment (requires Cloudflare account setup)
- No `wrangler.toml` in repo - configuration may be in Cloudflare dashboard

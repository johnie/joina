# Joina Johnie

A modern, full-stack job application website for personal assistant positions. Built with React 19 and deployed to Cloudflare's edge network for optimal performance worldwide.

## What is this?

Joina is a hybrid full-stack application that combines a React SPA frontend with a Hono-based API backend. The site features:

- **Content-driven job posting** with MDX for rich formatting and embedded components
- **FAQ section** powered by YAML files with an accordion interface
- **Application form** with file upload support (CV and cover letter)
- **File storage** via Cloudflare R2 for secure document handling
- **SEO optimization** with dynamically generated sitemap and robots.txt
- **Dark mode support** with system preference detection

All running on Cloudflare Workers for global edge delivery and zero cold starts.

## Tech Stack

### Frontend
- [**React 19**](https://react.dev/) - Latest React with concurrent features
- [**React Compiler**](https://react.dev/learn/react-compiler) - Automatic optimization of React components
- [**Tailwind CSS v4**](https://tailwindcss.com/) - Utility-first CSS framework with new Vite plugin architecture
- [**shadcn/ui**](https://ui.shadcn.com/) - Beautifully designed components built with Radix UI primitives
- [**Radix UI**](https://www.radix-ui.com/) - Unstyled, accessible component primitives
- [**Lucide React**](https://lucide.dev/) - Beautiful & consistent icon toolkit
- [**next-themes**](https://github.com/pacocoursey/next-themes) - Perfect dark mode in React
- [**Sonner**](https://sonner.emilkowal.ski/) - Opinionated toast component for React

### Content Management
- [**Content Collections**](https://www.content-collections.dev/) - Type-safe MDX and YAML content with automatic TypeScript generation
- [**MDX**](https://mdxjs.com/) - Markdown with JSX for rich, interactive content
- [**rehype-image-toolkit**](https://github.com/ipikuka/rehype-image-toolkit) - Advanced image processing for MDX
- [**rehype-unwrap-images**](https://github.com/remarkjs/remark-unwrap-images) - Removes paragraph wrappers from images

### Backend & Infrastructure
- [**Hono**](https://hono.dev/) - Ultrafast web framework for Cloudflare Workers
- [**Cloudflare Workers**](https://workers.cloudflare.com/) - Serverless execution environment at the edge
- [**Cloudflare R2**](https://www.cloudflare.com/products/r2/) - S3-compatible object storage for file uploads
- [**Wrangler**](https://developers.cloudflare.com/workers/wrangler/) - CLI for Cloudflare Workers development

### Forms & Validation
- [**TanStack Form**](https://tanstack.com/form/latest) - Powerful and type-safe form state management
- [**Zod**](https://zod.dev/) - TypeScript-first schema validation
- [**@hono/zod-validator**](https://hono.dev/docs/guides/validation#zod-validator-middleware) - Zod validation middleware for Hono

### Build Tools & DX
- [**Vite (Rolldown)**](https://rolldown.rs/) - Experimental Rust-powered bundler for Vite
- [**@cloudflare/vite-plugin**](https://github.com/cloudflare/workers-sdk/tree/main/packages/vite-plugin) - Automatic building and bundling for Workers
- [**Biome**](https://biomejs.dev/) - Fast formatter and linter (replacing ESLint/Prettier)
- [**TypeScript**](https://www.typescriptlang.org/) - Strict type safety across the entire stack

## Getting Started

```bash
# Install dependencies (requires pnpm)
pnpm install

# Start React development server with HMR
pnpm dev

# Start Cloudflare Worker dev server (includes React app + API)
pnpm dev:server

# Build for production (builds both client and server)
pnpm build

# Preview production build locally
pnpm preview

# Deploy to Cloudflare Workers
pnpm deploy

# Run Biome formatter and linter with auto-fix
pnpm biome:fix
```

## Project Structure

```
joina/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── mdx/             # MDX-specific components
│   │   └── *.tsx            # Feature components
│   ├── content/             # Content Collections source
│   │   ├── pages/           # MDX pages
│   │   └── qna/             # FAQ entries (YAML)
│   ├── lib/                 # Utility functions
│   ├── server/              # Hono API backend
│   │   ├── routes/          # API route handlers
│   │   ├── utils/           # Server utilities
│   │   └── constants/       # Server constants
│   └── App.tsx              # Main React application
├── .content-collections/    # Generated TypeScript types
├── content-collections.ts   # Content Collections config
├── wrangler.jsonc           # Cloudflare Workers config
└── vite.config.ts           # Vite configuration
```

## Key Features

### Type-Safe Content Management
Content is managed through Content Collections with automatic TypeScript type generation. Pages are written in MDX with frontmatter, and FAQs are defined in YAML files. All content is validated at build time.

### Hybrid Rendering
The application uses a hybrid architecture where:
- React SPA handles the UI and client interactions
- Hono API handles file uploads and server-side logic
- Both are bundled together and deployed to Cloudflare Workers

### Edge-First Architecture
Deployed to Cloudflare's global network with:
- Zero cold starts
- Sub-50ms response times worldwide
- Automatic HTTPS and DDoS protection
- R2 object storage for file uploads

## Development

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines, architecture documentation, and best practices when working with this codebase.

# Joina Johnie

A hybrid full-stack job application platform built with React 19 and deployed to Cloudflare Workers.

## What is this?

Joina is a modern web application that combines a React SPA frontend with a Hono-based API backend. It handles job application submissions with file uploads, all running on Cloudflare's edge network for optimal performance.

## Tech Stack

- **Frontend**: React 19 with React Compiler, shadcn/ui components, Tailwind CSS v4
- **Backend**: Hono web framework for Cloudflare Workers
- **Content**: Type-safe MDX with Content Collections
- **Forms**: TanStack Form with Zod validation
- **Build**: Vite (Rolldown variant) with Cloudflare plugin
- **Code Quality**: Biome for linting and formatting

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Start with API server
pnpm dev:server

# Build for production
pnpm build

# Deploy to Cloudflare
pnpm deploy
```

## Project Structure

- `src/` - React application source
- `src/server/` - Hono API backend
- `src/pages/` - MDX content pages
- `src/components/` - React components including shadcn/ui

## Development

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines and architecture documentation.

# Breathe Mail Monorepo

This repository hosts the refactored Breathe Mail workspace using a pnpm monorepo with a Next.js App Router frontend and shared domain packages.

## Structure

```
apps/
  web/           # Next.js App Router surface
packages/
  lib/email/     # Typed domain contracts and fixtures
```

## Getting Started

```bash
pnpm install
pnpm dev
```

## Available Commands

- `pnpm dev` – run the Next.js development server.
- `pnpm lint` – run ESLint across all workspaces.
- `pnpm typecheck` – run TypeScript in each package.
- `pnpm test` – execute Vitest suites.
- `pnpm refactor:check` – run ast-grep, knip, and jscpd scans.

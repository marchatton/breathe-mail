# Breathe Mail Monorepo

Next.js App Router workspace for the Breathe Mail dashboard with shared domain contracts and guardrail tooling.

## Prerequisites
- Node.js 20+
- pnpm 9 (`corepack enable` recommended)

## Setup
```bash
pnpm install
pnpm dev
```

## Workspace Layout
```
apps/
  web/                  # Next.js surface (App Router, Tailwind, shadcn/ui)
packages/
  lib/email/            # Zod schemas, fixtures, Vitest coverage for mail domain
```

Documentation lives in [`@architecture.md`](./@architecture.md).

## Day-to-day Commands
- `pnpm dev` – Next.js dev server for `apps/web`
- `pnpm build` – production build for the web app
- `pnpm lint` – eslint across workspaces
- `pnpm typecheck` – TypeScript `--noEmit`
- `pnpm test` – Vitest suites (jsdom)
- `pnpm refactor:check` – ast-grep + knip + jscpd scans

## Testing & QA Flow
1. Extend Zod schemas/fixtures in `@breathe-mail/email`
2. Add/update Vitest coverage (`packages/lib/email/src/*.test.ts`)
3. Run `pnpm -F web test` (or `pnpm test` for all)
4. Run `pnpm lint && pnpm typecheck && pnpm refactor:check` before opening PRs

CI mirrors these gates and Husky hooks enforce lint/scan before push.

## Contributing Notes
- Keep server-only logic out of client components; prefer server actions and typed APIs
- Encode new contracts in `packages/lib` first, then consume from app routes
- Use Tailwind tokens + shadcn primitives for UI, avoid bespoke styling
- Archive deprecated docs under `docs/archive/`

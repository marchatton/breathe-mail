# Breathe Mail Refactor Strategy

## High-Level Approach
- Migrate prototype into pnpm monorepo with Next.js App Router, Tailwind, shadcn/ui, Vitest, MSW, ast-grep per AGENTS guardrails.
- Codify domain contracts (actions, bundles, newsletters, timeline) via shared Zod schemas and reusable services under `packages/lib`.
- Split server/client responsibilities: server-only data loaders + actions, thin client wrappers for interactions, enforce boundaries with `server-only`/`client-only`.
- Implement API + server actions mirroring PRD contracts (zones, snooze/archive/pin, telegram windows) with idempotency and safe error surfaces.
- Establish automation + QA baseline (typecheck, lint, Vitest, MSW, ast-grep, CI) and document architecture decisions.

## Workstreams & Tasks

### 1. Tooling & Project Reset
- Set up pnpm workspace, root scripts, husky hooks, lint-staged.
- Scaffold `apps/web` Next 14 project with Tailwind, shadcn/ui, Vitest, MSW, ast-grep, knip, jscpd configs.
- Migrate existing docs into `/docs` (already done) and add ADR summarizing refactor scope.

### 2. Domain Modeling
- Extract mock data shapes into Zod schemas in `packages/lib/email` (actions, bundles, newsletters, timeline stats).
- Provide DTO factories + Vitest coverage + MSW handlers for contract fixtures.

### 3. Data & Services Layer
- Create Gmail ingestion + sync stubs (adapters, repositories) using typed contracts.
- Implement scoring, decay, domain familiarity, critical alert evaluation per PRD math with tests.
- Prepare Telegram window scheduler + notifier abstractions gated by feature flags.

### 4. API & Server Actions
- Build `/app/api/v1` endpoints + server actions for each zone, snooze/archive/pin mutations with idempotency keys and safe error mapping.
- Add middleware pipeline (rate limit → cors → sanitize → auth → logger) aligned with AGENTS.

### 5. App Router UI
- Recreate dashboard pages as async server components; load data via typed services.
- Implement client components only for interactive menus (snooze, telemetry) using `client-only` guards and shared UI primitives.
- Connect actions to server actions (optimistic updates, rollback) and ensure Tailwind tokens usage.

### 6. Quality & Delivery
- Wire comprehensive Vitest suites (unit + component) and MSW story mocks.
- Add `pnpm -F web typecheck/lint/test/scan/dupes` to CI workflow.
- Document deployment process, follow-up tasks, and maintain refactor checklist.

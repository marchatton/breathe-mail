# AGENTS.md (Breathe Mail)

**Purpose:** Repo guardrails for Codex in this workspace. Defaults: **pnpm**, Next.js App Router + TypeScript, Tailwind + shadcn/ui, Vitest, Vercel.

in all Interactions
▌ and comment messages, Be extremely concise even if grammar suffers.

---

## 0) Engineering Principles

- **TDD:** failing test (Vitest) before fixes/new behavior, then green.
- **KISS:** bias to server components + simple utilities; avoid premature abstractions.
- **YAGNI:** only ship what the dashboard and shared email contracts need right now.
- **DRY:** shared logic lives in `packages/lib/email` or future libs; prefer extraction over copy.

## 1) Project Profile & Non‑negotiables

- **Monorepo:** pnpm workspaces (`apps/*`, `packages/*`).
- **Primary app:** `apps/web` Next.js 14 App Router, server-first dashboard.
- **Shared domain:** `@breathe-mail/email` Zod schemas + fixtures; extend contracts here first.
- **UI kit:** Tailwind + shadcn/ui + Radix primitives; icons via `lucide-react`.
- **State:** Server components by default; client components only for real interactivity (treat as opt-in).
- **Forms:** None today; when added use React Hook Form + Zod.
- **Testing:** Vitest + Testing Library; MSW when network logic lands.
- **Static analysis:** ast-grep, knip, jscpd wired via pnpm.
- **Hosting:** Vercel; CI mirrors pnpm scripts.

---

## 2) Structure & Boundaries

**Repo layout**
```
/
  apps/
    web/
      app/(protected)/dashboard/      # server component surface
      middleware.ts (future)
  packages/
    lib/email/                        # schemas, fixtures, tests
  docs/
    specs/                            # active specs (e.g. dashboard-ui...)
    archive/                          # legacy references
```

**Rules**
- Do not import `apps/web/server` (future) into client code; enforce via `server-only` / `client-only` when unsure.
- Validate all IO with Zod; never trust fixture edits without schema updates/tests.
- Map internal errors to safe UI messages; production never leaks stack traces.
- Client-visible env vars must start with `NEXT_PUBLIC_`.

---

## 3) Do / Don’t

**Do**
- Run pnpm with filters (`pnpm -F web ...`).
- Keep diffs scoped (docs vs code vs tooling).
- Extend schemas/tests in `@breathe-mail/email` before touching UI.
- Mirror new dashboard behavior in docs (`docs/specs/...`) and update fixtures/tests.
- Use Tailwind tokens + design system utilities; maintain 24px hit targets.

**Don’t**
- Add heavy deps (charts, date libs, css-in-js) without approval.
- Fetch data in client components or rely on `useEffect` for loading.
- Bypass Husky/CI requirements; no failing lint/type/test in commits.

---

## 4) Commands (pnpm)

```bash
# Workspace
pnpm install
pnpm dev                     # runs apps/web

# Quality gates
pnpm -F web lint
pnpm -F web typecheck
pnpm -F web test             # Vitest
pnpm -F web scan             # ast-grep
pnpm -F web dead             # knip
pnpm -F web dupes            # jscpd
pnpm -F web refactor:check   # scan + dead + dupes
```

---

## 5) Git & Automation

- Conventional commits (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`).
- Husky hooks already run lint-staged + scans pre-commit, full lint/type/test/dupes pre-push.
- No force pushes to `main`.

---

## 6) Testing Expectations

- Every contract change: update Vitest coverage in `packages/lib/email`.
- Future UI interactions: use Testing Library + MSW mocks; smoke via chrome-devtools MCP.
- Bug fix flow: reproduce with failing test → fix → ensure green suite.

---

## 7) UI/A11y Guardrails

- `:focus-visible` must be obvious; obey APG keyboard patterns and provide skip links.
- Maintain 16px base on mobile, targets ≥24px (44px touch), keep URL in sync with filters/tabs.
- Inline validation with `aria-live="polite"`; destructive actions need confirm/undo path.
- Honor `prefers-reduced-motion`; animate only opacity/transform.

---

## 8) Performance & Security

- Keep mutations <500 ms P95 (when implemented); profile with throttling before shipping.
- Prevent CLS via fixed dimensions/skeletons mirroring content.
- Sanitize user content; prefer React escaping, add DOMPurify only when raw HTML required.
- Middleware order when introduced: rateLimit → cors → sanitize → auth → logger.
- Never commit secrets; use environment variables (Vercel) with proper prefixes.

---

## 9) Docs & Tracking

- Active specs live in `docs/specs`; move deprecated material to `docs/archive`.
- Update `@architecture.md` and README when structure/tooling shifts.
- PR checklist: tests updated, docs touched, screenshots for UI changes, a11y check.

---

## 10) Appendices (quick refs)

**pnpm workspace config**
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Ast-grep signal (excerpt)**
```yaml
rules:
  - id: no-client-fetch
    message: Move data access to server action or /lib/api
    severity: error
    language: tsx
    pattern: fetch($A)
    constraints:
      all:
        - inside:
            kind: Program
            has:
              kind: ExpressionStatement
              has:
                kind: StringLiteral
                text: '"use client"'
```

**Testing reminder**
```
pnpm -F web test
pnpm -F web test path/to/file.test.tsx --runInBand
```


# Dashboard UI Alignment with Vercel Interaction Guidelines

## Objective
Bring the `(protected)/dashboard` experience in line with the archived Vercel web interaction checklist while preserving the existing layout and data primitives.

## Scope
- Applies to `apps/web/app/(protected)/dashboard/page.tsx` and any supporting shared UI primitives created during implementation.
- Excludes data contract changes (`@breathe-mail/email`) and server-side loaders; focus is presentation, accessibility, and interaction polish.

## Implementation Steps

### 1. Establish Foundational Accessibility Hooks
  1.1 Add a visually hidden `Skip to content` link positioned before `<main>`; ensure it becomes visible on `:focus-visible`.
  1.2 Set `scroll-margin-top` on each major section heading (`Priority Actions`, `Insights`, etc.) to avoid clipping when navigated via anchor links.
  1.3 Wrap the dashboard content grid in a container that respects `env(safe-area-inset-*)` padding on mobile.

### 2. Upgrade Interactive Card Semantics
  2.1 Promote list items representing actionable objects (`Priority Actions`, `Follow ups`, `Awaiting Replies`) to `<button>` or `<a>` elements with `display: block` and `aria-label` text describing the implied action.
  2.2 Apply focus treatments meeting ≥3:1 contrast (`outline`, `outline-offset`, or box-shadow) and ensure hit areas meet the 24px (44px mobile) guideline.
  2.3 Add helper text or icon badges to convey urgency/status redundantly with color.

### 3. Improve Data Legibility and Alignment
  3.1 Apply `font-variant-numeric: tabular-nums` (via Tailwind plugin or utility) for stat counters to align digits.
  3.2 Convert stat labels into `dt` elements with accessible descriptions (`aria-describedby`) pairing text + value.
  3.3 Localize duration strings via `Intl.RelativeTimeFormat` or placeholder util to prepare for locale-aware numbers.

### 4. Layer Feedback and Loading States
  4.1 Introduce skeleton components that mirror card layout; gate them behind a loading flag for future data fetching.
  4.2 Wrap follow-up/awaiting lists with `aria-live="polite"` regions to announce updates when data changes.
  4.3 Add hooks/placeholders for optimistic undo notifications (toast or inline alert) after destructive or snooze actions.

### 5. Tighten Spacing and Layout Behavior
  5.1 Audit margins/padding across breakpoints; ensure base font-size ≥16px on mobile and clamp layout width responsibly at ≥1440px viewports.
  5.2 Validate nested radii: outer sections (`rounded-2xl`) should contain inner cards with equal or smaller radius.
  5.3 Ensure no overflow scrolling within cards; test Safari and mobile browsers for clipping or double scrollbars.

### 6. Motion & Reduced Motion Compliance
  6.1 Add a shared motion utility that switches to opacity-only fades when `prefers-reduced-motion: reduce` is active.
  6.2 Use the utility for future skeleton transitions and card hover/press states; avoid animating layout-affecting properties.

## Implementation notes

### Service contracts & persistence
- **Commands (`workspaceSnapshot.commands`)** → `packages/lib/email/src/fetchers/get-commands.ts` consuming `apps/web/app/api/v1/dashboard/commands/route.ts`; data lives in Postgres via Prisma `command_cards` + `command_actions` tables with a 30s `unstable_cache` tag per user.
- **Insights (`workspaceSnapshot.insights`)** → `packages/lib/email/src/fetchers/get-insights.ts` hitting `apps/web/app/api/v1/dashboard/insights/route.ts`; proxy to external insights API (no local persistence) cached for 60s via `unstable_cache` keyed by workspace + locale.
- **Calendar (`workspaceSnapshot.calendar`)** → `packages/lib/email/src/fetchers/get-calendar.ts` hitting `apps/web/app/api/v1/dashboard/calendar/route.ts`; read-through Graph API with refresh tokens in Postgres, no result persistence, 5 min cache to mask rate limits.
- **Debrief stats (`workspaceSnapshot.debrief.statistics`)** → `packages/lib/email/src/fetchers/get-debrief.ts` hitting `apps/web/app/api/v1/dashboard/debrief/route.ts`; Prisma aggregates over Postgres materialized view refreshed every 5 min, 15s cache for UI snappiness.
- **Follow ups (`workspaceSnapshot.debrief.followUps`)** → same `get-debrief` contract; persisted per thread in Postgres `follow_ups` table; expose `waitingSinceIso` from DB, derived labels server-side.
- **Snoozed (`workspaceSnapshot.snoozed`)** → `packages/lib/email/src/fetchers/get-snoozed.ts` hitting `apps/web/app/api/v1/dashboard/snoozed/route.ts`; Postgres `snoozed_threads` table with Prisma, cache disabled to surface real-time unsnooze actions.
- **Awaiting replies (`workspaceSnapshot.awaitingReplies`)** → `packages/lib/email/src/fetchers/get-awaiting.ts` hitting `apps/web/app/api/v1/dashboard/awaiting/route.ts`; Postgres `awaiting_replies` table, 30s cache; future webhook invalidation hooks.

### Validation & serialization
- API routes validate request headers/session via `workspaceSessionSchema` (new) before delegating; responses pipe through the slice-specific Zod schemas exported from `packages/lib/email/src/schemas` and composed into `workspaceSnapshotSchema` for `/dashboard` hydration.
- Introduce `packages/lib/email/src/serializers/dashboard.ts` with helpers `serializeCommand`, `serializeInsight`, etc. to coerce Prisma models into schema-friendly shapes (nullish → `null`, enums → Zod enums).
- Add `packages/lib/email/src/utils/time.ts` with `formatRelativeTime(now, isoString)` and `formatDurationMinutes(totalMinutes)` that wrap `Intl.RelativeTimeFormat` + `Intl.DateTimeFormat`; reuse inside serializers so clients consume preformatted labels.
- Client components replace ad-hoc formatting with values returned from serializers; only local transformation is display-only (e.g., clamp strings).

### Testing strategy
- Register MSW handlers per slice under `apps/web/test/mocks/handlers/dashboard.ts`, mirroring each API route with happy/error fixtures drawn from `packages/lib/email/src/fixtures` to keep parity.
- Add Vitest suites beside API routes (e.g., `apps/web/app/api/v1/dashboard/commands/route.test.ts`) covering success + error paths (auth failure, external API timeout) with MSW interceptors.
- Create contract tests in `packages/lib/email/src/__tests__/workspace-contract.test.ts` asserting that fixtures pass the Zod schemas and that API JSON payloads remain in sync by importing handlers' responses.
- Wire contract tests into CI via `pnpm -r test` to ensure schema, spec, and fixtures evolve together; failing contract blocks UI merges.

## Validation Checklist
- Keyboard traversal hits skip link, sections, and cards in logical order; focus styles remain visible throughout.
- Target sizes validated via browser devtools (Chrome Lighthouse or manual measurement).
- Screen reader pass-through confirms semantic labeling of actionable cards.
- `aria-live` regions announce dynamic changes without overwhelming.
- Layout verified on 375px, 768px, 1280px, and 1720px widths; safe-area padding present on iPhone simulator.
- Motion settings respect user preference toggles.

## Follow-up Considerations (Not in Scope)
- Introduce per-card action menus (snooze, archive) once server actions exist.
- Replace hard-coded fixture copy with i18n-ready strings.
- Integrate real data loaders once API contract solidifies.

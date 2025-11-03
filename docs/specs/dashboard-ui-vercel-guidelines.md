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

| Slice (`workspaceSnapshot.*`) | Server contract (`apps/web/server/dashboard`) | Shared client helper (`packages/lib/email`) | Persistence & source of truth | Cache & invalidation |
| --- | --- | --- | --- | --- |
| `commands` | `queries/commands.ts` orchestrates Prisma + policy guards before delegating to API route | `api/dashboard/commands.ts` exports `fetchCommands` returning `CommandCard[]` typed by schema | Postgres `command_cards` + `command_actions` via Prisma | `unstable_cache` (30s) keyed by workspace + actor; `revalidateTag('dashboard:commands')` on mutations |
| `insights` | `queries/insights.ts` wraps external insights REST client, normalises errors | `api/dashboard/insights.ts` fetches from route + exposes typed errors | External insights API (no DB) | `unstable_cache` (60s) keyed by workspace + locale; manual bust on settings changes |
| `calendar` | `queries/calendar.ts` exchanges refresh token for Microsoft Graph client | `api/dashboard/calendar.ts` for RSC consumption | Microsoft Graph + refresh tokens stored in Postgres `connected_accounts` | `unstable_cache` (5m) w/ tag `dashboard:calendar`; expire when webhook signals new events |
| `debrief.statistics` | `queries/debrief.ts#getStatistics` reads Postgres materialized view refreshed by cron | `api/dashboard/debrief.ts` splits helpers `fetchDebriefStats` & `fetchFollowUps` | Postgres `dashboard_debrief_mv` refreshed every 5m | `unstable_cache` (15s) tag `dashboard:debrief` |
| `debrief.followUps` | same module `getFollowUps` joining `follow_ups` table to threads | same client helper as stats | Postgres `follow_ups` table | Cache piggybacks on `dashboard:debrief`; invalidated by snooze/resolve mutations |
| `snoozed` | `queries/snoozed.ts` ensures actor permissions before returning snoozed threads | `api/dashboard/snoozed.ts` exports `fetchSnoozed` | Postgres `snoozed_threads` | No response cache; rely on ISR revalidation via `revalidateTag('dashboard:snoozed')` |
| `awaitingReplies` | `queries/awaiting.ts` composes Postgres view keyed by thread + contact SLA | `api/dashboard/awaiting.ts` for typed fetching | Postgres `awaiting_replies` view | `unstable_cache` (30s) tag `dashboard:awaiting`; invalidated on inbound message webhook |

### Validation & serialization
- API routes wrap handlers with `withWorkspaceSession(workspaceSessionSchema)` (new) ensuring session + role Zod parsing before running query modules.
- Each query returns raw domain entities that flow through `packages/lib/email/src/serializers/dashboard/*.ts` helpers (`serializeCommand`, `serializeInsight`, etc.) to coerce Prisma/external shapes into schema-safe objects. Serializers import `workspaceSnapshotSchema` slices to guarantee type fidelity.
- Add `packages/lib/email/src/utils/time.ts` exporting `formatRelativeTime(now, isoString)` and `formatDurationMinutes(totalMinutes)` wrappers around `Intl.RelativeTimeFormat`/`Intl.DateTimeFormat`. Serializers produce ready-to-render strings; clients only clamp/truncate.
- Extend `packages/lib/email/src/schemas.ts` with slice-level exports (`commandCardSchema`, etc.) so both API responses and MSW fixtures reuse identical validators.

### Testing strategy
- Register MSW handlers per slice under `apps/web/test/mocks/handlers/dashboard.ts`, mirroring each API route with happy/error fixtures drawn from `packages/lib/email/src/fixtures`. Handlers should reuse serializers to avoid fixture drift.
- Add Vitest suites beside API routes (e.g., `apps/web/app/api/v1/dashboard/commands/route.test.ts`) covering success, auth failure, upstream timeout, and cache tag invalidation hooks via mocked `revalidateTag`.
- Create contract tests in `packages/lib/email/src/__tests__/workspace-contract.test.ts` asserting that serializers output values accepted by `workspaceSnapshotSchema` and matching MSW handler payloads. Include regression for relative-time formatting fallbacks.
- Wire contract + route suites into CI via `pnpm -r test`; add a dedicated `pnpm -F web test:contracts` script for targeted runs during schema changes.

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

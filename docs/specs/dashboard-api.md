# Dashboard API

## Goals & Context
- Deliver the data required by the dashboard screen rendered in [`apps/web/app/(protected)/dashboard/page.tsx`](../../apps/web/app/(protected)/dashboard/page.tsx).
- Provide a workspace-scoped view of command center data (Priority Actions, Insights, Today stats/follow-ups, Calendar, Snoozed, Awaiting Replies) so the UI can hydrate the corresponding sections.
- Assume callers already hold an authenticated, workspace-scoped session. Authorization verifies the requesting user has access to the `{workspaceId}` requested; cross-workspace access MUST be rejected.

## Endpoint
`GET /api/v1/workspaces/{workspaceId}/dashboard`

### Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `commands_updated_after` | string (ISO 8601 datetime) | No | Request optimistic refresh of `commands` ("Priority Actions") when data is newer than the supplied timestamp. |
| `insights_updated_after` | string (ISO 8601 datetime) | No | Optimistic refresh for `insights`. |
| `timeline_updated_after` | string (ISO 8601 datetime) | No | Optimistic refresh for `debrief.followUps`, `debrief.statistics`, and `awaitingReplies` ("Today" + "Awaiting Replies"). |
| `calendar_updated_after` | string (ISO 8601 datetime) | No | Optimistic refresh for `calendar`. |
| `snoozed_updated_after` | string (ISO 8601 datetime) | No | Optimistic refresh for `snoozed`. |

When timestamps are provided, the server may respond with `304 Not Modified` (using the cache headers below) if none of the requested slices have changed since the client timestamp. Each timestamp applies to the matching slice in the response meta block. Callers SHOULD omit parameters they are not actively refreshing to avoid unnecessary conditional checks.

### Authentication & Authorization
- Requires standard session cookie / token conveying the active workspace context.
- Middleware MUST ensure the session is scoped to `{workspaceId}`; reject mismatched workspace access with `403`.

## Response Body
Successful (`200 OK`) responses return JSON compatible with `workspaceSnapshotSchema` and a `meta` object that surfaces slice freshness:

```json
{
  "data": {
    "commands": [CommandCard, ...],
    "insights": [Insight, ...],
    "calendar": [CalendarItem, ...],
    "debrief": {
      "statistics": {
        "today": {
          "actionsResolved": number,
          "criticalHandled": number,
          "averageResponseTime": string,
          "focusScore": number
        }
      },
      "followUps": [FollowUp, ...]
    },
    "snoozed": [SnoozedItem, ...],
    "awaitingReplies": [AwaitingReply, ...]
  },
  "meta": {
    "commands": { "updatedAt": string },
    "insights": { "updatedAt": string },
    "timeline": { "updatedAt": string },
    "calendar": { "updatedAt": string },
    "snoozed": { "updatedAt": string }
  }
}
```

Each array maps to the fixtures rendered in the dashboard:
- `commands` → "Priority Actions"
- `insights` → "Insights"
- `debrief.statistics.today` & `debrief.followUps` → "Today" stats & follow ups
- `calendar` → "Calendar"
- `snoozed` → "Snoozed"
- `awaitingReplies` → "Awaiting Replies"

`workspaceSnapshotSchema` defines the structure of each slice:

- **CommandCard** — includes `id`, `content.subject`, `content.sender`, `content.preview`, and `content.actionMetadata` with `type`, `dueAt`, and `priority` (see [`packages/lib/email/src/schemas.ts`](../../packages/lib/email/src/schemas.ts)).
- **Insight** — includes `id`, `title`, `summary`, `isNew`, and optional `cta` metadata.
- **CalendarItem** — includes `id`, `title`, `time`, `duration`, and `type` (meeting/deadline) plus participant context.
- **Debrief** — `statistics.today` captures `actionsResolved`, `criticalHandled`, `averageResponseTime`, and `focusScore`; `followUps` contain `threadId`, `subject`, `recipient`, and `waitingSinceLabel`.
- **SnoozedItem** — includes `id`, `subject`, `sender`, and `snoozeUntil`/`snoozeUntilLabel` values.
- **AwaitingReply** — includes `id`, `subject`, contact info, and `daysWaiting`.

The `meta.updatedAt` timestamps power optimistic refresh and MUST reflect the latest persistence timestamp per slice. `meta.timeline.updatedAt` tracks both the `debrief` and `awaitingReplies` slices; updating either slice requires issuing a new timeline timestamp.

## Caching & Concurrency
- Respond with both `ETag` and `Last-Modified` headers calculated from the aggregate of slice update timestamps (e.g., hash of each `meta.*.updatedAt`).
- Support conditional requests via `If-None-Match` / `If-Modified-Since`; prefer `304` when data is unchanged.
- Include `Last-Modified` aligned to the max `updatedAt` timestamp to make cache validators deterministic.
- Clients may cache `200` responses while honoring the cache validators for revalidation.

## Errors
All non-2xx responses use the shared envelope:

```json
{
  "error": {
    "code": "string",        // machine-friendly identifier (e.g., "workspace_not_found")
    "message": "string",     // human-friendly summary, safe for display
    "details": object|null    // optional structured metadata
  }
}
```

### Common error codes
- `unauthorized` (401) – session missing/expired
- `forbidden` (403) – session not allowed to access `{workspaceId}`
- `workspace_not_found` (404) – workspace missing or soft-deleted
- `precondition_failed` (412) – ETag/Last-Modified precondition mismatch when using `If-Match` or `If-Unmodified-Since`

## Pagination Roadmap
- Commands and insights MAY eventually exceed the initial payload. Include optional query knobs (`limit`, `cursor`) in future revisions while defaulting to the full set in v1.
- Today, v1 returns the complete arrays; clients should still be ready to supply pagination params once published without requiring breaking changes.
- Any future pagination MUST echo cursors in the response `meta` block (e.g., `meta.commands.nextCursor`) to keep the envelope consistent with other APIs.


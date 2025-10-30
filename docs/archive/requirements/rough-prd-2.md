
---

# BREATHE MAIL — Unified PRD + User Journeys + Technical Spec

**Name:** Breathe Mail
**Channel:** Telegram (only, MVP)
**Windows:** 09:00 & 16:00 UTC (user‑configurable later)
**Gmail:** single provider via Google OAuth; Gmail is **source of truth**
**Core UI:** Four action‑intent **Zones** (Grok‑inspired), each with a distinct “shape”
**Scoring:** Simple, explainable model + light decay + domain familiarity gate
**Newsletter auto‑read:** **Yes** (only inside Magazine zone on explicit “Mark Today Read”/“Mark Cluster Read”)
**No budgets** (out of scope)

---

## 1) Product Concept

**Thesis:** Email is push; Breathe Mail makes it **pull and intentional**. Twice per day you get a gentle Telegram nudge; in the web app you see **four zones** tuned to the action you intend to take, not a timestamped list.

### The Four Zones (and their shapes)

1. **Command** — *Decide/Do now*

   * **Shape:** A **stack** of actionable cards sorted by **ActionScore (0–100)**.
   * **Actions:** Pay, Approve, Review PR, RSVP, Investigate, Mark Done, Snooze, Reassign.

2. **Radar** — *Filter/bulk handle noise*

   * **Shape:** **Bundles** (source/topic groups) with counts (e.g., “24 LinkedIn updates”), each with **Mark bundle read**, **Demote**, **Open group**.

3. **Magazine** — *Read/discover intentionally*

   * **Shape:** Topic **tiles** (clusters: “Today in GenAI”, “Markets”, …) with 1–3 bullets and ≤2 clean links each.
   * **Auto‑read:** When you press **“Mark Today Read”** or **“Mark Cluster Read”**, we bulk‑mark those newsletter messages as **READ** in Gmail.

4. **Debrief** — *Reflect/plan*

   * **Shape:** **Timeline + stat cards**: What changed today, **Waiting on them** (follow‑ups), and **Tomorrow’s deadlines**.

**Break‑through:** Outside windows, only **Critical** items ping Telegram (strict policy).
**Quick‑Peek:** You can open the dashboard anytime; no off‑window pings.

---

## 2) MVP (P0) Feature Candidates

You choose what ships—each has acceptance criteria.

1. **Two Windows + Telegram Pings**

   * 09:00 & 16:00 UTC “Your queue is ready” with deep link to dashboard.
   * ✅ Acceptance: pings on time (±120s), link opens dashboard without re‑login (valid session).

2. **Action Objects + ActionScore**

   * Types: **pay, file(receipt), review_pr, approve, rsvp/schedule, investigate, read, quarantine**.
   * PR emails merged per PR; receipts auto‑collapse invoice to **Done**.
   * ✅ Acceptance: five types detected correctly on seed data; PR merge works; receipt closes invoice.

3. **Four Zones UI** (distinct shapes)

   * Command stack, Radar bundles, Magazine tiles w/ clusters, Debrief timeline.
   * ✅ Acceptance: each zone renders correctly with live data and supports its primary actions.

4. **Critical Break‑Through (Telegram)**

   * Trigger if **VIP OR high‑impact OR time‑bound** (LLM‑extracted) **AND** ActionScore ≥ threshold; 30‑min cooldown per thread.
   * Buttons: **Open**, **Not urgent**, **Snooze**.
   * ✅ Acceptance: seeded critical test pings once; callbacks update state.

5. **Domain Familiarity Gate** (MVP “reputation”)

   * Unfamiliar domains → **Quarantine** with “Looks familiar—Allow?”
   * ✅ Acceptance: familiar domains bypass; allow action persists; never touches Spam/Trash.

6. **Gmail‑first Respect & Sync**

   * Newsletter **auto‑mark read** (explicit in Magazine); all other read/archive require explicit action.
   * If user archives/reads/replies in Gmail, Breathe Mail mirrors state on next sync.
   * ✅ Acceptance: Gmail actions reflect in zones within 2–5 minutes.

**P1 items (nice‑to‑have, small):**

* Magazine **streak boost** (light elevation for sources you read often).
* **Waiting on them** detection (shows in Debrief after X hours with no reply).
* Counter‑spam **flood controls** in Radar (bundling + quick actions).

**Out of scope (now):** Action budgets, Explain‑my‑score UI, multi‑provider email, mobile app, auto‑unsubscribe, team features, sending emails (see note below).

> **Sending vs replying inline:** Your original constraint was “no sending”. In Journey 1 you mentioned “Reply inline”. For MVP we’ll default to **Save Gmail Draft** or **Open in Gmail** to reply. If you want **send** from the dashboard/Telegram, we can add a **Settings toggle** (“Enable send”) post‑MVP. (See §8 Open Decisions.)

---

## 3) Scoring & Classification

### LLM Extraction (facts only; JSON)

```json
{
  "action_type": "pay|file|review_pr|approve|rsvp|schedule|investigate|read|quarantine",
  "ask_required": true,
  "time_bound_hours": 5,
  "deadline_at": "2025-10-25T17:00:00Z",
  "money": {"amount": 1200, "currency": "USD"},
  "impact_cues": ["security","billing","customer"],
  "is_receipt": false,
  "thread_momentum_12h": 3,
  "to_me_direct": true,
  "vip_candidate": true,
  "suspicious": false
}
```

### Domain Familiarity (“reputation”, MVP)

```
familiarity = sigmoid( 0.6*open_norm + 0.3*reply_norm + 0.1*auth_rate )
Gate:
  if familiarity < T0 → Quarantine
  else if < T1 → Quarantine + “Looks familiar—Allow?”
  else → Normal routing
```

(Reasonable starting thresholds: `T0=0.05`, `T1=0.20`.)

### Decay (light multipliers)

* Fresh (0–4h): ×1.00
* Peak (4–48h): ×1.10
* Decline (48–96h): ×0.90
* Stale (>96h): ×0.80

### ActionScore (0–100, simple & transparent)

```
Imminence      = clamp((24 - min(hours_to_deadline, 24))/24, 0..1)
Obligation     = 1.0 if ask_required or to_me_direct else 0.0
ImpactVIP      = 1.0 if verified VIP else 0.0
ImpactMoney    = min(log10(amount+1)/3, 1.0)
ImpactSignals  = 0.5 if any(impact_cues in {"security","incident","customer"}) else 0.0
Momentum       = clamp(thread_momentum_12h/4, 0..1)
Receiptness    = 1.0 if is_receipt else 0.0

Base0_100 =
  35*Imminence +
  22*(max(Obligation, ImpactVIP)) +
  16*(max(ImpactMoney, ImpactSignals)) +
  12*Momentum -
  25*Receiptness

Final = clamp( Base0_100 * DecayFactor * DomainMultiplier , 0, 100 )
DomainMultiplier: internal/client=1.25, vendor=1.0, unknown=0.9
```

### Critical Trigger (Telegram)

If (`time_bound_hours <= 6` OR VIP OR high‑impact signal) AND `Final ≥ 70`, send alert; cooldown 30 min/thread.

---

## 4) Combined User Journeys

### Journey A — **Onboarding Flow (Gmail‑only, Google OAuth)**

1. User hits dashboard (or Telegram welcome).
2. **Sign in with Google** (only path). Show clear privacy copy; use Firebase Auth or Auth0.
3. Request Gmail scopes: `gmail.readonly` + `gmail.modify` (labels/read state only).
4. Back on dashboard: prompt to **Start Telegram** bot (deep link with `start=<one‑time JWT>`).
5. User taps link → Telegram opens bot → `/start <token>` auto‑links their Telegram `chat_id` with their Breathe Mail account.
6. Show 30‑second tutorial: the **four zones**, windows at **09:00/16:00 UTC**, and what “Critical” means.

**Critical requirements met:** One‑click OAuth; no copying secrets; privacy spelled out; Gmail‑only.

---

### Journey B — **Telegram ↔ Dashboard Flow**

1. Telegram sends “Welcome to Breathe Mail—open your dashboard to triage”.
2. Inline buttons: **Open Dashboard**, **View Command**, **View Magazine**.
3. Clicking opens the web dashboard (deep link includes `returnTo` target).
4. If session valid → lands directly in the requested zone; if expired → quick **Sign in with Google** then resume (`returnTo`).
5. From dashboard, user can manage settings (window times, VIPs), Telegram connect/disconnect, and view stats.

**Requirements met:** Persistent sessions; contextual deep links; smooth re‑auth preserving context.

---

### Journey C — **Command Zone Triage Flow**

1. Telegram (window ping): “You have **5 important** emails.”
2. Tapping **View Command** shows a **stack** of cards sorted by score.
3. Each item has: Sender, Subject, Why chips (e.g., **due today** • **VIP** • **$1,200**), and one primary action (Pay/Approve/Review/RSVP/Investigate).
4. Quick actions in Telegram: **Archive All** (bulk remove `INBOX`), **Move to Radar**, **Open in Dashboard**.
5. In dashboard, user can deep‑dive a thread, press **Mark Done**, or **Assign to Debrief** (when you replied and await them).
6. Changes instantly confirm and sync to Gmail (read/archive/labels) and back to Telegram counts.

> **Reply inline?** For MVP we **save a draft** or **open Gmail**; direct send is a post‑MVP toggle.

---

### Journey D — **Zone Overflow / Edge Case Recovery**

1. Command exceeds threshold (e.g., >10 actions). Telegram banner: “You have **12 urgent** conversations. Triage needed.”
2. Options: **Zen Mode** (one card at a time), **Batch Archive**, **Demote lower priority to Radar**.
3. Dashboard shows overflow visual cues; a **“Clear All”** option bulk‑archives (confirm step).
4. Radar bundles also display flood controls (e.g., “Mark bundle read”).
5. Aim is stress‑free recovery—clear guidance and confirmations.

---

### Journey E — **Suspicious / Unknown Sender (Domain Familiarity Gate)**

1. Telegram alert: “New sender from **unfamiliar domain**—held in Quarantine.”
2. Buttons: **Release & Trust** (adds domain to allow‑list), **Delete/Trash** *(see Open Decision)*, **More Info** (show headers/domain reputation hints).
3. On **Release**, the thread routes to **Command** or **Radar** based on score/type.
4. If ignored, a gentle reminder at +24h (single nudge).

---

## 5) Edge Cases & Rules

* **>10 Command items:** show top 10 by score, with **More** drawer; Zen Mode available.
* **>10 newsletters:** cap visible by **utility**; “Show all”; collapse duplicates across sources.
* **High‑volume social/promos:** Radar bundles per source; **Mark bundle read**; faster decay.
* **Follow‑ups:** Threads where **your** last message has no reply after X hours → **Waiting on them** in Debrief; snooze available.
* **Spam:** **Never** read from or move out of Gmail **Spam/Trash**; we query with `-in:spam -in:trash`.
* **Gmail as source of truth:** Archive/read/replies performed in Gmail reflect in Breathe Mail on next sync (2–5 min).
* **Newest message wins:** Always compute the action off the latest message in the thread.
* **Attachment safety:** Never auto‑open; text extraction only on demand.

---

## 6) Technical Architecture

**Frontend**: Next.js + Tailwind
**Backend**: FastAPI (Python)
**DB**: Postgres (SQLite for hackathon ok)
**Embeddings/Clustering**: FAISS in‑proc
**Scheduler**: APScheduler (poll 2–5m; send window pings)
**LLM**: hosted (two calls: classify/extract; summarize newsletters) → **JSON only**
**Integrations**: Gmail API; Telegram Bot API

### Components

* **Ingestor**: list new messages `newer_than:7d -in:spam -in:trash`; fetch headers/snippet; body on demand.
* **Extractor (LLM)**: returns facts (schema above).
* **Scorer**: computes ActionScore, applies Decay & Domain multipliers.
* **Zoner**: maps items to Command/Radar/Magazine/Debrief.
* **Summarizer**: newsletter TL;DR (1–3 bullets + ≤2 links) and topic clusters.
* **Sync Engine**: mirrors Gmail state changes (read/archive/replies).
* **Notifier**: sends window pings + Critical alerts to Telegram.
* **Policy Engine**: allow‑list actions only; quarantine suspicious.
* **Web API**: endpoints below.

---

## 7) Data Model (tables)

**users**: id, email, tz, windows[], telegram_chat_id, vip_emails[], vip_domains[], prefs(jsonb), created_at, updated_at
**messages**: id, gmail_id, thread_id, rfc822_id, from_email, from_domain, subject, received_at, gmail_labels[], lens, zone, action_type, state, deadline_at, amount, currency, score, reasons[], confidence, familiar_domain_score, suspicious, links(jsonb), last_seen_history_id, created_at, updated_at
**domains**: domain(pk), received_count, opened_in_client_count, replied_by_user_count, auth_pass_rate, familiarity, last_seen_at
**newsletter_items**: message_id(fk), summary_bullets[], links[], topics[], utility, cluster_id
**actions_log**: id, message_id, action, actor(user/system/telegram), payload, at

---

## 8) API Contracts (HTTP)

### Auth & Onboarding

* **GET `/auth/google/start`** → redirects to Google OAuth
* **GET `/auth/google/callback`** → sets session; redirects to `/onboarding/telegram`
* **GET `/onboarding/telegram`** → shows **“Start bot”** button linking to `https://t.me/<bot>?start=<one-time-JWT>`
* **POST `/integrations/telegram/link`**
  Body: `{"token":"<one-time-JWT>","chat_id":123456789}`
  → Binds Telegram `chat_id` to user; invalidates token.

### Telegram Webhook

* **POST `/integrations/telegram/webhook`**
  Handles `/start <token>`, callbacks: `not_urgent:<id>`, `snooze:<id>`, etc.
  Responds with `answerCallbackQuery` and updates server state.

### Zones (Dashboard)

* **GET `/zones/command?limit=10&cursor=`**
  → `{"items":[ActionCard…], "next_cursor":null|"..."}`

  ```json
  ActionCard = {
    "id":"msg-uuid","subject":"...","from":{"name":"...","email":"..."},
    "action_type":"pay|approve|review_pr|rsvp|investigate",
    "score":87,"why":["due today","VIP","$1,200"],
    "deadline_at":"2025-10-25T17:00:00Z",
    "primary_cta":{"label":"Pay","href":"<open_in_gmail>"},
    "links":{"open_in_gmail":"...","open_thread":"..."}
  }
  ```
* **GET `/zones/radar`** → `{ "bundles":[ {"source":"LinkedIn","count":24,"ids":["..."]} ] }`
* **GET `/zones/magazine`** → `{ "clusters":[ {"topic":"Today in GenAI","items":[ {"id":"m7","title":"AI Weekly #123","bullets":["..."],"links":[{"title":"..","href":".."}]} ]} ] }`
* **GET `/zones/debrief`** →

  ```json
  {
    "today_summary":{"actions_done":7,"new_criticals":1},
    "waiting_on_them":[{"id":"m19","subject":"PO approval?","since_hours":30}],
    "tomorrow_deadlines":[{"id":"m23","when":"2025-10-25T10:00:00Z","subject":"Invoice due"}]
  }
  ```

### Actions

* **POST `/api/v1/workspaces/{workspaceId}/commands/{commandId}/complete`**
  Headers: `Idempotency-Key: <uuid4>`
  Body:
  ```json
  {
    "actionMetadata": ActionMetadata,
    "completedAtIso": "2025-01-10T14:25:00Z",
    "note": "Paid via Stripe"
  }
  ```
  → Returns `200` with optimistic fragment so the client can drop the card and increment dashboard counters:
  ```json
  {
    "command": { "id": "cmd-123", "status": "resolved" },
    "debrief": { "statistics": { "today": { "actionsResolved": 8 } } }
  }
  ```
  Validation: `commandCardSchema` + `actionMetadataSchema` confirm the command still matches workspace contract before status flips to **resolved**. Side effects: mark command history row `actions_log` with `{action:"complete", actor:"dashboard"}` and trigger downstream sync to Gmail if applicable.

* **POST `/api/v1/workspaces/{workspaceId}/follow-ups/{threadId}/nudge`**
  Headers: `Idempotency-Key: <uuid4>`
  Body:
  ```json
  {
    "reminderChannel": "email",
    "message": "Just checking in on next steps."
  }
  ```
  → Returns `202` with optimistic fragment allowing the UI to label the follow-up as nudged and surface the new reminder timestamp:
  ```json
  {
    "followUp": { "threadId": "thr-42", "nudgedAtIso": "2025-01-10T14:25:00Z" }
  }
  ```
  Validation: `followUpSchema` guards that the referenced thread exists in the Debrief snapshot and emails remain valid before emitting the nudge. Side effects: transition follow-up status to **nudged**, enqueue reminder delivery, and append `{action:"nudge", payload:{channel:"email"}}` to `actions_log`.

* **POST `/api/v1/workspaces/{workspaceId}/awaiting-replies/{threadId}/snooze`**
  Headers: `Idempotency-Key: <uuid4>`
  Body:
  ```json
  {
    "snoozeUntilIso": "2025-01-17T09:00:00Z",
    "reason": "Waiting for vendor availability"
  }
  ```
  → Returns `200` with optimistic fragment so the client can move the thread to the Snoozed panel while showing the updated badge:
  ```json
  {
    "awaitingReply": { "id": "ar-9", "status": "snoozed", "snoozeUntilIso": "2025-01-17T09:00:00Z" },
    "snoozed": [ { "id": "ar-9", "snoozeUntilLabel": "Next Fri" } ]
  }
  ```
  Validation: `awaitingReplySchema` ensures the original awaiting-reply entry is intact and email formatting is correct; snooze window parsed via Zod datetime check before status changes to **snoozed**. Side effects: persist snooze window, move record into `snoozed` collection for the workspace snapshot, and log `{action:"snooze", payload:{until:"..."}}`.

* **POST `/act/:id`**
  Body: `{"action":"done|snooze|not_urgent|mark_read|archive|reassign","lens?":"ops|..."}`
  → 200 with updated card (or 204).
* **POST `/bundles/:bundle_id/mark_read`** → bulk modify for Radar bundles.
* **POST `/magazine/mark-today-read`** → bulk mark newsletter items READ.
* **POST `/allow-domain`** → `{ "domain":"example.com" }` (persist allow, re‑route items).

### Links

* **GET `/link/:id/open-in-gmail`** → 302 to `https://mail.google.com/...#search/rfc822msgid%3A...`
  (Respects `/u/<index>` or `authuser` preference per user.)

### Settings

* **GET `/settings`** / **PATCH `/settings`**
  Fields: windows[], tz, vip_emails[], vip_domains[], prefs (e.g., `newsletter_auto_read=true`), telegram connect/disconnect.

> Error handling (all new POST endpoints):
> * `404` when workspace, command, or thread ids fail `commandCardSchema`/`followUpSchema`/`awaitingReplySchema` lookups → respond with “We couldn’t find that item.”
> * `409` if the item is already resolved/nudged/snoozed → respond with “This item was already updated.”
> * `422` for payload validation failures (missing ISO timestamps, invalid channels/messages) → respond with “Please check the form and try again.”

---

## 9) Gmail Sync Strategy

**MVP: polling**

* `users.messages.list` with `q="newer_than:7d -in:spam -in:trash"`; request labelIds/categories.
* Fetch **headers/snippet first**; full body only when needed for extraction/summarization.
* Detect **SENT** replies and label changes (read/archive) to mirror state.
* Use exponential backoff for quotas.

**Post‑MVP: History API**

* Store per‑user `historyId`; use `users.history.list` for incremental, low‑latency updates.

---

## 10) Security & Privacy

* **Scopes:** `gmail.readonly`, `gmail.modify` (labels/read state only). **No send** by default.
* **Policy engine:** Only allowed actions (label, read/archive, post Telegram). LLM can’t trigger actions directly.
* **Prompt‑injection defenses:** HTML→text, inert links, head+tail truncation, detect “ignore instructions/forward/reply with code” → **Quarantine**.
* **VIP verification:** by email/domain (not display name).
* **Data minimization:** store metadata + summaries; full bodies transient in memory.
* **Encryption:** tokens & secrets at rest; HTTPS in transit.
* **Logs:** no bodies; IDs + actions only.
* **Purge:** one‑click account/data deletion.

---

## 11) Metrics

* Actions completed per window; median time‑to‑complete top action.
* Critical ping precision.
* Magazine top‑tile CTR; % newsletter auto‑read via cluster/day actions.
* Sync latency (Gmail change → Breathe state).

---

## 12) Open Decisions / Clarifications

1. **Reply inline**: keep MVP as **Save draft** (and/or open Gmail), or enable **send** behind a settings toggle?
2. **Delete/Trash in Quarantine** (Journey E): enable “Move to Trash” from Telegram, or default to Archive for MVP?
3. **Newsletter auto‑read trigger**: I propose **on “Mark Today Read” / “Mark Cluster Read”** (explicit), *not* just on viewing tiles—OK?
4. **Follow‑up threshold** for “Waiting on them”: default **24h**, changeable later—OK?
5. **VIP seeds**: any initial domains/emails you want preloaded?

---

If you confirm which **P0 items** to ship and answer the **Open Decisions**, I can finalize this spec and (if you want) hand you a **FastAPI + Next.js scaffold** with these endpoints, DB schema, and Telegram webhooks wired to run the demo.

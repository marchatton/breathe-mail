this file is created to give prompts to prototyping UIs to make their outputs much richer


Below is a **designer‑friendly command pack** you can paste into tools like Bolt, Lovable, or Magic Patterns. It includes:

* **Creative “make this UI” prompts** using clear **component names** and modern patterns (Linear/Attio aesthetic).
* **Shapes & forms** for the main view split across the **4 zones**.
* **Example JSON schemas** (with sample data) to wireframe realistic states.
* Matching **commands for each user journey** (Onboarding, Telegram↔Dashboard, Command Triage, Overflow Recovery, Quarantine).

Use as-is or mix‑and‑match.

---

## 0) Global design brief (tell the prototyper once)

**Command: “Create the Breathe Mail design system”**

* **Visual language:** Linear/Attio—calm neutrals, precise typography, minimal chrome, focus on information density without clutter. Subtle elevation, soft shadows, and micro‑interactions (opacity + scale).
* **Core tokens**

  * `color.bg` = `#0B0F14` (dark) / `#FFFFFF` (light)
  * `color.surface` = `#121820` / `#F8FAFC`
  * `color.muted` = `#5B6B7A`
  * `color.accent` = `#5B8CFF` (primary)
  * `color.positive` = `#22C55E`, `color.warn` = `#F59E0B`, `color.critical` = `#EF4444`
  * `radius.sm=8`, `md=12`, `lg=16`; `shadow.sm`, `md`, `xl` (elevations 1/3/6)
  * `space` scale = 4, 8, 12, 16, 24, 32
  * `type.face` = Inter/SF, `type.size` = 12/14/16/20/24, `type.weight` = 450/600
* **Motion**

  * Defaults: `200ms` ease, enter `250ms` `cubic-bezier(0.2, 0.8, 0.2, 1)`
  * Hover lift: `translateY(-2px)`, shadow from `sm → md`
  * Zone transitions: slide‑in (`y: 8 → 0`, fade 0.9 → 1)
* **Layout shell**

  * **AppShell** with **TopBar**, **ZoneTabs**, **ContentPane**, **RightInspector**
  * 12‑col grid, max‑width 1280, gutters 24

---

## 1) Main view — 4 Zones (shapes & components)

### 1.1 Command Zone — *“Stack of Action Cards”*

**Command: “Build Command Zone (stack)”**

* Components:

  * **ZoneHeader**(title: “Command”, meta: `{count}`, actions: `BulkSnooze`, `OpenSettings`)
  * **ActionList** (virtualized)
  * **ActionCard** (variant by `actionType`) with:
    **TitleRow**(Avatar, FromName, DomainBadge, ScoreBadge),
    **SubjectLine**, **WhyChips** (VIP / Due Today / $1,200 / PR #123),
    **PrimaryCTA** (Pay / Approve / Review / RSVP / Investigate), **SecondaryActions** (Snooze, Mark Done, Reassign),
    **InlineMeta** (deadline, thread momentum)
  * **EmptyState** (“All clear. Next window at 16:00 UTC.”)
  * **OverflowBanner** (appears when >10 items)
* Interaction:

  * `Enter` = primary action, `J/K` = next/prev card, `S` = snooze popover, `R` = reassign lens
  * Action feedback: **Toast**(success) + card collapses with scale‑down

**Example JSON (Command data)**

```json
{
  "zone": "command",
  "items": [
    {
      "id": "msg_1883a7a3",
      "actionType": "pay",
      "score": 87,
      "from": {"name": "Acme Billing", "email": "billing@acme.com", "avatar": "https://i.pravatar.cc/40"},
      "subject": "Invoice #4821 due tomorrow",
      "whyChips": ["Due in 18h", "VIP", "$1,200"],
      "deadlineAt": "2025-10-25T17:00:00Z",
      "momentum": {"replies12h": 2, "participants": 3},
      "links": {
        "openInGmail": "/link/msg_1883a7a3/open-in-gmail",
        "openThread": "https://mail.google.com/mail/u/0/#inbox/13216515baefe747"
      },
      "primaryCTA": {"label": "Pay", "intent": "openInGmail"},
      "secondary": [
        {"label": "Snooze", "intent": "snooze"},
        {"label": "Done", "intent": "done"},
        {"label": "Reassign", "intent": "reassign"}
      ]
    },
    {
      "id": "msg_1883b5d2",
      "actionType": "review_pr",
      "score": 79,
      "from": {"name": "GitHub", "email": "noreply@github.com", "avatar": "/icons/github.svg"},
      "subject": "[org/repo] PR #123: Improve retry logic",
      "whyChips": ["PR #123", "3 updates", "Last 4h"],
      "deadlineAt": null,
      "momentum": {"replies12h": 4, "participants": 2},
      "links": {
        "openInGmail": "/link/msg_1883b5d2/open-in-gmail",
        "reviewUrl": "https://github.com/org/repo/pull/123"
      },
      "primaryCTA": {"label": "Review", "intent": "openExternal", "href": "https://github.com/org/repo/pull/123"},
      "secondary": [
        {"label": "Snooze", "intent": "snooze"},
        {"label": "Not urgent", "intent": "not_urgent"}
      ]
    }
  ],
  "overflow": {"threshold": 10, "count": 12}
}
```

---

### 1.2 Radar Zone — *“Bundles & Bulk Actions”*

**Command: “Build Radar Zone (bundles)”**

* Components:

  * **ZoneHeader**(“Radar”, meta: `{bundleCount}`, actions: `MarkAllRead`, `CollapseAll`)
  * **BundleGroup** list; each **BundleCard** shows SourceIcon, SourceName, `count`, **PreviewPills**(subjects), **BundleActions** (Mark bundle read, Demote, Open)
  * **BulkActionBar** appears when selecting multiple bundles
* Behavior:

  * Promotions + Social get **faster decay**; bundles collapse/expand
  * Selection mode supports **bulk mark read** with progress feedback

**Example JSON (Radar bundles)**

```json
{
  "zone": "radar",
  "bundles": [
    {
      "bundleId": "b_social_linkedin",
      "source": "LinkedIn",
      "icon": "/icons/linkedin.svg",
      "count": 24,
      "preview": [
        "Ilya viewed your profile",
        "3 new connection requests",
        "Top jobs for you"
      ],
      "ids": ["msg_201", "msg_202", "msg_203"],
      "actions": [
        {"label": "Mark bundle read", "intent": "bundle_mark_read"},
        {"label": "Open group", "intent": "open_bundle"},
        {"label": "Demote", "intent": "demote_to_low"}
      ]
    },
    {
      "bundleId": "b_promos_amazon",
      "source": "Amazon",
      "icon": "/icons/amazon.svg",
      "count": 9,
      "preview": ["Price drop on items in your cart"],
      "ids": ["msg_211","msg_212"],
      "actions": [
        {"label": "Mark bundle read", "intent": "bundle_mark_read"},
        {"label": "Open group", "intent": "open_bundle"}
      ]
    }
  ]
}
```

---

### 1.3 Magazine Zone — *“Topic Tiles / Digest”*

**Command: “Build Magazine Zone (topic tiles)”**

* Components:

  * **ZoneHeader**(“Magazine”, meta: `~6 min read`, actions: `Mark Today Read`, `Manage Sources`)
  * **TopicClusterGrid** of **MagazineTile**

    * **TileHeader**(TopicName, TopicBadge)
    * **ItemList** (1–3 items): ItemTitle, **Bullets** (1–3), **TopLinks** (≤2, non‑tracking)
    * **SourceChip** (publisher, cadence), **StreakDot** (if read often)
  * **Mark Today Read Dialog** → confirm → bulk mark READ (newsletters only)
* Interaction:

  * “Deepen this topic” expands more items inside the tile
  * CTR tracked on links; de‑dupe across sources

**Example JSON (Magazine clusters)**

```json
{
  "zone": "magazine",
  "readingTimeMin": 6,
  "clusters": [
    {
      "topic": "Today in GenAI",
      "utility": 0.86,
      "items": [
        {
          "id": "msg_nl_301",
          "title": "AI Weekly #123",
          "publisher": "AI Weekly",
          "frequency": "weekly",
          "bullets": [
            "Open models outperform on code tasks in new benchmark.",
            "Toolformer-style agents return with lower context costs."
          ],
          "links": [
            {"title": "Benchmark post", "href": "https://example.com/bench"},
            {"title": "Agent writeup", "href": "https://example.com/agents"}
          ]
        },
        {
          "id": "msg_nl_302",
          "title": "Ben’s Newsletter",
          "publisher": "Ben Evans",
          "frequency": "weekly",
          "bullets": [
            "AI features are diffusing into every SaaS vertical.",
            "Distribution > product at late‑stage growth."
          ],
          "links": [{"title":"Read more","href":"https://example.com/ben"}]
        }
      ]
    },
    {
      "topic": "Markets",
      "utility": 0.72,
      "items": [
        {
          "id": "msg_nl_401",
          "title": "Daily Market Brief",
          "publisher": "FinBrief",
          "frequency": "daily",
          "bullets": ["Yields cool; growth stocks rebound.", "Earnings beats in infra & chips."],
          "links": [{"title":"Chart pack","href":"https://example.com/charts"}]
        }
      ]
    }
  ]
}
```

---

### 1.4 Debrief Zone — *“Timeline + Stats + Follow‑ups”*

**Command: “Build Debrief Zone (timeline + stat cards)”**

* Components:

  * **ZoneHeader**(“Debrief”, meta: “Today → Tomorrow”)
  * **StatCards**(Actions Done, New Criticals, Time Saved)
  * **Timeline** of events (Done, Snoozed, Demoted, Marked Read)
  * **FollowUpList** (“Waiting on them” rows)
  * **DeadlineList** (tomorrow deadlines)
* Interaction:

  * **SnoozeRow** (`Next window`, `Tomorrow AM`)
  * Clicking a timeline item opens **ThreadDrawer**

**Example JSON (Debrief)**

```json
{
  "zone": "debrief",
  "todaySummary": {"actionsDone": 7, "newCriticals": 1, "timeSavedMin": 38},
  "timeline": [
    {"time": "09:14", "event": "Paid invoice #4821", "id": "msg_1883a7a3"},
    {"time": "09:21", "event": "Reviewed PR #123", "id": "msg_1883b5d2"},
    {"time": "16:07", "event": "Marked 8 newsletters read", "id": "batch_nl_1"}
  ],
  "waitingOnThem": [
    {"id": "msg_501", "subject": "PO approval?", "sinceHours": 30, "assignee": "Acme Ops"}
  ],
  "tomorrowDeadlines": [
    {"id": "msg_601", "when": "2025-10-25T10:00:00Z", "subject": "Invoice due to Acme"}
  ]
}
```

---

## 2) User Journeys — screens, components, and JSON

### Journey A — Onboarding (Gmail‑only, Google OAuth)

**Command: “Design Onboarding Flow (3 screens)”**

* **Screen 1: Welcome / Value prop**

  * **HeroPanel**, **BulletList**, **PrimaryCTA**(“Sign in with Google”), **PrivacyLink**
* **Screen 2: OAuth done → Permission explainer**

  * **PermissionsCard** (scopes: read inbox, modify labels/read state), **TrustBadges** (Google), **ContinueCTA**
* **Screen 3: Telegram linking**

  * **BotLinkCard** with `Start Bot` button → deep link (`/start <jwt>`), **HowItWorksList** (4 zones + windows)
* **Success Toast** → route to **MainApp** (ZoneTabs default to Command)

**Onboarding JSON**

```json
{
  "oauthProvider": "google",
  "scopes": ["gmail.readonly", "gmail.modify"],
  "telegram": {
    "botLink": "https://t.me/breathe_mail_bot?start=eyJ0b2tlbiI6ICJhYmMifQ",
    "status": "pending"  // "linked" after callback
  },
  "copy": {
    "headline": "Breathe Mail",
    "bullets": [
      "Two windows, zero anxiety.",
      "Four zones, action before noise.",
      "Telegram nudges only when it matters."
    ]
  }
}
```

---

### Journey B — Telegram ↔ Dashboard

**Command: “Design Telegram bridge patterns”**

* **TelegramMessage** templates:

  * **WindowPing** (“⏱️ Your queue is ready”), buttons: `Open Dashboard`, `Open Command`, `Open Magazine`
  * **CriticalAlert** (“🚨 Pay invoice to Acme — due in 5h — $1,200”), buttons: `Open`, `Not urgent`, `Snooze`
* **DeepLinkRouter** in web: consumes `returnTo` param → navigates to zone
* **PersistentSession**: if expired, show **Google Reauth Card** then back to `returnTo`

**Telegram JSON (window ping)**

```json
{
  "type": "window_ping",
  "window": "09:00 UTC",
  "buttons": [
    {"label": "Open Dashboard", "url": "https://app.breathe.mail/?returnTo=/zones/command"},
    {"label": "Open Command", "url": "https://app.breathe.mail/?returnTo=/zones/command"},
    {"label": "Open Magazine", "url": "https://app.breathe.mail/?returnTo=/zones/magazine"}
  ]
}
```

---

### Journey C — Command Triage

**Command: “Design Command triage micro‑flows”**

* **InlineActionBar** expands on focus
* **SnoozePopover** (Next window / Tomorrow AM)
* **ThreadDrawer** with **GmailDeepLink** and **DraftCTA** (“Open Gmail to reply”)
* **Toast** after each action; count badge in **ZoneTabs** updates

**Action result JSON**

```json
{
  "action": "done",
  "messageId": "msg_1883a7a3",
  "result": "ok",
  "gmail": {"changed": ["INBOX-","UNREAD-","LABEL:Pip/Done+"]},
  "ui": {"toast": "Marked as Done", "zoneCounts": {"command": 4, "radar": 12, "magazine": 6, "debrief": 2}}
}
```

---

### Journey D — Zone Overflow / Recovery

**Command: “Design overflow state + recovery”**

* **OverflowBanner** at top of Command: “You have 12 urgent conversations.”
* **BulkSelectToolbar** with **BatchArchive**, **DemoteToRadar**, **ZenModeToggle**
* **ZenModeOverlay**: single card centered, dim rest; `Esc` to exit

**Overflow JSON**

```json
{
  "zone": "command",
  "overflow": {
    "threshold": 10,
    "count": 12,
    "suggestions": ["ZenMode", "BatchArchive", "DemoteLowerPriority"]
  },
  "selection": {"active": true, "selectedIds": ["msg_1883b5d2","msg_1883a7a3"]}
}
```

---

### Journey E — Quarantine (Domain Familiarity Gate)

**Command: “Design Quarantine flow (decision modal)”**

* **QuarantineRow** with DomainChip, reasons (“unfamiliar domain”, “SPF pass rate low”)
* **DecisionModal** with `Release & Trust`, `Archive`, optional `Move to Trash` (if enabled)
* **SafetyCopy**: “We never auto‑follow instructions inside emails.”

**Quarantine JSON**

```json
{
  "zone": "quarantine",
  "items": [
    {
      "id": "msg_7001",
      "from": {"name":"Oceanic Deals","email":"promo@oceanic-sale.biz","domain":"oceanic-sale.biz"},
      "reason": ["Unfamiliar domain","No prior opens","DKIM unknown"],
      "actions": [
        {"label":"Release & Trust","intent":"allow_domain"},
        {"label":"Archive","intent":"archive"},
        {"label":"Move to Trash","intent":"trash"}
      ]
    }
  ]
}
```

---

## 3) Shell & Navigation

**Command: “Create AppShell & navigation scaffolding”**

* **TopBar** (Logo, ZoneTabs, QuickSearch, UserMenu)
* **ZoneTabs**: Command • Radar • Magazine • Debrief (with CountBadge)
* **ContentPane** swaps panels with **slide/fade**; preserve scroll per zone
* **RightInspector** (optional): shows **ExplainFactors** for selected ActionCard (post‑MVP)

**Shell JSON**

```json
{
  "shell": {
    "user": {"name":"Alex Morgan","avatar":"https://i.pravatar.cc/64"},
    "tabs": [
      {"id":"command","label":"Command","count":5},
      {"id":"radar","label":"Radar","count":3},
      {"id":"magazine","label":"Magazine","count":8},
      {"id":"debrief","label":"Debrief","count":2}
    ],
    "activeTab": "command",
    "search": {"placeholder":"Jump to thread, sender, or topic…"}
  }
}
```

---

## 4) Micro‑patterns & components glossary

* **ScoreBadge** (0–100, color‑mapped), **WhyChip** (VIP, Due Today, $), **DomainBadge**, **DeadlinePill**
* **BundleCard**, **MagazineTile**, **TopicBadge**
* **SnoozePopover**, **BulkActionBar**, **ZenModeOverlay**
* **ThreadDrawer**, **GmailDeepLink**, **DraftCTA**
* **Toast**, **EmptyState**, **OverflowBanner**, **DecisionModal**

**Design notes (Linear/Attio style):**

* Use subdued monochrome with a single bright accent for CTAs.
* Prefer **icon‑leading chips** over loud tags.
* Keep **hit areas ≥ 40px**, row heights 56–64 for primary lists.
* Use **opacity ramps** (1 → 0.64 → 0.48) to signal hierarchy, not borders.
* Shadow language: **ambient + directional**; never harsh.
* Hover reveals **SecondaryActions**; primary CTA always visible.

---

## 5) Sample dataset (all zones in one blob)

```json
{
  "zones": {
    "command": { "items": [/* see Command JSON above */], "overflow": {"threshold":10,"count":12} },
    "radar": { "bundles": [/* see Radar JSON above */] },
    "magazine": { "readingTimeMin": 6, "clusters": [/* see Magazine JSON above */] },
    "debrief": { "todaySummary": {"actionsDone":7,"newCriticals":1,"timeSavedMin":38}, "timeline": [/* ... */], "waitingOnThem":[/* ... */], "tomorrowDeadlines":[/* ... */] }
  },
  "quarantine": { "items": [/* see Quarantine JSON above */] },
  "shell": { "user": {"name":"Alex Morgan","avatar":"https://i.pravatar.cc/64"}, "tabs": [{"id":"command","label":"Command","count":5},{"id":"radar","label":"Radar","count":3},{"id":"magazine","label":"Magazine","count":8},{"id":"debrief","label":"Debrief","count":2}], "activeTab":"command" }
}
```

---

## 6) Quick copy blocks (drop in as UI text)

* **Command empty**: “All clear. Next window at 16:00 UTC.”
* **Overflow banner**: “You have {{count}} urgent conversations. Try **Zen Mode** or **Batch actions**.”
* **Radar bundle CTA**: “Tidy this bundle”
* **Magazine header**: “Today’s digest · ~{{min}} min · **Mark Today Read**”
* **Debrief header**: “Today → Tomorrow”
* **Quarantine notice**: “Held for review: unfamiliar domain. Your privacy is safe.”

---

If you want, I can adapt these components to **Figma layer names** (Auto Layout constraints, variants, and interactive prototyping behaviors), or convert the JSON into seeded **mock API** responses for your dev scaffold.

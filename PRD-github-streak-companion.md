# PRD: GitHub Streak Companion

## 1. Overview

**Product name:** GitHub Streak Companion (working title)

**Summary:** A web app that helps developers maintain their GitHub contribution streak by tracking daily contributions, sending push notifications when the day is running out with no activity, and letting the user commit a short, genuine daily log entry to a dedicated repo — keeping the streak alive with real substance instead of empty filler commits.

**Motivation:** Users often forget to keep their streak going, breaking chains they've built over a long time. Instead of meaningless filler commits, the app turns "keeping the streak" into a habit of writing a short daily log — meaningful and transparent, not a gaming/fraud mechanism.

## 2. Goals & Non-goals

### Goals
- G1: User never "accidentally" breaks their streak by forgetting
- G2: Every streak-preserving commit contains real content (a short log entry), never an empty commit
- G3: Fast log-entry experience (<30s) — no added friction
- G4: Multi-user-ready architecture from the MVP, even though it launches for a single founder-user first
- G5: Permission model stays minimal and transparent — the app should never look like it can touch repos it has no business touching

### Non-goals (deferred to later versions)
- No rich-text journal editor
- No social/leaderboard features in v1
- No two-way sync if the user edits the file directly on GitHub (v1)
- No streak-break prediction / forecasting (see "Rejected / Deferred" section — this needs real historical data the MVP doesn't have yet)

## 3. Target users

**Primary persona:** An individual developer with a public GitHub profile who cares about their contribution graph reflecting genuine daily effort, and who is prone to losing track late in the day.

## 4. User Stories

- As a user, I want to sign in with GitHub so the app knows my contributions without manual entry
- As a user, I want to grant access to only the repo the app needs, not my entire GitHub account
- As a user, I want to be notified (push) at an early check-in time and again closer to end of day if I still have zero contributions
- As a user, I want to see at a glance whether my streak is safe, at risk, or critical today
- As a user, I want to tap the notification and quickly enter a short log of what I did/learned today
- As a user, I want that log automatically committed to a dedicated repo as a per-day file, in a consistent format
- As a user, I want to see my current streak, longest streak, and how many days the app has "saved" for me
- As a user, I want to be warned if "include private contributions" isn't enabled (to avoid the silent bug where the streak doesn't show up)

## 5. System Architecture

### 5.1 Stack
- Frontend/Backend: Next.js (App Router), deployed on Vercel
- DB: Postgres (Vercel Postgres or Supabase)
- Auth/GitHub access: **GitHub App** (not OAuth App) — see 5.5 for rationale
- Notifications: Web Push API (VAPID keys + Service Worker)
- Scheduling: Vercel Cron (hourly)
- GitHub integration: GraphQL API (read contribution calendar) + Contents API (write file/commit)

### 5.2 Data model (core tables)

**users**
- id, github_id, github_installation_id, timezone, first_reminder_hour, last_reminder_hour, private_contributions_enabled (bool, cached from GitHub), created_at

**push_subscriptions**
- id, user_id (FK), endpoint, p256dh_key, auth_key

**daily_logs**
- id, user_id (FK), log_date, content (text), commit_sha, commit_status (pending/success/failed), created_at, updated_at

### 5.3 Core loop (sequence)
1. Cron runs hourly → queries `users` where `first_reminder_hour` OR `last_reminder_hour` matches the current hour in the user's `timezone`
2. For each matching user, call GitHub GraphQL to check today's `contributionsCollection` (per user timezone)
3. Compute streak status: **Safe** (already contributed today), **At Risk** (no contribution yet, before last reminder), **Critical** (no contribution yet, at/after last reminder)
4. If status is At Risk or Critical → send Web Push (copy tone escalates for Critical, but it's the same notification flow, not a separate feature)
5. User taps push → opens the log entry form
6. On submit → write to `daily_logs` (status=pending) → call Contents API to commit to `daily-log/logs/YYYY-MM-DD.md` using the standard template (5.4) → update status=success/failed (retry on failure)
7. Dashboard reads from `daily_logs` (not calling GitHub API on every load) to render streak, heatmap, and status

### 5.4 Repo & file structure

```text
daily-log/
└── logs/
    ├── 2026-07-21.md
    ├── 2026-07-22.md
    └── 2026-07-23.md
```

Standard template per file:

```md
# July 23, 2026

## Today

Finished Stripe interview prep.

Learned:
- Web Push API
- GitHub GraphQL

Tomorrow:
- Build notification service
```

Locking this structure and template before writing code matters: changing file format after real logs exist means a migration. Decide once, up front.

### 5.5 Why GitHub App instead of OAuth App

- OAuth App with `repo` scope grants read/write to **all** repos, including private ones — this directly contradicts the product's own positioning (transparent, no fake activity, no unnecessary access)
- A GitHub App lets the user install it on exactly one repo (`daily-log`), which is the trust story the product is selling
- This is treated as a v1 requirement, not a v2 upgrade — migrating the auth/token model later (OAuth → App) is expensive once users exist; better to build it right the first time

### 5.6 Source of Truth
- GitHub is the source of truth for commit content
- DB is a cache/index for fast rendering + ensures no data loss if the GitHub API temporarily fails (retry queue)

## 6. Onboarding Flow

1. **Login with GitHub** (via GitHub App install flow)
2. **Install app on repo** — create new (`daily-log`) or select existing
3. **Enable notifications** — grant push permission, set first/last reminder hours
4. **Verify contribution settings** — app checks "Include private contributions on profile" and warns if disabled
5. **Success screen** — shows current streak pulled from GitHub (e.g. "Current streak: 148 days")

## 7. Dashboard Content

- Streak status badge: Safe / At Risk / Critical
- Current streak
- Longest streak
- Total logs written
- Days protected by the app (days where the app's reminder led to a saved log) — a meaningful secondary metric, distinct from raw streak count
- Heatmap of logged days

## 8. Non-functional Requirements

- Timezone-aware: all "today"/"end of day" calculations must use the user's timezone, not server UTC
- Security: GitHub App private key and installation tokens handled server-side only, never exposed to client
- Resilience: if the GitHub API is rate-limited/down, the log entry is still saved in the DB, with the commit retried later
- Minimal permissions: GitHub App requests only the scopes needed for the single target repo

## 9. Success Metrics (MVP)

- % of days the user maintains their streak after adopting the app (vs. before)
- Push notification → completed log entry conversion rate (tracked separately for first vs. last reminder)
- Retention: active users after 2 weeks, 1 month

## 10. Rejected / Deferred (with rationale)

- **Streak-break prediction (e.g. "42% chance of breaking this week")** — Rejected for v1. Requires meaningful historical data per user that doesn't exist yet at MVP stage. Faking or hand-waving this number for a "feels like AI" effect would itself be a form of fake signal — directly contradicting the product's own "no fake activity" positioning. Revisit only once there's a real data pipeline with enough history per user (Phase 3+).
- **"Emergency Mode" as a separate feature** — Not adopted as a distinct feature. Its underlying value (urgent copy near the deadline) is already covered by the escalated tone of the last reminder in the two-tier reminder system (Section 5.3). Keeping it as a tone variant, not a separate UI flow, avoids unnecessary surface area.
- **Two-way GitHub sync (webhook)** — Deferred to Phase 3. Adds real complexity (webhook handling, conflict resolution) not needed for MVP validation.

## 11. Roadmap

**Phase 1 (MVP — core loop):** GitHub App auth, cron check with two-tier reminders, streak status, push notifications, log form + standard template, GitHub commit, onboarding flow, dashboard with status/metrics

**Phase 2:** Streak freeze, log tags/categories, monthly log export

**Phase 3:** Weekly AI summary, streak-break prediction (once enough historical data exists), opt-in leaderboard among friends, two-way webhook sync
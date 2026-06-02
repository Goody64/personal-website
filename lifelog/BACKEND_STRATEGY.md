# Database & Mobile App Strategy

This document outlines how to evolve Life ERP from localStorage to a real backend and mobile app.

## Current State
- **Storage**: Browser localStorage (client-side only)
- **Limitations**: No sync across devices, no phone app, data lost if browser storage cleared

---

## Schema-Flexible Storage (Recommended)

**Goal**: Store everything without tying the DB to your schema. Add new activity types, change fields, rename things—zero migrations.

### Approach: Blob-per-domain

Store each "domain" as a **single JSON blob**. The DB has no idea what's inside. Your app defines the shape; the DB just stores it.

| Domain   | What it stores                          | Shape (you define) |
|----------|-----------------------------------------|--------------------|
| lifeLog  | All activity entries                    | `[{ id, type, date, data, ... }]` |
| finance  | Transactions + metadata                 | `{ transactions: [...] }` |
| journal  | Journal entries                         | `[{ id, title, content, date }]` |
| tasks    | Tasks                                   | `[{ id, title, ... }]` |
| goals    | Goals                                   | `[{ id, title, ... }]` |
| habits   | Habits                                  | `[{ id, name, ... }]` |

**DB schema (minimal):**

```sql
-- One table. That's it.
CREATE TABLE user_data (
  user_id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, domain)
);
```

**Example rows:**
```
user_id | domain  | data
--------|---------|--------------------------------------------------
abc123  | lifeLog | [{"id":"x","type":"meal","date":"2025-01-31","data":{...}}]
abc123  | finance | {"transactions":[{"id":"y","type":"expense","amount":12.47}]}
abc123  | journal | [{"id":"z","title":"Day 1","content":"..."}]
```

**Why this works:**
- Add a new activity type (e.g. `podcast`)? Just add it to `ACTIVITY_TYPES` in your app. No DB change.
- Change meal fields? Update the form. Stored JSON adapts.
- Rename `repeat` to `rewatchCount`? Migrate in app code or on load; DB doesn't care.
- The DB never validates structure—it's opaque JSON.

**Supabase**: Use a single `user_data` table as above. `data` is JSONB.
**Firebase**: `users/{userId}/data/{domain}` documents. Each document = one domain's blob.
**Vercel KV / Upstash**: Key = `{userId}:{domain}`, value = JSON string.

---

## Phase 1: Add a Backend API

### Option A: Supabase (Recommended for speed)
- **What**: Hosted PostgreSQL + Auth + Realtime
- **Why**: Free tier, built-in auth, realtime sync, REST/GraphQL APIs
- **Effort**: 1–2 days to add API layer
- **Migration**: Export localStorage → import via API script

### Option B: Firebase (Firestore)
- **What**: NoSQL document store + Auth
- **Why**: Good mobile SDKs, offline support
- **Effort**: Similar to Supabase
- **Tradeoff**: Less flexible queries than SQL

### Option C: Custom backend (Node + PostgreSQL)
- **What**: Express/Fastify + Postgres on Railway/Render/Fly.io
- **Why**: Full control, any schema
- **Effort**: 3–5 days
- **Best for**: Long-term, complex features

---

## Phase 2: Data Layer Abstraction

Create a `dataService.js` that hides storage. Same interface whether you use localStorage or a backend:

```javascript
// dataService.js - swap implementation without changing app code
const DOMAINS = ['lifeLog', 'finance', 'journal', 'tasks', 'goals', 'habits'];
const STORAGE_PREFIX = 'lifeErp_';

const dataService = {
  async get(domain) {
    if (USE_BACKEND) {
      const res = await fetch(`/api/data/${domain}`);
      const row = await res.json();
      return row?.data ?? getDefault(domain);
    }
    return getFromStorage(STORAGE_PREFIX + domain) ?? getDefault(domain);
  },
  async save(domain, data) {
    if (USE_BACKEND) {
      await fetch(`/api/data/${domain}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      localStorage.setItem(STORAGE_PREFIX + domain, JSON.stringify(data));
    }
  }
};

function getDefault(domain) {
  if (domain === 'finance') return { transactions: [] };
  return [];
}
```

- **Benefit**: Swap localStorage for API calls without rewriting the app
- **Migration**: Export from localStorage, POST each domain to API, then flip `USE_BACKEND`

---

## Phase 3: Mobile App

### Option A: PWA (Progressive Web App)
- **What**: Add a service worker + manifest so the site installs like an app
- **Why**: No app store, one codebase, works on iOS/Android
- **Effort**: ~1 day
- **Limitation**: iOS PWA support is weaker (no background sync, limited storage)

### Option B: React Native / Expo
- **What**: JavaScript app that compiles to native iOS/Android
- **Why**: Real app, app store, push notifications, offline
- **Effort**: 1–2 weeks for a first version
- **Approach**: Reuse logic, rebuild UI with React Native components

### Option C: Capacitor (wrap existing web app)
- **What**: Put your current HTML/JS/CSS in a native shell
- **Why**: Fastest path to an app store listing
- **Effort**: ~2–3 days
- **Approach**: `npm init @capacitor/app` → add your admin as the webview

---

## Recommended Path

1. **Now**: Keep localStorage, add `dataService.js` abstraction
2. **Next**: Add Supabase (or Firebase) backend, migrate data
3. **Then**: Wrap with Capacitor for a quick mobile app
4. **Later**: If needed, build a React Native app for a better mobile UX

---

## Auth

- **Supabase/Firebase**: Built-in email/password, OAuth (Google, Apple)
- **Custom**: JWT or session cookies
- **Mobile**: Same auth; store token securely (Keychain/Keystore)

---

## Data Migration

1. User clicks "Export" (already exists) → downloads JSON
2. After backend is live: "Import to cloud" button → POST each domain to API
3. Or: One-time migration script that reads localStorage and syncs to API

---

## Scaling for Production / Marketing

If you want to roll out Life ERP to many users, these changes will be needed:

### 1. Auth Model

**Current:** Admin gate (single shared password) → then optional Supabase sign-in for cloud sync.

**For multi-tenant product:** Remove the admin gate. Users sign in with Supabase Auth directly. The dashboard becomes the main app after login. Add a landing page, sign-up flow, and redirect unauthenticated users to login.

### 2. Per-Event Storage (instead of blob-per-domain)

**Current:** One JSON blob per domain. Load everything, modify, save everything.

**At scale:** Store each entry as its own row. Faster reads, smaller writes, supports pagination.

```sql
-- life_log: one row per entry
CREATE TABLE life_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_life_log_user_date ON life_log(user_id, date);

-- Similar: finance_transactions, journal_entries, tasks, goals, habits
```

**Benefits:** Query "entries for Jan 2025" with `WHERE date BETWEEN ...` instead of loading 50k entries. Insert/update/delete single rows. No blob size limits.

### 3. Pagination & Lazy Loading

**Current:** Load entire dataset on app init.

**At scale:**
- **Calendar:** Load only entries for visible month(s). `SELECT * FROM life_log WHERE user_id = ? AND date BETWEEN ? AND ?`
- **Library:** Aggregate in SQL. `SELECT type, data->>'show' as show, COUNT(*) FROM life_log WHERE user_id = ? GROUP BY ...`
- **Finance:** Load transactions for current view, paginate history.
- **Infinite scroll** or "Load more" for long lists.

### 4. Infrastructure & Cost

| Users | Supabase tier | Notes |
|-------|---------------|-------|
| &lt; 500 | Free | 500MB DB, 50K monthly active users |
| 500–10K | Pro ($25/mo) | 8GB DB, more API requests |
| 10K+ | Team/Enterprise | Dedicated resources, SLA |

**Other:** Rate limiting, backups, monitoring, CDN for static assets.

### 5. Product Considerations

- **Landing page** – Value prop, screenshots, sign-up CTA
- **Onboarding** – First-time user flow, sample data
- **Billing** – Stripe if monetizing (free tier + paid plans)
- **Legal** – Terms of service, privacy policy, GDPR if EU users
- **Mobile** – PWA or Capacitor wrap for app store

### Migration Path (blob → per-event)

1. Add new per-event tables alongside `user_data`
2. Migrate: Read blob, insert each entry into new table
3. Update `dataService` to use new tables (get by date range, insert/update/delete single rows)
4. Deprecate blob reads; eventually remove `user_data` for lifeLog/finance/journal

---

## TL;DR – Schema-Flexible Path

1. **DB**: One table `user_data(user_id, domain, data JSONB)`. Store each domain (lifeLog, finance, etc.) as a blob.
2. **App**: Define structure in `ACTIVITY_TYPES` and forms. DB never validates it.
3. **Changes**: Add/rename/remove fields in app code only. No migrations.
4. **Abstraction**: Add `dataService.js` so you can swap localStorage ↔ API without touching the rest of the app.

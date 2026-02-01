# Database & Mobile App Strategy

This document outlines how to evolve Life ERP from localStorage to a real backend and mobile app.

## Current State
- **Storage**: Browser localStorage (client-side only)
- **Limitations**: No sync across devices, no phone app, data lost if browser storage cleared

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

Create a `dataService.js` that hides storage:

```javascript
// dataService.js - switch implementation without changing app code
const dataService = {
  async getLifeLog() {
    if (USE_BACKEND) return api.get('/life-log');
    return JSON.parse(localStorage.getItem('lifeErp_lifeLog') || '[]');
  },
  async saveLifeLog(data) {
    if (USE_BACKEND) return api.post('/life-log', data);
    localStorage.setItem('lifeErp_lifeLog', JSON.stringify(data));
  },
  // ... same pattern for tasks, goals, habits, etc.
};
```

- **Benefit**: Swap localStorage for API calls without rewriting the app
- **Migration**: Export from localStorage, POST to API, then flip `USE_BACKEND`

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

## Schema (for backend)

```sql
-- life_log entries
CREATE TABLE life_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Similar tables for tasks, goals, habits, finance, journal
```

---

## Auth

- **Supabase/Firebase**: Built-in email/password, OAuth (Google, Apple)
- **Custom**: JWT or session cookies
- **Mobile**: Same auth; store token securely (Keychain/Keystore)

---

## Data Migration

1. User clicks "Export" (already exists) → downloads JSON
2. After backend is live: "Import to cloud" button → POST to API
3. Or: One-time migration script that reads localStorage and syncs to API

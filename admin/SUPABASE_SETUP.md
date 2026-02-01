# Supabase Setup (Free – Cross-Device Sync)

Follow these steps to enable cloud sync for Life ERP. **No credit card required.**

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**
3. Choose a name, password, and region
4. Wait for the project to be created (~2 min)

## 2. Run the SQL

1. In your Supabase project, open **SQL Editor**
2. Paste and run the contents of `SUPABASE_SETUP.sql` (or the SQL below)
3. This creates the `user_data` table and Row Level Security (RLS) policies

```sql
-- Create user_data table (schema-flexible blob storage)
CREATE TABLE IF NOT EXISTS user_data (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, domain)
);

-- Enable RLS
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users can read own data" ON user_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON user_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON user_data
  FOR DELETE USING (auth.uid() = user_id);
```

## 3. Get Your Keys

1. In Supabase, go to **Project Settings** → **API**
2. Under **Project API keys**, copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon** / **public** key only — NOT the `service_role` key
3. **Important:** Use the **anon** key. The `service_role` key must never be used in the browser — it will cause "Forbidden use of secret API key in browser"

## 4. Add GitHub Secrets

The deploy workflow injects config from GitHub Secrets. Add these in your repo:

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Value |
|--------|-------|
| `SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` |
| `SUPABASE_ANON_KEY` | The **anon** (public) key — NOT the service_role key |

**Warning:** If you use the `service_role` key by mistake, you'll get "Forbidden use of secret API key in browser". In Supabase → Project Settings → API, use the key labeled **anon** / **public**.

The deploy workflow will add `SUPABASE_CONFIG` to the generated `admin-config.js` when both secrets exist. If either is missing, cloud sync is disabled (localStorage only).

## 5. Disable email confirmation (required)

Supabase sends confirmation emails by default. **Turn this off** or you'll hit rate limits and get "email rate exceeded" errors:

1. Go to **Authentication** → **Providers** → **Email**
2. Turn off **Confirm email**
3. Save

**Why:** Supabase's default SMTP allows only ~2 emails/hour. Confirmation emails count against this. Disabling it lets users sign in immediately without emails.

**If you need confirmation emails:** Set up custom SMTP (Resend, SendGrid, etc.) in **Project Settings** → **Auth** → **SMTP** to bypass the limit.

## Done

- Sign up or sign in from the dashboard header ("Sign in to sync")
- Local data is automatically imported to the cloud on first sign-in
- Data syncs across devices when you sign in with the same account

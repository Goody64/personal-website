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
2. Copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## 4. Add GitHub Secrets

The deploy workflow injects config from GitHub Secrets. Add these in your repo:

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Value |
|--------|-------|
| `SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` |
| `SUPABASE_ANON_KEY` | Your anon/public key from Supabase |

The deploy workflow will add `SUPABASE_CONFIG` to the generated `admin-config.js` when both secrets exist. If either is missing, cloud sync is disabled (localStorage only).

## 5. Enable Auth (if needed)

Supabase Auth is enabled by default. For email/password:

1. Go to **Authentication** → **Providers**
2. **Email** should be enabled
3. (Optional) Disable "Confirm email" in **Auth** → **Email Templates** if you want instant sign-up without verification

## Done

- Sign up or sign in from the dashboard header ("Sign in to sync")
- Local data is automatically imported to the cloud on first sign-in
- Data syncs across devices when you sign in with the same account

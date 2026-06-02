-- Travel / Trips - Supabase Setup
-- Run this in Supabase SQL Editor (Project -> SQL Editor).
-- Reuses the SAME Supabase project as Life ERP. Travel posts are PUBLICLY READABLE
-- (so visitors can browse without an account) but only YOU (a signed-in account) can write.

-- ============================================================
-- 1. Posts table (one row per hike / place / review)
-- ============================================================
CREATE TABLE IF NOT EXISTS travel_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL DEFAULT 'hike',          -- 'hike' | 'place'
  title        TEXT NOT NULL,
  location     TEXT,                                  -- e.g. "Yosemite National Park, CA"
  region       TEXT,                                  -- e.g. "California", "Iceland"
  lat          DOUBLE PRECISION,
  lng          DOUBLE PRECISION,
  date         DATE,                                  -- when you went
  rating       NUMERIC,                               -- 0-5 (half steps allowed)
  distance_km  NUMERIC,                               -- hikes
  elevation_m  NUMERIC,                               -- hikes (gain)
  duration     TEXT,                                  -- free text e.g. "5h 30m" / "weekend"
  difficulty   TEXT,                                  -- 'easy' | 'moderate' | 'hard' | 'expert'
  tags         TEXT[] DEFAULT '{}',
  cover_url    TEXT,                                  -- hero image
  photos       JSONB DEFAULT '[]',                    -- [{ "url": "...", "caption": "..." }]
  summary      TEXT,                                  -- short blurb shown on cards
  body         TEXT,                                  -- the full writeup (Markdown supported)
  published    BOOLEAN DEFAULT TRUE,                  -- false = draft (hidden from visitors)
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_travel_posts_date ON travel_posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_travel_posts_type ON travel_posts(type);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION set_travel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_travel_updated_at ON travel_posts;
CREATE TRIGGER trg_travel_updated_at
  BEFORE UPDATE ON travel_posts
  FOR EACH ROW EXECUTE FUNCTION set_travel_updated_at();

-- ============================================================
-- 2. Row Level Security  (LOCKED TO ONE OWNER)
-- ============================================================
-- Only YOU can read drafts / create / edit / delete. Visitors can only read
-- published posts. The owner is identified by their auth user UID.
--
-- Run this whole block. Set the email on the first line to the account you sign
-- in with; it looks up your UID automatically and (re)creates every policy.
-- (If your email isn't found, sign in once at /travel/editor.html or create the
-- account first, then re-run.)

ALTER TABLE travel_posts ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  owner_email TEXT := 'YOU@EXAMPLE.COM';   -- <<< CHANGE THIS to your login email
  owner_uid   UUID;
BEGIN
  SELECT id INTO owner_uid FROM auth.users WHERE email = owner_email;
  IF owner_uid IS NULL THEN
    RAISE EXCEPTION 'No auth user found for %. Create/sign in to that account first, then re-run.', owner_email;
  END IF;

  -- Read: visitors see published; owner sees everything (incl. drafts)
  DROP POLICY IF EXISTS "Public can read published travel posts" ON travel_posts;
  EXECUTE format(
    'CREATE POLICY "Public can read published travel posts" ON travel_posts FOR SELECT USING (published = TRUE OR auth.uid() = %L)',
    owner_uid);

  -- Write: owner only
  DROP POLICY IF EXISTS "Owner can insert travel posts" ON travel_posts;
  EXECUTE format(
    'CREATE POLICY "Owner can insert travel posts" ON travel_posts FOR INSERT WITH CHECK (auth.uid() = %L)',
    owner_uid);

  DROP POLICY IF EXISTS "Owner can update travel posts" ON travel_posts;
  EXECUTE format(
    'CREATE POLICY "Owner can update travel posts" ON travel_posts FOR UPDATE USING (auth.uid() = %L)',
    owner_uid);

  DROP POLICY IF EXISTS "Owner can delete travel posts" ON travel_posts;
  EXECUTE format(
    'CREATE POLICY "Owner can delete travel posts" ON travel_posts FOR DELETE USING (auth.uid() = %L)',
    owner_uid);

  -- Clean up the older permissive policies if they exist from a previous run
  DROP POLICY IF EXISTS "Authenticated can insert travel posts" ON travel_posts;
  DROP POLICY IF EXISTS "Authenticated can update travel posts" ON travel_posts;
  DROP POLICY IF EXISTS "Authenticated can delete travel posts" ON travel_posts;

  RAISE NOTICE 'Travel posts locked to owner UID %', owner_uid;
END $$;

-- ============================================================
-- 3. Photo storage bucket (public read, signed-in write)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('travel', 'travel', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- Public read; owner-only write (same email lookup as above).
DROP POLICY IF EXISTS "Public can read travel photos" ON storage.objects;
CREATE POLICY "Public can read travel photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'travel');

DO $$
DECLARE
  owner_email TEXT := 'YOU@EXAMPLE.COM';   -- <<< CHANGE THIS to your login email
  owner_uid   UUID;
BEGIN
  SELECT id INTO owner_uid FROM auth.users WHERE email = owner_email;
  IF owner_uid IS NULL THEN
    RAISE EXCEPTION 'No auth user found for %.', owner_email;
  END IF;

  DROP POLICY IF EXISTS "Owner can upload travel photos" ON storage.objects;
  EXECUTE format(
    'CREATE POLICY "Owner can upload travel photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''travel'' AND auth.uid() = %L)',
    owner_uid);

  DROP POLICY IF EXISTS "Owner can update travel photos" ON storage.objects;
  EXECUTE format(
    'CREATE POLICY "Owner can update travel photos" ON storage.objects FOR UPDATE USING (bucket_id = ''travel'' AND auth.uid() = %L)',
    owner_uid);

  DROP POLICY IF EXISTS "Owner can delete travel photos" ON storage.objects;
  EXECUTE format(
    'CREATE POLICY "Owner can delete travel photos" ON storage.objects FOR DELETE USING (bucket_id = ''travel'' AND auth.uid() = %L)',
    owner_uid);

  DROP POLICY IF EXISTS "Authenticated can upload travel photos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated can update travel photos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated can delete travel photos" ON storage.objects;
END $$;

-- Done. The deploy workflow injects SUPABASE_URL + SUPABASE_ANON_KEY into
-- travel/js/travel-config.js (same secrets as Life ERP). No extra secrets needed.

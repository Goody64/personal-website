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
-- 2. Row Level Security
-- ============================================================
ALTER TABLE travel_posts ENABLE ROW LEVEL SECURITY;

-- Visitors (anon) can read PUBLISHED posts. Signed-in (you) can read everything incl. drafts.
DROP POLICY IF EXISTS "Public can read published travel posts" ON travel_posts;
CREATE POLICY "Public can read published travel posts" ON travel_posts
  FOR SELECT USING (published = TRUE OR auth.role() = 'authenticated');

-- Only signed-in accounts can write. Since account sign-up is gated by SIGNUP_ACCESS_KEY,
-- in practice this means only you. To lock it to a single user, replace
-- `auth.role() = 'authenticated'` below with `auth.uid() = 'YOUR-USER-UUID'`.
DROP POLICY IF EXISTS "Authenticated can insert travel posts" ON travel_posts;
CREATE POLICY "Authenticated can insert travel posts" ON travel_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can update travel posts" ON travel_posts;
CREATE POLICY "Authenticated can update travel posts" ON travel_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can delete travel posts" ON travel_posts;
CREATE POLICY "Authenticated can delete travel posts" ON travel_posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 3. Photo storage bucket (public read, signed-in write)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('travel', 'travel', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

DROP POLICY IF EXISTS "Public can read travel photos" ON storage.objects;
CREATE POLICY "Public can read travel photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'travel');

DROP POLICY IF EXISTS "Authenticated can upload travel photos" ON storage.objects;
CREATE POLICY "Authenticated can upload travel photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'travel' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can update travel photos" ON storage.objects;
CREATE POLICY "Authenticated can update travel photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'travel' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can delete travel photos" ON storage.objects;
CREATE POLICY "Authenticated can delete travel photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'travel' AND auth.role() = 'authenticated');

-- Done. The deploy workflow injects SUPABASE_URL + SUPABASE_ANON_KEY into
-- travel/js/travel-config.js (same secrets as Life ERP). No extra secrets needed.

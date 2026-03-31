-- News Cache Schema for TN Election Dashboard
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- NEWS_CACHE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS news_cache (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  snippet TEXT,
  source TEXT,
  url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  category TEXT,                     -- election, crime, police, commission, general
  matched_parties TEXT[],            -- parties mentioned in headline/snippet
  image_url TEXT
);

CREATE INDEX idx_news_cache_fetched_at ON news_cache(fetched_at DESC);
CREATE INDEX idx_news_cache_category ON news_cache(category);
CREATE INDEX idx_news_cache_published_at ON news_cache(published_at DESC);

-- Enable RLS
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;

-- Public read-only policy (anon)
CREATE POLICY "Allow public read access on news_cache"
  ON news_cache
  FOR SELECT
  TO anon
  USING (true);

-- Service role can insert/update/delete
CREATE POLICY "Allow service role full access on news_cache"
  ON news_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

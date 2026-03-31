-- Supabase Schema for TN Election Dashboard
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- 1. CONSTITUENCIES TABLE (234 rows)
-- ============================================================
CREATE TABLE IF NOT EXISTS constituencies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  district TEXT NOT NULL,
  type TEXT DEFAULT 'GEN',           -- GEN, SC, ST
  sub_region TEXT,
  description TEXT,
  electors_2016 INTEGER,
  electors_2021 INTEGER
);

CREATE INDEX idx_constituencies_district ON constituencies(district);

-- ============================================================
-- 2. CANDIDATES TABLE (9410 rows)
-- ============================================================
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,               -- slug: name-party-constituency-year
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  party TEXT,
  constituency TEXT,
  district TEXT,
  reserved TEXT,
  status TEXT,                       -- Won, Lost, Upcoming Candidate, etc.
  criminal_cases INTEGER,
  criminal_cases_text TEXT,
  education TEXT,
  assets_text TEXT,
  liabilities_text TEXT,
  assets_crores NUMERIC,
  liabilities_crores NUMERIC,
  age_text TEXT,
  voter_enrollment TEXT,
  self_profession TEXT,
  spouse_profession TEXT,
  photo TEXT,
  source JSONB,                      -- {label, url, detailUrl}
  votes INTEGER,
  vote_share NUMERIC,
  margin INTEGER
);

CREATE INDEX idx_candidates_year ON candidates(year);
CREATE INDEX idx_candidates_constituency ON candidates(constituency);
CREATE INDEX idx_candidates_party ON candidates(party);
CREATE INDEX idx_candidates_name ON candidates(name);
CREATE INDEX idx_candidates_status ON candidates(status);

-- ============================================================
-- 3. ELECTION RESULTS TABLE (~468 rows: 234 × 2 years)
-- ============================================================
CREATE TABLE IF NOT EXISTS election_results (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  constituency TEXT NOT NULL,
  district TEXT,
  type TEXT,                         -- GEN, SC, ST
  total_votes INTEGER,
  electors INTEGER,
  turnout_percent NUMERIC,
  num_candidates INTEGER,
  candidates JSONB,                  -- array of candidate result objects
  UNIQUE(year, constituency)
);

CREATE INDEX idx_election_results_year ON election_results(year);

-- ============================================================
-- 4. CURATED PROFILES TABLE (19 rows)
-- ============================================================
CREATE TABLE IF NOT EXISTS curated_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT,
  party TEXT,
  constituency TEXT,
  district TEXT,
  role TEXT,
  designation TEXT,
  dob TEXT,
  age INTEGER,
  gender TEXT,
  education TEXT,
  religion TEXT,
  photo TEXT,
  bio TEXT,
  career JSONB,                      -- [{year, event}, ...]
  achievements JSONB,                -- [text, ...]
  controversies JSONB,               -- [text, ...]
  family JSONB,                      -- {father, spouse, children, ...}
  assets JSONB,                      -- {declared, immovable, movable, ...}
  criminal_cases INTEGER DEFAULT 0,
  social_media JSONB,                -- {twitter, instagram, ...}
  electoral_history JSONB,           -- [{year, constituency, result, margin}]
  tags JSONB                         -- [text, ...]
);

-- ============================================================
-- NOTE: RLS is NOT enabled yet to allow seeding.
-- After seeding data, run supabase-rls.sql to secure the tables.
-- ============================================================

-- Run this AFTER seeding data to enable Row Level Security
-- Supabase SQL Editor → New Query → paste and run

-- Enable RLS on all tables
ALTER TABLE constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE curated_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anon key can SELECT)
CREATE POLICY "Public read access" ON constituencies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON candidates FOR SELECT USING (true);
CREATE POLICY "Public read access" ON election_results FOR SELECT USING (true);
CREATE POLICY "Public read access" ON curated_profiles FOR SELECT USING (true);

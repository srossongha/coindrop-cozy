-- ==============================================================================
-- COINDROP SUPABASE DATABASE SCHEMA
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create lobbies table
CREATE TABLE IF NOT EXISTS coindrop_lobbies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_emoji TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'ideas',
  winner_card_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create card ideas table
CREATE TABLE IF NOT EXISTS coindrop_ideas (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES coindrop_lobbies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  description TEXT,
  price_note TEXT,
  link TEXT,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create votes table (tracks coins placed by each user on each card)
CREATE TABLE IF NOT EXISTS coindrop_votes (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES coindrop_lobbies(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES coindrop_ideas(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  gold_coins INT NOT NULL DEFAULT 0,
  red_coins INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (card_id, user_id)
);

-- 4. Enable Row Level Security (RLS) with public permissions for anonymous casual gameplay
ALTER TABLE coindrop_lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE coindrop_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE coindrop_votes ENABLE ROW LEVEL SECURITY;

-- Lobbies policies
CREATE POLICY "Allow public select on coindrop_lobbies" ON coindrop_lobbies FOR SELECT USING (true);
CREATE POLICY "Allow public insert on coindrop_lobbies" ON coindrop_lobbies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on coindrop_lobbies" ON coindrop_lobbies FOR UPDATE USING (true);

-- Ideas policies
CREATE POLICY "Allow public select on coindrop_ideas" ON coindrop_ideas FOR SELECT USING (true);
CREATE POLICY "Allow public insert on coindrop_ideas" ON coindrop_ideas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on coindrop_ideas" ON coindrop_ideas FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on coindrop_ideas" ON coindrop_ideas FOR DELETE USING (true);

-- Votes policies
CREATE POLICY "Allow public select on coindrop_votes" ON coindrop_votes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on coindrop_votes" ON coindrop_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on coindrop_votes" ON coindrop_votes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on coindrop_votes" ON coindrop_votes FOR DELETE USING (true);

-- 5. Enable Realtime Publications for live multi-device synchronization
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE coindrop_lobbies, coindrop_ideas, coindrop_votes;
COMMIT;

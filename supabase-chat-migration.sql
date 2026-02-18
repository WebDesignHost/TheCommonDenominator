-- =====================================================
-- Supabase Chat Realtime Migration
-- Simple postgres_changes based realtime (no custom triggers needed)
-- =====================================================

-- =====================================================
-- STEP 1: Update or Create chat_messages table
-- =====================================================

-- Drop old table if it exists with wrong structure (CAUTION: This deletes data!)
-- Uncomment only if you want to reset:
-- DROP TABLE IF EXISTS chat_messages CASCADE;

-- Create the new chat_messages table with correct structure
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL,
  post_id TEXT,
  nickname TEXT,
  content TEXT,
  client_id TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  flagged BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel
ON chat_messages(channel, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
ON chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_post_id
ON chat_messages(post_id) WHERE post_id IS NOT NULL;

-- =====================================================
-- STEP 2: Enable Row Level Security
-- =====================================================

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read non-deleted messages
CREATE POLICY IF NOT EXISTS "Allow public read access to non-deleted messages"
ON chat_messages FOR SELECT
USING (is_deleted = FALSE);

-- Policy: Service role can do anything
CREATE POLICY IF NOT EXISTS "Allow service role full access to chat_messages"
ON chat_messages FOR ALL
USING (auth.role() = 'service_role');

-- =====================================================
-- STEP 3: Enable Realtime for the table
-- =====================================================

-- Enable realtime for chat_messages table
-- This allows clients to subscribe to postgres_changes
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- =====================================================
-- STEP 4: Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON chat_messages TO anon, authenticated;
GRANT ALL ON chat_messages TO service_role;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Run these queries to verify the setup:

-- Check if table exists with correct columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_messages'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'chat_messages';

-- Check if realtime is enabled
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'chat_messages';

-- =====================================================
-- MIGRATION FROM OLD SCHEMA (if needed)
-- =====================================================

-- If you have old data in a different table structure, you can migrate it:
-- Uncomment and adjust as needed:

/*
-- Example: Migrate from old chat_messages table with different columns
INSERT INTO chat_messages (channel, nickname, content, client_id, created_at)
SELECT
  channel_id as channel,
  author_name as nickname,
  content,
  'migrated' as client_id,
  created_at
FROM old_chat_messages
WHERE created_at > NOW() - INTERVAL '7 days'; -- Only migrate recent messages
*/

-- =====================================================
-- CLEANUP (Optional)
-- =====================================================

-- Remove old policies if they exist with different names
-- DROP POLICY IF EXISTS "old_policy_name" ON chat_messages;

-- Remove old triggers if you had any
-- DROP TRIGGER IF EXISTS some_old_trigger ON chat_messages;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Chat migration complete!';
  RAISE NOTICE '📡 Realtime is enabled for chat_messages table';
  RAISE NOTICE '🔒 RLS policies are in place';
  RAISE NOTICE '✨ Your chat is ready to use!';
END $$;

-- =====================================================
-- Supabase Realtime Chat Schema
-- This schema supports realtime broadcasting via triggers
-- =====================================================

-- Drop existing tables if needed (uncomment to reset)
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS posts CASCADE;

-- =====================================================
-- POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER DEFAULT 5,
  publish_date TIMESTAMPTZ DEFAULT NOW(),
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft',
  author_name TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to published posts
CREATE POLICY "Allow public read access to published posts"
ON posts FOR SELECT
USING (status = 'published');

-- Create policy for service role to manage all posts
CREATE POLICY "Allow service role full access to posts"
ON posts FOR ALL
USING (auth.role() = 'service_role');

-- =====================================================
-- CHAT_MESSAGES TABLE
-- =====================================================
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

-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (non-deleted messages)
CREATE POLICY "Allow public read access to non-deleted messages"
ON chat_messages FOR SELECT
USING (is_deleted = FALSE);

-- Create policy for service role to manage all messages
CREATE POLICY "Allow service role full access to chat_messages"
ON chat_messages FOR ALL
USING (auth.role() = 'service_role');

-- =====================================================
-- REALTIME BROADCAST TRIGGER FUNCTION
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS chat_messages_broadcast_trigger() CASCADE;

-- Create the broadcast trigger function
CREATE OR REPLACE FUNCTION chat_messages_broadcast_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  channel_topic TEXT;
  broadcast_payload JSONB;
BEGIN
  -- Construct the realtime topic: 'room:<channel_value>:messages'
  channel_topic := 'room:' || COALESCE(NEW.channel, OLD.channel) || ':messages';

  -- Build the payload
  broadcast_payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'old', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    'new', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    'commit_timestamp', NOW()
  );

  -- Broadcast the change to the realtime topic
  PERFORM realtime.broadcast_changes(
    channel_topic,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    broadcast_payload
  );

  -- Return the appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- =====================================================
-- CREATE TRIGGER
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS chat_messages_broadcast ON chat_messages;

-- Create trigger that fires on INSERT, UPDATE, DELETE
CREATE TRIGGER chat_messages_broadcast
  AFTER INSERT OR UPDATE OR DELETE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION chat_messages_broadcast_trigger();

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

-- Enable realtime for chat_messages table
-- This allows clients to subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- =====================================================
-- HELPER VIEWS (OPTIONAL)
-- =====================================================

-- View for active chat messages (non-deleted, non-flagged)
CREATE OR REPLACE VIEW active_chat_messages AS
SELECT
  id,
  channel,
  post_id,
  nickname,
  content,
  client_id,
  created_at
FROM chat_messages
WHERE is_deleted = FALSE
  AND flagged = FALSE
ORDER BY created_at ASC;

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON active_chat_messages TO anon, authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Uncomment to verify setup:
-- SELECT * FROM pg_tables WHERE tablename IN ('chat_messages', 'posts');
-- SELECT * FROM pg_trigger WHERE tgname = 'chat_messages_broadcast';
-- SELECT * FROM pg_proc WHERE proname = 'chat_messages_broadcast_trigger';

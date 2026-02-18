-- Mailing List Table Schema
-- This table stores email subscriptions for the blog newsletter

-- Create the mailing_list table
CREATE TABLE IF NOT EXISTS public.mailing_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL,
  subscribed BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add basic email format constraint
ALTER TABLE public.mailing_list
  ADD CONSTRAINT mailing_list_email_check
  CHECK (normalized_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$');

-- Create unique index on normalized_email for case-insensitive uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS mailing_list_normalized_email_idx
  ON public.mailing_list (normalized_email);

-- Create index on subscribed and created_at for efficient queries
CREATE INDEX IF NOT EXISTS mailing_list_subscribed_created_at_idx
  ON public.mailing_list (subscribed, created_at DESC);

-- Create trigger function to normalize email automatically
CREATE OR REPLACE FUNCTION public.mailing_list_normalize_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.normalized_email := lower(trim(NEW.email));
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert/update
DROP TRIGGER IF EXISTS mailing_list_normalize_email_trigger ON public.mailing_list;
CREATE TRIGGER mailing_list_normalize_email_trigger
  BEFORE INSERT OR UPDATE ON public.mailing_list
  FOR EACH ROW
  EXECUTE FUNCTION public.mailing_list_normalize_email();

-- Create RPC function for idempotent upsert
CREATE OR REPLACE FUNCTION public.mailing_list_upsert(
  p_email TEXT,
  p_subscribed BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
DECLARE
  v_normalized_email TEXT;
BEGIN
  v_normalized_email := lower(trim(p_email));

  INSERT INTO public.mailing_list (email, normalized_email, subscribed, created_at, updated_at)
  VALUES (p_email, v_normalized_email, p_subscribed, NOW(), NOW())
  ON CONFLICT (normalized_email)
  DO UPDATE SET
    subscribed = EXCLUDED.subscribed,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on RPC function
GRANT EXECUTE ON FUNCTION public.mailing_list_upsert(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mailing_list_upsert(TEXT, BOOLEAN) TO service_role;

-- Enable Row Level Security
ALTER TABLE public.mailing_list ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read mailing list" ON public.mailing_list;
DROP POLICY IF EXISTS "Allow authenticated users to insert to mailing list" ON public.mailing_list;
DROP POLICY IF EXISTS "Allow authenticated users to update mailing list" ON public.mailing_list;
DROP POLICY IF EXISTS "Allow service role full access to mailing list" ON public.mailing_list;

-- RLS Policies
-- Allow authenticated users to SELECT (for admin dashboard, etc.)
CREATE POLICY "Allow authenticated users to read mailing list"
  ON public.mailing_list
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to INSERT
CREATE POLICY "Allow authenticated users to insert to mailing list"
  ON public.mailing_list
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to UPDATE
CREATE POLICY "Allow authenticated users to update mailing list"
  ON public.mailing_list
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role has full access (bypasses RLS anyway, but explicit is good)
CREATE POLICY "Allow service role full access to mailing list"
  ON public.mailing_list
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Note: Public (anon) access is NOT allowed directly
-- All public signups must go through the API route or Edge Function
-- which uses the service_role key to bypass RLS securely

-- Create a view for active subscribers (useful for exports)
CREATE OR REPLACE VIEW public.mailing_list_active_subscribers AS
SELECT
  id,
  email,
  created_at,
  updated_at
FROM public.mailing_list
WHERE subscribed = true
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.mailing_list_active_subscribers TO authenticated;
GRANT SELECT ON public.mailing_list_active_subscribers TO service_role;

-- Create a function to get subscriber count (useful for analytics)
CREATE OR REPLACE FUNCTION public.get_subscriber_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.mailing_list
  WHERE subscribed = true;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_subscriber_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscriber_count() TO service_role;

-- Add helpful comments
COMMENT ON TABLE public.mailing_list IS 'Stores email subscriptions for the blog newsletter';
COMMENT ON COLUMN public.mailing_list.email IS 'Original email address as entered by user';
COMMENT ON COLUMN public.mailing_list.normalized_email IS 'Lowercase, trimmed email for case-insensitive uniqueness';
COMMENT ON COLUMN public.mailing_list.subscribed IS 'Whether the user is currently subscribed';
COMMENT ON FUNCTION public.mailing_list_upsert(TEXT, BOOLEAN) IS 'Idempotent upsert function for email subscriptions';

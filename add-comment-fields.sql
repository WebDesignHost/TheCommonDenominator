-- Add user_id and avatar_url to post_comments
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Policy to allow users to delete their own comments
CREATE POLICY "Allow users to delete their own comments" 
ON public.post_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update RLS to allow users to update their own comments (for soft delete or edits)
CREATE POLICY "Allow users to update their own comments" 
ON public.post_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

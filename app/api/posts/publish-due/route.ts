import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

// POST /api/posts/publish-due - Publish all scheduled posts that are due
export async function POST(request: NextRequest) {
  try {
    // Get current timestamp
    const now = new Date().toISOString();

    // Find all scheduled posts where publish_at <= now
    const { data: duePosts, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, title, publish_at')
      .eq('status', 'scheduled')
      .lte('publish_at', now);

    if (fetchError) {
      console.error('Error fetching due posts:', fetchError);
      return NextResponse.json(
        { error: `Failed to fetch due posts: ${fetchError.message}` },
        { status: 500 }
      );
    }

    // If no posts are due, return early
    if (!duePosts || duePosts.length === 0) {
      return NextResponse.json({
        message: 'No posts due for publishing',
        published: []
      });
    }

    // Update all due posts to published status
    const postIds = duePosts.map(post => post.id);

    const { data: updatedPosts, error: updateError } = await supabaseAdmin
      .from('posts')
      .update({
        status: 'published',
        published_at: now,
        updated_at: now
      })
      .in('id', postIds)
      .select('id, title');

    if (updateError) {
      console.error('Error updating posts:', updateError);
      return NextResponse.json(
        { error: `Failed to publish posts: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Revalidate the blog pages to show the newly published posts
    revalidatePath('/blog');

    // Revalidate each individual post page
    if (updatedPosts) {
      for (const post of updatedPosts) {
        revalidatePath(`/blog/${post.id}`);
      }
    }

    // Also revalidate the home page which might show recent posts
    revalidatePath('/');

    console.log(`Published ${updatedPosts?.length || 0} posts:`, updatedPosts?.map(p => p.id));

    return NextResponse.json({
      message: `Successfully published ${updatedPosts?.length || 0} post(s)`,
      published: updatedPosts || []
    });

  } catch (error) {
    console.error('Publish due posts error:', error);
    return NextResponse.json(
      { error: 'Failed to publish due posts' },
      { status: 500 }
    );
  }
}

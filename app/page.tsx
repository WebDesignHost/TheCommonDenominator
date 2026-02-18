import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  read_time: number;
  publish_date: string;
  cover_image_url?: string;
  status: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  publish_at?: string;
  published_at?: string;
  comments_count: number;
  likes_count: number;
  shares_count: number;
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    // Direct Supabase query - no need to fetch from API route
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('publish_date', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// Enable static generation with revalidation every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  const allPosts = await getPosts();
  const latestPost = allPosts.length > 0 ? allPosts[0] : null;
  const featuredPosts = allPosts.slice(0, 3);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Math that actually <span className="text-gradient">makes sense</span>
              </h1>
              <p className="Hero-subtext">
                Making mathematical concepts fun and accessible through connections to everyday life. No boring textbooks here—just clear explanations and real-world examples.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {latestPost && (
                  <Link href={`/blog/${latestPost.id}`} className="btn-secondary">
                    Read Latest Post
                  </Link>
                )}
                <Link href="/blog" className="btn-secondary">
                  Explore All Posts
                </Link>
              </div>
            </div>
            <div className="relative">
  <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-[var(--color-accent-1)]
              to-[var(--color-accent-2)] opacity-30 blur-2xl"></div>

  <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-[var(--color-accent-1)]
              to-[var(--color-accent-2)]">
    <div className="relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[3/2]">
      <img src="/logo.jpg" alt="The Common Denominator Logo"
           className="absolute inset-0 w-full h-full object-cover" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10"></div>
    </div>
  </div>
</div>

          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="bg-gradient-to-b from-[#8c2de1] to-[#A084E8] py-16">
          <div className="container">
            <h2 className="text-5xl font-bold mb-8 text-center">Recent Posts</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="card group">
                  {post.cover_image_url && (
                    <div className="mb-4 -mx-6 -mt-6 h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--color-accent-1)] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>{post.read_time} min read</span>
                    <span>{new Date(post.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Us */}
      <section className="relative py-24 bg-gradient-to-b from-[#A084E8] via-[#9575de] to-[#8c66d4] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-12 leading-tight">
              <span className="block text-white/90 mb-2">About Us</span>
            </h2>
            
            <div className="space-y-8">
              <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
                We're <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">Adam and Aidan</span>, and this is the Common Denominator, where <span className="italic">numbers meet narratives</span> and <span className="italic">logic explains life</span>.
              </p>
              
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl">
                Our goal is to explore the unexpected and surprising connections between different branches of math and the world around us, while also keeping it as down to earth and reader friendly as possible.
              </p>
              
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-4xl pt-4">
                We hope that this mathematical journey will help you view math in a different light, and if you learn even one new thing every week, then our mission will be a success.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from 'next/link';

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
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

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
                  <Link href={`/blog/${latestPost.id}`} className="btn-primary">
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
      <img src="/hero.png" alt="Hero Visual"
           className="absolute inset-0 w-full h-full object-cover" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10"></div>
    </div>
  </div>
</div>

          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <div className="container">
          <div className="card max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Math + Life = ∞ Connections</h2>
              <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed">
                Ever wondered how math shows up in your daily life? We make those connections clear, interesting, and dare we say... fun?
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 bg-[var(--color-surface-2)] rounded-lg">
                <h3 className="font-bold mb-2 text-lg">Real-World Math</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  From recipes to road trips, we show how math is everywhere
                </p>
              </div>
              <div className="text-center p-6 bg-[var(--color-surface-2)] rounded-lg">
                <h3 className="font-bold mb-2 text-lg">Clear Explanations</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  No confusing jargon—just straightforward, friendly breakdowns
                </p>
              </div>
              <div className="text-center p-6 bg-[var(--color-surface-2)] rounded-lg">
                <h3 className="font-bold mb-2 text-lg">Actually Fun</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Math doesn't have to be boring. We promise it can be cool
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8 text-center">Recent Posts</h2>
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

      {/* What You'll Find */}
      <section className="section">
        <div className="container">
          <div className="card max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">What You'll Find Here</h2>
            <ul className="space-y-4">
              {[
                'Math concepts explained without the headache',
                'Real-world examples from everyday situations',
                'Visual breakdowns that actually make sense',
                'Fun facts and surprising connections',
                'No prerequisites—just curiosity'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[var(--color-accent-2)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--color-text-secondary)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="section">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl p-12 text-center border-gradient">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-1)] to-[var(--color-accent-2)] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Got Questions? Let's Talk!</h2>
              <p className="text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
                Join our friendly chat to discuss math concepts, share "aha!" moments, or just hang out with fellow math enthusiasts.
              </p>
              <Link href="/chat" className="btn-primary text-lg">
                Join the Chat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

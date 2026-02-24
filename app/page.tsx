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

  const team = [
    {
      name: "Adam",
      role: "Co-Founder",
      description: "Hey, I'm Adam, a junior at Stuyvesant High School. I wanted to start the blog with Aidan because I like to explore the deep connections math has with everything around us. I've always found the fact that our universe is governed by mathematical relations really amazing, and I hope the blog will help to share some of these connections with others. In my free time I like to listen to music, chat with friends, and draw.",
      image: "/logo.jpg" // Placeholder - update with actual image path
    },
    {
      name: "Aidan",
      role: "Co-Founder",
      description: "Hi, I'm Aidan, a junior at Stuyvesant. I was really interested in starting this blog with Adam because I've always been fascinated with learning about logic that's \"hidden in plain sight.\" Outside of the blog, I like to hang out with my friends and I love to listen to every kind of music.",
      image: "/logo.jpg" // Placeholder - update with actual image path
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Our <span className="text-gradient">Goal</span>
              </h1>
              <p className="Hero-subtext text-xl md:text-2xl leading-relaxed mb-8">
                Our goal is to explore the endless connections between math and the real world in a way that's accessible and engaging to a wide audience. To draw people in, we try to frame our posts as historical stories before diving into the modern applications.
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

      {/* Bio Section */}
      <section className="py-24 bg-[var(--color-surface-1)]">
        <div className="container">
          <h2 className="text-5xl font-bold mb-16 text-center">The Team</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {team.map((member) => (
              <div key={member.name} className="card flex flex-col md:flex-row gap-8 items-center md:items-start p-8">
                <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-[var(--color-surface-2)]">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2 text-gradient">{member.name}</h3>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent-1)] mb-4">{member.role}</p>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
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
    </div>
  );
}

import Link from 'next/link';
import { getLatestPost, blogPosts } from '@/lib/blogData';

export default function Home() {
  const latestPost = getLatestPost();
  const featuredPosts = blogPosts.slice(0, 3);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Building in public, <span className="text-gradient">one week at a time</span>
              </h1>
              <p className="text-xl text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                Follow the weekly drops, lessons learned, and real numbers. No fluff, just transparent updates on what works and what doesn't.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/blog/${latestPost.id}`} className="btn-primary">
                  Read the Latest Week
                </Link>
                <Link href="/chat" className="btn-secondary">
                  Join the Chat
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-1)] to-[var(--color-accent-2)] rounded-full blur-3xl opacity-20"></div>
                <div className="relative border-gradient rounded-2xl p-8 text-center">
                  <div className="text-6xl font-bold text-gradient mb-4">Week {latestPost.week}</div>
                  <p className="text-[var(--color-text-secondary)]">{latestPost.year}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Author Snapshot */}
      <section className="section">
        <div className="container">
          <div className="card max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">About the Journey</h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  Every week, I share transparent updates on building and growing a product. 
                  You'll find real metrics, honest failures, and actionable lessons from someone 
                  still figuring it out.
                </p>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  No overnight success stories here—just consistent progress, documented weekly.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-[var(--color-surface-2)] rounded-lg">
                  <span className="text-[var(--color-text-secondary)]">Weeks Published</span>
                  <span className="text-2xl font-bold text-[var(--color-accent-1)]">{blogPosts.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[var(--color-surface-2)] rounded-lg">
                  <span className="text-[var(--color-text-secondary)]">Active Readers</span>
                  <span className="text-2xl font-bold text-[var(--color-accent-1)]">10,247</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[var(--color-surface-2)] rounded-lg">
                  <span className="text-[var(--color-text-secondary)]">Community Members</span>
                  <span className="text-2xl font-bold text-[var(--color-accent-1)]">1,582</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Weekly Posts */}
      <section className="section">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Recent Weeks</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="card group">
                <div className="mb-4">
                  <span className="badge">Week {post.week}, {post.year}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--color-accent-1)] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                  <span>{post.readTime} min read</span>
                  <span>{new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="section">
        <div className="container">
          <div className="card max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">What to Expect</h2>
            <ul className="space-y-4">
              {[
                'Behind-the-scenes decisions and thought process',
                'What worked and what didn\'t, with real metrics',
                'Actionable templates and checklists you can use',
                'Honest reflections on challenges and setbacks',
                'Weekly progress updates, every single week'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[var(--color-accent-1)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
              <p className="text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
                Chat with readers, share wins, get feedback. Real-time discussions about building, growing, and learning together.
              </p>
              <Link href="/chat" className="btn-primary text-lg">
                Enter Chat Room
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

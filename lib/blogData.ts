export interface BlogPost {
  id: string;
  week: number;
  year: number;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  readTime: number;
  publishDate: string;
  coverImage?: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 'week-37-2025',
    week: 37,
    year: 2025,
    title: 'Scaling to 10K users: What worked and what broke',
    excerpt: 'Three infrastructure decisions that saved the day and two that almost ended in disaster. Real metrics included.',
    content: `
# What Happened This Week

After months of steady growth, we finally crossed 10,000 active users. Here's what held up and what didn't.

## The Good Decisions

### 1. Database Indexing from Day One

We added indexes on our most-queried fields early. When traffic spiked, our queries stayed under 50ms.

### 2. Edge Caching for Static Assets

Using a CDN reduced our origin server load by 70%. This was a lifesaver during the traffic surge.

### 3. Rate Limiting on Authentication

Implementing rate limits on login attempts prevented a potential security issue when we saw suspicious activity.

## The Mistakes

### 1. Underestimating WebSocket Connections

Our chat feature struggled with concurrent connections. We had to migrate to a dedicated service mid-week.

### 2. Manual Database Backups

We were backing up manually once a day. Automated hourly backups are now in place.

## Key Metrics

- Active users: 10,247
- Uptime: 99.2%
- Average response time: 124ms
- Customer support tickets: 43

## Next Week

We're focusing on optimizing the chat infrastructure and implementing automated monitoring alerts.
    `,
    tags: ['Infrastructure', 'Scaling', 'Lessons'],
    readTime: 6,
    publishDate: '2025-09-15',
  },
  {
    id: 'week-36-2025',
    week: 36,
    year: 2025,
    title: 'Revenue milestone: Breaking down the $50K month',
    excerpt: 'Transparent breakdown of how we reached our first $50K revenue month and what surprised us along the way.',
    content: `
# The Numbers

This month we hit $50,327 in revenue. Here's the complete breakdown.

## Revenue Sources

- Subscriptions: $42,000 (83%)
- One-time purchases: $6,500 (13%)
- Affiliate revenue: $1,827 (4%)

## Expenses

Total expenses: $24,300

- Server costs: $3,200
- Marketing: $8,000
- Tools & software: $2,100
- Contractors: $11,000

Net: $26,027

## What Worked

The biggest driver was organic social media growth. Our weekly updates consistently hit 50K+ views.

## What Didn't

Paid ads had a poor ROI this month. We're pausing Facebook ads and reallocating to content.

## Learnings

Building in public creates trust. Our conversion rate improved by 40% after sharing our metrics openly.
    `,
    tags: ['Revenue', 'Metrics', 'Transparency'],
    readTime: 5,
    publishDate: '2025-09-08',
  },
  {
    id: 'week-35-2025',
    week: 35,
    year: 2025,
    title: 'User research: Why 200 interviews changed our roadmap',
    excerpt: 'We talked to 200 users in 10 days. The insights forced us to pivot our entire Q4 strategy.',
    content: `
# The Research Sprint

We set out to understand why some users churned within the first week. The answers surprised us.

## The Hypothesis

We assumed onboarding was too complex. We were partially right but missed the bigger picture.

## What We Learned

### 1. Feature Overload

Users felt overwhelmed by options. They wanted a simpler, more guided experience.

### 2. Missing Use Cases

Our documentation assumed technical knowledge. Most users needed step-by-step tutorials.

### 3. Support Response Time

Users expected responses within hours, not days. We hired two support specialists.

## The Changes

- Simplified onboarding flow
- Added interactive tutorials
- Reduced initial feature visibility
- Implemented live chat support

## Early Results

After implementing these changes, our Week 1 retention improved from 60% to 78%.

## Templates

We created a user interview template that we'll share next week. Stay tuned.
    `,
    tags: ['User Research', 'Product', 'Retention'],
    readTime: 7,
    publishDate: '2025-09-01',
  },
  {
    id: 'week-34-2025',
    week: 34,
    year: 2025,
    title: 'Building our first mobile app in two weeks',
    excerpt: 'Rapid prototyping with React Native. What we learned shipping a mobile app in 14 days.',
    content: `
# The Two-Week Challenge

We committed to shipping a mobile app in two weeks. Here's how it went.

## Day 1-3: Planning

We mapped out core features and cut everything non-essential. Final scope: authentication, feed view, and push notifications.

## Day 4-10: Development

Using React Native allowed us to share code with our web app. This saved significant time.

## Day 11-14: Testing & Launch

We ran beta tests with 50 users and fixed critical bugs. Launched to the App Store on Day 14.

## Challenges

- Push notifications were harder than expected
- iOS review process took 3 days
- Android testing across devices revealed UI issues

## Tools We Used

- React Native
- Expo for faster development
- Firebase for push notifications
- TestFlight for beta testing

## Metrics After Launch

- Downloads: 1,200
- Daily active users: 340
- Average session: 4.2 minutes
- Crash-free rate: 99.1%

## What's Next

We're adding offline mode and improving the notification system based on user feedback.
    `,
    tags: ['Mobile', 'Development', 'Rapid Prototyping'],
    readTime: 5,
    publishDate: '2025-08-25',
  },
  {
    id: 'week-33-2025',
    week: 33,
    year: 2025,
    title: 'Marketing experiment: LinkedIn vs Twitter',
    excerpt: 'We tested the same content strategy on two platforms. The results were dramatically different.',
    content: `
# The Experiment

For 30 days, we posted identical content on LinkedIn and Twitter. Here's what we discovered.

## The Content

- 3 posts per week
- Mix of tips, behind-the-scenes, and results
- Posted at optimal times for each platform

## Results: Twitter

- Total reach: 480,000
- Engagement rate: 2.4%
- Website clicks: 1,200
- Conversions: 24

## Results: LinkedIn

- Total reach: 120,000
- Engagement rate: 8.1%
- Website clicks: 2,400
- Conversions: 67

## Key Insights

LinkedIn had lower reach but significantly higher conversion. Twitter was better for awareness.

## The New Strategy

We're now using Twitter for top-of-funnel content and LinkedIn for in-depth posts that drive conversions.

## Costs

Time investment: 4 hours per week for both platforms combined.

## Recommendation

Focus on one platform initially. We spread ourselves too thin at the start.
    `,
    tags: ['Marketing', 'Social Media', 'Experiments'],
    readTime: 4,
    publishDate: '2025-08-18',
  },
  {
    id: 'week-32-2025',
    week: 32,
    year: 2025,
    title: 'The customer support system that scaled with us',
    excerpt: 'From email to a full support platform. How we maintained quality while growing 10x.',
    content: `
# The Problem

At 1,000 users, email support worked fine. At 10,000 users, it became chaos.

## What We Tried

### Attempt 1: Shared Inbox

We used a shared Gmail account. Response time ballooned to 48+ hours.

### Attempt 2: Help Desk Software

We implemented a dedicated support platform. Game changer.

## The Solution

We chose a platform with ticketing, live chat, and a knowledge base.

## Implementation

- Week 1: Set up ticketing system
- Week 2: Built knowledge base with top 20 questions
- Week 3: Added live chat for urgent issues
- Week 4: Trained team on new workflows

## Results After 30 Days

- Average response time: 2.3 hours (down from 48)
- First-contact resolution: 76%
- Customer satisfaction: 4.7/5
- Support volume: 40% reduction (thanks to knowledge base)

## Costs

Platform: $200/month
Time saved: 15 hours/week

## Lessons

Invest in support infrastructure before you need it. We waited too long.

## Templates

We created support response templates for common issues. Available in our resource library.
    `,
    tags: ['Customer Support', 'Operations', 'Tools'],
    readTime: 6,
    publishDate: '2025-08-11',
  },
];

export function getPostById(id: string): BlogPost | undefined {
  return blogPosts.find(post => post.id === id);
}

export function getLatestPost(): BlogPost {
  return blogPosts[0];
}

export function getRelatedPosts(currentPostId: string, limit: number = 3): BlogPost[] {
  return blogPosts.filter(post => post.id !== currentPostId).slice(0, limit);
}

export function searchPosts(query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase();
  return blogPosts.filter(post => 
    post.title.toLowerCase().includes(lowerQuery) ||
    post.excerpt.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function filterPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(post => 
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}


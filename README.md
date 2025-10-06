# Weekly Blog - Building in Public

A modern, dark-themed blog website built with Next.js, featuring weekly updates, community chat, and transparent metrics.

## Features

- **Home/About Page**: Hero section, author snapshot, featured posts, and community CTA
- **Blog Index**: Search, filter by tags, and paginated post grid
- **Blog Post Template**: Full post view with table of contents, related posts, and discussion links
- **Chat Room**: Real-time community space with channels, messages, and member list
- **Contact Page**: Form with validation and direct email option
- **Utility Pages**: 404, Terms of Service, and Privacy Policy

## Design System

### Color Palette
- Background: `#0B0F14` (near-black)
- Surface 1: `#0E1A2B` (deep navy)
- Surface 2: `#0B1730` (midnight blue)
- Accent 1: `#3B82F6` (electric blue)
- Accent 2: `#22D3EE` (cyan)
- Text Primary: `#E6EEF7`
- Text Secondary: `#A7B3C2`

### Typography
- Body: Inter (14-16px)
- Headings: Plus Jakarta Sans (20-48px)
- Weights: 400 (regular), 600 (semibold), 700 (bold)

### Spacing & Layout
- Spacing scale: 8, 12, 16, 24, 32, 48, 64px
- Border radius: 16-20px on cards, 24-28px on buttons
- Transitions: 150-250ms cubic-bezier

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd blog-project
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
blog-project/
├── app/
│   ├── blog/
│   │   ├── [id]/page.tsx    # Individual blog post
│   │   └── page.tsx         # Blog index
│   ├── chat/page.tsx        # Chat room
│   ├── contact/page.tsx     # Contact form
│   ├── privacy/page.tsx     # Privacy policy
│   ├── terms/page.tsx       # Terms of service
│   ├── not-found.tsx        # 404 page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/
│   ├── Header.tsx           # Site header
│   └── Footer.tsx           # Site footer
├── lib/
│   └── blogData.ts          # Blog post data and utilities
└── README.md
```

## Content Management

Blog posts are currently stored in `/lib/blogData.ts`. Each post includes:

- Week number and year
- Title and excerpt
- Full content
- Tags
- Read time
- Publish date

To add a new post, add an entry to the `blogPosts` array in `blogData.ts`.

## Integration Ready

The site is ready for integration with:

### Blog Backend
- Replace the static `blogData.ts` with your CMS or database
- Supports any headless CMS (Contentful, Sanity, Strapi, etc.)
- Can connect to WordPress, Ghost, or custom APIs

### Chat Service
The chat UI (`/app/chat/page.tsx`) is ready to integrate with:
- Socket.io
- Pusher
- Supabase Realtime
- Firebase Realtime Database
- Any WebSocket service

Key integration points:
- Channel list and switching
- Message sending and receiving
- Member presence
- Reactions and replies

## Customization

### Colors
Edit CSS variables in `/app/globals.css`:
```css
:root {
  --color-bg-primary: #0B0F14;
  --color-accent-1: #3B82F6;
  /* ... */
}
```

### Typography
Update font imports in `/app/layout.tsx`:
```typescript
const inter = Inter({ subsets: ["latin"] });
```

### Content
- Site name: Update in Header and Footer components
- Email: Replace `hello@weeklyblog.com` in Footer and Contact page
- Social links: Edit in Footer component
- Author bio: Update in Home page

## Performance

- Built with Next.js App Router for optimal performance
- Server components for faster initial loads
- Client components only where interactivity is needed
- Optimized images with next/image (when added)

## Responsive Design

Breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

All pages are fully responsive with mobile-first approach.

## Accessibility

- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- 4.5:1 contrast ratio for text
- Focus indicators on all interactive elements

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, contact hello@weeklyblog.com

---

Built with Next.js 15, TypeScript, and Tailwind CSS.

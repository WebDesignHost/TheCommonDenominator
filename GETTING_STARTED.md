# Getting Started with Weekly Blog

## Quick Start

Your Next.js blog project is ready to use! Follow these steps:

### 1. Navigate to the project
```bash
cd /Users/aidan/Downloads/CursorTest/test4/blog-project
```

### 2. Start the development server
```bash
npm run dev
```

### 3. Open your browser
Visit [http://localhost:3000](http://localhost:3000)

## Project Overview

This is a fully functional, dark-themed blog website with:

### Pages
- **Home** (`/`) - Hero section, author snapshot, featured posts
- **Blog Index** (`/blog`) - Searchable, filterable post grid
- **Blog Posts** (`/blog/[id]`) - Individual post pages with TOC
- **Chat Room** (`/chat`) - Community chat interface
- **Contact** (`/contact`) - Form with validation
- **Terms** (`/terms`) - Terms of service
- **Privacy** (`/privacy`) - Privacy policy
- **404** - Custom not found page

### Features

#### Blog System
- 6 sample blog posts included
- Search functionality
- Tag filtering
- Load more pagination
- Related posts
- Table of contents
- Week-based organization

#### Chat Interface
- Channel switching
- Message composition
- Member list with online status
- Reaction system (UI ready)
- Mobile-responsive tabs

#### Contact Form
- Field validation
- Success/error states
- Direct email fallback
- Reply preference option

### Design System

#### Colors
```css
Background: #0B0F14
Surface 1: #0E1A2B
Surface 2: #0B1730
Accent 1: #3B82F6
Accent 2: #22D3EE
Text Primary: #E6EEF7
Text Secondary: #A7B3C2
```

#### Spacing
8px base unit with scale: 8, 12, 16, 24, 32, 48, 64

#### Typography
- Body: Inter (16px)
- Headings: Plus Jakarta Sans
- Letter spacing: -1.5% on headings

#### Animations
- Transitions: 150-250ms
- Hover effects: scale 1.02
- Fade-in animations

## Next Steps

### Add Your Content

1. **Update Blog Posts**
   - Edit `/lib/blogData.ts`
   - Add your own posts to the `blogPosts` array

2. **Customize Branding**
   - Replace "WB" logo in `/components/Header.tsx`
   - Update site name in header and footer
   - Change email from `hello@weeklyblog.com`

3. **Connect to a Backend**

   For blog content, integrate with:
   - Contentful
   - Sanity
   - Strapi
   - WordPress REST API
   - Custom API

   For chat, integrate with:
   - Socket.io
   - Pusher
   - Supabase Realtime
   - Firebase

### Deployment

#### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Deploy to Netlify
```bash
npm run build
# Upload the .next folder
```

#### Environment Variables
If you add a backend, create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=your_api_url
DATABASE_URL=your_database_url
```

### Customization

#### Change Colors
Edit CSS variables in `/app/globals.css`:
```css
:root {
  --color-bg-primary: #0B0F14;
  --color-accent-1: #3B82F6;
  /* ... */
}
```

#### Add New Pages
Create a new file in `/app/your-page/page.tsx`:
```tsx
export default function YourPage() {
  return <div>Your content</div>
}
```

#### Modify Components
- Header: `/components/Header.tsx`
- Footer: `/components/Footer.tsx`
- Layout: `/app/layout.tsx`

## File Structure

```
blog-project/
├── app/                    # Next.js App Router
│   ├── blog/              # Blog pages
│   ├── chat/              # Chat room
│   ├── contact/           # Contact form
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── not-found.tsx      # 404 page
├── components/            # Reusable components
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/                   # Utilities and data
│   └── blogData.ts        # Blog post data
└── public/                # Static assets
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Responsive

All pages are fully responsive with breakpoints at:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- 4.5:1 contrast ratio
- Focus indicators

## Support

For questions or issues:
- Check the main README.md
- Review the code comments
- Contact: hello@weeklyblog.com

## License

MIT License - Feel free to use this project however you like!

---

Built with Next.js 15, TypeScript, and Tailwind CSS


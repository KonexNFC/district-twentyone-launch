# DISTRICT21 - Fashion Launch Microsite

## Overview
Mobile-first launch microsite for fashion brand DISTRICT21 with black-and-white branding. Features waitlist collection, countdown timer, drop management, automated mockup generation pipeline, and admin panel.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + wouter routing
- **Backend**: Express.js API
- **Database**: PostgreSQL with Drizzle ORM
- **Image Processing**: Sharp (compositing, resizing, WebP/JPG export)
- **Analytics**: PostHog (optional, provide VITE_POSTHOG_KEY env var)

## Pages
- `/` - Home: Full-viewport editorial lifestyle hero banner with dark wash overlay, DISTRICT21 logo + tagline overlaid, drop state toggle (pre/live/post), inline waitlist with privacy microcopy, sticky mobile CTA, product grid, social proof
- `/drop` - Drop: Pre-drop state (countdown + notify CTA) / Live (shop link) / Post-drop (join next drop), product grid
- `/product/:id` - Product Detail Page (PDP): Hero image, gallery, product details, waitlist/shop CTA
- `/about` - About: Brand story and stats
- `/contact` - Contact: Contact form
- `/admin` - Admin panel (password protected via SESSION_SECRET env var)

## Key Files
- `shared/schema.ts` - Data models (leads, dropSettings, users, brandAssets, mockupPresets, mockups)
- `server/routes.ts` - API endpoints
- `server/storage.ts` - Database operations
- `server/db.ts` - Database connection
- `server/lib/mockup-engine.ts` - Sharp-based mockup compositing engine
- `client/src/components/` - Shared components (nav, footer, countdown, waitlist-form)
- `client/src/pages/` - Page components

## Mockup Pipeline
- **Silhouettes**: Freestyler, Hypster, Blaker, Blaster 2.0 (tees); Gamechanger, Voicer (hoodies); Ryler, Thinker (sweatshirts)
- **Variations**: Tees get bold/tagline/icon; Hoodies & Sweats get wordmark/icon
- **Output**: WebP at 1600/1024/640px + JPG fallback per mockup
- **File naming**: `d21-{silhouette}-{color}-{variation}-{size}.{ext}`
- **Placements**: Default presets per silhouette type; customizable via admin
- **Brand assets**: Defaults from logo-wordmark.jpeg, logo-icon.jpeg, logo-hero.jpeg; can be overridden via admin upload

## API Routes
- `GET /api/drop-settings` - Get drop configuration
- `POST /api/leads` - Submit waitlist signup
- `POST /api/contact` - Submit contact form
- `POST /api/admin/verify` - Admin login
- `GET /api/admin/leads` - Get all leads (admin)
- `GET /api/admin/leads/export` - Export leads as CSV (admin)
- `PATCH /api/admin/drop-settings` - Update drop settings (admin)
- `GET /api/admin/brand-assets` - Get brand assets (admin)
- `POST /api/admin/brand-assets` - Upload brand asset (admin)
- `DELETE /api/admin/brand-assets/:id` - Delete brand asset (admin)
- `GET /api/admin/mockup-presets` - Get all placement presets (admin)
- `PUT /api/admin/mockup-presets` - Upsert placement preset (admin)
- `GET /api/mockups` - Get all generated mockups (public)
- `GET /api/mockups/:silhouette` - Get mockups for a silhouette (public)
- `POST /api/admin/mockups/generate` - Generate mockups (admin)
- `GET /api/admin/mockups/export-csv` - Export mockup manifest CSV (admin)
- `GET /api/admin/mockups/export-zip` - Export all mockup assets as ZIP (admin)

## Design
- Black-and-white only color scheme
- Fonts: Inter (sans), Space Grotesk (mono/headings)
- Mobile-first responsive design
- No dark mode toggle (uses system default which is already B&W)

## Key Components
- `client/src/components/sticky-mobile-cta.tsx` - Fixed bottom CTA bar on mobile with expandable waitlist form
- `client/src/components/waitlist-form.tsx` - Email + WhatsApp waitlist form with consent checkbox
- `client/src/components/countdown.tsx` - Countdown timer component
- `client/src/components/nav.tsx` - Fixed top navigation with mobile hamburger menu
- `client/src/components/footer.tsx` - Footer with brand name, year, navigation links

## Recent Changes
- 2026-02-08: Initial build - all pages, admin panel, backend API, database schema
- 2026-02-08: Added individual product images (8 garments x black/white)
- 2026-02-08: Automated mockup generation pipeline (Sharp compositing, batch generation, WebP/JPG export, ZIP/CSV)
- 2026-02-08: Product Detail Pages (PDPs) with gallery, product info, and generated mockup integration
- 2026-02-08: Admin panel extensions (brand asset upload, mockup generator, export tools)
- 2026-02-08: Production QA pass — H1 heading, hero mockup anchor, drop state toggle (pre/live/post), sticky mobile CTA, SEO/OG tags, favicon, privacy microcopy, footer brand+year
- 2026-02-08: New brand logo deployed across all pages (nav, footer, homepage, about, favicon, OG image, mockup engine defaults)
- 2026-02-08: Editorial lifestyle hero banner — full-viewport background image with dark gradient wash, white logo/text overlay, hero-variant styling for WaitlistForm and Countdown components

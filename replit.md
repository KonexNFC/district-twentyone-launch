# DISTRICT21 - Fashion Launch Microsite

## Overview
Mobile-first launch microsite for fashion brand DISTRICT21 with black-and-white branding. Features waitlist collection, countdown timer, drop management, and admin panel.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + wouter routing
- **Backend**: Express.js API
- **Database**: PostgreSQL with Drizzle ORM
- **Analytics**: PostHog (optional, provide VITE_POSTHOG_KEY env var)

## Pages
- `/` - Home: Hero with logo, tagline "THE UNIFORM OF NOW", countdown timer, waitlist form
- `/drop` - Drop: Pre-drop state (countdown + notify CTA) / Post-drop (shop link)
- `/about` - About: Brand story and stats
- `/contact` - Contact: Contact form
- `/admin` - Admin panel (password protected via SESSION_SECRET env var)

## Key Files
- `shared/schema.ts` - Data models (leads, dropSettings, users)
- `server/routes.ts` - API endpoints
- `server/storage.ts` - Database operations
- `server/db.ts` - Database connection
- `client/src/components/` - Shared components (nav, footer, countdown, waitlist-form)
- `client/src/pages/` - Page components

## API Routes
- `GET /api/drop-settings` - Get drop configuration
- `POST /api/leads` - Submit waitlist signup
- `POST /api/contact` - Submit contact form
- `POST /api/admin/verify` - Admin login
- `GET /api/admin/leads` - Get all leads (admin)
- `GET /api/admin/leads/export` - Export leads as CSV (admin)
- `PATCH /api/admin/drop-settings` - Update drop settings (admin)

## Design
- Black-and-white only color scheme
- Fonts: Inter (sans), Space Grotesk (mono/headings)
- Mobile-first responsive design
- No dark mode toggle (uses system default which is already B&W)

## Recent Changes
- 2026-02-08: Initial build - all pages, admin panel, backend API, database schema

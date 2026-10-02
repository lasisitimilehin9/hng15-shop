# Oriki Naturals — HNG Internship 15 Lesson 2

E-commerce website for **Oriki Naturals**, a small Nigerian natural body-care brand based in Osun State. Customers can browse products, manage a cart, sign in with Google, place orders, view order history, and receive a Mailgun confirmation email.

## Features

- Product listing and detail pages
- Client cart (add / quantity / remove / totals)
- Google OAuth authentication (Supabase Auth)
- Checkout with validation and server-side price calculation
- Orders persisted in Postgres (Supabase)
- Order history for the signed-in user only
- Mailgun order confirmation emails
- Responsive UI with loading and error states
- Automated unit tests (Vitest)

## Tech stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Zustand (cart)
- Mailgun (transactional email)
- Vitest

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at https://supabase.com
2. Open **SQL Editor** and run the full contents of `supabase/schema.sql`
3. Copy **Project URL** and **anon** / **service_role** keys into `.env.local`
4. **Authentication → Providers → Google**: enable and add Client ID / Secret from Google Cloud Console
5. **Authentication → URL configuration**: set Site URL and redirect URL  
   `http://localhost:3000/auth/callback` (and production URL when deploying)

### 3. Google Cloud Console

1. Create OAuth 2.0 Client (Web)
2. Authorized redirect URI:  
   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
3. Put Client ID and Client Secret into Supabase Google provider settings

### 4. Mailgun

1. Create a Mailgun account and verify a domain (or use sandbox for tests)
2. Set `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL` in `.env.local`
3. For local UI without sending real email: `MAILGUN_DRY_RUN=true`

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Unit tests |
| `npm run lint` | ESLint |

## Environment variables

See `.env.example`. Never commit real secrets.

## Security notes

- Order totals are calculated on the server from database product prices
- RLS ensures users only read their own orders
- Service role key is server-only
- Mailgun API key is server-only

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add the same environment variables
4. Set `NEXT_PUBLIC_APP_URL` to the production URL
5. Add production callback URLs in Supabase and Google Cloud

## HNG Lesson 2

Built for HNG Internship 15 Lesson 2 individual task using AI-assisted implementation.

## Submission status (HNG Lesson 2)

**Implemented in code**
- Product listing, details, cart, checkout UI
- Supabase schema + RLS + seed products
- Google OAuth flow wiring (`/login`, `/auth/callback`)
- Order API + order history (user-scoped)
- Mailgun confirmation email module (server-side)

**External configuration**
- Supabase project/schema: configured by submitter
- Google OAuth: blocked on Google Cloud payment verification at time of push; integration code is present
- Mailgun: credentials not required for code review; set `MAILGUN_DRY_RUN=true` until keys are available

Do not commit `.env.local`. Use `.env.example` only.

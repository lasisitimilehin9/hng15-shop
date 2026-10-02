# AGENTS.md — Oriki Naturals Shop

## Project
HNG Internship 15 Lesson 2 individual task: e-commerce shop for **Oriki Naturals**, a small Nigerian natural body-care brand (shea butter, black soap, botanical oils).

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth with Google OAuth)
- Zustand for client cart state (localStorage-backed)
- Mailgun for order confirmation emails
- Deploy target: Vercel

## Key paths
- `src/app/` — pages and API routes
- `src/components/` — UI components
- `src/lib/` — supabase clients, mailgun, cart store, types, products seed helpers
- `supabase/schema.sql` — database schema (run in Supabase SQL editor)

## Rules for AI agents
1. Never commit `.env` or secrets. Use `.env.example` placeholders only.
2. Order totals must be calculated server-side from trusted product prices in the database — never trust client-submitted prices.
3. Orders are scoped to `auth.uid()`; never return another user's orders.
4. Cart is client-only until checkout; orders are the source of truth after purchase.
5. Mailgun credentials stay server-side only (`src/app/api/`).
6. Keep the UI simple, responsive, and production-quality — no unnecessary libraries.
7. Prefer fixing root causes over workarounds.

## Required env vars
See `.env.example`. Critical: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, Google OAuth via Supabase dashboard, `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL`.

## Commands
```bash
npm install
npm run dev
npm run build
npm test
```

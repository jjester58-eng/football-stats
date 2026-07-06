# Kangaroos Stats

Simple root Next.js app for live football play entry and scouting.

## Run

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm start`

## Environment

Set these environment variables for Supabase access:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Project structure

- `app/page.tsx` — landing page
- `app/enter/page.tsx` — live game entry UI
- `lib/supabase.ts` — Supabase client factory
- `app/layout.tsx` — root layout and metadata
- `app/globals.css` — Tailwind CSS entry

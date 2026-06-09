# MeetMe

Mobile web app for shareable profile cards with WhatsApp conversation starters.

My link: https://meet-me-murex.vercel.app/martin-a063
My edit link: https://meet-me-murex.vercel.app/edit/6f8869ce75f9364f4faa46a4c7156b6e

Live: https://meet-me-murex.vercel.app/create

See [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md) for the build journey,
design decisions, problems hit, and v2 candidates.

## Quick start

1. `npm install`
2. Copy `.env.local.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_URL` (optional — defaults to request host)
3. Run `supabase/schema.sql` in the Supabase SQL editor (one time).
4. `npm run dev` → http://localhost:3000

## Deploy on Vercel

1. Import the repo in Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
   Project Settings → Environment Variables. `NEXT_PUBLIC_BASE_URL` is
   not required — the API derives the host from the request.
3. Deploy. `vercel.json` pins the framework to `nextjs`.

## Routes

- `/` → redirects to `/create`
- `/create` → create form
- `/edit/[token]` → edit form (token is the secret)
- `/[slug]` → public profile
- `POST /api/meetme` → create
- `PUT /api/meetme/[token]` → update

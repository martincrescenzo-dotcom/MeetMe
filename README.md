# MeetMe

Mobile web app for shareable profile cards with WhatsApp conversation starters.

## Quick start

1. `npm install`
2. Copy `.env.local.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_URL` (your deployed URL, no trailing slash)
3. Run `supabase/schema.sql` in the Supabase SQL editor (one time).
4. `npm run dev` → http://localhost:3000

## Deploy on Vercel

1. Import the repo in Vercel.
2. Set the three env vars above in Project Settings → Environment Variables.
3. Deploy. `NEXT_PUBLIC_BASE_URL` should be set to the production URL after the first deploy (then redeploy).

## Routes

- `/` → redirects to `/create`
- `/create` → create form
- `/edit/[token]` → edit form (token is the secret)
- `/[slug]` → public profile
- `POST /api/meetme` → create
- `PUT /api/meetme/[token]` → update

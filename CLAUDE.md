# MeetMe — Claude Code Context

## What this is
A mobile web app where people create a shareable profile card ("MeetMe") with categories of conversation topics. Each topic is a WhatsApp deep link — tap it, WhatsApp opens with a pre-written message to the profile owner.

## Stack
- Next.js 14, App Router (`/app` directory)
- TypeScript (strict)
- Tailwind CSS
- Supabase (single table, anon key, no auth)

## Repo structure
```
/app
  /[slug]/page.tsx            ← public profile (server component)
  /create/page.tsx            ← create form (client component)
  /edit/[token]/page.tsx      ← edit form (server+client hybrid)
  /api/meetme/route.ts        ← POST create
  /api/meetme/[token]/route.ts← PUT update
/components
  MeetMeForm.tsx              ← shared form, used by /create and /edit/[token]
/lib
  supabase.ts                 ← client init
  types.ts                    ← shared types
  utils.ts                    ← slug gen, token gen, WA URL builder
/styles
  globals.css
```

## Env vars
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Types
```typescript
type MeetMeItem = {
  name: string
  message: string
}

type MeetMeCategory = {
  label: string
  items: MeetMeItem[]
}

type MeetMe = {
  id: string
  slug: string
  name: string
  phone: string       // E.164, e.g. +33612345678
  data: MeetMeCategory[]
  edit_token: string
  created_at: string
}
```

## DB — single table
```sql
create table meetme (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  phone text not null,
  data jsonb not null default '[]',
  edit_token text unique not null,
  created_at timestamptz default now()
);
```
Updates are token-gated at API level. No Supabase auth. RLS: public read, public insert, no RLS on update (edit_token is the secret).

## Utils — /lib/utils.ts
- `generateSlug(name)` → lowercase, no spaces, 4-char random suffix, e.g. `martin-x4k2`
- `generateEditToken()` → 32-char hex via `crypto.randomBytes`
- `buildWhatsAppURL(phone, message)` → `https://wa.me/{phone}?text={encodeURIComponent(message)}`
- Phone normalization: strip spaces/dashes, preserve leading `+`

## API contracts

### POST /api/meetme
Input: `{ name, phone, data: MeetMeCategory[] }`
- Validate: name non-empty, phone non-empty, ≥1 category with ≥1 item
- Normalize phone
- Generate slug (retry up to 5x on collision)
- Generate edit_token
- Insert to DB
- Return: `{ slug, edit_token, share_url, edit_url }`

### PUT /api/meetme/[token]
Input: `{ name?, phone?, data? }` (partial)
- Lookup by edit_token, 404 if missing
- Validate provided fields
- Update DB
- Return: `{ slug, share_url }`

## Page behaviour

### /[slug] (server component)
- Fetch by slug, notFound() if missing
- Render: "Meet {name}", then categories as bold uppercase headers, items as WA links
- Bottom: link to /create ("Create a MeetMe")
- Skip empty categories entirely

### /create (client component)
- Local state: name, phone, categories[]
- Add/remove categories and items
- Submit → POST /api/meetme → show done screen with share_url + edit_url
- Done screen must prominently warn: edit link cannot be recovered

### /edit/[token] (server fetches, passes to MeetMeForm)
- Fetch by edit_token, notFound() if missing
- MeetMeForm receives initialData, submits to PUT /api/meetme/[token]
- On success: show "Saved" + share_url

## Design constraints (do not deviate)
- Mobile-first, 375px target width
- "Create a MeetMe" at bottom of profile: same font, muted, centered
- No navigation, no logo, no footer chrome

## Hard rules
- No Supabase auth — edit_token is the only access control for mutations
- No client-side Supabase calls for reads on public profile (server component only)
- WhatsApp URL: phone must have no spaces, message must be encodeURIComponent encoded
- WA message field: warn if >300 chars (wa.me URL ceiling ~4000 chars)
- Copy-to-clipboard: needs navigator.clipboard fallback for iOS Safari
- notFound() on any missing slug or token — no custom error pages for v1

## Out of scope (v1)
- Apple Wallet
- OG image / link previews
- Auth / accounts
- Slug customisation (auto-generated only)

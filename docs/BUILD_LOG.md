# Build log — MeetMe v1

A short, honest record of how this shipped. Written so anyone (including
future-Martin) can pick it up cold.

## What it is

Mobile web app for shareable profile cards. Each card has categories of
WhatsApp conversation starters — tap a topic, WhatsApp opens with a
pre-written message to the profile owner. Auto-generated slug for the
share URL, secret edit token for updates. No accounts, no auth.

Live: https://meet-me-murex.vercel.app/create

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS with arbitrary-value utilities for the design's exact spec
- Supabase: one `meetme` table, anon key, RLS open (token is the secret)
- Vercel for hosting, GitHub for source

The deploy pipeline is just `git push` → GitHub → Vercel auto-deploy.

## Design decisions

The starting `CLAUDE.md` was preliminary and explicitly invited pushback.
The design files (`design/meetme-screens.jsx`) were the real source of
truth. Where they conflicted, design won. Notable calls:

- **Bottom-border inputs**, not boxes. Drops a lot of visual chrome the
  scaffold initially had.
- **Profile name at 30px normal weight**, not bold. Reads almost serif.
- **Form has explicit IDENTITY and CATEGORIES section headers** (10px
  caps, 0.22em tracking). The original scaffold had no structure.
- **Done screen is its own panel**, not a result message. Title is
  literally `Your MeetMe / is ready.` with a `<br>`.

Two places I argued with the design and won:

1. **Edit success screen** — design re-showed the edit link with the
   "save this, you can't recover it" warning. But the user *already had*
   the edit link to reach the edit page; re-showing it is misleading
   and alarming. Edit mode now shows only "Saved." + the share link.
2. **300-char WhatsApp message warning** — dropped. The wa.me ceiling
   is ~4000 chars and rarely bites; the warning was noise. Design
   omitted it deliberately and I followed.

One place I argued and folded:

- The homepage. CLAUDE.md mentioned one; design had none. I made `/`
  redirect to `/create`. Zero-page homepage.

## Problems hit & how they were fixed

Chronological. Useful as a reference for the next thing that breaks.

### 1. Build failed: "Missing Supabase env vars"

`lib/supabase.ts` threw at module load when env vars were absent. Next's
"Collecting page data" stage imports route handlers — so the throw fired
during build, before env vars were ever available.

**Fix:** `getSupabase()` lazy factory. Throw moved into the function
body, only fires on first call.

### 2. Build failed: "No Output Directory named 'public' found"

Vercel detected `framework: null` for the project and was looking for a
static `public/` dir instead of `.next`. The Next compile actually
succeeded — Vercel just didn't know to use the output.

**Fix:** `vercel.json` with `"framework": "nextjs"`.

### 3. Runtime: "Missing Supabase env vars" again

After env vars were added in the Vercel dashboard, the existing deploy
was still 500-ing. Vercel snapshots env vars at **build time**, even
ones read at runtime. Adding vars after a build does nothing for that
build.

**Fix:** push an empty commit to trigger a fresh build that picks them up.

### 4. Runtime: "Could not find the table 'public.meetme'"

Env vars were now correct. The Supabase client connected fine. But the
`meetme` table didn't exist yet — schema hadn't been applied.

**Fix:** paste `supabase/schema.sql` in the SQL editor → Run.

### 5. Share/edit URLs returned as relative paths

API was returning `share_url: "/martin-x4k2"` instead of
`https://.../martin-x4k2` because `NEXT_PUBLIC_BASE_URL` wasn't set.

**Fix:** stop depending on the env var. Derive the base URL from the
request's `x-forwarded-host` / `host` headers. Works on any host, any
environment, no redeploy needed when the domain changes.

### Pattern in those four

Three of the five problems were Vercel-shaped, not code-shaped. The
build container has different state than the runtime container, and env
vars in particular are snapshotted at one point and read at another.
Worth remembering: anything `process.env`-dependent in code needs to
not throw at module load, and any change to env vars requires a fresh
build to take effect.

## Vercel Deployment Protection

The auto-generated URL `meet-me-martincrescenzo-dotcoms-projects.vercel.app`
returns 401 by default. That's Vercel's "Deployment Protection" — on for
new projects. The cleaner alias `meet-me-murex.vercel.app` is open.

Toggle off if you want both URLs public:
https://vercel.com/martincrescenzo-dotcoms-projects/meet-me/settings/deployment-protection

## Known limitations / v2 candidates

- **No delete endpoint.** A user with the edit token can update but not
  delete. Add `DELETE /api/meetme/[token]` if needed.
- **Slug collisions retry 5 times.** With ~16 bits of suffix entropy
  (`xxxx` hex) and 5 retries, collision is vanishingly unlikely under
  modest scale. If this app actually takes off, bump suffix length.
- **No rate limiting on POST.** Anyone can create unlimited rows.
  Vercel WAF or a simple IP throttle would be the v2 add.
- **Edit token in URL.** Convenient for the "save this link" UX, but
  it's in browser history and any logged proxy. Acceptable for v1.
- **No OG image / link preview metadata.** Out of scope per CLAUDE.md
  but a near-term polish item.
- **Phone validation is permissive.** We normalize but don't verify
  E.164 strictly. WhatsApp will reject malformed numbers itself.
- **Two test rows in DB** from smoke-testing: `smoketest-76b1` and
  `deployprobe-ea18`. Delete with:
  ```sql
  delete from meetme where slug in ('smoketest-76b1', 'deployprobe-ea18');
  ```

## Things I'd do differently

- **Skip `next.config.ts`.** Started with TS config; Next 14 doesn't
  support it. Wasted a step.
- **Use `framework: "nextjs"` in `vercel.json` from the start.** Would
  have skipped problem #2.
- **Don't throw at module load for missing env vars.** Lesson worth
  internalizing — lazy init from day one.

## Deploy checklist (for next time)

1. `npm install`, run locally to confirm
2. Run `supabase/schema.sql` in the Supabase SQL editor
3. Import GitHub repo in Vercel
4. Set env vars in Vercel: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Skip `NEXT_PUBLIC_BASE_URL` — the
   API now derives it from the request.
5. Deploy. The `vercel.json` pins the framework so the build will pick
   up `.next` correctly.
6. Smoke-test: POST `/api/meetme` with a valid payload, verify the
   returned share URL loads, verify the WhatsApp link in the profile
   has the right phone number.

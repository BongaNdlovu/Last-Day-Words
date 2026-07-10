# Last Day Words

Prophetic **speed arcade** (PWA): timed word rounds from a large KJV-grounded pool, dual weekly boards (**Mixed** and **Chapter**), optional teams, day-lamp streaks, and Supabase auth for cloud scores.

## Stack

- React 19 + Vite 6 + TypeScript + Tailwind 4
- Supabase (optional): Auth, Postgres, RLS, Realtime rooms
- Vite PWA (`injectManifest`)

## Prerequisites

- Node.js 20+ (22 recommended)
- A Supabase project **only if** you want cloud auth, progress sync, and leaderboards (the game runs offline with bundled content)

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Use the **anon / publishable** key only. Never put the service-role key in this app.

Without env vars, `isSupabaseConfigured` is false and the client uses local storage + bundled chapters/words.

Restart `npm run dev` after creating or changing `.env.local` (Vite only reads env at startup).

### Accounts (sign in / create account)

With Supabase configured:

1. Open **Sign In** from the header, the home **Sign in or create an account** card, or the grid **Sign In / Account** button.
2. **Create Account** — email, password (min 6), display name (2–24 chars for leaderboards).
3. **Sign In** — same email/password after registration (and after email confirm if your Supabase project requires it).
4. Profile row is created by the `handle_new_user` trigger; the app also upserts `profiles` when needed.

Local play works without an account; cloud sync, leaderboards, and online teams need a signed-in user.

**Supabase Dashboard:** enable **Authentication → Providers → Email**. If **Confirm email** is on, new signups must confirm before first sign-in (the form explains this).

## Run

```bash
npm run dev      # http://localhost:3000
npm run lint     # tsc --noEmit
npm test         # vitest
npm run build    # production bundle + PWA SW
npm run preview  # serve dist/
```

## Supabase (remote)

Local Supabase CLI is **not** required. Content and schema live on the remote project.

1. Apply migrations under `supabase/migrations/` in order (or use the Supabase dashboard / CLI linked to remote).
2. For a full content snapshot matching the client catalog, run `supabase/seed_content.sql` (upserts chapters/words/seasons).
3. See `docs/SUPABASE_REMOTE_WORKFLOW.md` for remote-only notes.

Key tables: `profiles`, `user_progress`, `words`, `chapters`, `seasons`, `speed_scores` (`mode`: `mixed` | `chapter`; **writes via edge `submit-speed-score` only**), `game_rooms`, `room_members` — RLS enabled. See `docs/SUPABASE_REMOTE_WORKFLOW.md`.

## Production

**Live app:** [https://last-day-words.vercel.app/](https://last-day-words.vercel.app/)

One-time Supabase auth setup (password reset / email confirm): [URL Configuration](https://supabase.com/dashboard/project/haoghddjcstxanrtggvb/auth/url-configuration) — set **Site URL** to `https://last-day-words.vercel.app` and add `https://last-day-words.vercel.app/**` to **Redirect URLs**. Details: `docs/SUPABASE_REMOTE_WORKFLOW.md` §7.

## Project layout (short)

| Path | Role |
|------|------|
| `src/components/` | UI screens (lazy-loaded from `App.tsx`) — speed is the main mode |
| `src/data/` | Bundled words/clues (speed pool), word bank, cosmetics |
| `src/hooks/` | Progress, catalog, session, streaks |
| `src/lib/supabase.ts` | Client + progress/score helpers |
| `supabase/migrations/` | Schema + seed migrations |
| `supabase/seed_content.sql` | Full content upsert snapshot |

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs typecheck, tests, and build on push/PR.

## License / content

KJV scripture is public domain. Ellen G. White study excerpts are cited in-app from supplied PDF sources; respect EGW Estate usage guidance for redistribution.

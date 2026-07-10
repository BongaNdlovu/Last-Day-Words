# Supabase remote-only workflow

Local Supabase CLI stack (`supabase start` / full local Postgres) is **not** required for day-to-day client work.  
**Production schema, content, auth, and edge functions live on the remote project.**

| Item | Value |
|------|--------|
| Project ref (app + MCP) | `haoghddjcstxanrtggvb` |
| CLI owner project (this machine) | `ouaqkrvsswxjogivrxbm` — *different project* |
| Client env | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` only (never service role in the app) |

---

## 0 · Access control (CLI “no privileges”)

If `npx supabase link --project-ref haoghddjcstxanrtggvb` fails with **“Your account does not have the necessary privileges”**, the Supabase user in your CLI session is **not** an Owner/Developer on that project.

On this machine (verified):

| Channel | Project | Access |
|---------|---------|--------|
| **App `.env.local` + Cursor MCP** | `haoghddjcstxanrtggvb` | Works — migrations + edge function already applied here |
| **`npx supabase` CLI** (local dev account) | `ouaqkrvsswxjogivrxbm` only | Can link; **cannot** link `haoghddjcstxanrtggvb` |

**You do not need CLI** for the anti-cheat deploy if Cursor Supabase MCP stays linked to `haoghddjcstxanrtggvb` — that path already applied all five speed-score migrations and deployed `submit-speed-score` v2.

### To unblock CLI on this machine (pick one)

1. **Invite this account to the owning org**  
   Dashboard (account that created `haoghddjcstxanrtggvb`) → **Organization settings → Members** → invite your CLI account's email as **Owner** or **Developer**, then:
   ```bash
   npx supabase login
   npx supabase link --project-ref haoghddjcstxanrtggvb
   ```

2. **Log in as the project owner**  
   `npx supabase logout` → `npx supabase login` with the email/org that owns `haoghddjcstxanrtggvb`.

3. **Keep MCP-only ops**  
   Ask the agent to `apply_migration` / `deploy_edge_function` via `.cursor/mcp.json` (no local CLI).

4. **Re-home the app** (only if you intend to abandon `haoghddjcstxanrtggvb`)  
   Point `.env.local`, `.cursor/mcp.json`, and `.env.example` at `ouaqkrvsswxjogivrxbm`, then `db push` + function deploy on the owned project. That project has a **different** migration history (May 2026 seeds) — not a drop-in swap.

### Dashboard fallback (owner account)

If you have Dashboard access to `haoghddjcstxanrtggvb` but not CLI: **SQL Editor** → paste migration files in order; **Edge Functions** → deploy `supabase/functions/submit-speed-score/index.ts`.  
*As of 2026-07-10, MCP reports these are already applied — use Dashboard only for new changes.*

## 1 · Apply migrations (remote)

Migrations live in `supabase/migrations/` and should be applied **in filename order** to the remote DB.

**Preferred (this repo):** Supabase MCP in Cursor — `apply_migration` per file, or ask the agent to sync pending migrations. No local CLI login required when MCP is linked to `haoghddjcstxanrtggvb`.

**Fallback (project owner CLI or Dashboard SQL):**

```bash
npx supabase login
npx supabase link --project-ref haoghddjcstxanrtggvb
npx supabase db push
```

### Remote status (verified 2026-07-10)

| Migration | Remote version | Status |
|-----------|----------------|--------|
| `speed_scores_mode` | `20260710193650` | Applied |
| `drop_daily_scores` | `20260710200206` | Applied — `daily_scores` gone |
| `speed_scores_validate_real_caps` | `20260710201021` | Applied |
| `speed_scores_anticheat` | `20260710201439` | Applied — trigger `speed_scores_validate` |
| `speed_scores_service_writes_only` | `20260710201634` | Applied — client INSERT denied |

---

## 2 · Speed leaderboard write path (anti-cheat)

Browser **must not** INSERT/UPDATE `speed_scores` with the anon key.

| Layer | Role |
|-------|------|
| Client `canSubmitSpeedScore` | UX only — skip bad payloads / spammy calls |
| Edge `submit-speed-score` | JWT check + payload validation; upsert with **service role** |
| DB `validate_speed_score()` | Real gate: min/max, monotonic best, 8s on score *increases* |
| RLS / grants | `authenticated` & `anon`: **SELECT only** on `speed_scores` |

**Limits (keep in sync):**  
`src/utils/speedScoreLimits.ts` ↔ edge function constants ↔ trigger (`18400` / `1000` / `80` / `8 seconds`).

**Not solved:** full server-side game replay. A custom client can still POST *structurally valid* scores to the edge; caps block impossible totals, wipe-downs, and increase spam.

### Deploy edge function

**Preferred:** Supabase MCP `deploy_edge_function` (no CLI).

**Fallback CLI:**

```bash
npx supabase functions deploy submit-speed-score --project-ref haoghddjcstxanrtggvb
```

**Remote status:** `submit-speed-score` **ACTIVE**, `verify_jwt: true`, version **2** (redeployed 2026-07-10).

Source: `supabase/functions/submit-speed-score/index.ts`  
Runtime secrets (set automatically on Supabase-hosted functions): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Client call: `submitSpeedScoreToEdge` in `src/lib/supabase.ts` → `supabase.functions.invoke("submit-speed-score", …)`.

---

## 3 · Local client wiring

1. `cp .env.example .env.local`
2. Set **anon / publishable** keys only:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Restart `npm run dev` after any env change (Vite reads env at startup).

Without env vars, the game runs offline (localStorage + bundled catalog); cloud boards require sign-in + remote schema + edge deploy.

---

## 4 · Remote readiness checks

| Check | Expected |
|-------|----------|
| `chapters` | 76 |
| `words` | 380 |
| `seasons` | 2 |
| `speed_scores.mode` | column exists (`mixed` \| `chapter`) |
| `daily_scores` | **table absent** (after drop migration) |
| `validate_speed_score` trigger | on `speed_scores` before insert/update |
| Client write to `speed_scores` | **denied** for `authenticated`/`anon` |
| Edge `submit-speed-score` | deployed; signed-in submit works |
| `profiles` / `user_progress` | RLS on; own row write for progress |
| `handle_new_user` | on `auth.users` insert |

Example smoke SQL:

```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'speed_scores' and column_name = 'mode';

select tgname from pg_trigger
where tgrelid = 'public.speed_scores'::regclass and not tgisinternal;

select has_table_privilege('authenticated', 'public.speed_scores', 'insert'); -- expect false
```

---

## 5 · Accounts

- In-app **Sign in / Create account** (email provider enabled in Dashboard).
- Optional: SQL bootstrap for first admin (email confirmed) if your project requires it.
- Leaderboard posts require a signed-in session so the edge function can resolve `auth.getUser()`.

---

## 6 · Housekeeping

- Temp `supabase/_*` MCP apply chunks are gitignored; delete if recreated.
- Chunked MCP applies can leave **duplicate names** in Dashboard migration history; data is usually fine (`ON CONFLICT` upserts).
- `tsconfig.json` excludes `supabase/functions` so Deno edge code is not typechecked by the Vite app.

---

## 7 · Production (Vercel)

| Item | Value |
|------|--------|
| **Production URL** | [https://last-day-words.vercel.app/](https://last-day-words.vercel.app/) |
| **Supabase project** | `haoghddjcstxanrtggvb` |

### Auth redirect URLs (required once)

**Dashboard:** [Authentication → URL Configuration](https://supabase.com/dashboard/project/haoghddjcstxanrtggvb/auth/url-configuration)

| Field | Value |
|-------|--------|
| **Site URL** | `https://last-day-words.vercel.app` |
| **Redirect URLs** | `https://last-day-words.vercel.app`, `https://last-day-words.vercel.app/**`, plus local dev (`http://localhost:3000/**`, `http://127.0.0.1:3000/**`) |

Or from a machine logged in as the **project owner**:

```bash
node scripts/configure-production-auth.mjs
```

(`scripts/configure-production-auth.mjs` uses `SUPABASE_ACCESS_TOKEN` or `npx supabase login` session.)

The app sends `emailRedirectTo` / `redirectTo` as `window.location.origin` (`AuthScreen.tsx`), so allowlisting production enables password-reset and confirm-email links on Vercel.

### Vercel env (Production)

- `VITE_SUPABASE_URL` = `https://haoghddjcstxanrtggvb.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = anon key from Dashboard → API

Redeploy after env changes. PWA/theme updates on one refresh; background video caches after first visit (~4 MB).

### Vercel deploy (GitHub → production)

`main` pushes run **CI** only unless Vercel Git integration or GitHub Actions secrets are configured.

**Symptom:** merge to `main` but [last-day-words.vercel.app](https://last-day-words.vercel.app/) stays on an old bundle — check Vercel **Deployments** for commit `30a8bbd` (or latest). If missing, the repo is not wired to auto-deploy.

**Option A — reconnect Git (simplest):** Vercel Dashboard → Project → **Settings → Git** → connect `BongaNdlovu/Last-Day-Words`, production branch **`main`**, then **Redeploy** latest `main`.

**Option B — GitHub Actions** (`.github/workflows/vercel-deploy.yml`): add repo secrets from Vercel → Project → Settings → General:

| Secret | Where |
|--------|--------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Project Settings → General |
| `VERCEL_PROJECT_ID` | Project Settings → General |

Push to `main` triggers a production deploy after secrets exist.

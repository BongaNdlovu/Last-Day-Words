# Supabase remote-only workflow

Local Supabase CLI stack (`supabase start` / full local Postgres) is **not** required for day-to-day client work.  
**Production schema, content, auth, and edge functions live on the remote project.**

| Item | Value |
|------|--------|
| Project ref (from env example) | `haoghddjcstxanrtggvb` |
| Client env | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` only (never service role in the app) |

---

## 1 · Apply migrations (remote)

Migrations live in `supabase/migrations/` and should be applied **in filename order** to the remote DB (Dashboard SQL, linked CLI `db push`, or your MCP apply path).

| Migration | Purpose |
|-----------|---------|
| `…core_schema` → `…rls…` | Base tables, RLS, indexes |
| `…content…` / seed migrations | Catalog tables + content |
| `20260710193000_speed_scores_mode.sql` | Dual boards: `mode` (`mixed` \| `chapter`) |
| `20260710200000_drop_daily_scores.sql` | Drop unused hangman `daily_scores` |
| `20260710210000_speed_scores_validate_real_caps.sql` | Cap: `score ≤ words_solved × 18400` |
| `20260710220000_speed_scores_anticheat.sql` | Min score/word, monotonic weekly best, 8s increase limit |
| `20260710230000_speed_scores_service_writes_only.sql` | **Clients cannot write** `speed_scores` (edge/service only) |

**Content snapshot (optional full refresh):** `supabase/seed_content.sql`  
Expected counts: **76 chapters · 380 words · 2 seasons**.

Optional history cleanup: `supabase/snippets/cleanup_duplicate_mcp_migrations.sql`.

### CLI (when logged in as project owner)

```bash
npx supabase login
npx supabase link --project-ref haoghddjcstxanrtggvb
npx supabase db push
```

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

```bash
npx supabase functions deploy submit-speed-score --project-ref haoghddjcstxanrtggvb
```

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

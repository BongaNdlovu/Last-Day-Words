# Supabase remote-only workflow

Local Supabase CLI (`supabase/config.toml`, `supabase start`) is **not** used.
Production content and schema live on the linked remote project.

## Canonical content snapshot

- **Full catalog upsert:** `supabase/seed_content.sql` (76 chapters / 380 words; includes batch-2).
- **Versioned migrations (DDL + seeds):** `supabase/migrations/*.sql`  
  Notable recent migrations:
  - `20260709150000_seed_expansion_content.sql`
  - `20260710120000_seed_batch2_content.sql`
  - `20260710193000_speed_scores_mode.sql` — dual Mixed/Chapter weekly boards
  - `20260710200000_drop_daily_scores.sql` — removes unused hangman daily board table
  - `20260710210000_speed_scores_validate_real_caps.sql` — score cap `words_solved * 18400` (matches client)
  - `20260710220000_speed_scores_anticheat.sql` — min score/word, monotonic weekly best, 8s increase rate limit

## Housekeeping notes

- Temp `supabase/_*` MCP apply chunks are gitignored; delete if recreated.
- Chunked MCP applies can leave **duplicate names** in Dashboard migration history
  (e.g. `seed_batch2_words_part3` ×3). Data is fine (`ON CONFLICT` upserts).
  Optional cleanup SQL: `supabase/snippets/cleanup_duplicate_mcp_migrations.sql`.

## Local client wiring

1. Copy `.env.example` → `.env.local` (gitignored).
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API** (anon / publishable key only).
3. Restart `npm run dev`.

Remote readiness checks (via SQL or Dashboard):

| Check | Expected |
|-------|----------|
| `chapters` | 76 |
| `words` | 380 |
| `seasons` | 2 |
| `profiles` / `user_progress` | tables exist, RLS enabled |
| `handle_new_user` trigger | on `auth.users` insert |

First owner account can be bootstrapped in SQL (email confirmed, `is_super_admin`) or via the in-app **Create Account** flow.

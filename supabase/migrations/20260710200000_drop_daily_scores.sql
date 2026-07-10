-- daily_scores was the old hangman "daily challenge" cloud board.
-- Speed-first product: no client writes; weekly dual boards live on speed_scores.

drop policy if exists "Daily scores readable by all" on public.daily_scores;
drop policy if exists "Users insert own daily scores" on public.daily_scores;
drop policy if exists "Users update own daily scores" on public.daily_scores;

drop index if exists public.daily_scores_day_score_idx;

drop table if exists public.daily_scores;

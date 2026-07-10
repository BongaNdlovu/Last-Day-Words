-- Speed leaderboard writes: service_role only (submit-speed-score edge function).
-- Authenticated clients may read boards; DB trigger validate_speed_score() enforces caps.

drop policy if exists "Users upsert own speed scores" on public.speed_scores;
drop policy if exists "Users update own speed scores" on public.speed_scores;

revoke insert, update, delete on public.speed_scores from authenticated;
revoke insert, update, delete on public.speed_scores from anon;

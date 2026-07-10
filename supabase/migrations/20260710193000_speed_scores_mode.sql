-- Dual speed leaderboards: mixed vs chapter (disjoint content pools in app).
-- Existing rows default to 'mixed' so prior weekly board stays under Mixed.

alter table public.speed_scores
  add column if not exists mode text not null default 'mixed';

alter table public.speed_scores
  drop constraint if exists speed_scores_mode_check;

alter table public.speed_scores
  add constraint speed_scores_mode_check
  check (mode in ('mixed', 'chapter'));

-- Replace unique (user_id, week_key) with (user_id, week_key, mode)
alter table public.speed_scores
  drop constraint if exists speed_scores_user_id_week_key_key;

-- Postgres may name the unique constraint differently depending on create path
do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.speed_scores'::regclass
    and contype = 'u'
    and pg_get_constraintdef(oid) ilike '%user_id%week_key%'
    and pg_get_constraintdef(oid) not ilike '%mode%'
  limit 1;
  if cname is not null then
    execute format('alter table public.speed_scores drop constraint %I', cname);
  end if;
end $$;

alter table public.speed_scores
  add constraint speed_scores_user_week_mode_key unique (user_id, week_key, mode);

create index if not exists speed_scores_week_mode_score_idx
  on public.speed_scores (week_key, mode, score desc);

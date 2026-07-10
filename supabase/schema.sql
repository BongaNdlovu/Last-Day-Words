-- Last Day Words - Supabase schema
-- Run in: Supabase Dashboard -> SQL Editor -> New query
-- Project: haoghddjcstxanrtggvb

create extension if not exists pgcrypto;

-- Profiles (display name for leaderboards)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null unique,
  created_at timestamptz not null default now(),
  constraint display_name_length check (char_length(display_name) between 2 and 24)
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile stub from auth metadata on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_name text;
  fallback_name text;
begin
  requested_name := nullif(
    left(
      trim(
        coalesce(
          new.raw_user_meta_data->>'display_name',
          split_part(new.email, '@', 1),
          'Player'
        )
      ),
      24
    ),
    ''
  );

  if requested_name is null or char_length(requested_name) < 2 then
    requested_name := 'Player';
  end if;

  fallback_name := left(requested_name, 15) || '-' || left(new.id::text, 8);

  insert into public.profiles (id, display_name)
  values (new.id, requested_name)
  on conflict (id) do nothing;

  return new;
exception
  when unique_violation then
    insert into public.profiles (id, display_name)
    values (new.id, fallback_name)
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger-only helper: do not expose via PostgREST RPC
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Weekly speed leaderboard (dual boards: mixed | chapter)
-- Anti-cheat: see migrations 20260710210000 + 20260710220000 (validate_speed_score trigger).
create table if not exists public.speed_scores (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  week_key text not null,
  mode text not null default 'mixed' check (mode in ('mixed', 'chapter')),
  score integer not null check (score >= 0),
  words_solved integer not null default 0 check (words_solved >= 0 and words_solved <= 80),
  updated_at timestamptz not null default now(),
  unique (user_id, week_key, mode),
  check (score <= words_solved * 18400),
  check (words_solved = 0 or score >= words_solved * 1000)
);

alter table public.speed_scores enable row level security;

drop policy if exists "Speed scores readable by all" on public.speed_scores;
create policy "Speed scores readable by all"
  on public.speed_scores for select
  using (true);

drop policy if exists "Users upsert own speed scores" on public.speed_scores;
create policy "Users upsert own speed scores"
  on public.speed_scores for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own speed scores" on public.speed_scores;
create policy "Users update own speed scores"
  on public.speed_scores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Online teams rooms (room codes)
create table if not exists public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  white_score integer not null default 0,
  black_score integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.room_members (
  room_id uuid not null references public.game_rooms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  team text not null check (team in ('white', 'black')),
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table public.game_rooms enable row level security;

drop policy if exists "Rooms readable by authenticated" on public.game_rooms;
create policy "Rooms readable by authenticated"
  on public.game_rooms for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can create rooms" on public.game_rooms;
create policy "Authenticated can create rooms"
  on public.game_rooms for insert
  to authenticated
  with check (auth.uid() = host_id);

drop policy if exists "Authenticated can update rooms" on public.game_rooms;
drop policy if exists "Members or host can update rooms" on public.game_rooms;
create policy "Members or host can update rooms"
  on public.game_rooms for update
  to authenticated
  using (
    auth.uid() = host_id
    or exists (
      select 1 from public.room_members m
      where m.room_id = game_rooms.id and m.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = host_id
    or exists (
      select 1 from public.room_members m
      where m.room_id = game_rooms.id and m.user_id = auth.uid()
    )
  );

alter table public.room_members enable row level security;

drop policy if exists "Members readable by authenticated" on public.room_members;
create policy "Members readable by authenticated"
  on public.room_members for select
  to authenticated
  using (true);

drop policy if exists "Users join rooms as themselves" on public.room_members;
create policy "Users join rooms as themselves"
  on public.room_members for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update their own room membership" on public.room_members;
create policy "Users update their own room membership"
  on public.room_members for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users leave rooms" on public.room_members;
create policy "Users leave rooms"
  on public.room_members for delete
  to authenticated
  using (auth.uid() = user_id);

-- Helpful indexes
create index if not exists speed_scores_week_score_idx on public.speed_scores (week_key, score desc);
create index if not exists speed_scores_week_mode_score_idx on public.speed_scores (week_key, mode, score desc);
create index if not exists game_rooms_code_idx on public.game_rooms (code);

-- ---------------------------------------------------------------------------
-- Content catalog (public read) + signed-in progression
-- ---------------------------------------------------------------------------

create table if not exists public.seasons (
  id text primary key,
  title text not null,
  description text not null default '',
  starts_on date,
  ends_on date
);

create table if not exists public.chapters (
  id text primary key,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  season_id text references public.seasons (id) on delete set null
);

create table if not exists public.words (
  id text primary key,
  chapter_id text not null references public.chapters (id) on delete cascade,
  word text not null,
  clue text not null,
  expert_clue text,
  verse text not null default '',
  scripture text not null default '',
  summary text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.season_chapters (
  season_id text not null references public.seasons (id) on delete cascade,
  chapter_id text not null references public.chapters (id) on delete cascade,
  primary key (season_id, chapter_id)
);

create table if not exists public.content_featured (
  week_key text primary key,
  word_id text references public.words (id) on delete set null,
  announcement text
);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  rank text not null default 'novice',
  unlocked_cosmetics text[] not null default '{}',
  selected_candle text not null default 'candle-classic',
  selected_banner text not null default '',
  game_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.seasons enable row level security;
alter table public.chapters enable row level security;
alter table public.words enable row level security;
alter table public.season_chapters enable row level security;
alter table public.content_featured enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "Seasons public read" on public.seasons;
create policy "Seasons public read"
  on public.seasons for select
  using (true);

drop policy if exists "Chapters public read" on public.chapters;
create policy "Chapters public read"
  on public.chapters for select
  using (true);

drop policy if exists "Words public read" on public.words;
create policy "Words public read"
  on public.words for select
  using (true);

drop policy if exists "Season chapters public read" on public.season_chapters;
create policy "Season chapters public read"
  on public.season_chapters for select
  using (true);

drop policy if exists "Featured public read" on public.content_featured;
create policy "Featured public read"
  on public.content_featured for select
  using (true);

drop policy if exists "Users read own progress" on public.user_progress;
create policy "Users read own progress"
  on public.user_progress for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own progress" on public.user_progress;
create policy "Users insert own progress"
  on public.user_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own progress" on public.user_progress;
create policy "Users update own progress"
  on public.user_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists words_chapter_sort_idx on public.words (chapter_id, sort_order);
create index if not exists chapters_sort_idx on public.chapters (sort_order);
create index if not exists user_progress_xp_idx on public.user_progress (xp desc);

-- Seed seasons (Daniel + Revelation tracks)
insert into public.seasons (id, title, description, starts_on, ends_on)
values
  ('daniel', 'Daniel Track', 'Prophetic milestones from the book of Daniel — image, beasts, little horn, sanctuary, and Michael.', null, null),
  ('revelation', 'Revelation Track', 'Prophetic milestones from Revelation — churches, seals, trumpets, beast system, and the millennium.', null, null)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description;

-- Full 80-term / 20-chapter catalog: run supabase/seed_content.sql after this schema.
-- Regenerate with: npx tsx scripts/generate-seed.ts

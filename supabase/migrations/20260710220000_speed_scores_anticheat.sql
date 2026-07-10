-- Stronger speed_scores anti-cheat (server-side; clients can be bypassed).
-- Sync numeric caps with src/utils/speedScoreLimits.ts:
--   MAX_SPEED_SCORE_PER_WORD = 18400
--   MIN_SPEED_SCORE_PER_WORD = 1000
--   MAX_SPEED_WORDS_PER_ROUND = 80
--   min interval between score *increases* = 8 seconds

create or replace function public.validate_speed_score()
returns trigger
language plpgsql
as $$
declare
  max_per_word constant integer := 18400;
  min_per_word constant integer := 1000;
  max_words constant integer := 80;
  min_increase_interval interval := interval '8 seconds';
begin
  -- Types are integer columns; still reject pathological values.
  if NEW.score is null or NEW.words_solved is null then
    raise exception 'score and words_solved are required';
  end if;

  if NEW.score < 0 or NEW.words_solved < 0 then
    raise exception 'score and words_solved must be non-negative';
  end if;

  if NEW.words_solved > max_words then
    raise exception 'words_solved exceeds maximum (%)', max_words;
  end if;

  if NEW.mode is null or NEW.mode not in ('mixed', 'chapter') then
    raise exception 'invalid speed board mode';
  end if;

  -- Zero solves cannot claim points.
  if NEW.words_solved = 0 and NEW.score <> 0 then
    raise exception 'score must be 0 when words_solved is 0';
  end if;

  -- Each solved word pays at least the base solve bonus (1000).
  if NEW.words_solved > 0 and NEW.score < NEW.words_solved * min_per_word then
    raise exception 'score below minimum for words_solved';
  end if;

  if NEW.score > NEW.words_solved * max_per_word then
    raise exception 'score exceeds maximum for words_solved';
  end if;

  -- Week key: SAST Sunday date YYYY-MM-DD (client) or legacy ISO week.
  if NEW.week_key is null
     or (
       NEW.week_key !~ '^\d{4}-\d{2}-\d{2}$'
       and NEW.week_key !~ '^\d{4}-W\d{2}$'
     ) then
    raise exception 'invalid week_key';
  end if;

  if TG_OP = 'UPDATE' then
    -- Monotonic weekly best: never lower score (or wipe with a fake zero).
    if NEW.score < OLD.score then
      NEW.score := OLD.score;
      NEW.words_solved := OLD.words_solved;
    elsif NEW.score = OLD.score then
      NEW.words_solved := greatest(OLD.words_solved, NEW.words_solved);
    end if;

    -- Rate-limit score *increases* (rematch spam / scripted jumps).
    if NEW.score > OLD.score
       and OLD.updated_at is not null
       and OLD.updated_at > (now() - min_increase_interval) then
      raise exception 'score update too frequent';
    end if;
  end if;

  NEW.updated_at := now();
  return NEW;
end;
$$;

drop trigger if exists speed_scores_validate on public.speed_scores;
create trigger speed_scores_validate
  before insert or update on public.speed_scores
  for each row execute function public.validate_speed_score();

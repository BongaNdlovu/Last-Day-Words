-- Raise speed_scores anti-cheat ceiling to match client scoring.
-- Old cap was words_solved * 400 (letter-only). Real rounds use solve bonuses
-- (~2000+ per word) + letter points under combo/golden mults → up to 18400/word.

create or replace function public.validate_speed_score()
returns trigger
language plpgsql
as $$
begin
  if NEW.score < 0 or NEW.words_solved < 0 then
    raise exception 'score and words_solved must be non-negative';
  end if;
  if NEW.words_solved > 80 then
    raise exception 'words_solved exceeds maximum (80)';
  end if;
  -- Must stay in sync with MAX_SPEED_SCORE_PER_WORD in src/utils/speedScoreLimits.ts
  if NEW.score > NEW.words_solved * 18400 then
    raise exception 'score exceeds maximum for words_solved';
  end if;
  return NEW;
end;
$$;

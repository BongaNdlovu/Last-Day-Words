import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/** Keep in sync with src/utils/speedScoreLimits.ts */
const MAX_PER_WORD = 18400;
const MIN_PER_WORD = 1000;
const MAX_WORDS = 80;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = {
  week_key?: string;
  mode?: string;
  score?: number;
  words_solved?: number;
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function validatePayload(body: Body): string | null {
  const score = body.score;
  const words = body.words_solved;
  const mode = body.mode;
  const week = body.week_key;

  if (typeof score !== "number" || typeof words !== "number" || !Number.isFinite(score) || !Number.isFinite(words)) {
    return "invalid_score_payload";
  }
  if (!Number.isInteger(score) || !Number.isInteger(words)) {
    return "non_integer";
  }
  if (score < 0 || words < 0) return "negative";
  if (words > MAX_WORDS) return "too_many_words";
  if (mode !== "mixed" && mode !== "chapter") return "invalid_mode";
  if (!week || (!/^\d{4}-\d{2}-\d{2}$/.test(week) && !/^\d{4}-W\d{2}$/.test(week))) {
    return "invalid_week_key";
  }
  if (words === 0 && score !== 0) return "zero_words_nonzero_score";
  if (words > 0 && score < words * MIN_PER_WORD) return "score_below_min";
  if (score > words * MAX_PER_WORD) return "score_above_max";
  return null;
}

function resolveWeekly(
  existing: { score: number; words_solved: number } | null,
  round: { score: number; words_solved: number }
) {
  const prevScore = existing?.score ?? 0;
  const prevWords = existing?.words_solved ?? 0;
  const score = Math.max(prevScore, round.score);
  let words_solved = prevWords;
  if (round.score > prevScore) words_solved = round.words_solved;
  else if (round.score === prevScore) words_solved = Math.max(prevWords, round.words_solved);
  return { score, words_solved };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }
  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) {
    return json(500, { error: "server_misconfigured" });
  }

  const auth = req.headers.get("Authorization");
  if (!auth) {
    return json(401, { error: "unauthorized" });
  }

  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return json(401, { error: "unauthorized" });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const reject = validatePayload(body);
  if (reject) {
    return json(400, { error: reject });
  }

  const userId = userData.user.id;
  const week_key = body.week_key!;
  const mode = body.mode!;
  const round = { score: body.score!, words_solved: body.words_solved! };

  const admin = createClient(url, service);
  const { data: existing } = await admin
    .from("speed_scores")
    .select("score, words_solved")
    .eq("user_id", userId)
    .eq("week_key", week_key)
    .eq("mode", mode)
    .maybeSingle();

  const upserted = resolveWeekly(
    existing
      ? { score: existing.score as number, words_solved: existing.words_solved as number }
      : null,
    round
  );

  const { error: upsertErr } = await admin.from("speed_scores").upsert(
    {
      user_id: userId,
      week_key,
      mode,
      score: upserted.score,
      words_solved: upserted.words_solved,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,week_key,mode" }
  );

  if (upsertErr) {
    const msg = upsertErr.message ?? "upsert_failed";
    if (msg.includes("too frequent")) {
      return json(429, { error: "submit_too_soon", message: msg });
    }
    return json(400, { error: "upsert_rejected", message: msg });
  }

  return json(200, {
    ok: true,
    score: upserted.score,
    words_solved: upserted.words_solved,
    week_key,
    mode,
  });
});

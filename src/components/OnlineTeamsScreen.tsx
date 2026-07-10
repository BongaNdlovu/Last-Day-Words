import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Copy, Play, Users } from "lucide-react";
import type { Chapter } from "../data/words";
import TeamsModeGame from "./TeamsModeGame";
import {
  supabase,
  isSupabaseConfigured,
  fetchGameRoom,
  startOnlineTeamsGame,
  updateOnlineTeamsRoom,
  leaveOnlineTeamsRoom,
  type GameRoom,
} from "../lib/supabase";
import {
  createOnlineTeamsPayload,
  parseOnlineTeamsPayload,
  type OnlineTeamsPayload,
} from "../utils/onlineTeams";
import { InlineAlert } from "./ErrorState";
import { logError, mapUserFacingError } from "../utils/errors";

interface OnlineTeamsScreenProps {
  chapters: Chapter[];
  onBack: () => void;
}

function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function isCodeCollision(error: unknown): boolean {
  const err = error as { code?: string; message?: string } | null;
  return err?.code === "23505" || /duplicate key|unique/i.test(err?.message ?? "");
}

export default function OnlineTeamsScreen({ chapters, onBack }: OnlineTeamsScreenProps) {
  const allWords = chapters.flatMap((c) => c.words);
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<{ display_name: string; team: string }[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const refreshMembers = useCallback(async (id: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("room_members")
      .select("team, user_id")
      .eq("room_id", id);
    if (error) {
      logError("onlineTeams.refreshMembers", error);
      return;
    }
    const ids = (data ?? []).map((m) => m.user_id as string);
    const { data: profiles, error: profileErr } = ids.length
      ? await supabase.from("profiles").select("id, display_name").in("id", ids)
      : { data: [] as { id: string; display_name: string }[], error: null };
    if (profileErr) logError("onlineTeams.profiles", profileErr);
    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
    setMembers(
      (data ?? []).map((m) => ({
        team: m.team as string,
        display_name: nameById.get(m.user_id as string) ?? "Player",
      }))
    );
  }, []);

  const refreshRoom = useCallback(async (id: string) => {
    try {
      const next = await fetchGameRoom(id);
      if (next) setRoom(next);
      else setError((prev) => prev ?? "Could not refresh room. Reconnect or rejoin with the code.");
    } catch (e) {
      logError("onlineTeams.refreshRoom", e);
      setError(mapUserFacingError(e, "Could not refresh room"));
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!supabase || !roomId) return;
    const client = supabase;
    const channel = client
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${roomId}` },
        () => void refreshMembers(roomId)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "game_rooms", filter: `id=eq.${roomId}` },
        () => void refreshRoom(roomId)
      )
      .subscribe();
    void refreshMembers(roomId);
    void refreshRoom(roomId);
    return () => {
      void client.removeChannel(channel);
    };
  }, [roomId, refreshMembers, refreshRoom]);

  useEffect(() => {
    return () => {
      if (!roomId || !userId) return;
      void leaveOnlineTeamsRoom(roomId, userId);
    };
  }, [roomId, userId]);

  const ensureAuth = async () => {
    if (!supabase) throw new Error("Supabase not configured");
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error("Sign in first (Account) to create or join a room.");
    setUserId(data.user.id);
    return data.user;
  };

  const createRoom = async () => {
    setError(null);
    setStatus(null);
    try {
      const user = await ensureAuth();
      let data: { id: string; code: string } | null = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const newCode = randomCode();
        const { data: created, error: err } = await supabase!
          .from("game_rooms")
          .insert({ code: newCode, host_id: user.id, status: "waiting" })
          .select("id, code")
          .single();
        if (!err) {
          data = created;
          break;
        }
        if (!isCodeCollision(err)) throw err;
      }
      if (!data) throw new Error("Could not create a unique room code. Try again.");
      await supabase!.from("room_members").insert({ room_id: data.id, user_id: user.id, team: "white" });
      setCode(data.code);
      setRoomId(data.id);
      setStatus(`Room ${data.code} created. Share the code with your youth group.`);
      await refreshRoom(data.id);
    } catch (e: unknown) {
      logError("onlineTeams.createRoom", e);
      setError(mapUserFacingError(e, "Could not create room"));
    }
  };

  const joinRoom = async () => {
    setError(null);
    setStatus(null);
    try {
      const user = await ensureAuth();
      const normalized = joinCode.trim().toUpperCase();
      if (!normalized || normalized.length < 4) {
        setError("Enter a valid room code.");
        return;
      }
      const { data: found, error: err } = await supabase!
        .from("game_rooms")
        .select("id, code")
        .eq("code", normalized)
        .maybeSingle();
      if (err) throw err;
      if (!found) throw new Error("No room with that code.");
      const { count, error: countErr } = await supabase!
        .from("room_members")
        .select("*", { count: "exact", head: true })
        .eq("room_id", found.id)
        .eq("team", "black");
      if (countErr) throw countErr;
      const team = (count ?? 0) === 0 ? "black" : "white";
      const { error: joinErr } = await supabase!
        .from("room_members")
        .upsert({ room_id: found.id, user_id: user.id, team });
      if (joinErr) throw joinErr;
      setCode(found.code);
      setRoomId(found.id);
      setStatus(`Joined room ${found.code} as ${team}.`);
      await refreshRoom(found.id);
    } catch (e: unknown) {
      logError("onlineTeams.joinRoom", e);
      setError(mapUserFacingError(e, "Could not join room"));
    }
  };

  const handleStartGame = async () => {
    if (!roomId || !room || userId !== room.host_id) return;
    setStarting(true);
    setError(null);
    try {
      const payload = createOnlineTeamsPayload(allWords);
      await startOnlineTeamsGame(roomId, payload as unknown as Record<string, unknown>);
      await refreshRoom(roomId);
      setStatus("Match started — pass the device between teams.");
    } catch (e: unknown) {
      logError("onlineTeams.startGame", e);
      setError(mapUserFacingError(e, "Could not start game"));
    } finally {
      setStarting(false);
    }
  };

  const handleControlledUpdate = async (
    payload: OnlineTeamsPayload,
    scores: { white: number; black: number }
  ) => {
    if (!roomId) return;
    try {
      await updateOnlineTeamsRoom(roomId, {
        payload: payload as unknown as Record<string, unknown>,
        white_score: scores.white,
        black_score: scores.black,
        status: payload.phase === "finished" ? "finished" : "playing",
      });
    } catch (e: unknown) {
      logError("onlineTeams.update", e);
      setError(mapUserFacingError(e, "Could not sync match state"));
    }
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Room code copied.");
    } catch (e) {
      logError("onlineTeams.copyCode", e);
      setError("Could not copy to clipboard. Select the code and copy manually.");
    }
  };

  const parsedPayload = room ? parseOnlineTeamsPayload(room.payload) : null;
  const isHost = Boolean(room && userId && room.host_id === userId);
  const inGame = room?.status === "playing" || room?.status === "finished";

  if (inGame && parsedPayload && room) {
    return (
      <TeamsModeGame
        chapters={chapters}
        onBack={onBack}
        controlled={{
          payload: parsedPayload,
          scores: { white: room.white_score, black: room.black_score },
          onUpdate: handleControlledUpdate,
        }}
      />
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 py-2 px-2">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#c9c2b4] font-medium cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-lg font-display font-bold tracking-[0.1em] text-[#f4f1ea]">ONLINE TEAMS</h2>
        <div className="w-12" />
      </div>

      {!isSupabaseConfigured && (
        <InlineAlert
          tone="warning"
          title="Cloud rooms unavailable"
          message="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use room codes. Local Teams mode still works offline."
        />
      )}

      {error && (
        <InlineAlert
          tone="error"
          title="Something went wrong"
          message={error}
          actionLabel="Dismiss"
          onAction={() => setError(null)}
        />
      )}
      {status && !error && <InlineAlert tone="success" message={status} />}

      <div className="pcard rounded-2xl p-6 space-y-4">
        <p className="text-sm text-[#c9c2b4]">
          Create a room for Friday youth group, or join with a 6-character code. When the host starts the match, everyone in the room sees the same synced pass-and-play board. Sign in under Account first.
        </p>
        <button
          type="button"
          onClick={createRoom}
          disabled={!isSupabaseConfigured}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#101014] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
        >
          <Users className="w-3.5 h-3.5" aria-hidden="true" /> Create Room
        </button>

        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ROOM CODE"
            disabled={!isSupabaseConfigured}
            className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.06] text-sm font-mono tracking-widest uppercase disabled:opacity-50"
          />
          <button
            type="button"
            onClick={joinRoom}
            disabled={!isSupabaseConfigured}
            className="px-4 py-2 bg-white/[0.08] border border-white/10 rounded-lg text-xs font-bold uppercase cursor-pointer disabled:opacity-50"
          >
            Join
          </button>
        </div>
      </div>

      {code && (
        <div className="pcard rounded-2xl p-6 text-center space-y-3">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#a49b8d]">Room Code</div>
          <div className="text-4xl font-mono font-bold tracking-[0.3em] text-[#f4f1ea]">{code}</div>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#fbbf24] cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> Copy code
          </button>
          {isHost && room?.status === "waiting" && (
            <button
              onClick={handleStartGame}
              disabled={starting || members.length < 1}
              className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-[#b45309] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" /> {starting ? "Starting…" : "Start Match"}
            </button>
          )}
          <div className="pt-2 space-y-1 text-left">
            {members.map((m, i) => (
              <div key={i} className="text-sm text-[#c9c2b4] flex justify-between">
                <span>{m.display_name}</span>
                <span className="uppercase text-[10px] font-bold tracking-wider">{m.team}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

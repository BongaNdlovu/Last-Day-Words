import React, { useEffect, useState } from "react";
import { ArrowLeft, Copy, Users } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface OnlineTeamsScreenProps {
  onBack: () => void;
}

function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export default function OnlineTeamsScreen({ onBack }: OnlineTeamsScreenProps) {
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<{ display_name: string; team: string }[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !roomId) return;
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${roomId}` },
        () => void refreshMembers(roomId)
      )
      .subscribe();
    void refreshMembers(roomId);
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId]);

  const refreshMembers = async (id: string) => {
    if (!supabase) return;
    const { data } = await supabase.from("room_members").select("team, user_id").eq("room_id", id);
    const ids = (data ?? []).map((m) => m.user_id as string);
    const { data: profiles } = ids.length
      ? await supabase.from("profiles").select("id, display_name").in("id", ids)
      : { data: [] as { id: string; display_name: string }[] };
    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
    setMembers(
      (data ?? []).map((m) => ({
        team: m.team as string,
        display_name: nameById.get(m.user_id as string) ?? "Player",
      }))
    );
  };

  const ensureAuth = async () => {
    if (!supabase) throw new Error("Supabase not configured");
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error("Sign in first (Account) to create or join a room.");
    return data.user;
  };

  const createRoom = async () => {
    setError(null);
    setStatus(null);
    try {
      const user = await ensureAuth();
      const newCode = randomCode();
      const { data, error: err } = await supabase!
        .from("game_rooms")
        .insert({ code: newCode, host_id: user.id, status: "waiting" })
        .select("id, code")
        .single();
      if (err) throw err;
      await supabase!.from("room_members").insert({ room_id: data.id, user_id: user.id, team: "white" });
      setCode(data.code);
      setRoomId(data.id);
      setStatus(`Room ${data.code} created. Share the code with your youth group.`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create room");
    }
  };

  const joinRoom = async () => {
    setError(null);
    setStatus(null);
    try {
      const user = await ensureAuth();
      const normalized = joinCode.trim().toUpperCase();
      const { data: room, error: err } = await supabase!
        .from("game_rooms")
        .select("id, code")
        .eq("code", normalized)
        .maybeSingle();
      if (err) throw err;
      if (!room) throw new Error("No room with that code.");
      const { count } = await supabase!
        .from("room_members")
        .select("*", { count: "exact", head: true })
        .eq("room_id", room.id)
        .eq("team", "black");
      const team = (count ?? 0) === 0 ? "black" : "white";
      const { error: joinErr } = await supabase!
        .from("room_members")
        .upsert({ room_id: room.id, user_id: user.id, team });
      if (joinErr) throw joinErr;
      setCode(room.code);
      setRoomId(room.id);
      setStatus(`Joined room ${room.code} as ${team}.`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not join room");
    }
  };

  const copyCode = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setStatus("Room code copied.");
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 py-2 px-2">
      <div className="flex items-center justify-between pb-4 border-b border-[#e2d2ac]">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#5c4a33] font-medium cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-lg font-display font-bold tracking-[0.1em] text-[#2a2018]">ONLINE TEAMS</h2>
        <div className="w-12" />
      </div>

      {!isSupabaseConfigured && (
        <p className="text-sm text-red-800">Configure Supabase to use room codes.</p>
      )}

      <div className="pcard rounded-2xl p-6 space-y-4">
        <p className="text-sm text-[#5c4a33]">
          Create a room for Friday youth group, or join with a 6-character code. Pass-and-play still works from the home Teams Mode button.
        </p>
        <button
          onClick={createRoom}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#2a2018] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" /> Create Room
        </button>

        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ROOM CODE"
            className="flex-1 px-3 py-2 rounded-lg border border-[#e2d2ac] bg-[#fbf5e9] text-sm font-mono tracking-widest uppercase"
          />
          <button
            onClick={joinRoom}
            className="px-4 py-2 bg-[#f0e3c8] border border-[#e2d2ac] rounded-lg text-xs font-bold uppercase cursor-pointer"
          >
            Join
          </button>
        </div>
      </div>

      {code && (
        <div className="pcard rounded-2xl p-6 text-center space-y-3">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#6b5537]">Room Code</div>
          <div className="text-4xl font-mono font-bold tracking-[0.3em] text-[#2a2018]">{code}</div>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#92400e] cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> Copy code
          </button>
          <div className="pt-2 space-y-1 text-left">
            {members.map((m, i) => (
              <div key={i} className="text-sm text-[#5c4a33] flex justify-between">
                <span>{m.display_name}</span>
                <span className="uppercase text-[10px] font-bold tracking-wider">{m.team}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status && <p className="text-sm text-emerald-800 text-center">{status}</p>}
      {error && <p className="text-sm text-red-800 text-center">{error}</p>}
    </div>
  );
}

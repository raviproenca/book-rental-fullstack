import { supabase } from "@/lib/supabase";
import type { LeaderboardEntry } from "@/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function currentUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

export async function getLeaderboard(
  _tab?: string,
  faculdade?: string,
): Promise<LeaderboardEntry[]> {
  const userId = await currentUserId();

  let query = supabase
    .from("profiles")
    .select("id, nome, faculdade, xp_atual, streak, nivel")
    .eq("status", "ativo")
    .order("xp_atual", { ascending: false })
    .limit(50);

  if (faculdade) {
    query = query.eq("faculdade", faculdade);
  }

  const { data: users, error } = await query;
  if (error) throw error;

  // For variacao, we'd need historical ranking data (not available yet).
  // Using 0 as placeholder.
  return (users ?? []).map((u, _i) => ({
    id: typeof u.id === "string" ? parseInt(u.id.slice(0, 8), 16) : 0,
    nome: u.nome,
    faculdade: u.faculdade,
    avatar: initials(u.nome),
    xp: u.xp_atual,
    streak: u.streak,
    nivel: u.nivel,
    variacao: 0,
    isCurrentUser: u.id === userId,
  }));
}

export async function getUserRank(): Promise<{
  rank: number;
  entry: LeaderboardEntry;
}> {
  const userId = await currentUserId();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nome, faculdade, xp_atual, streak, nivel")
    .eq("id", userId)
    .single();

  if (!profile) throw new Error("Profile not found");

  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("status", "ativo")
    .gt("xp_atual", profile.xp_atual);

  const rank = (count ?? 0) + 1;

  return {
    rank,
    entry: {
      id: 0,
      nome: profile.nome,
      faculdade: profile.faculdade,
      avatar: initials(profile.nome),
      xp: profile.xp_atual,
      streak: profile.streak,
      nivel: profile.nivel,
      variacao: 0,
      isCurrentUser: true,
    },
  };
}

import { nameInitials } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type {
  UserProfile,
  DashboardData,
  DashboardLeaderboardEntry,
  WeeklyDataPoint,
  DisciplinePerformance,
} from "@/types";

async function currentUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

export async function getUserProfile(): Promise<UserProfile> {
  const userId = await currentUserId();

  const [{ data: profile, error }, { data: { user } }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.auth.getUser(),
  ]);

  if (error || !profile) throw error ?? new Error("Profile not found");

  return {
    nome: profile.nome,
    email: user?.email ?? "",
    avatar: nameInitials(profile.nome),
    avatarUrl: profile.avatar_url ?? null,
    plano: profile.plano,
    faculdade: profile.faculdade,
    periodo: `${profile.periodo}º semestre`,
    periodoNumero: profile.periodo,
    nivel: profile.nivel,
    xpAtual: profile.xp_atual,
    xpProximoNivel: profile.xp_proximo_nivel,
    streak: profile.streak,
    questoesTotais: profile.questoes_totais,
    taxaAcerto: profile.taxa_acerto,
    horasEstudo: profile.horas_estudo,
    metaQuestoesDiarias: profile.meta_questoes_diarias ?? null,
  };
}

export async function updateProfile(
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  const userId = await currentUserId();

  const updateData: Record<string, unknown> = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.faculdade !== undefined) updateData.faculdade = data.faculdade;
  if (data.periodo !== undefined)
    updateData.periodo = parseInt(data.periodo, 10) || 1;
  if (data.metaQuestoesDiarias !== undefined)
    updateData.meta_questoes_diarias = data.metaQuestoesDiarias;
  if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);
    if (error) throw error;
  }

  return getUserProfile();
}

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadUserAvatar(file: File): Promise<UserProfile> {
  const userId = await currentUserId();
  if (!AVATAR_MIME.has(file.type)) {
    throw new Error("Use uma imagem JPEG, PNG ou WebP.");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("Imagem muito grande (máximo 5 MB).");
  }

  const path = `${userId}/avatar`;
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);
  const bustedUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: bustedUrl })
    .eq("id", userId);
  if (profileError) throw profileError;

  return getUserProfile();
}

/** Active subscription period end (ISO), or null if none / RLS blocks / error. */
export async function getActiveSubscriptionPeriodEnd(): Promise<string | null> {
  try {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("current_period_end")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data?.current_period_end) return null;
    return data.current_period_end;
  } catch {
    return null;
  }
}

export async function recordTermsAcceptance(): Promise<void> {
  const userId = await currentUserId();
  const { error } = await supabase
    .from("profiles")
    .update({ terms_accepted_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

/* ─── Dashboard Aggregated Data ─── */

export async function getDashboardData(): Promise<DashboardData> {
  const userId = await currentUserId();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, meta_questoes_diarias")
    .eq("id", userId)
    .single();

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const { data: weekAnswers } = await supabase
    .from("session_answers")
    .select("created_at, status")
    .eq("user_id", userId)
    .gte("created_at", weekStart.toISOString());

  const dailyMeta = profile?.meta_questoes_diarias ?? 20;

  const todayStr = new Date().toISOString().split("T")[0];
  const questoesHoje = (weekAnswers ?? []).filter((a) =>
    a.created_at.startsWith(todayStr),
  ).length;

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weeklyData: WeeklyDataPoint[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dayStr = d.toISOString().split("T")[0];
    const count = (weekAnswers ?? []).filter((a) =>
      a.created_at.startsWith(dayStr),
    ).length;
    weeklyData.push({ day: dayNames[d.getDay()], questoes: count, meta: dailyMeta });
  }

  // Cap rows so huge histories cannot hang the dashboard (discipline breakdown uses recent answers).
  const { data: allAnswers } = await supabase
    .from("session_answers")
    .select("question_id, status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5000);

  const disciplines: DisciplinePerformance[] = [];

  if (allAnswers && allAnswers.length > 0) {
    const questionIds = [...new Set(allAnswers.map((a) => a.question_id))];
    const { data: questions } = await supabase
      .from("questions_full")
      .select("id, disciplina")
      .in("id", questionIds);

    const discMap = new Map<number, string>();
    (questions ?? []).forEach((q) => {
      if (q.id && q.disciplina) discMap.set(q.id, q.disciplina);
    });

    const stats = new Map<string, { correct: number; total: number }>();
    for (const a of allAnswers) {
      const disc = discMap.get(a.question_id);
      if (!disc) continue;
      const s = stats.get(disc) ?? { correct: 0, total: 0 };
      s.total++;
      if (a.status === "acertou") s.correct++;
      stats.set(disc, s);
    }

    for (const [name, s] of stats) {
      disciplines.push({
        name,
        acerto: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
        feitas: s.total,
      });
    }
    disciplines.sort((a, b) => b.feitas - a.feitas);
    disciplines.splice(6);
  }

  return {
    userName: profile?.nome?.split(" ")[0] ?? "Usuário",
    weeklyData,
    disciplines,
    metaQuestoesDiarias: dailyMeta,
    questoesHoje,
  };
}

/* ─── Dashboard Leaderboard (compact) ─── */

export async function getDashboardLeaderboard(): Promise<
  DashboardLeaderboardEntry[]
> {
  const userId = await currentUserId();

  const { data: topUsers } = await supabase
    .from("profiles")
    .select("id, nome, xp_atual")
    .order("xp_atual", { ascending: false })
    .limit(5);

  return (topUsers ?? []).map((u, i) => ({
    pos: i + 1,
    name: u.nome,
    xp: u.xp_atual,
    avatar: nameInitials(u.nome),
    isUser: u.id === userId,
  }));
}

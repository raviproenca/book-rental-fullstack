import { supabase } from "@/lib/supabase";
import type {
  AdminUser,
  AdminUserPlan,
  AdminUserStatus,
} from "@/types";
import type { PaginatedResult } from "@/services/adminQuestions";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ─── Filter types ─── */

export interface AdminUsersFilter {
  plano?: AdminUserPlan;
  faculdade?: string;
  status?: AdminUserStatus;
  search?: string;
  page: number;
  pageSize: number;
}

/* ─── Queries ─── */

export async function getAdminUsers(
  filters: AdminUsersFilter,
): Promise<PaginatedResult<AdminUser>> {
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" });

  if (filters.plano) {
    query = query.eq("plano", filters.plano);
  }
  if (filters.faculdade) {
    query = query.eq("faculdade", filters.faculdade);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    query = query.or(
      `nome.ilike.%${filters.search}%`,
    );
  }

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  const { data: profiles, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  if (!profiles || profiles.length === 0) {
    return {
      data: [],
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages,
    };
  }

  const data: AdminUser[] = profiles.map((p) => ({
    id: parseInt(p.id.slice(0, 8), 16),
    nome: p.nome,
    email: "",
    avatar: initials(p.nome),
    faculdade: p.faculdade,
    periodo: `${p.periodo}º período`,
    plano: p.plano as AdminUserPlan,
    questoesFeitas: p.questoes_totais,
    taxaAcerto: p.taxa_acerto,
    streak: p.streak,
    dataCadastro: p.created_at.split("T")[0],
    status: p.status as AdminUserStatus,
    ultimoAcesso: p.ultimo_acesso?.split("T")[0] ?? "—",
    horasEstudo: p.horas_estudo,
    nivel: p.nivel,
    xp: p.xp_atual,
    heatmap: [],
    ultimasSessoes: [],
    historicoAssinatura: [],
  }));

  return {
    data,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages,
  };
}

export async function getAdminUserById(
  id: number,
): Promise<AdminUser | undefined> {
  // id is derived from UUID slice; we need to query all profiles and find match.
  // For a more robust approach, store the UUID in the AdminUser type.
  // For now, we query by prefix match.
  const hexPrefix = id.toString(16).padStart(8, "0");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .like("id", `${hexPrefix}%`)
    .limit(1);

  if (!profiles || profiles.length === 0) return undefined;
  const p = profiles[0];
  const userId = p.id;

  // Fetch recent sessions
  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("started_at, discipline_ids, num_questions, correct, wrong, blank, time_seconds")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(5);

  const discIds = [...new Set((sessions ?? []).flatMap((s) => s.discipline_ids))];
  const { data: disciplines } = discIds.length > 0
    ? await supabase.from("disciplines").select("id, nome").in("id", discIds)
    : { data: [] };

  const discMap = new Map<number, string>();
  for (const d of disciplines ?? []) discMap.set(d.id, d.nome);

  const ultimasSessoes = (sessions ?? []).map((s) => {
    const total = s.correct + s.wrong + s.blank;
    const mins = Math.floor(s.time_seconds / 60);
    return {
      date: s.started_at.split("T")[0],
      disciplina: discMap.get(s.discipline_ids[0]) ?? "Prática",
      questoes: s.num_questions,
      acerto: total > 0 ? Math.round((s.correct / total) * 100) : 0,
      duracao: `${mins}min`,
    };
  });

  // Fetch heatmap (last 90 days of session_answers)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000);
  const { data: answers } = await supabase
    .from("session_answers")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", ninetyDaysAgo.toISOString());

  const heatmap: { date: string; questoes: number }[] = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(ninetyDaysAgo);
    d.setDate(d.getDate() + i);
    const dayStr = d.toISOString().split("T")[0];
    const count = (answers ?? []).filter((a) =>
      a.created_at.startsWith(dayStr),
    ).length;
    heatmap.push({ date: dayStr, questoes: count });
  }

  // Fetch subscription history
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*, plans!subscriptions_plan_id_fkey(name, price)")
    .eq("user_id", userId)
    .order("created_at");

  const historicoAssinatura = [
    {
      data: p.created_at.split("T")[0],
      evento: "Cadastro",
      plano: "Free",
      valor: "—",
    },
    ...(subs ?? []).map((s) => {
      const plan = s.plans as { name: string; price: number } | null;
      return {
        data: s.created_at.split("T")[0],
        evento: "Upgrade",
        plano: plan?.name ?? "Pro",
        valor: `R$ ${(plan?.price ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      };
    }),
  ];

  return {
    id,
    nome: p.nome,
    email: "",
    avatar: initials(p.nome),
    faculdade: p.faculdade,
    periodo: `${p.periodo}º período`,
    plano: p.plano as AdminUserPlan,
    questoesFeitas: p.questoes_totais,
    taxaAcerto: p.taxa_acerto,
    streak: p.streak,
    dataCadastro: p.created_at.split("T")[0],
    status: p.status as AdminUserStatus,
    ultimoAcesso: p.ultimo_acesso?.split("T")[0] ?? "—",
    horasEstudo: p.horas_estudo,
    nivel: p.nivel,
    xp: p.xp_atual,
    heatmap,
    ultimasSessoes,
    historicoAssinatura,
  };
}

export async function getAllFaculdades(): Promise<string[]> {
  const { data } = await supabase
    .from("profiles")
    .select("faculdade");

  if (!data) return [];
  return [...new Set(data.map((p) => p.faculdade))].sort();
}

export const allFaculdades: string[] = [];

/* ─── Mutations ─── */

export async function banUser(id: number): Promise<void> {
  const hexPrefix = id.toString(16).padStart(8, "0");
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .like("id", `${hexPrefix}%`)
    .limit(1);

  if (profiles && profiles.length > 0) {
    await supabase
      .from("profiles")
      .update({ status: "banido" })
      .eq("id", profiles[0].id);
  }
}

export async function grantPro(id: number): Promise<void> {
  const hexPrefix = id.toString(16).padStart(8, "0");
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .like("id", `${hexPrefix}%`)
    .limit(1);

  if (profiles && profiles.length > 0) {
    const userId = profiles[0].id;
    await supabase.from("profiles").update({ plano: "pro" }).eq("id", userId);

    // Find a pro plan to create subscription
    const { data: proPlan } = await supabase
      .from("plans")
      .select("id, price")
      .ilike("name", "%pro%")
      .eq("interval", "anual")
      .limit(1)
      .single();

    if (proPlan) {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);

      await supabase.from("subscriptions").insert({
        user_id: userId,
        plan_id: proPlan.id,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      });
    }
  }
}

export async function resetPassword(id: number): Promise<void> {
  // Server-side password reset would require admin API.
  // This is a placeholder - in production, use supabase admin client.
  void id;
}

export async function sendEmail(id: number): Promise<void> {
  // Email sending would require an edge function or third-party service.
  void id;
}

/* ─── CSV export ─── */

export async function exportUsersCSV(): Promise<void> {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (!profiles) return;

  const header = [
    "ID",
    "Nome",
    "Faculdade",
    "Período",
    "Plano",
    "Questões Feitas",
    "Taxa Acerto (%)",
    "Streak",
    "Data Cadastro",
    "Status",
  ].join(",");

  const rows = profiles.map((u) =>
    [
      u.id.slice(0, 8),
      `"${u.nome}"`,
      u.faculdade,
      `${u.periodo}º período`,
      u.plano === "pro" ? "Pro" : "Free",
      u.questoes_totais,
      u.taxa_acerto,
      u.streak,
      u.created_at.split("T")[0],
      u.status,
    ].join(","),
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `medquest-usuarios-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

import { supabase } from "@/lib/supabase";
import type {
  AdminSubKpis,
  MrrDataPoint,
  SubFlowDataPoint,
  AdminSubRow,
  AdminSubStatus,
} from "@/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function mapSubStatus(
  status: string,
): AdminSubStatus {
  if (status === "active") return "ativa";
  if (status === "canceled") return "cancelada";
  return "atrasada"; // past_due
}

export async function getSubKpis(): Promise<AdminSubKpis> {
  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("*, plans!subscriptions_plan_id_fkey(price)")
    .eq("status", "active");

  const { count: canceledThisMonth } = await supabase
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("status", "canceled")
    .gte(
      "canceled_at",
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    );

  const totalAssinantes = activeSubs?.length ?? 0;
  const mrr = (activeSubs ?? []).reduce((sum, s) => {
    const plan = s.plans as { price: number } | null;
    return sum + (plan?.price ?? 0);
  }, 0);

  const arpu = totalAssinantes > 0 ? mrr / totalAssinantes : 0;
  const churnRate =
    totalAssinantes > 0
      ? ((canceledThisMonth ?? 0) / (totalAssinantes + (canceledThisMonth ?? 0))) * 100
      : 0;
  const ltv = churnRate > 0 ? arpu / (churnRate / 100) : arpu * 12;

  return {
    mrr,
    mrrChange: 0,
    totalAssinantes,
    assinantesChange: 0,
    churnRate: Math.round(churnRate * 10) / 10,
    churnChange: 0,
    arpu: Math.round(arpu * 100) / 100,
    arpuChange: 0,
    ltv: Math.round(ltv * 100) / 100,
    ltvChange: 0,
  };
}

export async function getMrrEvolution(): Promise<MrrDataPoint[]> {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const result: MrrDataPoint[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);

    const { data: subs } = await supabase
      .from("subscriptions")
      .select("plans!subscriptions_plan_id_fkey(price)")
      .lte("current_period_start", nextMonth.toISOString())
      .or(`status.eq.active,current_period_end.gte.${d.toISOString()}`);

    const mrr = (subs ?? []).reduce((sum, s) => {
      const plan = s.plans as { price: number } | null;
      return sum + (plan?.price ?? 0);
    }, 0);

    result.push({
      month: months[d.getMonth()],
      mrr,
    });
  }

  return result;
}

export async function getSubFlow(): Promise<SubFlowDataPoint[]> {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const result: SubFlowDataPoint[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const [{ count: novos }, { count: cancelamentos }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart.toISOString())
        .lt("created_at", monthEnd.toISOString()),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "canceled")
        .gte("canceled_at", monthStart.toISOString())
        .lt("canceled_at", monthEnd.toISOString()),
    ]);

    result.push({
      month: months[monthStart.getMonth()],
      novos: novos ?? 0,
      cancelamentos: cancelamentos ?? 0,
    });
  }

  return result;
}

export type SubFilters = {
  status?: AdminSubStatus;
  period?: string;
  page: number;
  pageSize: number;
};

export async function getSubscriptions(filters: SubFilters): Promise<{
  data: AdminSubRow[];
  total: number;
  totalPages: number;
}> {
  let query = supabase
    .from("subscriptions")
    .select(
      "*, profiles!subscriptions_user_id_fkey(nome), plans!subscriptions_plan_id_fkey(name, price)",
      { count: "exact" },
    );

  if (filters.status) {
    const dbStatus =
      filters.status === "ativa"
        ? "active"
        : filters.status === "cancelada"
          ? "canceled"
          : "past_due";
    query = query.eq("status", dbStatus);
  }

  if (filters.period) {
    const now = new Date();
    let cutoff: Date;
    switch (filters.period) {
      case "7d":
        cutoff = new Date(now.getTime() - 7 * 86_400_000);
        break;
      case "30d":
        cutoff = new Date(now.getTime() - 30 * 86_400_000);
        break;
      case "90d":
        cutoff = new Date(now.getTime() - 90 * 86_400_000);
        break;
      default:
        cutoff = new Date(0);
    }
    query = query.gte("created_at", cutoff.toISOString());
  }

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  const { data: subs, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  const data: AdminSubRow[] = (subs ?? []).map((s, i) => {
    const profile = s.profiles as { nome: string } | null;
    const plan = s.plans as { name: string; price: number } | null;
    const nome = profile?.nome ?? "Usuário";

    return {
      id: s.id,
      usuario: nome,
      email: "",
      avatar: initials(nome),
      plano: plan?.name ?? "Pro",
      valor: plan?.price ?? 0,
      dataInicio: s.current_period_start.split("T")[0],
      proximaCobranca:
        s.status === "canceled"
          ? "—"
          : s.current_period_end.split("T")[0],
      status: mapSubStatus(s.status),
    };
  });

  return { data, total, totalPages };
}

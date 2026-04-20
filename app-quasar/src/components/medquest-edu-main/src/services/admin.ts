import { Users, UserCheck, Crown, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type {
  AdminStat,
  AdminChartPoint,
  AdminSignup,
  AdminSubscription,
  AdminReport,
} from "@/types";

export async function getAdminStats(): Promise<AdminStat[]> {
  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: proSubs },
    { data: subRevenue },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte(
        "ultimo_acesso",
        new Date(Date.now() - 7 * 86_400_000).toISOString(),
      ),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("subscriptions")
      .select("plan_id, plans!subscriptions_plan_id_fkey(price)")
      .eq("status", "active"),
  ]);

  const mrr = (subRevenue ?? []).reduce((sum, s) => {
    const plan = s.plans as { price: number } | null;
    return sum + (plan?.price ?? 0);
  }, 0);

  const formatNum = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",")}k` : String(n);

  return [
    {
      label: "Total Usuários",
      value: formatNum(totalUsers ?? 0),
      change: "—",
      trend: "up" as const,
      icon: Users,
    },
    {
      label: "Ativos (7d)",
      value: formatNum(activeUsers ?? 0),
      change: "—",
      trend: "up" as const,
      icon: UserCheck,
    },
    {
      label: "Assinantes Pro",
      value: formatNum(proSubs ?? 0),
      change: "—",
      trend: "up" as const,
      icon: Crown,
    },
    {
      label: "MRR",
      value: `R$ ${mrr.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
      change: "—",
      trend: "up" as const,
      icon: DollarSign,
    },
  ];
}

export async function getAdminChartData(): Promise<{
  userGrowth: AdminChartPoint[];
  questionsPerDay: AdminChartPoint[];
}> {
  // User growth: count profiles created per day (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at");

  const { count: totalBefore } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .lt("created_at", thirtyDaysAgo.toISOString());

  let cumulative = totalBefore ?? 0;
  const userGrowth: AdminChartPoint[] = [];
  const dayMap = new Map<string, number>();

  for (const p of profiles ?? []) {
    const day = p.created_at.split("T")[0];
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }

  for (let i = 0; i < 15; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i * 2);
    const dayStr = d.toISOString().split("T")[0];

    // Sum all registrations up to this day
    for (const [key, val] of dayMap) {
      if (key <= dayStr) {
        cumulative += val;
        dayMap.delete(key);
      }
    }

    const label = `${String(d.getDate()).padStart(2, "0")} ${["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][d.getMonth()]}`;
    userGrowth.push({ date: label, users: cumulative });
  }

  // Questions answered per day (last 14 days)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86_400_000);
  const { data: answers } = await supabase
    .from("session_answers")
    .select("created_at")
    .gte("created_at", fourteenDaysAgo.toISOString());

  const questionsPerDay: AdminChartPoint[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const dayStr = d.toISOString().split("T")[0];
    const count = (answers ?? []).filter((a) =>
      a.created_at.startsWith(dayStr),
    ).length;
    const label = `${String(d.getDate()).padStart(2, "0")} ${["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][d.getMonth()]}`;
    questionsPerDay.push({ date: label, questoes: count });
  }

  return { userGrowth, questionsPerDay };
}

export async function getRecentActivity(): Promise<{
  signups: AdminSignup[];
  subscriptions: AdminSubscription[];
  reports: AdminReport[];
}> {
  const [{ data: recentProfiles }, { data: recentSubs }, { data: recentReports }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("nome, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("subscriptions")
        .select("*, profiles!subscriptions_user_id_fkey(nome), plans!subscriptions_plan_id_fkey(name, price)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("question_reports")
        .select("*, profiles!question_reports_user_id_fkey(nome)")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `há ${hours}h`;
    return `há ${Math.floor(hours / 24)}d`;
  }

  const signups: AdminSignup[] = (recentProfiles ?? []).map((p) => ({
    name: p.nome,
    email: "",
    time: timeAgo(p.created_at),
  }));

  const subscriptions: AdminSubscription[] = (recentSubs ?? []).map((s) => {
    const profile = s.profiles as { nome: string } | null;
    const plan = s.plans as { name: string; price: number } | null;
    return {
      name: profile?.nome ?? "Usuário",
      plan: plan?.name ?? "Pro",
      amount: `R$ ${(plan?.price ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      time: timeAgo(s.created_at),
    };
  });

  const reports: AdminReport[] = (recentReports ?? []).map((r) => {
    const profile = r.profiles as { nome: string } | null;
    return {
      user: profile?.nome ?? "Usuário",
      reason: r.reason,
      question: `#${r.question_id}`,
      time: timeAgo(r.created_at),
    };
  });

  return { signups, subscriptions, reports };
}

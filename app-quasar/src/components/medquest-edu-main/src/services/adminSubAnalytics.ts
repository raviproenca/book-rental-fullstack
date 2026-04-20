import { supabase } from "@/lib/supabase";
import type {
  PlanKpis,
  PlanRevenueDataPoint,
  PlanChurnDataPoint,
  PlanMigrationDataPoint,
} from "@/types";

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export async function getPlanKpis(): Promise<PlanKpis> {
  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("*, plans!subscriptions_plan_id_fkey(price, interval)")
    .eq("status", "active");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: canceledSubs } = await supabase
    .from("subscriptions")
    .select("plans!subscriptions_plan_id_fkey(interval)")
    .eq("status", "canceled")
    .gte("canceled_at", monthStart.toISOString());

  const mensal = { receita: 0, assinantes: 0 };
  const anual = { receita: 0, assinantes: 0 };

  for (const s of activeSubs ?? []) {
    const plan = s.plans as { price: number; interval: string } | null;
    if (!plan) continue;
    if (plan.interval === "mensal") {
      mensal.receita += plan.price;
      mensal.assinantes++;
    } else {
      anual.receita += plan.price;
      anual.assinantes++;
    }
  }

  let mensalCanceled = 0;
  let anualCanceled = 0;
  for (const s of canceledSubs ?? []) {
    const plan = s.plans as { interval: string } | null;
    if (plan?.interval === "mensal") mensalCanceled++;
    else anualCanceled++;
  }

  const mensalTotal = mensal.assinantes + mensalCanceled;
  const anualTotal = anual.assinantes + anualCanceled;

  const mensalChurn = mensalTotal > 0 ? (mensalCanceled / mensalTotal) * 100 : 0;
  const anualChurn = anualTotal > 0 ? (anualCanceled / anualTotal) * 100 : 0;

  return {
    mensal: {
      receita: mensal.receita,
      receitaChange: 0,
      assinantes: mensal.assinantes,
      assinantesChange: 0,
      churnRate: Math.round(mensalChurn * 10) / 10,
      churnChange: 0,
      retencao: Math.round((100 - mensalChurn) * 10) / 10,
      retencaoChange: 0,
    },
    anual: {
      receita: anual.receita,
      receitaChange: 0,
      assinantes: anual.assinantes,
      assinantesChange: 0,
      churnRate: Math.round(anualChurn * 10) / 10,
      churnChange: 0,
      retencao: Math.round((100 - anualChurn) * 10) / 10,
      retencaoChange: 0,
    },
  };
}

export async function getPlanRevenueEvolution(): Promise<
  PlanRevenueDataPoint[]
> {
  const result: PlanRevenueDataPoint[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const { data: subs } = await supabase
      .from("subscriptions")
      .select("plans!subscriptions_plan_id_fkey(price, interval)")
      .lte("current_period_start", monthEnd.toISOString())
      .or(
        `status.eq.active,current_period_end.gte.${monthStart.toISOString()}`,
      );

    let mensalRevenue = 0;
    let anualRevenue = 0;
    for (const s of subs ?? []) {
      const plan = s.plans as { price: number; interval: string } | null;
      if (!plan) continue;
      if (plan.interval === "mensal") mensalRevenue += plan.price;
      else anualRevenue += plan.price;
    }

    result.push({
      month: MONTHS[monthStart.getMonth()],
      mensal: mensalRevenue,
      anual: anualRevenue,
    });
  }

  return result;
}

export async function getPlanChurnComparison(): Promise<
  PlanChurnDataPoint[]
> {
  const result: PlanChurnDataPoint[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const { data: canceled } = await supabase
      .from("subscriptions")
      .select("plans!subscriptions_plan_id_fkey(interval)")
      .eq("status", "canceled")
      .gte("canceled_at", monthStart.toISOString())
      .lt("canceled_at", monthEnd.toISOString());

    const { data: active } = await supabase
      .from("subscriptions")
      .select("plans!subscriptions_plan_id_fkey(interval)")
      .lte("current_period_start", monthEnd.toISOString())
      .or(
        `status.eq.active,current_period_end.gte.${monthStart.toISOString()}`,
      );

    let mensalCanceled = 0;
    let anualCanceled = 0;
    for (const s of canceled ?? []) {
      const plan = s.plans as { interval: string } | null;
      if (plan?.interval === "mensal") mensalCanceled++;
      else anualCanceled++;
    }

    let mensalActive = 0;
    let anualActive = 0;
    for (const s of active ?? []) {
      const plan = s.plans as { interval: string } | null;
      if (plan?.interval === "mensal") mensalActive++;
      else anualActive++;
    }

    const mensalTotal = mensalActive + mensalCanceled;
    const anualTotal = anualActive + anualCanceled;

    result.push({
      month: MONTHS[monthStart.getMonth()],
      mensal:
        mensalTotal > 0
          ? Math.round((mensalCanceled / mensalTotal) * 1000) / 10
          : 0,
      anual:
        anualTotal > 0
          ? Math.round((anualCanceled / anualTotal) * 1000) / 10
          : 0,
    });
  }

  return result;
}

export async function getPlanMigrations(): Promise<PlanMigrationDataPoint[]> {
  // Plan migrations would require tracking plan changes over time.
  // Without a dedicated migration log table, we return empty data.
  // This can be implemented with a trigger that logs plan changes.
  const result: PlanMigrationDataPoint[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      month: MONTHS[monthStart.getMonth()],
      mensalParaAnual: 0,
      anualParaMensal: 0,
    });
  }

  return result;
}

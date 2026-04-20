import { supabase } from "@/lib/supabase";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanData {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: PlanFeature[];
  /** Supabase `plans.id` for the mensal row (required for updates when row exists). */
  monthlyRowId?: string;
  /** Supabase `plans.id` for the anual row (Pro only, when row exists). */
  annualRowId?: string;
}

export type PlanUpdateMeta = Pick<
  PlanData,
  "id" | "monthlyRowId" | "annualRowId"
>;

async function updatePlanRow(
  rowId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const { data: rows, error } = await supabase
    .from("plans")
    .update(payload)
    .eq("id", rowId)
    .select("id");
  if (error) throw error;
  if (!rows?.length) {
    throw new Error(
      "Nenhuma linha de plano foi atualizada. Verifique o registro no banco ou permissões (RLS).",
    );
  }
}

const defaultDescriptions: Record<string, string> = {
  free: "Para começar a estudar",
  pro: "Acesso completo à plataforma",
};

const freeFeatureFlags: Record<string, boolean> = {
  "Comentários de especialistas": false,
  "Simulados completos": false,
  "Revisão espaçada": false,
  "Analytics avançados": false,
};

/** Shown when DB has no rows or the client cannot load plans (e.g. before RLS migration). */
export const DEFAULT_FREE_PLAN_FEATURES_FALLBACK: PlanFeature[] = [
  { text: "10 questões por dia", included: true },
  { text: "2 disciplinas", included: true },
  { text: "Dashboard básico", included: true },
  { text: "Acesso mobile", included: true },
];

export const DEFAULT_PRO_PLAN_FEATURES_FALLBACK: PlanFeature[] = [
  { text: "Acesso completo", included: true },
];

export function getAnnualMonthlyEquivalent(annualPrice: number): number {
  return Math.round((annualPrice / 12) * 100) / 100;
}

export function getAnnualSavingsPercent(
  monthlyPrice: number,
  annualPrice: number,
): number {
  if (monthlyPrice <= 0) return 0;
  const fullYearMonthly = monthlyPrice * 12;
  return Math.round(((fullYearMonthly - annualPrice) / fullYearMonthly) * 100);
}

export async function getPlans(): Promise<PlanData[]> {
  const { data: plans, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("price");

  if (error) throw error;
  if (!plans || plans.length === 0) return [];

  // Group plans by name to combine monthly/annual
  const grouped = new Map<
    string,
    { monthly: (typeof plans)[0] | null; annual: (typeof plans)[0] | null }
  >();

  for (const p of plans) {
    const baseName = p.name.toLowerCase().includes("pro") ? "pro" : "free";
    const entry = grouped.get(baseName) ?? { monthly: null, annual: null };
    if (p.interval === "mensal") entry.monthly = p;
    else entry.annual = p;
    grouped.set(baseName, entry);
  }

  const result: PlanData[] = [];

  // Always include free plan
  const freePlan = grouped.get("free");
  const freeMonthly = freePlan?.monthly;

  const freeFeatures: PlanFeature[] = (freeMonthly?.features ?? []).map(
    (f) => ({
      text: f,
      included: freeFeatureFlags[f] === undefined ? true : freeFeatureFlags[f],
    }),
  );

  result.push({
    id: "free",
    name: "Gratuito",
    description: defaultDescriptions.free,
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyRowId: freeMonthly?.id,
    annualRowId: freePlan?.annual?.id,
    features: freeFeatures.length > 0 ? freeFeatures : DEFAULT_FREE_PLAN_FEATURES_FALLBACK,
  });

  const proPlan = grouped.get("pro");
  if (proPlan) {
    const monthlyPrice = proPlan.monthly?.price ?? 0;
    const annualPrice = proPlan.annual?.price ?? monthlyPrice * 12;
    const features = (
      proPlan.monthly?.features ??
      proPlan.annual?.features ??
      []
    ).map((f) => ({ text: f, included: true }));

    result.push({
      id: "pro",
      name: "Pro",
      description: defaultDescriptions.pro,
      monthlyPrice,
      annualPrice,
      monthlyRowId: proPlan.monthly?.id,
      annualRowId: proPlan.annual?.id,
      features: features.length > 0 ? features : DEFAULT_PRO_PLAN_FEATURES_FALLBACK,
    });
  }

  return result;
}

export async function updatePlan(
  meta: PlanUpdateMeta,
  data: Partial<
    Omit<PlanData, "id" | "monthlyRowId" | "annualRowId">
  >,
): Promise<PlanData> {
  const { id, monthlyRowId, annualRowId } = meta;

  const updatePayload: Record<string, unknown> = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.monthlyPrice !== undefined)
    updatePayload.price = data.monthlyPrice;
  if (data.features !== undefined)
    updatePayload.features = data.features
      .filter((f) => f.included)
      .map((f) => f.text);

  if (Object.keys(updatePayload).length > 0) {
    if (!monthlyRowId) {
      throw new Error(
        "Não há registro mensal deste plano no banco (monthlyRowId ausente).",
      );
    }
    await updatePlanRow(monthlyRowId, updatePayload);
  }

  if (id === "pro" && data.annualPrice !== undefined) {
    if (!annualRowId) {
      throw new Error(
        'Nenhuma linha de plano Pro anual encontrada no banco. Crie um registro em plans com intervalo "anual".',
      );
    }
    await updatePlanRow(annualRowId, { price: data.annualPrice });
  }

  const plans = await getPlans();
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error("Plan not found");
  return plan;
}

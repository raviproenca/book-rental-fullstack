import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export const DISCOUNT_TYPES = ["percent", "fixed", "extended_trial", "first_month_free"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const BILLING_SCOPES = ["monthly", "annual", "both"] as const;
export type BillingScope = (typeof BILLING_SCOPES)[number];

export const DISCOUNT_CHARGE_SCOPES = ["first_invoice", "recurring"] as const;
export type DiscountChargeScope = (typeof DISCOUNT_CHARGE_SCOPES)[number];

export type DiscountCouponRow = Database["public"]["Tables"]["discount_coupons"]["Row"];

export type DiscountCouponWithPlan = DiscountCouponRow & {
  plans: { name: string; interval: Database["public"]["Enums"]["plan_interval"] } | null;
};

export type PlanOption = {
  id: string;
  label: string;
  interval: Database["public"]["Enums"]["plan_interval"];
  price: number;
};

export type InfluencerOption = {
  id: string;
  name: string;
};

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Split pasted emails / lines into lowercase unique tokens. */
export function parseEmailAllowlistRaw(raw: string): string[] {
  const parts = raw
    .split(/[\s,;]+/g)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(parts)];
}

export function deriveAppliesToBillingFromPlans(
  eligiblePlanIds: string[] | null,
  catalog: PlanOption[],
): BillingScope {
  const ids =
    eligiblePlanIds?.filter(Boolean) ?? catalog.map((p) => p.id);
  if (ids.length === 0) return "both";

  const intervals = new Set(
    ids
      .map((id) => catalog.find((p) => p.id === id)?.interval)
      .filter((i): i is Database["public"]["Enums"]["plan_interval"] => !!i),
  );
  if (intervals.size === 0) return "both";
  if (intervals.has("mensal") && intervals.has("anual")) return "both";
  if (intervals.has("mensal")) return "monthly";
  return "annual";
}

export async function listInfluencers(): Promise<InfluencerOption[]> {
  const { data, error } = await supabase
    .from("influencers")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as InfluencerOption[];
}

export async function getInfluencerById(id: string): Promise<InfluencerOption | null> {
  const { data, error } = await supabase
    .from("influencers")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as InfluencerOption) ?? null;
}

export async function listPlanOptionsForCoupons(): Promise<PlanOption[]> {
  const { data, error } = await supabase
    .from("plans")
    .select("id, name, interval, price")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .order("interval", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    label: `${p.name} (${p.interval})`,
    interval: p.interval,
    price: Number(p.price),
  }));
}

export async function listDiscountCoupons(): Promise<DiscountCouponWithPlan[]> {
  const { data, error } = await supabase
    .from("discount_coupons")
    .select(
      `
      *,
      plans!discount_coupons_plan_id_fkey ( name, interval )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as DiscountCouponWithPlan[];
}

export async function getDiscountCouponById(id: string): Promise<DiscountCouponWithPlan | null> {
  const { data, error } = await supabase
    .from("discount_coupons")
    .select(
      `
      *,
      plans!discount_coupons_plan_id_fkey ( name, interval )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as DiscountCouponWithPlan) ?? null;
}

export type DiscountCouponInput = {
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number | null;
  validFrom: string;
  validUntil: string | null;
  firstPurchaseOnly: boolean;
  maxRedemptionsPerUser: number | null;
  appliesToBilling: BillingScope;
  planId: string | null;
  isActive: boolean;
  influencerId: string | null;
  eligiblePlanIds: string[] | null;
  discountChargeScope: DiscountChargeScope;
  recurringMonths: number | null;
  minPurchaseAmount: number | null;
  emailAllowlist: string[] | null;
};

function toInsertPayload(input: DiscountCouponInput) {
  const useEligible = input.eligiblePlanIds != null && input.eligiblePlanIds.length > 0;
  return {
    code: normalizeCouponCode(input.code),
    description: input.description?.trim() || null,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    max_uses: input.maxUses,
    valid_from: input.validFrom,
    valid_until: input.validUntil,
    first_purchase_only: input.firstPurchaseOnly,
    max_redemptions_per_user: input.maxRedemptionsPerUser,
    applies_to_billing: input.appliesToBilling,
    plan_id: useEligible ? null : input.planId,
    is_active: input.isActive,
    influencer_id: input.influencerId,
    eligible_plan_ids: useEligible ? input.eligiblePlanIds : null,
    discount_charge_scope: input.discountChargeScope,
    recurring_months:
      input.discountChargeScope === "recurring" ? input.recurringMonths : null,
    min_purchase_amount: input.minPurchaseAmount,
    email_allowlist:
      input.emailAllowlist != null && input.emailAllowlist.length > 0
        ? input.emailAllowlist
        : null,
  };
}

export async function createDiscountCoupon(input: DiscountCouponInput): Promise<DiscountCouponRow> {
  const { data, error } = await supabase
    .from("discount_coupons")
    .insert(toInsertPayload(input))
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDiscountCoupon(
  id: string,
  input: Partial<DiscountCouponInput>,
): Promise<DiscountCouponRow> {
  const patch: Record<string, unknown> = {};

  if (input.code !== undefined) patch.code = normalizeCouponCode(input.code);
  if (input.description !== undefined) {
    patch.description = input.description?.trim() || null;
  }
  if (input.discountType !== undefined) patch.discount_type = input.discountType;
  if (input.discountValue !== undefined) patch.discount_value = input.discountValue;
  if (input.maxUses !== undefined) patch.max_uses = input.maxUses;
  if (input.validFrom !== undefined) patch.valid_from = input.validFrom;
  if (input.validUntil !== undefined) patch.valid_until = input.validUntil;
  if (input.firstPurchaseOnly !== undefined) {
    patch.first_purchase_only = input.firstPurchaseOnly;
  }
  if (input.maxRedemptionsPerUser !== undefined) {
    patch.max_redemptions_per_user = input.maxRedemptionsPerUser;
  }
  if (input.appliesToBilling !== undefined) patch.applies_to_billing = input.appliesToBilling;
  if (input.isActive !== undefined) patch.is_active = input.isActive;

  if (input.influencerId !== undefined) patch.influencer_id = input.influencerId;

  if (input.eligiblePlanIds !== undefined || input.planId !== undefined) {
    const elig = input.eligiblePlanIds;
    const useEligible = elig != null && elig.length > 0;
    if (useEligible) {
      patch.eligible_plan_ids = elig;
      patch.plan_id = null;
    } else {
      patch.eligible_plan_ids = null;
      if (input.planId !== undefined) patch.plan_id = input.planId;
    }
  }

  if (input.discountChargeScope !== undefined) {
    patch.discount_charge_scope = input.discountChargeScope;
  }
  if (input.recurringMonths !== undefined) {
    patch.recurring_months = input.recurringMonths;
  }
  if (patch.discount_charge_scope === "first_invoice") {
    patch.recurring_months = null;
  }
  if (input.minPurchaseAmount !== undefined) {
    patch.min_purchase_amount = input.minPurchaseAmount;
  }
  if (input.emailAllowlist !== undefined) {
    patch.email_allowlist =
      input.emailAllowlist != null && input.emailAllowlist.length > 0
        ? input.emailAllowlist
        : null;
  }

  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("discount_coupons")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDiscountCoupon(id: string): Promise<void> {
  const { error } = await supabase.from("discount_coupons").delete().eq("id", id);
  if (error) throw error;
}

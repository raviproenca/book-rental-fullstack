import {
  endOfMonth,
  startOfMonth,
  subDays,
} from "date-fns";
import type { DiscountCouponWithPlan } from "@/services/adminCoupons";

export type CouponDisplayStatus = "ativo" | "pausado" | "expirado";

export type AdminCouponListRow = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  uses_count: number;
  max_uses: number | null;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  /** Present only in mock mode or when backend adds attribution */
  channel?: string | null;
  /** BRL; mock or future analytics */
  revenueGenerated?: number | null;
};

export function couponsListUsesMocks(): boolean {
  return import.meta.env.VITE_ADMIN_COUPONS_LIST_MOCK !== "false";
}

export function deriveCouponStatus(
  row: Pick<AdminCouponListRow, "valid_until" | "is_active">,
  now: Date = new Date(),
): CouponDisplayStatus {
  if (row.valid_until) {
    const until = new Date(row.valid_until).getTime();
    if (now.getTime() > until) return "expirado";
  }
  if (!row.is_active) return "pausado";
  return "ativo";
}

export function mapDbCouponToListRow(row: DiscountCouponWithPlan): AdminCouponListRow {
  return {
    id: row.id,
    code: row.code,
    discount_type: row.discount_type,
    discount_value: Number(row.discount_value),
    uses_count: row.uses_count,
    max_uses: row.max_uses,
    valid_from: row.valid_from,
    valid_until: row.valid_until,
    is_active: row.is_active,
    channel: null,
    revenueGenerated: null,
  };
}

export type PeriodPreset = "all" | "this_month" | "last_30d";

/**
 * Keep rows whose validity window [valid_from, valid_until ?? +∞) intersects the chosen period range.
 */
export function couponIntersectsPeriod(
  row: AdminCouponListRow,
  preset: PeriodPreset,
  now: Date,
): boolean {
  if (preset === "all") return true;

  let rangeStart: Date;
  let rangeEnd: Date;

  if (preset === "last_30d") {
    rangeEnd = new Date(now);
    rangeStart = subDays(now, 30);
  } else {
    rangeStart = startOfMonth(now);
    rangeEnd = endOfMonth(now);
  }

  const couponStart = new Date(row.valid_from).getTime();
  const couponEnd = row.valid_until
    ? new Date(row.valid_until).getTime()
    : Number.MAX_SAFE_INTEGER;

  return couponStart <= rangeEnd.getTime() && couponEnd >= rangeStart.getTime();
}

export function discountTypeLabel(type: string): string {
  if (type === "percent") return "Percentual";
  if (type === "fixed") return "Valor fixo";
  if (type === "extended_trial") return "Trial estendido";
  if (type === "first_month_free") return "1º mês grátis";
  return type;
}

export function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function discountValueDisplay(type: string, value: number): string {
  if (type === "percent") return `${value}%`;
  if (type === "fixed") return formatBrl(value);
  if (type === "extended_trial") return `+${value} dia(s)`;
  if (type === "first_month_free") return "—";
  return String(value);
}

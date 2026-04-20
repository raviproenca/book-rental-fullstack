import { z } from "zod";
import {
  DISCOUNT_TYPES,
  DISCOUNT_CHARGE_SCOPES,
  parseEmailAllowlistRaw,
  normalizeCouponCode,
  deriveAppliesToBillingFromPlans,
  type DiscountCouponInput,
  type PlanOption,
} from "@/services/adminCoupons";

const discountTypeSchema = z.enum(DISCOUNT_TYPES);

const discountChargeScopeSchema = z.enum(DISCOUNT_CHARGE_SCOPES);

const initialStatusSchema = z.enum(["active", "paused"]);

const emailLineRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const couponCreateFormSchema = z
  .object({
    internalName: z.string().min(1, "Informe o nome interno"),
    code: z.string().min(1, "Informe o código"),
    influencerId: z.string(),

    discountType: discountTypeSchema,
    discountValue: z.coerce.number(),
    allPlans: z.boolean(),
    eligiblePlanIds: z.array(z.string()),

    discountChargeScope: discountChargeScopeSchema,
    recurringMonths: z.coerce.number().optional().nullable(),

    maxUsesEnabled: z.boolean(),
    maxUses: z.coerce.number().optional().nullable(),
    perUserLimitEnabled: z.boolean(),
    maxRedemptionsPerUser: z.coerce.number().optional().nullable(),

    validFrom: z.string().min(1),
    validUntil: z.string().optional().nullable(),

    emailRestrictEnabled: z.boolean(),
    emailAllowlistRaw: z.string(),

    minPurchaseEnabled: z.boolean(),
    minPurchaseAmount: z.coerce.number().optional().nullable(),

    firstPurchaseOnly: z.boolean(),

    initialStatus: initialStatusSchema,
  })
  .superRefine((data, ctx) => {
    const code = normalizeCouponCode(data.code);
    if (!code) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe o código", path: ["code"] });
    }

    const { discountType, discountValue } = data;
    if (discountType === "percent") {
      if (discountValue <= 0 || discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Percentual deve estar entre 1 e 100",
          path: ["discountValue"],
        });
      }
    } else if (discountType === "fixed") {
      if (discountValue <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valor fixo deve ser maior que zero",
          path: ["discountValue"],
        });
      }
    } else if (discountType === "extended_trial") {
      if (discountValue <= 0 || !Number.isInteger(discountValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe dias extras (número inteiro > 0)",
          path: ["discountValue"],
        });
      }
    } else if (discountType === "first_month_free") {
      if (discountValue < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valor inválido",
          path: ["discountValue"],
        });
      }
    }

    if (!data.allPlans && data.eligiblePlanIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione ao menos um plano ou marque todos",
        path: ["eligiblePlanIds"],
      });
    }

    if (data.discountChargeScope === "recurring") {
      const m = data.recurringMonths;
      if (m == null || !Number.isFinite(m) || m < 1 || !Number.isInteger(m)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe por quantos ciclos o desconto se repete",
          path: ["recurringMonths"],
        });
      }
    }

    if (data.maxUsesEnabled) {
      const u = data.maxUses;
      if (u == null || !Number.isFinite(u) || u < 1 || !Number.isInteger(u)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe um limite total válido (inteiro ≥ 1)",
          path: ["maxUses"],
        });
      }
    }

    if (data.perUserLimitEnabled) {
      const u = data.maxRedemptionsPerUser;
      if (u == null || !Number.isFinite(u) || u < 1 || !Number.isInteger(u)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe um limite por usuário (inteiro ≥ 1)",
          path: ["maxRedemptionsPerUser"],
        });
      }
    }

    if (data.emailRestrictEnabled) {
      const parsed = parseEmailAllowlistRaw(data.emailAllowlistRaw);
      if (parsed.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe ao menos um e-mail",
          path: ["emailAllowlistRaw"],
        });
      }
      for (const em of parsed) {
        if (!emailLineRegex.test(em)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `E-mail inválido: ${em}`,
            path: ["emailAllowlistRaw"],
          });
          break;
        }
      }
    }

    if (data.minPurchaseEnabled) {
      const v = data.minPurchaseAmount;
      if (v == null || !Number.isFinite(v) || v <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe um valor mínimo maior que zero",
          path: ["minPurchaseAmount"],
        });
      }
    }

    if (data.validUntil && data.validFrom) {
      const until = new Date(data.validUntil).getTime();
      const from = new Date(data.validFrom).getTime();
      if (until < from) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiração deve ser após o início da validade",
          path: ["validUntil"],
        });
      }
    }
  });

export type CouponCreateFormValues = z.infer<typeof couponCreateFormSchema>;

export const STEP_FIELD_NAMES = [
  ["internalName", "code", "influencerId"],
  [
    "discountType",
    "discountValue",
    "allPlans",
    "eligiblePlanIds",
    "discountChargeScope",
    "recurringMonths",
  ],
  [
    "maxUsesEnabled",
    "maxUses",
    "perUserLimitEnabled",
    "maxRedemptionsPerUser",
    "validFrom",
    "validUntil",
    "emailRestrictEnabled",
    "emailAllowlistRaw",
    "minPurchaseEnabled",
    "minPurchaseAmount",
    "firstPurchaseOnly",
  ],
  ["initialStatus"],
] as const satisfies readonly (readonly (keyof CouponCreateFormValues)[])[];

export function couponCreateDefaultValues(): CouponCreateFormValues {
  return {
    internalName: "",
    code: "",
    influencerId: "__none__",

    discountType: "percent",
    discountValue: 10,
    allPlans: true,
    eligiblePlanIds: [],

    discountChargeScope: "first_invoice",
    recurringMonths: null,

    maxUsesEnabled: false,
    maxUses: null,
    perUserLimitEnabled: false,
    maxRedemptionsPerUser: null,

    validFrom: new Date().toISOString(),
    validUntil: null,

    emailRestrictEnabled: false,
    emailAllowlistRaw: "",

    minPurchaseEnabled: false,
    minPurchaseAmount: null,

    firstPurchaseOnly: false,

    initialStatus: "active",
  };
}

export function couponFormValuesToInput(
  values: CouponCreateFormValues,
  planCatalog: PlanOption[],
): DiscountCouponInput {
  const eligiblePlanIds = values.allPlans ? null : values.eligiblePlanIds;
  const appliesToBilling = deriveAppliesToBillingFromPlans(eligiblePlanIds, planCatalog);

  return {
    code: normalizeCouponCode(values.code),
    description: values.internalName.trim() || null,
    discountType: values.discountType,
    discountValue:
      values.discountType === "first_month_free" ? 0 : Number(values.discountValue),
    maxUses: values.maxUsesEnabled ? values.maxUses ?? null : null,
    validFrom: values.validFrom,
    validUntil: values.validUntil?.trim() ? values.validUntil : null,
    firstPurchaseOnly: values.firstPurchaseOnly,
    maxRedemptionsPerUser: values.perUserLimitEnabled ? values.maxRedemptionsPerUser ?? null : null,
    appliesToBilling,
    planId: null,
    isActive: values.initialStatus === "active",
    influencerId: values.influencerId === "__none__" ? null : values.influencerId,
    eligiblePlanIds,
    discountChargeScope: values.discountChargeScope,
    recurringMonths:
      values.discountChargeScope === "recurring" ? values.recurringMonths ?? null : null,
    minPurchaseAmount: values.minPurchaseEnabled ? values.minPurchaseAmount ?? null : null,
    emailAllowlist: values.emailRestrictEnabled
      ? parseEmailAllowlistRaw(values.emailAllowlistRaw)
      : null,
  };
}

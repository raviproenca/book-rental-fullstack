import { MOCK_ADMIN_COUPONS_LIST } from "@/data/mockAdminCouponsList";

export const INFLUENCER_CHANNELS = [
  "YouTube",
  "Instagram",
  "TikTok",
  "Podcast",
  "Google Ads",
  "Meta Ads",
  "Indicação",
  "Outro",
] as const;

export type InfluencerChannel = (typeof INFLUENCER_CHANNELS)[number];

export type InfluencerPartnerType = "pf" | "agency" | "paid_campaign";

export type InfluencerCommissionModel = "none" | "fixed_per_conversion" | "recurring_percent";

export type InfluencerStatus = "ativo" | "pausado" | "pendente";

export type AdminInfluencerRow = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  channel: InfluencerChannel;
  linkedCouponId: string | null;
  linkedCouponCode: string | null;
  usersBrought: number;
  activeMrr: number;
  commissionModel: InfluencerCommissionModel;
  /** BRL per conversion when commissionModel is fixed_per_conversion */
  commissionFixedPerConversion?: number | null;
  /** 0–100 when commissionModel is recurring_percent */
  commissionRecurringPercent?: number | null;
  /** BRL — “Comissão acumulada” */
  commissionAccrued: number;
  partnerType: InfluencerPartnerType;
  internalNotes: string;
  status: InfluencerStatus;
};

/** Same default as cupons: mock unless `VITE_ADMIN_INFLUENCERS_LIST_MOCK` is the string `false`. */
export function influencersListUsesMocks(): boolean {
  return import.meta.env.VITE_ADMIN_INFLUENCERS_LIST_MOCK !== "false";
}

/** Set `VITE_ADMIN_INFLUENCERS_EMPTY=true` to start with no rows (empty-state QA). */
export function influencersForceEmptySeed(): boolean {
  return import.meta.env.VITE_ADMIN_INFLUENCERS_EMPTY === "true";
}

/** Minimal row when loading a real influencer from Supabase (`influencers` has only id + name). */
export function influencerBasicsToRow(basics: { id: string; name: string }): AdminInfluencerRow {
  return {
    id: basics.id,
    name: basics.name,
    channel: "Outro",
    linkedCouponId: null,
    linkedCouponCode: null,
    usersBrought: 0,
    activeMrr: 0,
    commissionModel: "none",
    commissionAccrued: 0,
    partnerType: "pf",
    internalNotes: "",
    status: "ativo",
  };
}

export function getInitialInfluencerRows(options?: { useMocks?: boolean }): AdminInfluencerRow[] {
  const useMocks = options?.useMocks ?? influencersListUsesMocks();
  if (!useMocks) return [];
  if (influencersForceEmptySeed()) return [];
  return MOCK_ADMIN_INFLUENCERS;
}

function codeForCouponId(id: string): string {
  const row = MOCK_ADMIN_COUPONS_LIST.find((c) => c.id === id);
  return row?.code ?? id;
}

/** Six varied partners — IDs align with `MOCK_ADMIN_COUPONS_LIST` where linked. */
export const MOCK_ADMIN_INFLUENCERS: AdminInfluencerRow[] = [
  {
    id: "inf-mock-001",
    name: "Dra. Marina Alves",
    channel: "YouTube",
    linkedCouponId: "mock-001",
    linkedCouponCode: codeForCouponId("mock-001"),
    usersBrought: 184,
    activeMrr: 12_450.0,
    commissionModel: "recurring_percent",
    commissionRecurringPercent: 12,
    commissionAccrued: 8_920.5,
    partnerType: "pf",
    internalNotes: "Contrato verbal renovado em mar/26. Priorizar vídeos longos.",
    status: "ativo",
  },
  {
    id: "inf-mock-002",
    name: "Agência Pulse Med",
    channel: "Instagram",
    linkedCouponId: "mock-006",
    linkedCouponCode: codeForCouponId("mock-006"),
    usersBrought: 96,
    activeMrr: 6_200.0,
    commissionModel: "fixed_per_conversion",
    commissionFixedPerConversion: 45,
    commissionAccrued: 4_320.0,
    partnerType: "agency",
    internalNotes: "Faturamento mensal consolidado; contato: financeiro@pulse.med",
    status: "ativo",
  },
  {
    id: "inf-mock-003",
    name: "Podcast Residência em Foco",
    channel: "Podcast",
    linkedCouponId: "mock-005",
    linkedCouponCode: codeForCouponId("mock-005"),
    usersBrought: 41,
    activeMrr: 2_890.0,
    commissionModel: "none",
    commissionAccrued: 0,
    partnerType: "paid_campaign",
    internalNotes: "Campanha institucional FMUSP — sem comissão, só cupom de tracking.",
    status: "pausado",
  },
  {
    id: "inf-mock-004",
    name: "@revisao.rápida",
    channel: "TikTok",
    linkedCouponId: "mock-009",
    linkedCouponCode: codeForCouponId("mock-009"),
    usersBrought: 312,
    activeMrr: 3_100.0,
    commissionModel: "recurring_percent",
    commissionRecurringPercent: 8,
    commissionAccrued: 2_015.75,
    partnerType: "pf",
    internalNotes: "Conteúdo viral esporádico; revisar taxa após Q2.",
    status: "ativo",
  },
  {
    id: "inf-mock-005",
    name: "Campanha Meta — Brand",
    channel: "Meta Ads",
    linkedCouponId: "mock-003",
    linkedCouponCode: codeForCouponId("mock-003"),
    usersBrought: 28,
    activeMrr: 1_480.0,
    commissionModel: "fixed_per_conversion",
    commissionFixedPerConversion: 60,
    commissionAccrued: 1_680.0,
    partnerType: "paid_campaign",
    internalNotes: "UTM padronizado; não misturar com tráfego orgânico.",
    status: "pendente",
  },
  {
    id: "inf-mock-006",
    name: "Indicação — Dr. Henrique Costa",
    channel: "Indicação",
    linkedCouponId: "mock-008",
    linkedCouponCode: codeForCouponId("mock-008"),
    usersBrought: 7,
    activeMrr: 890.0,
    commissionModel: "recurring_percent",
    commissionRecurringPercent: 15,
    commissionAccrued: 420.0,
    partnerType: "pf",
    internalNotes: "Aluno antigo; comissão só sobre assinaturas ativas > 2 meses.",
    status: "ativo",
  },
];

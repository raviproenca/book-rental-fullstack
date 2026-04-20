import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Deterministic 0..n-1 from string (FNV-1a-ish nibble mix). */
function seedFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type MockCouponKpis = {
  totalResgates: number;
  conversoesPagas: number;
  receitaGerada: number;
  churnRatePct: number;
  mrrAtivo: number;
};

export type MockCouponChartPoint = {
  mes: string;
  resgates: number;
};

export type MockCouponUserRow = {
  id: string;
  nome: string;
  email: string;
  plano: string;
  dataCadastro: string;
  status: "Ativo" | "Cancelado" | "Trial";
  valorPagoTotal: number;
};

export type MockCouponDetail = {
  displayCode: string;
  kpis: MockCouponKpis;
  redemptionsByMonth: MockCouponChartPoint[];
  users: MockCouponUserRow[];
};

const MOCK_NAMES = [
  ["Ana Costa", "ana.costa@email.com"],
  ["Bruno Silva", "bruno.silva@email.com"],
  ["Carla Mendes", "carla.m@email.com"],
  ["Diego Oliveira", "d.oliveira@email.com"],
  ["Elena Prado", "elena.prado@email.com"],
  ["Felipe Ramos", "f.ramos@email.com"],
] as const;

const MOCK_PLANS = ["Pro Mensal", "Pro Anual", "Premium Mensal", "Premium Anual"] as const;

export function getMockCouponDetail(couponId: string): MockCouponDetail {
  const s = seedFromId(couponId);
  const pick = (mod: number) => s % mod;
  const scale = 1 + (pick(5) / 10);

  const displayCode = `MQ${(s % 9000) + 1000}`;

  const kpis: MockCouponKpis = {
    totalResgates: Math.round(120 * scale + pick(40)),
    conversoesPagas: Math.round(78 * scale + pick(25)),
    receitaGerada: Math.round(42890 * scale + pick(5000)),
    churnRatePct: Number((4.2 + (pick(100) / 50)).toFixed(1)),
    mrrAtivo: Math.round(15200 * scale + pick(2000)),
  };

  const now = new Date();
  const redemptionsByMonth: MockCouponChartPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const base = 15 + pick(20) + i * 3;
    redemptionsByMonth.push({
      mes: format(d, "MMM yyyy", { locale: ptBR }),
      resgates: Math.max(5, Math.round(base + pick(15) * (i + 1))),
    });
  }

  const users: MockCouponUserRow[] = MOCK_NAMES.map(([nome, email], idx) => {
    const st: MockCouponUserRow["status"] =
      idx % 5 === 0 ? "Cancelado" : idx % 4 === 0 ? "Trial" : "Ativo";
    return {
      id: `mock-u-${couponId.slice(0, 8)}-${idx}`,
      nome,
      email,
      plano: MOCK_PLANS[(pick(97) + idx) % MOCK_PLANS.length],
      dataCadastro: format(subMonths(now, 2 + (idx % 4)), "dd/MM/yyyy", { locale: ptBR }),
      status: st,
      valorPagoTotal: st === "Trial" ? 0 : Math.round(297 * scale + idx * 47 + pick(200)),
    };
  });

  return { displayCode, kpis, redemptionsByMonth, users };
}

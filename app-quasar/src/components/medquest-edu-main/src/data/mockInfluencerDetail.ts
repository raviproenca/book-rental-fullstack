import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AdminInfluencerRow } from "@/data/mockAdminInfluencers";
import { MOCK_ADMIN_COUPONS_LIST } from "@/data/mockAdminCouponsList";

function seedFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type InfluencerDetailKpis = {
  usuariosTrazidos: number;
  pagantes: number;
  taxaConversaoPct: number;
  mrrAtivo: number;
  arrProjetado: number;
  receitaTotal: number;
  churnRatePct: number;
  comissaoAPagar: number;
};

export type InfluencerNewUsersMonth = {
  mes: string;
  novosUsuarios: number;
};

export type InfluencerMrrMonth = {
  mes: string;
  mrrAcumulado: number;
};

export type InfluencerPlanSlice = {
  plano: string;
  value: number;
};

export type InfluencerPartnerUserStatus = "Ativo" | "Trial" | "Cancelado";

export type InfluencerPartnerUserRow = {
  id: string;
  nome: string;
  email: string;
  plano: string;
  dataCadastro: string;
  status: InfluencerPartnerUserStatus;
  ltv: number;
  ultimoAcesso: string;
};

export type UserHistoryEvent = {
  data: string;
  titulo: string;
  detalhe: string;
};

export type InfluencerLinkedCoupon = {
  id: string;
  code: string;
};

export type MockInfluencerDetail = {
  kpis: InfluencerDetailKpis;
  novosUsuariosPorMes: InfluencerNewUsersMonth[];
  mrrAcumuladoPorMes: InfluencerMrrMonth[];
  distribuicaoPlanos: InfluencerPlanSlice[];
  usuarios: InfluencerPartnerUserRow[];
  historicoPorUsuarioId: Record<string, UserHistoryEvent[]>;
  cuponsExtras: InfluencerLinkedCoupon[];
};

const MOCK_NAMES = [
  ["Ana Costa", "ana.costa@email.com"],
  ["Bruno Silva", "bruno.silva@email.com"],
  ["Carla Mendes", "carla.m@email.com"],
  ["Diego Oliveira", "d.oliveira@email.com"],
  ["Elena Prado", "elena.prado@email.com"],
  ["Felipe Ramos", "f.ramos@email.com"],
  ["Gabriela Nunes", "g.nunes@email.com"],
  ["Henrique Dias", "h.dias@email.com"],
] as const;

const MOCK_PLANS = ["Pro Mensal", "Pro Anual", "Premium Mensal", "Premium Anual"] as const;

function pickSecondaryCouponId(primaryId: string | null, s: number): InfluencerLinkedCoupon | null {
  const list = MOCK_ADMIN_COUPONS_LIST;
  if (list.length < 2) return null;
  let idx = s % list.length;
  if (primaryId && list[idx]?.id === primaryId) idx = (idx + 1) % list.length;
  const row = list[idx];
  return row ? { id: row.id, code: row.code } : null;
}

export function getMockInfluencerDetail(
  id: string,
  summary?: Partial<AdminInfluencerRow> | null,
): MockInfluencerDetail {
  const s = seedFromId(id);
  const pick = (mod: number) => s % mod;
  const scale = 1 + pick(5) / 10;

  const now = new Date();

  let usuariosTrazidos = Math.round(80 * scale + pick(60));
  let pagantes = Math.round(52 * scale + pick(35));
  let mrrAtivo = Math.round(9800 * scale + pick(1800));
  const receitaTotal = Math.round(112_000 * scale + pick(12_000));
  const churnRatePct = Number((3.5 + pick(80) / 40).toFixed(1));
  let comissaoAPagar = Math.round(4200 * scale + pick(900));

  if (summary?.usersBrought != null) {
    usuariosTrazidos = summary.usersBrought;
    const ratio = 0.42 + (pick(17) / 100);
    pagantes = Math.max(0, Math.min(usuariosTrazidos, Math.round(usuariosTrazidos * ratio)));
  }
  if (summary?.activeMrr != null) {
    mrrAtivo = Math.round(summary.activeMrr);
  }
  if (summary?.commissionAccrued != null) {
    comissaoAPagar = Math.round(summary.commissionAccrued);
  }

  const taxaConversaoPct =
    usuariosTrazidos > 0
      ? Number(((pagantes / usuariosTrazidos) * 100).toFixed(1))
      : 0;

  const arrProjetado = Math.round(mrrAtivo * 12);

  const novosUsuariosPorMes: InfluencerNewUsersMonth[] = [];
  const rawMonths: number[] = [];
  let sumMonths = 0;
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const base = 8 + pick(12) + (5 - i) * 2;
    const n = Math.max(2, Math.round(base + pick(8) * (i + 1)));
    rawMonths.push(n);
    sumMonths += n;
    novosUsuariosPorMes.push({
      mes: format(d, "MMM yyyy", { locale: ptBR }),
      novosUsuarios: n,
    });
  }
  if (summary?.usersBrought != null && sumMonths > 0 && usuariosTrazidos > 0) {
    const f = usuariosTrazidos / sumMonths;
    let acc = 0;
    for (let i = 0; i < novosUsuariosPorMes.length; i++) {
      const v = i === novosUsuariosPorMes.length - 1
        ? Math.max(0, usuariosTrazidos - acc)
        : Math.max(0, Math.round(rawMonths[i]! * f));
      acc += v;
      novosUsuariosPorMes[i] = { ...novosUsuariosPorMes[i]!, novosUsuarios: v };
    }
  }

  const nM = novosUsuariosPorMes.length;
  const mrrAcumuladoPorMes: InfluencerMrrMonth[] = [];
  if (mrrAtivo <= 0) {
    for (let i = 0; i < nM; i++) {
      mrrAcumuladoPorMes.push({ mes: novosUsuariosPorMes[i]!.mes, mrrAcumulado: 0 });
    }
  } else {
    let prev = 0;
    for (let i = 0; i < nM; i++) {
      const row = novosUsuariosPorMes[i]!;
      const isLast = i === nM - 1;
      let v = isLast
        ? mrrAtivo
        : Math.round((mrrAtivo * (i + 1)) / nM + pick(3 + i) * (mrrAtivo * 0.03));
      v = Math.min(mrrAtivo - (isLast ? 0 : 1), Math.max(prev + 1, v));
      prev = v;
      mrrAcumuladoPorMes.push({ mes: row.mes, mrrAcumulado: v });
    }
    if (mrrAcumuladoPorMes.length > 0) {
      mrrAcumuladoPorMes[mrrAcumuladoPorMes.length - 1] = {
        ...mrrAcumuladoPorMes[mrrAcumuladoPorMes.length - 1]!,
        mrrAcumulado: mrrAtivo,
      };
    }
  }

  const planWeights = [
    30 + pick(15),
    22 + pick(12),
    18 + pick(10),
    12 + pick(8),
  ];
  const planSum = planWeights.reduce((a, b) => a + b, 0);
  const distribuicaoPlanos: InfluencerPlanSlice[] = MOCK_PLANS.map((plano, idx) => ({
    plano,
    value: Math.max(1, Math.round((planWeights[idx]! / planSum) * pagantes)),
  }));

  const usuarios: InfluencerPartnerUserRow[] = MOCK_NAMES.map(([nome, email], idx) => {
    const st: InfluencerPartnerUserStatus =
      idx % 6 === 0 ? "Cancelado" : idx % 5 === 0 ? "Trial" : "Ativo";
    const ltv =
      st === "Trial" ? pick(90) : Math.round(890 * scale + idx * 120 + pick(400));
    return {
      id: `inf-u-${id.slice(0, 8)}-${idx}`,
      nome,
      email,
      plano: MOCK_PLANS[(pick(97) + idx) % MOCK_PLANS.length],
      dataCadastro: format(subMonths(now, 1 + (idx % 5)), "dd/MM/yyyy", { locale: ptBR }),
      status: st,
      ltv,
      ultimoAcesso: format(subMonths(now, -(idx % 3)), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    };
  });

  const historicoPorUsuarioId: Record<string, UserHistoryEvent[]> = {};
  const eventTemplates: UserHistoryEvent[] = [
    { data: "", titulo: "Cadastro", detalhe: "Conta criada via cupom do parceiro." },
    { data: "", titulo: "Assinatura", detalhe: "Plano ativado — primeira cobrança confirmada." },
    { data: "", titulo: "Renovação", detalhe: "Ciclo de assinatura renovado." },
    { data: "", titulo: "Login", detalhe: "Última sessão na plataforma." },
    { data: "", titulo: "Suporte", detalhe: "Ticket de dúvida sobre faturamento." },
  ];
  for (const u of usuarios) {
    const n = 3 + (pick(3 + u.id.length) % 3);
    const events: UserHistoryEvent[] = [];
    for (let i = 0; i < n; i++) {
      const tpl = eventTemplates[(pick(11) + i + u.id.charCodeAt(0)) % eventTemplates.length]!;
      const d = subMonths(now, i + pick(4));
      events.push({
        ...tpl,
        data: format(d, "dd/MM/yyyy", { locale: ptBR }),
      });
    }
    historicoPorUsuarioId[u.id] = events;
  }

  const primaryId = summary?.linkedCouponId ?? null;
  const cuponsExtras = (() => {
    const extra = pickSecondaryCouponId(primaryId, s);
    return extra && extra.id !== primaryId ? [extra] : [];
  })();

  return {
    kpis: {
      usuariosTrazidos,
      pagantes,
      taxaConversaoPct,
      mrrAtivo,
      arrProjetado,
      receitaTotal,
      churnRatePct,
      comissaoAPagar,
    },
    novosUsuariosPorMes,
    mrrAcumuladoPorMes,
    distribuicaoPlanos,
    usuarios,
    historicoPorUsuarioId,
    cuponsExtras,
  };
}

export function exportPartnerUsersCsv(rows: InfluencerPartnerUserRow[], filename: string): void {
  const headers = [
    "Nome",
    "Email",
    "Plano",
    "Data cadastro",
    "Status",
    "LTV",
    "Ultimo acesso",
  ];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        escape(r.nome),
        escape(r.email),
        escape(r.plano),
        escape(r.dataCadastro),
        escape(r.status),
        String(r.ltv),
        escape(r.ultimoAcesso),
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

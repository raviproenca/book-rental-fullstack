import { useMemo, useState, type ComponentType } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Link2,
  Loader2,
  Percent,
  Search,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AdminInfluencerRow } from "@/data/mockAdminInfluencers";
import {
  influencerBasicsToRow,
  MOCK_ADMIN_INFLUENCERS,
} from "@/data/mockAdminInfluencers";
import {
  exportPartnerUsersCsv,
  getMockInfluencerDetail,
  type InfluencerPartnerUserRow,
  type InfluencerPartnerUserStatus,
} from "@/data/mockInfluencerDetail";
import { formatBrl } from "@/pages/admin/couponsListUtils";
import { useAdminMocks } from "@/contexts/AdminMocksContext";
import { useInfluencerBasics } from "@/hooks/useAdminCoupons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ALL = "__all__";

const PIE_COLORS = [
  "hsl(43 96% 56%)",
  "hsl(199 89% 48%)",
  "hsl(142 71% 42%)",
  "hsl(280 55% 58%)",
];

/** Integer slice labels that always sum to 100% (avoids independent rounding to 101%). */
function integerPercentsFromCounts(counts: number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total <= 0) return counts.map(() => 0);
  const exact = counts.map((c) => (c / total) * 100);
  const floors = exact.map((e) => Math.floor(e));
  const remainder = 100 - floors.reduce((a, b) => a + b, 0);
  const fracs = exact.map((e, i) => ({ i, f: e - Math.floor(e) }));
  fracs.sort((a, b) => b.f - a.f);
  const result = [...floors];
  for (let k = 0; k < remainder; k++) {
    const idx = fracs[k]?.i;
    if (idx !== undefined) result[idx] += 1;
  }
  return result;
}

type PiePlanDatum = {
  plano: string;
  value: number;
  labelPct: number;
};

function PiePlanTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: PiePlanDatum;
  }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const plano = item.payload?.plano ?? item.name ?? "Plano";
  const n = Number(item.value ?? item.payload?.value ?? 0);
  return (
    <div className="pointer-events-none z-50 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="text-xs font-medium leading-tight text-foreground">{plano}</p>
      <p className="mt-1 font-mono-stats text-sm font-semibold tabular-nums leading-tight text-foreground">
        {n.toLocaleString("pt-BR")} usuários
      </p>
    </div>
  );
}

function NewUsersBarTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number }>;
}) {
  if (!active || !payload?.length) return null;
  const n = Number(payload[0].value ?? 0);
  return (
    <div className="pointer-events-none z-50 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="text-xs leading-tight text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-xs font-medium text-muted-foreground">Novos usuários</p>
      <p className="mt-0.5 font-mono-stats text-sm font-semibold tabular-nums leading-tight text-foreground">
        {n.toLocaleString("pt-BR")}
      </p>
    </div>
  );
}

const userStatusBadge: Record<InfluencerPartnerUserStatus, string> = {
  Ativo:
    "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  Trial: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
  Cancelado:
    "border-destructive/40 bg-destructive/15 text-destructive dark:text-red-300",
};

function brl(value: number) {
  return formatBrl(value);
}

function KpiCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-muted">
          <Icon className="h-4 w-4 text-gold" />
        </div>
      </div>
      <p className="mt-3 font-mono-stats text-lg font-bold text-foreground md:text-xl">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 md:p-5", className)}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="mt-4 h-[260px] w-full min-w-0">{children}</div>
    </div>
  );
}

export default function InfluencerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { adminMocksEnabled } = useAdminMocks();
  const navState = location.state as { influencer?: AdminInfluencerRow } | null;
  const fromList = navState?.influencer;
  const summaryFromNav = fromList && id && fromList.id === id ? fromList : null;

  const { data: basics, isPending: basicsPending, isFetched: basicsFetched } = useInfluencerBasics(id, {
    enabled: Boolean(id) && !adminMocksEnabled && !summaryFromNav,
  });

  const summary = useMemo((): AdminInfluencerRow | null => {
    if (!id) return null;
    if (summaryFromNav) return summaryFromNav;
    if (adminMocksEnabled) return MOCK_ADMIN_INFLUENCERS.find((r) => r.id === id) ?? null;
    if (basics) return influencerBasicsToRow(basics);
    return null;
  }, [id, summaryFromNav, adminMocksEnabled, basics]);

  const detail = useMemo(
    () => (id && adminMocksEnabled ? getMockInfluencerDetail(id, summary) : null),
    [id, adminMocksEnabled, summary],
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [planFilter, setPlanFilter] = useState<string>(ALL);
  const [sheetUser, setSheetUser] = useState<InfluencerPartnerUserRow | null>(null);

  const planOptions = useMemo(() => {
    if (!detail) return [];
    const set = new Set(detail.usuarios.map((u) => u.plano));
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [detail]);

  const filteredUsers = useMemo(() => {
    if (!detail) return [];
    const q = search.trim().toLowerCase();
    return detail.usuarios.filter((u) => {
      if (statusFilter !== ALL && u.status !== statusFilter) return false;
      if (planFilter !== ALL && u.plano !== planFilter) return false;
      if (!q) return true;
      return (
        u.nome.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [detail, search, statusFilter, planFilter]);

  const linkedCoupons = useMemo(() => {
    if (!detail) return [];
    const list: { id: string; code: string }[] = [];
    if (summary?.linkedCouponId && summary.linkedCouponCode) {
      list.push({ id: summary.linkedCouponId, code: summary.linkedCouponCode });
    }
    for (const extra of detail.cuponsExtras) {
      if (!list.some((c) => c.id === extra.id)) list.push(extra);
    }
    return list;
  }, [summary, detail]);

  const piePlanData: PiePlanDatum[] = useMemo(() => {
    if (!detail) return [];
    const rows = detail.distribuicaoPlanos;
    const labelPcts = integerPercentsFromCounts(rows.map((r) => r.value));
    return rows.map((r, i) => ({
      plano: r.plano,
      value: r.value,
      labelPct: labelPcts[i] ?? 0,
    }));
  }, [detail]);

  if (!id) {
    return <Navigate to="/admin/influenciadores" replace />;
  }

  if (!adminMocksEnabled) {
    if (!summaryFromNav) {
      if (basicsPending) {
        return (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        );
      }
      if (basicsFetched && !basics) {
        return <Navigate to="/admin/influenciadores" replace />;
      }
    }
    if (!summary) {
      return <Navigate to="/admin/influenciadores" replace />;
    }

    const displayNameReal = summary.name;
    const utmCampaignReal = summary.linkedCouponCode?.trim() || id.slice(0, 8) || "PARCEIRO";
    const utmUrlReal = `${window.location.origin}/signup?utm_source=partner&utm_medium=influencer&utm_campaign=${encodeURIComponent(utmCampaignReal)}&utm_content=${encodeURIComponent(id)}`;

    async function handleCopyUtmReal() {
      try {
        await navigator.clipboard.writeText(utmUrlReal);
        toast.success("Link copiado para a área de transferência.");
      } catch {
        toast.error("Não foi possível copiar o link.");
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <Link
              to="/admin/influenciadores"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos influenciadores
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{displayNameReal}</h1>
            <p className="text-sm text-muted-foreground">
              ID <span className="font-mono-stats text-xs">{id}</span> — dados reais; métricas agregadas em
              breve.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm font-medium text-foreground">Métricas e usuários do parceiro</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Em breve: gráficos, KPIs e lista de usuários atribuídos a este influenciador.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="text-sm font-semibold text-foreground">Rastreamento</h2>
          <p className="text-xs text-muted-foreground">Link com UTM para atribuição no cadastro.</p>
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Link UTM (cadastro)</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-mono text-xs text-foreground">{utmUrlReal}</span>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => void handleCopyUtmReal()}
              >
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return <Navigate to="/admin/influenciadores" replace />;
  }

  const displayName =
    summary?.name ?? (id.length >= 8 ? `Parceiro ${id.slice(0, 8)}…` : `Parceiro ${id}`);

  const utmCampaign = summary?.linkedCouponCode?.trim() || "PARCEIRO";
  const utmUrl = `${window.location.origin}/signup?utm_source=partner&utm_medium=influencer&utm_campaign=${encodeURIComponent(utmCampaign)}&utm_content=${encodeURIComponent(id)}`;

  async function handleCopyUtm() {
    try {
      await navigator.clipboard.writeText(utmUrl);
      toast.success("Link copiado para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  function handleExportCsv() {
    const safe = displayName.replace(/[^\w-]+/g, "-").slice(0, 40);
    exportPartnerUsersCsv(filteredUsers, `influenciador-${safe}-usuarios.csv`);
    toast.success("CSV exportado.");
  }

  const { kpis } = detail;
  const history = sheetUser ? (detail.historicoPorUsuarioId[sheetUser.id] ?? []) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/admin/influenciadores"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos influenciadores
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
          <p className="text-sm text-muted-foreground">
            {summary?.channel ? (
              <>
                Canal: <span className="text-foreground">{summary.channel}</span>
                {summary.linkedCouponCode ? (
                  <>
                    {" "}
                    · Cupom:{" "}
                    <span className="font-mono-stats text-foreground">{summary.linkedCouponCode}</span>
                  </>
                ) : null}
              </>
            ) : (
              <>
                ID <span className="font-mono-stats text-xs">{id}</span> — métricas simuladas.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard
          label="Usuários trazidos"
          value={kpis.usuariosTrazidos.toLocaleString("pt-BR")}
          icon={Users}
        />
        <KpiCard
          label="Pagantes"
          value={kpis.pagantes.toLocaleString("pt-BR")}
          icon={UserCheck}
        />
        <KpiCard
          label="Taxa conversão"
          value={`${kpis.taxaConversaoPct.toLocaleString("pt-BR")}%`}
          icon={Percent}
        />
        <KpiCard label="MRR ativo" value={brl(kpis.mrrAtivo)} icon={Wallet} />
        <KpiCard label="ARR projetado" value={brl(kpis.arrProjetado)} icon={TrendingUp} />
        <KpiCard label="Receita total" value={brl(kpis.receitaTotal)} icon={DollarSign} />
        <KpiCard
          label="Churn rate"
          value={`${kpis.churnRatePct.toLocaleString("pt-BR")}%`}
          icon={CreditCard}
        />
        <KpiCard label="Comissão a pagar" value={brl(kpis.comissaoAPagar)} icon={DollarSign} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          className="lg:col-span-2"
          title="Novos usuários por mês"
          description="Últimos 6 meses (dados de demonstração)."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={detail.novosUsuariosPorMes}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              barCategoryGap="25%"
              maxBarSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} className="text-muted-foreground" />
              <Tooltip
                content={<NewUsersBarTooltip />}
                cursor={false}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ outline: "none", zIndex: 50 }}
              />
              <Bar
                dataKey="novosUsuarios"
                name="Novos usuários"
                fill="hsl(var(--gold))"
                radius={[6, 6, 0, 0]}
                fillOpacity={0.92}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="MRR acumulado" description="Evolução no mesmo período (mock).">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={detail.mrrAcumuladoPorMes} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickFormatter={(v) =>
                  typeof v === "number"
                    ? v.toLocaleString("pt-BR", { notation: "compact", compactDisplay: "short" })
                    : String(v)
                }
              />
              <Tooltip
                formatter={(value: number) => [brl(value), "MRR acum."]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
              />
              <Line
                type="monotone"
                dataKey="mrrAcumulado"
                name="MRR acumulado"
                stroke="hsl(var(--gold))"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(var(--gold))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição por plano" description="Usuários pagantes por plano (mock).">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Pie
                data={piePlanData}
                dataKey="value"
                nameKey="plano"
                cx="50%"
                cy="50%"
                outerRadius={88}
                paddingAngle={1}
                labelLine={{
                  stroke: "hsl(var(--muted-foreground) / 0.55)",
                  strokeWidth: 1.5,
                }}
                label={({ labelPct }) => `${labelPct ?? 0}%`}
              >
                {piePlanData.map((_, i) => (
                  <Cell key={piePlanData[i]!.plano} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={<PiePlanTooltip />}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ outline: "none", zIndex: 50 }}
                cursor={false}
              />
              <Legend
                wrapperStyle={{
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <h2 className="text-sm font-semibold text-foreground">Rastreamento</h2>
        <p className="text-xs text-muted-foreground">Cupons e link com UTM para atribuição.</p>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Cupons vinculados</p>
            {linkedCoupons.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cupom vinculado.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {linkedCoupons.map((c) => (
                  <li key={c.id}>
                    <Button variant="outline" size="sm" asChild className="font-mono-stats">
                      <Link to={`/admin/cupons/${c.id}`} state={{ code: c.code, isActive: true }}>
                        {c.code}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Link UTM (cadastro)</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-mono text-xs text-foreground">{utmUrl}</span>
              </div>
              <Button type="button" variant="secondary" size="sm" className="shrink-0 gap-2" onClick={() => void handleCopyUtm()}>
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Usuários deste parceiro</h2>
            <p className="text-xs text-muted-foreground">Lista simulada — clique na linha para ver o histórico.</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-2 self-start" onClick={handleExportCsv}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:flex-wrap md:items-center">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nome ou email…"
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os status</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Trial">Trial</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os planos</SelectItem>
              {planOptions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Data cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">LTV</TableHead>
                <TableHead>Último acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    Nenhum usuário com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow
                    key={u.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSheetUser(u)}
                  >
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-sm">{u.plano}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {u.dataCadastro}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[11px] font-medium", userStatusBadge[u.status])}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono-stats text-sm">{brl(u.ltv)}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {u.ultimoAcesso}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={sheetUser != null} onOpenChange={(open) => !open && setSheetUser(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {sheetUser && (
            <>
              <SheetHeader>
                <SheetTitle className="pr-8 text-left">{sheetUser.nome}</SheetTitle>
                <p className="text-left text-sm text-muted-foreground">{sheetUser.email}</p>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <p className="text-xs font-semibold text-foreground">Histórico</p>
                <ul className="space-y-3 border-l-2 border-border pl-4">
                  {history.map((ev, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-gold" />
                      <p className="text-xs text-muted-foreground">{ev.data}</p>
                      <p className="text-sm font-medium text-foreground">{ev.titulo}</p>
                      <p className="text-xs text-muted-foreground">{ev.detalhe}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AdminSubStatus } from "@/types";
import {
  useSubKpis,
  useMrrEvolution,
  useSubFlow,
  useSubscriptions,
} from "@/hooks/useAdminSubscriptions";
import { SubNav } from "@/components/admin/SubNav";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

const statusConfig: Record<AdminSubStatus, { label: string; className: string }> = {
  ativa: { label: "Ativa", className: "bg-success/15 text-success border-success/20" },
  cancelada: { label: "Cancelada", className: "bg-destructive/15 text-destructive border-destructive/20" },
  atrasada: { label: "Atrasada", className: "bg-warning/15 text-warning border-warning/20" },
};

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ─── Chart Tooltips ─── */

function MrrTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold text-foreground">
        {brl(payload[0].value ?? 0)}
      </p>
    </div>
  );
}

function FlowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-xs text-muted-foreground">{p.name}:</span>
          <span className="font-mono text-xs font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Skeleton ─── */

function PanelSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-80 rounded-xl border border-border bg-card" />
        <div className="h-80 rounded-xl border border-border bg-card" />
      </div>
      <div className="h-96 rounded-xl border border-border bg-card" />
    </div>
  );
}

/* ─── Main Component ─── */

export default function SubscriptionsPanel() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [periodFilter, setPeriodFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      status: (statusFilter || undefined) as AdminSubStatus | undefined,
      period: periodFilter || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [statusFilter, periodFilter, page],
  );

  const { data: kpis, isLoading: kpisLoading } = useSubKpis();
  const { data: mrrData, isLoading: mrrLoading } = useMrrEvolution();
  const { data: flowData, isLoading: flowLoading } = useSubFlow();
  const { data: subsData, isLoading: subsLoading } = useSubscriptions(filters);

  if (kpisLoading || mrrLoading || flowLoading) return <PanelSkeleton />;

  const subscriptions = subsData?.data ?? [];
  const total = subsData?.total ?? 0;
  const totalPages = subsData?.totalPages ?? 1;
  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  const kpiCards = kpis
    ? [
        {
          label: "MRR",
          value: brl(kpis.mrr),
          change: kpis.mrrChange,
          icon: DollarSign,
        },
        {
          label: "Total Assinantes",
          value: kpis.totalAssinantes.toLocaleString("pt-BR"),
          change: kpis.assinantesChange,
          icon: Users,
        },
        {
          label: "Churn Rate",
          value: `${kpis.churnRate.toFixed(1)}%`,
          change: kpis.churnChange,
          invertTrend: true,
        },
        {
          label: "ARPU",
          value: brl(kpis.arpu),
          change: kpis.arpuChange,
          icon: Wallet,
        },
        {
          label: "LTV Estimado",
          value: brl(kpis.ltv),
          change: kpis.ltvChange,
          icon: BarChart3,
        },
      ]
    : [];

  function handleFilterChange(setter: (v: string) => void) {
    return (value: string) => {
      setter(value === "__all__" ? "" : value);
      setPage(1);
    };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
          <p className="text-sm text-muted-foreground">
            Receita e gestão de assinantes MEDQUEST Pro
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => toast.success("Relatório exportado com sucesso")}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <SubNav />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {kpiCards.map((kpi) => {
          const isPositive = kpi.invertTrend
            ? kpi.change < 0
            : kpi.change > 0;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-border bg-card p-4 md:p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground md:text-sm">
                  {kpi.label}
                </span>
                {kpi.icon && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-muted">
                    <kpi.icon className="h-4 w-4 text-gold" />
                  </div>
                )}
                {!kpi.icon && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-muted">
                    <TrendingDown className="h-4 w-4 text-gold" />
                  </div>
                )}
              </div>
              <div className="mt-3">
                <span className="font-mono text-xl font-bold text-foreground md:text-2xl">
                  {kpi.value}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                )}
                <span
                  className={cn(
                    "font-mono text-xs font-medium",
                    isPositive ? "text-success" : "text-destructive",
                  )}
                >
                  {kpi.change > 0 ? "+" : ""}
                  {kpi.change.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs mês anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* MRR Evolution */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Evolução do MRR
            </h2>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </div>
          <div className="h-[240px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrData}>
                <defs>
                  <linearGradient id="mrrGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(41, 52%, 51%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(41, 52%, 51%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(240, 4%, 16%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <ReTooltip content={<MrrTooltip />} />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="hsl(41, 52%, 51%)"
                  strokeWidth={2}
                  fill="url(#mrrGold)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Novos vs Cancelamentos */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Novos vs Cancelamentos
            </h2>
            <p className="text-xs text-muted-foreground">Por mês (últimos 6 meses)</p>
          </div>
          <div className="h-[240px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(240, 4%, 16%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReTooltip content={<FlowTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Bar
                  dataKey="novos"
                  name="Novos"
                  stackId="a"
                  fill="hsl(41, 52%, 51%)"
                  radius={[0, 0, 0, 0]}
                  fillOpacity={0.85}
                />
                <Bar
                  dataKey="cancelamentos"
                  name="Cancelamentos"
                  stackId="a"
                  fill="hsl(0, 84%, 60%)"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.7}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 className="text-sm font-semibold text-foreground sm:mr-2">
          Assinaturas Recentes
        </h2>

        <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            <SelectItem value="ativa">Ativa</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="atrasada">Atrasada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={periodFilter} onValueChange={handleFilterChange(setPeriodFilter)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todo período</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-xl border border-border bg-card">
        {subsLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma assinatura encontrada com os filtros aplicados.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]" />
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden md:table-cell">Plano</TableHead>
                <TableHead className="hidden sm:table-cell w-[120px]">Valor pago</TableHead>
                <TableHead className="hidden lg:table-cell w-[110px]">Início</TableHead>
                <TableHead className="hidden lg:table-cell w-[130px]">Próx. Cobrança</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id} className="transition-colors hover:bg-secondary/40">
                  <TableCell>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-muted text-[11px] font-semibold text-gold">
                      {sub.avatar}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{sub.usuario}</p>
                      <p className="text-xs text-muted-foreground">{sub.email}</p>
                    </div>
                  </TableCell>

                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    <Badge variant="outline" className="bg-gold-muted text-gold border-gold/20 text-[11px]">
                      {sub.plano}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <div>
                      <span className="font-mono text-sm text-foreground">{brl(sub.valor)}</span>
                      <p className="text-[10px] text-muted-foreground">
                        {sub.plano.includes("Anual") ? "cobrança anual" : "por mês"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {format(new Date(sub.dataInicio), "dd MMM yyyy", { locale: ptBR })}
                  </TableCell>

                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {sub.proximaCobranca === "—"
                      ? "—"
                      : format(new Date(sub.proximaCobranca), "dd MMM yyyy", { locale: ptBR })}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-[11px]", statusConfig[sub.status].className)}
                    >
                      {statusConfig[sub.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Mostrando {startItem}–{endItem} de {total} assinaturas
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1,
                )
                .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "ellipsis" ? (
                    <span key={`e-${i}`} className="px-1.5 text-xs text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={page === item ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        "h-8 w-8 text-xs",
                        page === item && "bg-gold text-background hover:bg-gold-hover",
                      )}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </Button>
                  ),
                )}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

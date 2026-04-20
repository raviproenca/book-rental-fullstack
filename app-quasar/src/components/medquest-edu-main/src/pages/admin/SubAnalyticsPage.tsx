import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ArrowRightLeft,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  usePlanKpis,
  usePlanRevenue,
  usePlanChurn,
  usePlanMigrations,
} from "@/hooks/useSubAnalytics";
import { SubNav } from "@/components/admin/SubNav";
import { Badge } from "@/components/ui/badge";

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ─── Tooltips ─── */

function RevenueTooltip({
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
          <span className="font-mono text-xs font-semibold text-foreground">
            {brl(p.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

function PercentTooltip({
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
          <span className="font-mono text-xs font-semibold text-foreground">
            {(p.value ?? 0).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function MigrationTooltip({
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
          <span className="font-mono text-xs font-semibold text-foreground">
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Skeleton ─── */

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-80 rounded-xl border border-border bg-card" />
        <div className="h-80 rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export default function SubAnalyticsPage() {
  const { data: kpis, isLoading: kpisLoading } = usePlanKpis();
  const { data: revenueData, isLoading: revLoading } = usePlanRevenue();
  const { data: churnData, isLoading: churnLoading } = usePlanChurn();
  const { data: migrationData, isLoading: migLoading } = usePlanMigrations();

  if (kpisLoading || revLoading || churnLoading || migLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
          <p className="text-sm text-muted-foreground">Métricas por plano</p>
        </div>
        <SubNav />
        <AnalyticsSkeleton />
      </div>
    );
  }

  const m = kpis!.mensal;
  const a = kpis!.anual;

  const lastMigration = migrationData?.[migrationData.length - 1];
  const totalUpgrades = migrationData?.reduce((s, d) => s + d.mensalParaAnual, 0) ?? 0;
  const totalDowngrades = migrationData?.reduce((s, d) => s + d.anualParaMensal, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
        <p className="text-sm text-muted-foreground">
          Métricas detalhadas por tipo de plano
        </p>
      </div>

      <SubNav />

      {/* Per-plan KPI cards in 2-column layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Mensal Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Plano Mensal</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Receita", value: brl(m.receita), change: m.receitaChange, icon: DollarSign },
              { label: "Assinantes", value: m.assinantes.toLocaleString("pt-BR"), change: m.assinantesChange, icon: Users },
              { label: "Churn", value: `${m.churnRate.toFixed(1)}%`, change: m.churnChange, invertTrend: true },
              { label: "Retenção", value: `${m.retencao.toFixed(1)}%`, change: m.retencaoChange, icon: ShieldCheck },
            ].map((kpi) => {
              const isPositive = kpi.invertTrend ? kpi.change < 0 : kpi.change > 0;
              return (
                <div key={kpi.label} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
                    {kpi.icon && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary">
                        <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                    {!kpi.icon && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary">
                        <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="font-mono text-lg font-bold text-foreground">{kpi.value}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={cn("font-mono text-[11px] font-medium", isPositive ? "text-success" : "text-destructive")}>
                      {kpi.change > 0 ? "+" : ""}{kpi.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anual Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-gold/20 text-gold bg-gold-muted">
              Plano Anual
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Receita", value: brl(a.receita), change: a.receitaChange, icon: DollarSign },
              { label: "Assinantes", value: a.assinantes.toLocaleString("pt-BR"), change: a.assinantesChange, icon: Users },
              { label: "Churn", value: `${a.churnRate.toFixed(1)}%`, change: a.churnChange, invertTrend: true },
              { label: "Retenção", value: `${a.retencao.toFixed(1)}%`, change: a.retencaoChange, icon: ShieldCheck },
            ].map((kpi) => {
              const isPositive = kpi.invertTrend ? kpi.change < 0 : kpi.change > 0;
              return (
                <div key={kpi.label} className="rounded-xl border border-gold/20 bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
                    {kpi.icon && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-muted">
                        <kpi.icon className="h-3.5 w-3.5 text-gold" />
                      </div>
                    )}
                    {!kpi.icon && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-muted">
                        <TrendingDown className="h-3.5 w-3.5 text-gold" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="font-mono text-lg font-bold text-foreground">{kpi.value}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={cn("font-mono text-[11px] font-medium", isPositive ? "text-success" : "text-destructive")}>
                      {kpi.change > 0 ? "+" : ""}{kpi.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts Row 1: Revenue + Churn */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue comparison */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Receita por Plano</h2>
            <p className="text-xs text-muted-foreground">Mensal vs Anual — últimos 6 meses</p>
          </div>
          <div className="h-[240px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revMensal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(240, 4%, 65%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(240, 4%, 65%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revAnual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(41, 52%, 51%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(41, 52%, 51%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 4%, 16%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<RevenueTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Area type="monotone" dataKey="mensal" name="Mensal" stroke="hsl(240, 4%, 65%)" strokeWidth={2} fill="url(#revMensal)" />
                <Area type="monotone" dataKey="anual" name="Anual" stroke="hsl(41, 52%, 51%)" strokeWidth={2} fill="url(#revAnual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn comparison */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Churn por Plano</h2>
            <p className="text-xs text-muted-foreground">Taxa de cancelamento mensal (%)</p>
          </div>
          <div className="h-[240px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churnData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 4%, 16%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<PercentTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="mensal" name="Mensal" fill="hsl(240, 4%, 65%)" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                <Bar dataKey="anual" name="Anual" fill="hsl(41, 52%, 51%)" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Migration Section */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Migration chart */}
        <div className="rounded-xl border border-border bg-card p-4 md:col-span-2 md:p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Migrações entre Planos</h2>
            <p className="text-xs text-muted-foreground">Upgrades (Mensal → Anual) vs Downgrades (Anual → Mensal)</p>
          </div>
          <div className="h-[240px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={migrationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 4%, 16%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<MigrationTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="mensalParaAnual" name="Mensal → Anual" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                <Bar dataKey="anualParaMensal" name="Anual → Mensal" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Migration summary cards */}
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15">
                <ArrowUpRight className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Upgrades este mês</p>
                <p className="font-mono text-xl font-bold text-foreground">
                  {lastMigration?.mensalParaAnual ?? 0}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Mensal → Anual</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/15">
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Downgrades este mês</p>
                <p className="font-mono text-xl font-bold text-foreground">
                  {lastMigration?.anualParaMensal ?? 0}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Anual → Mensal</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-muted">
                <ArrowRightLeft className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total 6 meses</p>
                <p className="font-mono text-xl font-bold text-foreground">
                  {totalUpgrades + totalDowngrades}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-success">{totalUpgrades} upgrades</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-destructive">{totalDowngrades} downgrades</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

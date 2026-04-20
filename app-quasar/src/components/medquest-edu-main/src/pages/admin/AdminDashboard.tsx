import {
  Users,
  UserCheck,
  Crown,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserPlus,
  CreditCard,
  Flag,
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
} from "recharts";
import { cn } from "@/lib/utils";
import { useAdminStats, useAdminChartData, useRecentActivity } from "@/hooks/useAdmin";
import { DashboardSkeleton } from "@/components/Skeletons";

/* ─── Chart tooltip ─── */

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono-stats text-sm font-semibold text-foreground">
        {typeof v === "number" ? v.toLocaleString("pt-BR") : String(v ?? "")}
      </p>
    </div>
  );
}

/* ─── Component ─── */

export default function AdminDashboard() {
  const { data: stats = [], isLoading: isStatsLoading } = useAdminStats();
  const { data: chartData, isLoading: isChartLoading } = useAdminChartData();
  const { data: activity, isLoading: isActivityLoading } = useRecentActivity();

  if (isStatsLoading || isChartLoading || isActivityLoading) return <DashboardSkeleton />;

  const userGrowthData = chartData?.userGrowth ?? [];
  const questionsPerDay = chartData?.questionsPerDay ?? [];
  const recentSignups = activity?.signups ?? [];
  const recentSubscriptions = activity?.subscriptions ?? [];
  const recentReports = activity?.reports ?? [];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral da plataforma MEDQUEST
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4 md:p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground md:text-sm">
                {stat.label}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-muted">
                <stat.icon className="h-4 w-4 text-gold" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-mono-stats text-xl font-bold text-foreground md:text-2xl">
                {stat.value}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )}
              <span
                className={cn(
                  "font-mono-stats text-xs font-medium",
                  stat.trend === "up" ? "text-success" : "text-destructive"
                )}
              >
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User growth */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Crescimento de Usuários
            </h2>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </div>
          <div className="h-[240px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(41, 52%, 51%)"
                  strokeWidth={2}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Questions per day */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Questões Respondidas / Dia
            </h2>
            <p className="text-xs text-muted-foreground">Últimos 14 dias</p>
          </div>
          <div className="h-[240px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionsPerDay}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(240, 4%, 16%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="questoes"
                  fill="hsl(41, 52%, 51%)"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent signups */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-gold" />
            <h2 className="text-sm font-semibold text-foreground">
              Últimos Cadastros
            </h2>
          </div>
          <div className="space-y-3">
            {recentSignups.map((user) => (
              <div key={user.email} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {user.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent subscriptions */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gold" />
            <h2 className="text-sm font-semibold text-foreground">
              Últimas Assinaturas
            </h2>
          </div>
          <div className="space-y-3">
            {recentSubscriptions.map((sub, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-muted text-xs font-semibold text-gold">
                  {sub.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {sub.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {sub.plan}
                    </span>
                    <span className="font-mono-stats text-xs font-medium text-success">
                      {sub.amount}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {sub.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent reports */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Flag className="h-4 w-4 text-gold" />
            <h2 className="text-sm font-semibold text-foreground">
              Últimos Reportes
            </h2>
          </div>
          <div className="space-y-3">
            {recentReports.map((report, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-semibold text-destructive">
                  <Flag className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {report.reason}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {report.user}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="font-mono-stats text-xs text-gold">
                      {report.question}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {report.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

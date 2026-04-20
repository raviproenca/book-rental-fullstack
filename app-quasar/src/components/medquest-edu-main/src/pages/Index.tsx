import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Zap,
  RotateCcw,
  Clock,
  Play,
  Trophy,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/Skeletons";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData, useDashboardLeaderboard } from "@/hooks/useUser";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

/* ─── Helpers ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function acertoColor(pct: number) {
  if (pct >= 70) return "bg-success";
  if (pct >= 50) return "bg-warning";
  return "bg-destructive";
}

function acertoText(pct: number) {
  if (pct >= 70) return "text-success";
  if (pct >= 50) return "text-warning";
  return "text-destructive";
}

/* ─── Progress Ring ─── */
function ProgressRing({ value, max, size = 56 }: { value: number; max: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--gold))"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono-stats text-xs font-semibold text-foreground">
          {value}/{max}
        </span>
      </div>
    </div>
  );
}

/* ─── Custom Tooltip ─── */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="font-mono-stats text-sm text-gold">{payload[0].value} questões</p>
    </div>
  );
}

/* ─── Main ─── */
export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const streak = profile?.streak ?? 0;

  const dashboardQ = useDashboardData();
  const leaderboardQ = useDashboardLeaderboard();

  const isLoading = dashboardQ.isLoading || leaderboardQ.isLoading;
  const isError = dashboardQ.isError || leaderboardQ.isError;

  const dashboardData = dashboardQ.data;
  const leaderboard = leaderboardQ.data ?? [];

  const userName = dashboardData?.userName ?? "";
  const weeklyData = dashboardData?.weeklyData ?? [];
  const disciplines = dashboardData?.disciplines ?? [];
  const metaQuestoesDiarias = dashboardData?.metaQuestoesDiarias ?? 20;
  const questoesHoje = dashboardData?.questoesHoje ?? 0;
  const metaRingMax = Math.max(metaQuestoesDiarias, 1);

  const chartColors = useMemo(() => {
    const s = getComputedStyle(document.documentElement);
    const v = (name: string) => `hsl(${s.getPropertyValue(name).trim()})`;
    return {
      gold:       v('--gold'),
      border:     v('--border'),
      muted:      v('--muted-foreground'),
      gridLine:   v('--border'),
      background: v('--background'),
    };
  }, []);

  const sortedDisciplines = [...disciplines].sort((a, b) => b.acerto - a.acerto);

  const [showAllDisciplines, setShowAllDisciplines] = useLocalStorageState(
    "dashboard:showAllDisciplines",
    false
  );
  const visibleDisciplines = showAllDisciplines
    ? sortedDisciplines
    : sortedDisciplines.slice(0, 4);

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-6 py-12 text-center animate-fade-in">
        <p className="text-sm font-medium text-foreground">Não foi possível carregar o painel.</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Verifique a ligação e tente novamente. Se o problema continuar, saia e volte a entrar.
        </p>
        <button
          type="button"
          onClick={() => {
            void queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
            void queryClient.invalidateQueries({ queryKey: ["dashboard-leaderboard"] });
          }}
          className="rounded-xl bg-gold px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-gold-hover"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Section 1: Header ── */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {userName}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Você está no dia <span className="font-semibold text-gold">{streak}</span> do seu streak. Continue assim!
          </p>
        </div>

        <div className="flex w-full items-center justify-end gap-3 md:gap-4 lg:w-auto">
          {/* Daily goal ring */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex w-fit max-w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5"
          >
            <ProgressRing value={questoesHoje} max={metaRingMax} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">Meta diária</p>
              <p className="text-[10px] text-muted-foreground">
                {questoesHoje} de {metaQuestoesDiarias} questões
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Section 2: Quick Actions ── */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/praticar/sessao', { state: { mode: 'quick' } })}
          className="mb-3 flex items-center gap-2.5 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-background shadow-md shadow-gold/20 transition-all hover:bg-gold-hover active:scale-[0.98]"
        >
          <Zap className="h-4 w-4 shrink-0" />
          Prática Rápida — 10 questões aleatórias
        </button>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: RotateCcw, title: "Revisão de Erros", onClick: () => navigate('/review') },
            { icon: Clock,     title: "Simulado",          onClick: () => navigate('/simulados') },
            { icon: Play,      title: "Continuar",          onClick: () => navigate('/praticar/sessao', { state: { mode: 'continue' } }) },
          ].map((action) => (
            <button
              type="button"
              key={action.title}
              onClick={action.onClick}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-gold/20 hover:bg-accent hover:text-foreground active:scale-[0.98]"
            >
              <action.icon className="h-3.5 w-3.5 shrink-0" />
              {action.title}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 3+4: Main col (chart + disciplines) / Sidebar (leaderboard) ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column — 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Weekly Chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Progresso da Semana
              </h2>
              <span className="font-mono-stats text-xs text-muted-foreground">
                {weeklyData.reduce((a, d) => a + d.questoes, 0)} questões
              </span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.gold} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColors.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridLine} vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: chartColors.muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: chartColors.muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine
                    y={metaQuestoesDiarias}
                    stroke={chartColors.border}
                    strokeDasharray="6 4"
                    label={{ value: "Meta", position: "right", fill: chartColors.muted, fontSize: 10 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="questoes"
                    stroke={chartColors.gold}
                    strokeWidth={2}
                    fill="url(#goldGrad)"
                    dot={{ r: 3, fill: chartColors.gold, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: chartColors.gold, strokeWidth: 2, stroke: chartColors.background }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Discipline Performance */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Desempenho por Disciplina
              </h2>
              <span className="text-xs text-muted-foreground">
                {disciplines.reduce((a, d) => a + d.feitas, 0)} questões no total
              </span>
            </div>
            <div className="space-y-3.5">
              {visibleDisciplines.map((d, i) => (
                <div key={d.name} className="flex items-center gap-4">
                  {i < 3 && (
                    <TrendingUp className="h-3.5 w-3.5 shrink-0 text-gold" />
                  )}
                  {i >= 3 && <div className="w-3.5" />}
                  <span className="w-36 shrink-0 text-sm text-foreground">{d.name}</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", acertoColor(d.acerto))}
                      style={{ width: `${d.acerto}%` }}
                    />
                  </div>
                  <span className={cn("w-10 text-right font-mono-stats text-xs font-semibold", acertoText(d.acerto))}>
                    {d.acerto}%
                  </span>
                  <span className="w-16 text-right font-mono-stats text-xs text-muted-foreground">
                    {d.feitas}q
                  </span>
                </div>
              ))}
            </div>
            {sortedDisciplines.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllDisciplines(!showAllDisciplines)}
                className="mt-3 text-xs font-medium text-gold transition-colors hover:text-gold-hover"
              >
                {showAllDisciplines
                  ? "Ver menos"
                  : `Ver todas (${sortedDisciplines.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar — 1/3: Leaderboard */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Ranking Semanal
            </h2>
            <Trophy className="h-4 w-4 text-gold" />
          </div>
          <div className="space-y-2.5">
            {leaderboard.map((user) => (
              <div
                key={user.pos}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  user.isUser ? "bg-gold-muted border border-gold/15" : "hover:bg-accent"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full font-mono-stats text-xs font-bold",
                    user.pos <= 3 ? "bg-gold/15 text-gold" : "text-muted-foreground"
                  )}
                >
                  {user.pos}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                  {user.avatar}
                </div>
                <span className={cn("flex-1 text-sm", user.isUser ? "font-semibold text-foreground" : "text-foreground")}>
                  {user.name}
                  {user.isUser && <span className="ml-1 text-[10px] text-gold">(você)</span>}
                </span>
                <span className="font-mono-stats text-xs text-muted-foreground">{user.xp.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('/ranking')}
            className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-medium text-gold transition-colors hover:text-gold-hover"
          >
            Ver ranking completo
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

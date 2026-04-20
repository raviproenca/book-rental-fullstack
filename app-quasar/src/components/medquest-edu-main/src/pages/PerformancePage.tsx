import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import {
  BookOpen,
  Target,
  Flame,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Play,
  FileText,
  Download,
  ChevronDown,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  usePerformanceStats,
  useEvolutionData,
  useDisciplinePerf,
  useHeatmap,
  useWeakTopics,
  useSimuladoHistory,
} from "@/hooks/usePerformance";
import { DashboardSkeleton } from "@/components/Skeletons";

const periods = ["7 dias", "30 dias", "90 dias", "Tudo"] as const;

/* ─── Helpers ─── */
function acertoColor(p: number) {
  if (p >= 70) return "bg-success";
  if (p >= 50) return "bg-warning";
  return "bg-destructive";
}
function acertoText(p: number) {
  if (p >= 70) return "text-success";
  if (p >= 50) return "text-warning";
  return "text-destructive";
}

/* ─── Heatmap ─── */
const monthNames = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function Heatmap({ heatmapData }: { heatmapData: { date: Date; questoes: number; acerto: number }[] }) {
  if (heatmapData.length === 0) return null;
  const weeks: (typeof heatmapData[0] | null)[][] = [];
  const firstDay = heatmapData[0].date.getDay();
  let currentWeek: (typeof heatmapData[0] | null)[] = Array(firstDay).fill(null);

  heatmapData.forEach((d) => {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const getIntensity = (q: number) => {
    if (q === 0) return "bg-secondary";
    if (q <= 5) return "bg-gold/20";
    if (q <= 15) return "bg-gold/40";
    if (q <= 25) return "bg-gold/60";
    return "bg-gold/80";
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex gap-[3px] overflow-x-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) =>
              day ? (
                <UiTooltip key={di}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "h-[13px] w-[13px] rounded-[2px] transition-colors",
                        getIntensity(day.questoes)
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">
                      {day.date.getDate()} de {monthNames[day.date.getMonth()]}
                    </p>
                    <p className="text-muted-foreground">
                      {day.questoes} questões
                      {day.acerto > 0 && ` · ${day.acerto}% acerto`}
                    </p>
                  </TooltipContent>
                </UiTooltip>
              ) : (
                <div key={di} className="h-[13px] w-[13px] rounded-[2px] bg-transparent" />
              )
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}

/* ─── Chart Tooltip ─── */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string; name?: string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      {payload.map((p, i: number) => (
        <p key={i} className="font-mono-stats text-xs" style={{ color: p.color }}>
          {p.name === "questoes" ? `${p.value} questões` : `${p.value}% acerto`}
        </p>
      ))}
    </div>
  );
}

/* ─── Sparkline ─── */
function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--gold))"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Main ─── */
export default function PerformancePage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<typeof periods[number]>("7 dias");

  const { data: statsData, isLoading: isStatsLoading } = usePerformanceStats();
  const { data: evolutionData = [] } = useEvolutionData();
  const { data: disciplinePerfData } = useDisciplinePerf();
  const { data: heatmapData = [] } = useHeatmap();
  const { data: weakTopics = [] } = useWeakTopics();
  const { data: simuladoHistory = [] } = useSimuladoHistory();

  const [showAllDisciplinePerf, setShowAllDisciplinePerf] = useLocalStorageState(
    "perf:showAllDisciplinePerf",
    false
  );
  const [showAllWeakTopics, setShowAllWeakTopics] = useLocalStorageState(
    "perf:showAllWeakTopics",
    false
  );
  const [showAllSimuladoHistory, setShowAllSimuladoHistory] = useLocalStorageState(
    "perf:showAllSimuladoHistory",
    false
  );
  const [heatmapOpen, setHeatmapOpen] = useLocalStorageState("perf:heatmapOpen", false);

  const visibleDisciplinePerf = showAllDisciplinePerf
    ? disciplinePerfData?.data ?? []
    : (disciplinePerfData?.data ?? []).slice(0, 4);
  const visibleWeakTopics = showAllWeakTopics
    ? weakTopics
    : weakTopics.slice(0, 4);
  const visibleSimuladoHistory = showAllSimuladoHistory
    ? simuladoHistory
    : simuladoHistory.slice(0, 4);

  if (isStatsLoading || !statsData) return <DashboardSkeleton />;

  const stats = statsData[period] ?? statsData["7 dias"];
  const disciplinePerf = disciplinePerfData?.data ?? [];
  const mediaGeral = disciplinePerfData?.mediaGeral ?? 62;

  const statCards = [
    {
      label: "Questões Resolvidas",
      value: stats.questoes.toLocaleString("pt-BR"),
      delta: stats.delta,
      icon: BookOpen,
      positive: true,
    },
    {
      label: "Taxa de Acerto",
      value: `${stats.acerto}%`,
      delta: stats.acertoDelta,
      icon: Target,
      positive: true,
    },
    {
      label: "Streak Atual",
      value: String(stats.streak),
      delta: "dias",
      icon: Flame,
      isStreak: true,
    },
    {
      label: "Tempo Total",
      value: stats.tempo,
      delta: "de estudo",
      icon: Clock,
    },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-foreground">Seu Desempenho</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast("Exportação em breve!", { description: "Essa funcionalidade será implementada em breve." })}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-gold-muted px-3 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar PDF
          </button>
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  period === p ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card 1 — Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-gold/15"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={cn("h-4 w-4", s.isStreak ? "text-gold" : "text-muted-foreground")} />
            </div>
            <p className="mt-2 font-mono-stats text-2xl font-bold text-foreground">{s.value}</p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {s.positive && !s.isStreak && (
                <TrendingUp className="h-3 w-3 text-success" />
              )}
              <span className={cn(
                s.positive ? "text-success" : "text-muted-foreground",
                s.isStreak && "text-gold"
              )}>
                {s.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Card 2 — Evolution Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Evolução ao Longo do Tempo
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={evolutionData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0.15} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine yAxisId="left" y={20} stroke="hsl(var(--border-hover))" strokeDasharray="6 4" label={{ value: "Meta", position: "right", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <Bar yAxisId="left" dataKey="questoes" fill="url(#barGrad)" radius={[4, 4, 0, 0]} barSize={20} name="questoes" />
              <Line yAxisId="right" type="monotone" dataKey="acerto" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--success))", strokeWidth: 0 }} name="acerto" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card 3 — Discipline Performance */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Desempenho por Disciplina
            </h2>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="inline-block h-px w-3 border-t-2 border-dashed border-muted-foreground" />
              Média geral: {mediaGeral}%
            </span>
          </div>
          <div className="space-y-3">
            {visibleDisciplinePerf.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-sm text-foreground">{d.name}</span>
                <div className="relative h-2 flex-1 rounded-full bg-secondary">
                  <div className="h-full overflow-hidden rounded-full">
                    <motion.div
                      className={cn("h-full rounded-full", acertoColor(d.acerto))}
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${d.acerto}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    />
                  </div>
                  <div
                    className="absolute top-1/2 h-4 -translate-y-1/2 border-l-2 border-dashed border-muted-foreground/50"
                    style={{ left: `${mediaGeral}%` }}
                  />
                </div>
                <span className={cn("w-10 text-right font-mono-stats text-xs font-semibold", acertoText(d.acerto))}>
                  {d.acerto}%
                </span>
                <span className="w-12 text-right font-mono-stats text-[10px] text-muted-foreground">
                  {d.feitas}q
                </span>
              </div>
            ))}
            {disciplinePerf.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllDisciplinePerf(!showAllDisciplinePerf)}
                className="mt-3 text-xs font-medium text-gold transition-colors hover:text-gold-hover"
              >
                {showAllDisciplinePerf ? "Ver menos" : `Ver todas (${disciplinePerf.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Card 4 — Heatmap (tertiary, collapsed by default) */}
        <div className="rounded-xl border border-border bg-card p-5">
          <button
            type="button"
            onClick={() => setHeatmapOpen(!heatmapOpen)}
            className="flex w-full items-center justify-between"
            aria-expanded={heatmapOpen}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Atividade (últimos 90 dias)
            </h2>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                heatmapOpen && "rotate-180"
              )}
            />
          </button>
          {heatmapOpen && (
            <div className="mt-4">
              <Heatmap heatmapData={heatmapData} />
              <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
                <span>Menos</span>
                {["bg-secondary", "bg-gold/20", "bg-gold/40", "bg-gold/60", "bg-gold/80"].map((c) => (
                  <div key={c} className={cn("h-[10px] w-[10px] rounded-[2px]", c)} />
                ))}
                <span>Mais</span>
              </div>
            </div>
          )}
        </div>

        {/* Card 5 — Weak Topics */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Temas para Revisar
          </h2>
          <div className="space-y-2">
            {visibleWeakTopics.map((t) => (
              <div
                key={t.tema}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 px-4 py-3 transition-colors hover:border-gold/15"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{t.tema}</p>
                  <p className="text-[11px] text-muted-foreground">{t.disciplina} • {t.feitas} questões</p>
                </div>
                <span className={cn("font-mono-stats text-sm font-bold", acertoText(t.acerto))}>
                  {t.acerto}%
                </span>
                <button
                  onClick={() => navigate("/praticar", { state: { disciplina: t.disciplina, tema: t.tema } })}
                  className="flex h-7 items-center gap-1 rounded-md bg-gold-muted px-2.5 text-[11px] font-medium text-gold transition-colors hover:bg-gold/20"
                >
                  <Play className="h-3 w-3" />
                  Praticar
                </button>
              </div>
            ))}
            {weakTopics.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllWeakTopics(!showAllWeakTopics)}
                className="mt-3 text-xs font-medium text-gold transition-colors hover:text-gold-hover"
              >
                {showAllWeakTopics ? "Ver menos" : `Ver todos (${weakTopics.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Card 6 — Exam History */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Histórico de Simulados
            </h2>
            <Sparkline values={[...simuladoHistory].reverse().map((s) => s.nota)} />
          </div>
          <div className="space-y-2">
            {visibleSimuladoHistory.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 px-4 py-3 transition-colors hover:border-gold/15"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{s.date}</p>
                  <p className="text-[11px] text-muted-foreground">{s.questoes}q • {s.tempo}</p>
                </div>
                <span className={cn("font-mono-stats text-sm font-bold", acertoText(s.nota))}>
                  {s.nota}%
                </span>
                <button type="button" className="text-[11px] font-medium text-gold transition-colors hover:text-gold-hover">
                  Detalhes
                </button>
              </div>
            ))}
            {simuladoHistory.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllSimuladoHistory(!showAllSimuladoHistory)}
                className="mt-3 text-xs font-medium text-gold transition-colors hover:text-gold-hover"
              >
                {showAllSimuladoHistory ? "Ver menos" : `Ver todos (${simuladoHistory.length})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

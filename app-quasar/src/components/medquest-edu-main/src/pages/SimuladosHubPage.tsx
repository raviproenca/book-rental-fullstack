import { useNavigate } from "react-router-dom";
import { Play, Brain, TrendingUp, TrendingDown } from "lucide-react";
import { useSimuladoHistory } from "@/hooks/useSimuladoHistory";
import { SimuladoCard } from "@/components/simulado/SimuladoCard";
import { computeHubStats } from "@/lib/simuladoUtils";
import { DashboardSkeleton } from "@/components/Skeletons";
import { cn } from "@/lib/utils";

export default function SimuladosHubPage() {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useSimuladoHistory();

  const stats = sessions ? computeHubStats(sessions) : null;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto w-full max-w-[1100px] px-6 py-10 space-y-10">

        {/* Title row */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Simulados</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Provas cronometradas por disciplina com histórico de evolução
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/simulados/novo")}
            className="group flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-background shadow-lg shadow-gold/20 transition-colors hover:bg-gold-hover"
          >
            <Play className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            Novo Simulado
          </button>
        </div>

        {/* Global stats */}
        {stats && stats.total > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card px-4 pt-3 pb-4 ring-1 ring-gold/20">
              <div className="flex items-center gap-2">
                <p className="font-mono-stats text-2xl font-black text-gold">{stats.total}</p>
                <Brain className="h-3.5 w-3.5 text-gold" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">simulados feitos</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 pt-3 pb-4">
              <div className="flex items-center gap-2">
                <p className={cn("font-mono-stats text-2xl font-black", stats.avgScore >= 70 ? "text-success" : stats.avgScore >= 50 ? "text-warning" : "text-destructive")}>
                  {stats.avgScore}%
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">média geral</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 pt-3 pb-4">
              <div className="flex items-center gap-2">
                <p className={cn("font-mono-stats text-2xl font-black", stats.evolution >= 0 ? "text-success" : "text-destructive")}>
                  {stats.evolution >= 0 ? "+" : ""}{stats.evolution}%
                </p>
                {stats.evolution >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">evolução (30 dias)</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 pt-3 pb-4">
              <div className="flex items-center gap-2">
                <p className="font-mono-stats text-2xl font-black text-foreground">{stats.totalQuestions}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">questões respondidas</p>
            </div>
          </div>
        )}

        {/* History */}
        {sessions && sessions.length > 0 ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Histórico</span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground font-mono-stats">{sessions.length} simulados</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <SimuladoCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-muted">
              <Brain className="h-7 w-7 text-gold" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Nenhum simulado feito ainda</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Faça seu primeiro simulado e acompanhe sua evolução ao longo do tempo.
            </p>
            <button
              type="button"
              onClick={() => navigate("/simulados/novo")}
              className="mt-6 flex items-center gap-2 rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-background shadow-lg shadow-gold/20 hover:bg-gold-hover"
            >
              <Play className="h-4 w-4" />
              Começar agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

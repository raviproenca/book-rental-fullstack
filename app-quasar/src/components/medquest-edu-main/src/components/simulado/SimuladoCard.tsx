import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { secondsToHumanShort, scoreColorClass, computeTemaPerf } from "@/lib/simuladoUtils";
import type { SimuladoSession, SimuladoQuestion } from "@/types";

interface SimuladoCardProps {
  session: SimuladoSession;
  /** Reconstructed questions needed for tema bars. Pass empty array if not available — tema bars will be hidden. */
  questions?: Pick<SimuladoQuestion, "dbId" | "tema" | "correta">[];
}

export function SimuladoCard({ session, questions = [] }: SimuladoCardProps) {
  const navigate = useNavigate();
  const isLowScore = session.score < 50;
  const temaPerf = questions.length > 0
    ? computeTemaPerf(questions, session.answers).slice(0, 3)
    : [];

  const formattedDate = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })
    .format(
      Math.round((new Date(session.createdAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day"
    );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-border/80 transition-colors flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-foreground">{session.disciplina}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {formattedDate} · {session.questionIds.length} questões ·{" "}
            {secondsToHumanShort(session.timeUsedSec)}
          </div>
        </div>
        <span className={cn("font-mono-stats text-2xl font-black leading-none", scoreColorClass(session.score))}>
          {session.score}%
        </span>
      </div>

      {/* Low score badge */}
      {isLowScore && (
        <div className="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 w-fit">
          <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
          <span className="text-[10px] font-semibold text-destructive">Revisar — desempenho baixo</span>
        </div>
      )}

      {/* Tema bars */}
      {temaPerf.length > 0 && (
        <div className="space-y-1.5">
          {temaPerf.map((t) => (
            <div key={t.tema} className="flex items-center gap-2">
              <span className="w-16 shrink-0 truncate text-[10px] text-muted-foreground">{t.tema}</span>
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    t.pct >= 70 ? "bg-success" : t.pct >= 50 ? "bg-warning" : "bg-destructive"
                  )}
                  style={{ width: `${t.pct}%` }}
                />
              </div>
              <span className={cn("w-8 text-right font-mono-stats text-[10px] font-semibold", scoreColorClass(t.pct))}>
                {t.pct}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          type="button"
          onClick={() => navigate(`/simulados/${session.id}`)}
          className="flex-1 rounded-lg border border-border bg-secondary py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Ver Resultado
        </button>
        <button
          type="button"
          onClick={() => navigate("/simulados/novo", { state: { disciplina: session.disciplina } })}
          className={cn(
            "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
            isLowScore
              ? "bg-gold text-background hover:bg-gold-hover"
              : "border border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          Refazer
        </button>
      </div>
    </div>
  );
}

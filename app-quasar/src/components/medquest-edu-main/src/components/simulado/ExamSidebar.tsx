import { cn } from "@/lib/utils";

export interface QState {
  answered: string | null;
  flagged: boolean;
}

interface ExamSidebarProps {
  states: QState[];
  currentIdx: number;
  onGoTo: (idx: number) => void;
  onFinish: () => void;
}

export function ExamSidebar({ states, currentIdx, onGoTo, onFinish }: ExamSidebarProps) {
  const total = states.length;
  const answered = states.filter((s) => s.answered).length;
  const flagged = states.filter((s) => s.flagged).length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <aside className="hidden w-[260px] shrink-0 border-l border-border bg-card/50 p-5 lg:flex flex-col gap-4">
      {/* Stats */}
      <div className="space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-success/20 bg-success/5 p-2.5 text-center">
            <p className="font-mono-stats text-xl font-black text-success leading-none">{answered}</p>
            <p className="text-[9px] text-success/70 mt-1">respondidas</p>
          </div>
          <div className="rounded-lg border border-warning/20 bg-warning/5 p-2.5 text-center">
            <p className="font-mono-stats text-xl font-black text-warning leading-none">{flagged}</p>
            <p className="text-[9px] text-warning/70 mt-1">marcadas</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] text-muted-foreground">Progresso</span>
            <span className="text-gold font-mono-stats text-sm font-black">{pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-yellow-400 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground text-right">{answered}/{total}</p>
        </div>
      </div>

      {/* Question grid */}
      <div className="space-y-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Questões</p>
        <div className="grid grid-cols-6 gap-1">
          {states.map((s, i) => {
            const isCurrent = i === currentIdx;
            const base = "flex aspect-square items-center justify-center rounded font-mono-stats text-[9px] font-semibold cursor-pointer transition-all relative";
            let variant = "bg-secondary/50 border border-border text-muted-foreground hover:border-gold/30";
            if (isCurrent) variant = "bg-white text-black ring-2 ring-gold ring-offset-1";
            else if (s.answered) variant = "bg-gold text-background";
            return (
              <button
                key={i}
                type="button"
                onClick={() => onGoTo(i)}
                className={cn(base, variant)}
              >
                {i + 1}
                {s.flagged && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-warning border border-background" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          {[
            { swatch: "bg-gold", label: "Respondida" },
            { swatch: "bg-white ring-1 ring-gold", label: "Atual" },
            { swatch: "bg-warning h-2 w-2 rounded-full", label: "Marcada (dot)" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={cn("h-2.5 w-2.5 rounded-sm", l.swatch)} />
              <span className="text-[9px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Finish button */}
      <button
        type="button"
        onClick={onFinish}
        className="mt-auto h-10 w-full rounded-xl bg-gold text-sm font-bold text-background shadow-lg shadow-gold/20 hover:bg-gold-hover transition-colors"
      >
        Finalizar Simulado
      </button>
    </aside>
  );
}

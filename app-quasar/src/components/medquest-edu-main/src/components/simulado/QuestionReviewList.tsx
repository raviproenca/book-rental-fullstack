import { useState } from "react";
import { Check, X, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { getQuestionExplicacoes } from "@/services/questions";
import { cn } from "@/lib/utils";

export interface ReviewQuestion {
  dbId: number;
  displayId: number; // 1-based
  tema: string;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  correta: string;
  userAnswer: string | null;
}

interface QuestionReviewListProps {
  questions: ReviewQuestion[];
}

function QuestionReviewItem({ q }: { q: ReviewQuestion }) {
  const [expanded, setExpanded] = useState(false);
  const [explicacoes, setExplicacoes] = useState<Record<string, string> | null>(null);
  const [loadingExp, setLoadingExp] = useState(false);

  const isCorrect = q.userAnswer === q.correta;
  const isBlank = !q.userAnswer;

  const handleToggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !explicacoes) {
      setLoadingExp(true);
      try {
        const data = await getQuestionExplicacoes(q.dbId);
        setExplicacoes(data);
      } finally {
        setLoadingExp(false);
      }
    }
  };

  const rowBg = isBlank
    ? "border-border bg-secondary/20"
    : isCorrect
      ? "border-success/20 bg-success/5"
      : "border-destructive/20 bg-destructive/5";

  const icon = isBlank
    ? <Minus className="h-3 w-3 text-muted-foreground" />
    : isCorrect
      ? <Check className="h-3 w-3 text-background" />
      : <X className="h-3 w-3 text-background" />;

  const iconBg = isBlank ? "bg-muted" : isCorrect ? "bg-success" : "bg-destructive";

  return (
    <div className={cn("rounded-xl border overflow-hidden", rowBg, isBlank && "opacity-80")}>
      {/* Collapsed row */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md", iconBg)}>
          {icon}
        </div>
        <span className="font-mono-stats text-[10px] text-muted-foreground w-4 shrink-0">{q.displayId.toString().padStart(2, "0")}</span>
        <span className="flex-1 truncate text-xs text-muted-foreground">{q.enunciado}</span>
        <span className="shrink-0 text-[10px] text-muted-foreground hidden sm:inline">{q.tema}</span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50">
          {/* Alternatives */}
          <div className="space-y-1.5 pt-3">
            {q.alternativas.map((alt) => {
              const isUserAnswer = alt.letra === q.userAnswer;
              const isCorrectAlt = alt.letra === q.correta;
              let style = "border-border bg-secondary/20";
              if (isUserAnswer && !isCorrectAlt) style = "border-destructive/50 bg-destructive/10";
              if (isCorrectAlt) style = "border-success/50 bg-success/10";
              return (
                <div key={alt.letra} className={cn("flex items-start gap-2.5 rounded-lg border px-3 py-2", style)}>
                  <span className={cn(
                    "font-mono-stats text-xs font-bold shrink-0 w-4",
                    isCorrectAlt ? "text-success" : isUserAnswer ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {alt.letra}
                  </span>
                  <span className="text-xs text-foreground flex-1">{alt.texto}</span>
                  {isCorrectAlt && (
                    <span className="text-[9px] font-semibold text-success shrink-0">← correta</span>
                  )}
                  {isUserAnswer && !isCorrectAlt && (
                    <span className="text-[9px] font-semibold text-destructive shrink-0">← sua resposta</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {loadingExp && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-3 w-3 animate-spin rounded-full border border-border border-t-muted-foreground" />
              Carregando explicação...
            </div>
          )}
          {explicacoes && (
            <div className="rounded-lg border border-border bg-background/50 p-3 space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Explicação</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {explicacoes[q.correta] ?? Object.values(explicacoes)[0] ?? "Sem explicação disponível."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QuestionReviewList({ questions }: QuestionReviewListProps) {
  return (
    <div className="space-y-2">
      {questions.map((q) => (
        <QuestionReviewItem key={q.dbId} q={q} />
      ))}
    </div>
  );
}

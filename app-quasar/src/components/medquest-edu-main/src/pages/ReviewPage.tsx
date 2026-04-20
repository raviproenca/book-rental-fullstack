import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Check,
  X,
  Play,
  RotateCcw,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUpcomingDays, useReviewQuestions, useUpcomingReviews } from "@/hooks/useReview";
import { DashboardSkeleton } from "@/components/Skeletons";

type Phase = "home" | "question" | "feedback";
type QuestionPhase = "recall" | "answer" | "feedback";

const srsButtons = [
  { label: "Não lembrei", interval: "1 dia", color: "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25" },
  { label: "Difícil", interval: "3 dias", color: "bg-warning/15 text-warning border-warning/30 hover:bg-warning/25" },
  { label: "Bom", interval: "7 dias", color: "bg-success/15 text-success border-success/30 hover:bg-success/25" },
  { label: "Fácil", interval: "14 dias", color: "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25" },
];

const diffStyles = {
  Fácil: "bg-success/10 text-success border-success/20",
  Médio: "bg-warning/10 text-warning border-warning/20",
  Difícil: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function ReviewPage() {
  const { data: upcomingDays = [] } = useUpcomingDays();
  const { data: reviewQuestions = [], isLoading } = useReviewQuestions();
  const { data: upcomingReviews = [] } = useUpcomingReviews();
  const [phase, setPhase] = useState<Phase>("home");
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>("recall");

  const question = reviewQuestions[qIdx];
  const total = reviewQuestions.length;

  const handleSelect = useCallback(
    (letra: string) => {
      if (confirmed) return;
      setSelected(letra);
    },
    [confirmed]
  );

  const handleConfirm = useCallback(() => {
    if (!selected || confirmed) return;
    setConfirmed(true);
    setPhase("feedback");
    setQuestionPhase("feedback");
  }, [selected, confirmed]);

  const handleSRS = useCallback(
    (_rating: string) => {
      setCompleted((c) => c + 1);
      if (qIdx + 1 < total) {
        setQIdx((i) => i + 1);
        setSelected(null);
        setConfirmed(false);
        setPhase("question");
        setQuestionPhase("recall");
      } else {
        setPhase("home");
        setQIdx(0);
        setSelected(null);
        setConfirmed(false);
        setQuestionPhase("recall");
      }
    },
    [qIdx, total]
  );

  useEffect(() => {
    if (phase === "home") return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (!question) return;
      if (phase === "question") {
        if (questionPhase === "recall" && (e.key === " " || e.key === "Enter")) {
          e.preventDefault();
          setQuestionPhase("answer");
          return;
        }
        if (questionPhase === "answer" && !confirmed) {
          if (e.key >= "1" && e.key <= "5") {
            const idx = parseInt(e.key) - 1;
            if (question.alternativas[idx]) handleSelect(question.alternativas[idx].letra);
          }
          if (e.key === "Enter") handleConfirm();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, questionPhase, question, handleSelect, handleConfirm]);

  useEffect(() => {
    if (isLoading) return;
    if (phase !== "home" && (total === 0 || !reviewQuestions[qIdx])) {
      setPhase("home");
      setQIdx(0);
      setSelected(null);
      setConfirmed(false);
      setQuestionPhase("recall");
    }
  }, [isLoading, phase, total, qIdx, reviewQuestions]);

  if (isLoading) return <DashboardSkeleton />;

  const isCorrect = selected === question?.correta;

  const getAltState = (letra: string) => {
    if (!question) return "default";
    if (!confirmed) return selected === letra ? "selected" : "default";
    if (letra === question.correta) return "correct";
    if (selected === letra) return "wrong";
    return "disabled";
  };

  const altStyles = {
    default: "border-border bg-card hover:border-gold/20 hover:bg-accent/50 cursor-pointer",
    selected: "border-gold/50 bg-gold-muted cursor-pointer",
    correct: "border-success/40 bg-success/[0.08]",
    wrong: "border-destructive/40 bg-destructive/[0.08]",
    disabled: "border-border/50 bg-card/50 opacity-60",
  };

  const letterStyles = {
    default: "border-border bg-secondary text-muted-foreground",
    selected: "border-gold/50 bg-gold/15 text-gold",
    correct: "border-success/50 bg-success/15 text-success",
    wrong: "border-destructive/50 bg-destructive/15 text-destructive",
    disabled: "border-border/50 bg-secondary/50 text-muted-foreground/50",
  };

  /* ═══════ HOME ═══════ */
  if (phase === "home") {
    return (
      <div className="mx-auto max-w-[900px]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Revisão do Dia</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Questões selecionadas pelo algoritmo de repetição espaçada para otimizar sua retenção.
          </p>
        </div>

        {/* Hero card */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-foreground">
                Você tem <span className="text-gold">{total - completed}</span> questões para revisar hoje
              </p>
              <p className="text-sm text-muted-foreground">
                {completed > 0 ? `${completed} de ${total} concluídas` : "Complete suas revisões para manter a retenção"}
              </p>
            </div>
            <button
              type="button"
              disabled={total === 0}
              onClick={() => {
                if (total === 0) return;
                setPhase("question");
                setQIdx(0);
                setSelected(null);
                setConfirmed(false);
                setQuestionPhase("recall");
              }}
              className="flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover hover:shadow-gold/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              <Play className="h-4 w-4" />
              Iniciar Revisão
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Próximos 7 dias</h2>
          <div className="grid grid-cols-7 gap-2.5">
            {upcomingDays.map((d) => (
              <div
                key={d.date}
                className={cn(
                  "flex flex-col items-center rounded-xl border px-2 py-3 transition-colors",
                  d.isToday
                    ? "border-gold/60 bg-gold/12 shadow-md shadow-gold/15 ring-1 ring-gold/25"
                    : "border-border/80 bg-secondary/50"
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    d.isToday ? "text-gold-light" : "text-foreground/85"
                  )}
                >
                  {d.day}
                </span>
                <span
                  className={cn(
                    "mt-1 text-lg font-bold tabular-nums",
                    d.count > 0
                      ? "text-foreground"
                      : d.isToday
                        ? "text-gold/90"
                        : "text-muted-foreground/70"
                  )}
                >
                  {d.count}
                </span>
                <span
                  className={cn(
                    "text-[10px]",
                    d.isToday ? "text-gold-light/85" : "text-muted-foreground"
                  )}
                >
                  {d.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming reviews table */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Próximas Revisões</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_120px_100px_100px_60px] gap-2 px-3 text-[11px] font-medium text-muted-foreground">
              <span>Questão</span>
              <span>Disciplina</span>
              <span>Última</span>
              <span>Próxima</span>
              <span className="text-right">Revisões</span>
            </div>
            {upcomingReviews.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_120px_100px_100px_60px] items-center gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2.5 transition-colors hover:bg-secondary/40"
              >
                <span className="truncate text-sm text-foreground">{r.trecho}</span>
                <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-center text-[11px] text-muted-foreground">
                  {r.disciplina}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{r.ultimaRevisao}</span>
                <span className="font-mono text-xs text-foreground">{r.proximaRevisao}</span>
                <span className="text-right font-mono text-xs text-muted-foreground">{r.nRevisoes}×</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return <DashboardSkeleton />;
  }

  const progressDenom = Math.max(total, 1);

  /* ═══════ QUESTION / FEEDBACK ═══════ */
  return (
    <div className="mx-auto max-w-[720px] animate-fade-in">
      {/* Progress bar */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setPhase("home");
            setQuestionPhase("recall");
          }}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Voltar
        </button>
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-secondary">
            <div
              className="h-1.5 rounded-full bg-gold transition-all duration-500"
              style={{
                width: `${((qIdx + (confirmed ? 1 : 0)) / progressDenom) * 100}%`,
              }}
            />
          </div>
        </div>
        <span className="font-mono-stats text-xs text-muted-foreground">
          {qIdx + 1}/{total}
        </span>
      </div>

      {/* Meta */}
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
          {question.disciplina}
        </span>
        <span className={cn("rounded-md border px-2 py-0.5 text-[11px] font-medium", diffStyles[question.dificuldade])}>
          {question.dificuldade}
        </span>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
          <RotateCcw className="h-3 w-3" />
          {question.revisoes} revisões
        </span>
      </div>

      {/* Enunciado */}
      <div className="mb-4 rounded-lg border-l-2 border-l-gold bg-gold-muted/60 px-5 py-4">
        <p className="text-[15px] leading-[1.7] text-foreground">{question.enunciado}</p>
      </div>

      <p className="mb-4 text-[15px] font-medium leading-[1.7] text-foreground">{question.pergunta}</p>

      {/* Recall — active retrieval before options */}
      {phase === "question" && questionPhase === "recall" && (
        <div className="bg-secondary/40 border border-border/50 rounded-xl px-5 py-6">
          <div className="flex flex-col items-center text-center">
            <Brain className="h-10 w-10 text-primary" aria-hidden />
            <p className="mt-4 text-[15px] font-medium text-foreground">
              Pense na resposta antes de ver as alternativas
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tente recordar ativamente — é o que torna o SRS eficaz
            </p>
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setQuestionPhase("answer")}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover"
            >
              Ver alternativas
            </motion.button>
          </div>
        </div>
      )}

      {/* Alternatives */}
      {questionPhase !== "recall" && (
        <motion.div
          className="space-y-2.5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {question.alternativas.map((alt) => {
            const state = getAltState(alt.letra);
            return (
              <button
                key={alt.letra}
                onClick={() => handleSelect(alt.letra)}
                disabled={confirmed}
                className={cn(
                  "flex w-full items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-200",
                  altStyles[state]
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono-stats text-xs font-semibold transition-colors",
                    letterStyles[state]
                  )}
                >
                  {state === "correct" ? <Check className="h-3.5 w-3.5" /> : state === "wrong" ? <X className="h-3.5 w-3.5" /> : alt.letra}
                </span>
                <span className={cn("pt-0.5 text-sm leading-relaxed", state === "disabled" ? "text-muted-foreground/60" : "text-foreground")}>
                  {alt.texto}
                </span>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Confirm button */}
      {!confirmed && questionPhase === "answer" && (
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          Confirmar Resposta
        </button>
      )}

      {/* Feedback + SRS */}
      {confirmed && (
        <div className="mt-6 animate-fade-in space-y-5 rounded-2xl border border-border bg-card p-6">
          {/* Result */}
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15">
                <Check className="h-5 w-5 text-success" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15">
                <X className="h-5 w-5 text-destructive" />
              </div>
            )}
            <div>
              <p className={cn("text-lg font-bold", isCorrect ? "text-success" : "text-destructive")}>
                {isCorrect ? "Correto! ✓" : "Incorreto ✗"}
              </p>
              <p className="text-xs text-muted-foreground">
                Resposta correta: <span className="font-semibold text-foreground">{question.correta}</span>
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="font-mono-stats">{question.estatistica}%</span> acertaram
            </div>
          </div>

          {/* Comment */}
          <div className="border-t border-border pt-4">
            <p className="text-sm leading-[1.8] text-foreground/90">{question.comentario}</p>
          </div>

          {/* SRS Rating */}
          <div className="border-t border-border pt-5">
            <p className="mb-3 text-center text-sm font-semibold text-foreground">
              Como foi sua lembrança?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {srsButtons.map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => handleSRS(btn.label)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-all duration-200",
                    btn.color
                  )}
                >
                  <span className="text-sm font-semibold">{btn.label}</span>
                  <span className="text-[10px] opacity-70">{btn.interval}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Sua avaliação ajusta o intervalo da próxima revisão
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

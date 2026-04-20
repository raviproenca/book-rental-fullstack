import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Clock,
  Bookmark,
  Flag,
  ArrowRight,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Sparkles,
  ArrowLeft,
  Pause,
  Play,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ShakeWrapper } from "@/components/MicroInteractions";
import { useQuestions } from "@/hooks/useQuestions";
import { QuestionListSkeleton } from "@/components/Skeletons";
import type { PracticeConfig } from "@/types";

/* ─── Difficulty Badge ─── */
function DifficultyBadge({ level }: { level: "Fácil" | "Médio" | "Difícil" }) {
  const styles = {
    Fácil: "bg-success/10 text-success border-success/20",
    Médio: "bg-warning/10 text-warning border-warning/20",
    Difícil: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <span className={cn("rounded-md border px-2 py-0.5 text-[11px] font-medium", styles[level])}>
      {level}
    </span>
  );
}

/* ─── Timer ─── */
function Timer({ onTick }: { onTick?: (seconds: number) => void }) {
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    onTick?.(0);
  }, [onTick]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        onTick?.(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, onTick]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5">
      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
      <span className={cn("font-mono-stats text-sm", paused ? "text-muted-foreground" : "text-foreground")}>
        {mins}:{secs}
      </span>
      <button
        onClick={() => setPaused((p) => !p)}
        className="ml-0.5 flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
        title={paused ? "Retomar timer" : "Pausar timer"}
        aria-label={paused ? "Retomar timer" : "Pausar timer"}
      >
        {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
      </button>
    </div>
  );
}

/* ─── XP Counter (animated) ─── */
function XPCounter({ show }: { show: boolean }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!show) return;
    motionVal.set(0);
    const controls = animate(motionVal, 10, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [show]);

  if (!show) return null;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="inline-flex items-center gap-1 rounded-full bg-gold-muted px-2.5 py-0.5 font-mono-stats text-sm font-bold text-gold"
    >
      <Sparkles className="h-3.5 w-3.5" />
      +{display} XP
    </motion.span>
  );
}

/* ─── Markdown Comment ─── */
function MarkdownComment({ text }: { text: string }) {
  const blocks = text.split("\n\n");

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        const lines = trimmed.split("\n");
        const isAllList = lines.every((l) => l.trimStart().startsWith("- "));

        if (isAllList) {
          return (
            <ul key={i} className="my-2 list-disc pl-5 space-y-1">
              {lines.map((line, j) => (
                <li key={j} className="text-sm leading-relaxed">
                  <InlineMarkdown text={line.replace(/^-\s*/, "")} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="mb-3 text-sm leading-[1.8] last:mb-0">
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                <InlineMarkdown text={line} />
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ─── Gold Confetti ─── */
function GoldConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ["bg-gold", "bg-gold-light", "bg-warning", "bg-gold"];
  const color = colors[Math.floor(Math.abs(x * 7) % colors.length)];
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x, scale: 1, rotate: 0 }}
      animate={{
        opacity: 0,
        y: -80 - Math.random() * 30,
        x: x + (Math.random() - 0.5) * 60,
        scale: 0.3,
        rotate: 180 + Math.random() * 360,
      }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
      className={cn("absolute h-1.5 w-1.5 rounded-sm", color)}
    />
  );
}

function GoldConfetti({ show }: { show: boolean }) {
  if (!show) return null;
  const particles = [-30, -18, -8, 0, 8, 18, 30, -14, 14];
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {particles.map((x, i) => (
        <GoldConfettiParticle key={i} delay={i * 0.04} x={x} />
      ))}
    </div>
  );
}

/* ─── Slide Variants ─── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

type PracticeLocationState = {
  config?: PracticeConfig;
  questionIds?: number[];
  mode?: string;
};

const EMPTY_PRACTICE_CONFIG: PracticeConfig = {
  mode: "",
  disciplinas: [],
  temas: {},
  dificuldades: [],
  status: "todas",
  numQuestions: 50,
};

function formatMmSs(totalSeconds: number) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/* ─── Main ─── */
export default function PracticePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const practiceConfig = useMemo((): PracticeConfig | undefined => {
    const state = location.state as PracticeLocationState | undefined;
    if (!state) return undefined;
    if (state.config) {
      return state.questionIds?.length
        ? { ...state.config, questionIds: state.questionIds }
        : state.config;
    }
    if (state.questionIds?.length) {
      return {
        ...EMPTY_PRACTICE_CONFIG,
        questionIds: state.questionIds,
        numQuestions: state.questionIds.length,
      };
    }
    return undefined;
  }, [location.state]);

  const { data: mockQuestions = [], isLoading } = useQuestions(practiceConfig);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [expandedAlt, setExpandedAlt] = useState<string | null>(null);
  const [sessionAnswers, setSessionAnswers] = useState<
    Array<{ questionId: number; selected: string; correct: boolean }>
  >([]);
  const [phase, setPhase] = useState<"session" | "result">("session");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [routeResetKey, setRouteResetKey] = useState(location.key);

  if (routeResetKey !== location.key) {
    setRouteResetKey(location.key);
    setCurrentIdx(0);
    setDirection(1);
    setSelected(null);
    setConfirmed(false);
    setBookmarked(false);
    setExpandedAlt(null);
    setSessionAnswers([]);
    setPhase("session");
    setElapsedSec(0);
  }

  const question = mockQuestions[currentIdx];

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
  }, [selected, confirmed]);

  const handleNext = useCallback(() => {
    if (!confirmed || mockQuestions.length === 0) return;
    const q = mockQuestions[currentIdx];
    if (!q) return;

    if (confirmed && selected !== null) {
      setSessionAnswers((prev) => [
        ...prev,
        {
          questionId: q.id,
          selected,
          correct: selected === q.correta,
        },
      ]);
    }

    if (currentIdx + 1 >= mockQuestions.length) {
      setPhase("result");
      return;
    }

    setDirection(1);
    setSelected(null);
    setConfirmed(false);
    setBookmarked(false);
    setExpandedAlt(null);
    setCurrentIdx(currentIdx + 1);
  }, [confirmed, currentIdx, mockQuestions, selected]);

  const handlePrev = useCallback(() => {
    if (currentIdx <= 0) return;
    setDirection(-1);
    setSelected(null);
    setConfirmed(false);
    setBookmarked(false);
    setExpandedAlt(null);
    setCurrentIdx(currentIdx - 1);
  }, [currentIdx]);

  /* Keyboard shortcuts */
  useEffect(() => {
    if (phase !== "session" || isLoading || mockQuestions.length === 0) return;
    const q = mockQuestions[currentIdx];
    if (!q) return;

    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= "1" && e.key <= "5") {
        const idx = parseInt(e.key) - 1;
        if (q.alternativas[idx]) handleSelect(q.alternativas[idx].letra);
      }
      if (e.key === "Enter") {
        if (confirmed) handleNext();
        else handleConfirm();
      }
      if (e.key === "ArrowRight" && confirmed) handleNext();
      if (e.key === "ArrowLeft" && currentIdx > 0) handlePrev();
      if (e.key.toLowerCase() === "b") setBookmarked((b) => !b);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    phase,
    isLoading,
    mockQuestions,
    currentIdx,
    handleSelect,
    handleConfirm,
    handleNext,
    handlePrev,
    confirmed,
  ]);

  if (phase === "session" && (isLoading || mockQuestions.length === 0)) {
    return <QuestionListSkeleton count={1} />;
  }

  if (phase === "result") {
    const totalAnswered = sessionAnswers.length;
    const numCorrect = sessionAnswers.filter((a) => a.correct).length;
    const numWrong = sessionAnswers.filter((a) => !a.correct).length;
    const pct =
      totalAnswered > 0 ? Math.round((numCorrect / totalAnswered) * 100) : 0;
    const pctColor =
      pct >= 70 ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive";
    const barColor =
      pct >= 70 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-destructive";
    const wrongIds = [
      ...new Set(sessionAnswers.filter((a) => !a.correct).map((a) => a.questionId)),
    ];

    const weakMap = new Map<string, number>();
    for (const a of sessionAnswers) {
      if (a.correct) continue;
      const qMeta = mockQuestions.find((qq) => qq.id === a.questionId);
      if (!qMeta) continue;
      const label = `${qMeta.disciplina} — ${qMeta.tema}`;
      weakMap.set(label, (weakMap.get(label) ?? 0) + 1);
    }
    const weakEntries = [...weakMap.entries()].sort((a, b) => b[1] - a[1]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto max-w-lg space-y-8 px-4 py-8"
      >
        <div className="relative flex flex-col items-center text-center">
          {pct >= 70 && (
            <div className="pointer-events-none absolute inset-0 flex justify-center overflow-visible">
              <GoldConfetti show />
            </div>
          )}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-muted"
          >
            <Trophy className="h-8 w-8 text-gold" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">
            {numCorrect} / {totalAnswered} questões corretas
          </h1>
          <p className={cn("mt-2 font-mono-stats text-3xl font-bold", pctColor)}>{pct}%</p>
          <p className="mt-1 text-sm text-muted-foreground">Taxa de acerto</p>
          <div className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-border/40">
            <motion.div
              className={cn("h-full rounded-full", barColor)}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-border bg-card px-3 py-4">
            <p className="font-mono-stats text-2xl font-bold text-success">{numCorrect}</p>
            <p className="text-xs text-muted-foreground">Corretas</p>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-4">
            <p className="font-mono-stats text-2xl font-bold text-destructive">{numWrong}</p>
            <p className="text-xs text-muted-foreground">Incorretas</p>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-4">
            <p className="font-mono-stats text-2xl font-bold text-foreground">{formatMmSs(elapsedSec)}</p>
            <p className="text-xs text-muted-foreground">Tempo total</p>
          </div>
        </div>

        {weakEntries.length > 0 && (
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Pontos fracos desta sessão</h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {weakEntries.map(([label, count]) => (
                <li key={label} className="flex justify-between gap-2">
                  <span className="text-left text-foreground/90">{label}</span>
                  <span className="shrink-0 font-mono-stats text-xs">{count} erro(s)</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          <button
            type="button"
            disabled={wrongIds.length === 0}
            onClick={() =>
              wrongIds.length > 0 &&
              navigate("/praticar/sessao", { state: { questionIds: wrongIds } })
            }
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold transition-colors sm:w-auto sm:min-w-[140px] sm:flex-1",
              wrongIds.length === 0
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-accent"
            )}
          >
            Revisar Erros
          </button>
          <button
            type="button"
            onClick={() => navigate("/praticar")}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-colors hover:bg-gold-hover sm:w-auto sm:min-w-[140px] sm:flex-1"
          >
            Nova Sessão
          </button>
          <button
            type="button"
            onClick={() => navigate("/desempenho")}
            className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-secondary/50 text-sm font-semibold transition-colors hover:bg-secondary sm:w-auto sm:min-w-[140px] sm:flex-1"
          >
            Ver Desempenho
          </button>
        </div>
      </motion.div>
    );
  }

  if (!question) {
    return <QuestionListSkeleton count={1} />;
  }

  const isCorrect = selected === question.correta;

  const progressPercent =
    ((currentIdx + (confirmed ? 1 : 0)) / mockQuestions.length) * 100;

  const getAlternativeState = (letra: string) => {
    if (!confirmed) {
      if (selected === letra) return "selected";
      return "default";
    }
    if (letra === question.correta) return "correct";
    if (selected === letra && letra !== question.correta) return "wrong";
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

  return (
    <div>
      {/* ── Progress Bar ── */}
      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-border/30">
        <motion.div
          className="h-full rounded-full bg-gold"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* ── Session Header ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2.5 md:mb-8 md:gap-3 md:px-5 md:py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono-stats text-sm text-muted-foreground">
            Questão{" "}
            <span className="font-semibold text-foreground">{currentIdx + 1}</span>
            <span className="text-muted-foreground"> de {mockQuestions.length}</span>
          </span>
          <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
            {question.disciplina}
          </span>
          <DifficultyBadge level={question.dificuldade} />
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <Timer onTick={setElapsedSec} />
          <div className="flex items-center gap-2 font-mono-stats text-sm">
            <span className="flex items-center gap-1 text-success">
              <Check className="h-3.5 w-3.5" />
              {sessionAnswers.filter((a) => a.correct).length}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="flex items-center gap-1 text-destructive">
              <X className="h-3.5 w-3.5" />
              {sessionAnswers.filter((a) => !a.correct).length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {currentIdx > 0 && (
            <button
              onClick={handlePrev}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:h-8 md:w-8"
              title="Anterior (←)"
              aria-label="Questão anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
              bookmarked ? "bg-gold-muted text-gold" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            title="Bookmark (B)"
            aria-label={bookmarked ? "Remover bookmark" : "Adicionar bookmark"}
          >
            <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Reportar"
            aria-label="Reportar questão"
          >
            <Flag className="h-4 w-4" />
          </button>
          {confirmed && (
            <button
              onClick={handleNext}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Próxima (→)"
              aria-label="Próxima questão"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Question Body (animated slide) ── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIdx}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto max-w-[720px] space-y-6"
        >
          {/* Clinical context */}
          <div className="rounded-lg border-l-2 border-l-gold bg-gold-muted/60 px-4 py-3 md:px-5 md:py-4">
            <p className="text-sm leading-[1.7] text-foreground md:text-[15px]">{question.enunciado}</p>
          </div>

          {/* Question */}
          <p className="text-[15px] font-medium leading-[1.7] text-foreground">{question.pergunta}</p>

          {/* Alternatives */}
          <div className="space-y-2.5">
            {question.alternativas.map((alt, i) => {
              const state = getAlternativeState(alt.letra);
              const shouldShake = confirmed && !isCorrect && selected === alt.letra;
              return (
                <ShakeWrapper key={alt.letra} shake={shouldShake}>
                  <button
                    onClick={() => handleSelect(alt.letra)}
                    disabled={confirmed}
                    className={cn(
                      "group flex w-full items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-200",
                      altStyles[state]
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono-stats text-xs font-semibold transition-colors",
                        letterStyles[state]
                      )}
                    >
                      {state === "correct" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : state === "wrong" ? (
                        <X className="h-3.5 w-3.5" />
                      ) : (
                        alt.letra
                      )}
                    </span>
                    <span
                      className={cn(
                        "pt-0.5 text-sm leading-relaxed",
                        state === "disabled" ? "text-muted-foreground/60" : "text-foreground"
                      )}
                    >
                      {alt.texto}
                    </span>
                    <span className="ml-auto hidden text-[10px] text-muted-foreground/40 group-hover:inline">
                      {i + 1}
                    </span>
                  </button>
                </ShakeWrapper>
              );
            })}
          </div>

          {/* Confirm / Next Button */}
          {!confirmed ? (
            <div className="sticky bottom-0 -mx-4 bg-background/90 px-4 py-3 backdrop-blur-sm md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>
              <button
                onClick={handleConfirm}
                disabled={!selected}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none active:scale-[0.98] md:hover:bg-gold-hover"
              >
                Confirmar Resposta
                <kbd className="ml-2 hidden rounded border border-background/20 px-1.5 py-0.5 font-mono-stats text-[10px] opacity-60 md:inline">
                  Enter
                </kbd>
              </button>
            </div>
          ) : (
            <>
              {/* ── Feedback Panel ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6 rounded-2xl border border-border bg-card p-6"
              >
                {/* Result header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-success/15">
                        <Check className="h-5 w-5 text-success" />
                        <GoldConfetti show={isCorrect && confirmed} />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15">
                        <X className="h-5 w-5 text-destructive" />
                      </div>
                    )}
                    <div>
                      <p className={cn("text-lg font-bold", isCorrect ? "text-success" : "text-destructive")}>
                        {isCorrect ? "Resposta Correta! ✓" : "Resposta Incorreta ✗"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        A resposta correta é <span className="font-semibold text-foreground">{question.correta}</span>
                      </p>
                    </div>
                  </div>
                  <XPCounter show={confirmed} />
                </div>

                {/* Comment */}
                <div className="space-y-3 border-t border-border pt-5">
                  <h3 className="text-sm font-semibold text-foreground">Explicação</h3>
                  <MarkdownComment text={question.comentario} />
                </div>

                {/* Why others are wrong */}
                <div className="space-y-2 border-t border-border pt-5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Por que as outras estão erradas?
                  </h3>
                  {question.alternativas
                    .filter((a) => a.letra !== question.correta)
                    .map((alt) => (
                      <button
                        key={alt.letra}
                        onClick={() =>
                          setExpandedAlt(expandedAlt === alt.letra ? null : alt.letra)
                        }
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-2.5 transition-colors hover:bg-secondary/60">
                          <span className="flex min-w-0 flex-1 items-start gap-2 text-sm text-foreground">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono-stats text-[10px] font-semibold text-muted-foreground">
                              {alt.letra}
                            </span>
                            <span className="min-w-0 flex-1 leading-snug">{alt.texto}</span>
                          </span>
                          {expandedAlt === alt.letra ? (
                            <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                        </div>
                        {expandedAlt === alt.letra && (
                          <div className="animate-fade-in px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                            {question.explicacoes[alt.letra as keyof typeof question.explicacoes]}
                          </div>
                        )}
                      </button>
                    ))}
                </div>

                {/* Tags + Stats */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                  <div className="flex flex-wrap gap-1.5">
                    {[question.disciplina, question.tema, question.subtema].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-mono-stats">{question.estatistica}%</span> dos estudantes acertaram
                  </div>
                </div>

                {/* Next button */}
                <button
                  onClick={handleNext}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-gold-hover hover:shadow-gold/30"
                >
                  Próxima Questão
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            </>
          )}

          {/* Keyboard hints */}
          <div className="flex items-center justify-center gap-4 pb-8 text-[10px] text-muted-foreground/50">
            <span><kbd className="rounded border border-border px-1 font-mono-stats">1-5</kbd> selecionar</span>
            <span><kbd className="rounded border border-border px-1 font-mono-stats">Enter</kbd> confirmar</span>
            <span><kbd className="rounded border border-border px-1 font-mono-stats">←</kbd> anterior</span>
            <span><kbd className="rounded border border-border px-1 font-mono-stats">→</kbd> próxima</span>
            <span><kbd className="rounded border border-border px-1 font-mono-stats">B</kbd> bookmark</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

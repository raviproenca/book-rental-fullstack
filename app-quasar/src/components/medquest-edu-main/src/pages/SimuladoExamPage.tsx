import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Clock, Play, Pause, Flag, ArrowLeft, ArrowRight, X, AlertTriangle, Brain, BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSimuladoDisciplinas } from "@/hooks/useQuestions";
import { generateSimuladoQuestions } from "@/services/questions";
import { saveSimuladoSession } from "@/services/simulados";
import { ExamSidebar } from "@/components/simulado/ExamSidebar";
import type { QState } from "@/components/simulado/ExamSidebar";
import { formatTime } from "@/lib/simuladoUtils";
import { DashboardSkeleton } from "@/components/Skeletons";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { SimuladoQuestion, SimuladoExamConfig } from "@/types";

export default function SimuladoExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: disciplinasData, isLoading: isDiscsLoading } = useSimuladoDisciplinas();

  const config = location.state as SimuladoExamConfig | null;

  // Guard: redirect if arrived without config state
  useEffect(() => {
    if (!config) navigate("/simulados/novo", { replace: true });
  }, [config, navigate]);

  const [questions, setQuestions] = useState<SimuladoQuestion[]>([]);
  const [states, setStates] = useState<QState[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState<"loading" | "exam" | "saving">("loading");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNavSheet, setShowNavSheet] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load questions on mount
  useEffect(() => {
    if (!config || !disciplinasData) return;
    const temas = disciplinasData[config.disciplina] ?? [];
    if (temas.length === 0) { navigate("/simulados/novo", { replace: true }); return; }

    generateSimuladoQuestions(config.questionCount, temas).then((qs) => {
      if (qs.length === 0) { navigate("/simulados/novo", { replace: true }); return; }
      setQuestions(qs);
      setStates(qs.map(() => ({ answered: null, flagged: false })));
      setTimeLeft(config.durationSeconds);
      setTotalTime(config.durationSeconds);
      setPhase("exam");
    });
  }, [config, disciplinasData, navigate]);

  // Timer
  useEffect(() => {
    if (phase !== "exam" || paused) return;
    if (timeLeft <= 0) { handleFinish(); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, paused, phase]);

  const selectAnswer = (letra: string) => {
    setStates((prev) => {
      const copy = [...prev];
      copy[currentIdx] = { ...copy[currentIdx], answered: letra };
      return copy;
    });
  };

  const toggleFlag = () => {
    setStates((prev) => {
      const copy = [...prev];
      copy[currentIdx] = { ...copy[currentIdx], flagged: !copy[currentIdx].flagged };
      return copy;
    });
  };

  const handleFinish = useCallback(async () => {
    if (saving || !config || !user) return;
    setSaving(true);
    setShowConfirm(false);
    setPhase("saving");

    const answersMap: Record<string, string> = {};
    questions.forEach((q, i) => {
      if (states[i].answered) answersMap[String(q.dbId)] = states[i].answered!;
    });

    const correct = questions.filter((q, i) => states[i].answered === q.correta).length;
    const wrong = questions.filter((q, i) => states[i].answered && states[i].answered !== q.correta).length;
    const blank = questions.filter((_, i) => !states[i].answered).length;
    const score = Math.round((correct / questions.length) * 100);

    try {
      const session = await saveSimuladoSession({
        userId: user.id,
        disciplina: config.disciplina,
        questionIds: questions.map((q) => q.dbId),
        answers: answersMap,
        score,
        correct,
        wrong,
        blank,
        timeUsedSec: totalTime - timeLeft,
      });
      navigate(`/simulados/${session.id}`, { replace: true });
    } catch {
      navigate("/simulados", { replace: true });
    }
  }, [saving, config, user, questions, states, totalTime, timeLeft, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    if (phase !== "exam") return;
    const handler = (e: KeyboardEvent) => {
      if (showConfirm) return;
      if (e.key >= "1" && e.key <= "5") {
        const idx = parseInt(e.key) - 1;
        if (questions[currentIdx]?.alternativas[idx])
          selectAnswer(questions[currentIdx].alternativas[idx].letra);
      }
      if (e.key === "ArrowRight") setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
      if (e.key === "ArrowLeft") setCurrentIdx((i) => Math.max(0, i - 1));
      if (e.key.toLowerCase() === "f") toggleFlag();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIdx, showConfirm, questions]);

  if (isDiscsLoading || phase === "loading") return <DashboardSkeleton />;

  if (phase === "saving") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-gold" />
          <p className="text-sm font-semibold text-foreground">Salvando resultado...</p>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  const st = states[currentIdx];
  const isLowTime = timeLeft <= 300;
  const answered = states.filter((s) => s.answered).length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-[52px] items-center justify-between border-b border-border bg-background/90 px-4 md:px-6 backdrop-blur-md">
        {/* Left: brand + context */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-muted">
            <Brain className="h-3.5 w-3.5 text-gold" />
          </div>
          <span className="hidden text-sm font-black text-foreground md:inline">
            MED<span className="text-gold">QUEST</span>
          </span>
          <span className="hidden text-muted-foreground/40 md:inline">|</span>
          <span className="hidden text-xs text-muted-foreground md:inline">{config?.disciplina}</span>
          <span className="rounded border border-border bg-secondary px-2 py-0.5 font-mono-stats text-[10px] text-muted-foreground">
            {currentIdx + 1}/{questions.length}
          </span>
        </div>

        {/* Center: timer */}
        <div className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all",
          isLowTime ? "animate-pulse border-destructive/40 bg-destructive/10" : "border-border bg-card"
        )}>
          <span className={cn("h-2 w-2 rounded-full", isLowTime ? "bg-destructive" : "bg-success")} />
          <Clock className={cn("h-3.5 w-3.5", isLowTime ? "text-destructive" : "text-muted-foreground")} />
          <span className={cn("font-mono-stats text-base font-black tracking-wide", isLowTime ? "text-destructive" : "text-foreground")}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{paused ? "Retomar" : "Pausar"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-xs font-medium text-destructive"
          >
            <X className="h-3.5 w-3.5 md:hidden" />
            <span className="hidden md:inline">Encerrar</span>
          </button>
        </div>
      </header>

      {/* Pause overlay */}
      {paused && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="text-center">
            <Pause className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">Simulado Pausado</h2>
            <p className="mt-1 text-sm text-muted-foreground">O timer está congelado</p>
            <button
              type="button"
              onClick={() => setPaused(false)}
              className="mt-6 rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-background shadow-lg shadow-gold/20 hover:bg-gold-hover"
            >
              Retomar Simulado
            </button>
          </div>
        </div>
      )}

      {/* Main content + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6 md:py-8 pb-24 md:pb-8">
          <div className="mx-auto max-w-[820px] w-full" key={currentIdx}>
            {/* Top progress bar */}
            <div className="h-0.5 bg-secondary rounded-full mb-6">
              <div
                className="h-full bg-gold rounded-full transition-all duration-500"
                style={{ width: `${(answered / questions.length) * 100}%` }}
              />
            </div>

            {/* Tema badge */}
            <div className="flex items-center gap-1.5 mb-3">
              <BookOpen className="h-3 w-3 text-gold" />
              <span className="text-[11px] font-semibold text-gold">{q.tema}</span>
            </div>

            {/* Enunciado */}
            <div className="relative mb-6 rounded-xl rounded-l-none rounded-r-xl border border-border border-l-[3px] border-l-gold bg-card px-5 py-5 md:px-6 shadow-sm">
              <span className="absolute top-3 right-4 text-[10px] font-mono-stats text-muted-foreground/50 font-black">
                {currentIdx + 1}
              </span>
              <p className="text-sm leading-[1.8] text-foreground md:text-[15px]">{q.enunciado}</p>
            </div>

            {/* Alternativas */}
            <div className="space-y-2.5">
              {q.alternativas.map((alt) => {
                const selected = st.answered === alt.letra;
                return (
                  <button
                    key={alt.letra}
                    type="button"
                    onClick={() => selectAnswer(alt.letra)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-150 min-h-[44px] md:px-4 md:py-3.5",
                      selected ? "border-gold/50 bg-gold-muted" : "border-border bg-card hover:border-gold/20 hover:bg-accent/40"
                    )}
                  >
                    <span className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono-stats text-xs font-bold transition-colors",
                      selected ? "border-gold/50 bg-gold/15 text-gold" : "border-border bg-secondary text-muted-foreground"
                    )}>
                      {alt.letra}
                    </span>
                    <span className="pt-0.5 text-sm leading-relaxed text-foreground">{alt.texto}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom nav */}
            <div className="mt-6 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={toggleFlag}
                className={cn(
                  "h-9 w-9 flex items-center justify-center rounded-lg border transition-colors",
                  st.flagged ? "border-warning/40 bg-warning/10 text-warning" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Flag className={cn("h-3.5 w-3.5", st.flagged && "fill-current")} />
              </button>

              {/* Mobile: open nav sheet */}
              <button
                type="button"
                onClick={() => setShowNavSheet(true)}
                className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground lg:hidden"
              >
                {answered}/{questions.length}
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                  className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground disabled:opacity-30 hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden md:inline">Anterior</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={currentIdx === questions.length - 1}
                  className={cn(
                    "flex min-h-[44px] items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-30 transition-colors",
                    st.answered ? "text-gold hover:text-gold/80 font-bold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="hidden md:inline">Próxima</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <ExamSidebar
          states={states}
          currentIdx={currentIdx}
          onGoTo={setCurrentIdx}
          onFinish={() => setShowConfirm(true)}
        />
      </div>

      {/* Mobile bottom sheet */}
      <Drawer open={showNavSheet} onOpenChange={setShowNavSheet}>
        <DrawerContent className="max-h-[70vh] lg:hidden">
          <DrawerTitle className="sr-only">Navegação de questões</DrawerTitle>
          <div className="overflow-y-auto p-4" style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {states.map((s, i) => {
                const isCurrent = i === currentIdx;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setCurrentIdx(i); setShowNavSheet(false); }}
                    className={cn(
                      "flex h-11 w-full items-center justify-center rounded-lg border font-mono-stats text-xs font-semibold relative",
                      isCurrent ? "bg-white text-black ring-2 ring-gold" : s.answered ? "bg-gold text-background border-gold/30" : "border-border bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    {i + 1}
                    {s.flagged && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-warning border-2 border-background" />}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => { setShowNavSheet(false); setShowConfirm(true); }}
              className="h-12 w-full rounded-xl bg-gold text-sm font-bold text-background shadow-lg shadow-gold/20"
            >
              Finalizar Simulado
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Finalizar simulado?</h2>
            </div>
            <div className="mb-6 space-y-2 rounded-lg border border-border bg-secondary/30 p-4">
              {[
                { label: "Respondidas", value: `${answered}/${questions.length}`, color: "text-foreground" },
                { label: "Não respondidas", value: String(questions.length - answered), color: "text-warning" },
                { label: "Marcadas", value: String(states.filter((s) => s.flagged).length), color: "text-foreground" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-mono-stats font-semibold", color)}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-border bg-secondary py-2.5 text-sm font-medium text-foreground hover:bg-accent">
                Revisar Pendentes
              </button>
              <button type="button" onClick={handleFinish}
                className="flex-1 rounded-xl bg-gold py-2.5 text-sm font-bold text-background shadow-lg shadow-gold/20 hover:bg-gold-hover">
                Finalizar Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

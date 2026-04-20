import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Timer, Play } from "lucide-react";
import { useSimuladoDisciplinas } from "@/hooks/useQuestions";
import { useSimuladoHistory } from "@/hooks/useSimuladoHistory";
import { secondsToHumanShort } from "@/lib/simuladoUtils";
import { DashboardSkeleton } from "@/components/Skeletons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SimuladoExamConfig } from "@/types";

const QUESTION_PRESETS = [20, 30, 50] as const;
const TIME_PRESETS = [
  { label: "45 min", sec: 45 * 60 },
  { label: "1h", sec: 60 * 60 },
  { label: "1h30", sec: 90 * 60 },
  { label: "2h", sec: 120 * 60 },
] as const;
const MIN_Q = 5; const MAX_Q = 100;
const MIN_DUR_MIN = 5; const MAX_DUR_MIN = 360;

function autoTime(n: number) { return n * 3 * 60; }

export default function SimuladoConfigPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: disciplinasData, isLoading } = useSimuladoDisciplinas();
  const { data: history } = useSimuladoHistory();

  // Pre-select discipline if arriving from "Refazer" button
  const preselected = (location.state as { disciplina?: string } | null)?.disciplina ?? "";

  const [selectedDisc, setSelectedDisc] = useState(preselected);
  const [questionCount, setQuestionCount] = useState(30);
  const [durationSeconds, setDurationSeconds] = useState(autoTime(30));
  const [autoMode, setAutoMode] = useState(true);

  // Sync auto-time with question count
  useEffect(() => {
    if (autoMode) setDurationSeconds(autoTime(questionCount));
  }, [questionCount, autoMode]);

  // Default to first discipline if none preselected
  useEffect(() => {
    if (!selectedDisc && disciplinasData) {
      const keys = Object.keys(disciplinasData);
      if (keys.length > 0) setSelectedDisc(keys[0]);
    }
  }, [disciplinasData, selectedDisc]);

  if (isLoading || !disciplinasData) return <DashboardSkeleton />;

  const allDiscs = Object.keys(disciplinasData);
  const temas = selectedDisc ? disciplinasData[selectedDisc] ?? [] : [];
  const canStart = !!selectedDisc && temas.length > 0 && questionCount >= MIN_Q && questionCount <= MAX_Q;

  // Last simulado in this discipline for the hint panel
  const lastForDisc = history?.find((s) => s.disciplina === selectedDisc);

  const handleStart = () => {
    if (!canStart) return;
    const config: SimuladoExamConfig = { disciplina: selectedDisc, questionCount, durationSeconds };
    navigate("/simulados/ativo", { state: config });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-12 items-center gap-3 border-b border-border bg-background/90 px-6 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate("/simulados")}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Simulados
        </button>
        <span className="text-muted-foreground/40">|</span>
        <span className="text-sm font-bold text-foreground">Novo Simulado</span>
      </header>

      {/* Two-panel layout */}
      <div className="flex-1 grid lg:grid-cols-[1fr_340px] min-h-0">

        {/* LEFT: Config options */}
        <div className="overflow-y-auto px-6 py-8 space-y-8 border-r border-border">

          {/* Discipline */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disciplina</h2>
            <div className="flex flex-wrap gap-2">
              {allDiscs.map((name) => {
                const active = selectedDisc === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedDisc(name)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-all",
                      active
                        ? "border-gold/50 bg-gold-muted text-foreground font-semibold shadow-sm shadow-gold/10"
                        : "border-border bg-card text-muted-foreground hover:border-gold/20 hover:text-foreground"
                    )}
                  >
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
                    {name}
                  </button>
                );
              })}
            </div>
            {selectedDisc && (
              <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
                {(disciplinasData[selectedDisc] ?? []).length > 0
                  ? `${temas.length} temas disponíveis${lastForDisc ? ` · Último simulado: ${lastForDisc.score}%` : ""}`
                  : "Nenhum tema disponível"}
              </p>
            )}
          </section>

          {/* Question count */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Número de questões</h2>
            <div className="grid grid-cols-3 gap-3">
              {QUESTION_PRESETS.map((n) => {
                const active = questionCount === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuestionCount(n)}
                    className={cn(
                      "rounded-xl border p-5 text-center transition-all",
                      active ? "border-gold/40 bg-gold-muted" : "border-border bg-card hover:border-gold/20 hover:bg-accent/30"
                    )}
                  >
                    <span className={cn("font-mono-stats text-3xl font-black block", active ? "text-gold" : "text-foreground")}>{n}</span>
                    <span className="text-xs text-muted-foreground mt-1 block">questões</span>
                    <span className={cn("flex items-center justify-center gap-1 font-mono-stats text-[10px] mt-1", active ? "text-gold" : "text-muted-foreground/60")}>
                      <Timer className="h-3 w-3" />
                      {secondsToHumanShort(autoTime(n))}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Personalizar ({MIN_Q}–{MAX_Q})</p>
              <Input
                type="number"
                min={MIN_Q}
                max={MAX_Q}
                value={questionCount}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (!isNaN(n)) setQuestionCount(Math.min(MAX_Q, Math.max(MIN_Q, n)));
                }}
                className="max-w-[160px] font-mono-stats"
              />
            </div>
          </section>

          {/* Duration */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tempo</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={cn("h-5 w-9 rounded-full transition-colors relative", autoMode ? "bg-gold" : "bg-muted")}
                  onClick={() => setAutoMode((v) => !v)}
                >
                  <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform", autoMode ? "translate-x-4" : "translate-x-0.5")} />
                </div>
                <span className={cn("text-xs font-medium", autoMode ? "text-gold" : "text-muted-foreground")}>
                  Auto (3 min/questão)
                </span>
              </label>
            </div>
            <div className={cn("flex flex-wrap gap-2 transition-opacity", autoMode ? "opacity-40 pointer-events-none" : "")}>
              {TIME_PRESETS.map(({ label, sec }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setDurationSeconds(sec); setAutoMode(false); }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-all",
                    !autoMode && durationSeconds === sec
                      ? "border-gold/40 bg-gold-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-gold/20"
                  )}
                >
                  {label}
                </button>
              ))}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">min:</span>
                <Input
                  type="number"
                  min={MIN_DUR_MIN}
                  max={MAX_DUR_MIN}
                  value={Math.round(durationSeconds / 60)}
                  disabled={autoMode}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!isNaN(n)) {
                      setDurationSeconds(Math.min(MAX_DUR_MIN, Math.max(MIN_DUR_MIN, n)) * 60);
                      setAutoMode(false);
                    }
                  }}
                  className="w-20 font-mono-stats disabled:opacity-40"
                />
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT: Live summary */}
        <div className="hidden lg:flex flex-col px-6 py-8 bg-background gap-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resumo</h3>

          {selectedDisc ? (
            <>
              <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4">
                <div>
                  <p className="text-xl font-black text-foreground">{selectedDisc}</p>
                  <p className="text-xs text-muted-foreground mt-1">{temas.length} temas disponíveis</p>
                </div>
                <div className="[&>*+*]:border-t [&>*+*]:border-dashed [&>*+*]:border-border/60">
                  {[
                    { label: "Questões", value: String(questionCount) },
                    { label: "Tempo", value: secondsToHumanShort(durationSeconds) },
                    { label: "Ritmo", value: `${Math.round(durationSeconds / questionCount / 60)} min / questão` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-3">
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</span>
                      <span className="text-base font-black text-foreground font-mono-stats">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all"
                    style={{ width: `${Math.min(100, (durationSeconds / (MAX_DUR_MIN * 60)) * 100)}%` }}
                  />
                </div>
              </div>

              {lastForDisc && (
                <div className="rounded-xl border border-success/20 bg-success/5 p-4 space-y-1">
                  <p className="text-[10px] font-semibold text-success">Último simulado nesta disciplina</p>
                  <p className="text-xs text-muted-foreground">
                    {lastForDisc.score}% · {lastForDisc.questionIds.length} questões
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione uma disciplina para ver o resumo.</p>
          )}

          <div className="mt-auto space-y-2">
            <button
              type="button"
              disabled={!canStart}
              onClick={handleStart}
              className={cn(
                "flex w-full h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-lg transition-all",
                canStart
                  ? "bg-gold text-background shadow-gold/20 hover:bg-gold-hover"
                  : "cursor-not-allowed bg-muted text-muted-foreground opacity-60 shadow-none"
              )}
            >
              <Play className="h-4 w-4" />
              Iniciar Simulado
            </button>
            <p className="text-center text-[10px] text-muted-foreground">
              Questões selecionadas aleatoriamente dos temas da disciplina
            </p>
          </div>
        </div>

      </div>

      {/* Mobile CTA (below config) */}
      <div className="lg:hidden sticky bottom-0 border-t border-border bg-background p-4">
        <button
          type="button"
          disabled={!canStart}
          onClick={handleStart}
          className={cn(
            "flex w-full h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-lg",
            canStart ? "bg-gold text-background" : "cursor-not-allowed bg-muted text-muted-foreground opacity-60"
          )}
        >
          <Play className="h-4 w-4" />
          Iniciar Simulado · {selectedDisc && `${selectedDisc} · `}{questionCount}q · {secondsToHumanShort(durationSeconds)}
        </button>
      </div>
    </div>
  );
}

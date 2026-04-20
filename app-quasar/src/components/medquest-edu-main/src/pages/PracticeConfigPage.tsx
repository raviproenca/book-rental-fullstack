import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Timer,
  RotateCcw,
  Play,
  Zap,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDisciplines } from "@/hooks/useQuestions";
import { DashboardSkeleton } from "@/components/Skeletons";
import type { PracticeConfig } from "@/types";

const modes = [
  { id: "livre", label: "Estudo Livre", icon: BookOpen, desc: "Pratique no seu ritmo, sem timer" },
  { id: "simulado", label: "Simulado", icon: Timer, desc: "Cronometrado, simula condições de prova" },
  { id: "revisao", label: "Revisão de Erros", icon: RotateCcw, desc: "Refaça questões que você errou" },
];

const dificuldades = ["Fácil", "Médio", "Difícil"];
const statusOptions = [
  { id: "todas", label: "Todas" },
  { id: "nao_respondidas", label: "Não respondidas" },
  { id: "erradas", label: "Erradas anteriormente" },
  { id: "acertadas", label: "Acertadas" },
];

export default function PracticeConfigPage() {
  const navigate = useNavigate();
  const { data: disciplinasData = {}, isLoading } = useDisciplines();
  const [mode, setMode] = useState("livre");
  const [selectedDiscs, setSelectedDiscs] = useState<string[]>([]);
  const [selectedTemas, setSelectedTemas] = useState<Record<string, string[]>>({});
  const [expandedDisc, setExpandedDisc] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [status, setStatus] = useState("todas");
  const [numQuestions, setNumQuestions] = useState(20);

  if (isLoading) return <DashboardSkeleton />;

  const allDiscs = Object.keys(disciplinasData);

  const toggleDisc = (name: string) => {
    setSelectedDiscs((prev) =>
      prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]
    );
    if (!selectedDiscs.includes(name)) {
      setExpandedDisc(name);
    }
  };

  const selectAllDiscs = () => {
    if (selectedDiscs.length === allDiscs.length) setSelectedDiscs([]);
    else setSelectedDiscs([...allDiscs]);
  };

  const toggleTema = (disc: string, tema: string) => {
    setSelectedTemas((prev) => {
      const current = prev[disc] || [];
      return {
        ...prev,
        [disc]: current.includes(tema) ? current.filter((t) => t !== tema) : [...current, tema],
      };
    });
  };

  const toggleDiff = (d: string) => {
    setDifficulties((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const handleStart = (overrides?: Partial<PracticeConfig>) => {
    const config: PracticeConfig = {
      mode,
      disciplinas: selectedDiscs,
      temas: selectedTemas,
      dificuldades: difficulties,
      status,
      numQuestions,
      ...overrides,
    };
    navigate("/praticar/sessao", { state: { config } });
  };

  /* Summary text */
  const totalTemas = Object.values(selectedTemas).flat();
  const summaryDiscs = selectedDiscs.length === 0
    ? "Todas as disciplinas"
    : selectedDiscs.length <= 2
      ? selectedDiscs.join(", ")
      : `${selectedDiscs.length} disciplinas`;
  const summaryTemas = totalTemas.length > 0
    ? ` (${totalTemas.length <= 2 ? totalTemas.join(", ") : `${totalTemas.length} temas`})`
    : "";
  const summaryDiff = difficulties.length === 0 || difficulties.length === 3
    ? "Todas"
    : difficulties.join(", ");
  const summaryMode = modes.find((m) => m.id === mode)?.label || "";

  return (
    <div className="mx-auto max-w-[900px] animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nova Sessão de Estudo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure sua prática e comece a resolver</p>
      </div>

      {/* ── Section 1: Mode ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Modo de Estudo
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {modes.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-5 text-center transition-all duration-200",
                  active
                    ? "border-gold/40 bg-gold-muted shadow-lg shadow-gold/[0.06]"
                    : "border-border bg-card hover:border-gold/15 hover:bg-accent/30"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  active ? "bg-gold/15" : "bg-secondary"
                )}>
                  <m.icon className={cn("h-5 w-5", active ? "text-gold" : "text-muted-foreground")} />
                </div>
                <p className="text-sm font-semibold text-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Disciplines ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Disciplinas
          </h2>
          <button
            onClick={selectAllDiscs}
            className="text-xs font-medium text-gold transition-colors hover:text-gold-hover"
          >
            {selectedDiscs.length === allDiscs.length ? "Desmarcar todas" : "Selecionar todas"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {allDiscs.map((name) => {
            const active = selectedDiscs.includes(name);
            return (
              <button
                key={name}
                onClick={() => toggleDisc(name)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all duration-200",
                  active
                    ? "border-gold/40 bg-gold-muted text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-gold/15 hover:text-foreground"
                )}
              >
                {name}
                <span className={cn(
                  "font-mono-stats text-[10px]",
                  active ? "text-gold" : "text-muted-foreground/60"
                )}>
                  ({disciplinasData[name].count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Themes ── */}
      {selectedDiscs.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Temas
          </h2>
          <div className="space-y-2">
            {selectedDiscs.map((disc) => {
              const expanded = expandedDisc === disc;
              const temas = disciplinasData[disc].temas;
              const selectedCount = (selectedTemas[disc] || []).length;
              return (
                <div key={disc} className="rounded-xl border border-border bg-card">
                  <button
                    onClick={() => setExpandedDisc(expanded ? null : disc)}
                    className="flex w-full items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{disc}</span>
                      {selectedCount > 0 && (
                        <span className="rounded-full bg-gold-muted px-2 py-0.5 font-mono-stats text-[10px] font-medium text-gold">
                          {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {expanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {expanded && (
                    <div className="animate-fade-in border-t border-border px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {temas.map((tema) => {
                          const tActive = (selectedTemas[disc] || []).includes(tema);
                          return (
                            <button
                              key={tema}
                              onClick={() => toggleTema(disc, tema)}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-xs transition-all duration-200",
                                tActive
                                  ? "border-gold/40 bg-gold-muted text-foreground"
                                  : "border-border bg-secondary/50 text-muted-foreground hover:border-gold/15 hover:text-foreground"
                              )}
                            >
                              {tema}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section 4: Advanced Filters ── */}
      <div className="rounded-xl border border-border bg-card">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex w-full items-center justify-between px-5 py-4"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtros avançados</span>
          </div>
          {showFilters ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {showFilters && (
          <div className="animate-fade-in space-y-5 border-t border-border px-5 pb-5 pt-4">
            {/* Difficulty */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">Dificuldade</label>
              <div className="flex gap-2">
                {dificuldades.map((d) => {
                  const active = difficulties.includes(d);
                  const colorMap: Record<string, string> = {
                    Fácil: active ? "border-success/40 bg-success/10 text-success" : "",
                    Médio: active ? "border-warning/40 bg-warning/10 text-warning" : "",
                    Difícil: active ? "border-destructive/40 bg-destructive/10 text-destructive" : "",
                  };
                  return (
                    <button
                      key={d}
                      onClick={() => toggleDiff(d)}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm transition-all duration-200",
                        active
                          ? colorMap[d]
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatus(s.id)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-all duration-200",
                      status === s.id
                        ? "border-gold/40 bg-gold-muted text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of questions */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Número de questões
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-gold [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold"
                />
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.min(50, Math.max(5, Number(e.target.value))))}
                  className="h-9 w-16 rounded-lg border border-border bg-secondary/50 text-center font-mono-stats text-sm text-foreground outline-none focus:border-gold/50"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 5: Summary + Start ── */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-sm text-foreground">
            <span className="font-mono-stats font-bold text-gold">{numQuestions}</span> questões de{" "}
            <span className="font-medium">{summaryDiscs}</span>
            {summaryTemas} •{" "}
            Dificuldade: <span className="font-medium">{summaryDiff}</span> •{" "}
            Modo: <span className="font-medium">{summaryMode}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => handleStart()}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-gold-hover hover:shadow-gold/30"
          >
            <Play className="h-4 w-4" />
            Iniciar Sessão
          </button>
          <button
            onClick={() => handleStart({ mode: "livre", numQuestions: 10 })}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Zap className="h-4 w-4 text-gold" />
            Prática Rápida (10 questões)
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Flame,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Heart,
  Microscope,
  Pill,
  Stethoscope,
  Syringe,
  Baby,
  BookOpen,
  Activity,
  Bug,
  Beaker,
  BrainCircuit,
  Scissors,
  Users,
  Shield,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/services/user";
import { customToast } from "@/components/CustomToast";
import { isProfileComplete } from "@/lib/profileCompletion";
import { FacultySelect } from "@/components/onboarding/FacultySelect";
import {
  META_QUESTOES_DIARIAS_MAX,
  META_QUESTOES_DIARIAS_MIN,
} from "@/lib/metaDiaria";

const objetivos = [
  "Ir bem nas provas do semestre",
  "Me preparar para internato",
  "Revisar conteúdo passado",
  "Explorar tudo",
];

const disciplinas = [
  { name: "Anatomia", icon: Activity },
  { name: "Fisiologia", icon: Heart },
  { name: "Bioquímica", icon: Beaker },
  { name: "Farmacologia", icon: Pill },
  { name: "Patologia", icon: Microscope },
  { name: "Microbiologia", icon: Bug },
  { name: "Parasitologia", icon: Shield },
  { name: "Semiologia", icon: Stethoscope },
  { name: "Clínica Médica", icon: BookOpen },
  { name: "Cirurgia", icon: Scissors },
  { name: "Pediatria", icon: Baby },
  { name: "Ginecologia", icon: Users },
  { name: "Saúde Coletiva", icon: BrainCircuit },
  { name: "Psiquiatria", icon: Brain },
];

const metas = [
  {
    label: "Iniciante",
    questoes: 10,
    tempo: "~10 min/dia",
    intensity: 1,
    cardHint: "Bom para manter o hábito",
  },
  {
    label: "Regular",
    questoes: 20,
    tempo: "~20 min/dia",
    intensity: 2,
    cardHint: "Ritmo sustentável",
  },
  {
    label: "Dedicado",
    questoes: 30,
    tempo: "~30 min/dia",
    intensity: 3,
    cardHint: "Bloco firme no dia",
  },
  {
    label: "Intenso",
    questoes: 50,
    tempo: "~50 min/dia",
    intensity: 4,
    cardHint: "Pré-prova / dia mais livre",
  },
];

function metaDiariaHintForObjetivo(objetivo: string): string | null {
  switch (objetivo) {
    case "Ir bem nas provas do semestre":
      return "Para o semestre, um ritmo estável costuma valer mais que picos só perto da prova.";
    case "Me preparar para internato":
      return "No internato, raciocínio clínico vem com repetição constante — comece no que dá para sustentar.";
    case "Revisar conteúdo passado":
      return "Na revisão, menos questões com leitura das explicações costuma fixar mais que volume na correria.";
    case "Explorar tudo":
      return "Para conhecer a plataforma, uma meta menor ajuda a não abandonar nos dias cheios.";
    default:
      return null;
  }
}

/* ─── Custom Select (Radix — cross-platform styling) ─── */
function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "h-11 w-full rounded-lg border bg-secondary/50 px-4 text-sm text-foreground transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20",
            error ? "border-destructive" : "border-border",
            !value && "text-muted-foreground"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[280px] rounded-lg border border-border bg-card shadow-xl">
          {options.map((o) => (
            <SelectItem
              key={o}
              value={o}
              className="cursor-pointer rounded-md text-sm text-foreground focus:bg-gold/10 focus:text-foreground"
            >
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ─── Success mark (onboarding complete) ─── */
function CelebrationIcon() {
  return (
    <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
      <div
        className="pointer-events-none absolute inset-0 scale-110 rounded-full bg-gold/[0.14] blur-xl"
        aria-hidden
      />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/25 via-gold/12 to-gold/5 shadow-lg shadow-gold/20 ring-1 ring-inset ring-gold/30">
        <CheckCircle2 className="h-9 w-9 text-gold" strokeWidth={2} />
      </div>
    </div>
  );
}

const choiceBtnFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card";

/* ─── Main ─── */
export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [finishLoading, setFinishLoading] = useState(false);

  const [data, setData] = useState({
    faculdade: "",
    periodo: "",
    objetivo: "",
    disciplinas: [] as string[],
    /** Preset label from `metas`, or null when using custom count. */
    metaPresetLabel: null as string | null,
    metaCustomQuestoes: "",
  });

  const set = (key: keyof typeof data, value: (typeof data)[keyof typeof data]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const resolveDailyQuestoes = (): number | null => {
    if (data.metaPresetLabel) {
      const m = metas.find((x) => x.label === data.metaPresetLabel);
      return m ? m.questoes : null;
    }
    const n = parseInt(data.metaCustomQuestoes, 10);
    if (
      Number.isFinite(n) &&
      n >= META_QUESTOES_DIARIAS_MIN &&
      n <= META_QUESTOES_DIARIAS_MAX
    ) {
      return n;
    }
    return null;
  };

  const metaRecapLabel = (): string => {
    const n = resolveDailyQuestoes();
    if (n == null) return "—";
    if (data.metaPresetLabel) {
      return `${data.metaPresetLabel} (${n} questões)`;
    }
    return `Personalizada (${n} questões)`;
  };

  useEffect(() => {
    if (authLoading) return;
    if (user && isProfileComplete(profile)) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, profile, navigate]);

  const handleFinish = async () => {
    if (!user) return;
    const metaName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name.trim()
        : "";
    const nome =
      profile?.nome?.trim() ||
      metaName ||
      (user.email?.split("@")[0] ?? "").trim() ||
      "Estudante";

    const metaQuestoes = resolveDailyQuestoes();
    if (metaQuestoes == null) {
      customToast.error({
        title: "Meta inválida",
        description: "Volte e escolha uma meta diária válida.",
      });
      return;
    }

    setFinishLoading(true);
    try {
      await updateProfile({
        nome,
        faculdade: data.faculdade.trim(),
        periodo: data.periodo,
        metaQuestoesDiarias: metaQuestoes,
      });
      await refreshProfile();
      customToast.success({
        title: "Perfil atualizado!",
        description: "Bons estudos.",
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      customToast.error({
        title: "Não foi possível salvar",
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setFinishLoading(false);
    }
  };

  const toggleDisciplina = (name: string) => {
    setData((prev) => ({
      ...prev,
      disciplinas: prev.disciplinas.includes(name)
        ? prev.disciplinas.filter((d) => d !== name)
        : [...prev.disciplinas, name],
    }));
  };

  const selectPresetMeta = (label: string) => {
    setData((prev) => ({
      ...prev,
      metaPresetLabel: label,
      metaCustomQuestoes: "",
    }));
  };

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!data.faculdade.trim()) e.faculdade = "Selecione sua faculdade";
      if (!data.periodo) e.periodo = "Selecione seu período";
      if (!data.objetivo) e.objetivo = "Selecione seu objetivo";
    }
    if (step === 1 && data.disciplinas.length === 0) {
      e.disciplinas = "Selecione pelo menos uma disciplina";
    }
    if (step === 2) {
      const q = resolveDailyQuestoes();
      if (q == null) {
        if (data.metaPresetLabel) {
          e.meta = "Selecione uma opção válida";
        } else if (data.metaCustomQuestoes.trim() === "") {
          e.meta = "Escolha uma meta sugerida ou informe outro valor (5–100)";
        } else {
          e.meta = `Informe um número entre ${META_QUESTOES_DIARIAS_MIN} e ${META_QUESTOES_DIARIAS_MAX}`;
        }
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const steps = ["Sobre Você", "Disciplinas", "Meta Diária", "Tudo Pronto"];

  const objetivoExtra = metaDiariaHintForObjetivo(data.objetivo);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[640px]">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <Brain className="h-6 w-6 text-gold" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            MED<span className="text-gold">QUEST</span>
          </span>
        </div>

        {/* Progress */}
        <div className="mb-2 flex items-center justify-between px-1">
          {steps.map((label, i) => (
            <span
              key={label}
              className={cn(
                "text-xs font-medium transition-colors",
                i <= step ? "text-gold" : "text-muted-foreground/50"
              )}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="mb-8 flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                i <= step ? "bg-gold" : "bg-border"
              )}
            />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <div
            key={step}
            className="animate-fade-in"
          >
            {/* ── Step 1: About You ── */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Vamos personalizar sua experiência</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Essas informações nos ajudam a recomendar o conteúdo certo.
                  </p>
                </div>

                <FacultySelect
                  label="Faculdade"
                  value={data.faculdade}
                  onChange={(v) => set("faculdade", v)}
                  placeholder="Selecione sua faculdade"
                  error={errors.faculdade}
                />
                <SelectField
                  label="Período atual"
                  value={data.periodo}
                  onChange={(v) => set("periodo", v)}
                  options={Array.from({ length: 12 }, (_, i) => `${i + 1}º semestre`)}
                  placeholder="Selecione o período"
                  error={errors.periodo}
                />
                <SelectField
                  label="Objetivo principal"
                  value={data.objetivo}
                  onChange={(v) => set("objetivo", v)}
                  options={objetivos}
                  placeholder="Qual seu foco agora?"
                  error={errors.objetivo}
                />
              </div>
            )}

            {/* ── Step 2: Disciplines ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Quais disciplinas você está cursando?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Selecione todas que se aplicam. Isso personaliza suas questões.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {disciplinas.map((d) => {
                    const selected = data.disciplinas.includes(d.name);
                    return (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => toggleDisciplina(d.name)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-200",
                          choiceBtnFocus,
                          selected
                            ? "border-gold border-2 bg-gold-muted text-foreground"
                            : "border-border bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/60"
                        )}
                      >
                        <d.icon className={cn("h-4 w-4 shrink-0", selected ? "text-gold" : "text-muted-foreground")} />
                        <span className="truncate">{d.name}</span>
                      </button>
                    );
                  })}
                </div>

                {errors.disciplinas && (
                  <p className="text-xs text-destructive">{errors.disciplinas}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Você pode mudar isso depois nas configurações.
                </p>
              </div>
            )}

            {/* ── Step 3: Daily Goal ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Meta diária em dias de estudo
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Defina uma meta realista — consistência importa mais que volume. Dias de plantão ou prova
                    sem resolver tudo são normais; o importante é voltar no ritmo quando der.
                  </p>
                  {objetivoExtra && (
                    <p className="mt-2 text-sm text-muted-foreground">{objetivoExtra}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {metas.map((m) => {
                    const selected = data.metaPresetLabel === m.label;
                    return (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => selectPresetMeta(m.label)}
                        aria-pressed={selected}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-5 text-center transition-all duration-200",
                          choiceBtnFocus,
                          selected
                            ? "border-2 border-gold/60 bg-gold-muted shadow-lg shadow-gold/[0.06]"
                            : "border-border bg-secondary/30 hover:border-border hover:bg-secondary/50"
                        )}
                      >
                        <div className="flex gap-0.5" aria-hidden>
                          {Array.from({ length: m.intensity }).map((_, i) => (
                            <Flame
                              key={i}
                              className={cn(
                                "h-4 w-4 transition-colors",
                                selected ? "text-gold" : "text-muted-foreground/50"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{m.label}</p>
                        <p className="font-mono-stats text-lg font-bold tabular-nums text-foreground">
                          {m.questoes}
                        </p>
                        <p className="text-xs text-muted-foreground">{m.tempo}</p>
                        <p className="text-[10px] leading-tight text-muted-foreground/90">{m.cardHint}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-border bg-secondary/20 p-4">
                  <label htmlFor="meta-custom" className="mb-2 block text-sm font-medium text-foreground">
                    Outro valor (questões por dia)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      id="meta-custom"
                      type="number"
                      inputMode="numeric"
                      min={META_QUESTOES_DIARIAS_MIN}
                      max={META_QUESTOES_DIARIAS_MAX}
                      placeholder={`${META_QUESTOES_DIARIAS_MIN}–${META_QUESTOES_DIARIAS_MAX}`}
                      value={data.metaCustomQuestoes}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          metaPresetLabel: null,
                          metaCustomQuestoes: e.target.value,
                        }))
                      }
                      className={cn(
                        "h-11 w-28 rounded-lg border bg-secondary/50 px-3 text-sm text-foreground outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20",
                        errors.meta && !data.metaPresetLabel ? "border-destructive" : "border-border"
                      )}
                    />
                    <span className="text-xs text-muted-foreground">
                      Use se você já tem rotina (ex.: banco + Anki) e sabe seu número.
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Os minutos são uma faixa aproximada de bloco ativo; ler comentários e anotar pode levar mais — e
                  isso faz parte do estudo.
                </p>

                {errors.meta && <p className="text-xs text-destructive">{errors.meta}</p>}
              </div>
            )}

            {/* ── Step 4: Done ── */}
            {step === 3 && (
              <div className="space-y-6 text-center">
                <CelebrationIcon />
                <div>
                  <h2 className="text-xl font-bold text-foreground">Sua conta está configurada!</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tudo pronto para começar sua jornada de estudos.
                  </p>
                </div>

                <div className="mx-auto w-full max-w-lg rounded-xl border border-border bg-secondary/30 p-4 text-left">
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm items-baseline">
                    <span className="text-muted-foreground">Objetivo</span>
                    <span className="min-w-0 text-right font-medium text-foreground break-words">
                      {data.objetivo || "—"}
                    </span>
                    <span className="text-muted-foreground">Faculdade</span>
                    <span className="min-w-0 text-right font-medium text-foreground break-words">
                      {data.faculdade}
                    </span>
                    <span className="text-muted-foreground">Período</span>
                    <span className="min-w-0 text-right font-medium text-foreground">{data.periodo}</span>
                    <span className="text-muted-foreground">Meta diária</span>
                    <span className="min-w-0 text-right font-medium text-foreground break-words">
                      {metaRecapLabel()}
                    </span>
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground">Disciplinas</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.disciplinas.map((d) => (
                        <span
                          key={d}
                          className="rounded-md border border-gold/25 bg-gold-muted px-2.5 py-1 text-xs font-medium text-gold"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Navigation ── */}
          <div
            className={cn(
              "mt-8 flex items-center",
              step === 3 ? "justify-center" : "justify-between"
            )}
          >
            {step !== 3 && (step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  choiceBtnFocus
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
            ) : (
              <div />
            ))}

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-gold-hover hover:shadow-gold/30",
                  choiceBtnFocus
                )}
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={finishLoading}
                className={cn(
                  "flex items-center gap-2 rounded-xl bg-gold px-8 py-3 text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-gold-hover hover:shadow-gold/30 disabled:opacity-50",
                  choiceBtnFocus
                )}
              >
                {finishLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Começar a Praticar
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

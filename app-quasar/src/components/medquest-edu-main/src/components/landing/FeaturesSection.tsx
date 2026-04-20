import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  Timer,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GridBackground } from "./shared";
import { GoldAuraCard } from "./GoldAuraCard";

const EASE = [0.25, 0.4, 0.25, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const glass =
  "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card/80 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.16] hover:shadow-[0_8px_40px_-12px]";

function IconBadge({
  icon: Icon,
  size = "sm",
}: {
  icon: React.ElementType;
  size?: "sm" | "lg";
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-light to-gold-hover shadow-lg shadow-gold/20",
        size === "lg" ? "h-10 w-10" : "h-8 w-8"
      )}
    >
      <Icon className={cn("text-black", size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
    </div>
  );
}

/** Demo alinhado ao fluxo pós-resposta da prática. */
function QuestionDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [expandedAlt, setExpandedAlt] = useState<string | null>("A");

  const DEMO_USER_LETTER = "A";
  const CORRECT_LETTER = "B";

  const explicacoes: Record<string, string> = {
    A: "Compressão radicular não explica fraqueza ascendente simétrica dias após gastroenterite: não há um nível único de medula/nervo raiz que produza esse padrão bilateral ‘simétrico’ como mecanismo principal; o quadro clássico é de polirradiculoneurite inflamatória periférica.",
    C: "Necrose isquêmica do corno anterior costuma ter contexto vascular ou outro padrão clínico; não explica o início ascendente simétrico pós-infecção gastrointestinal típico da polirradiculoneurite.",
  };

  const options = [
    {
      letter: "A",
      text: "Lesão direta no nervo motor somático por compressão radicular bilateral",
      correct: false,
    },
    {
      letter: "B",
      text: "Desmielinização dos axônios motores periféricos por deposição de imunocomplexos",
      correct: true,
    },
    {
      letter: "C",
      text: "Necrose isquêmica do corno anterior da medula espinhal torácica",
      correct: false,
    },
  ];

  type AltState = "correct" | "wrong" | "disabled";
  const getAltState = (letter: string, correct: boolean): AltState => {
    if (correct) return "correct";
    if (letter === DEMO_USER_LETTER) return "wrong";
    return "disabled";
  };

  const altStyles: Record<AltState, string> = {
    correct: "border-success/40 bg-success/[0.08]",
    wrong: "border-destructive/40 bg-destructive/[0.08]",
    disabled: "border-border/50 bg-card/50 opacity-60",
  };

  const letterStyles: Record<AltState, string> = {
    correct: "border-success/50 bg-success/15 text-success",
    wrong: "border-destructive/50 bg-destructive/15 text-destructive",
    disabled: "border-border/50 bg-secondary/50 text-muted-foreground/50",
  };

  const wrongAlternatives = options.filter((o) => o.letter !== CORRECT_LETTER);

  return (
    <div ref={ref} className="mt-6 space-y-2.5">
      {options.map((opt, i) => {
        const state = getAltState(opt.letter, opt.correct);
        return (
          <motion.div
            key={opt.letter}
            initial={{ opacity: 0, x: -14 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.2 + i * 0.13, ease: "easeOut" }}
            className={cn(
              "flex w-full cursor-default items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-200",
              altStyles[state],
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono-stats text-xs font-semibold transition-colors",
                letterStyles[state],
              )}
            >
              {state === "correct" ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.62, type: "spring", stiffness: 320 }}
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.span>
              ) : state === "wrong" ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.55, type: "spring", stiffness: 320 }}
                >
                  <X className="h-3.5 w-3.5" />
                </motion.span>
              ) : (
                opt.letter
              )}
            </span>
            <span
              className={cn(
                "pt-0.5 text-sm leading-relaxed",
                state === "disabled" ? "text-muted-foreground/60" : "text-foreground",
              )}
            >
              {opt.text}
            </span>
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.3, delay: 0.62, ease: "easeOut" }}
        className="space-y-6 rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-bold text-destructive">Resposta Incorreta ✗</p>
              <p className="text-xs text-muted-foreground">
                A resposta correta é{" "}
                <span className="font-semibold text-foreground">{CORRECT_LETTER}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-foreground">Explicação</h3>
          <p className="text-sm leading-relaxed text-foreground/90">
            A síndrome de Guillain-Barré resulta de desmielinização mediada por autoanticorpos gerados após
            infecção por <em>Campylobacter jejuni</em>, via mimetismo molecular com gangliocídeos GM1.
          </p>
        </div>

        <div className="space-y-2 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-foreground">Por que as outras estão erradas?</h3>
          {wrongAlternatives.map((alt) => (
            <button
              key={alt.letter}
              type="button"
              onClick={() => setExpandedAlt(expandedAlt === alt.letter ? null : alt.letter)}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-2.5 transition-colors hover:bg-secondary/60">
                <span className="flex min-w-0 flex-1 items-start gap-2 text-sm text-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono-stats text-[10px] font-semibold text-muted-foreground">
                    {alt.letter}
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">{alt.text}</span>
                </span>
                {expandedAlt === alt.letter ? (
                  <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
              {expandedAlt === alt.letter && (
                <div className="animate-fade-in px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {explicacoes[alt.letter]}
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}


function CardBancoQuestoes() {
  return (
    <GoldAuraCard
      variants={cardVariants}
      whileHover={{ scale: 1.01, transition: { duration: 0.2, ease: "easeOut" } }}
      className={cn(
        glass,
        "p-8 hover:shadow-gold/[0.12]",
        "md:col-span-2 lg:w-5/12 lg:min-w-0 lg:shrink-0"
      )}
      auraRadius={340}
      auraIntensity={0.16}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="absolute right-5 top-5 z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-gold-light">
          12.400+ questões
        </span>
      </div>
      <div className="relative z-10">
        <IconBadge icon={BookOpen} size="lg" />
        <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          Banco de Questões Comentadas
        </h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/55">
          Milhares de questões do ciclo básico ao clínico, com comentários detalhados por especialistas.
        </p>
        <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
          <div className="mb-2">
            <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold-light">
              Neurologia · Ciclo clínico
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-white/65">
            Paciente, 42 anos, apresenta fraqueza muscular progressiva ascendente há 10 dias após
            episódio de gastroenterite aguda. Qual o principal mecanismo fisiopatológico?
          </p>
        </div>
        <QuestionDemo />
      </div>
    </GoldAuraCard>
  );
}


const HEAT_LABELS: string[][] = [
  ["Dom, 17 Mar · —",    "Seg, 18 Mar · 5 q.",  "Ter, 19 Mar · 14 q.", "Qua, 20 Mar · 8 q.",  "Qui, 21 Mar · —",    "Sex, 22 Mar · —",    "Sáb, 23 Mar · 7 q."],
  ["Dom, 24 Mar · 6 q.", "Seg, 25 Mar · 18 q.", "Ter, 26 Mar · 24 q.", "Qua, 27 Mar · 12 q.", "Qui, 28 Mar · 7 q.", "Sex, 29 Mar · —",    "Sáb, 30 Mar · —"],
  ["Dom, 31 Mar · —",    "Seg, 01 Abr · 11 q.", "Ter, 02 Abr · 19 q.", "Qua, 03 Abr · 28 q.", "Qui, 04 Abr · 17 q.","Sex, 05 Abr · 6 q.", "Sáb, 06 Abr · —"],
  ["Dom, 07 Abr · 7 q.", "Seg, 08 Abr · 13 q.", "Ter, 09 Abr · 25 q.", "Qua, 10 Abr · 26 q.", "Qui, 11 Abr · 21 q.","Sex, 12 Abr · 9 q.", "Sáb, 13 Abr · 5 q."],
  ["Dom, 14 Abr · 10 q.","Seg, 15 Abr · 20 q.", "Ter, 16 Abr · 28 q.", "Qua, 17 Abr · 22 q.", "Qui, 18 Abr · —",    "Sex, 19 Abr · —",    "Sáb, 20 Abr · —"],
];

function HeatmapCalendar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const grid = [
    [0, 1, 2, 1, 0, 0, 1],
    [1, 3, 4, 2, 1, 0, 0],
    [0, 2, 3, 4, 3, 1, 0],
    [1, 2, 4, 4, 3, 2, 1],
    [2, 3, 4, 3, 2, 1, 0],
  ];
  const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
  const cellBg = (v: number) => {
    if (v === 0) return "bg-white/[0.04] border-white/[0.04]";
    if (v === 1) return "bg-gold/20 border-gold/10";
    if (v === 2) return "bg-gold/38 border-gold/20";
    if (v === 3) return "bg-gold/60 border-gold/30";
    return "bg-gold/85 border-gold-light/40";
  };
  const cellClass =
    "h-3 w-3 rounded-[3px] border transition-all duration-200 group-hover/cell:ring-1 group-hover/cell:ring-white/20 lg:h-[14px] lg:w-[14px] lg:rounded-[4px]";
  const labelColClass = "w-3 text-center text-[8px] font-medium tracking-wide text-white/25 lg:w-[14px] lg:text-[9px]";
  const rowGapClass = "gap-[3px] lg:gap-1";
  const legendSwatchClass =
    "h-2.5 w-2.5 rounded-[2px] border lg:h-3 lg:w-3 lg:rounded-[3px]";

  return (
    <div ref={ref} className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-6">
      <div className="shrink-0">
        <div className={cn("mb-1.5 flex", rowGapClass)}>
          {dayLabels.map((d, i) => (
            <div key={i} className={labelColClass}>
              {d}
            </div>
          ))}
        </div>
        <div className={cn("space-y-[3px] lg:space-y-1")}>
          {grid.map((week, wi) => (
            <div key={wi} className={cn("flex", rowGapClass)}>
              {week.map((v, di) => {
                const label = HEAT_LABELS[wi][di];
                const hasActivity = v > 0;
                return (
                  <div key={di} className="group/cell relative">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.22, delay: 0.04 + (wi * 7 + di) * 0.016, ease: "easeOut" }}
                      className={cn(cellClass, cellBg(v))}
                    />
                    {hasActivity && (
                      <div
                        className={cn(
                          "pointer-events-none absolute z-50 opacity-0 transition-opacity duration-150 group-hover/cell:opacity-100",
                          wi <= 1
                            ? "top-full left-1/2 mt-[5px] -translate-x-1/2"
                            : "bottom-full left-1/2 mb-[5px] -translate-x-1/2"
                        )}
                      >
                        <div className="whitespace-nowrap rounded-lg border border-white/12 bg-card px-2 py-1 text-[9px] leading-none text-white/70 shadow-xl backdrop-blur-sm">
                          {label}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-2 flex w-full items-center justify-between gap-1.5">
          <span className="shrink-0 text-[8px] text-white/25 lg:text-[9px]">Menos</span>
          <div className="flex flex-1 items-center justify-center gap-1">
            {[0, 1, 2, 3, 4].map((v) => (
              <div key={v} className={cn(legendSwatchClass, cellBg(v))} />
            ))}
          </div>
          <span className="shrink-0 text-[8px] text-white/25 lg:text-[9px]">Mais</span>
        </div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/35">Retenção estimada</p>
          <p className="mt-1 font-mono-stats text-3xl font-bold tabular-nums text-gold-light">92%</p>
          <p className="mt-3 text-[11px] leading-relaxed text-white/45">
            Sequência de <span className="font-medium text-white/70">12 dias</span> com revisões no prazo.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.75 }}
          className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"
        >
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          <span className="text-[11px] leading-snug text-white/60">
            Próxima revisão: <span className="font-medium text-white/85">Anatomia</span> · hoje
          </span>
        </motion.div>
      </div>
    </div>
  );
}


function CardRevisaoInteligente() {
  return (
    <GoldAuraCard
      variants={cardVariants}
      whileHover={{ scale: 1.01, transition: { duration: 0.2, ease: "easeOut" } }}
      className={cn(glass, "p-5 hover:shadow-gold/[0.10]", "md:col-span-1 lg:w-full")}
      auraRadius={260}
      auraIntensity={0.13}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
      <div className="relative z-10">
        <IconBadge icon={Brain} />
        <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">Revisão Inteligente</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/55">
          Algoritmo de repetição espaçada que foca nas suas fraquezas e otimiza sua retenção.
        </p>
        <HeatmapCalendar />
      </div>
    </GoldAuraCard>
  );
}


function RefinedTimer() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const filled = 0.68;
  return (
    <div ref={ref} className="mt-4 w-full space-y-3">
      <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.18) 0%, transparent 70%)" }}
          />
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="hsl(var(--gold) / 0.08)" strokeWidth="3" />
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="hsl(var(--gold))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={inView ? { strokeDashoffset: circumference * (1 - filled) } : {}}
              transition={{ duration: 1.6, delay: 0.25, ease: EASE }}
            />
            <circle cx="40" cy="40" r={radius - 7} fill="none" stroke="hsl(var(--gold) / 0.05)" strokeWidth="1" />
          </svg>
          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <motion.span
              className="font-mono text-lg font-bold leading-none text-foreground"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              2:45
            </motion.span>
            <span className="text-[8px] tracking-[0.15em] text-white/35">MIN</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:items-center sm:text-right">
          <div className="w-full sm:max-w-md sm:ml-auto">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 sm:justify-end">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono-stats text-sm font-bold text-foreground">15</span>
                <span className="text-xs text-white/35">/60 questões</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/35">
                <span className="font-mono-stats">1m 42s</span>
                <span>· média por questão</span>
              </div>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gold/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold-light"
                initial={{ width: 0 }}
                animate={inView ? { width: "25%" } : {}}
                transition={{ duration: 1.2, delay: 0.55, ease: EASE }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/35 sm:justify-end">
            <span>Tempo restante:</span>
            <span className="font-mono-stats text-gold-light/70">1h 47m</span>
          </div>
        </div>
      </div>
    </div>
  );
}


function CardSimulados() {
  return (
    <GoldAuraCard
      variants={cardVariants}
      whileHover={{ scale: 1.01, transition: { duration: 0.2, ease: "easeOut" } }}
      className={cn(glass, "p-5 hover:shadow-gold/[0.10]", "md:col-span-1 lg:w-full")}
      auraRadius={260}
      auraIntensity={0.13}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconBadge icon={Timer} />
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-white/50">
              Simulado integral 2024
            </span>
          </div>
          <span className="font-mono-stats text-[10px] tracking-wide text-white/35">60 questões · 2h</span>
        </div>
        <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">Simulados Realistas</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/55">
          Simule provas reais com cronômetro, correção automática e relatório de desempenho.
        </p>
        <RefinedTimer />
      </div>
    </GoldAuraCard>
  );
}


function BarChartViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const bars = [
    { label: "Anatomia", pct: 78, highlight: true },
    { label: "Fisiologia", pct: 62, highlight: false },
    { label: "Bioquímica", pct: 55, highlight: false },
    { label: "Patologia", pct: 71, highlight: false },
  ];
  return (
    <div ref={ref} className="mt-4">
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-4 flex items-center gap-1.5"
      >
        <TrendingUp className="h-3.5 w-3.5 text-success" />
        <span className="text-sm font-semibold text-success">+8% esta semana</span>
      </motion.div>
      <div className="space-y-2.5">
        {bars.map((b, i) => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="w-[72px] shrink-0 text-right text-[11px] text-white/40">{b.label}</span>
            <div className="relative h-[22px] flex-1 overflow-hidden rounded-md border border-white/[0.05] bg-white/[0.025]">
              <motion.div
                className={cn(
                  "h-full rounded-md",
                  b.highlight ? "bg-gradient-to-r from-gold/80 to-gold-light" : "bg-gold/25"
                )}
                initial={{ width: 0 }}
                animate={inView ? { width: `${b.pct}%` } : {}}
                transition={{ duration: 0.75, delay: 0.15 + i * 0.09, ease: EASE }}
              />
            </div>
            <span
              className={cn(
                "w-8 shrink-0 text-right font-mono-stats text-[11px] font-bold",
                b.highlight ? "text-gold-light" : "text-white/35"
              )}
            >
              {b.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardAnalytics() {
  return (
    <GoldAuraCard
      variants={cardVariants}
      whileHover={{ scale: 1.01, transition: { duration: 0.2, ease: "easeOut" } }}
      className={cn(glass, "p-5 hover:shadow-gold/[0.10]", "md:col-span-2 lg:w-full")}
      auraRadius={260}
      auraIntensity={0.13}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <IconBadge icon={BarChart3} />
          <span className="font-mono-stats text-[10px] tracking-wide text-white/35">12 disciplinas</span>
        </div>
        <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">Analytics Profundos</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/55">
          Visualize sua evolução por disciplina, identifique gaps e acompanhe seu progresso.
        </p>
        <BarChartViz />
      </div>
    </GoldAuraCard>
  );
}


type MedalTier = "gold" | "silver" | "bronze" | "neutral";

function getMedalTier(rank: number): MedalTier {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "neutral";
}

const MEDAL_ROW: Record<
  MedalTier,
  { card: string; rank: string; avatar: string; name: string; bar: string; percent: string }
> = {
  gold: {
    card: "border-gold/30 bg-gold/[0.07] shadow-[0_0_20px_-6px] shadow-gold/25",
    rank: "text-gold-light",
    avatar: "bg-gradient-to-br from-gold-light to-gold-hover text-black shadow-md shadow-gold/30",
    name: "text-white/90",
    bar: "bg-gradient-to-r from-gold to-gold-light",
    percent: "text-gold-light/80",
  },
  silver: {
    card: "border-silver/35 bg-silver/[0.08] shadow-[0_0_18px_-6px] shadow-silver/20",
    rank: "text-silver-light",
    avatar: "bg-gradient-to-br from-silver-light to-silver-hover text-black shadow-md shadow-silver/25",
    name: "text-white/85",
    bar: "bg-gradient-to-r from-silver to-silver-light",
    percent: "text-silver-light/85",
  },
  bronze: {
    card: "border-bronze/35 bg-bronze/[0.08] shadow-[0_0_18px_-6px] shadow-bronze/20",
    rank: "text-bronze-light",
    avatar: "bg-gradient-to-br from-bronze-light to-bronze-hover text-black shadow-md shadow-bronze/25",
    name: "text-white/85",
    bar: "bg-gradient-to-r from-bronze to-bronze-light",
    percent: "text-bronze-light/85",
  },
  neutral: {
    card: "border-white/[0.06] bg-white/[0.02]",
    rank: "text-white/25",
    avatar: "bg-white/[0.07] text-white/40",
    name: "text-white/40",
    bar: "bg-white/15",
    percent: "text-white/25",
  },
};

function RankingHorizontal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const players = [
    { name: "Você", initial: "V", score: 94, rank: 1, you: true },
    { name: "Ana S.", initial: "A", score: 89, rank: 2, you: false },
    { name: "João M.", initial: "J", score: 85, rank: 3, you: false },
    { name: "Carla R.", initial: "C", score: 82, rank: 4, you: false },
    { name: "Pedro L.", initial: "P", score: 78, rank: 5, you: false },
  ];
  return (
    <div
      ref={ref}
      className="mt-5 flex flex-col gap-2 md:flex-row md:gap-4 lg:flex-col lg:gap-2"
    >
      {players.map((p, i) => {
        const tier = getMedalTier(p.rank);
        const m = MEDAL_ROW[tier];
        return (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.08 + i * 0.09 }}
            className={cn(
              "flex min-w-0 w-full flex-col items-center gap-2 rounded-xl border px-3 py-3 transition-all duration-300",
              "md:flex-1 md:flex-col md:items-center md:px-3 md:py-3",
              "lg:flex-none lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:px-3 lg:py-2",
              m.card
            )}
          >
            <span className={cn("shrink-0 font-mono-stats text-[10px] font-bold leading-none", m.rank)}>
              #{p.rank}
            </span>
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold", m.avatar)}>
              {p.initial}
            </div>
            <span
              className={cn(
                "w-full truncate text-center text-[11px] font-medium leading-none",
                "lg:min-w-0 lg:flex-1 lg:text-left",
                m.name
              )}
            >
              {p.name}
            </span>
            <div className="w-full lg:flex lg:min-w-0 lg:flex-1 lg:items-center lg:gap-2">
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05] lg:min-w-0 lg:flex-1">
                <motion.div
                  className={cn("h-full rounded-full", m.bar)}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${p.score}%` } : {}}
                  transition={{ duration: 0.8, delay: 0.28 + i * 0.09, ease: EASE }}
                />
              </div>
              <span
                className={cn(
                  "mt-1 block text-center font-mono-stats text-[10px]",
                  "lg:mt-0 lg:inline lg:shrink-0 lg:text-right",
                  m.percent
                )}
              >
                {p.score}%
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function CardRanking() {
  return (
    <GoldAuraCard
      variants={cardVariants}
      whileHover={{ scale: 1.005, transition: { duration: 0.2, ease: "easeOut" } }}
      className={cn(glass, "p-5 hover:shadow-gold/[0.08]", "md:col-span-2 lg:w-full")}
      auraRadius={300}
      auraIntensity={0.12}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
      <div className="relative z-10">
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between lg:flex-col lg:items-stretch">
          <div className="flex w-full items-start gap-3 md:w-auto md:items-center lg:w-full">
            <IconBadge icon={Users} />
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-foreground">Ranking entre Colegas</h3>
              <p className="text-sm text-white/55">
                Compare seu desempenho com outros estudantes e mantenha a motivação em alta.
              </p>
            </div>
          </div>
          <span className="shrink-0 font-mono-stats text-[10px] tracking-wide text-white/35 md:text-right">
            +8.500 alunos
          </span>
        </div>
        <RankingHorizontal />
      </div>
    </GoldAuraCard>
  );
}


export function FeaturesSection() {
  return (
    <section id="recursos" className="relative scroll-mt-20 overflow-hidden px-6 py-28">
      <GridBackground />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
        >
          <motion.div variants={headingVariants} className="font-mono-stats text-[11px] tracking-[0.18em] text-muted-foreground/70">
            +10.000 QUESTÕES · 450 UNIVERSIDADES · 92% APROVAÇÃO
          </motion.div>
          <motion.div variants={headingVariants} className="mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium tracking-wide text-gold">
              Recursos
            </span>
          </motion.div>
          <motion.h2 variants={headingVariants} className="mt-5 text-3xl font-bold text-foreground sm:text-4xl lg:text-[2.75rem]">
            Tudo que você precisa para{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">dominar a graduação</span>
            </span>
          </motion.h2>
          <motion.p variants={headingVariants} className="mx-auto mt-5 max-w-md text-base text-muted-foreground">
            Ferramentas criadas por médicos e educadores para maximizar seu desempenho.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 lg:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
        >
          <motion.div
            variants={containerVariants}
            className="flex flex-col gap-4 md:contents lg:flex lg:w-full lg:flex-row lg:items-stretch lg:gap-4"
          >
            <CardBancoQuestoes />
            <motion.div
              variants={containerVariants}
              className="flex flex-col gap-4 md:contents lg:flex lg:h-full lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-4"
            >
              <CardRevisaoInteligente />
              <CardSimulados />
              <CardAnalytics />
              <CardRanking />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-6 py-3 text-sm font-medium text-gold transition-all duration-300 hover:border-gold/40 hover:bg-gold/[0.12] hover:shadow-lg hover:shadow-gold/[0.08]"
          >
            Comece gratuitamente
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

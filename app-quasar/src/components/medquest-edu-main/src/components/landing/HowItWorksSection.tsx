import { useState, type ComponentType } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef } from "react";
import {
  MousePointerClick,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GridBackground } from "./shared";

/* ─── Preview Mockup: Escolha (discipline picker) ─── */

function PreviewEscolha() {
  const disciplines = [
    { name: "Anatomia", tag: "Ciclo Básico", questions: 248, selected: true },
    { name: "Fisiologia", tag: "Ciclo Básico", questions: 186, selected: false },
    { name: "Farmacologia", tag: "Ciclo Clínico", questions: 312, selected: false },
  ];

  return (
    <div className="flex h-full w-full flex-col p-6">
      {/* Mock header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="h-2.5 w-28 rounded bg-foreground/20" />
          <div className="mt-2 h-2 w-40 rounded bg-muted-foreground/15" />
        </div>
        <div className="h-8 w-20 rounded-lg bg-gold/[0.08] " />
      </div>

      {/* Search bar mock */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2">
        <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
        <div className="h-2 w-32 rounded bg-muted-foreground/15" />
      </div>

      {/* Discipline cards */}
      <div className="flex flex-1 flex-col gap-2.5">
        {disciplines.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 transition-colors",
              d.selected
                ? "border-gold/30 bg-gold/[0.06]"
                : "border-border/40 bg-card"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                  d.selected
                    ? "bg-gold/[0.15] text-gold"
                    : "bg-muted/50 text-muted-foreground/60"
                )}
              >
                {d.name.charAt(0)}
              </div>
              <div>
                <p className={cn(
                  "text-sm font-medium",
                  d.selected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {d.name}
                </p>
                <p className="text-[10px] text-muted-foreground/50">{d.tag}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "font-mono-stats text-xs font-bold",
                d.selected ? "text-gold" : "text-muted-foreground/40"
              )}>
                {d.questions}
              </p>
              <p className="text-[10px] text-muted-foreground/40">questões</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Preview Mockup: Pratique (question solving) ─── */

function PreviewPratique() {
  const alternatives = [
    { letter: "A", text: "Nervo mediano", correct: false },
    { letter: "B", text: "Nervo ulnar", correct: true },
    { letter: "C", text: "Nervo radial", correct: false },
  ];

  return (
    <div className="flex h-full w-full flex-col p-6">
      {/* Question header */}
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded bg-gold/[0.1] px-2 py-0.5 text-[10px] font-semibold text-gold">
          Anatomia
        </span>
        <span className="text-[10px] text-muted-foreground/40">Questão 14 de 30</span>
      </div>

      {/* Question text mock */}
      <div className="mb-5 mt-3 space-y-1.5">
        <div className="h-2 w-full rounded bg-foreground/15" />
        <div className="h-2 w-[90%] rounded bg-foreground/15" />
        <div className="h-2 w-[70%] rounded bg-foreground/15" />
      </div>

      {/* Alternatives */}
      <div className="flex flex-col gap-2">
        {alternatives.map((a, i) => (
          <motion.div
            key={a.letter}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.08 }}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm",
              a.correct
                ? "border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-400"
                : "border-border/40 text-muted-foreground/50"
            )}
          >
            <span className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold",
              a.correct
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-muted-foreground/40"
            )}>
              {a.correct ? "✓" : a.letter}
            </span>
            <span className={cn(
              "text-xs",
              a.correct ? "font-medium text-emerald-400" : ""
            )}>
              {a.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Comment section mock */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-4 rounded-lg border border-gold/20 bg-gold/[0.03] px-3.5 py-3"
      >
        <p className="mb-2 text-[10px] font-semibold text-gold">Comentário</p>
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded bg-muted-foreground/10" />
          <div className="h-1.5 w-[85%] rounded bg-muted-foreground/10" />
          <div className="h-1.5 w-[60%] rounded bg-muted-foreground/10" />
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Preview Mockup: Evolua (analytics dashboard) ─── */

function PreviewEvolua() {
  const barValues = [35, 48, 42, 58, 72, 68, 88];
  const maxBar = 88;
  const ranks = [
    { pos: 1, name: "Você", score: "94%", highlight: true },
    { pos: 2, name: "Ana S.", score: "89%", highlight: false },
    { pos: 3, name: "João M.", score: "85%", highlight: false },
  ];

  return (
    <div className="flex h-full w-full flex-col p-6">
      {/* Chart header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground/80">Desempenho Semanal</p>
          <p className="text-[10px] text-muted-foreground/50">Últimos 7 dias</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <span className="font-mono-stats text-xs font-bold text-emerald-400">+12%</span>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="mb-5 flex items-end gap-1.5" style={{ height: 80 }}>
        {barValues.map((v, i) => (
          <motion.div
            key={i}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <motion.div
              className={cn(
                "w-full rounded-sm",
                i === barValues.length - 1
                  ? "bg-gradient-to-t from-gold/50 to-gold"
                  : "bg-gradient-to-t from-gold/20 to-gold/50"
              )}
              style={{ transformOrigin: "bottom" }}
              initial={{ height: 0 }}
              animate={{ height: `${(v / maxBar) * 72}px` }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06, type: "spring", stiffness: 80, damping: 14 }}
            />
            <span className="text-[8px] text-muted-foreground/30">
              {["S", "T", "Q", "Q", "S", "S", "D"][i]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="mb-3 h-px bg-border/40" />

      {/* Mini leaderboard */}
      <p className="mb-2 text-[10px] font-semibold text-muted-foreground/60">Ranking</p>
      <div className="flex flex-col gap-1.5">
        {ranks.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-1.5 text-xs",
              r.highlight
                ? "border border-gold/25 bg-gold/[0.06] text-gold"
                : "text-muted-foreground/50"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono-stats font-bold">{r.pos}.</span>
              <span className="font-medium">{r.name}</span>
            </div>
            <span className="font-mono-stats font-bold">{r.score}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Steps Data ─── */

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  preview: ComponentType;
}

const steps: Step[] = [
  {
    number: "01",
    icon: MousePointerClick,
    title: "Escolha",
    desc: "Selecione a disciplina, o tema ou inicie um simulado. Você controla o ritmo.",
    preview: PreviewEscolha,
  },
  {
    number: "02",
    icon: Target,
    title: "Pratique",
    desc: "Resolva questões comentadas com feedback imediato e revisão espaçada.",
    preview: PreviewPratique,
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Evolua",
    desc: "Acompanhe seu progresso com analytics detalhados e suba no ranking.",
    preview: PreviewEvolua,
  },
];

/* ─── Animation Variants ─── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
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

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] },
  },
};

/* ─── Preview Wrapper ─── */

function StepPreview({ step }: { step: Step }) {
  const Preview = step.preview;

  return (
    <motion.div
      key={step.number}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative h-full min-h-[360px] lg:min-h-[420px]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, hsl(var(--gold) / 0.06) 0%, transparent 70%)",
        }}
      />
      <Preview />
    </motion.div>
  );
}

/* ─── Section ─── */

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="relative scroll-mt-20 overflow-hidden px-6 py-28"
    >
      <GridBackground />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
        >
          <motion.div variants={headingVariants}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium tracking-wide text-gold">
              Como funciona
            </span>
          </motion.div>
          <motion.h2
            variants={headingVariants}
            className="mt-5 text-3xl font-bold text-foreground sm:text-4xl"
          >
            Três passos para evoluir
          </motion.h2>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Left: Step list (40%) */}
          <motion.div
            className="lg:col-span-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={listVariants}
          >
            <div className="flex flex-col gap-2">
              {steps.map((step, i) => {
                const isActive = activeStep === i;
                const Icon = step.icon;

                return (
                  <motion.button
                    key={step.number}
                    variants={itemVariants}
                    onMouseEnter={() => setActiveStep(i)}
                    onClick={() => setActiveStep(i)}
                    className={cn(
                      "group relative flex w-full items-start gap-4 rounded-xl border-l-2 px-5 py-5 text-left transition-all duration-300",
                      isActive
                        ? "border-l-gold bg-gold/[0.04]"
                        : "border-l-transparent hover:border-l-gold/30 hover:bg-gold/[0.02]"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                        isActive
                          ? "bg-gold/[0.12]"
                          : "bg-gold/[0.06] group-hover:bg-gold/[0.08]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors duration-300",
                          isActive ? "text-gold" : "text-gold/50 group-hover:text-gold/70"
                        )}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-mono-stats text-xs font-bold transition-colors duration-300",
                            isActive ? "text-gold" : "text-gold/40"
                          )}
                        >
                          {step.number}
                        </span>
                        <h3
                          className={cn(
                            "text-base font-semibold transition-colors duration-300",
                            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
                          )}
                        >
                          {step.title}
                        </h3>
                      </div>

                      <p
                        className={cn(
                          "mt-1.5 text-sm leading-relaxed transition-colors duration-300",
                          isActive ? "text-muted-foreground" : "text-muted-foreground/60"
                        )}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Sticky visual preview (60%) */}
          <motion.div
            className="lg:col-span-3 lg:sticky lg:top-28"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={panelVariants}
          >
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
              {/* Subtle top border accent */}
              <div className="absolute left-0 right-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

              <AnimatePresence mode="wait">
                <StepPreview key={activeStep} step={steps[activeStep]} />
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

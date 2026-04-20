import { motion } from "framer-motion";
import { Quote, BookOpen, Users, Library } from "lucide-react";
import { AnimatedCounter } from "./shared";
import { useLandingStatsWithFallback } from "@/hooks/useLandingStats";

/* ─── Icon Mapping ─── */
const iconMap: Record<string, React.ElementType> = {
  "book-open": BookOpen,
  users: Users,
  library: Library,
};

/* ─── University Data ─── */
const universitiesRow1 = [
  "USP", "UNICAMP", "UFMG", "UFRJ", "UNIFESP", "UERJ", "UFBA", "UFPR", "UFRGS",
];
const universitiesRow2 = [
  "UnB", "UFC", "UFPE", "UFSC", "UNESP", "PUC-SP", "Einstein", "UNIT", "UFPI",
];

/* ─── Testimonial Data ─── */
const testimonialsLeft = [
  {
    name: "Carolina Mendes",
    initials: "CM",
    university: "USP",
    period: "4º ano",
    quote: "O MEDQUEST mudou minha forma de estudar. A revisão espaçada me ajudou a reter muito mais conteúdo para as provas.",
  },
  {
    name: "Lucas Ferreira",
    initials: "LF",
    university: "UFRJ",
    period: "6º ano",
    quote: "Passei a usar o MEDQUEST no internato e os simulados são extremamente fiéis ao formato das provas. Recomendo demais.",
  },
  {
    name: "Juliana Costa",
    initials: "JC",
    university: "UFMG",
    period: "3º ano",
    quote: "Desde o ciclo básico uso o MEDQUEST. Os comentários detalhados de cada questão são melhores que muitos livros-texto.",
  },
];

const testimonialsRight = [
  {
    name: "Rafael Santos",
    initials: "RS",
    university: "UNICAMP",
    period: "5º ano",
    quote: "Os simulados são incríveis — me sinto muito mais preparado para o internato. A analytics mostra exatamente onde preciso focar.",
  },
  {
    name: "Mariana Oliveira",
    initials: "MO",
    university: "UNIFESP",
    period: "4º ano",
    quote: "A plataforma é intuitiva e bonita. Consigo montar sessões de estudo focadas exatamente no que preciso revisar.",
  },
  {
    name: "Pedro Almeida",
    initials: "PA",
    university: "UFBA",
    period: "5º ano",
    quote: "O ranking entre colegas me motiva demais. Estudo mais e melhor desde que comecei a acompanhar meu progresso no MEDQUEST.",
  },
];

/* ─── Animation Variants ─── */
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

/* ─── Marquee Row ─── */
function MarqueeRow({
  items,
  reverse = false,
  speed = 35,
}: {
  items: string[];
  reverse?: boolean;
  speed?: number;
}) {
  const doubled = [...items, ...items];
  return (
    <div
      className="flex w-max gap-4"
      style={{
        animation: `${reverse ? "marquee-reverse" : "marquee"} ${speed}s linear infinite`,
      }}
    >
      {doubled.map((name, i) => (
        <div
          key={`${name}-${i}`}
          className="flex h-12 shrink-0 items-center rounded-xl border border-border/60 bg-card/60 px-6 font-mono-stats text-sm font-semibold tracking-wider text-foreground/70 transition-all duration-300 hover:border-gold/30 hover:text-gold"
        >
          {name}
        </div>
      ))}
    </div>
  );
}

/* ─── Testimonial Card ─── */
function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonialsLeft)[number];
}) {
  return (
    <div className="group mx-2 my-2 rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-gold/25 hover:shadow-lg hover:shadow-gold/[0.04]">
      <Quote className="mb-3 h-5 w-5 text-gold/30" />
      <p className="text-sm leading-relaxed text-muted-foreground">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/[0.08] font-mono-stats text-xs font-bold text-gold">
          {testimonial.initials}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">
            {testimonial.university} · {testimonial.period}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Elevator Column ─── */
function ElevatorColumn({
  testimonials,
  direction,
}: {
  testimonials: typeof testimonialsLeft;
  direction: "up" | "down";
}) {
  const doubled = [...testimonials, ...testimonials];
  return (
    <div
      className="flex flex-col"
      style={{
        animation: `${direction === "up" ? "marquee-up" : "marquee-down"} 40s linear infinite`,
      }}
    >
      {doubled.map((t, i) => (
        <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
      ))}
    </div>
  );
}

/* ─── Main Section ─── */
export function SocialProofSection() {
  const stats = useLandingStatsWithFallback();

  return (
    <section className="relative overflow-hidden px-6 py-28">
      {/* Subtle radial background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--gold) / 0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ─── Universities ─── */}
        <motion.div
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="mb-10 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium tracking-wide text-gold">
              Universidades
            </span>
            <h2 className="mt-5 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              Estudantes das melhores universidades do Brasil
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
              De federais a particulares de excelência, futuros médicos confiam no MEDQUEST.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="relative">
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

            <div className="space-y-4 overflow-hidden">
              <MarqueeRow items={universitiesRow1} speed={40} />
              <MarqueeRow items={universitiesRow2} reverse speed={45} />
            </div>
          </motion.div>
        </motion.div>

        {/* ─── Stats ─── */}
        <motion.div
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((stat) => {
              const Icon = iconMap[stat.icon] || Library;
              return (
                <motion.div
                  key={stat.key}
                  variants={fadeUp}
                  className="group relative text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/[0.08] transition-colors duration-300 group-hover:bg-gold/[0.12]">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    className="font-mono-stats text-4xl font-bold text-foreground sm:text-5xl"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mx-auto mt-16 h-px max-w-xs bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        </motion.div>

        {/* ─── Testimonials ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="mb-10 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium tracking-wide text-gold">
              Depoimentos
            </span>
            <h2 className="mt-5 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              O que nossos estudantes dizem
            </h2>
          </motion.div>

          <motion.div variants={fadeUp}>
            {/* Mobile: static grid */}
            <div className="grid gap-4 sm:hidden">
              {[...testimonialsLeft, ...testimonialsRight].slice(0, 4).map((t) => (
                <TestimonialCard key={t.name} testimonial={t} />
              ))}
            </div>

            {/* Desktop: elevator columns */}
            <div className="relative hidden overflow-hidden sm:block" style={{ height: 520 }}>
              {/* Top/bottom gradient masks */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-background to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-background to-transparent" />

              <div
                className="grid grid-cols-2 gap-4 [&:hover_*]:![animation-play-state:paused]"
              >
                <ElevatorColumn testimonials={testimonialsLeft} direction="up" />
                <ElevatorColumn testimonials={testimonialsRight} direction="down" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

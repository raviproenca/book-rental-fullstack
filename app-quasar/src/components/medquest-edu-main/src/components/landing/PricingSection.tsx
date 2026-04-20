import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlans } from "@/hooks/usePlans";
import { useAuthCTA } from "@/hooks/useAuthCTA";
import { GoldAuraCard } from "./GoldAuraCard";
import {
  getAnnualMonthlyEquivalent,
  getAnnualSavingsPercent,
  DEFAULT_FREE_PLAN_FEATURES_FALLBACK,
  DEFAULT_PRO_PLAN_FEATURES_FALLBACK,
} from "@/services/plans";

function brl(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
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

const cardVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
};

type PlanCard = {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  missing: string[];
  cta: string;
  featured: boolean;
};

type PricingPlansContentProps = {
  /** When true, skip scroll-triggered motion and use a compact header (e.g. inside a dialog). */
  compact?: boolean;
  /** Unique layout id for the billing-period toggle (avoid clashes between landing + modal). */
  toggleLayoutId?: string;
  /** Destination for plan CTAs. */
  ctaTo?: string;
};

export function PricingPlansContent({
  compact = false,
  toggleLayoutId = "pricing-toggle",
  ctaTo = "/dashboard",
}: PricingPlansContentProps) {
  const [annual, setAnnual] = useState(false);
  const { data: plansData, isPending } = usePlans();
  const plansList = plansData ?? [];
  const useFeatureFallback = !isPending && plansList.length === 0;

  const freePlan = plansList.find((p) => p.id === "free");
  const proPlan = plansList.find((p) => p.id === "pro");

  const monthlyPrice = proPlan?.monthlyPrice ?? 39.9;
  const annualPrice = proPlan?.annualPrice ?? 358.8;
  const annualMonthly = getAnnualMonthlyEquivalent(annualPrice);
  const savings = getAnnualSavingsPercent(monthlyPrice, annualPrice);

  const plans: PlanCard[] = [
    {
      name: freePlan?.name ?? "Gratuito",
      price: "R$ 0",
      period: "/mês",
      desc: freePlan?.description ?? "Para experimentar a plataforma",
      features: useFeatureFallback
        ? DEFAULT_FREE_PLAN_FEATURES_FALLBACK.filter((f) => f.included).map((f) => f.text)
        : (freePlan?.features ?? []).filter((f) => f.included).map((f) => f.text),
      missing: useFeatureFallback
        ? DEFAULT_FREE_PLAN_FEATURES_FALLBACK.filter((f) => !f.included).map((f) => f.text)
        : (freePlan?.features ?? []).filter((f) => !f.included).map((f) => f.text),
      cta: "Começar Grátis",
      featured: false,
    },
    {
      name: proPlan?.name ?? "Pro",
      price: annual ? `R$ ${brl(annualMonthly)}` : `R$ ${brl(monthlyPrice)}`,
      period: "/mês",
      desc: annual
        ? `Cobrado anualmente (R$ ${brl(annualPrice)}/ano)`
        : "Cancele quando quiser",
      features: useFeatureFallback
        ? DEFAULT_PRO_PLAN_FEATURES_FALLBACK.filter((f) => f.included).map((f) => f.text)
        : (proPlan?.features ?? []).filter((f) => f.included).map((f) => f.text),
      missing: [],
      cta: "Assinar Pro",
      featured: true,
    },
  ];

  const toggle = (
    <div className="relative inline-flex items-center rounded-full border border-border/60 bg-card p-1">
      <motion.div
        layoutId={toggleLayoutId}
        className="absolute inset-y-1 rounded-full bg-secondary"
        style={{
          left: annual ? "50%" : "4px",
          right: annual ? "4px" : "50%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      <button
        type="button"
        onClick={() => setAnnual(false)}
        className={cn(
          "relative z-10 rounded-full px-5 py-1.5 text-sm font-medium transition-colors duration-200",
          !annual ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Mensal
      </button>
      <button
        type="button"
        onClick={() => setAnnual(true)}
        className={cn(
          "relative z-10 rounded-full px-5 py-1.5 text-sm font-medium transition-colors duration-200",
          annual ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Anual
        {savings > 0 && <span className="ml-1.5 text-xs text-gold">-{savings}%</span>}
      </button>
    </div>
  );

  const cardPadding = compact ? "p-5" : "p-7";
  const priceClass = compact ? "text-3xl" : "text-4xl";

  const cardsGrid = (
    <motion.div
      className={cn("grid gap-6 sm:grid-cols-2", compact && "gap-4")}
      initial={compact ? "visible" : "hidden"}
      animate={compact ? "visible" : undefined}
      whileInView={compact ? undefined : "visible"}
      viewport={compact ? undefined : { once: true, margin: "-60px" }}
      variants={containerVariants}
    >
      {plans.map((plan) => (
        <GoldAuraCard
          key={plan.name}
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.25 } }}
          className={cn(
            "group relative overflow-hidden rounded-2xl border transition-shadow duration-300",
            cardPadding,
            plan.featured
              ? "border-gold/30 bg-gradient-to-b from-card to-gold/[0.02] shadow-xl shadow-gold/[0.06] hover:shadow-2xl hover:shadow-gold/[0.1]"
              : "border-border/60 bg-card hover:border-gold/20 hover:shadow-xl hover:shadow-gold/[0.04]",
          )}
          auraRadius={260}
          auraIntensity={plan.featured ? 0.16 : 0.10}
          borderGlow={plan.featured}
        >
          {plan.featured && (
            <>
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-40"
                style={{
                  background: "radial-gradient(circle, hsl(var(--gold) / 0.12) 0%, transparent 70%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl border-glow-anim opacity-60" />
            </>
          )}

          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--gold) / 0.04) 0%, transparent 50%, hsl(var(--gold) / 0.02) 100%)",
            }}
          />

          <div className="relative z-10">
            {plan.featured && (
              <div className={cn("mb-5 flex flex-wrap items-center gap-2", compact && "mb-3")}>
                <span className="rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-background">
                  Mais Popular
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <Shield className="h-3 w-3 text-gold" />
                  Garantia 7 dias
                </span>
              </div>
            )}

            <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-muted-foreground">R$</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={plan.price}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className={cn(
                    "font-mono-stats font-bold tracking-tight text-foreground",
                    priceClass,
                  )}
                >
                  {plan.price.replace("R$ ", "")}
                </motion.span>
              </AnimatePresence>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">{plan.desc}</p>

            <ul className={cn("mt-6 space-y-3", compact && "mt-4 space-y-2")}>
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {f}
                </li>
              ))}
              {plan.missing.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground/50 line-through"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/30" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to={ctaTo}
              className={cn(
                "mt-6 block rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200",
                plan.featured
                  ? "bg-gold text-background shadow-lg shadow-gold/20 hover:bg-gold-hover hover:shadow-xl hover:shadow-gold/30"
                  : "border border-border/60 bg-secondary text-foreground hover:border-gold/20 hover:bg-accent",
              )}
            >
              {plan.cta}
            </Link>
          </div>
        </GoldAuraCard>
      ))}
    </motion.div>
  );

  if (compact) {
    return (
      <div className="w-full">
        <div className="mb-6 text-center">
          <h3 className="text-base font-semibold text-foreground">Planos disponíveis</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Compare e escolha o melhor para o seu ritmo de estudos.
          </p>
          <div className="mt-4 flex justify-center">{toggle}</div>
        </div>
        {cardsGrid}
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div
        className="mb-16 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
      >
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium tracking-wide text-gold">
            Preços
          </span>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="mt-5 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
        >
          Invista no seu futuro
        </motion.h2>

        <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-md text-base text-muted-foreground">
          Comece gratuitamente e faça upgrade quando estiver pronto.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex justify-center">
          {toggle}
        </motion.div>
      </motion.div>

      {cardsGrid}
    </div>
  );
}

export function PricingSection() {
  const ctaTo = useAuthCTA();
  return (
    <section id="precos" className="relative scroll-mt-20 overflow-hidden px-6 py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gold/[0.04] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <PricingPlansContent toggleLayoutId="pricing-toggle-landing" ctaTo={ctaTo} />
      </div>
    </section>
  );
}

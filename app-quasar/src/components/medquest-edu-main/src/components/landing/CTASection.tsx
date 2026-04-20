import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { GoldAuraCard } from "./GoldAuraCard";

const avatars = [
  { initials: "CM", color: "bg-gold/[0.15] text-gold" },
  { initials: "LF", color: "bg-emerald-500/15 text-emerald-400" },
  { initials: "RS", color: "bg-blue-500/15 text-blue-400" },
  { initials: "MO", color: "bg-purple-500/15 text-purple-400" },
  { initials: "PA", color: "bg-gold/[0.15] text-gold" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
};

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-6 py-28">
      <div className="relative z-10 mx-auto max-w-4xl">
        <GoldAuraCard
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-b from-gold/[0.05] via-card to-card p-10 sm:p-14 lg:p-20"
          auraRadius={400}
          auraIntensity={0.18}
        >
          {/* Decorative glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 0%, hsl(var(--gold) / 0.1) 0%, transparent 60%)",
            }}
          />

          {/* Dot grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Corner sparkles */}
          <Sparkles className="pointer-events-none absolute right-8 top-8 h-5 w-5 text-gold/20" />
          <Sparkles className="pointer-events-none absolute bottom-8 left-8 h-4 w-4 text-gold/15" />

          {/* Top glow line */}
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
            >
              Pronto para{" "}
              <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                começar
              </span>
              ?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground"
            >
              Junte-se a centenas de estudantes que já estão usando o MEDQUEST para dominar a graduação em medicina.
            </motion.p>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {avatars.map((a) => (
                  <div
                    key={a.initials}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-card font-mono-stats text-[10px] font-bold ${a.color}`}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">500+</span> estudantes ativos
              </p>
            </motion.div>

            {/* CTA button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8"
            >
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#09090b] shadow-lg shadow-white/10 transition-all duration-200 hover:bg-white/90 hover:shadow-xl hover:shadow-white/15"
              >
                Começar Gratuitamente
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </GoldAuraCard>
      </div>
    </section>
  );
}

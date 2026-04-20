import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useAuthCTA } from "@/hooks/useAuthCTA";
import { StepBarsBackground } from "./shared";

export function HeroSection() {
  const startHref = useAuthCTA();
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Step bars behind everything */}
      <StepBarsBackground />

      {/* Subtle radial overlay for depth + text contrast */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, hsl(var(--background) / 0.82) 0%, hsl(var(--background) / 0.45) 55%, transparent 100%)",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
          className="text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Domine a Medicina,{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
              Uma Questão
            </span>
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent blur-2xl"
              aria-hidden="true"
            >
              Uma Questão
            </span>
          </span>{" "}
          por Vez.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg"
        >
          Do ciclo básico ao clínico, das provas do semestre ao internato —
          questões comentadas, revisão espaçada e analytics para você dominar
          cada fase da graduação.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: "easeOut" }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to={startHref}
            className="group inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white px-7 py-3.5 text-sm font-semibold text-[#09090b] transition-all duration-200 hover:bg-white/90"
          >
            Começar Gratuitamente
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#recursos"
            className="group inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-white/80 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            Explorar Recursos
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <a
          href="#recursos"
          aria-label="Ir para a secção Recursos"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.025] text-white/38 shadow-[0_2px_20px_rgba(0,0,0,0.08)] backdrop-blur-[6px] transition-[border-color,background-color,color,box-shadow] duration-500 ease-out hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white/55 hover:shadow-[0_4px_28px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/25"
        >
          <motion.span
            className="flex translate-y-px items-center justify-center will-change-transform"
            animate={{ y: [0, 2.5, 0] }}
            transition={{
              repeat: Infinity,
              duration: 3.2,
              ease: [0.45, 0, 0.55, 1],
            }}
          >
            <ChevronDown className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
          </motion.span>
        </a>
      </motion.div>
    </section>
  );
}

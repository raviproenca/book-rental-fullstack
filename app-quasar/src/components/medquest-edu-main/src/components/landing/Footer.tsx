import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

export function Footer() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      className="relative px-6 py-16"
    >
      <div className="mx-auto max-w-6xl">
        {/* Top bar: brand + mini CTA */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Brain className="h-5 w-5 text-gold" />
            <span className="text-sm font-bold tracking-tight">
              MED<span className="text-gold">QUEST</span>
            </span>
          </div>

          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-5 py-2 text-xs font-medium text-gold transition-all duration-300 hover:border-gold/40 hover:bg-gold/[0.12]"
          >
            Comece agora
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Gradient separator */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Grid */}
        <div className="grid gap-10 sm:grid-cols-4">
          {/* About */}
          <div className="sm:col-span-1">
            <p className="text-xs leading-relaxed text-muted-foreground">
              A plataforma de questões para estudantes de graduação em medicina. Do ciclo básico ao internato.
            </p>
          </div>

          {/* Produto */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Produto
            </p>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <a href="#recursos" className="transition-colors duration-200 hover:text-gold">Recursos</a>
              <a href="#precos" className="transition-colors duration-200 hover:text-gold">Preços</a>
              <a href="#faq" className="transition-colors duration-200 hover:text-gold">FAQ</a>
            </nav>
          </div>

          {/* Recursos */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Recursos
            </p>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <span className="cursor-default transition-colors duration-200 hover:text-gold">Blog</span>
              <span className="cursor-default transition-colors duration-200 hover:text-gold">Guia de Estudos</span>
              <span className="cursor-default transition-colors duration-200 hover:text-gold">Suporte</span>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Legal
            </p>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <span className="cursor-default transition-colors duration-200 hover:text-gold">Termos de Uso</span>
              <span className="cursor-default transition-colors duration-200 hover:text-gold">Privacidade</span>
              <span className="cursor-default transition-colors duration-200 hover:text-gold">Contato</span>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} MEDQUEST. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground/40">
            Feito para estudantes de medicina
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

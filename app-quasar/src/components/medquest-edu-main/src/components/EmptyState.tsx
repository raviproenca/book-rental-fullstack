import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Bookmark,
  Clock,
  Trophy,
  Zap,
} from "lucide-react";

/* ─── Generic Empty State ─── */
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaPath?: string;
  onCtaClick?: () => void;
}

export function EmptyState({ icon, title, description, ctaLabel, ctaPath, onCtaClick }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary"
      >
        {icon}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold text-foreground"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-2 max-w-sm text-sm text-muted-foreground"
      >
        {description}
      </motion.p>

      {ctaLabel && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCtaClick ?? (() => ctaPath && navigate(ctaPath))}
          className="mt-6 rounded-xl bg-gold px-6 py-2.5 text-sm font-semibold text-background transition-shadow hover:shadow-lg hover:shadow-[hsl(var(--gold)/0.25)]"
        >
          {ctaLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

/* ─── Preset Empty States ─── */
export function DashboardEmpty() {
  return (
    <EmptyState
      icon={<BookOpen className="h-10 w-10 text-muted-foreground/40" />}
      title="Comece sua primeira sessão de estudo!"
      description="Resolva questões para ver seu progresso, estatísticas e metas diárias aqui no dashboard."
      ctaLabel="Iniciar Prática"
      ctaPath="/praticar"
    />
  );
}

export function BookmarksEmpty() {
  return (
    <EmptyState
      icon={<Bookmark className="h-10 w-10 text-muted-foreground/40" />}
      title="Nenhuma questão salva ainda"
      description="Salve questões durante a prática clicando no ícone de bookmark para revisá-las depois."
      ctaLabel="Começar a Praticar"
      ctaPath="/praticar"
    />
  );
}

export function HistoryEmpty() {
  return (
    <EmptyState
      icon={<Clock className="h-10 w-10 text-muted-foreground/40" />}
      title="Nenhum simulado realizado"
      description="Faça seu primeiro simulado para acompanhar seu histórico de desempenho."
      ctaLabel="Iniciar Simulado"
      ctaPath="/simulados"
    />
  );
}

export function LeaderboardEmpty() {
  return (
    <EmptyState
      icon={<Trophy className="h-10 w-10 text-muted-foreground/40" />}
      title="Resolva questões para entrar no ranking!"
      description="Ganhe XP respondendo questões e competindo com outros estudantes."
      ctaLabel="Praticar Agora"
      ctaPath="/praticar"
    />
  );
}

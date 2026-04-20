import { useNavigate } from "react-router-dom";
import { Lock, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function PaywallModal({
  open,
  onClose,
  title = "Este recurso é exclusivo do plano Pro",
  description = "Faça upgrade para desbloquear todos os recursos e acelerar seus estudos.",
}: PaywallModalProps) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Card */}
      <div role="dialog" aria-modal="true" aria-label={title} className="relative z-10 mx-4 w-full max-w-md animate-scale-in rounded-2xl border border-border bg-card p-8 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
          <Lock className="h-8 w-8 text-gold" />
        </div>

        {/* Content */}
        <h2 className="text-center text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Highlights */}
        <div className="mt-6 space-y-2">
          {["Questões ilimitadas", "Simulados e revisão espaçada", "Analytics completos"].map((f) => (
            <div key={f} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="text-sm text-foreground">{f}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <button
          onClick={() => { onClose(); navigate("/pricing"); }}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover hover:shadow-gold/30"
        >
          Ver Planos
        </button>
        <button
          onClick={onClose}
          className="mt-2 flex h-10 w-full items-center justify-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Continuar no plano gratuito
        </button>
      </div>
    </div>
  );
}

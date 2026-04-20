import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MailCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { customToast } from "@/components/CustomToast";

type EmailConfirmationModalProps = {
  isOpen: boolean;
  email: string;
  onClose: () => void;
};

const RESEND_COOLDOWN = 60;

export function EmailConfirmationModal({ isOpen, email, onClose }: EmailConfirmationModalProps) {
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) {
      customToast.error({
        title: "Erro ao reenviar",
        description: error.message,
      });
      return;
    }
    customToast.success({
      title: "E-mail reenviado!",
      description: "Verifique sua caixa de entrada.",
    });
    setCooldown(RESEND_COOLDOWN);
  }, [cooldown, resending, email]);

  const handleConfirm = () => {
    onClose();
    navigate("/login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 px-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-confirmation-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-xl ring-1 ring-white/[0.06] sm:p-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15"
            >
              <MailCheck className="h-5 w-5 text-gold" aria-hidden />
            </motion.div>

            <h2
              id="email-confirmation-title"
              className="text-lg font-bold text-foreground"
            >
              Verifique seu e-mail
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Enviamos um link de confirmação para{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Acesse sua caixa de entrada e clique no link para ativar sua conta.
            </p>

            <p className="mt-2 text-xs text-muted-foreground/70">
              Não encontrou? Verifique a pasta de spam.
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-xl border border-border bg-secondary/40 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
              ) : cooldown > 0 ? (
                `Reenviar e-mail (${cooldown}s)`
              ) : (
                "Reenviar e-mail"
              )}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover"
            >
              Entendi, vou verificar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

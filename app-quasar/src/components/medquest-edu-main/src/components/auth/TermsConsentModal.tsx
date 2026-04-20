import { useState } from "react";
import { FileText, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { customToast } from "@/components/CustomToast";
import { recordTermsAcceptance } from "@/services/user";

type TermsConsentModalProps = {
  onAccepted: () => void | Promise<void>;
};

/**
 * Blocking layer after login: same path for email and Google OAuth.
 * Shown before onboarding / app (via ProtectedRoute).
 */
export function TermsConsentModal({ onAccepted }: TermsConsentModalProps) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await recordTermsAcceptance();
      await onAccepted();
    } catch (err) {
      customToast.error({
        title: "Não foi possível registar a aceitação",
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-consent-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-xl ring-1 ring-white/[0.06] sm:p-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15">
          <FileText className="h-5 w-5 text-gold" aria-hidden />
        </div>
        <h2 id="terms-consent-title" className="text-lg font-bold text-foreground">
          Termos e privacidade
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Para continuar a usar o MEDQUEST, confirme que leu e aceita os nossos{" "}
          <a href="#" className="font-medium text-gold underline-offset-2 hover:underline">
            Termos de Uso
          </a>{" "}
          e a{" "}
          <a href="#" className="font-medium text-gold underline-offset-2 hover:underline">
            Política de Privacidade
          </a>
          .
        </p>

        <button
          type="button"
          onClick={handleAccept}
          disabled={loading}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover disabled:opacity-50"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
          ) : (
            "Aceito e continuar"
          )}
        </button>

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}

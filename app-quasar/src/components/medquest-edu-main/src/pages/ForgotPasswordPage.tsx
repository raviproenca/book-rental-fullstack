import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { customToast } from "@/components/CustomToast";
import { AuthBackLink } from "@/components/auth/AuthBackLink";
import { AuthShell } from "@/components/auth/AuthShell";

const forgotContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Insira um email válido");
      return;
    }
    setError("");
    setLoading(true);
    const { error: authError } = await resetPassword(email);
    setLoading(false);
    if (authError) {
      customToast.error({ title: "Erro", description: authError.message });
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell maxWidthClass="max-w-md">
      <motion.div variants={forgotContainer} initial="hidden" animate="show">
        <motion.div variants={fade} className="flex flex-col">
          <AuthBackLink />
        </motion.div>
        <motion.div variants={fade}>
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 sm:justify-start">
            <Brain className="h-7 w-7 text-gold" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              MED<span className="text-gold">QUEST</span>
            </span>
          </Link>
        </motion.div>

        {sent ? (
          <motion.div variants={fade} className="text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Email enviado!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enviamos um link de recuperação para{" "}
              <span className="font-medium text-foreground">{email}</span>. Verifique sua caixa de entrada e spam.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center justify-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-hover"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={fade}>
            <h1 className="text-center text-xl font-bold text-foreground sm:text-left">Recuperar senha</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground sm:text-left">
              Informe seu email e enviaremos um link para redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className={`h-11 w-full rounded-xl border bg-secondary/60 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold/50 focus:ring-2 focus:ring-gold/15 ${
                      error ? "border-destructive" : "border-border"
                    }`}
                  />
                </div>
                {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-gold-hover hover:shadow-gold/25 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                ) : (
                  "Enviar link de recuperação"
                )}
              </button>
            </form>

            <Link
              to="/login"
              className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:justify-start"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </AuthShell>
  );
}

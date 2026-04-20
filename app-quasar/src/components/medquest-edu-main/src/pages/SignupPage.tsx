import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { motion } from "framer-motion";
import { customToast } from "@/components/CustomToast";
import { AuthBackLink } from "@/components/auth/AuthBackLink";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailConfirmationModal } from "@/components/auth/EmailConfirmationModal";
import { useAuth } from "@/contexts/AuthContext";

const onboardingHighlights = [
  "Cadastro rápido e gratuito",
  "Complete seu perfil no primeiro acesso",
  "Questões comentadas de graduação",
];

const formContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};
const formItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

type SignupFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

/** Same rules as `validate()` without mutating `errors` — used to gate the submit button. */
function isSignupFormReady(form: SignupFormState): boolean {
  if (!form.name.trim()) return false;
  if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return false;
  if (!form.password || form.password.length < 8) return false;
  if (form.password !== form.confirmPassword) return false;
  if (!form.terms) return false;
  return true;
}

function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  }, [password]);

  if (!password) return null;

  const colors = ["bg-destructive", "bg-warning", "bg-warning", "bg-success"];
  const labels = ["Fraca", "Razoável", "Boa", "Forte"];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength - 1] : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{labels[strength - 1] || "Muito fraca"}</p>
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  const canSubmit = useMemo(() => isSignupFormReady(form), [form]);

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.email.trim()) e.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido";
    if (!form.password) e.password = "Senha é obrigatória";
    else if (form.password.length < 8) e.password = "Mínimo 8 caracteres";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Senhas não conferem";
    if (!form.terms) e.terms = "Aceite os termos de uso";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp(form.email, form.password, {
      full_name: form.name,
    });
    setLoading(false);
    if (error) {
      const msg =
        error.message === "User already registered"
          ? "Este email já está cadastrado"
          : error.message;
      customToast.error({ title: "Erro no cadastro", description: msg });
      return;
    }
    customToast.success({
      title: "Conta criada com sucesso!",
      description: "Verifique seu e-mail para ativar a conta.",
    });
    setConfirmationEmail(form.email);
  };

  const handleGoogleSignup = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      customToast.error({ title: "Erro no cadastro", description: error.message });
    }
  };

  const inputClass = (field: string) =>
    `h-11 w-full rounded-xl border bg-secondary/60 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold/50 focus:ring-2 focus:ring-gold/15 ${
      errors[field] ? "border-destructive" : "border-border"
    }`;

  return (
    <AuthShell maxWidthClass="max-w-lg">
      <motion.div variants={formContainer} initial="hidden" animate="show">
        <motion.div variants={formItem} className="flex flex-col">
          <AuthBackLink />
        </motion.div>
        <motion.div variants={formItem}>
          <Link to="/" className="mb-6 flex items-center justify-center gap-2 sm:justify-start">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.04 }}
            >
              <Brain className="h-7 w-7 text-gold" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              MED<span className="text-gold">QUEST</span>
            </span>
          </Link>
        </motion.div>

        <motion.div variants={formItem}>
          <h1 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-left">
            Crie sua conta
          </h1>
          <p className="mt-1.5 text-center text-sm text-muted-foreground sm:text-left">
            Comece sua jornada de estudos
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground sm:text-sm">
            {onboardingHighlights.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold/70" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={formItem}>
          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5" autoComplete="off">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="signup-full-name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="João Pedro Silva"
                  className={inputClass("name")}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  name="signup-email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="seu@email.com"
                  className={inputClass("email")}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="signup-password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={`${inputClass("password")} !pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="signup-password-confirm"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  placeholder="Repita a senha"
                  className={`${inputClass("confirmPassword")} !pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => set("terms", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border bg-secondary accent-gold"
              />
              <span>
                Concordo com os{" "}
                <a href="#" className="text-gold hover:text-gold-hover">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="#" className="text-gold hover:text-gold-hover">
                  Política de Privacidade
                </a>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-gold-hover hover:shadow-gold/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
              ) : (
                "Criar Conta Gratuita"
              )}
            </button>
          </form>
        </motion.div>

        <motion.div variants={formItem}>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </motion.div>

        <motion.div variants={formItem}>
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/40 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar com Google
          </button>
        </motion.div>

        <motion.div variants={formItem}>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-gold transition-colors hover:text-gold-hover">
              Entrar
            </Link>
          </p>
        </motion.div>
      </motion.div>

      <EmailConfirmationModal
        isOpen={confirmationEmail !== ""}
        email={confirmationEmail}
        onClose={() => setConfirmationEmail("")}
      />
    </AuthShell>
  );
}

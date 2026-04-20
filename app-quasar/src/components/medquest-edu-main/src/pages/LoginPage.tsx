import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Brain, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { customToast } from "@/components/CustomToast";
import { AuthBackLink } from "@/components/auth/AuthBackLink";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuth } from "@/contexts/AuthContext";

const formContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};
const formItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  // Navigate reactively once auth state settles (fixes race condition)
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email inválido";
    if (!password) e.password = "Senha é obrigatória";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      const msg =
        error.message === "Invalid login credentials"
          ? "Email ou senha incorretos"
          : error.message;
      customToast.error({ title: "Erro no login", description: msg });
      return;
    }
    customToast.success({
      title: "Login realizado!",
      description: "Redirecionando para o dashboard...",
    });
    // Navigation is handled by the useEffect watching `user` state.
    // This avoids a race condition where navigate() fires before AuthContext updates.
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      customToast.error({ title: "Erro no login", description: error.message });
    }
  };

  return (
    <AuthShell maxWidthClass="max-w-md">
      <motion.div variants={formContainer} initial="hidden" animate="show">
        <motion.div variants={formItem} className="flex flex-col">
          <AuthBackLink />
        </motion.div>
        <motion.div variants={formItem}>
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 sm:justify-start">
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
            Bem-vindo de volta
          </h1>
          <p className="mt-1.5 text-center text-sm text-muted-foreground sm:text-left">
            Entre para continuar seus estudos
          </p>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground/90 sm:text-left">
            Banco de questões comentadas pensado para a graduação em medicina.
          </p>
        </motion.div>

        <motion.div variants={formItem}>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  name="login-email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={`h-11 w-full rounded-xl border bg-secondary/60 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold/50 focus:ring-2 focus:ring-gold/15 ${
                    errors.email ? "border-destructive" : "border-border"
                  }`}
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
                  name="login-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`h-11 w-full rounded-xl border bg-secondary/60 pl-10 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold/50 focus:ring-2 focus:ring-gold/15 ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-secondary accent-gold"
                />
                Lembrar de mim
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-gold transition-colors hover:text-gold-hover"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-gold-hover hover:shadow-gold/25 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </motion.div>

        <motion.div variants={formItem}>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </motion.div>

        <motion.div variants={formItem}>
          <button
            type="button"
            onClick={handleGoogleLogin}
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
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/signup" className="font-medium text-gold transition-colors hover:text-gold-hover">
              Criar conta
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AuthShell>
  );
}
